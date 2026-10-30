import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sliders,
  Layers,
  Info,
  Clock,
  PieChart,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { api } from '../api/client.js';
import { formatPercentage } from '../utils/formatters.js';
import { useNotification } from '../context/NotificationContext.jsx';

export default function RiskAnalysisPage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    async function loadRisk() {
      try {
        const res = await api.getRiskAnalysis();
        if (res.success) {
          setRiskData(res);
        }
      } catch (err) {
        notify(err.message || 'Failed to load risk analysis', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadRisk();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Evaluating 4-factor risk scoring engine...</p>
      </div>
    );
  }

  const {
    overallRiskScore = 0,
    overallRiskLevel = 'No Data',
    weightedVolatility = 0,
    userTolerance = 'Moderate',
    alignment = {},
    investments = [],
    disclaimer
  } = riskData || {};

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Portfolio Risk Assessment Engine
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Deterministic multi-factor risk attribution modeling across asset volatility, category weights, time horizon, and concentration.
        </p>
      </div>

      {/* Alignment Banner */}
      <div style={{
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid',
        borderColor: alignment.isAligned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)',
        backgroundColor: alignment.isAligned ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: alignment.isAligned ? 'var(--accent-emerald-light)' : 'var(--accent-amber-light)',
          color: alignment.isAligned ? 'var(--accent-emerald)' : 'var(--accent-amber)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {alignment.isAligned ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            User Preference vs. Calculated Risk Alignment
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {alignment.message}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stated Profile</div>
          <span className="badge badge-blue">{userTolerance}</span>
        </div>
      </div>

      {/* Top Cards: Overall Score & Weighted Factors */}
      <div className="grid-2" style={{ gap: '1.75rem', marginBottom: '1.75rem' }}>
        {/* Overall Score Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card-header">
            <h3 className="card-title">
              <ShieldAlert size={20} color="var(--accent-amber)" />
              <span>Overall Portfolio Risk Score</span>
            </h3>
            <span className={`badge ${overallRiskLevel === 'Low Risk' ? 'badge-emerald' : overallRiskLevel === 'Moderate Risk' ? 'badge-amber' : 'badge-rose'}`}>
              {overallRiskLevel}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0 1.25rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
              {overallRiskScore}
            </span>
            <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 5.0</span>
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-input)', borderRadius: '5px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{
              width: `${(overallRiskScore / 5) * 100}%`,
              height: '100%',
              backgroundColor: overallRiskLevel === 'Low Risk' ? 'var(--accent-emerald)' : overallRiskLevel === 'Moderate Risk' ? 'var(--accent-amber)' : 'var(--accent-rose)',
              transition: 'width 0.5s ease'
            }} />
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Score is computed via deterministic weighted aggregation: 40% Volatility, 25% Asset Class, 15% Duration, 20% Concentration.
          </p>
        </div>

        {/* 4-Factor Weights Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={18} color="var(--accent-blue)" />
              <span>Attribution Factor Weights</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>1. Annual Volatility (Weight: 40%)</span>
                <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>Weighted σ = {weightedVolatility}%</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Measures dispersion and price variance.</div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>2. Asset Category Risk (Weight: 25%)</span>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>Fixed Debt (1) → Crypto (5)</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inherent structural risk of the asset class.</div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>3. Investment Horizon / Duration (Weight: 15%)</span>
                <span style={{ color: 'var(--accent-indigo)', fontWeight: 700 }}>Longer (1) → &lt;1 Year (3)</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shorter timeframes leave less buffer for drawdown recovery.</div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>4. Portfolio Concentration (Weight: 20%)</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Diversified (1) → Concentrated (5)</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Single-holding dominance amplifies idiosyncratic risk.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Holdings Risk Breakdown Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Holdings Risk Evaluation</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Factor scores and specific risk mitigation recommendations per asset</p>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Holding</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Volatility</th>
                <th style={{ textAlign: 'center' }}>Time Horizon</th>
                <th style={{ textAlign: 'center' }}>Risk Score</th>
                <th>Primary Risk Drivers & Recommendations</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inv.name}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.category}</span>
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--accent-amber)', fontWeight: 600 }}>
                    {inv.volatility}%
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {inv.durationYears} yrs
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge badge-${inv.badgeColor}`}>
                      {inv.overallScore} / 5
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {inv.riskDrivers?.join(' ')}
                    </div>
                    {inv.suggestions && inv.suggestions.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                        💡 <em>{inv.suggestions[0]}</em>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Model Disclaimer */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.8rem',
        color: '#93C5FD'
      }}>
        <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Academic Methodology Notice:</strong> {disclaimer}
          <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)' }}>
            Remember: An aggressive risk tolerance preference does not reduce the statistical volatility or capital hazard of a high-risk security.
          </div>
        </div>
      </div>
    </div>
  );
}
