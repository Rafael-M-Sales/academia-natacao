import { Radio, UserCheck, BookOpen } from 'lucide-react';
import { INSTRUCTORS } from '../data/mockData';

export default function LiveClassMonitor({ liveSessions, pedagogyNotes, presenceHistory, employees }) {
  const active = liveSessions?.filter((s) => s.status === 'active') || [];
  const recentNotes = pedagogyNotes?.slice(0, 5) || [];
  const today = new Date().toISOString().split('T')[0];
  const todayPresence = presenceHistory?.filter((p) => p.date === today) || [];

  return (
    <div className="glass-panel live-monitor">
      <div className="live-monitor-head">
        <Radio size={20} color="#00f5d4" />
        <h3>Aulas ao vivo agora</h3>
        {active.length > 0 && <span className="live-pill live-on">● {active.length} ativa(s)</span>}
      </div>

      {active.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Nenhuma aula iniciada. Professores entram em{' '}
          <strong style={{ color: '#00bbf9' }}>/professor</strong> no celular.
        </p>
      ) : (
        <div className="live-session-grid">
          {active.map((s) => {
            const inst = employees?.find((e) => e.id === s.instructorId);
            return (
              <div key={s.id} className="live-session-card">
                <strong>{s.className}</strong>
                <span>{s.instructorName || inst?.name}</span>
                <span className="live-meta">
                  <UserCheck size={14} /> {s.presentCount ?? 0} presentes hoje
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="live-notes-block">
        <BookOpen size={16} color="#9b5de5" />
        <span>Evoluções registradas hoje ({recentNotes.length} recentes)</span>
      </div>
      <ul className="live-notes-list">
        {recentNotes.length === 0 && (
          <li style={{ color: '#64748b' }}>Aguardando professor registrar por voz…</li>
        )}
        {recentNotes.map((n) => (
          <li key={n.id}>
            <strong>{n.studentName}</strong> — {n.note}
            <small>{n.instructorName}</small>
          </li>
        ))}
      </ul>

      <p className="live-meta" style={{ marginTop: '0.75rem' }}>
        Chamadas hoje: {todayPresence.length} registros
      </p>
    </div>
  );
}
