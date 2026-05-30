import { useState } from 'react';
import {
  Users, CreditCard, CalendarCheck2, Phone, Wallet, FileText, Upload,
  Briefcase, Sparkles, Receipt,
} from 'lucide-react';
import PaymentGateway from './PaymentGateway';
import Reports from '../pages/Reports';
import DataImportPanel from './DataImportPanel';
import FinancialTab from './admin/FinancialTab';
import StaffTab from './admin/StaffTab';
import AttendanceTab from './admin/AttendanceTab';
import ResponsiblesTab from './admin/ResponsiblesTab';
import NfseTab from './admin/NfseTab';

const TOAST_DURATION = 4000;

function Toast({ message }) {
  return (
    <div style={toastStyles.container} className="glass-panel">
      <Sparkles size={18} color="#00f5d4" style={{ marginRight: '8px', flexShrink: 0 }} />
      <span style={toastStyles.text}>{message}</span>
    </div>
  );
}

export default function AdminPanel({
  students, setStudents, classes, setClasses,
  employees, setEmployees, employeePresence, setEmployeePresence,
  presenceHistory, setPresenceHistory,
  apiConnected = false, demoMode = false,
}) {
  const [adminTab, setAdminTab] = useState('financial');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), TOAST_DURATION);
  };

  const handleRegisterPayment = (studentId, studentName) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, paymentsStatus: 'Em Dia' } : s));
    triggerToast(`Pagamento do aluno ${studentName} registrado com sucesso! status: EM DIA.`);
  };

  const handleBulkBilling = () => {
    const overdue = students.filter(s => s.status === 'Ativo' && s.paymentsStatus === 'Atrasado');
    if (overdue.length === 0) {
      triggerToast('Nenhum aluno em atraso no momento!');
      return;
    }
    triggerToast(`Lembretes de vencimento enviados para todos os ${overdue.length} responsáveis inadimplentes via WhatsApp!`);
  };

  const handleSingleBilling = (responsibleName, responsiblePhone) => {
    triggerToast(`Alerta de cobrança enviado para ${responsibleName} (${responsiblePhone}) via WhatsApp!`);
  };

  const handleToggleEmployeePresence = (employeeId, empName) => {
    setEmployeePresence(prev => prev.map(p => {
      if (p.employeeId !== employeeId) return p;
      const newStatus = p.status === 'Presente' ? 'Falta' : 'Presente';
      triggerToast(`Status de presença de ${empName} alterado para: ${newStatus.toUpperCase()}`);
      setEmployees(prevEmp => prevEmp.map(e => {
        if (e.id !== employeeId) return e;
        const rate = newStatus === 'Presente'
          ? Math.min(100, Math.round((e.attendanceRate * 30 + 100) / 31))
          : Math.max(0, Math.round((e.attendanceRate * 30) / 31));
        return { ...e, attendanceRate: rate };
      }));
      return { ...p, status: newStatus };
    }));
  };

  const handleAddEmployee = ({ name, role, salary, phone }) => {
    const nextId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees(prev => [...prev, { id: nextId, name, role, salary: parseFloat(salary), phone, status: 'Ativo', attendanceRate: 100 }]);
    setEmployeePresence(prev => [...prev, { employeeId: nextId, date: new Date().toISOString().split('T')[0], status: 'Presente' }]);
    triggerToast(`Funcionário(a) ${name} cadastrado(a) com sucesso como ${role}!`);
  };

  const handleDeleteEmployee = (employeeId, empName) => {
    if (window.confirm(`Tem certeza de que deseja desligar/excluir o(a) colaborador(a) ${empName}?`)) {
      setEmployees(prev => prev.filter(e => e.id !== employeeId));
      setEmployeePresence(prev => prev.filter(p => p.employeeId !== employeeId));
      triggerToast(`Colaborador(a) ${empName} foi desligado(a) e removido(a) do sistema.`);
    }
  };

  const navItems = [
    { id: 'financial', label: 'Financeiro & Inadimplência', icon: CreditCard },
    { id: 'staff', label: 'Funcionários & Equipe', icon: Users },
    { id: 'attendance', label: 'Frequência Geral', icon: CalendarCheck2 },
    { id: 'responsibles', label: 'Responsáveis & Contatos', icon: Phone },
    { id: 'nfse', label: 'e-Nota (NFS-e)', icon: Receipt },
    { id: 'payments', label: 'Formas de Pagamentos', icon: Wallet },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'import', label: 'Importar NATAÇÃO', icon: Upload },
  ];

  return (
    <div style={containerStyles}>
      {showToast && <Toast message={toastMessage} />}

      <div className="page-header">
        <div>
          <h2 className="page-title">Painel Administrativo & Relatórios</h2>
          <p className="page-subtitle">Acompanhe finanças, inadimplência, equipe de funcionários, frequência geral e contatos.</p>
        </div>
        <div style={headerBadgeStyles}>
          <Briefcase size={16} color="#00f5d4" />
          <span style={headerBadgeTextStyles}>Gestão Corporativa</span>
        </div>
      </div>

      <div style={navStyles} className="glass-panel">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setAdminTab(id)}
            style={{ ...navBtnStyles, ...(adminTab === id ? navBtnActiveStyles : {}) }}
          >
            <Icon size={18} style={{ marginRight: '8px' }} />
            {label}
          </button>
        ))}
      </div>

      {adminTab === 'financial' && (
        <FinancialTab
          students={students}
          onRegisterPayment={handleRegisterPayment}
          onBulkBilling={handleBulkBilling}
          onSingleBilling={handleSingleBilling}
        />
      )}

      {adminTab === 'staff' && (
        <StaffTab
          employees={employees}
          employeePresence={employeePresence}
          onAddEmployee={handleAddEmployee}
          onTogglePresence={handleToggleEmployeePresence}
          onDeleteEmployee={handleDeleteEmployee}
        />
      )}

      {adminTab === 'attendance' && (
        <AttendanceTab students={students} presenceHistory={presenceHistory} />
      )}

      {adminTab === 'responsibles' && (
        <ResponsiblesTab students={students} onSingleBilling={handleSingleBilling} />
      )}

      {adminTab === 'nfse' && (
        <div style={tabContentStyles}>
          <NfseTab students={students} />
        </div>
      )}

      {adminTab === 'payments' && (
        <div style={tabContentStyles}><PaymentGateway /></div>
      )}

      {adminTab === 'reports' && (
        <div style={tabContentStyles}><Reports /></div>
      )}

      {adminTab === 'import' && (
        <div style={tabContentStyles}>
          <DataImportPanel
            students={students} classes={classes}
            setStudents={setStudents} setClasses={setClasses}
            apiConnected={apiConnected} demoMode={demoMode}
          />
        </div>
      )}
    </div>
  );
}

const containerStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  animation: 'fadeIn 0.5s ease-in-out',
};

const headerBadgeStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'rgba(0, 245, 212, 0.05)',
  border: '1px solid rgba(0, 245, 212, 0.15)',
  padding: '0.5rem 1rem',
  borderRadius: '20px',
};

const headerBadgeTextStyles = {
  fontFamily: 'var(--font-title)',
  fontSize: '0.85rem',
  color: '#00f5d4',
  fontWeight: '600',
};

const navStyles = {
  display: 'flex',
  gap: '0.5rem',
  padding: '0.5rem',
  borderRadius: '16px',
  flexWrap: 'wrap',
};

const navBtnStyles = {
  display: 'flex',
  alignItems: 'center',
  padding: '0.75rem 1.25rem',
  borderRadius: '10px',
  border: 'none',
  background: 'transparent',
  color: '#94a3b8',
  cursor: 'pointer',
  fontFamily: 'var(--font-title)',
  fontSize: '0.9rem',
  fontWeight: '600',
  transition: 'all 0.2s ease',
};

const navBtnActiveStyles = {
  background: 'rgba(255, 255, 255, 0.05)',
  color: '#00f5d4',
  boxShadow: '0 2px 10px rgba(0, 245, 212, 0.08)',
};

const tabContentStyles = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const toastStyles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 10px 30px rgba(0, 245, 212, 0.15)',
    animation: 'slideIn 0.3s ease-out',
    maxWidth: '350px',
  },
  text: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.85rem',
    color: '#f8fafc',
    fontWeight: '600',
    lineHeight: '1.3',
  },
};
