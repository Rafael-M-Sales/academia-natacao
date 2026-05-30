import React from 'react';
import { LayoutDashboard, Users, Calendar, GraduationCap, Waves, ShieldCheck, LogOut, BookOpen, CheckCircle, Map } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', name: 'Alunos', icon: Users },
    { id: 'schedule', name: 'Grade & Chamada', icon: Calendar },
    { id: 'classes', name: 'Turmas', icon: BookOpen },
    { id: 'availability', name: 'Disponibilidade', icon: CheckCircle },
    { id: 'poolmap', name: 'Mapa da Piscina', icon: Map },
    { id: 'pedagogy', name: 'Pedagógico', icon: GraduationCap },
    { id: 'admin', name: 'Administração', icon: ShieldCheck }
  ];

  return (
    <div style={styles.sidebar} className="glass-panel">
      {/* Logo Area */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Waves size={26} color="#00f5d4" style={styles.waveIcon} />
        </div>
        <div style={styles.logoTextContainer}>
          <h1 style={styles.logoTitle}>H2O Control</h1>
          <span style={styles.logoSubtitle}>Swim Academy</span>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>

      {/* Navigation Links */}
      <nav className="sidebar-nav" style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navBtn,
                ...(isActive ? styles.navBtnActive : {})
              }}
            >
              <Icon 
                size={20} 
                color={isActive ? '#080d1a' : '#94a3b8'} 
                style={styles.btnIcon}
              />
              <span style={{
                ...styles.btnText,
                color: isActive ? '#080d1a' : '#f8fafc',
                fontWeight: isActive ? '700' : '500'
              }}>
                {item.name}
              </span>
              {isActive && <div style={styles.activeIndicator}></div>}
            </button>
          );
        })}
      </nav>

      {/* User Info / Footer */}
      <div style={styles.footer}>
        <div style={styles.avatar}>
          {(user?.name || user?.email || 'ADM').slice(0, 3).toUpperCase()}
        </div>
        <div style={{ ...styles.footerText, flex: 1 }}>
          <p style={styles.userName}>{user?.name || 'Coordenador'}</p>
          <p style={styles.userRole}>{user?.email || 'Administrador'}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          title="Sair"
          style={styles.logoutBtn}
          aria-label="Sair"
        >
          <LogOut size={18} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    height: 'calc(100vh - 2rem)',
    margin: '1rem',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.25rem',
  },
  logoIcon: {
    background: 'rgba(0, 245, 212, 0.1)',
    borderRadius: '12px',
    width: '42px',
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(0, 245, 212, 0.15)',
  },
  waveIcon: {
    filter: 'drop-shadow(0 0 4px rgba(0, 245, 212, 0.4))',
  },
  logoTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#f8fafc',
  },
  logoSubtitle: {
    fontSize: '0.75rem',
    color: '#00bbf9',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.05)',
    margin: '1.25rem 0',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.85rem 1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease-in-out',
    textAlign: 'left',
    width: '100%',
  },
  navBtnActive: {
    background: 'linear-gradient(135deg, #00f5d4, #00bbf9)',
    boxShadow: '0 4px 15px rgba(0, 245, 212, 0.25)',
  },
  btnIcon: {
    marginRight: '0.75rem',
    transition: 'color 0.2s',
  },
  btnText: {
    fontFamily: 'var(--font-title)',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  activeIndicator: {
    position: 'absolute',
    right: '8px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#080d1a',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    marginTop: 'auto',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #4361ee, #00bbf9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.8rem',
  },
  footerText: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f8fafc',
  },
  userRole: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '8px',
  },
};
