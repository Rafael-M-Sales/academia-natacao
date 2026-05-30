import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Users, Clock, MapPin, Search, BookOpen, Waves } from 'lucide-react';
import { SWIMMING_LANES, AVAILABLE_TIMES, INSTRUCTORS } from '../data/mockData';

export default function ClassesManagement({ classes, setClasses, students, employees }) {
  const derivedInstructors = employees
    ? employees.filter(e => e.role.toLowerCase().includes('instrutor') || e.role.toLowerCase().includes('professor'))
    : [];

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

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModality, setFilterModality] = useState('Todos');

  const [formData, setFormData] = useState({
    name: '',
    modality: 'Infantil',
    instructorId: 1,
    time: '09:00',
    days: [],
    lanes: [],
    maxCapacity: 12,
    students: [],
    capacityByLevel: {},
    minAge: 4,
    maxAge: 120,
    swimmingLevels: []
  });

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = filterModality === 'Todos' || cls.modality === filterModality;
    return matchesSearch && matchesModality;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      modality: 'Infantil',
      instructorId: 1,
      time: '09:00',
      days: [],
      lanes: [],
      maxCapacity: 12,
      students: [],
      capacityByLevel: {},
      minAge: 4,
      maxAge: 120,
      swimmingLevels: []
    });
    setEditingClass(null);
  };

  const handleEdit = (cls) => {
    setFormData(cls);
    setEditingClass(cls.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || formData.days.length === 0 || formData.lanes.length === 0) {
      alert('Preencha: Nome, Dias e Raias');
      return;
    }

    if (editingClass) {
      setClasses(classes.map(cls => cls.id === editingClass ? { ...formData, id: editingClass } : cls));
    } else {
      const newId = Math.max(...classes.map(c => c.id), 0) + 1;
      setClasses([...classes, { ...formData, id: newId }]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja deletar esta turma?')) {
      setClasses(classes.filter(cls => cls.id !== id));
    }
  };

  const getAvailableSpots = (cls) => {
    return cls.maxCapacity - cls.students.length;
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

  const getLaneNames = (laneIds) => {
    return laneIds.map(id => {
      const lane = SWIMMING_LANES.find(l => l.id === id);
      return lane ? lane.name : `Raia ${id}`;
    }).join(', ');
  };

  const getModalityInfo = (modality) => {
    switch (modality) {
      case 'Infantil':
        return { color: '#00f5d4', bg: 'rgba(0, 245, 212, 0.08)', border: 'rgba(0, 245, 212, 0.15)', icon: '🧒' };
      case 'Adulta':
        return { color: '#00bbf9', bg: 'rgba(0, 187, 249, 0.08)', border: 'rgba(0, 187, 249, 0.15)', icon: '🏊' };
      case 'Hidroginástica':
        return { color: '#9b5de5', bg: 'rgba(155, 93, 229, 0.08)', border: 'rgba(155, 93, 229, 0.15)', icon: '💧' };
      default:
        return { color: '#94a3b8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', icon: '📋' };
    }
  };

  const getOccupancyPercent = (cls) => {
    return Math.round((cls.students.length / cls.maxCapacity) * 100);
  };

  // Stats
  const totalClasses = classes.length;
  const totalEnrolled = classes.reduce((acc, c) => acc + c.students.length, 0);
  const totalCapacity = classes.reduce((acc, c) => acc + c.maxCapacity, 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestão de Turmas</h2>
          <p className="page-subtitle">Gerencie turmas, horários, instrutores e raias de natação.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-cyan"
        >
          <Plus size={18} /> Nova Turma
        </button>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div className="glass-panel" style={styles.miniStat}>
          <div style={{ ...styles.miniStatIcon, background: 'rgba(0, 187, 249, 0.1)' }}>
            <BookOpen size={18} color="#00bbf9" />
          </div>
          <div>
            <p style={styles.miniStatValue}>{totalClasses}</p>
            <p style={styles.miniStatLabel}>Turmas Ativas</p>
          </div>
        </div>
        <div className="glass-panel" style={styles.miniStat}>
          <div style={{ ...styles.miniStatIcon, background: 'rgba(0, 245, 212, 0.1)' }}>
            <Users size={18} color="#00f5d4" />
          </div>
          <div>
            <p style={styles.miniStatValue}>{totalEnrolled}</p>
            <p style={styles.miniStatLabel}>Alunos Matriculados</p>
          </div>
        </div>
        <div className="glass-panel" style={styles.miniStat}>
          <div style={{ ...styles.miniStatIcon, background: 'rgba(155, 93, 229, 0.1)' }}>
            <Waves size={18} color="#9b5de5" />
          </div>
          <div>
            <p style={styles.miniStatValue}>{avgOccupancy}%</p>
            <p style={styles.miniStatLabel}>Ocupação Média</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} color="#64748b" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar turma por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={filterModality}
          onChange={(e) => setFilterModality(e.target.value)}
          className="custom-select"
          style={styles.selectFilter}
        >
          <option value="Todos">Todas as Modalidades</option>
          <option value="Infantil">Infantil</option>
          <option value="Adulta">Adulta</option>
          <option value="Hidroginástica">Hidroginástica</option>
        </select>
      </div>

      {/* Classes Cards Grid */}
      {filteredClasses.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <Waves size={48} color="#1e293b" />
          <p style={styles.emptyTitle}>Nenhuma turma encontrada</p>
          <p style={styles.emptySubtitle}>Tente ajustar os filtros ou crie uma nova turma.</p>
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {filteredClasses.map((cls, idx) => {
            const mInfo = getModalityInfo(cls.modality);
            const spots = getAvailableSpots(cls);
            const occupancy = getOccupancyPercent(cls);
            const instructorColor = getInstructorColor(cls.instructorId);

            return (
              <div
                key={cls.id}
                className="glass-panel"
                style={{
                  ...styles.classCard,
                  animationDelay: `${idx * 0.05}s`,
                  borderColor: occupancy >= 90 ? 'rgba(255, 51, 102, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
                    <span style={{
                      ...styles.modalityBadge,
                      background: mInfo.bg,
                      color: mInfo.color,
                      borderColor: mInfo.border,
                    }}>
                      {mInfo.icon} {cls.modality}
                    </span>
                    <span style={styles.cardTime}>
                      <Clock size={12} style={{ marginRight: '4px', opacity: 0.6 }} />
                      {cls.time}
                    </span>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleEdit(cls)}
                      style={styles.actionBtnEdit}
                      title="Editar turma"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      style={styles.actionBtnDelete}
                      title="Excluir turma"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <h3 style={styles.cardTitle}>{cls.name}</h3>

                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Instrutor</span>
                    <span style={{ ...styles.detailValue, color: instructorColor }}>
                      {getInstructorName(cls.instructorId)}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Dias</span>
                    <span style={styles.detailValue}>
                      {cls.days.map(d => (
                        <span key={d} style={styles.dayChip}>{d}</span>
                      ))}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Raias</span>
                    <span style={styles.detailValue}>
                      <MapPin size={12} style={{ marginRight: '4px', opacity: 0.5 }} />
                      {getLaneNames(cls.lanes)}
                    </span>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div style={styles.occupancySection}>
                  <div style={styles.occupancyHeader}>
                    <span style={styles.occupancyLabel}>Ocupação</span>
                    <span style={{
                      ...styles.occupancyValue,
                      color: spots > 0 ? '#00f5d4' : '#ff3366'
                    }}>
                      {cls.students.length}/{cls.maxCapacity}
                    </span>
                  </div>
                  <div style={styles.occupancyBarBg}>
                    <div style={{
                      ...styles.occupancyBarFill,
                      width: `${occupancy}%`,
                      background: occupancy >= 90
                        ? 'linear-gradient(90deg, #ff3366, #ff6b8a)'
                        : occupancy >= 70
                        ? 'linear-gradient(90deg, #f77f00, #ffa041)'
                        : 'linear-gradient(90deg, #00f5d4, #00bbf9)',
                    }} />
                  </div>
                  <span style={{
                    ...styles.spotsText,
                    color: spots > 0 ? '#00f5d4' : '#ff3366'
                  }}>
                    {spots > 0 ? `${spots} vagas disponíveis` : 'Turma lotada'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Formulário */}
      {showForm && (
        <div style={styles.modalOverlay} onClick={() => { setShowForm(false); resetForm(); }}>
          <div className="glass-panel" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>
                  {editingClass ? '✏️ Editar Turma' : '➕ Nova Turma'}
                </h3>
                <p style={styles.modalSubtitle}>
                  {editingClass ? 'Atualize as informações da turma.' : 'Preencha os dados para criar uma nova turma.'}
                </p>
              </div>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                style={styles.closeBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              {/* Nome */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nome da Turma</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="custom-input"
                  placeholder="Ex: Natação Infantil - Nível Iniciante"
                />
              </div>

              {/* Modalidade e Instrutor */}
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Modalidade</label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                    className="custom-select"
                  >
                    <option value="Infantil">Infantil</option>
                    <option value="Adulta">Adulta</option>
                    <option value="Hidroginástica">Hidroginástica</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Instrutor</label>
                  <select
                    value={formData.instructorId}
                    onChange={(e) => setFormData({ ...formData, instructorId: parseInt(e.target.value) })}
                    className="custom-select"
                  >
                    {derivedInstructors.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horário e Dias */}
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Horário</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="custom-select"
                  >
                    {AVAILABLE_TIMES.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Dias da Semana</label>
                  <div style={styles.daySelector}>
                    {days.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            days: formData.days.includes(day)
                              ? formData.days.filter(d => d !== day)
                              : [...formData.days, day]
                          });
                        }}
                        style={formData.days.includes(day) ? styles.dayBtnActive : styles.dayBtn}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Raias */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Raias Utilizadas</label>
                <div style={styles.laneSelector}>
                  {SWIMMING_LANES.map(lane => (
                    <button
                      key={lane.id}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          lanes: formData.lanes.includes(lane.id)
                            ? formData.lanes.filter(l => l !== lane.id)
                            : [...formData.lanes, lane.id]
                        });
                      }}
                      style={formData.lanes.includes(lane.id) ? styles.laneBtnActive : styles.laneBtn}
                    >
                      <Waves size={14} style={{ marginRight: '4px' }} />
                      {lane.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capacidade e Idades */}
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Capacidade Máxima</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    className="custom-input"
                    min="1"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Faixa Etária</label>
                  <div style={styles.ageRow}>
                    <input
                      type="number"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: parseInt(e.target.value) })}
                      className="custom-input"
                      style={{ flex: 1 }}
                      placeholder="Min"
                      min="0"
                    />
                    <span style={styles.ageSep}>a</span>
                    <input
                      type="number"
                      value={formData.maxAge}
                      onChange={(e) => setFormData({ ...formData, maxAge: parseInt(e.target.value) })}
                      className="custom-input"
                      style={{ flex: 1 }}
                      placeholder="Max"
                      min="0"
                    />
                    <span style={styles.ageSep}>anos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={styles.modalFooter}>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="btn-secondary"
                style={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="btn-cyan"
                style={styles.saveBtn}
              >
                <Save size={16} /> {editingClass ? 'Atualizar Turma' : 'Criar Turma'}
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
    gap: '1.5rem',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  miniStat: {
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  miniStatIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  miniStatValue: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  miniStatLabel: {
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: '500',
    marginTop: '0.15rem',
  },
  filterBar: {
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    flex: 1,
    minWidth: '240px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  searchInput: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    color: '#ffffff',
    padding: '0.7rem 1rem 0.7rem 2.5rem',
    outline: 'none',
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontSize: '0.88rem',
    transition: 'all 0.3s ease',
  },
  selectFilter: {
    border: 'none',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '0.65rem 1rem',
    fontSize: '0.85rem',
    borderRadius: '10px',
    width: 'auto',
    minWidth: '180px',
  },
  emptyState: {
    padding: '4rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  emptyTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#94a3b8',
  },
  emptySubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '1.25rem',
  },
  classCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    animation: 'slideUp 0.4s ease-out backwards',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  modalityBadge: {
    padding: '0.3rem 0.65rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid',
    fontFamily: 'var(--font-title)',
    letterSpacing: '0.02em',
  },
  cardTime: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtnEdit: {
    background: 'rgba(0, 187, 249, 0.08)',
    border: '1px solid rgba(0, 187, 249, 0.15)',
    color: '#00bbf9',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionBtnDelete: {
    background: 'rgba(255, 51, 102, 0.06)',
    border: '1px solid rgba(255, 51, 102, 0.12)',
    color: '#ff3366',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  cardTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.01em',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '0.78rem',
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '0.82rem',
    color: '#e2e8f0',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.3rem',
  },
  dayChip: {
    background: 'rgba(67, 97, 238, 0.1)',
    border: '1px solid rgba(67, 97, 238, 0.15)',
    color: '#818cf8',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  occupancySection: {
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  occupancyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  occupancyLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
  },
  occupancyValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    fontFamily: 'var(--font-title)',
  },
  occupancyBarBg: {
    width: '100%',
    height: '6px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  spotsText: {
    fontSize: '0.72rem',
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '1.5rem',
    animation: 'fadeIn 0.2s ease-out',
  },
  modalContent: {
    maxWidth: '640px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '20px',
    animation: 'scaleIn 0.3s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem 1.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  },
  modalSubtitle: {
    fontSize: '0.82rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#94a3b8',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalBody: {
    padding: '1.5rem 1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1.25rem 1.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formLabel: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    fontWeight: '600',
    fontFamily: 'var(--font-title)',
    letterSpacing: '0.02em',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
  },
  daySelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  dayBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#94a3b8',
    padding: '0.45rem 0.7rem',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-title)',
  },
  dayBtnActive: {
    background: 'linear-gradient(135deg, #4361ee, #00bbf9)',
    border: '1px solid rgba(67, 97, 238, 0.3)',
    color: '#ffffff',
    padding: '0.45rem 0.7rem',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-title)',
    boxShadow: '0 2px 8px rgba(67, 97, 238, 0.25)',
  },
  laneSelector: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '0.5rem',
  },
  laneBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#94a3b8',
    padding: '0.55rem 0.75rem',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
  laneBtnActive: {
    background: 'rgba(0, 245, 212, 0.08)',
    border: '1px solid rgba(0, 245, 212, 0.25)',
    color: '#00f5d4',
    padding: '0.55rem 0.75rem',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 245, 212, 0.1)',
  },
  ageRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ageSep: {
    color: '#64748b',
    fontSize: '0.82rem',
    fontWeight: '500',
  },
  cancelBtn: {
    padding: '0.65rem 1.25rem',
  },
  saveBtn: {
    padding: '0.65rem 1.5rem',
  },
};
