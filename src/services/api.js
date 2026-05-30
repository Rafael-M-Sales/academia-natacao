import { API_URL } from '../config';
const API_BASE = API_URL;


const TOKEN_KEY = 'h2o_auth_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Erro na requisição');
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe() {
  return request('/api/auth/me');
}

export async function fetchAcademyData() {
  return request('/api/academy');
}

export async function saveAcademyData(payload) {
  return request('/api/academy', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function importAlunosCsv(csv, replace = false) {
  return request('/api/import/alunos-csv', {
    method: 'POST',
    body: JSON.stringify({ csv, replace }),
  });
}

export async function fetchPoolMap({ time, day } = {}) {
  const params = new URLSearchParams();
  if (time) params.set('time', time);
  if (day) params.set('day', day);
  const q = params.toString();
  return request(`/api/import/pool-map${q ? `?${q}` : ''}`);
}

export async function downloadReport(format) {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}/api/reports/${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Falha ao gerar relatório');
  return res.blob();
}

const TEACHER_TOKEN_KEY = 'h2o_teacher_token';

export function getTeacherToken() {
  return sessionStorage.getItem(TEACHER_TOKEN_KEY);
}

export function setTeacherToken(token) {
  if (token) sessionStorage.setItem(TEACHER_TOKEN_KEY, token);
  else sessionStorage.removeItem(TEACHER_TOKEN_KEY);
}

async function teacherRequest(path, options = {}) {
  const token = getTeacherToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Erro na requisição');
  return data;
}

export async function teacherLogin(instructorId, pin) {
  return fetch(`${API_BASE}/api/live/teacher-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instructorId, pin }),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setTeacherToken(data.token);
    return data;
  });
}

export async function teacherFetchClasses() {
  return teacherRequest('/api/live/my-classes');
}

export async function teacherStartSession(classId) {
  return teacherRequest('/api/live/session/start', {
    method: 'POST',
    body: JSON.stringify({ classId }),
  });
}

export async function teacherEndSession() {
  return teacherRequest('/api/live/session/end', { method: 'POST', body: '{}' });
}

export async function teacherVoiceCommand(transcript, classId) {
  return teacherRequest('/api/live/voice', {
    method: 'POST',
    body: JSON.stringify({ transcript, classId }),
  });
}

export function subscribeLiveUpdates(onData) {
  const es = new EventSource(`${API_BASE}/api/live/stream`);
  es.onmessage = (ev) => {
    try {
      onData(JSON.parse(ev.data));
    } catch {
      /* ignore */
    }
  };
  es.onerror = () => {
    /* EventSource auto-reconnects */
  };
  return () => es.close();
}

export function nextStudentId(students) {
  if (!students?.length) return 1;
  return Math.max(...students.map((s) => Number(s.id) || 0)) + 1;
}

export async function postPayment(endpoint, body, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/payments/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    ...options,
  });
  const isBlob = options.responseType === 'blob';
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Erro no pagamento');
  }
  return isBlob ? res.blob() : res.json();
}
