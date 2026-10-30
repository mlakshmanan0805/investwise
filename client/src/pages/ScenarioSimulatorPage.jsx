import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Sliders,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../api/client.js';
import { formatINR, formatPercentage } from '../utils/formatters.js';
import { useNotification } from '../context/NotificationContext.jsx';

export default function ScenarioSimulatorPage() {
  const [initialAmount, setInitialAmount] = useState('100000');
  const [annualReturn, setAnnualReturn] = useState('12');
  const [volatility, setVolatility] = useState('8');
  const [durationYears, setDurationYears] = useState('5');
  const [additionalAmount, setAdditionalAmount] = useState('0');
  const [frequency, setFrequency] = useState('none');

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const runSimulation = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await api.simulateScenarios({
        initialAmount: Number(initialAmount),
        annualReturn: Number(annualReturn),
        volatility: Number(volatility),
        durationYears: Number(durationYears),
        additionalAmount: Number(additionalAmount),
        frequency
      });

      if (res.success) {
        setSimulation(res);
      }
    } catch (err) {
      notify(err.message || 'Simulation error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const summary = simulation?.summary || {};
  const progression = simulation?.yearlyProgression || [];

  const barData = [
    {
      scenario: 'Pessimistic (r - σ)',
      value: summary.pessimistic?.finalValue || 0,
      profit: summary.pessimistic?.profitOrLoss || 0,
      rate: `${summary.pessimistic?.annualRate}%`
    },
    {
      scenario: 'Base Case (r)',
      value: summary.baseCase?.finalValue || 0,
      profit: summary.baseCase?.profitOrLoss || 0,
      rate: `${summary.baseCase?.annualRate}%`
    },
    {
      scenario: 'Optimistic (r + σ)',
      value: summary.optimistic?.finalValue || 0,
      profit: summary.optimistic?.profitOrLoss || 0,
      rate: `${summary.optimistic?.annualRate}%`
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Scenario Growth Simulator (What-If Analysis)
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Simulate multi-year capital trajectories under Pessimistic (r − σ), Base Case (r), and Optimistic (r + σ) conditions.
        </p>
      </div>

      {/* Simulator Controls & Scenario Highlight */}
      <div className="grid-2" style={{ gap: '1.75rem', marginBottom: '1.75rem', alignItems: 'start' }}>
        {/* Controls Form Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sliders size={18} color="var(--accent-blue)" />
              <span>Simulation Assumptions</span>
            </h3>
          </div>

          <form onSubmit={runSimulation}>
            <div className="form-group">
              <label className="form-label">Initial Lump-Sum Capital (INR)</label>
              <input
                type="number"
                step="any"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expected Return (r %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Volatility (σ %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={volatility}
                  onChange={(e) => setVolatility(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Horizon Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={durationYears}
                onChange={(e) => setDurationYears(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Periodic Contribution</label>
                <input
                  type="number"
                  step="any"
                  value={additionalAmount}
                  onChange={(e) => setAdditionalAmount(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contribution Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="form-select"
                >
                  <option value="none">None</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Simulating...' : 'Run Scenario Simulation'}
            </button>
          </form>
        </div>

        {/* 3-Scenario Summary Matrix Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--accent-emerald)" />
              <span>Final Projected Capital</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Year {durationYears} Outcome</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Pessimistic */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-input)',
              borderLeft: '4px solid var(--accent-amber)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-amber)', fontSize: '0.9rem' }}>
                  Pessimistic Scenario ({summary.pessimistic?.annualRate}%)
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
                  {formatINR(summary.pessimistic?.finalValue)}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Profit/Loss: {formatINR(summary.pessimistic?.profitOrLoss)} ({formatPercentage(summary.pessimistic?.percentageReturn)})
              </div>
            </div>

            {/* Base Case */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-input)',
              borderLeft: '4px solid var(--accent-blue)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                  Base Case Scenario ({summary.baseCase?.annualRate}%)
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#60A5FA' }}>
                  {formatINR(summary.baseCase?.finalValue)}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Profit/Loss: {formatINR(summary.baseCase?.profitOrLoss)} ({formatPercentage(summary.baseCase?.percentageReturn)})
              </div>
            </div>

            {/* Optimistic */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-input)',
              borderLeft: '4px solid var(--accent-emerald)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                  Optimistic Scenario ({summary.optimistic?.annualRate}%)
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-emerald)' }}>
                  {formatINR(summary.optimistic?.finalValue)}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Profit/Loss: {formatINR(summary.optimistic?.profitOrLoss)} ({formatPercentage(summary.optimistic?.percentageReturn)})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Line Growth Trajectory Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h3 className="card-title">Year-by-Year Growth Trajectories</h3>
          <p className="card-subtitle">Comparative progression from Year 0 to Year {durationYears}</p>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progression} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#94A3B8" label={{ value: 'Holding Year', position: 'insideBottomRight', offset: -5, fill: '#94A3B8' }} />
              <YAxis stroke="#94A3B8" tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(val) => formatINR(val)}
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="pessimistic" name="Pessimistic" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="baseCase" name="Base Case" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="optimistic" name="Optimistic" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="invested" name="Total Invested Capital" stroke="#64748B" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Methodology and Disclaimer Notice */}
      <div style={{
        padding: '1rem 1.25rem',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.8rem',
        color: '#93C5FD'
      }}>
        <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Hypothetical Academic Simulation:</div>
        <div>
          {simulation?.disclaimer || 'Projections represent simplified mathematical models assuming constant annual geometric rates. In real-world capital markets, annual returns fluctuate non-linearly.'}
        </div>
      </div>
    </div>
  );
}
