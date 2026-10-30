import React from 'react';
import {
  Info,
  Award,
  Code2,
  Database,
  Cpu,
  Layers,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  FileCheck
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          About InvestWise Project
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Comprehensive academic documentation for college examination and evaluation
        </p>
      </div>

      {/* Academic Mission */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
          <Award size={22} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Project Objectives & Academic Scope</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          <strong>InvestWise – Investment Risk and Return Analyzer</strong> was designed and engineered as a capstone college software project. 
          Its core objective is to bridge financial mathematics with modern full-stack web engineering, making abstract theoretical concepts such as 
          <em>exponential compound growth</em>, <em>volatility spreads</em>, <em>Herfindahl-Hirschman concentration (HHI)</em>, and 
          <em>multi-factor risk attribution</em> interactive, tangible, and visually intuitive.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Unlike static prototypes, this application incorporates a persistent local SQLite database, parameterized SQL queries, password hashing with bcrypt, 
          session authentication via JWT, dynamic Recharts visualizations, and 24 automated unit and API integration tests.
        </p>
      </div>

      {/* Technology Stack Grid */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Code2 size={20} color="var(--accent-blue)" />
          <span>Technology Architecture</span>
        </h3>

        <div className="grid-2" style={{ gap: '1.25rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--accent-emerald)' }}>Frontend Client</strong>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              <li><strong>React 18</strong> with functional components and custom hooks</li>
              <li><strong>Vite 5</strong> for high-speed local bundling and HMR</li>
              <li><strong>React Router 6</strong> for protected client-side route navigation</li>
              <li><strong>Recharts</strong> for responsive Pie, Bar, Scatter, and Line charts</li>
              <li><strong>Lucide React</strong> for modern SVG financial iconography</li>
              <li>Custom CSS design system with CSS custom properties & print styles</li>
            </ul>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--accent-blue)' }}>Backend Server & Database</strong>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              <li><strong>Node.js (v24)</strong> runtime environment</li>
              <li><strong>Express.js</strong> REST API with centralized error handling</li>
              <li><strong>SQLite (node:sqlite)</strong> for local zero-dependency persistence</li>
              <li><strong>bcryptjs</strong> for salt-hashed password security</li>
              <li><strong>jsonwebtoken (JWT)</strong> for stateless bearer authentication</li>
              <li><strong>Supertest & Node:Test</strong> for automated test validation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Financial Formulas Reference */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={20} color="var(--accent-amber)" />
          <span>Core Mathematical Formulas Implemented</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
          <div>
            <strong>Future Value (Annual Compounding):</strong>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
              FV = P × (1 + r / 100)^n
            </div>
          </div>

          <div>
            <strong>Volatility Illustrative Scenario Bounds:</strong>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
              Lower = P × max(0, 1 + (r − σ) / 100)^n &nbsp;|&nbsp; Upper = P × max(0, 1 + (r + σ) / 100)^n
            </div>
          </div>

          <div>
            <strong>Herfindahl-Hirschman Index (Concentration):</strong>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
              HHI = Σ (s_i)^2 &nbsp;|&nbsp; Effective Holdings = 1 / HHI
            </div>
          </div>

          <div>
            <strong>4-Factor Risk Score:</strong>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
              Score = (Volatility × 40%) + (Asset Category × 25%) + (Duration × 15%) + (Concentration × 20%)
            </div>
          </div>
        </div>
      </div>

      {/* Limitations and Future Roadmap */}
      <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color="var(--accent-amber)" />
          <span>Known Academic Limitations & Future Enhancements</span>
        </h3>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>1. Model Limitations:</strong> Standard compound formulas assume static geometric growth and constant annual volatility. 
            Real financial markets experience fat-tailed distributions, volatility clustering (GARCH models), black swan crashes, and non-constant correlation matrices.
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>2. Educational Purpose:</strong> This application does not constitute professional wealth advisory or investment solicitation.
          </p>
          <p>
            <strong>3. Future Scope:</strong> Integration of Monte Carlo stochastic simulations (Geometric Brownian Motion), covariance matrix-based Markowitz Efficient Frontier optimization, and automated tax liability calculators (LTCG / STCG).
          </p>
        </div>
      </div>
    </div>
  );
}

