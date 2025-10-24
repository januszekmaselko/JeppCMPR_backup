import { initPdfWorker } from './pdf-manager.js';
import { calculateFrameAlignment } from './alignment.js';
import { detectFrameMaximum } from './frame-detection.js';
import { levenshteinDistance, fuzzyMatch } from './pair-matcher.js';
import { generateJADCode, updateJADCode, copyJADCode, getCELL, getOFFICE, getCYCLE, getENT } from './jad-generator.js';

function loadLegacy() {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = './js/app.legacy.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function boot(){
  try {
    await loadLegacy();
    initPdfWorker();

    // Expose module funcs to legacy (override legacy duplicates safely)
    window.levenshteinDistance = levenshteinDistance;
    window.fuzzyMatch = fuzzyMatch;

    // Alignment
    window.calculateFrameAlignment = calculateFrameAlignment;
    window.detectFrameMaximum = detectFrameMaximum;

    // JAD helpers
    window.getCELL = getCELL;
    window.getOFFICE = getOFFICE;
    window.getCYCLE = getCYCLE;
    window.getENT = getENT;

    // For legacy UI calls
    window.generateJADCode = () => generateJADCode(
      () => (window.pdfPairs && window.pdfPairs[window.currentPairIndex]) || null,
      () => {
        const assetSelect = document.getElementById('jadAsset');
        return assetSelect ? assetSelect.value : 'DET';
      }
    );
    window.updateJADCode = () => updateJADCode(
      () => (window.pdfPairs && window.pdfPairs[window.currentPairIndex]) || null,
      () => {
        const assetSelect = document.getElementById('jadAsset');
        return assetSelect ? assetSelect.value : 'DET';
      }
    );
    window.copyJADCode = () => copyJADCode(window.generateJADCode);

    console.log('[modular] legacy loaded; module functions wired to window.');
  } catch (e) {
    console.error('Failed to load legacy script', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
