import React, { useState } from 'react';
import { Award, GraduationCap, ChevronRight, CheckCircle2, Star, Users } from 'lucide-react';
import { SWIMMING_LEVELS_KIDS, SWIMMING_LEVELS_ADULTS, SWIMMING_LEVELS_HIDRO } from '../data/mockData';

export default function PedagogyView({ students, pedagogyNotes = [] }) {
  const [activeCategory, setActiveCategory] = useState('Infantil');
  const [selectedLevelId, setSelectedLevelId] = useState(null);

  // Group levels
  const getLevels = () => {
    if (activeCategory === 'Infantil') return SWIMMING_LEVELS_KIDS;
    if (activeCategory === 'Adulta') return SWIMMING_LEVELS_ADULTS;
    return SWIMMING_LEVELS_HIDRO;
  };

  const currentLevels = getLevels();
  
  // Set first level as default if none selected
  const activeLevelId = selectedLevelId || currentLevels[0]?.id;

  // Filter students in the active level
  const studentsInLevel = students.filter(s => 
    s.status === 'Ativo' && 
    s.modality === activeCategory && 
    s.level === activeLevelId
  );

  // Skills milestones by level
  const getLevelSkills = (levelId) => {
    const skillsMap = {
      // Kids
      branca: ['Flutuação dorsal com apoio', 'Respiração lateral na raia', 'Bater pernas com prancha', 'Mergulho simples'],
      amarela: ['Crawl completo (25 metros)', 'Pernada de costas sem apoio', 'Respiração bilateral coordenada', 'Salto em pé'],
      laranja: ['Virada simples crawl', 'Nado Costas completo (25m)', 'Coordenação do nado Peito', 'Mergulho de ponta'],
      verde: ['Nado Peito completo (25m)', 'Ondulação (Borboleta)', 'Virada olímpica básica', 'Resistência de 100 metros'],
      azul: ['Nado Borboleta completo', 'Domínio de viradas nos 4 nados', 'Treinamento de velocidade', 'Foco em competições'],
      
      // Adults
      iniciante: ['Superação do medo de água profunda', 'Flutuação sem apoio por 30s', 'Nado Crawl básico estruturado', 'Respiração frontal/lateral'],
      intermediario: ['Nado Crawl coordenado (50m)', 'Nado Costas coordenado (50m)', 'Introdução à técnica do Peito', 'Viradas simples de borda'],
      avancado: ['Treino de velocidade de 100m', 'Execução limpa de Peito e Borboleta', 'Treinos intervalados avançados', 'Foco em condicionamento cardiorrespiratório'],
      
      // Hydro
      leve: ['Alongamento articular geral', 'Exercícios na piscina rasa', 'Caminhada aquática assistida', 'Foco em relaxamento e reabilitação'],
      moderado: ['Exercícios aeróbicos contínuos', 'Uso de halteres flutuantes', 'Fortalecimento de membros inferiores', 'Ritmo moderado com música'],
      intenso: ['Circuitos de alta intensidade', 'Treino de explosão muscular', 'Saltos e corrida na água profunda', 'Alta queima calórica']
    };

    return skillsMap[levelId] || ['Habilidade e adaptação geral', 'Condicionamento físico básico'];
  };

  const currentSkills = getLevelSkills(activeLevelId);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Evolução Pedagógica</h2>
          <p className="page-subtitle">Acompanhe a metodologia de ensino, requisitos técnicos e alunos por nível de aprendizado.</p>
        </div>
      </div>

      {pedagogyNotes.length > 0 && (
        <div className="glass-panel" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
          <h3 style={{ color: '#9b5de5', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Evoluções em tempo real (professores)
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {pedagogyNotes.slice(0, 8).map((n) => (
              <li
                key={n.id}
                style={{
                  padding: '0.6rem',
                  background: 'rgba(155, 93, 229, 0.08)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              >
                <strong>{n.studentName}</strong> ({n.modality}) — {n.note}
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {n.instructorName} · {new Date(n.createdAt).toLocaleString('pt-BR')}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs by Modality */}
      <div style={styles.tabsContainer}>
        {['Infantil', 'Adulta', 'Hidroginástica'].map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setSelectedLevelId(null); // Reset active level when changing category
            }}
            style={{
              ...styles.tabBtn,
              ...(activeCategory === cat ? styles.tabBtnActive : {})
            }}
          >
            <GraduationCap size={16} />
            {cat === 'Infantil' ? 'Natação Infantil' : cat === 'Adulta' ? 'Natação Adulta' : 'Hidroginástica'}
          </button>
        ))}
      </div>

      {/* Main Grid Content */}
      <div style={styles.mainGrid}>
        {/* Left Side: Levels list cards */}
        <div style={styles.levelsColumn}>
          <h3 style={styles.secTitle}>Níveis Disponíveis</h3>
          <div style={styles.levelsList}>
            {currentLevels.map(lvl => {
              const isActive = activeLevelId === lvl.id;
              const countInLvl = students.filter(s => s.status === 'Ativo' && s.modality === activeCategory && s.level === lvl.id).length;
              
              return (
                <div
                  key={lvl.id}
                  className="glass-panel"
                  style={{
                    ...styles.levelCard,
                    ...(isActive ? styles.levelCardActive : {})
                  }}
                  onClick={() => setSelectedLevelId(lvl.id)}
                >
                  <div style={styles.levelCardHeader}>
                    {activeCategory === 'Infantil' ? (
                      <div style={{ ...styles.toucaCircle, backgroundColor: lvl.color, border: '1px solid rgba(255,255,255,0.1)' }}></div>
                    ) : (
                      <Award size={18} color={isActive ? '#00bbf9' : '#64748b'} />
                    )}
                    <span style={{ 
                      ...styles.levelName, 
                      color: isActive ? (activeCategory === 'Infantil' ? '#00f5d4' : '#00bbf9') : '#ffffff' 
                    }}>
                      {lvl.name}
                    </span>
                  </div>
                  <p style={styles.levelDesc}>{lvl.description}</p>
                  
                  <div style={styles.levelCardFooter}>
                    <span style={styles.studentCount}>
                      <Users size={12} style={{ marginRight: '4px' }} />
                      {countInLvl} alunos
                    </span>
                    <ChevronRight size={16} color="#64748b" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Requisites & Student Grouping */}
        <div style={styles.detailsColumn}>
          {/* Active Level Card info */}
          <div className="glass-panel" style={styles.requisitesPanel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>
                🎯 Requisitos da {currentLevels.find(l => l.id === activeLevelId)?.name}
              </h3>
              <p style={styles.panelSubtitle}>Habilidades necessárias para conclusão e graduação deste nível</p>
            </div>
            
            <div style={styles.skillsGrid}>
              {currentSkills.map((skill, idx) => (
                <div key={idx} style={styles.skillItem}>
                  <CheckCircle2 size={16} color="#00f5d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={styles.skillText}>{skill}</span>
                </div>
              ))}
            </div>

            <div style={styles.pedagogyMethod}>
              <Star size={16} color="#FFD166" style={{ marginRight: '6px' }} />
              <span style={styles.methodText}>
                <strong>Metodologia H2O Active:</strong> As avaliações de evolução ocorrem na última semana de cada mês pelos instrutores correspondentes.
              </span>
            </div>
          </div>

          {/* Grouped Students Panel */}
          <div className="glass-panel" style={styles.studentsPanel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>
                👥 Alunos Matriculados Neste Nível ({studentsInLevel.length})
              </h3>
            </div>

            <div style={styles.studentListGrid}>
              {studentsInLevel.length === 0 ? (
                <p style={styles.noStudentsText}>Nenhum aluno ativo matriculado neste nível atualmente.</p>
              ) : (
                studentsInLevel.map(student => (
                  <div key={student.id} style={styles.studentCardMini}>
                    <div style={styles.studentAvatarMini}>
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={styles.studentDetails}>
                      <p style={styles.studentNameMini}>{student.name}</p>
                      <span style={styles.studentMetaMini}>
                        {student.age} anos • Frequência: {student.frequencyRate}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
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
  },
  tabsContainer: {
    display: 'flex',
    gap: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
  },
  tabBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '0.75rem 1.25rem',
    fontFamily: 'var(--font-title)',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    color: '#00f5d4',
    background: 'rgba(0, 245, 212, 0.05)',
    borderBottom: '2px solid #00f5d4',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '1.75rem',
  },
  levelsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  secTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  levelsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  levelCard: {
    padding: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  levelCardActive: {
    borderColor: 'rgba(0, 245, 212, 0.25)',
    background: 'rgba(14, 23, 44, 0.8)',
    boxShadow: '0 0 15px rgba(0,245,212,0.03)',
  },
  levelCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  toucaCircle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  },
  levelName: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  levelDesc: {
    fontSize: '0.78rem',
    color: '#64748b',
    lineHeight: '1.4',
  },
  levelCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.02)',
    paddingTop: '0.6rem',
    marginTop: '0.25rem',
  },
  studentCount: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
  },
  detailsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  requisitesPanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  panelHeader: {
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '0.75rem',
  },
  panelTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  panelSubtitle: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '0.15rem',
  },
  skillsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  skillItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  skillText: {
    fontSize: '0.82rem',
    color: '#e2e8f0',
    lineHeight: '1.4',
  },
  pedagogyMethod: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 209, 102, 0.04)',
    border: '1px solid rgba(255, 209, 102, 0.1)',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    marginTop: '0.5rem',
  },
  methodText: {
    fontSize: '0.78rem',
    color: '#FFD166',
    lineHeight: '1.4',
  },
  studentsPanel: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  studentListGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
    maxHeight: '260px',
    overflowY: 'auto',
    paddingRight: '0.25rem',
  },
  noStudentsText: {
    color: '#64748b',
    fontSize: '0.82rem',
    padding: '1rem 0',
  },
  studentCardMini: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    borderRadius: '10px',
  },
  studentAvatarMini: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00bbf9',
    fontWeight: '700',
    fontSize: '0.7rem',
    flexShrink: 0,
  },
  studentDetails: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  studentNameMini: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  studentMetaMini: {
    fontSize: '0.68rem',
    color: '#64748b',
  }
};
