import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  RefreshCw,
  X,
  Shield,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client.js';
import { formatINR, formatPercentage, formatDate } from '../utils/formatters.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

const ASSET_CATEGORIES = [
  'All',
  'Fixed Deposit',
  'Government Bonds',
  'Corporate Bonds',
  'Mutual Funds',
  'Equity',
  'Index Funds',
  'Gold',
  'Real Estate',
  'Cryptocurrency',
  'Other'
];

export default function PortfolioPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modal States
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'view' | null
  const [currentHolding, setCurrentHolding] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    asset_category: 'Equity',
    initial_amount: '',
    expected_return: '',
    expected_volatility: '',
    duration_years: '',
    risk_tolerance: 'Moderate',
    notes: ''
  });

  const { notify } = useNotification();

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: categoryFilter,
        search,
        sortBy,
        sortOrder
      }).toString();

      const res = await api.getInvestments(params);
      if (res.success) {
        setInvestments(res.investments);
      }
    } catch (err) {
      notify(err.message || 'Failed to fetch investments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [categoryFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInvestments();
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      asset_category: 'Index Funds',
      initial_amount: '50000',
      expected_return: '12',
      expected_volatility: '14',
      duration_years: '5',
      risk_tolerance: 'Moderate',
      notes: ''
    });
    setModalMode('add');
  };

  const openEditModal = (inv) => {
    setCurrentHolding(inv);
    setFormData({
      name: inv.name,
      asset_category: inv.asset_category,
      initial_amount: String(inv.initial_amount),
      expected_return: String(inv.expected_return),
      expected_volatility: String(inv.expected_volatility),
      duration_years: String(inv.duration_years),
      risk_tolerance: inv.risk_tolerance || 'Moderate',
      notes: inv.notes || ''
    });
    setModalMode('edit');
  };

  const openViewModal = async (inv) => {
    try {
      const res = await api.getInvestment(inv.id);
      if (res.success) {
        setCurrentHolding(res.investment);
        setModalMode('view');
      }
    } catch (err) {
      notify(err.message || 'Failed to fetch investment details', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        asset_category: formData.asset_category,
        initial_amount: Number(formData.initial_amount),
        expected_return: Number(formData.expected_return),
        expected_volatility: Number(formData.expected_volatility || 0),
        duration_years: Number(formData.duration_years),
        risk_tolerance: formData.risk_tolerance,
        notes: formData.notes.trim()
      };

      if (modalMode === 'add') {
        const res = await api.addInvestment(payload);
        if (res.success) {
          notify('Investment added successfully!', 'success');
        }
      } else if (modalMode === 'edit') {
        const res = await api.updateInvestment(currentHolding.id, payload);
        if (res.success) {
          notify('Investment updated successfully!', 'success');
        }
      }

      setModalMode(null);
      await fetchInvestments();
    } catch (err) {
      notify(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.deleteInvestment(deleteTarget.id);
      notify(res.message || 'Investment deleted', 'success');
      setDeleteTarget(null);
      await fetchInvestments();
    } catch (err) {
      notify(err.message || 'Failed to delete investment', 'error');
    }
  };

  const handleLoadSample = async () => {
    try {
      const res = await api.loadSamplePortfolio();
      notify(res.message || 'Sample investments added!', 'success');
      await fetchInvestments();
    } catch (err) {
      notify(err.message || 'Failed to load sample portfolio', 'error');
    }
  };

  const totalCapital = investments.reduce((sum, inv) => sum + (Number(inv.initial_amount) || 0), 0);

  return (
    <div>
      {/* Header and Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Portfolio Management
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Maintain, adjust, and monitor individual investment positions with SQLite persistence
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleLoadSample} className="btn btn-secondary btn-sm" title="Populate realistic demo investments">
            <Sparkles size={15} color="var(--accent-emerald)" />
            <span>Load Sample Portfolio</span>
          </button>

          <button onClick={openAddModal} className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search holding by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              {ASSET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpDown size={15} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto' }}
            >
              <option value="created_at">Date Added</option>
              <option value="amount">Initial Amount</option>
              <option value="return">Expected Return</option>
              <option value="volatility">Volatility</option>
              <option value="risk">Calculated Risk</option>
              <option value="name">Name</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem 0.75rem' }}
            >
              {sortOrder === 'ASC' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading portfolio holdings...</p>
        </div>
      ) : investments.length === 0 ? (
        <EmptyState
          title="No Investments Found"
          description={search || categoryFilter !== 'All' ? 'No holdings match your search criteria.' : 'Your portfolio has no recorded investments yet.'}
          icon={Briefcase}
          primaryAction={{
            label: 'Add Investment',
            icon: PlusCircle,
            onClick: openAddModal
          }}
          secondaryAction={{
            label: 'Load Sample Portfolio',
            icon: Sparkles,
            onClick: handleLoadSample
          }}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Investment Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Principal Capital</th>
                  <th style={{ textAlign: 'center' }}>% of Portfolio</th>
                  <th style={{ textAlign: 'right' }}>Expected Return</th>
                  <th style={{ textAlign: 'right' }}>Volatility (σ)</th>
                  <th style={{ textAlign: 'center' }}>Duration</th>
                  <th style={{ textAlign: 'right' }}>Future Value</th>
                  <th style={{ textAlign: 'center' }}>Risk Level</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => {
                  const weightPct = totalCapital > 0 ? (inv.initial_amount / totalCapital) * 100 : 0;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.name}</div>
                        {inv.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            {inv.notes}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {inv.asset_category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatINR(inv.initial_amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {weightPct.toFixed(1)}%
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                        {formatPercentage(inv.expected_return)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--accent-amber)' }}>
                        {inv.expected_volatility}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {inv.duration_years} yr{inv.duration_years > 1 ? 's' : ''}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {formatINR(inv.future_value)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge badge-${inv.badge_color || 'emerald'}`}>
                          {inv.risk_level || 'Moderate Risk'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => openViewModal(inv)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="View Holding Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(inv)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.5rem' }}
                            title="Edit Holding"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(inv)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.5rem', color: 'var(--accent-rose)' }}
                            title="Delete Holding"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Holding Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {modalMode === 'add' ? 'Add New Investment' : `Edit: ${currentHolding?.name}`}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Investment Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Reliance Growth Mutual Fund"
                    className="form-input"
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Asset Category</label>
                    <select
                      value={formData.asset_category}
                      onChange={(e) => setFormData({ ...formData, asset_category: e.target.value })}
                      className="form-select"
                    >
                      {ASSET_CATEGORIES.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Principal Amount (INR)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.initial_amount}
                      onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                      placeholder="100000"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expected Return (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.expected_return}
                      onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })}
                      placeholder="12.0"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expected Volatility (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.expected_volatility}
                      onChange={(e) => setFormData({ ...formData, expected_volatility: e.target.value })}
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
                      value={formData.duration_years}
                      onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
                      placeholder="5"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Risk Tolerance Profile</label>
                    <select
                      value={formData.risk_tolerance}
                      onChange={(e) => setFormData({ ...formData, risk_tolerance: e.target.value })}
                      className="form-select"
                    >
                      <option value="Conservative">Conservative</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Aggressive">Aggressive</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Thesis</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Rationale, broker, or maturity details..."
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalMode(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                  {submitting ? 'Saving...' : modalMode === 'add' ? 'Create Holding' : 'Update Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Drawer / Modal */}
      {modalMode === 'view' && currentHolding && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentHolding.name}</h3>
                <span className="badge badge-blue" style={{ marginTop: '0.25rem' }}>{currentHolding.asset_category}</span>
              </div>
              <button
                onClick={() => setModalMode(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Initial Principal</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatINR(currentHolding.initial_amount)}</div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Future Value</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {formatINR(currentHolding.future_value)}
                  </div>
                </div>
              </div>

              <div className="grid-3" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Annual Return</div>
                  <div style={{ fontWeight: 700 }}>{formatPercentage(currentHolding.expected_return)}</div>
                </div>

                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Annual Volatility</div>
                  <div style={{ fontWeight: 700 }}>{currentHolding.expected_volatility}%</div>
                </div>

                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Duration</div>
                  <div style={{ fontWeight: 700 }}>{currentHolding.duration_years} Years</div>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
                  Illustrative Scenario Range (±{currentHolding.expected_volatility}%)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Pessimistic Estimate: <strong>{formatINR(currentHolding.lower_estimate)}</strong></span>
                  <span>Optimistic Estimate: <strong>{formatINR(currentHolding.upper_estimate)}</strong></span>
                </div>
              </div>

              {currentHolding.notes && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Notes:</strong> {currentHolding.notes}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setModalMode(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Investment Position"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? All associated transaction activities will also be cleaned up.`}
        confirmText="Delete Holding"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
