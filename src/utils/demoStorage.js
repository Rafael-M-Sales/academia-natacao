const KEY = 'h2o_academy_demo';

export function loadDemoState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDemoState(payload) {
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded — ignore */
  }
}
