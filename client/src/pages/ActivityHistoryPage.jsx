import React, { useState, useEffect } from 'react';
import {
  History,
  PlusCircle,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Calendar,
  X,
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
  ResponsiveContainer
} from 'recharts';
import { api } from '../api/client.js';
import { formatINR, formatDate } from '../utils/formatters.js';
import { useNotification } from '../context/NotificationContext.jsx';

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    investment_id: '',
    activity_type: 'Additional Contribution',
    amount: '',
    activity_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const { notify } = useNotification();

  const loadData = async () => {
    setLoading(true);
    try {
      const [actRes, valRes, invRes] = await Promise.all([
        api.getActivities(),
        api.getValuations(),
        api.getInvestments()
      ]);

      if (actRes.success) setActivities(actRes.activities);
      if (valRes.success) setValuations(valRes.history);
      if (invRes.success) {
        setInvestments(invRes.investments);
        if (invRes.investments.length > 0 && !form.investment_id) {
          setForm(prev => ({ ...prev, investment_id: String(invRes.investments[0].id) }));
        }
      }
    } catch (err) {
      notify(err.message || 'Failed to fetch transaction logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.investment_id || !form.amount || Number(form.amount) <= 0) {
      notify('Please provide a valid investment and positive amount.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addActivity({
        investment_id: Number(form.investment_id),
        activity_type: form.activity_type,
        amount: Number(form.amount),
        activity_date: form.activity_date,
        notes: form.notes
      });

      if (res.success) {
        notify(`${form.activity_type} recorded successfully!`, 'success');
        setIsModalOpen(false);
        setForm(prev => ({ ...prev, amount: '', notes: '' }));
        await loadData();
      }
    } catch (err) {
      notify(err.message || 'Transaction recording failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading ledger activities and valuation histories...</p>
      </div>
    );
  }

  const hasValuationHistory = valuations && valuations.length >= 2;

  return (
    <div>
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
            Transaction & Valuation History
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Auditable cash flow activities, withdrawals, and historical valuation snapshots
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm"
          disabled={investments.length === 0}
        >
          <PlusCircle size={15} />
          <span>Record New Activity</span>
        </button>
      </div>

      {/* Valuation Performance Timeline Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Historical Portfolio Valuations</h3>
            <p className="card-subtitle">Plotted solely from date-stamped audit entries</p>
          </div>
        </div>

        {hasValuationHistory ? (
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={valuations} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="valuation_date" stroke="#94A3B8" tickFormatter={formatDate} fontSize={11} />
                <YAxis stroke="#94A3B8" tickFormatter={(v) => `₹${v / 1000}k`} fontSize={11} />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(val, name, props) => [formatINR(val), `${props.payload.investment_name || 'Valuation'}`]}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="valuation_amount" stroke="#10B981" strokeWidth={2.5} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)'
          }}>
            <Info size={24} style={{ color: 'var(--accent-blue)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Insufficient historical data</div>
            <p style={{ fontSize: '0.8rem', maxWidth: '440px', margin: '0 auto' }}>
              At least two dated valuation records are required to render an authentic trend chart without fabricating artificial points.
            </p>
          </div>
        )}
      </div>

      {/* Activities Ledger Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recorded Transaction Log</h3>
        </div>

        {activities.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No transaction activities have been recorded yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Investment</th>
                  <th>Activity Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => {
                  const isPositive = act.activity_type === 'Additional Contribution' || act.activity_type === 'Initial Investment';
                  const isWithdrawal = act.activity_type === 'Withdrawal';

                  return (
                    <tr key={act.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatDate(act.activity_date)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{act.investment_name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.asset_category}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          isWithdrawal ? 'badge-rose' : isPositive ? 'badge-emerald' : 'badge-blue'
                        }`}>
                          {act.activity_type}
                        </span>
                      </td>
                      <td style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: isWithdrawal ? 'var(--accent-rose)' : isPositive ? 'var(--accent-emerald)' : 'var(--text-primary)'
                      }}>
                        {isWithdrawal ? '-' : '+'}{formatINR(act.amount)}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {act.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Activity Modal */}
      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Record Investment Activity</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Holding</label>
                  <select
                    value={form.investment_id}
                    onChange={(e) => setForm({ ...form, investment_id: e.target.value })}
                    className="form-select"
                    required
                  >
                    {investments.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.name} ({formatINR(inv.initial_amount)})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Activity Type</label>
                  <select
                    value={form.activity_type}
                    onChange={(e) => setForm({ ...form, activity_type: e.target.value })}
                    className="form-select"
                  >
                    <option value="Additional Contribution">Additional Contribution (Capital Infusion)</option>
                    <option value="Withdrawal">Withdrawal (Capital Extraction)</option>
                    <option value="Manual Valuation Update">Manual Valuation Update (Fair Value Mark)</option>
                  </select>
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Amount (INR)</label>
                    <input
                      type="number"
                      step="any"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="10000"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Activity Date</label>
                    <input
                      type="date"
                      value={form.activity_date}
                      onChange={(e) => setForm({ ...form, activity_date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Rationale</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Dividend reinvestment or quarterly bonus contribution"
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                  {submitting ? 'Recording...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
