import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  LayoutDashboard,
  Calculator,
  Briefcase,
  GitCompare,
  ShieldAlert,
  PieChart,
  LineChart,
  History,
  GraduationCap,
  HelpCircle,
  FileText,
  User,
  Info,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { section: 'Overview' },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portfolio', label: 'My Portfolio', icon: Briefcase },
    { to: '/calculator', label: 'Risk & Return Calc', icon: Calculator },
    
    { section: 'Analytics' },
    { to: '/risk-analysis', label: 'Risk Analysis', icon: ShieldAlert },
    { to: '/diversification', label: 'Diversification', icon: PieChart },
    { to: '/compare', label: 'Compare Assets', icon: GitCompare },
    { to: '/simulator', label: 'Scenario Simulator', icon: LineChart },
    { to: '/activities', label: 'Transaction History', icon: History },

    { section: 'Learning & Reports' },
    { to: '/education', label: 'Education Center', icon: GraduationCap },
    { to: '/quiz', label: 'Knowledge Quiz', icon: HelpCircle },
    { to: '/reports', label: 'Portfolio Reports', icon: FileText },
    
    { section: 'System' },
    { to: '/profile', label: 'Profile & Settings', icon: User },
    { to: '/about', label: 'About Project', icon: Info }
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <TrendingUp size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="logo-text">InvestWise</span>
              <span className="logo-badge">ACADEMIC</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Risk & Return Analyzer</div>
          </div>
          {isOpen && (
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="nav-section-title">
                  {item.section}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-badge" style={{ marginBottom: '0.65rem' }}>
              <div className="user-avatar">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <div className="user-name">{user.full_name}</div>
                <div className="user-role">{user.risk_tolerance} Profile</div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary btn-sm" 
              style={{ width: '100%', gap: '0.5rem', color: 'var(--accent-rose)' }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
