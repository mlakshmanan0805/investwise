import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  Percent,
  PiggyBank,
  Layers,
  ShieldAlert,
  PlusCircle,
  Briefcase,
  GitCompare,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
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
  ZAxis,
  LineChart,
  Line
} from 'recharts';
import { api } from '../api/client.js';
import { formatINR, formatPercentage, formatDate } from '../utils/formatters.js';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSample, setLoadingSample] = useState(false);
  const { notify } = useNotification();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      notify(err.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLoadSample = async () => {
    setLoadingSample(true);
    try {
      const res = await api.loadSamplePortfolio();
      notify(res.message || 'Sample portfolio loaded successfully!', 'success');
      await fetchDashboardData();
    } catch (err) {
      notify(err.message || 'Failed to load sample portfolio', 'error');
    } finally {
      setLoadingSample(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <RefreshCw size={32} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Calculating real-time portfolio risk and expected returns...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const hasInvestments = summary.investmentCount > 0;

  return (
    <div>
      {/* Top Banner & Quick Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Portfolio Risk & Return Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time analytics computed strictly from your SQLite database holdings
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/portfolio')}
            className="btn btn-secondary btn-sm"
          >
            <Briefcase size={15} />
            <span>View Portfolio</span>
          </button>

          <button
            onClick={() => navigate('/risk-analysis')}
            className="btn btn-secondary btn-sm"
          >
            <ShieldAlert size={15} />
            <span>Analyze Risk</span>
          </button>

          <button
            onClick={() => navigate('/compare')}
            className="btn btn-secondary btn-sm"
          >
            <GitCompare size={15} />
            <span>Compare Assets</span>
          </button>

          <button
            onClick={() => navigate('/calculator')}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={15} />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if no investments */}
      {!hasInvestments ? (
        <EmptyState
          title="Your Portfolio is Currently Empty"
          description="InvestWise calculates live diversification, risk scores, and compounded returns based on your saved assets. Add your first investment or load an illustrative sample portfolio."
          icon={Layers}
          primaryAction={{
            label: loadingSample ? 'Loading Demo...' : 'Load Sample Portfolio',
            icon: Sparkles,
            onClick: handleLoadSample
          }}
          secondaryAction={{
            label: 'Add First Investment',
            icon: PlusCircle,
            onClick: () => navigate('/calculator')
          }}
        />
      ) : (
        <>
          {/* Summary Stat Cards Grid */}
          <div className="stat-grid">
            <StatCard
              title="Total Invested Amount"
              value={formatINR(summary.totalInvested)}
              subtext="Total principal capital"
              icon={Wallet}
              iconBg="var(--accent-blue-light)"
              iconColor="var(--accent-blue)"
            />

            <StatCard
              title="Current / Projected Value"
              value={formatINR(summary.currentPortfolioValue)}
              subtext="Compounded future value"
              icon={TrendingUp}
              iconBg="var(--accent-emerald-light)"
              iconColor="var(--accent-emerald)"
              badgeText={summary.expectedProfitOrLoss >= 0 ? 'Surplus' : 'Deficit'}
              badgeType={summary.expectedProfitOrLoss >= 0 ? 'emerald' : 'rose'}
            />

            <StatCard
              title="Portfolio Expected Return"
              value={formatPercentage(summary.expectedReturnPercentage)}
              subtext="Weighted average rate"
              icon={Percent}
              iconBg="rgba(99, 102, 241, 0.15)"
              iconColor="var(--accent-indigo)"
            />

            <StatCard
              title="Expected Profit / Loss"
              value={formatINR(summary.expectedProfitOrLoss)}
              subtext="Nominal expected growth"
              icon={PiggyBank}
              iconBg={summary.expectedProfitOrLoss >= 0 ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)'}
              iconColor={summary.expectedProfitOrLoss >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}
            />

            <StatCard
              title="Total Holdings"
              value={summary.investmentCount}
              subtext={`${summary.diversification?.categoryCount || 0} Asset Classes`}
              icon={Layers}
              iconBg="rgba(6, 182, 212, 0.15)"
              iconColor="var(--accent-cyan)"
            />

            <StatCard
              title="Portfolio Risk Score"
              value={`${summary.overallRiskScore} / 5.0`}
              subtext={summary.overallRiskLevel}
              icon={ShieldAlert}
              iconBg={
                summary.overallRiskLevel === 'Low Risk' ? 'var(--accent-emerald-light)'
                : summary.overallRiskLevel === 'Moderate Risk' ? 'var(--accent-amber-light)' : 'var(--accent-rose-light)'
              }
              iconColor={
                summary.overallRiskLevel === 'Low Risk' ? 'var(--accent-emerald)'
                : summary.overallRiskLevel === 'Moderate Risk' ? 'var(--accent-amber)' : 'var(--accent-rose)'
              }
              badgeText={summary.overallRiskLevel}
              badgeType={
                summary.overallRiskLevel === 'Low Risk' ? 'emerald'
                : summary.overallRiskLevel === 'Moderate Risk' ? 'amber' : 'rose'
              }
            />
          </div>

          {/* Charts Grid 1: Asset Allocation & Category Capital */}
          <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
            {/* Allocation Donut Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Portfolio Allocation by Asset Class</h3>
                  <p className="card-subtitle">Distribution of capital across investment vehicles</p>
                </div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.categoryAllocation || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {(charts.categoryAllocation || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatINR(val)}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Class Capital Bar Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Capital Invested by Category</h3>
                  <p className="card-subtitle">Nominal allocation in Indian Rupees (INR)</p>
                </div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.assetClassBars || []} margin={{ top: 10, right: 20, left: 20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      formatter={(val) => formatINR(val)}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="amount" name="Invested Capital" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Grid 2: Risk vs Return Scatter & Return Comparison */}
          <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
            {/* Risk vs Return Scatter Plot */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Risk vs Expected Return Trade-Off</h3>
                  <p className="card-subtitle">X-axis: Volatility (σ%) | Y-axis: Expected Return (r%)</p>
                </div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" dataKey="volatility" name="Volatility" unit="%" stroke="#94A3B8" fontSize={11} />
                    <YAxis type="number" dataKey="expectedReturn" name="Return" unit="%" stroke="#94A3B8" fontSize={11} />
                    <ZAxis type="number" dataKey="amount" range={[80, 450]} name="Invested Amount" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(val, name) => name === 'Invested Amount' ? formatINR(val) : `${val}%`}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    />
                    <Scatter name="Holdings" data={charts.riskReturnScatter || []} fill="#10B981" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expected Returns per Holding Bar Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Expected Annual Return per Holding</h3>
                  <p className="card-subtitle">Comparison across individual portfolio positions</p>
                </div>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.returnComparison || []} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} angle={-15} textAnchor="end" interval={0} />
                    <YAxis stroke="#94A3B8" fontSize={11} unit="%" />
                    <Tooltip
                      formatter={(val) => `${val}%`}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="expectedReturn" name="Expected Return (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="volatility" name="Volatility (%)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Historical Valuations or Insufficient History Notice */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Portfolio Valuation History</h3>
                <p className="card-subtitle">Performance recorded from date-stamped valuation logs</p>
              </div>
              <Link to="/activities" className="btn btn-secondary btn-sm">
                Log New Valuation
              </Link>
            </div>

            {charts.hasSufficientHistory ? (
              <div style={{ height: '260px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.historicalValuations} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="valuation_date" stroke="#94A3B8" fontSize={11} tickFormatter={formatDate} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      labelFormatter={formatDate}
                      formatter={(val) => [formatINR(val), 'Portfolio Total Value']}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="total_value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Insufficient Historical Data
                </div>
                <p style={{ fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto 1rem' }}>
                  To plot real performance curves over time without inventing fabricated data, at least two historical valuation points must be recorded.
                </p>
                <Link to="/activities" className="btn btn-primary btn-sm">
                  Record Valuation Snapshot
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
