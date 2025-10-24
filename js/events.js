// Tiny pub/sub to decouple modules (optional for future refactor)
const listeners = {};
export function on(evt, fn){ (listeners[evt] ||= []).push(fn); }
export function off(evt, fn){ const a = listeners[evt]; if(!a) return; const i=a.indexOf(fn); if(i>-1) a.splice(i,1); }
export function emit(evt, payload){ (listeners[evt]||[]).forEach(fn => { try{ fn(payload); } catch(e){ console.error(e); } }); }
