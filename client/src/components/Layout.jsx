import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 35
          }}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="page-content">
          <Outlet />
        </main>

        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.25rem 1.75rem',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }} className="no-print">
          <div>
            <strong>InvestWise</strong> – Investment Risk & Return Analyzer | Academic College Project Submission
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to="/about" style={{ color: 'var(--text-secondary)' }}>Methodology & Formulas</Link>
            <Link to="/education" style={{ color: 'var(--text-secondary)' }}>Education</Link>
            <Link to="/reports" style={{ color: 'var(--text-secondary)' }}>Reports</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
