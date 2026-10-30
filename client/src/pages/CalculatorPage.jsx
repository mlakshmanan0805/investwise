import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  AlertTriangle,
  Info,
  Save,
  CheckCircle2,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client.js';
import { formatINR, formatPercentage } from '../utils/formatters.js';
import HowCalculatedModal from '../components/HowCalculatedModal.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CalculatorPage() {
  const [name, setName] = useState('Nifty Index Growth Option');
  const [initialAmount, setInitialAmount] = useState('100000');
  const [annualReturn, setAnnualReturn] = useState('12');
  const [durationYears, setDurationYears] = useState('5');
  const [volatility, setVolatility] = useState('15');
  const [category, setCategory] = useState('Index Funds');
  const [additionalAmount, setAdditionalAmount] = useState('0');
  const [frequency, setFrequency] = useState('none');
  const [riskTolerance, setRiskTolerance] = useState('Moderate');

  const [results, setResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const { notify } = useNotification();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Validate inputs locally before sending
  const validate = () => {
    const errs = [];
    const pAmount = Number(initialAmount);
    const pReturn = Number(annualReturn);
    const pDur = Number(durationYears);
    const pVol = Number(volatility);
    const pAdd = Number(additionalAmount);

    if (isNaN(pAmount) || !isFinite(pAmount) || pAmount <= 0) {
      errs.push('Initial investment amount must be a positive number greater than zero.');
    }
    if (isNaN(pDur) || !isFinite(pDur) || pDur <= 0) {
      errs.push('Investment duration must be a positive number greater than zero.');
    }
    if (isNaN(pVol) || !isFinite(pVol) || pVol < 0) {
      errs.push('Annual volatility percentage cannot be negative.');
    }
    if (isNaN(pReturn) || !isFinite(pReturn)) {
      errs.push('Expected annual return rate must be a valid number.');
    } else if (pReturn < -100 || pReturn > 1000) {
      errs.push('Expected return must be within -100% and 1000%.');
    }
    if (isNaN(pAdd) || !isFinite(pAdd) || pAdd < 0) {
      errs.push('Additional contribution amount cannot be negative.');
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setCalculating(true);
    try {
      const res = await api.calculate({
        initialAmount: Number(initialAmount),
        annualReturn: Number(annualReturn),
        durationYears: Number(durationYears),
        volatility: Number(volatility),
        category,
        additionalAmount: Number(additionalAmount),
        frequency
      });

      if (res.success) {
        setResults(res.results);
      }
    } catch (err) {
      setErrors([err.message || 'Calculation error']);
    } finally {
      setCalculating(false);
    }
  };

  // Run calculation on initial load
  React.useEffect(() => {
    handleCalculate();
  }, []);

  const handleSaveToPortfolio = async () => {
    if (!isAuthenticated) {
      notify('Please log in to save investments to your personal portfolio.', 'warning');
      navigate('/login');
      return;
    }

    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim() || 'Custom Investment',
        asset_category: category,
        initial_amount: Number(initialAmount),
        expected_return: Number(annualReturn),
        expected_volatility: Number(volatility),
        duration_years: Number(durationYears),
        risk_tolerance: riskTolerance,
        notes: `Calculated with ${frequency !== 'none' ? `additional Rs ${additionalAmount} (${frequency})` : 'lump sum'}`
      };

      const res = await api.addInvestment(payload);
      if (res.success) {
        notify('Investment successfully added to your portfolio!', 'success');
        navigate('/portfolio');
      }
    } catch (err) {
      notify(err.message || 'Failed to save investment', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Investment Risk and Return Calculator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Evaluate simple interest, exponential compound future value, and volatility-based illustrative scenario bands.
        </p>
      </div>

      {errors.length > 0 && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--accent-rose-light)',
          border: '1px solid var(--accent-rose)',
          borderRadius: 'var(--radius-md)',
          color: '#FCA5A5',
          fontSize: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={16} /> Validation Alerts:
          </div>
          <ul style={{ paddingLeft: '1.25rem' }}>
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="grid-2" style={{ gap: '1.75rem', alignItems: 'start' }}>
        {/* Input Parameters Form Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calculator size={18} color="var(--accent-emerald)" />
              <span>Investment Parameters</span>
            </h3>
          </div>

          <form onSubmit={handleCalculate}>
            <div className="form-group">
              <label className="form-label">Investment Name / Instrument</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nifty 50 Index Fund"
                className="form-input"
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Initial Amount (INR)</label>
                <input
                  type="number"
                  step="any"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  placeholder="100000"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asset Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="Fixed Deposit">Fixed Deposit</option>
                  <option value="Government Bonds">Government Bonds</option>
                  <option value="Corporate Bonds">Corporate Bonds</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Equity">Equity</option>
                  <option value="Index Funds">Index Funds</option>
                  <option value="Gold">Gold</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Cryptocurrency">Cryptocurrency</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Expected Annual Return (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(e.target.value)}
                  placeholder="12.0"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Volatility (σ %)</label>
                <input
                  type="number"
                  step="0.01"
                  value={volatility}
                  onChange={(e) => setVolatility(e.target.value)}
                  placeholder="15.0"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Duration (Years)</label>
                <input
                  type="number"
                  step="0.1"
                  value={durationYears}
                  onChange={(e) => setDurationYears(e.target.value)}
                  placeholder="5"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Risk Tolerance Profile</label>
                <select
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value)}
                  className="form-select"
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>
            </div>

            {/* Optional Recurring Contributions */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '0.65rem' }}>
                Optional Recurring Contribution (SIP)
              </div>
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div>
                  <label className="form-label">Additional Amount (INR)</label>
                  <input
                    type="number"
                    step="any"
                    value={additionalAmount}
                    onChange={(e) => setAdditionalAmount(e.target.value)}
                    placeholder="0"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="form-select"
                  >
                    <option value="none">None (Lump Sum Only)</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={calculating}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {calculating ? 'Computing...' : 'Recalculate Projections'}
              </button>

              <button
                type="button"
                onClick={handleSaveToPortfolio}
                disabled={saving}
                className="btn btn-secondary"
                style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save to Portfolio'}</span>
              </button>
            </div>
          </form>

          {/* Expandable Explanation Section */}
          <HowCalculatedModal />
        </div>

        {/* Results Display Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--accent-blue)" />
              <span>Projected Outcomes</span>
            </h3>
            {results?.riskScoring && (
              <span className={`badge badge-${results.riskScoring.badgeColor}`}>
                {results.riskScoring.riskLevel} ({results.riskScoring.overallScore}/5)
              </span>
            )}
          </div>

          {results ? (
            <div>
              {/* Highlight Box */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Compounded Future Value
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatINR(results.compoundFutureValue)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Expected Gain / Loss
                  </div>
                  <div style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: results.expectedProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                  }}>
                    {formatINR(results.expectedProfit)} ({formatPercentage(results.totalPercentageReturn)})
                  </div>
                </div>
              </div>

              {/* Core Metrics Table */}
              <table className="table" style={{ marginBottom: '1.5rem' }}>
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>Total Capital Invested</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(results.totalInvested)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>Simple Annual Return (Yearly Nominal)</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(results.simpleAnnualReturn)} / yr</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>Cumulative Simple Return (Non-Compounded)</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(results.totalSimpleReturn)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>Total Compounding Advantage</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                      +{formatINR(Math.max(0, results.compoundFutureValue - (results.totalInvested + results.totalSimpleReturn)))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Volatility Risk Range Box */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Shield size={16} color="var(--accent-amber)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Illustrative Volatility Risk Range (±{volatility}%)
                  </span>
                </div>

                <div className="grid-2" style={{ gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lower Estimate (r − σ)</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      {formatINR(results.volatilityRange.lowerEstimate)}
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upper Estimate (r + σ)</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {formatINR(results.volatilityRange.upperEstimate)}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {results.volatilityRange.disclaimer}
                </p>
              </div>

              {/* Regulatory & Academic Disclaimer */}
              <div style={{
                display: 'flex',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: '#FDE68A',
                lineHeight: 1.4
              }}>
                <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-amber)' }} />
                <div>
                  <strong>Important Distinction:</strong> Expected return is an estimated mathematical expectation based on historical assumptions or models. 
                  It is not a guaranteed payout. Market volatility, drawdowns, and capital loss can occur.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Enter parameters and click "Recalculate Projections" to evaluate returns.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
