// Centralized runtime state placeholder. For now, we proxy to legacy globals if present.
export const State = (typeof window !== 'undefined' && window) ? window : {};
// You can progressively move your runtime variables here and reference them across modules.
