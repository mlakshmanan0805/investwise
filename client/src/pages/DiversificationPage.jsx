import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  Layers,
  Shield,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client.js';
import { formatINR, formatPercentage } from '../utils/formatters.js';
import StatCard from '../components/StatCard.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B', '#F97316'];

export default function DiversificationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDiversification();
        if (res.success) {
          setData(res.diversification);
        }
      } catch (err) {
        notify(err.message || 'Failed to load diversification analysis', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Computing Herfindahl-Hirschman Index (HHI) & holding weights...</p>
      </div>
    );
  }

  const {
    totalAmount = 0,
    hhi = 0,
    scaledHhi = 0,
    effectiveHoldings = 0,
    largestAllocation = 0,
    largestCategoryAllocation = 0,
    assetCount = 0,
    categoryCount = 0,
    diversificationLevel = 'None',
    warning,
    allocations = [],
    categoryBreakdown = [],
    academicExplanation
  } = data || {};

  const pieData = categoryBreakdown.map(cat => ({
    name: cat.category,
    value: cat.amount,
    percentage: cat.percentage
  }));

  const barData = allocations.map(a => ({
    name: a.name.length > 15 ? a.name.substring(0, 13) + '...' : a.name,
    fullName: a.name,
    percentage: a.percentage,
    amount: a.amount
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Portfolio Diversification & HHI Analysis
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Evaluate unsystematic risk dispersion using the Herfindahl-Hirschman Index (HHI) and effective equal-weight holdings.
        </p>
      </div>

      {/* Concentration Alert Banner */}
      {warning && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--accent-amber-light)',
          border: '1px solid var(--accent-amber)',
          borderRadius: 'var(--radius-md)',
          color: '#FDE68A',
          marginBottom: '1.5rem',
          fontSize: '0.88rem'
        }}>
          <AlertTriangle size={22} style={{ flexShrink: 0, color: 'var(--accent-amber)' }} />
          <div>
            <strong>Concentration Warning:</strong> {warning}
          </div>
        </div>
      )}

      {/* Diversification Metric Cards */}
      <div className="stat-grid" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          title="Herfindahl Index (HHI)"
          value={hhi.toFixed(4)}
          subtext={`Scaled HHI: ${scaledHhi} / 10,000`}
          icon={PieIcon}
          iconBg="var(--accent-blue-light)"
          iconColor="var(--accent-blue)"
          badgeText={diversificationLevel}
          badgeType={hhi <= 0.25 ? 'emerald' : hhi <= 0.40 ? 'amber' : 'rose'}
        />

        <StatCard
          title="Effective Holdings (1/HHI)"
          value={effectiveHoldings}
          subtext={`Across ${assetCount} actual positions`}
          icon={Layers}
          iconBg="var(--accent-emerald-light)"
          iconColor="var(--accent-emerald)"
        />

        <StatCard
          title="Largest Asset Dominance"
          value={`${largestAllocation}%`}
          subtext="Single position max weight"
          icon={AlertTriangle}
          iconBg={largestAllocation > 40 ? 'var(--accent-rose-light)' : 'var(--accent-emerald-light)'}
          iconColor={largestAllocation > 40 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}
        />

        <StatCard
          title="Asset Categories"
          value={categoryCount}
          subtext={`Largest class: ${largestCategoryAllocation}%`}
          icon={Shield}
          iconBg="rgba(99, 102, 241, 0.15)"
          iconColor="var(--accent-indigo)"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Category Allocation Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Distribution</h3>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => formatINR(val)}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Asset Weight Bars */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Individual Holding Allocation (%)</h3>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} unit="%" />
                <Tooltip
                  formatter={(val, name) => name === 'percentage' ? `${val}%` : formatINR(val)}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="percentage" name="Allocation %" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Asset Class Breakdown</h3>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Asset Class</th>
                <th style={{ textAlign: 'right' }}>Total Capital Invested</th>
                <th style={{ textAlign: 'center' }}>Allocation Fraction (s_i)</th>
                <th style={{ textAlign: 'right' }}>Weight (%)</th>
                <th style={{ textAlign: 'right' }}>Squared Fraction (s_i^2)</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((cat, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cat.category}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatINR(cat.amount)}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {cat.fraction.toFixed(4)}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                    {cat.percentage}%
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {Math.pow(cat.fraction, 2).toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academic Methodology Box */}
      <div className="card" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', borderLeft: '4px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <Lightbulb size={20} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Academic Theory: Herfindahl-Hirschman Concentration & Modern Portfolio Theory
          </h3>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          <strong>Mathematical Definition:</strong> The Herfindahl-Hirschman Index is calculated as the sum of squared allocation fractions:
          <br />
          <span style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD' }}>
            HHI = Σ (s_i)^2, where s_i = (Asset Capital_i / Total Capital)
          </span>
          <br />
          The theoretical minimum HHI for N equally weighted assets is 1/N. Hence, the effective number of equally weighted holdings is 
          <span style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD' }}> N_eff = 1 / HHI</span>.
        </p>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5 }}>
          {academicExplanation}
        </p>
      </div>
    </div>
  );
}
