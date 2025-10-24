// Configuration & constants placeholder. Safe to extend.
export const CONFIG = {
  PDF_WORKER: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  RENDER_SCALES: { low: 1.5, standard: 3.0, high: 4.5 }
};
export function getRenderScale(quality) {
  const m = CONFIG.RENDER_SCALES;
  return m[quality] || m.standard;
}
