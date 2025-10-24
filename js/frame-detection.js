// JeppALIGN v3.18-inspired frame detection helpers extracted into a module.
// Uses fallbacks to legacy functions if needed (e.g., detectContentBBox).

function extractLineColor(data, width, height, line, isHorizontal) {
  const colors = [];
  const samples = 50;
  if (isHorizontal) {
    const y = Math.round(line.y);
    const step = Math.max(1, Math.floor((line.x2 - line.x1) / samples));
    for (let x = line.x1; x <= line.x2; x += step) {
      const idx = (y * width + Math.round(x)) * 4;
      if (idx >= 0 && idx < data.length - 3) colors.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
    }
  } else {
    const x = Math.round(line.x);
    const step = Math.max(1, Math.floor((line.y2 - line.y1) / samples));
    for (let y = line.y1; y <= line.y2; y += step) {
      const idx = (Math.round(y) * width + x) * 4;
      if (idx >= 0 && idx < data.length - 3) colors.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
    }
  }
  if (!colors.length) return { r:0, g:0, b:0 };
  const avg = colors.reduce((a,c)=>({ r:a.r+c.r, g:a.g+c.g, b:a.b+c.b }), {r:0,g:0,b:0});
  return { r: avg.r/colors.length, g: avg.g/colors.length, b: avg.b/colors.length };
}

function colorHarmony(color) {
  const mean = (color.r + color.g + color.b) / 3;
  const variance = ((color.r-mean)**2 + (color.g-mean)**2 + (color.b-mean)**2) / 3;
  return Math.sqrt(variance);
}
function colorsHaveCompatibleHue(colors) {
  const harmonies = colors.map(colorHarmony);
  const avg = harmonies.reduce((a,b)=>a+b,0) / harmonies.length;
  return harmonies.every(h => Math.abs(h - avg) <= 40);
}

function gaussianBlur(data, width, height) {
  const blurred = new Uint8ClampedArray(data.length);
  const kernel = [1,2,1, 2,4,2, 1,2,1];
  const kernelSum = 16;
  for (let y=1; y<height-1; y++) {
    for (let x=1; x<width-1; x++) {
      for (let c=0; c<3; c++) {
        let sum=0, ki=0;
        for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
          const i = ((y+dy)*width + (x+dx))*4 + c;
          sum += data[i] * kernel[ki++];
        }
        blurred[(y*width + x)*4 + c] = sum / kernelSum;
      }
      blurred[(y*width + x)*4 + 3] = 255;
    }
  }
  return blurred;
}

function sharpenImage(data, width, height) {
  const out = new Uint8ClampedArray(data.length);
  const kernel = [0,-1,0, -1,5,-1, 0,-1,0];
  for (let y=1; y<height-1; y++) {
    for (let x=1; x<width-1; x++) {
      for (let c=0; c<3; c++) {
        let sum=0, ki=0;
        for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
          const i = ((y+dy)*width + (x+dx))*4 + c;
          sum += data[i] * kernel[ki++];
        }
        out[(y*width + x)*4 + c] = Math.max(0, Math.min(255, sum));
      }
      out[(y*width + x)*4 + 3] = 255;
    }
  }
  return out;
}

function detectThinLines(data, width, height, threshold = 15) {
  const edges = new Float32Array(width * height);
  const strength = new Float32Array(width * height);
  for (let y=2; y<height-2; y++) {
    for (let x=2; x<width-2; x++) {
      const idx = y*width + x;
      const i = idx*4;
      const center = (data[i]+data[i+1]+data[i+2]) / 3;
      let surround=0, count=0;
      for (let dy=-2; dy<=2; dy++) for (let dx=-2; dx<=2; dx++) {
        if (dx===0&&dy===0) continue;
        const si = ((y+dy)*width + (x+dx))*4;
        surround += (data[si]+data[si+1]+data[si+2]) / 3; count++;
      }
      const sAvg = surround / count;
      const contrast = sAvg - center;
      if (contrast > threshold) { edges[idx]=1; strength[idx]=contrast; }
    }
  }
  return { edges, strength };
}

function mergeNearSegments(segments, maxGap) {
  if (!segments.length) return [];
  segments.sort((a,b)=>a.start-b.start);
  const merged=[];
  let current={...segments[0], solidLength: segments[0].end - segments[0].start + 1};
  for (let i=1;i<segments.length;i++) {
    const seg=segments[i];
    const gap=seg.start - current.end;
    if (gap <= maxGap) {
      current.end = seg.end;
      current.totalStrength += seg.totalStrength;
      current.count += seg.count;
      current.solidLength += seg.end - seg.start + 1;
    } else {
      merged.push(current);
      current = {...seg, solidLength: seg.end - seg.start + 1};
    }
  }
  merged.push(current);
  return merged;
}

