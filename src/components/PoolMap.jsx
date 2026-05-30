import { useEffect, useState } from 'react';
import { Waves, RefreshCw } from 'lucide-react';
import { fetchPoolMap } from '../services/api';
import { SWIMMING_LANES } from '../data/mockData';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
const TIMES = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
];

export default function PoolMap({ students, classes, apiConnected }) {
  const [time, setTime] = useState('09:00');
  const [day, setDay] = useState('Seg');
  const [lanes, setLanes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLocal = () => {
    const adult = [1, 2, 5, 6];
    const child = [3, 4];
    const filtered = classes.filter(
      (c) => c.time === time && (c.days || []).includes(day)
    );
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const result = SWIMMING_LANES.map((l) => ({ ...l, students: [] }));

    for (const cls of filtered) {
      const pool = cls.modality === 'Infantil' ? child : adult;
      for (const sid of cls.students || []) {
        const s = students.find((x) => x.id === sid);
        if (!s || s.status !== 'Ativo') continue;
        const laneId = pool.sort((a, b) => counts[a] - counts[b])[0];
        counts[laneId] += 1;
        const lane = result.find((r) => r.id === laneId);
        lane?.students.push({ id: s.id, name: s.name, className: cls.name });
      }
    }
    setLanes(result);
  };

  const loadFromApi = async () => {
    setLoading(true);
    try {
      const data = await fetchPoolMap({ time, day });
      setLanes(data.lanes);
    } catch {
      loadLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiConnected) loadFromApi();
    else loadLocal();
  }, [time, day, students, classes, apiConnected]);

  return (
    <div style={styles.wrap}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Mapa da Piscina</h2>
          <p className="page-subtitle">
            6 raias — 1, 2, 5 e 6 adultos; 3 e 4 infantis. Alocação automática por turma e horário.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={apiConnected ? loadFromApi : loadLocal} disabled={loading}>
          <RefreshCw size={16} style={{ marginRight: 6 }} />
          Atualizar
        </button>
      </div>

      <div style={styles.filters} className="glass-panel">
        <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
          Horário
          <select className="custom-select" value={time} onChange={(e) => setTime(e.target.value)}>
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
          Dia
          <select className="custom-select" value={day} onChange={(e) => setDay(e.target.value)}>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.poolGrid}>
        {lanes.map((lane) => (
          <div
            key={lane.id}
            style={{
              ...styles.laneCard,
              borderColor: lane.ageGroup === 'infantil' ? 'rgba(0, 187, 249, 0.4)' : 'rgba(0, 245, 212, 0.35)',
            }}
            className="glass-panel"
          >
            <div style={styles.laneHeader}>
              <Waves size={18} color={lane.ageGroup === 'infantil' ? '#00bbf9' : '#00f5d4'} />
              <span style={styles.laneTitle}>{lane.name}</span>
              <span style={styles.laneBadge}>
                {lane.ageGroup === 'infantil' ? 'Infantil' : 'Adulto'}
              </span>
            </div>
            <p style={styles.laneCount}>{lane.students?.length || 0} aluno(s)</p>
            <ul style={styles.studentList}>
              {(lane.students || []).map((s) => (
                <li key={s.id} style={styles.studentItem}>
                  <strong>{s.name}</strong>
                  {s.className && <span style={styles.classHint}>{s.className}</span>}
                </li>
              ))}
              {!lane.students?.length && (
                <li style={styles.empty}>Sem alunos neste horário</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  filters: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1rem 1.25rem',
    flexWrap: 'wrap',
  },
  poolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  laneCard: {
    padding: '1rem',
    borderRadius: '16px',
    border: '1px solid',
  },
  laneHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  laneTitle: { fontWeight: 700, color: '#f8fafc', flex: 1 },
  laneBadge: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.06)',
    color: '#94a3b8',
  },
  laneCount: { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' },
  studentList: { listStyle: 'none', margin: 0, padding: 0 },
  studentItem: {
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
  },
  classHint: { fontSize: '0.75rem', color: '#64748b' },
  empty: { color: '#64748b', fontSize: '0.85rem' },
};
