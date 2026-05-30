const styles = {
  rowGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' },
  panel: { padding: '1.75rem' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  panelTitle: { fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' },
  panelSubtitle: { fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' },
  scrollList: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' },
  attendanceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.75rem', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.02)', borderRadius: '10px' },
  attendanceUser: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  miniAvatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 187, 249, 0.15)', color: '#00bbf9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' },
  studentNameText: { fontWeight: '600', color: '#ffffff', fontSize: '0.8rem' },
  studentSubtext: { fontSize: '0.68rem', color: '#64748b' },
  attendancePercentSection: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', width: '70px' },
  miniProgressBg: { width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '1.5px' },
  miniProgressFill: { height: '100%', borderRadius: '1.5px' },
  attendanceStatsContainer: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  circularWidgetRow: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  circleWidgetContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  circleLabel: { fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' },
  logBox: { background: 'rgba(0, 0, 0, 0.15)', border: '1px solid rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '1rem' },
  logTitle: { fontSize: '0.8rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' },
  logList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  logItem: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#e2e8f0' },
  logBadge: { padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 'bold' },
  logText: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};

function CircleProgress({ percent, color, label }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div style={styles.circleWidgetContainer}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="8" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
        <text x="50" y="55" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="bold">{percent}%</text>
      </svg>
      <span style={styles.circleLabel}>{label}</span>
    </div>
  );
}

export default function AttendanceTab({ students, presenceHistory }) {
  return (
    <div style={styles.rowGrid}>
      <div className="glass-panel" style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h4 style={styles.panelTitle}>Frequência Individual dos Alunos</h4>
            <p style={styles.panelSubtitle}>Histórico e porcentagem de presenças nas modalidades.</p>
          </div>
        </div>
        <div style={styles.scrollList}>
          {students.map(student => (
            <div key={student.id} style={styles.attendanceRow}>
              <div style={styles.attendanceUser}>
                <div style={styles.miniAvatar}>{student.name.substring(0, 2).toUpperCase()}</div>
                <div>
                  <p style={styles.studentNameText}>{student.name}</p>
                  <span style={styles.studentSubtext}>{student.modality} • Nível {student.level}</span>
                </div>
              </div>
              <div style={styles.attendancePercentSection}>
                <span style={{ color: student.frequencyRate >= 90 ? '#00f5d4' : student.frequencyRate >= 80 ? '#00bbf9' : '#f77f00', fontWeight: 'bold', fontSize: '0.85rem' }}>{student.frequencyRate}%</span>
                <div style={styles.miniProgressBg}>
                  <div style={{ ...styles.miniProgressFill, width: `${student.frequencyRate}%`, backgroundColor: student.frequencyRate >= 90 ? '#00f5d4' : student.frequencyRate >= 80 ? '#00bbf9' : '#f77f00' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h4 style={styles.panelTitle}>Resumo Mensal e Metas</h4>
            <p style={styles.panelSubtitle}>Consolidado técnico de comparecimentos.</p>
          </div>
        </div>
        <div style={styles.attendanceStatsContainer}>
          <div style={styles.circularWidgetRow}>
            <CircleProgress percent={88} color="#00f5d4" label="Alunos Presenças" />
            <CircleProgress percent={96} color="#00bbf9" label="Funcionários Presenças" />
          </div>
          <div style={styles.logBox}>
            <h5 style={styles.logTitle}>Histórico de Chamadas Recentes (Alunos)</h5>
            <div style={styles.logList}>
              {presenceHistory.slice(0, 5).map((log, idx) => {
                const student = students.find(s => s.id === log.studentId);
                return (
                  <div key={idx} style={styles.logItem}>
                    <span style={{ ...styles.logBadge, backgroundColor: log.status === 'Presente' ? 'rgba(0, 245, 212, 0.15)' : log.status === 'Falta' ? 'rgba(255, 51, 102, 0.15)' : 'rgba(247, 127, 0, 0.15)', color: log.status === 'Presente' ? '#00f5d4' : log.status === 'Falta' ? '#ff3366' : '#f77f00' }}>{log.status}</span>
                    <span style={styles.logText}><strong>{student?.name || 'Aluno'}</strong> marcou presença em {log.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
