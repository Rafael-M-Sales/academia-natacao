import React, { useState, useEffect } from 'react';
import { Search, UserPlus, SlidersHorizontal, Check, ShieldAlert, Award, FileText, ArrowLeft, Trash2 } from 'lucide-react';
import { SWIMMING_LEVELS_KIDS, SWIMMING_LEVELS_ADULTS, SWIMMING_LEVELS_HIDRO, EVOLUTION_CRITERIA } from '../data/mockData';
import { nextStudentId } from '../services/api';

export default function StudentsList({ students, setStudents, classes, setClasses, initialFilterPendingMedical }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [medicalFilter, setMedicalFilter] = useState('Todos');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [receiptSimulated, setReceiptSimulated] = useState(false);
  const [evalChecks, setEvalChecks] = useState({});
  const [evalNotes, setEvalNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Reset evaluation when selected student changes
  useEffect(() => {
    setEvalChecks({});
    setEvalNotes('');
  }, [selectedStudent]);

  const handleStartEdit = () => {
    setEditForm({ ...selectedStudent });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setStudents(prev => prev.map(s => s.id === editForm.id ? { ...editForm } : s));
    setSelectedStudent({ ...editForm });
    setIsEditing(false);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleEditField = (field, value) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'modality') {
        if (value === 'Infantil') updated.level = 'branca';
        else if (value === 'Adulta') updated.level = 'iniciante';
        else updated.level = 'leve';
      }
      return updated;
    });
  };

  // Apply default filters from dashboard if active
  useEffect(() => {
    if (initialFilterPendingMedical) {
      setMedicalFilter('Pendentes');
      setStatusFilter('Ativo');
    }
  }, [initialFilterPendingMedical]);

  // Form states
  const [newStudent, setNewStudent] = useState({
    name: '',
    age: '',
    gender: 'M',
    modality: 'Infantil',
    level: 'branca',
    medicalCertificate: 'Valido',
    medicalExpiry: '',
    responsibleName: '',
    responsiblePhone: '',
    status: 'Ativo',
    frequencyRate: 100,
    paymentsStatus: 'Em Dia'
  });

  // Level selector based on modality
  useEffect(() => {
    if (newStudent.modality === 'Infantil') {
      setNewStudent(prev => ({ ...prev, level: 'branca' }));
    } else if (newStudent.modality === 'Adulta') {
      setNewStudent(prev => ({ ...prev, level: 'iniciante' }));
    } else {
      setNewStudent(prev => ({ ...prev, level: 'leve' }));
    }
  }, [newStudent.modality]);

  // Filtering logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.responsibleName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModality = modalityFilter === 'Todos' || student.modality === modalityFilter;
    const matchesStatus = statusFilter === 'Todos' || student.status === statusFilter;
    
    let matchesMedical = true;
    if (medicalFilter === 'Validos') {
      matchesMedical = student.medicalCertificate === 'Valido';
    } else if (medicalFilter === 'Pendentes') {
      matchesMedical = student.medicalCertificate === 'Vencido' || student.medicalCertificate === 'Pendente';
    }

    return matchesSearch && matchesModality && matchesStatus && matchesMedical;
  });

  // Handle Add Student
  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.age) {
      alert('Por favor, preencha pelo menos Nome e Idade.');
      return;
    }
    
    const createdStudent = {
      ...newStudent,
      id: nextStudentId(students),
      age: parseInt(newStudent.age),
      registrationDate: new Date().toISOString().split('T')[0],
      photoUrl: ''
    };

    setStudents([createdStudent, ...students]);
    setShowAddForm(false);
    // Reset form
    setNewStudent({
      name: '',
      age: '',
      gender: 'M',
      modality: 'Infantil',
      level: 'branca',
      medicalCertificate: 'Valido',
      medicalExpiry: '',
      responsibleName: '',
      responsiblePhone: '',
      status: 'Ativo',
      frequencyRate: 100,
      paymentsStatus: 'Em Dia'
    });
  };

  // Toggle student status
  const handleToggleStatus = (id) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Ativo' ? 'Inativo' : 'Ativo';
        if (selectedStudent && selectedStudent.id === id) {
          setSelectedStudent({ ...selectedStudent, status: nextStatus });
        }
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Delete student
  const handleDeleteStudent = (id) => {
    if (window.confirm('Tem certeza que deseja remover este aluno permanentemente?')) {
      setStudents(students.filter(s => s.id !== id));
      setSelectedStudent(null);
    }
  };

  // Simulate payment status toggle
  const handleTogglePayment = (id) => {
    setStudents(students.map(s => {
      if (s.id === id) {
        const nextPayment = s.paymentsStatus === 'Em Dia' ? 'Atrasado' : 'Em Dia';
        if (selectedStudent && selectedStudent.id === id) {
          setSelectedStudent({ ...selectedStudent, paymentsStatus: nextPayment });
        }
        return { ...s, paymentsStatus: nextPayment };
      }
      return s;
    }));
  };

  // Update student monthly fee
  const handleUpdateMonthlyFee = (studentId, fee) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent(curr => ({ ...curr, monthlyFee: fee }));
        }
        return { ...s, monthlyFee: fee };
      }
      return s;
    }));
  };

  // Remove student from class
  const handleRemoveFromClass = (studentId, classId) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, students: c.students.filter(id => id !== studentId) };
      }
      return c;
    }));
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updated = {
          ...s,
          enrolledClasses: (s.enrolledClasses || []).filter(id => id !== classId)
        };
        setSelectedStudent(updated);
        return updated;
      }
      return s;
    }));
  };

  // Add student to class
  const handleAddToClass = (studentId, classId) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        if (c.students.includes(studentId)) return c;
        return { ...c, students: [...c.students, studentId] };
      }
      return c;
    }));
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const enrolled = s.enrolledClasses || [];
        if (enrolled.includes(classId)) return s;
        const updated = {
          ...s,
          enrolledClasses: [...enrolled, classId]
        };
        setSelectedStudent(updated);
        return updated;
      }
      return s;
    }));
  };

  const handleUpdateLevel = (studentId, newLevel) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent(curr => ({ ...curr, level: newLevel }));
        }
        return { ...s, level: newLevel };
      }
      return s;
    }));
  };

  const getCriteriaForLevel = (student) => {
    const group = student.modality === 'Infantil' ? 'kids' : student.modality === 'Adulta' ? 'adults' : 'hidro';
    return EVOLUTION_CRITERIA[group]?.[student.level] || [];
  };

  const getNextLevelId = (student) => {
    const levels = student.modality === 'Infantil' ? SWIMMING_LEVELS_KIDS
      : student.modality === 'Adulta' ? SWIMMING_LEVELS_ADULTS : SWIMMING_LEVELS_HIDRO;
    const idx = levels.findIndex(l => l.id === student.level);
    return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1].id : null;
  };

  const handleCheckCriterion = (criteriaId) => {
    setEvalChecks(prev => ({ ...prev, [criteriaId]: !prev[criteriaId] }));
  };

  const handlePromoteStudent = () => {
    const nextId = getNextLevelId(selectedStudent);
    if (!nextId) return;
    handleUpdateLevel(selectedStudent.id, nextId);
    setEvalChecks({});
    setEvalNotes('');
  };

  const renderEvaluationPanel = (student) => {
    const criteria = getCriteriaForLevel(student);
    const nextLevel = getNextLevelId(student);
    if (!nextLevel || criteria.length === 0) {
      return (
        <div style={styles.evalContainer}>
          <div style={{ ...styles.evalPromoBanner, borderColor: 'rgba(0, 245, 212, 0.3)', color: '#00f5d4' }}>
            🏆 Aluno no nível máximo desta modalidade
          </div>
        </div>
      );
    }

    const nextLevelData = student.modality === 'Infantil' ? SWIMMING_LEVELS_KIDS
      : student.modality === 'Adulta' ? SWIMMING_LEVELS_ADULTS : SWIMMING_LEVELS_HIDRO;
    const nextName = nextLevelData.find(l => l.id === nextLevel)?.name || nextLevel;
    const checkedCount = criteria.filter(c => evalChecks[c.id]).length;
    const allChecked = checkedCount === criteria.length;

    return (
      <div style={styles.evalContainer}>
        <div style={styles.evalHeader}>
          <Award size={16} color="#00bbf9" />
          <span>Avaliação do Professor</span>
        </div>

        <p style={styles.evalGuide}>
          Marque os critérios que o aluno já atingiu. Quando todos estiverem marcados,
          o sistema libera a promoção para <strong>{nextName}</strong>.
        </p>

        <div style={styles.evalCriterialList}>
          {criteria.map(c => (
            <div
              key={c.id}
              onClick={() => handleCheckCriterion(c.id)}
              style={{
                ...styles.evalCriterion,
                borderColor: evalChecks[c.id] ? 'rgba(0, 245, 212, 0.3)' : 'rgba(255,255,255,0.05)',
                background: evalChecks[c.id] ? 'rgba(0, 245, 212, 0.05)' : 'rgba(255,255,255,0.01)',
              }}
            >
              <div style={{
                ...styles.evalCheckbox,
                background: evalChecks[c.id] ? '#00f5d4' : 'rgba(255,255,255,0.03)',
                borderColor: evalChecks[c.id] ? '#00f5d4' : 'rgba(255,255,255,0.1)',
              }}>
                {evalChecks[c.id] && <Check size={10} color="#080d1a" />}
              </div>
              <div>
                <p style={styles.evalCriterionLabel}>{c.label}</p>
                <p style={styles.evalCriterionDesc}>{c.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.evalProgressRow}>
          <div style={styles.evalProgressBg}>
            <div style={{ ...styles.evalProgressFill, width: `${(checkedCount / criteria.length) * 100}%` }} />
          </div>
          <span style={styles.evalProgressText}>{checkedCount}/{criteria.length}</span>
        </div>

        <textarea
          className="custom-input"
          style={styles.evalTextarea}
          placeholder="Anotações do professor sobre a evolução do aluno..."
          value={evalNotes}
          onChange={(e) => setEvalNotes(e.target.value)}
        />

        {allChecked && (
          <button
            style={styles.evalPromoBtn}
            onClick={handlePromoteStudent}
          >
            <Award size={16} />
            Promover para {nextName}
          </button>
        )}
      </div>
    );
  };

  // Render the colorful toucas progression visualizer
  const renderLevelProgression = (student) => {
    if (student.modality === 'Infantil') {
      return (
        <div style={styles.progressionContainer}>
          <h4 style={styles.progressionTitle}>🎖️ Evolução de Toucas (Natação Infantil)</h4>
          <div style={styles.toucasList}>
            {SWIMMING_LEVELS_KIDS.map(lvl => {
              const isActive = student.level === lvl.id;
              return (
                <div 
                  key={lvl.id} 
                  onClick={() => handleUpdateLevel(student.id, lvl.id)}
                  style={{ 
                    ...styles.toucaItem, 
                    cursor: 'pointer',
                    border: isActive ? `2px solid #00f5d4` : '1px solid rgba(255,255,255,0.05)',
                    background: isActive ? 'rgba(0, 245, 212, 0.05)' : 'rgba(255,255,255,0.01)'
                  }}
                >
                  <div style={{ ...styles.toucaCircle, backgroundColor: lvl.color, border: '1px solid rgba(0,0,0,0.2)' }}>
                    {isActive && <Check size={14} color={lvl.textColor} />}
                  </div>
                  <div style={styles.toucaDetails}>
                    <p style={{ ...styles.toucaName, color: isActive ? '#00f5d4' : '#f8fafc' }}>{lvl.name}</p>
                    <p style={styles.toucaDesc}>{lvl.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    const levels = student.modality === 'Adulta' ? SWIMMING_LEVELS_ADULTS : SWIMMING_LEVELS_HIDRO;
    return (
      <div style={styles.progressionContainer}>
        <h4 style={styles.progressionTitle}>📈 Nível Técnico da Modalidade</h4>
        <div style={styles.toucasList}>
          {levels.map(lvl => {
            const isActive = student.level === lvl.id;
            return (
              <div 
                key={lvl.id} 
                onClick={() => handleUpdateLevel(student.id, lvl.id)}
                style={{ 
                  ...styles.toucaItem, 
                  cursor: 'pointer',
                  border: isActive ? `2px solid #00bbf9` : '1px solid rgba(255,255,255,0.05)',
                  background: isActive ? 'rgba(0, 187, 249, 0.05)' : 'rgba(255,255,255,0.01)'
                }}
              >
                <div style={{ 
                  ...styles.levelBadgeMini, 
                  backgroundColor: isActive ? '#00bbf9' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#080d1a' : '#94a3b8'
                }}>
                  {isActive ? <Check size={14} /> : <Award size={14} />}
                </div>
                <div style={styles.toucaDetails}>
                  <p style={{ ...styles.toucaName, color: isActive ? '#00bbf9' : '#f8fafc' }}>{lvl.name}</p>
                  <p style={styles.toucaDesc}>{lvl.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* View Header depending on view state */}
      {!showAddForm ? (
        <>
          <div className="page-header">
            <div>
              <h2 className="page-title">Alunos Cadastrados</h2>
              <p className="page-subtitle">Gerencie as matrículas, acompanhe exames e visualize o progresso pedagógico.</p>
            </div>
            <button className="btn-cyan" onClick={() => setShowAddForm(true)}>
              <UserPlus size={18} />
              Novo Aluno
            </button>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel" style={styles.filterBar}>
            <div style={styles.searchWrapper}>
              <Search size={18} color="#64748b" style={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Buscar por nome de aluno ou responsável..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={styles.filtersGroup}>
              <div style={styles.filterWrapper}>
                <SlidersHorizontal size={14} color="#64748b" />
                <select 
                  className="custom-select" 
                  style={styles.selectFilter}
                  value={modalityFilter}
                  onChange={(e) => setModalityFilter(e.target.value)}
                >
                  <option value="Todos" style={{ background: '#0e172c', color: '#f8fafc' }}>Todas Modalidades</option>
                  <option value="Infantil" style={{ background: '#0e172c', color: '#f8fafc' }}>Infantil</option>
                  <option value="Adulta" style={{ background: '#0e172c', color: '#f8fafc' }}>Adulta</option>
                  <option value="Hidroginástica" style={{ background: '#0e172c', color: '#f8fafc' }}>Hidroginástica</option>
                </select>
              </div>

              <select 
                className="custom-select" 
                style={styles.selectFilter}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todos" style={{ background: '#0e172c', color: '#f8fafc' }}>Todos os Status</option>
                <option value="Ativo" style={{ background: '#0e172c', color: '#f8fafc' }}>Ativos</option>
                <option value="Inativo" style={{ background: '#0e172c', color: '#f8fafc' }}>Inativos</option>
              </select>

              <select 
                className="custom-select" 
                style={styles.selectFilter}
                value={medicalFilter}
                onChange={(e) => setMedicalFilter(e.target.value)}
              >
                <option value="Todos" style={{ background: '#0e172c', color: '#f8fafc' }}>Todos Exames</option>
                <option value="Validos" style={{ background: '#0e172c', color: '#f8fafc' }}>Exames Válidos</option>
                <option value="Pendentes" style={{ background: '#0e172c', color: '#f8fafc' }}>Exames Vencidos/Pendentes</option>
              </select>
            </div>
          </div>

          {/* Students Grid / Table */}
          <div className="glass-panel" style={styles.tablePanel}>
            {filteredStudents.length === 0 ? (
              <div style={styles.emptyState}>
                <p>Nenhum aluno encontrado correspondente aos filtros.</p>
              </div>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeadRow}>
                      <th style={styles.th}>Nome do Aluno</th>
                      <th style={styles.th}>Idade</th>
                      <th style={styles.th}>Modalidade</th>
                      <th style={styles.th}>Atestado Médico</th>
                      <th style={styles.th}>Mensalidade</th>
                      <th style={styles.th}>Frequência</th>
                      <th style={styles.th}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => {
                      const isExpired = student.medicalCertificate === 'Vencido';
                      const isPending = student.medicalCertificate === 'Pendente';
                      
                      return (
                        <tr 
                          key={student.id} 
                          style={styles.tableBodyRow}
                        >
                          <td style={styles.tdName} onClick={() => setSelectedStudent(student)}>
                            <div style={styles.avatarMini}>
                              {student.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p style={styles.studentNameClickable}>{student.name}</p>
                              {student.modality === 'Infantil' && (
                                <span style={styles.respMini}>{student.responsibleName}</span>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>{student.age} anos</td>
                          <td style={styles.td}>
                            <span style={{ 
                              ...styles.modalityBadge, 
                              background: student.modality === 'Infantil' ? 'rgba(0, 245, 212, 0.1)' : 
                                          student.modality === 'Adulta' ? 'rgba(0, 187, 249, 0.1)' : 'rgba(155, 93, 229, 0.1)',
                              color: student.modality === 'Infantil' ? '#00f5d4' : 
                                     student.modality === 'Adulta' ? '#00bbf9' : '#9b5de5'
                            }}>
                              {student.modality}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.medicalWrapper}>
                              {isExpired || isPending ? (
                                <ShieldAlert size={14} color="#f77f00" style={{ marginRight: '4px' }} />
                              ) : (
                                <Check size={14} color="#00f5d4" style={{ marginRight: '4px' }} />
                              )}
                              <span style={{ 
                                color: isExpired || isPending ? '#f77f00' : '#00f5d4',
                                fontWeight: '600'
                              }}>
                                {student.medicalCertificate}
                              </span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span 
                              style={{ 
                                ...styles.paymentBadge, 
                                backgroundColor: student.paymentsStatus === 'Em Dia' ? 'rgba(0, 245, 212, 0.05)' : 'rgba(255, 51, 102, 0.08)',
                                color: student.paymentsStatus === 'Em Dia' ? '#00f5d4' : '#ff3366',
                                border: `1px solid ${student.paymentsStatus === 'Em Dia' ? 'rgba(0,245,212,0.1)' : 'rgba(255,51,102,0.15)'}`
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePayment(student.id);
                              }}
                            >
                              {student.paymentsStatus}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.freqContainer}>
                              <div style={styles.freqBarBg}>
                                <div style={{ ...styles.freqBarFill, width: `${student.frequencyRate}%` }}></div>
                              </div>
                              <span style={styles.freqText}>{student.frequencyRate}%</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <button 
                              style={styles.actionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                              }}
                            >
                              Ver Ficha
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Novo Aluno Form */
        <div className="glass-panel" style={styles.formPanel}>
          <div style={styles.formHeader}>
            <button className="btn-secondary" style={styles.backBtn} onClick={() => setShowAddForm(false)}>
              <ArrowLeft size={16} />
              Voltar
            </button>
            <h2 style={styles.formTitle}>Ficha de Nova Matrícula</h2>
          </div>

          <form onSubmit={handleAddStudentSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome Completo do Aluno</label>
                <input 
                  type="text" 
                  className="custom-input" 
                  placeholder="Nome do aluno" 
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroupRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Idade</label>
                  <input 
                    type="number" 
                    className="custom-input" 
                    placeholder="Idade" 
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Gênero</label>
                  <select 
                    className="custom-select"
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                  >
                    <option value="M" style={{ background: '#0e172c', color: '#f8fafc' }}>Masculino</option>
                    <option value="F" style={{ background: '#0e172c', color: '#f8fafc' }}>Feminino</option>
                    <option value="Outro" style={{ background: '#0e172c', color: '#f8fafc' }}>Outro</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Modalidade</label>
                <select 
                  className="custom-select"
                  value={newStudent.modality}
                  onChange={(e) => setNewStudent({ ...newStudent, modality: e.target.value })}
                >
                  <option value="Infantil" style={{ background: '#0e172c', color: '#f8fafc' }}>Natação Infantil</option>
                  <option value="Adulta" style={{ background: '#0e172c', color: '#f8fafc' }}>Natação Adulta</option>
                  <option value="Hidroginástica" style={{ background: '#0e172c', color: '#f8fafc' }}>Hidroginástica</option>
                </select>
              </div>

              {newStudent.modality === 'Infantil' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nome do Responsável Legal</label>
                    <input 
                      type="text" 
                      className="custom-input" 
                      placeholder="Mãe, pai ou tutor" 
                      value={newStudent.responsibleName}
                      onChange={(e) => setNewStudent({ ...newStudent, responsibleName: e.target.value })}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Telefone do Responsável</label>
                    <input 
                      type="text" 
                      className="custom-input" 
                      placeholder="(DD) 9XXXX-XXXX" 
                      value={newStudent.responsiblePhone}
                      onChange={(e) => setNewStudent({ ...newStudent, responsiblePhone: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {newStudent.modality !== 'Infantil' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Telefone de Contato</label>
                  <input 
                    type="text" 
                    className="custom-input" 
                    placeholder="(DD) 9XXXX-XXXX" 
                    value={newStudent.responsiblePhone}
                    onChange={(e) => setNewStudent({ ...newStudent, responsiblePhone: e.target.value })}
                  />
                </div>
              )}

              <div style={styles.formGroupRow}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Atestado Médico Inicial</label>
                  <select 
                    className="custom-select"
                    value={newStudent.medicalCertificate}
                    onChange={(e) => setNewStudent({ ...newStudent, medicalCertificate: e.target.value })}
                  >
                    <option value="Valido" style={{ background: '#0e172c', color: '#f8fafc' }}>Entregue (Válido)</option>
                    <option value="Pendente" style={{ background: '#0e172c', color: '#f8fafc' }}>Pendente</option>
                  </select>
                </div>
                {newStudent.medicalCertificate === 'Valido' && (
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Vencimento do Atestado</label>
                    <input 
                      type="date" 
                      className="custom-input" 
                      value={newStudent.medicalExpiry}
                      onChange={(e) => setNewStudent({ ...newStudent, medicalExpiry: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-cyan" style={styles.submitBtn}>
              Finalizar Matrícula
            </button>
          </form>
        </div>
      )}

      {/* DETAILED STUDENT MODAL (Ficha do Aluno) */}
      {selectedStudent && (
        <div style={styles.modalOverlay} onClick={() => { setSelectedStudent(null); setReceiptSimulated(false); }}>
          <div className="glass-panel" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{isEditing ? 'Editando Aluno' : 'Ficha Técnica de Matrícula'}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {!isEditing && (
                  <button style={styles.editBtn} onClick={handleStartEdit}>
                    Editar
                  </button>
                )}
                <button style={styles.closeBtn} onClick={() => { setSelectedStudent(null); setReceiptSimulated(false); setIsEditing(false); setEditForm(null); }}>×</button>
              </div>
            </div>

            <div style={styles.modalBody}>
              {/* Profile card summary */}
              <div style={styles.modalProfileCard}>
                <div style={styles.modalAvatar}>
                  {selectedStudent.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={styles.modalProfileDetails}>
                  <h4 style={styles.modalStudentName}>{selectedStudent.name}</h4>
                  <div style={styles.modalMetaRow}>
                    <span style={{ 
                      ...styles.modalityBadge, 
                      background: selectedStudent.modality === 'Infantil' ? 'rgba(0, 245, 212, 0.1)' : 
                                  selectedStudent.modality === 'Adulta' ? 'rgba(0, 187, 249, 0.1)' : 'rgba(155, 93, 229, 0.1)',
                      color: selectedStudent.modality === 'Infantil' ? '#00f5d4' : 
                             selectedStudent.modality === 'Adulta' ? '#00bbf9' : '#9b5de5'
                    }}>
                      {selectedStudent.modality}
                    </span>
                    <span style={styles.modalMetaText}>{selectedStudent.age} anos • {selectedStudent.gender === 'M' ? 'Masculino' : 'Feminino'}</span>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div style={styles.modalGrid}>
                {/* Information Info Panel */}
                <div style={styles.modalInfoPanel}>
                  <h5 style={styles.panelSecTitle}>Informações Gerais</h5>
                  {isEditing && editForm ? (
                    <div style={styles.infoList}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Nome Completo</label>
                        <input type="text" className="custom-input" value={editForm.name} onChange={(e) => handleEditField('name', e.target.value)} />
                      </div>
                      <div style={styles.formGroupRow}>
                        <div style={{ flex: 1 }}>
                          <label style={styles.label}>Idade</label>
                          <input type="number" className="custom-input" value={editForm.age} onChange={(e) => handleEditField('age', parseInt(e.target.value) || 0)} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={styles.label}>Gênero</label>
                          <select className="custom-select" value={editForm.gender} onChange={(e) => handleEditField('gender', e.target.value)}>
                            <option value="M" style={{ background: '#0e172c', color: '#f8fafc' }}>Masculino</option>
                            <option value="F" style={{ background: '#0e172c', color: '#f8fafc' }}>Feminino</option>
                            <option value="Outro" style={{ background: '#0e172c', color: '#f8fafc' }}>Outro</option>
                          </select>
                        </div>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Modalidade</label>
                        <select className="custom-select" value={editForm.modality} onChange={(e) => handleEditField('modality', e.target.value)}>
                          <option value="Infantil" style={{ background: '#0e172c', color: '#f8fafc' }}>Natação Infantil</option>
                          <option value="Adulta" style={{ background: '#0e172c', color: '#f8fafc' }}>Natação Adulta</option>
                          <option value="Hidroginástica" style={{ background: '#0e172c', color: '#f8fafc' }}>Hidroginástica</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Responsável</label>
                        <input type="text" className="custom-input" value={editForm.responsibleName} onChange={(e) => handleEditField('responsibleName', e.target.value)} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Telefone do Responsável</label>
                        <input type="text" className="custom-input" value={editForm.responsiblePhone} onChange={(e) => handleEditField('responsiblePhone', e.target.value)} />
                      </div>
                      <div style={styles.formGroupRow}>
                        <div style={{ flex: 1 }}>
                          <label style={styles.label}>Atestado Médico</label>
                          <select className="custom-select" value={editForm.medicalCertificate} onChange={(e) => handleEditField('medicalCertificate', e.target.value)}>
                            <option value="Valido" style={{ background: '#0e172c', color: '#f8fafc' }}>Válido</option>
                            <option value="Pendente" style={{ background: '#0e172c', color: '#f8fafc' }}>Pendente</option>
                            <option value="Vencido" style={{ background: '#0e172c', color: '#f8fafc' }}>Vencido</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={styles.label}>Vencimento</label>
                          <input type="date" className="custom-input" value={editForm.medicalExpiry || ''} onChange={(e) => handleEditField('medicalExpiry', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                  <div style={styles.infoList}>
                    {selectedStudent.modality === 'Infantil' && (
                      <>
                        <div style={styles.infoRow}>
                          <span style={styles.infoLabel}>Responsável:</span>
                          <span style={styles.infoVal}>{selectedStudent.responsibleName}</span>
                        </div>
                        <div style={styles.infoRow}>
                          <span style={styles.infoLabel}>Telefone:</span>
                          <span style={styles.infoVal}>{selectedStudent.responsiblePhone}</span>
                        </div>
                      </>
                    )}
                    {selectedStudent.modality !== 'Infantil' && selectedStudent.responsiblePhone && (
                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Contato:</span>
                        <span style={styles.infoVal}>{selectedStudent.responsiblePhone}</span>
                      </div>
                    )}
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Matrícula:</span>
                      <span style={styles.infoVal}>{selectedStudent.registrationDate}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Frequência Geral:</span>
                      <span style={styles.infoVal}>{selectedStudent.frequencyRate}%</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Atestado Médico:</span>
                      <span style={{ 
                        ...styles.infoVal,
                        color: selectedStudent.medicalCertificate === 'Valido' ? '#00f5d4' : '#f77f00',
                        fontWeight: '700'
                      }}>
                        {selectedStudent.medicalCertificate} {selectedStudent.medicalExpiry && `(Vence em: ${selectedStudent.medicalExpiry})`}
                      </span>
                    </div>
                  </div>
                  )}

                  {/* Financial simulator */}
                  <h5 style={{ ...styles.panelSecTitle, marginTop: '1.5rem' }}>Mensalidade e Cobrança</h5>
                  <div style={styles.financialBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Status Financeiro:</span>
                      <span style={{ 
                        fontWeight: '700', 
                        color: selectedStudent.paymentsStatus === 'Em Dia' ? '#00f5d4' : '#ff3366' 
                      }}>
                        {selectedStudent.paymentsStatus}
                      </span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Valor Mensal:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ ...styles.infoVal, color: '#00bbf9', fontWeight: 'bold' }}>R$</span>
                        <input
                          type="text"
                          className="custom-input"
                          style={{
                            width: '120px',
                            padding: '0.2rem 0.4rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textAlign: 'right',
                          }}
                          value={(selectedStudent.monthlyFee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            const centavos = parseInt(digits, 10) || 0;
                            handleUpdateMonthlyFee(selectedStudent.id, centavos / 100);
                          }}
                        />
                      </div>
                    </div>

                    <div style={styles.financialActions}>
                      <button 
                        className="btn-secondary" 
                        style={{ ...styles.receiptBtn, flex: 1 }}
                        onClick={() => setReceiptSimulated(true)}
                      >
                        <FileText size={14} style={{ marginRight: '4px' }} />
                        Emitir Recibo
                      </button>
                      <button 
                        className="btn-primary" 
                        style={{ 
                          ...styles.togglePayBtn, 
                          background: selectedStudent.paymentsStatus === 'Em Dia' ? 'rgba(255, 51, 102, 0.1)' : 'linear-gradient(135deg, #00f5d4, #00bbf9)',
                          color: selectedStudent.paymentsStatus === 'Em Dia' ? '#ff3366' : '#080d1a',
                          border: selectedStudent.paymentsStatus === 'Em Dia' ? '1px solid rgba(255, 51, 102, 0.2)' : 'none',
                          boxShadow: 'none'
                        }}
                        onClick={() => handleTogglePayment(selectedStudent.id)}
                      >
                        {selectedStudent.paymentsStatus === 'Em Dia' ? 'Marcar como Atrasado' : 'Registrar Pagamento'}
                      </button>
                    </div>

                    {receiptSimulated && (
                      <div style={styles.receiptOverlay} className="glass-panel">
                        <p style={styles.receiptHeader}>📄 RECIBO DE PAGAMENTO SIMULADO</p>
                        <p style={styles.receiptBody}>
                          Recebemos de <strong>{selectedStudent.name}</strong> a importância de <strong>R$ {(selectedStudent.monthlyFee || 250).toLocaleString('pt-BR')}</strong> referente à mensalidade da modalidade de <strong>{selectedStudent.modality}</strong> na H2O Control Swim Academy.
                        </p>
                        <span style={styles.receiptFooter}>Emitido digitalmente em {new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Turmas Matriculadas e Troca de Turmas */}
                  <h5 style={{ ...styles.panelSecTitle, marginTop: '1.5rem' }}>Turmas e Horários</h5>
                  <div style={styles.financialBox}>
                    {classes.filter(c => c.students.includes(selectedStudent.id)).length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: '0.5rem 0' }}>
                        Aluno não matriculado em nenhuma turma.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {classes.filter(c => c.students.includes(selectedStudent.id)).map(cls => (
                          <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                            <div>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff' }}>{cls.name}</span>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '0.1rem' }}>
                                {cls.time} • {cls.days.join(', ')}
                              </span>
                            </div>
                            <button 
                              type="button" 
                              style={{ 
                                background: 'rgba(255, 51, 102, 0.1)', 
                                border: '1px solid rgba(255, 51, 102, 0.2)', 
                                color: '#ff3366', 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '6px', 
                                fontSize: '0.72rem', 
                                fontWeight: '700', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => handleRemoveFromClass(selectedStudent.id, cls.id)}
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Adicionar a uma nova turma compatível */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <select 
                        className="custom-select"
                        style={{ 
                          flex: 1, 
                          padding: '0.5rem 0.75rem', 
                          fontSize: '0.8rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        id="add-class-select"
                        defaultValue=""
                        onChange={(e) => {
                          const classId = parseInt(e.target.value);
                          if (classId) {
                            handleAddToClass(selectedStudent.id, classId);
                            e.target.value = ""; // reseta
                          }
                        }}
                      >
                        <option value="" style={{ background: '#0d1527', color: '#94a3b8' }}>+ Matricular em outra turma...</option>
                        {classes
                          .filter(c => c.modality === selectedStudent.modality && !c.students.includes(selectedStudent.id))
                          .map(cls => {
                            const spots = cls.maxCapacity - cls.students.length;
                            return (
                              <option 
                                key={cls.id} 
                                value={cls.id} 
                                disabled={spots <= 0}
                                style={{ background: '#0d1527', color: '#ffffff' }}
                              >
                                {cls.name} ({cls.time} - {spots > 0 ? `${spots} vagas` : 'Lotada'})
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Progression visualizer Panel */}
                <div style={styles.modalProgressPanel}>
                  {renderLevelProgression(selectedStudent)}
                  {renderEvaluationPanel(selectedStudent)}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={styles.modalActionsFooter}>
              {isEditing ? (
                <>
                  <button className="btn-primary" style={{ ...styles.modalStatusBtn, background: 'linear-gradient(135deg, #00f5d4, #00bbf9)', color: '#080d1a', border: 'none' }} onClick={handleSaveEdit}>
                    Salvar Alterações
                  </button>
                  <button className="btn-secondary" style={styles.modalStatusBtn} onClick={handleCancelEdit}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn-secondary" 
                    style={{ ...styles.modalStatusBtn, background: selectedStudent.status === 'Ativo' ? 'rgba(255, 51, 102, 0.05)' : 'rgba(0, 245, 212, 0.05)', color: selectedStudent.status === 'Ativo' ? '#ff3366' : '#00f5d4' }}
                    onClick={() => handleToggleStatus(selectedStudent.id)}
                  >
                    {selectedStudent.status === 'Ativo' ? 'Inativar Matrícula' : 'Ativar Matrícula'}
                  </button>

                  <button 
                    style={styles.modalDeleteBtn}
                    onClick={() => handleDeleteStudent(selectedStudent.id)}
                  >
                    <Trash2 size={16} style={{ marginRight: '4px' }} />
                    Excluir Cadastro
                  </button>
                </>
              )}
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
  searchWrapper: {
    flex: 1,
    minWidth: '280px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
  },
  searchInput: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    color: '#ffffff',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    outline: 'none',
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
  },
  filtersGroup: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  tablePanel: {
    padding: '1rem',
    overflow: 'hidden',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  th: {
    fontFamily: 'var(--font-title)',
    padding: '1rem',
    fontSize: '0.82rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableBodyRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    transition: 'background 0.2s',
  },
  tdName: {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  },
  avatarMini: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00bbf9',
    fontWeight: '700',
    fontSize: '0.8rem',
  },
  studentNameClickable: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#ffffff',
    transition: 'color 0.2s',
  },
  respMini: {
    fontSize: '0.72rem',
    color: '#64748b',
    display: 'block',
    marginTop: '0.1rem',
  },
  td: {
    padding: '1rem',
    fontSize: '0.85rem',
    color: '#e2e8f0',
    verticalAlign: 'middle',
  },
  modalityBadge: {
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  medicalWrapper: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.8rem',
  },
  paymentBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  freqContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  freqBarBg: {
    width: '70px',
    height: '6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  freqBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00bbf9, #00f5d4)',
    borderRadius: '3px',
  },
  freqText: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  actionBtn: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#ffffff',
    padding: '0.4rem 0.8rem',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.9rem',
  },

  /* Form Styles */
  formPanel: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
  },
  formTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formGroupRow: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  submitBtn: {
    alignSelf: 'flex-start',
    padding: '0.85rem 2rem',
  },

  /* Modal Styles */
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
    maxWidth: '780px',
    background: 'var(--bg-secondary)',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
    animation: 'float 4s ease-in-out infinite',
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
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.75rem',
    cursor: 'pointer',
    lineHeight: '1',
  },
  modalBody: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 120px)',
  },
  modalProfileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem',
    background: 'rgba(255, 255, 255, 0.015)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
  },
  modalAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #00f5d4, #00bbf9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#080d1a',
    fontWeight: '800',
    fontSize: '1.25rem',
  },
  modalProfileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  modalStudentName: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.35rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  modalMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  modalMetaText: {
    fontSize: '0.82rem',
    color: '#94a3b8',
    fontWeight: '500',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '1.75rem',
  },
  modalInfoPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  panelSecTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '0.4rem',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  infoLabel: {
    color: '#64748b',
    fontWeight: '500',
  },
  infoVal: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  financialBox: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'relative',
  },
  financialActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  receiptBtn: {
    padding: '0.5rem',
    fontSize: '0.75rem',
  },
  togglePayBtn: {
    padding: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  receiptOverlay: {
    padding: '0.85rem',
    background: '#0e172c',
    border: '1px dashed rgba(0, 245, 212, 0.3)',
    borderRadius: '10px',
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  receiptHeader: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#00f5d4',
  },
  receiptBody: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  receiptFooter: {
    fontSize: '0.65rem',
    color: '#64748b',
    alignSelf: 'flex-end',
  },
  modalProgressPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  progressionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  progressionTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  toucasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  toucaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.85rem',
    borderRadius: '10px',
  },
  toucaCircle: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toucaDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  toucaName: {
    fontSize: '0.82rem',
    fontWeight: '600',
  },
  toucaDesc: {
    fontSize: '0.72rem',
    color: '#64748b',
    marginTop: '0.1rem',
    lineHeight: '1.3',
  },
  levelBadgeMini: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modalActionsFooter: {
    padding: '1rem 1.75rem',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    background: 'rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalStatusBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  modalDeleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ff3366',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.2s',
  },
  evalContainer: {
    marginTop: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  evalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'var(--font-title)',
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  evalGuide: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
  evalCriterialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  evalCriterion: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.5rem 0.7rem',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  evalCheckbox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  evalCriterionLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  evalCriterionDesc: {
    fontSize: '0.68rem',
    color: '#64748b',
    marginTop: '0.1rem',
  },
  evalProgressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  evalProgressBg: {
    flex: 1,
    height: '4px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  evalProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00bbf9, #00f5d4)',
    borderRadius: '2px',
    transition: 'width 0.3s',
  },
  evalProgressText: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    fontWeight: '600',
    minWidth: '28px',
    textAlign: 'right',
  },
  evalTextarea: {
    minHeight: '70px',
    resize: 'vertical',
    fontSize: '0.78rem',
    fontStyle: 'italic',
  },
  evalPromoBanner: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  evalPromoBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.65rem 1rem',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #00f5d4, #00bbf9)',
    color: '#080d1a',
    fontFamily: 'var(--font-title)',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    animation: 'pulse-cyan 1.5s infinite',
  },
  editBtn: {
    background: 'rgba(0, 187, 249, 0.1)',
    border: '1px solid rgba(0, 187, 249, 0.2)',
    color: '#00bbf9',
    padding: '0.35rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
