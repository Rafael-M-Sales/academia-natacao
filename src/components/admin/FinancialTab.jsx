import { DollarSign, CheckCircle, AlertCircle, Percent, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

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
  actionBtn: { display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #00f5d4, #00bbf9)', border: 'none', color: '#080d1a', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-title)', fontSize: '0.85rem', fontWeight: '700', boxShadow: '0 4px 15px rgba(0, 245, 212, 0.15)', transition: 'all 0.2s' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' },
  emptyTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' },
  emptySubtitle: { fontSize: '0.85rem', color: '#64748b', maxWidth: '320px', lineHeight: '1.4' },
  tableResponsive: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem 0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: 'background 0.2s' },
  td: { padding: '1rem 0.75rem', fontSize: '0.85rem', color: '#e2e8f0' },
  studentNameContainer: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  studentInitials: { width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(67, 97, 238, 0.15)', border: '1px solid rgba(67, 97, 238, 0.2)', color: '#4361ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' },
  studentName: { fontWeight: '600', color: '#ffffff' },
  studentAge: { fontSize: '0.7rem', color: '#64748b' },
  modalityBadge: { background: 'rgba(0, 187, 249, 0.1)', border: '1px solid rgba(0, 187, 249, 0.15)', color: '#00bbf9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '600' },
  parentName: { fontWeight: '500', color: '#ffffff' },
  parentPhone: { fontSize: '0.72rem', color: '#94a3b8' },
  statusOverdueBadge: { background: 'rgba(255, 51, 102, 0.1)', border: '1px solid rgba(255, 51, 102, 0.15)', color: '#ff3366', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '600' },
  actionsGroup: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
  btnTableCobrar: { display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#00f5d4', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s' },
  btnTablePagar: { display: 'flex', alignItems: 'center', background: 'rgba(0, 245, 212, 0.1)', border: '1px solid rgba(0, 245, 212, 0.15)', color: '#00f5d4', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s' },
};

export default function FinancialTab({ students, onRegisterPayment, onBulkBilling, onSingleBilling }) {
  const activeStudents = students.filter(s => s.status === 'Ativo');
  const totalExpectedRevenue = activeStudents.reduce((sum, s) => sum + (s.monthlyFee || 250), 0);
  const overdueStudents = activeStudents.filter(s => s.paymentsStatus === 'Atrasado');
  const totalOverdueRevenue = overdueStudents.reduce((sum, s) => sum + (s.monthlyFee || 250), 0);
  const actualRevenue = totalExpectedRevenue - totalOverdueRevenue;
  const delinquencyRate = activeStudents.length > 0
    ? Math.round((overdueStudents.length / activeStudents.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={styles.statsRow}>
        <div className="glass-panel" style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Faturamento Esperado</span>
            <DollarSign size={20} color="#00bbf9" />
          </div>
          <h3 style={styles.cardValue}>R$ {totalExpectedRevenue.toLocaleString('pt-BR')}</h3>
          <p style={styles.cardSubText}>Baseado em {activeStudents.length} alunos ativos</p>
        </div>

        <div className="glass-panel" style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Faturamento Realizado</span>
            <CheckCircle size={20} color="#00f5d4" />
          </div>
          <h3 style={{ ...styles.cardValue, color: '#00f5d4' }}>R$ {actualRevenue.toLocaleString('pt-BR')}</h3>
          <p style={styles.cardSubText}>Valores recebidos este mês</p>
        </div>

        <div className="glass-panel" style={{ ...styles.statsCard, border: overdueStudents.length > 0 ? '1px solid rgba(255, 51, 102, 0.2)' : 'none' }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Montante Inadimplente</span>
            <AlertCircle size={20} color="#ff3366" />
          </div>
          <h3 style={{ ...styles.cardValue, color: '#ff3366' }}>R$ {totalOverdueRevenue.toLocaleString('pt-BR')}</h3>
          <p style={styles.cardSubText}>{overdueStudents.length} alunos com mensalidade vencida</p>
        </div>

        <div className="glass-panel" style={styles.statsCard}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Taxa de Inadimplência</span>
            <Percent size={20} color="#9b5de5" />
          </div>
          <h3 style={styles.cardValue}>{delinquencyRate}%</h3>
          <p style={styles.cardSubText}>
            {delinquencyRate < 15 ? '🟢 Sob controle saudável' : '⚠️ Exige atenção e cobrança'}
          </p>
        </div>
      </div>

      <div className="glass-panel" style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h4 style={styles.panelTitle}>Controle de Inadimplência</h4>
            <p style={styles.panelSubtitle}>Gerencie cobranças rápidas via WhatsApp e altere status de mensalidades atrasadas.</p>
          </div>
          {overdueStudents.length > 0 && (
            <button style={styles.actionBtn} onClick={onBulkBilling}>
              <Send size={16} style={{ marginRight: '6px' }} />
              Cobrar Todos ({overdueStudents.length})
            </button>
          )}
        </div>

        {overdueStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <CheckCircle2 size={48} color="#00f5d4" style={{ marginBottom: '1rem' }} />
            <p style={styles.emptyTitle}>Inadimplência Zero!</p>
            <p style={styles.emptySubtitle}>Todos os alunos matriculados ativos estão com os pagamentos em dia.</p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome do Aluno</th>
                  <th style={styles.th}>Modalidade</th>
                  <th style={styles.th}>Responsável Legal / Contato</th>
                  <th style={styles.th}>Valor</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Ações Administrativas</th>
                </tr>
              </thead>
              <tbody>
                {overdueStudents.map(student => (
                  <tr key={student.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.studentNameContainer}>
                        <div style={styles.studentInitials}>{student.name.substring(0, 2).toUpperCase()}</div>
                        <div>
                          <p style={styles.studentName}>{student.name}</p>
                          <span style={styles.studentAge}>{student.age} anos • {student.gender === 'M' ? 'Menino' : 'Menina'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.modalityBadge}>{student.modality}</span>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.parentName}>{student.responsibleName || 'O Próprio Aluno'}</p>
                      <span style={styles.parentPhone}>{student.responsiblePhone}</span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: '#ff3366' }}>R$ {(student.monthlyFee || 250).toLocaleString('pt-BR')}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusOverdueBadge}>Atrasado</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionsGroup}>
                        <button
                          style={styles.btnTableCobrar}
                          onClick={() => onSingleBilling(student.responsibleName || student.name, student.responsiblePhone)}
                          title="Notificar Cobrança no WhatsApp"
                        >
                          <MessageSquare size={14} style={{ marginRight: '4px' }} />
                          WhatsApp
                        </button>
                        <button
                          style={styles.btnTablePagar}
                          onClick={() => onRegisterPayment(student.id, student.name)}
                          title="Registrar Pagamento Recebido"
                        >
                          <CheckCircle size={14} style={{ marginRight: '4px' }} />
                          Receber
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