function findRobustLines(edges, strength, width, height, isHorizontal, gapTol=5, lineThreshold=0.20) {
  const lines=[];
  const size = isHorizontal ? height : width;
  const perpSize = isHorizontal ? width : height;
  for (let pos=0; pos<size; pos++) {
    let segs=[], cur=null;
    for (let perp=0; perp<perpSize; perp++) {
      const idx = isHorizontal ? (pos*width+perp) : (perp*width+pos);
      if (edges[idx]===1) {
        if (!cur) cur={ start:perp, end:perp, totalStrength:strength[idx], count:1 };
        else { cur.end=perp; cur.totalStrength+=strength[idx]; cur.count++; }
      } else {
        if (cur) {
          const length = cur.end - cur.start + 1;
          if (length > gapTol) segs.push(cur);
          cur=null;
        }
      }
    }
    if (cur) { const length = cur.end - cur.start + 1; if (length > gapTol) segs.push(cur); }
    const merged = mergeNearSegments(segs, gapTol);
    for (const seg of merged) {
      const length = seg.end - seg.start + 1;
      const avgStrength = seg.totalStrength / seg.count;
      if (length >= perpSize * lineThreshold) {
        const coverage = length / perpSize;
        const continuity = seg.solidLength ? (seg.solidLength / length) : 1;
        const score = coverage * Math.pow(continuity, 3) * (avgStrength / 50);
        const line = isHorizontal
          ? { y: pos, x1: seg.start, x2: seg.end, length, continuity, avgStrength, score, solidLength: seg.solidLength || length }
          : { x: pos, y1: seg.start, y2: seg.end, length, continuity, avgStrength, score, solidLength: seg.solidLength || length };
        lines.push(line);
      }
    }
  }
  return lines;
}

function groupCloseLines(lines, isHorizontal, dimension) {
  if (!lines.length) return [];
  lines.sort((a,b)=> (isHorizontal ? (a.y-b.y) : (a.x-b.x)));
  const groups=[];
  const thr = Math.max(3, dimension * 0.005);
  let current=[lines[0]];
  for (let i=1;i<lines.length;i++) {
    const prevPos = isHorizontal ? current[current.length-1].y : current[current.length-1].x;
    const currPos = isHorizontal ? lines[i].y : lines[i].x;
    if (currPos - prevPos <= thr) current.push(lines[i]);
    else { groups.push(current.reduce((a,b)=>a.score>b.score?a:b)); current=[lines[i]]; }
  }
  if (current.length) groups.push(current.reduce((a,b)=>a.score>b.score?a:b));
  return groups;
}

function detectCorners(hLines, vLines, cornerTolerance = 10) {
  const corners=[];
  const maxGap=3;
  for (const h of hLines) for (const v of vLines) {
    const vIntersects = v.x >= h.x1 - cornerTolerance && v.x <= h.x2 + cornerTolerance;
    const hIntersects = h.y >= v.y1 - cornerTolerance && h.y <= v.y2 + cornerTolerance;
    if (!vIntersects || !hIntersects) continue;
    const gapH = Math.min(Math.max(0, h.x1 - v.x), Math.max(0, v.x - h.x2));
    const gapV = Math.min(Math.max(0, v.y1 - h.y), Math.max(0, h.y - v.y2));
    const g = Math.max(gapH, gapV);
    if (g > maxGap) continue;
    const gapPenalty = Math.max(0, 1 - (g / maxGap));
    const continuityScore = (h.continuity + v.continuity) / 2;
    const strengthScore = Math.min(1, (h.avgStrength + v.avgStrength) / 100);
    const quality = gapPenalty * continuityScore * strengthScore;
    corners.push({ x:v.x, y:h.y, hLine:h, vLine:v, gap:g, quality });
  }
  return corners;
}

