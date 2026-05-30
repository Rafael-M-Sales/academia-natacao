import { useState } from 'react';
import { Search, Phone, MessageSquare } from 'lucide-react';

const styles = {
  panel: { padding: '1.75rem' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  panelTitle: { fontFamily: 'var(--font-title)', fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' },
  panelSubtitle: { fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' },
  searchBox: { display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '0.4rem 0.75rem', width: '240px' },
  searchIcon: { marginRight: '0.5rem' },
  searchInput: { background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', fontSize: '0.8rem', width: '100%' },
  tableResponsive: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem 0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', transition: 'background 0.2s' },
  td: { padding: '1rem 0.75rem', fontSize: '0.85rem', color: '#e2e8f0' },
  studentName: { fontWeight: '600', color: '#ffffff' },
  roleBadge: { display: 'inline-flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '500' },
  childrenTagsRow: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
  childTag: { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', color: '#e2e8f0' },
  btnTableCobrar: { display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#00f5d4', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s' },
};

export default function ResponsiblesTab({ students, onSingleBilling }) {
  const [searchTerm, setSearchTerm] = useState('');

  const parentDirectory = students.reduce((acc, student) => {
    if (student.responsibleName) {
      const existingParent = acc.find(p => p.name.toLowerCase() === student.responsibleName.toLowerCase());
      if (existingParent) {
        existingParent.children.push({ name: student.name, modality: student.modality });
      } else {
        acc.push({
          id: student.id,
          name: student.responsibleName,
          phone: student.responsiblePhone,
          children: [{ name: student.name, modality: student.modality }],
          paymentsStatus: student.paymentsStatus,
        });
      }
    }
    return acc;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h4 style={styles.panelTitle}>Diretório de Responsáveis</h4>
            <p style={styles.panelSubtitle}>Agenda centralizada de pais, mães ou contatos de emergência vinculados aos alunos.</p>
          </div>
          <div style={styles.searchBox}>
            <Search size={16} color="#64748b" style={styles.searchIcon} />
            <input type="text" placeholder="Pesquisar responsável ou telefone..." style={styles.searchInput} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome do Responsável</th>
                <th style={styles.th}>Telefone de Contato</th>
                <th style={styles.th}>Alunos Dependentes</th>
                <th style={styles.th}>Financeiro do Dependente</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ações Rápidas</th>
              </tr>
            </thead>
            <tbody>
              {parentDirectory
                .filter(parent => parent.name.toLowerCase().includes(searchTerm.toLowerCase()) || parent.phone.includes(searchTerm))
                .map(parent => (
                  <tr key={parent.id} style={styles.tr}>
                    <td style={styles.td}>
                      <p style={{ ...styles.studentName, fontWeight: '700' }}>{parent.name}</p>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Responsável Legal</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}><Phone size={12} style={{ marginRight: '4px' }} />{parent.phone}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.childrenTagsRow}>
                        {parent.children.map((child, cidx) => (
                          <span key={cidx} style={styles.childTag}>👶 {child.name} ({child.modality})</span>
                        ))}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: parent.paymentsStatus === 'Em Dia' ? '#00f5d4' : '#ff3366', fontWeight: 'bold', fontSize: '0.8rem' }}>● {parent.paymentsStatus}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button style={styles.btnTableCobrar} onClick={() => onSingleBilling(parent.name, parent.phone)}>
                        <MessageSquare size={14} style={{ marginRight: '4px' }} />WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
