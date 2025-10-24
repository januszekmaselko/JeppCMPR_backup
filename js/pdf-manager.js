// pdf.js helpers (future). Currently legacy handles everything; keep here for refactor.
import { CONFIG } from './config.js';
export function initPdfWorker(){
  if (typeof pdfjsLib !== 'undefined' && pdfjsLib?.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = CONFIG.PDF_WORKER;
  }
}
