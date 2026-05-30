import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Waves, LogOut, Radio } from 'lucide-react';
import { INSTRUCTORS } from '../data/mockData';
import * as api from '../services/api';

const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function TeacherMobile({ onExit }) {
  const [instructorId, setInstructorId] = useState('');
  const [pin, setPin] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [log, setLog] = useState([]);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const myClasses = classes.filter((c) => c.instructorId === teacher?.id);

  const pushLog = (msg, type = 'info') => {
    setLog((prev) => [{ msg, type, at: new Date().toLocaleTimeString('pt-BR') }, ...prev].slice(0, 12));
  };

  const loadTeacherData = useCallback(async () => {
    try {
      const data = await api.teacherFetchClasses();
      setClasses(data.classes);
      setStudents(data.students);
      const active = data.liveSessions?.find(
        (s) => s.status === 'active' && s.instructorId === teacher?.id
      );
      if (active) {
        setClassId(String(active.classId));
        setSessionActive(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [teacher?.id]);

  useEffect(() => {
    if (teacher) loadTeacherData();
  }, [teacher, loadTeacherData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { instructor } = await api.teacherLogin(Number(instructorId), pin);
      setTeacher(instructor);
      pushLog(`Olá, ${instructor.name}!`, 'ok');
    } catch (err) {
      setError(err.message);
    }
  };

  const startSession = async () => {
    if (!classId) return;
    try {
      await api.teacherStartSession(Number(classId));
      setSessionActive(true);
      pushLog('Aula ao vivo iniciada.', 'ok');
      loadTeacherData();
    } catch (err) {
      setError(err.message);
    }
  };

  const processVoice = useCallback(
    async (text) => {
      if (!text?.trim() || !classId) return;
      setTranscript(text);
      try {
        const res = await api.teacherVoiceCommand(text, Number(classId));
        pushLog(res.message, res.action === 'error' ? 'err' : 'ok');
        if (/encerrar|finalizar|terminar/.test(text.toLowerCase())) setSessionActive(false);
        if (/iniciar|começar|abrir/.test(text.toLowerCase())) setSessionActive(true);
        loadTeacherData();
      } catch (err) {
        pushLog(err.message, 'err');
      }
    },
    [classId, loadTeacherData]
  );

  const toggleMic = () => {
    if (!SpeechRecognition) {
      setError('Use Chrome no celular para comandos de voz.');
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = false;
    recognitionRef.current = rec;
    rec.onresult = (event) => processVoice(event.results[0][0].transcript);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
    pushLog('Ouvindo…', 'info');
  };

  if (!teacher) {
    return (
      <div className="login-screen">
        <div className="glass-panel login-card">
          <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>
            H2O Control
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Acesso do professor
          </p>
          <form onSubmit={handleLogin}>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Professor(a)
            </label>
            <select
              className="custom-select"
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              required
              style={{ marginTop: '0.35rem' }}
            >
              <option value="">Selecione…</option>
              {INSTRUCTORS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
            <label style={{ fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginTop: '0.75rem' }}>
              PIN
            </label>
            <input
              type="password"
              className="custom-input"
              placeholder="1234"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              style={{ marginTop: '0.35rem' }}
            />
            {error && (
              <p style={{ color: '#ff3366', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Entrar
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: '0.5rem', width: '100%' }}
              onClick={onExit}
            >
              Painel admin
            </button>
          </form>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '1rem' }}>
            PIN demo: 1234
          </p>
        </div>
      </div>
    );
  }

  const roster = students.filter((s) => {
    const cls = classes.find((c) => c.id === Number(classId));
    return cls?.students?.includes(s.id);
  });

  return (
    <div className="teacher-app">
      <header className="teacher-header">
        <div>
          <h1>{teacher.name}</h1>
          <span className={sessionActive ? 'live-pill live-on' : 'live-pill'}>
            <Radio size={12} /> {sessionActive ? 'AO VIVO' : 'Pronta'}
          </span>
        </div>
        <button
          type="button"
          className="teacher-icon-btn"
          onClick={() => {
            api.setTeacherToken(null);
            setTeacher(null);
            onExit();
          }}
        >
          <LogOut size={20} />
        </button>
      </header>

      <div className="glass-panel teacher-card">
        <label>Turma</label>
        <select className="custom-select" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Escolha…</option>
          {(myClasses.length ? myClasses : classes).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.time}
            </option>
          ))}
        </select>
        {!sessionActive ? (
          <button type="button" className="btn-primary teacher-btn" onClick={startSession} disabled={!classId}>
            Iniciar aula ao vivo
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary teacher-btn"
            onClick={async () => {
              await api.teacherEndSession();
              setSessionActive(false);
              pushLog('Aula encerrada.', 'ok');
            }}
          >
            Encerrar aula
          </button>
        )}
      </div>

      <div className="glass-panel teacher-card teacher-voice">
        <h3>Comando de voz</h3>
        <p className="teacher-hint">
          &quot;presente Guilherme&quot; · &quot;falta Pedro&quot; · &quot;evolução Mariana crawl 25m&quot;
        </p>
        <button
          type="button"
          className={`teacher-mic ${listening ? 'listening' : ''}`}
          onClick={toggleMic}
          disabled={!classId}
        >
          {listening ? <MicOff size={32} /> : <Mic size={32} />}
          <span>{listening ? 'Parar' : 'Falar'}</span>
        </button>
        {transcript && <p className="teacher-transcript">&quot;{transcript}&quot;</p>}
      </div>

      <ul className="teacher-roster glass-panel teacher-card">
        {roster.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>

      <div className="teacher-log">
        {log.map((l, i) => (
          <div key={i} className={`teacher-log-item ${l.type}`}>
            <time>{l.at}</time> {l.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
