import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  BarChart2,
  TrendingUp,
  ShieldAlert,
  Info,
  CheckSquare,
  Square,
  RefreshCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { api } from '../api/client.js';
import { formatINR, formatPercentage } from '../utils/formatters.js';
import { useNotification } from '../context/NotificationContext.jsx';

export default function ComparisonPage() {
  const [investments, setInvestments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  const { notify } = useNotification();

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const res = await api.getInvestments();
        if (res.success && res.investments) {
          setInvestments(res.investments);
          // Auto-select first 2-3 investments if available
          if (res.investments.length >= 2) {
            const initialSelection = res.investments.slice(0, 3).map(i => i.id);
            setSelectedIds(initialSelection);
            runComparison(initialSelection);
          }
        }
      } catch (err) {
        notify(err.message || 'Failed to load portfolio for comparison', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, []);

  const runComparison = async (ids) => {
    if (ids.length < 2 || ids.length > 4) {
      notify('Please select between 2 and 4 investments to compare.', 'warning');
      return;
    }

    setComparing(true);
    try {
      const res = await api.compareInvestments({ investmentIds: ids });
      if (res.success) {
        setComparisonData(res);
      }
    } catch (err) {
      notify(err.message || 'Comparison failed', 'error');
    } finally {
      setComparing(false);
    }
  };

  const toggleSelect = (id) => {
    let next;
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        notify('A minimum of 2 investments are required for comparative analysis.', 'info');
        return;
      }
      next = selectedIds.filter(item => item !== id);
    } else {
      if (selectedIds.length >= 4) {
        notify('You can compare a maximum of 4 investments simultaneously.', 'warning');
        return;
      }
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    runComparison(next);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading asset comparison matrix...</p>
      </div>
    );
  }

  if (investments.length < 2) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <GitCompare size={42} style={{ color: 'var(--accent-blue)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Insufficient Holdings for Comparison
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
          The comparison module requires at least 2 distinct investment options to evaluate risk-return trade-offs side by side.
        </p>
        <button
          onClick={async () => {
            await api.loadSamplePortfolio();
            window.location.reload();
          }}
          className="btn btn-primary btn-sm"
        >
          Load 5 Sample Holdings Now
        </button>
      </div>
    );
  }

  const comparisonList = comparisonData?.comparison || [];
  const chartData = comparisonList.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 13) + '...' : item.name,
    fullName: item.name,
    futureValue: item.futureValue,
    initialAmount: item.initialAmount,
    expectedProfit: item.expectedProfit
  }));

  const scatterData = comparisonList.map(item => ({
    name: item.name,
    volatility: item.volatility,
    annualReturn: item.annualReturn,
    amount: item.initialAmount
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Multi-Asset Risk & Return Comparison
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Evaluate projected capital growth, volatility spreads, and risk-adjusted trade-offs side by side.
        </p>
      </div>

      {/* Asset Selection Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckSquare size={16} color="var(--accent-emerald)" />
          <span>Select Holdings to Compare (Choose 2 to 4):</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {investments.map(inv => {
            const isSelected = selectedIds.includes(inv.id);
            return (
              <button
                key={inv.id}
                onClick={() => toggleSelect(inv.id)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '9999px', padding: '0.4rem 0.85rem' }}
              >
                {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                <span>{inv.name}</span>
                <span style={{ opacity: 0.8, fontSize: '0.75rem' }}>({inv.asset_category})</span>
              </button>
            );
          })}
        </div>
      </div>

      {comparing ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Comparing asset profiles...</p>
        </div>
      ) : (
        <>
          {/* Side-by-Side Comparison Matrix Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.75rem' }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Metric / Feature</th>
                    {comparisonList.map(item => (
                      <th key={item.id} style={{ textAlign: 'right', minWidth: '180px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
                        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Initial Principal Investment</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatINR(item.initialAmount)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Expected Annual Return</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                        {formatPercentage(item.annualReturn)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Annual Volatility (σ)</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right', color: 'var(--accent-amber)', fontWeight: 600 }}>
                        {item.volatility}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Investment Horizon</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right' }}>
                        {item.durationYears} Years
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Estimated Future Value (FV)</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#60A5FA' }}>
                        {formatINR(item.futureValue)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Expected Total Profit / Loss</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: item.expectedProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                      }}>
                        {formatINR(item.expectedProfit)} ({formatPercentage(item.percentageReturn)})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Deterministic Risk Score</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right' }}>
                        <span className={`badge badge-${item.badgeColor}`}>
                          {item.riskScore}/5 ({item.riskLevel})
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Pessimistic Range (r − σ)</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right', color: 'var(--accent-amber)' }}>
                        {formatINR(item.lowerEstimate)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Optimistic Range (r + σ)</strong></td>
                    {comparisonList.map(item => (
                      <td key={item.id} style={{ textAlign: 'right', color: 'var(--accent-emerald)' }}>
                        {formatINR(item.upperEstimate)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts: Future Value Bars & Risk-Return Scatter */}
          <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Future Value Comparison</h3>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      formatter={(val) => formatINR(val)}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="initialAmount" name="Principal (INR)" fill="#475569" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="futureValue" name="Future Value (INR)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Comparative Risk vs Return Plot</h3>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="volatility" name="Volatility" unit="%" stroke="#94A3B8" fontSize={11} />
                    <YAxis type="number" dataKey="annualReturn" name="Return" unit="%" stroke="#94A3B8" fontSize={11} />
                    <ZAxis type="number" dataKey="amount" range={[100, 350]} name="Principal" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(val, name) => name === 'Principal' ? formatINR(val) : `${val}%`}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    />
                    <Scatter name="Assets" data={scatterData} fill="#10B981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Academic Trade-Off Analysis Insights */}
          <div className="card" style={{
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            borderLeft: '4px solid var(--accent-blue)'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} color="var(--accent-blue)" />
              <span>Comparative Financial Trade-Off Observations</span>
            </h3>

            {comparisonData?.insights?.map((insight, idx) => (
              <p key={idx} style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.4rem', lineHeight: 1.5 }}>
                • {insight}
              </p>
            ))}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
              Note: An investment is not automatically superior simply because it produces the largest nominal future value. 
              Higher returns inherently necessitate accepting greater potential downside risk and volatility.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
