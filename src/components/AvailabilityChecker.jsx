import { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Waves,
} from 'lucide-react';
import {
  SWIMMING_LEVELS_KIDS,
  SWIMMING_LEVELS_ADULTS,
  SWIMMING_LEVELS_HIDRO,
  INSTRUCTORS,
  SWIMMING_LANES,
} from '../data/mockData';

export default function AvailabilityChecker({ classes, employees }) {
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
  const [selectedModality, setSelectedModality] = useState('Infantil');
  const [selectedLevel, setSelectedLevel] = useState('branca');
  const [selectedAge, setSelectedAge] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  const getLevelsByModality = () => {
    if (selectedModality === 'Infantil') return SWIMMING_LEVELS_KIDS;
    if (selectedModality === 'Adulta') return SWIMMING_LEVELS_ADULTS;
    return SWIMMING_LEVELS_HIDRO;
  };

  const getAvailableClasses = () => {
    return classes.filter((cls) => {
      if (cls.modality !== selectedModality) return false;

      const levels = cls.swimmingLevels || [];
      if (levels.length > 0 && !levels.includes(selectedLevel)) return false;

      if (selectedAge) {
        const age = parseInt(selectedAge, 10);
        if (age < cls.minAge || age > cls.maxAge) return false;
      }

      if (selectedDay && !(cls.days || []).includes(selectedDay)) return false;

      if ((cls.students?.length || 0) >= cls.maxCapacity) return false;

      return true;
    });
  };

  const getInstructorName = (id) => {
    const emp = employees?.find((e) => e.id === id);
    return emp ? emp.name : 'N/A';
  };

  const getInstructorColor = (id) => {
    if (instructorColors[id]) return instructorColors[id];
    const emp = employees?.find((e) => e.id === id);
    if (emp) return getHashColor(emp.name);
    return '#00bbf9';
  };

  const getLaneNames = (laneIds) => {
    if (!laneIds?.length) return 'Piscina geral';
    return laneIds
      .map((id) => SWIMMING_LANES.find((l) => l.id === id)?.name || `Raia ${id}`)
      .join(', ');
  };

  const getModalityInfo = (modality) => {
    switch (modality) {
      case 'Infantil':
        return {
          color: '#00f5d4',
          bg: 'rgba(0, 245, 212, 0.08)',
          border: 'rgba(0, 245, 212, 0.15)',
          icon: '🧒',
        };
      case 'Adulta':
        return {
          color: '#00bbf9',
          bg: 'rgba(0, 187, 249, 0.08)',
          border: 'rgba(0, 187, 249, 0.15)',
          icon: '🏊',
        };
      case 'Hidroginástica':
        return {
          color: '#9b5de5',
          bg: 'rgba(155, 93, 229, 0.08)',
          border: 'rgba(155, 93, 229, 0.15)',
          icon: '💧',
        };
      default:
        return {
          color: '#94a3b8',
          bg: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.1)',
          icon: '📋',
        };
    }
  };

  const availableClasses = getAvailableClasses();
  const levels = getLevelsByModality();
  const totalSpots = availableClasses.reduce(
    (sum, cls) => sum + (cls.maxCapacity - (cls.students?.length || 0)),
    0
  );

  return (
    <div style={styles.container}>
      <div className="page-header">
        <div>
          <h2 className="page-title">Disponibilidade de Vagas</h2>
          <p className="page-subtitle">
            Consulte turmas com vagas por modalidade, nível, idade e dia da semana.
          </p>
        </div>
        <div className="glass-panel" style={styles.headerBadge}>
          <CheckCircle2 size={18} color="#00f5d4" />
          <span style={styles.headerBadgeText}>
            {availableClasses.length} turma(s) · {totalSpots} vaga(s)
          </span>
        </div>
      </div>

      <div className="glass-panel" style={styles.filterPanel}>
        <div style={styles.filterGrid}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Modalidade</label>
            <select
              value={selectedModality}
              onChange={(e) => {
                setSelectedModality(e.target.value);
                setSelectedLevel(
                  e.target.value === 'Infantil'
                    ? 'branca'
                    : e.target.value === 'Adulta'
                      ? 'iniciante'
                      : 'leve'
                );
              }}
              className="custom-select"
            >
              <option value="Infantil">Natação Infantil</option>
              <option value="Adulta">Natação Adulta</option>
              <option value="Hidroginástica">Hidroginástica</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Nível de capacidade</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="custom-select"
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Idade (opcional)</label>
            <input
              type="number"
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              placeholder="Ex: 8"
              className="custom-input"
              min="0"
              max="120"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Dia da semana (opcional)</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="custom-select"
            >
              <option value="">Todos os dias</option>
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {availableClasses.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <AlertCircle size={40} color="#f77f00" />
          <p style={styles.emptyTitle}>Nenhuma turma disponível</p>
          <p style={styles.emptySubtitle}>
            Ajuste os filtros ou verifique turmas lotadas na aba Turmas.
          </p>
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {availableClasses.map((cls, idx) => {
            const enrolled = cls.students?.length || 0;
            const availableSpots = cls.maxCapacity - enrolled;
            const occupancy = Math.round((enrolled / cls.maxCapacity) * 100);
            const mInfo = getModalityInfo(cls.modality);
            const instructorColor = getInstructorColor(cls.instructorId);

            return (
              <div
                key={cls.id}
                className="glass-panel"
                style={{
                  ...styles.classCard,
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardHeaderLeft}>
                    <span
                      style={{
                        ...styles.modalityBadge,
                        background: mInfo.bg,
                        color: mInfo.color,
                        borderColor: mInfo.border,
                      }}
                    >
                      {mInfo.icon} {cls.modality}
                    </span>
                    <span style={styles.cardTime}>
                      <Clock size={12} style={{ marginRight: 4, opacity: 0.6 }} />
                      {cls.time}
                    </span>
                  </div>
                  <div style={styles.spotsBadge}>
                    <CheckCircle size={16} color="#00f5d4" />
                    <span>{availableSpots} vagas</span>
                  </div>
                </div>

                <h3 style={styles.cardTitle}>{cls.name}</h3>
                <p style={styles.cardMeta}>ID {cls.id}</p>

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
                      {(cls.days || []).map((d) => (
                        <span key={d} style={styles.dayChip}>
                          {d}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Raias</span>
                    <span style={styles.detailValue}>
                      <MapPin size={12} style={{ marginRight: 4, opacity: 0.5 }} />
                      {getLaneNames(cls.lanes)}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Faixa etária</span>
                    <span style={styles.detailValue}>
                      {cls.minAge} – {cls.maxAge} anos
                    </span>
                  </div>
                </div>

                <div style={styles.occupancySection}>
                  <div style={styles.occupancyHeader}>
                    <span style={styles.occupancyLabel}>Ocupação</span>
                    <span style={styles.occupancyValue}>
                      {enrolled}/{cls.maxCapacity}
                    </span>
                  </div>
                  <div style={styles.occupancyBarBg}>
                    <div
                      style={{
                        ...styles.occupancyBarFill,
                        width: `${occupancy}%`,
                        background:
                          occupancy >= 80
                            ? 'linear-gradient(90deg, #ff3366, #ff6b8a)'
                            : occupancy >= 50
                              ? 'linear-gradient(90deg, #f77f00, #ffa041)'
                              : 'linear-gradient(90deg, #00f5d4, #00bbf9)',
                      }}
                    />
                  </div>
                </div>

                <button type="button" className="btn-cyan" style={styles.enrollBtn}>
                  <Users size={16} />
                  Inscrever novo aluno
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-panel" style={styles.lanesInfo}>
        <div style={styles.lanesInfoHeader}>
          <Waves size={20} color="#00bbf9" />
          <h3 style={styles.lanesInfoTitle}>Raias da piscina</h3>
        </div>
        <div style={styles.lanesInfoGrid}>
          <div style={styles.lanesInfoItem}>
            <p style={styles.lanesInfoLabel}>Adultos</p>
            <p style={styles.lanesInfoValue}>Raias 1, 2, 5 e 6 (profundas)</p>
          </div>
          <div style={styles.lanesInfoItem}>
            <p style={styles.lanesInfoLabel}>Infantis</p>
            <p style={styles.lanesInfoValue}>Raias 3 e 4 (rasas)</p>
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
    gap: '1.5rem',
  },
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1rem',
    borderRadius: '12px',
  },
  headerBadgeText: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#00f5d4',
    fontFamily: 'var(--font-title)',
  },
  filterPanel: {
    padding: '1.25rem 1.5rem',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.25rem',
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
  },
  emptyState: {
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  emptyTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: '0.5rem',
  },
  emptySubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    maxWidth: '360px',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  classCard: {
    padding: '1.35rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    animation: 'fadeIn 0.4s ease-out backwards',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  cardHeaderLeft: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.5rem',
  },
  modalityBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
    border: '1px solid',
    fontFamily: 'var(--font-title)',
  },
  cardTime: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  spotsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#00f5d4',
    fontFamily: 'var(--font-title)',
    whiteSpace: 'nowrap',
  },
  cardTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: '-0.02em',
    lineHeight: 1.3,
  },
  cardMeta: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '-0.5rem',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.75rem',
    fontSize: '0.85rem',
  },
  detailLabel: {
    color: '#64748b',
    flexShrink: 0,
  },
  detailValue: {
    color: '#e2e8f0',
    fontWeight: '500',
    textAlign: 'right',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '0.25rem',
  },
  dayChip: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  occupancySection: {
    marginTop: '0.25rem',
  },
  occupancyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.4rem',
  },
  occupancyLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
  },
  occupancyValue: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  occupancyBarBg: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.6s ease',
  },
  enrollBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '0.25rem',
  },
  lanesInfo: {
    padding: '1.25rem 1.5rem',
  },
  lanesInfoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  lanesInfoTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#f8fafc',
  },
  lanesInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  lanesInfoItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '0.85rem 1rem',
  },
  lanesInfoLabel: {
    fontSize: '0.78rem',
    color: '#00bbf9',
    fontWeight: '700',
    marginBottom: '0.25rem',
    fontFamily: 'var(--font-title)',
  },
  lanesInfoValue: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
};
