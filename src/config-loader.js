'use strict';

export function loadConfig() {
  const raw = new URLSearchParams(location.search).get('config');
  if (!raw) return null;
  try {
    return JSON.parse(atob(raw));
  } catch (e) {
    console.warn('[form] Invalid config param — falling back to default flow:', e);
    return null;
  }
}
