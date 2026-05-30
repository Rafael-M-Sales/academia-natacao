import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { INSTRUCTORS } from '../data/mockData';

const todayISO = () => new Date().toISOString().split('T')[0];

export default function ScheduleView({ classes, students, presenceHistory, setPresenceHistory, employees }) {
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
  const [dayFilter, setDayFilter] = useState('Todos');
  const [modalityFilter, setModalityFilter] = useState('Todos');
  const [activeCallSheet, setActiveCallSheet] = useState(null);
  const [tempPresence, setTempPresence] = useState({}); // Stores state of current check-in session

  // Filtered classes
  const filteredClasses = classes.filter(cls => {
    const matchesDay = dayFilter === 'Todos' || cls.days.includes(dayFilter);
    const matchesModality = modalityFilter === 'Todos' || cls.modality === modalityFilter;
    return matchesDay && matchesModality;
  });

  // Start checking attendance
  const handleOpenCallSheet = (cls) => {
    setActiveCallSheet(cls);
    
    const today = todayISO();
    const currentSession = {};
    
    cls.students.forEach(sId => {
      const existing = presenceHistory.find(h => h.studentId === sId && h.classId === cls.id && h.date === today);
      currentSession[sId] = existing ? existing.status : null; // null represents unchecked
    });
    
    setTempPresence(currentSession);
  };

  // Set individual presence status
  const handleSetStatus = (studentId, status) => {
    setTempPresence(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save the entire attendance sheet
  const handleSaveAttendance = () => {
    const today = todayISO();
    let updatedHistory = [...presenceHistory];

    Object.keys(tempPresence).forEach(studentIdStr => {
      const sId = parseInt(studentIdStr);
      const status = tempPresence[sId];
      if (!status) return; // Ignore unchecked

      // Remove previous entry for today if exists
      updatedHistory = updatedHistory.filter(h => !(h.studentId === sId && h.classId === activeCallSheet.id && h.date === today));
      
      // Add new entry
      updatedHistory.push({
        studentId: sId,
        classId: activeCallSheet.id,
        date: today,
        status: status
      });
    });

    setPresenceHistory(updatedHistory);
    setActiveCallSheet(null);
    alert('Lista de presença salva com sucesso!');
  };

  // Calculate attendance progress
  const getCheckedCount = () => {
    return Object.values(tempPresence).filter(v => v !== null).length;
  };

  const getAttendanceSummaryText = (cls) => {
    const today = todayISO();
    const present = presenceHistory.filter(h => h.classId === cls.id && h.date === today && h.status === 'Presente').length;
    const absent = presenceHistory.filter(h => h.classId === cls.id && h.date === today && (h.status === 'Falta' || h.status === 'Falta Justificada')).length;
    
    if (present === 0 && absent === 0) return 'Chamada pendente para hoje';
    return `Hoje: 🟢 ${present} Presentes | 🔴 ${absent} Faltas`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Grade Horária e Chamada</h2>
          <p className="page-subtitle">Monitore a ocupação de raias, horários de instrutores e controle a frequência diária.</p>
        </div>
      </div>

      {/* Navigation Filters */}
      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.filtersGroup}>
          <div style={styles.filterWrapper}>
            <Calendar size={14} color="#64748b" />
            <select 
              className="custom-select" 
              style={styles.selectFilter}
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
            >
              <option value="Todos">Todos os Dias</option>
              <option value="Seg">Segundas</option>
              <option value="Ter">Terças</option>
              <option value="Qua">Quartas</option>
              <option value="Qui">Quintas</option>
              <option value="Sex">Sextas</option>
            </select>
          </div>

          <div style={styles.filterWrapper}>
            <Sparkles size={14} color="#64748b" />
            <select 
              className="custom-select" 
              style={styles.selectFilter}
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
            >
              <option value="Todos">Todas Modalidades</option>
              <option value="Infantil">Natação Infantil</option>
              <option value="Adulta">Natação Adulta</option>
              <option value="Hidroginástica">Hidroginástica</option>
            </select>
          </div>
        </div>
        <div style={styles.legendWrapper}>
          <span style={styles.legendText}>💡 Clique em uma turma para abrir o diário de presença.</span>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div style={styles.gridContainer}>
        {filteredClasses.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <p>Nenhuma turma cadastrada para esses critérios.</p>
          </div>
        ) : (
          <div style={styles.classesGrid}>
            {filteredClasses.map(cls => {
              const instructorName = getInstructorName(cls.instructorId);
              const instructorColor = getInstructorColor(cls.instructorId);
              
              return (
                <div 
                  key={cls.id} 
                  className="glass-panel" 
                  style={styles.classCard}
                  onClick={() => handleOpenCallSheet(cls)}
                >
                  <div style={styles.cardHeader}>
                    <span style={{ 
                      ...styles.modalityTag, 
                      backgroundColor: cls.modality === 'Infantil' ? 'rgba(0, 245, 212, 0.1)' : 
                                      cls.modality === 'Adulta' ? 'rgba(0, 187, 249, 0.1)' : 'rgba(155, 93, 229, 0.1)',
                      color: cls.modality === 'Infantil' ? '#00f5d4' : 
                             cls.modality === 'Adulta' ? '#00bbf9' : '#9b5de5'
                    }}>
                      {cls.modality}
                    </span>
                    <span style={styles.capacityBadge}>👥 {cls.students.length}/{cls.maxCapacity}</span>
                  </div>

                  <h3 style={styles.cardTitle}>{cls.name}</h3>

                  <div style={styles.detailsList}>
                    <div style={styles.detailRow}>
                      <Clock size={14} color="#64748b" />
                      <span>{cls.time} ({cls.days.join(', ')})</span>
                    </div>
                    <div style={styles.detailRow}>
                      <MapPin size={14} color="#64748b" />
                      <span>{cls.location}</span>
                    </div>
                    <div style={styles.detailRow}>
                      <User size={14} color="#64748b" />
                      <span style={{ color: instructorColor, fontWeight: '600' }}>{instructorName}</span>
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <p style={styles.attendanceSummary}>{getAttendanceSummaryText(cls)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHAMADA MODAL (Attendance / Call Sheet) */}
      {activeCallSheet && (
        <div style={styles.modalOverlay} onClick={() => setActiveCallSheet(null)}>
          <div className="glass-panel" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Diário de Presença e Chamada</h3>
                <p style={styles.modalSubtitle}>{activeCallSheet.name} • {activeCallSheet.time}</p>
              </div>
              <button style={styles.closeBtn} onClick={() => setActiveCallSheet(null)}>×</button>
            </div>

            <div style={styles.modalBody}>
              {/* Progress Indicator */}
              <div style={styles.progressContainer}>
                <div style={styles.progressTextRow}>
                  <span>Frequência da aula</span>
                  <span>{getCheckedCount()} de {activeCallSheet.students.length} alunos verificados</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div 
                    style={{ 
                      ...styles.progressBarFill, 
                      width: `${(getCheckedCount() / activeCallSheet.students.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Students attendance list */}
              <div style={styles.callList}>
                {activeCallSheet.students.length === 0 ? (
                  <p style={styles.noStudents}>Nenhum aluno matriculado nesta turma.</p>
                ) : (
                  activeCallSheet.students.map(sId => {
                    const student = students.find(s => s.id === sId);
                    if (!student) return null;
                    const status = tempPresence[sId];

                    return (
                      <div key={sId} style={styles.callItem}>
                        <div style={styles.studentInfo}>
                          <div style={styles.studentAvatar}>
                            {student.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p style={styles.studentName}>{student.name}</p>
                            <span style={styles.studentMeta}>
                              {student.age} anos {student.medicalCertificate !== 'Valido' && '⚠️ Atestado Pendente'}
                            </span>
                          </div>
                        </div>

                        {/* Presence state buttons */}
                        <div style={styles.actionButtons}>
                          <button 
                            style={{ 
                              ...styles.statusBtn, 
                              ...styles.presentBtn,
                              background: status === 'Presente' ? '#00f5d4' : 'rgba(255,255,255,0.02)',
                              color: status === 'Presente' ? '#080d1a' : '#ffffff',
                              borderColor: status === 'Presente' ? '#00f5d4' : 'rgba(255,255,255,0.05)'
                            }}
                            onClick={() => handleSetStatus(sId, 'Presente')}
                          >
                            <Check size={14} style={{ marginRight: '4px' }} />
                            Presente
                          </button>

                          <button 
                            style={{ 
                              ...styles.statusBtn, 
                              ...styles.absentBtn,
                              background: status === 'Falta' ? '#ff3366' : 'rgba(255,255,255,0.02)',
                              color: status === 'Falta' ? '#ffffff' : '#ffffff',
                              borderColor: status === 'Falta' ? '#ff3366' : 'rgba(255,255,255,0.05)'
                            }}
                            onClick={() => handleSetStatus(sId, 'Falta')}
                          >
                            <X size={14} style={{ marginRight: '4px' }} />
                            Falta
                          </button>

                          <button 
                            style={{ 
                              ...styles.statusBtn, 
                              ...styles.justifiedBtn,
                              background: status === 'Falta Justificada' ? '#f77f00' : 'rgba(255,255,255,0.02)',
                              color: status === 'Falta Justificada' ? '#ffffff' : '#ffffff',
                              borderColor: status === 'Falta Justificada' ? '#f77f00' : 'rgba(255,255,255,0.05)'
                            }}
                            onClick={() => handleSetStatus(sId, 'Falta Justificada')}
                          >
                            <AlertCircle size={14} style={{ marginRight: '4px' }} />
                            Justificada
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal actions */}
            <div style={styles.modalFooter}>
              <button className="btn-secondary" onClick={() => setActiveCallSheet(null)}>
                Cancelar
              </button>
              <button 
                className="btn-cyan" 
                onClick={handleSaveAttendance}
                disabled={getCheckedCount() < activeCallSheet.students.length}
                style={{
                  opacity: getCheckedCount() < activeCallSheet.students.length ? 0.6 : 1,
                  cursor: getCheckedCount() < activeCallSheet.students.length ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle2 size={16} />
                Salvar Presenças
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  filterBar: {
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  filtersGroup: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '0 0.5rem',
    borderRadius: '10px',
  },
  selectFilter: {
    border: 'none',
    background: 'transparent',
    padding: '0.6rem 0.5rem',
    fontSize: '0.85rem',
    width: 'auto',
  },
  legendWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  legendText: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    fontWeight: '500',
  },
  gridContainer: {
    width: '100%',
  },
  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  classCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalityTag: {
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
    fontSize: '0.72rem',
    fontWeight: '700',
  },
  capacityBadge: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  cardTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: '1.4',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.82rem',
    color: '#94a3b8',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
  },
  cardFooter: {
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '0.75rem',
    marginTop: '0.25rem',
  },
  attendanceSummary: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#64748b',
  },

  /* Call Sheet Modal */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(4, 7, 14, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '1.5rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '680px',
    background: 'var(--bg-secondary)',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  modalHeader: {
    padding: '1.25rem 1.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  modalSubtitle: {
    fontSize: '0.8rem',
    color: '#00bbf9',
    fontWeight: '600',
    marginTop: '0.15rem',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.75rem',
    cursor: 'pointer',
    lineHeight: '1',
  },
  modalBody: {
    padding: '1.5rem 1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflowY: 'auto',
    maxHeight: 'calc(75vh - 120px)',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.02)',
    borderRadius: '12px',
  },
  progressTextRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  progressBarBg: {
    height: '6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00bbf9, #00f5d4)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  callList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  noStudents: {
    textAlign: 'center',
    color: '#64748b',
    padding: '2rem',
  },
  callItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    background: 'rgba(255, 255, 255, 0.015)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    gap: '1.5rem',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
  },
  studentAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00bbf9',
    fontWeight: '700',
    fontSize: '0.78rem',
  },
  studentName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  studentMeta: {
    fontSize: '0.72rem',
    color: '#64748b',
    display: 'block',
    marginTop: '0.1rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.4rem',
  },
  statusBtn: {
    padding: '0.45rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  presentBtn: {
    hoverBg: 'rgba(0, 245, 212, 0.1)',
  },
  absentBtn: {
    hoverBg: 'rgba(255, 51, 102, 0.1)',
  },
  justifiedBtn: {
    hoverBg: 'rgba(247, 127, 0, 0.1)',
  },
  modalFooter: {
    padding: '1rem 1.75rem',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    background: 'rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    alignItems: 'center',
  }
};
