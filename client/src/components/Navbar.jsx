import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, PlusCircle, Shield, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Map route to readable page title
  const titleMap = {
    '/dashboard': 'Portfolio Dashboard',
    '/portfolio': 'Portfolio Holdings',
    '/calculator': 'Risk and Return Calculator',
    '/risk-analysis': 'Risk Assessment Engine',
    '/diversification': 'Diversification Analysis (HHI)',
    '/compare': 'Multi-Asset Comparison',
    '/simulator': 'Scenario Growth Simulator',
    '/activities': 'Transaction & Valuation History',
    '/education': 'Investment Education Center',
    '/quiz': 'Financial Knowledge Quiz',
    '/reports': 'Portfolio Performance Reports',
    '/profile': 'Profile & Account Settings',
    '/about': 'About InvestWise Project'
  };

  const currentTitle = titleMap[location.pathname] || 'InvestWise';

  return (
    <header className="top-navbar no-print">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuToggle}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.4rem', display: 'flex', alignItems: 'center' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {currentTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/calculator" className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          <span>New Calculation</span>
        </Link>

        <Link to="/reports" className="btn btn-secondary btn-sm">
          <FileText size={15} />
          <span>Report</span>
        </Link>

        {user && (
          <Link 
            to="/profile" 
            className="user-badge" 
            style={{ padding: '0.35rem 0.65rem', cursor: 'pointer', textDecoration: 'none' }}
            title="Profile & Settings"
          >
            <div className="user-avatar" style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}>
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {user.full_name?.split(' ')[0]}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
