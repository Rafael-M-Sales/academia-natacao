import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentsList from './components/StudentsList';
import ScheduleView from './components/ScheduleView';
import PedagogyView from './components/PedagogyView';
import AdminPanel from './components/AdminPanel';
import ClassesManagement from './components/ClassesManagement';
import AvailabilityChecker from './components/AvailabilityChecker';
import PoolMap from './components/PoolMap';
import Login from './components/Login';
import TeacherMobile from './pages/TeacherMobile';
import { useAuth } from './context/AuthContext';
import { useAcademyData } from './hooks/useAcademyData';
import { DEMO_MODE } from './config';

function AppShell() {
  const { isAuthenticated, loading: authLoading, demoMode } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    students, setStudents,
    classes, setClasses,
    presenceHistory, setPresenceHistory,
    employees, setEmployees,
    employeePresence, setEmployeePresence,
    liveSessions, pedagogyNotes,
    dataLoading, apiConnected,
    filterPendingMedicalFromDash, setFilterPendingMedicalFromDash,
    isProfessor,
  } = useAcademyData();

  if (isProfessor) {
    return (
      <TeacherMobile
        employees={employees}
        onExit={() => {
          window.location.hash = '';
        }}
      />
    );
  }

  const handleNavigateToTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'students') setFilterPendingMedicalFromDash(false);
  };

  if (authLoading) {
    return (
      <div className="login-screen">
        <p style={{ color: '#94a3b8' }}>Carregando…</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  if (dataLoading) {
    return (
      <div className="login-screen">
        <p style={{ color: '#94a3b8' }}>Carregando dados da academia…</p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            students={students}
            classes={classes}
            liveSessions={liveSessions}
            pedagogyNotes={pedagogyNotes}
            presenceHistory={presenceHistory}
            onNavigateToTab={handleNavigateToTab}
            onFilterPendingMedical={() => setFilterPendingMedicalFromDash(true)}
            employees={employees}
          />
        );
      case 'students':
        return <StudentsList students={students} setStudents={setStudents} classes={classes} setClasses={setClasses} initialFilterPendingMedical={filterPendingMedicalFromDash} />;
      case 'schedule':
        return (
          <ScheduleView
            classes={classes}
            students={students}
            presenceHistory={presenceHistory}
            setPresenceHistory={setPresenceHistory}
            employees={employees}
          />
        );
      case 'pedagogy':
        return <PedagogyView students={students} pedagogyNotes={pedagogyNotes} />;
      case 'admin':
        return (
          <AdminPanel
            students={students}
            setStudents={setStudents}
            classes={classes}
            setClasses={setClasses}
            employees={employees}
            setEmployees={setEmployees}
            employeePresence={employeePresence}
            setEmployeePresence={setEmployeePresence}
            presenceHistory={presenceHistory}
            setPresenceHistory={setPresenceHistory}
            apiConnected={apiConnected}
            demoMode={demoMode || DEMO_MODE}
          />
        );
      case 'classes':
        return <ClassesManagement classes={classes} setClasses={setClasses} students={students} employees={employees} />;
      case 'availability':
        return <AvailabilityChecker classes={classes} students={students} employees={employees} />;
      case 'poolmap':
        return (
          <PoolMap
            students={students}
            classes={classes}
            apiConnected={apiConnected}
          />
        );
      default:
        return (
          <Dashboard
            students={students}
            classes={classes}
            liveSessions={liveSessions}
            pedagogyNotes={pedagogyNotes}
            presenceHistory={presenceHistory}
            onNavigateToTab={handleNavigateToTab}
            onFilterPendingMedical={() => setFilterPendingMedicalFromDash(true)}
            employees={employees}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={handleNavigateToTab} />
      <main className="main-content">
        {(demoMode || DEMO_MODE) && (
          <div className="api-banner" style={{ borderColor: 'rgba(0, 187, 249, 0.35)', color: '#00bbf9' }}>
            Modo demonstração: sem API — use localmente para apresentação completa.
          </div>
        )}
        {!demoMode && !DEMO_MODE && !apiConnected && (
          <div className="api-banner">
            API offline — execute <code>npm run server</code> na porta 5000.
          </div>
        )}
        {apiConnected && (
          <div className="api-banner api-banner-ok">
            Sistema conectado · PostgreSQL · atualização em tempo real ativa
          </div>
        )}
        {renderActiveView()}
      </main>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
