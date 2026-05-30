import React from 'react';
import { Users, CheckCircle, AlertCircle, DollarSign, Calendar, TrendingUp, Trophy } from 'lucide-react';
import { INSTRUCTORS } from '../data/mockData';
import LiveClassMonitor from './LiveClassMonitor';

export default function Dashboard({
  students,
  classes,
  liveSessions,
  pedagogyNotes,
  presenceHistory,
  onNavigateToTab,
  onFilterPendingMedical,
  employees,
}) {
  const instructorColors = {
    1: '#41C9E2',
    2: '#008DDA',
    3: '#00F5D4',
    4: '#4361EE'
  };

  const getHashColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 75%, 65%)`;
  };

  const getInstructorName = (id) => {
    const emp = employees?.find(e => e.id === id);
    return emp ? emp.name : 'N/A';
  };

  const getInstructorColor = (id) => {
    if (instructorColors[id]) return instructorColors[id];
    const emp = employees?.find(e => e.id === id);
    if (emp) return getHashColor(emp.name);
    return '#00bbf9';
  };
  // Statistics calculations
  const totalStudents = students.filter(s => s.status === 'Ativo').length;
  const kidsCount = students.filter(s => s.status === 'Ativo' && s.modality === 'Infantil').length;
  const adultsCount = students.filter(s => s.status === 'Ativo' && s.modality === 'Adulta').length;
  const hidroCount = students.filter(s => s.status === 'Ativo' && s.modality === 'Hidroginástica').length;
  
  const pendingMedical = students.filter(s => s.status === 'Ativo' && (s.medicalCertificate === 'Vencido' || s.medicalCertificate === 'Pendente')).length;
  
  // Simulated stats
  const simulatedRevenue = students.filter(s => s.status === 'Ativo' && s.paymentsStatus === 'Em Dia').length * 250; 
  const overdueCount = students.filter(s => s.status === 'Ativo' && s.paymentsStatus === 'Atrasado').length;

  // Render SVG Circular Progress Chart
  const renderCircleProgress = (percent, color, label) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    
    return (
      <div style={styles.chartWidget}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
          <circle 
            cx="45" 
            cy="45" 
            r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="8" 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
          <text x="45" y="50" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="bold" fontFamily="var(--font-title)">
            {percent}%
          </text>
        </svg>
        <span style={styles.chartLabel}>{label}</span>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Painel de Controle</h2>
          <p className="page-subtitle">Bem-vindo ao H2O Control. Aqui está o resumo das atividades de hoje.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            style={styles.teacherAccessBtn}
            onClick={() => { window.location.hash = '#professor'; }}
          >
            <Trophy size={16} />
            Acesso Professor
          </button>
          <div style={styles.headerBadge}>
            <Calendar size={16} color="#00f5d4" />
            <span style={styles.headerBadgeText}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      <LiveClassMonitor
        liveSessions={liveSessions}
        pedagogyNotes={pedagogyNotes}
        presenceHistory={presenceHistory}
        employees={employees}
      />

      {/* Grid de Estatísticas (Stats Cards) */}
      <div style={styles.statsGrid}>
        {/* Card 1 - Alunos Ativos */}
        <div className="glass-panel" style={styles.statCard} onClick={() => onNavigateToTab('students')}>
          <div style={styles.statCardHeader}>
            <div style={{ ...styles.iconBox, background: 'rgba(0, 187, 249, 0.1)', color: '#00bbf9' }}>
              <Users size={22} />
            </div>
            <span style={styles.statTrend}>
              <TrendingUp size={14} style={{ marginRight: '4px' }} />
              +4 este mês
            </span>
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statNumber}>{totalStudents}</h3>
            <p style={styles.statLabel}>Alunos Ativos</p>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statSubText}>👶 {kidsCount} Inf | 🏊 {adultsCount} Adul | 👵 {hidroCount} Hidro</span>
          </div>
        </div>

        {/* Card 2 - Presença Geral */}
        <div className="glass-panel" style={styles.statCard}>
          <div style={styles.statCardHeader}>
            <div style={{ ...styles.iconBox, background: 'rgba(0, 245, 212, 0.1)', color: '#00f5d4' }}>
              <CheckCircle size={22} />
            </div>
            <span style={{ ...styles.statTrend, color: '#00f5d4' }}>Excelente</span>
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statNumber}>86%</h3>
            <p style={styles.statLabel}>Frequência Média</p>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statSubText}>Meta mensal de 80% superada</span>
          </div>
        </div>

        {/* Card 3 - Pendências Médicas */}
        <div 
          className={`glass-panel ${pendingMedical > 0 ? 'glass-panel-active' : ''}`} 
          style={{ ...styles.statCard, cursor: 'pointer' }}
          onClick={() => {
            onFilterPendingMedical();
            onNavigateToTab('students');
          }}
        >
          <div style={styles.statCardHeader}>
            <div style={{ 
              ...styles.iconBox, 
              background: pendingMedical > 0 ? 'rgba(247, 127, 0, 0.1)' : 'rgba(255,255,255,0.05)', 
              color: pendingMedical > 0 ? '#f77f00' : '#94a3b8' 
            }}>
              <AlertCircle size={22} />
            </div>
            {pendingMedical > 0 && (
              <span style={{ ...styles.statTrend, color: '#f77f00', animation: 'float 2s infinite' }}>Atenção</span>
            )}
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statNumber}>{pendingMedical}</h3>
            <p style={styles.statLabel}>Exames Médicos Vencidos</p>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statSubText}>Clique para ver a lista e notificar</span>
          </div>
        </div>

        {/* Card 4 - Faturamento Simulado */}
        <div className="glass-panel" style={styles.statCard}>
          <div style={styles.statCardHeader}>
            <div style={{ ...styles.iconBox, background: 'rgba(155, 93, 229, 0.1)', color: '#9b5de5' }}>
              <DollarSign size={22} />
            </div>
            {overdueCount > 0 && (
              <span style={{ ...styles.statTrend, color: '#ff3366' }}>{overdueCount} atrasos</span>
            )}
          </div>
          <div style={styles.statInfo}>
            <h3 style={styles.statNumber}>R$ {simulatedRevenue.toLocaleString('pt-BR')}</h3>
            <p style={styles.statLabel}>Faturamento Ativo (Mensal)</p>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statSubText}>92% das mensalidades em dia</span>
          </div>
        </div>
      </div>

      {/* Seção Intermediária - Gráficos e Aulas */}
      <div style={styles.rowGrid}>
        {/* Painel Gráfico de Ocupação */}
        <div className="glass-panel" style={styles.chartPanel}>
          <div style={styles.panelHeader}>
            <h4 style={styles.panelTitle}>Ocupação de Turmas</h4>
            <p style={styles.panelSubtitle}>Porcentagem de vagas preenchidas por modalidade</p>
          </div>
          <div style={styles.chartsRow}>
            {renderCircleProgress(78, '#00f5d4', 'Natação Infantil')}
            {renderCircleProgress(62, '#00bbf9', 'Natação Adulta')}
            {renderCircleProgress(85, '#9b5de5', 'Hidroginástica')}
          </div>
          <div style={styles.chartLegend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, backgroundColor: '#00f5d4' }}></div>
              <span>Capacidade Ideal</span>
            </div>
            <p style={styles.legendAdvice}>
              💡 A modalidade <strong>Hidroginástica</strong> está operando perto do limite de vagas na quarta-feira pela manhã.
            </p>
          </div>
        </div>

        {/* Painel Próximas Turmas do Dia */}
        <div className="glass-panel" style={styles.timelinePanel}>
          <div style={styles.panelHeader}>
            <h4 style={styles.panelTitle}>Próximas Aulas de Hoje</h4>
            <span style={styles.activeBadge}>2 Aulas Restantes</span>
          </div>
          <div style={styles.timelineList}>
            {classes.slice(0, 3).map((item, idx) => {
              const instructorName = getInstructorName(item.instructorId);
              const instructorColor = getInstructorColor(item.instructorId);
              return (
                <div key={item.id} style={styles.timelineItem}>
                  <div style={styles.timelineTimeContainer}>
                    <p style={styles.timelineTime}>{item.time}</p>
                    <span style={styles.timelineDays}>{item.days.join('/')}</span>
                  </div>
                  <div style={styles.timelineMarkerContainer}>
                    <div style={{ ...styles.timelineMarker, backgroundColor: instructorColor }}></div>
                    {idx < 2 && <div style={styles.timelineConnector}></div>}
                  </div>
                  <div style={styles.timelineDetails} onClick={() => onNavigateToTab('schedule')}>
                    <h5 style={styles.classTitle}>{item.name}</h5>
                    <div style={styles.classSubDetails}>
                      <span>📍 {item.location}</span>
                      <span style={{ color: instructorColor }}>👤 {instructorName}</span>
                      <span>👥 {item.students.length}/{item.maxCapacity} Alunos</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alertas Rápidos e Boletim */}
      <div className="glass-panel" style={styles.bulletinPanel}>
        <div style={styles.bulletinHeader}>
          <Trophy size={18} color="#FFD166" style={{ marginRight: '6px' }} />
          <h4 style={styles.panelTitle}>Mural de Destaques e Alertas</h4>
        </div>
        <div style={styles.bulletinContent}>
          <div style={styles.bulletinItem}>
            <span style={styles.bulletinTagLevel}>Touca Laranja 🎖️</span>
            <p style={styles.bulletinText}>
              <strong>Mariana Lima Flores</strong> completou todos os requisitos de Touca Amarela e progrediu para a <strong>Touca Laranja</strong>!
            </p>
            <span style={styles.bulletinTime}>Hoje às 15:40</span>
          </div>
          <div style={styles.bulletinItem}>
            <span style={{ ...styles.bulletinTagLevel, background: 'rgba(247, 127, 0, 0.15)', color: '#f77f00' }}>Exame Vencido ⚠️</span>
            <p style={styles.bulletinText}>
              O atestado médico de <strong>Pedro Henrique Canto</strong> venceu. Um alerta de cobrança do atestado foi anexado à ficha do aluno.
            </p>
            <span style={styles.bulletinTime}>Ontem</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    animation: 'float 6s ease-in-out infinite',
  },
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(0, 245, 212, 0.05)',
    border: '1px solid rgba(0, 245, 212, 0.15)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
  },
  headerBadgeText: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.85rem',
    color: '#00f5d4',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  statCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTrend: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '600',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontFamily: 'var(--font-title)',
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: '0.15rem',
  },
  statFooter: {
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
  },
  statSubText: {
    fontSize: '0.72rem',
    color: '#64748b',
    fontWeight: '500',
  },
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
  },
  chartPanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  panelTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  panelSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '0.15rem',
  },
  chartsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '0.5rem 0',
  },
  chartWidget: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  chartLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  chartLegend: {
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  legendAdvice: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  timelinePanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  activeBadge: {
    background: 'rgba(67, 97, 238, 0.1)',
    border: '1px solid rgba(67, 97, 238, 0.2)',
    color: '#4361ee',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.72rem',
    fontWeight: '600',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: '0.5rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '1.25rem',
    position: 'relative',
    paddingBottom: '1.25rem',
  },
  timelineTimeContainer: {
    minWidth: '55px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  timelineTime: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  timelineDays: {
    fontSize: '0.65rem',
    color: '#64748b',
    fontWeight: '600',
  },
  timelineMarkerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineMarker: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    zIndex: 2,
    border: '3px solid var(--bg-secondary)',
    boxShadow: '0 0 10px rgba(255,255,255,0.1)',
  },
  timelineConnector: {
    width: '2px',
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    margin: '4px 0',
  },
  timelineDetails: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.015)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  classTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  classSubDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    fontSize: '0.72rem',
    color: '#64748b',
    marginTop: '0.25rem',
    fontWeight: '500',
  },
  bulletinPanel: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  bulletinHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  bulletinContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  bulletinItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
  },
  bulletinTagLevel: {
    background: 'rgba(0, 245, 212, 0.1)',
    border: '1px solid rgba(0, 245, 212, 0.15)',
    color: '#00f5d4',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  bulletinText: {
    fontSize: '0.82rem',
    color: '#e2e8f0',
    flex: 1,
    lineHeight: '1.4',
  },
  bulletinTime: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: '500',
  },
  teacherAccessBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.1), rgba(0, 187, 249, 0.1))',
    border: '1px solid rgba(0, 245, 212, 0.15)',
    color: '#00f5d4',
    fontFamily: 'var(--font-title)',
    fontSize: '0.82rem',
    fontWeight: '700',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
