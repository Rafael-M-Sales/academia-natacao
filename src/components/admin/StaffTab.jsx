import { useState } from 'react';
import { Users, DollarSign, CalendarCheck2, UserPlus, Briefcase, Phone } from 'lucide-react';

const styles = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' },
  statsCard: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' },
  cardValue: { fontFamily: 'var(--font-title)', fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: '0.25rem 0' },
  cardSubText: { fontSize: '0.7rem', color: '#64748b', fontWeight: '500' },
  panel: { padding: '1.75rem' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  panelTitle: { fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' },
  panelSubtitle: { fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' },
  actionBtn: { display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #00f5d4, #00bbf9)', border: 'none', color: '#080d1a', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-title)', fontSize: '0.85rem', fontWeight: '700', transition: 'all 0.2s' },
  tableResponsive: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem 0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: 'background 0.2s' },
  td: { padding: '1rem 0.75rem', fontSize: '0.85rem', color: '#e2e8f0' },
  studentNameContainer: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  studentInitials: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f5d4, #00bbf9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: '#080d1a' },
  studentName: { fontWeight: '600', color: '#ffffff' },
  studentAge: { fontSize: '0.7rem', color: '#64748b' },
  roleBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '500' },
  parentPhone: { fontSize: '0.72rem', color: '#94a3b8' },
  attendanceContainer: { display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100px' },
  progressBackground: { height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px' },
  presenceToggleBtn: { border: '1px solid', padding: '0.35rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s', outline: 'none' },
  formContainer: { padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px' },
  formTitle: { fontSize: '0.9rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.72rem', color: '#94a3b8', fontWeight: '500' },
  formActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' },
  btnSave: { background: 'linear-gradient(135deg, #00f5d4, #00bbf9)', border: 'none', color: '#080d1a', padding: '0.55rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontFamily: 'var(--font-title)', fontSize: '0.8rem', fontWeight: '700' },
};

export default function StaffTab({ employees, employeePresence, onAddEmployee, onTogglePresence, onDeleteEmployee }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const totalPayroll = employees.reduce((acc, curr) => acc + curr.salary, 0);
  const presentEmployeesToday = employeePresence.filter(p => p.status === 'Presente').length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newRole || !newSalary || !newPhone) return;
    onAddEmployee({ name: newName, role: newRole, salary: newSalary, phone: newPhone });
    setNewName(''); setNewRole(''); setNewSalary(''); setNewPhone('');
    setShowAddForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={styles.statsRow}>
        <div className="glass-panel" style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Total de Colaboradores</span>
            <Users size={20} color="#00bbf9" />
          </div>
          <h3 style={styles.cardValue}>{employees.length}</h3>
          <p style={styles.cardSubText}>Instrutores, recepção e coordenação</p>
        </div>
        <div className="glass-panel" style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Folha Mensal Estimada</span>
            <DollarSign size={20} color="#9b5de5" />
          </div>
          <h3 style={{ ...styles.cardValue, color: '#9b5de5' }}>R$ {totalPayroll.toLocaleString('pt-BR')}</h3>
          <p style={styles.cardSubText}>Investimento em capital humano</p>
        </div>
        <div className="glass-panel" style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Presença Hoje</span>
            <CalendarCheck2 size={20} color="#00f5d4" />
          </div>
          <h3 style={{ ...styles.cardValue, color: '#00f5d4' }}>{presentEmployeesToday} / {employees.length}</h3>
          <p style={styles.cardSubText}>Colaboradores ativos escalados hoje</p>
        </div>
      </div>

      <div className="glass-panel" style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h4 style={styles.panelTitle}>Relação de Funcionários</h4>
            <p style={styles.panelSubtitle}>Visualize cargos, remunerações, frequência e controle a presença diária da equipe.</p>
          </div>
          <button style={styles.actionBtn} onClick={() => setShowAddForm(!showAddForm)}>
            <UserPlus size={16} style={{ marginRight: '6px' }} />
            {showAddForm ? 'Cancelar' : 'Contratar Colaborador'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} style={styles.formContainer} className="glass-panel">
            <h5 style={styles.formTitle}>Ficha de Contratação / Cadastro</h5>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome Completo</label>
                <input type="text" className="custom-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Carlos Eduardo de Oliveira" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cargo / Função</label>
                <input type="text" className="custom-input" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Ex: Instrutor de Hidroginástica" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Salário (R$)</label>
                <input type="number" className="custom-input" value={newSalary} onChange={e => setNewSalary(e.target.value)} placeholder="Ex: 3200" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Telefone de Contato</label>
                <input type="text" className="custom-input" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Ex: (11) 99999-8888" />
              </div>
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.btnSave}>Admitir Colaborador</button>
            </div>
          </form>
        )}

        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Funcionário</th>
                <th style={styles.th}>Cargo / Função</th>
                <th style={styles.th}>Contato</th>
                <th style={styles.th}>Salário Mensal</th>
                <th style={styles.th}>Freq. Mensal</th>
                <th style={styles.th}>Status Hoje ({new Date().toLocaleDateString('pt-BR')})</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const todayPresence = employeePresence.find(p => p.employeeId === emp.id);
                const isPresent = todayPresence?.status === 'Presente';
                return (
                  <tr key={emp.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.studentNameContainer}>
                        <div style={styles.studentInitials}>{emp.name.substring(0, 2).toUpperCase()}</div>
                        <div>
                          <p style={styles.studentName}>{emp.name}</p>
                          <span style={styles.studentAge}>ID #{emp.id} • Ativo</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}><Briefcase size={12} style={{ marginRight: '4px' }} />{emp.role}</span>
                    </td>
                    <td style={styles.td}><span style={styles.parentPhone}>{emp.phone}</span></td>
                    <td style={styles.td}><strong>R$ {emp.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                    <td style={styles.td}>
                      <div style={styles.attendanceContainer}>
                        <span style={{ color: emp.attendanceRate >= 95 ? '#00f5d4' : emp.attendanceRate >= 90 ? '#00bbf9' : '#ff3366', fontWeight: 'bold' }}>{emp.attendanceRate}%</span>
                        <div style={styles.progressBackground}>
                          <div style={{ ...styles.progressFill, width: `${emp.attendanceRate}%`, backgroundColor: emp.attendanceRate >= 95 ? '#00f5d4' : emp.attendanceRate >= 90 ? '#00bbf9' : '#ff3366' }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => onTogglePresence(emp.id, emp.name)} style={{ ...styles.presenceToggleBtn, backgroundColor: isPresent ? 'rgba(0, 245, 212, 0.15)' : 'rgba(255, 51, 102, 0.15)', color: isPresent ? '#00f5d4' : '#ff3366', borderColor: isPresent ? 'rgba(0, 245, 212, 0.3)' : 'rgba(255, 51, 102, 0.3)' }}>
                        {isPresent ? '✓ Presente' : '✗ Ausente'}
                      </button>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button onClick={() => onDeleteEmployee(emp.id, emp.name)} style={{ background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.15)', color: '#ff3366', padding: '0.35rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                        Demitir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
