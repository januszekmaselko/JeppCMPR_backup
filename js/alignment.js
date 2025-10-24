// Alignment logic using legacy globals + frame detection module
import { detectFrameMaximum } from './frame-detection.js';

export async function calculateFrameAlignment(pairIndex) {
  const pair = (window.pdfPairs || [])[pairIndex];
  if (!pair) return;
  try {
    const detectionScale = 2.0;
    const renderScale = (typeof window.getRenderScale === 'function')
      ? window.getRenderScale()
      : 3.0;

    // Render first page of both PDFs at detection scale
    const oldCanvas = document.createElement('canvas');
    const oldPage = await pair.oldDoc.getPage(1);
    const oldViewport = oldPage.getViewport({ scale: detectionScale });
    oldCanvas.width = oldViewport.width;
    oldCanvas.height = oldViewport.height;
    const oldCtx = oldCanvas.getContext('2d');
    await oldPage.render({ canvasContext: oldCtx, viewport: oldViewport }).promise;

    const newCanvas = document.createElement('canvas');
    const newPage = await pair.newDoc.getPage(1);
    const newViewport = newPage.getViewport({ scale: detectionScale });
    newCanvas.width = newViewport.width;
    newCanvas.height = newViewport.height;
    const newCtx = newCanvas.getContext('2d');
    await newPage.render({ canvasContext: newCtx, viewport: newViewport }).promise;

    // Detect frames
    const oldFrame = detectFrameMaximum(oldCtx, oldCanvas.width, oldCanvas.height);
    const newFrame = detectFrameMaximum(newCtx, newCanvas.width, newCanvas.height);

    const ratio = renderScale / detectionScale;

    const oldF = { x: oldFrame.x * ratio, y: oldFrame.y * ratio, w: oldFrame.width * ratio, h: oldFrame.height * ratio };
    const newF = { x: newFrame.x * ratio, y: newFrame.y * ratio, w: newFrame.width * ratio, h: newFrame.height * ratio };

    const scaleX = newF.w / oldF.w;
    const scaleY = newF.h / oldF.h;
    const offsetX = newF.x - oldF.x * scaleX;
    const offsetY = newF.y - oldF.y * scaleY;

    const store = window.alignmentOffsets || (window.alignmentOffsets = new Map());
    store.set(pairIndex, {
      offsetX, offsetY, scaleX, scaleY,
      oldFrame: oldF, newFrame: newF, renderScale
    });

    console.log('[alignment] OK scaleX=%s scaleY=%s offX=%s offY=%s',
      scaleX.toFixed(4), scaleY.toFixed(4), offsetX.toFixed(2), offsetY.toFixed(2));

  } catch (err) {
    console.error('Frame alignment error for pair %s:', pairIndex, err);
    const store = window.alignmentOffsets || (window.alignmentOffsets = new Map());
    store.set(pairIndex, { offsetX:0, offsetY:0, scaleX:1, scaleY:1 });
  }
}