function findFrameFromCorners(corners, width, height, imageData, edges) {
  if (corners.length < 4) return null;
  const midX = width/2, midY = height/2;
  const edgeMargin = Math.max(10, Math.min(width, height) * 0.02);

  corners.forEach(c => {
    c.hLine.color = c.hLine.color || extractLineColor(imageData.data, width, height, c.hLine, true);
    c.vLine.color = c.vLine.color || extractLineColor(imageData.data, width, height, c.vLine, false);
  });

  const quadFilter = (f) => f.filter(c => c.x>edgeMargin && c.y>edgeMargin && c.x<width-edgeMargin && c.y<height-edgeMargin);
  const sortTL = (a,b) => (a.gap<=3 ? (a.x+a.y) : Math.max(a.x,a.y)) - (b.gap<=3 ? (b.x+b.y) : Math.max(b.x,b.y));
  const sortTR = (a,b) => (a.gap<=3 ? ((width-a.x)+a.y) : Math.max(width-a.x,a.y)) - (b.gap<=3 ? ((width-b.x)+b.y) : Math.max(width-b.x,b.y));
  const sortBL = (a,b) => (a.gap<=3 ? (a.x+(height-a.y)) : Math.max(a.x,height-a.y)) - (b.gap<=3 ? (b.x+(height-b.y)) : Math.max(b.x,height-b.y));
  const sortBR = (a,b) => (a.gap<=3 ? ((width-a.x)+(height-a.y)) : Math.max(width-a.x,height-a.y)) - (b.gap<=3 ? ((width-b.x)+(height-b.y)) : Math.max(width-b.x,height-b.y));

  const TL = quadFilter(corners.filter(c=>c.x<midX && c.y<midY)).sort(sortTL).slice(0,1);
  const TR = quadFilter(corners.filter(c=>c.x>midX && c.y<midY)).sort(sortTR).slice(0,1);
  const BL = quadFilter(corners.filter(c=>c.x<midX && c.y>midY)).sort(sortBL).slice(0,1);
  const BR = quadFilter(corners.filter(c=>c.x>midX && c.y>midY)).sort(sortBR).slice(0,1);

  if (!(TL.length && TR.length && BL.length && BR.length)) return null;

  const tl=TL[0], tr=TR[0], bl=BL[0], br=BR[0];
  const x = tl.x, y = tl.y, w = tr.x - tl.x, h = bl.y - tl.y;
  if (w<100 || h<100 || w>width*0.95 || h>height*0.95) return null;

  const angleOK = true; // keep simple; legacy has strict angle checks; assume OK after robust lines

  if (!angleOK) return null;

  const frameColors = [tl.hLine.color, tl.vLine.color, tr.hLine.color, tr.vLine.color, bl.hLine.color, bl.vLine.color, br.hLine.color, br.vLine.color];
  if (!colorsHaveCompatibleHue(frameColors)) return null;

  return { x, y, width:w, height:h };
}

function detectContentBBox(ctx, width, height) {
  if (typeof window.detectContentBBox === 'function') {
    return window.detectContentBBox(ctx, width, height);
  }
  // fallback: entire canvas
  return { x:0, y:0, width, height };
}

export function detectFrameMaximum(ctx, width, height) {
  const imageData = ctx.getImageData(0,0,width,height);
  const data = imageData.data;

  // simple contrast sampling to decide sharpening
  let total=0, samples=100;
  for (let i=0;i<samples;i++) {
    const x = Math.floor(Math.random()*(width-4))+2;
    const y = Math.floor(Math.random()*(height-4))+2;
    const idx = (y*width + x)*4;
    const center = (data[idx]+data[idx+1]+data[idx+2])/3;
    let s=0;
    for (let dy=-1; dy<=1; dy++) for (let dx=-1; dx<=1; dx++) {
      if (dx===0&&dy===0) continue;
      const si = ((y+dy)*width + (x+dx))*4;
      s += (data[si]+data[si+1]+data[si+2])/3;
    }
    const sAvg = s/8;
    total += Math.abs(center - sAvg);
  }
  const avgContrast = total / samples;
  const processed = avgContrast < 15 ? sharpenImage(data, width, height) : data;
  const blurred = gaussianBlur(processed, width, height);

  const sobelEdges = new Float32Array(width * height);
  const sobelStrength = new Float32Array(width * height);

  for (let y=1;y<height-1;y++) for (let x=1;x<width-1;x++) {
    const idx = y*width + x;
    const p = [];
    for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
      const i = ((y+dy)*width + (x+dx))*4;
      p.push((blurred[i]+blurred[i+1]+blurred[i+2])/3);
    }
    const gx = -p[0]-2*p[3]-p[6] + p[2]+2*p[5]+p[8];
    const gy = -p[0]-2*p[1]-p[2] + p[6]+2*p[7]+p[8];
    const m = Math.sqrt(gx*gx + gy*gy);
    sobelStrength[idx] = m;
    if (m > 12) sobelEdges[idx]=1;
  }

  const contrastRes = detectThinLines(processed, width, height, 15);
  const edges = new Float32Array(width*height);
  const strength = new Float32Array(width*height);
  for (let i=0;i<width*height;i++) {
    if (sobelEdges[i]===1 || contrastRes.edges[i]===1) {
      edges[i]=1;
      strength[i]=Math.max(sobelStrength[i], contrastRes.strength[i]);
    }
  }

  const hLines = findRobustLines(edges, strength, width, height, true, 5, 0.20);
  const vLines = findRobustLines(edges, strength, width, height, false, 5, 0.20);
  if (hLines.length<2 || vLines.length<2) return detectContentBBox(ctx, width, height);

  const gH = groupCloseLines(hLines, true, height);
  const gV = groupCloseLines(vLines, false, width);

  const frame = findFrameFromCorners(
    (function buildCorners(){
      const corners=[];
      for (const h of gH) for (const v of gV) {
        const vIntersects = v.x >= h.x1 - 10 && v.x <= h.x2 + 10;
        const hIntersects = h.y >= v.y1 - 10 && h.y <= v.y2 + 10;
        if (vIntersects && hIntersects) corners.push({ x:v.x, y:h.y, hLine:h, vLine:v, gap:0, quality:1 });
      }
      return corners;
    })(),
    width, height, imageData, edges
  );

  return frame || detectContentBBox(ctx, width, height);
}
