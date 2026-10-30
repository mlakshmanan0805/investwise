import React, { useState } from 'react';
import { User, Mail, Shield, Lock, Save, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { formatDate } from '../utils/formatters.js';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { notify } = useNotification();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [riskTolerance, setRiskTolerance] = useState(user?.risk_tolerance || 'Moderate');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (newPassword) {
      if (!currentPassword) {
        notify('Current password is required to change password', 'error');
        return;
      }
      if (newPassword.length < 6) {
        notify('New password must be at least 6 characters long', 'error');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        notify('New passwords do not match', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        risk_tolerance: riskTolerance,
        ...(newPassword ? { new_password: newPassword, current_password: currentPassword } : {})
      };

      await updateProfile(payload);
      notify('Profile updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      notify(err.message || 'Profile update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Profile & Account Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Manage your account credentials, investor risk preference, and session state.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleUpdate}>
          {/* User Information */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.4rem',
              fontWeight: 800
            }}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
                Account created on {formatDate(user?.created_at)}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Read-only)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input"
              style={{ opacity: 0.65, cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Investor Risk Tolerance Profile</label>
            <select
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(e.target.value)}
              className="form-select"
            >
              <option value="Conservative">Conservative (Capital preservation, low volatility)</option>
              <option value="Moderate">Moderate (Balanced risk-return profile)</option>
              <option value="Aggressive">Aggressive (High growth tolerance, higher volatility)</option>
            </select>
          </div>

          {/* Change Password Sub-section */}
          <div style={{ margin: '1.75rem 0 1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={16} color="var(--accent-blue)" /> Change Password (Optional)
            </h4>

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required only if changing password"
                className="form-input"
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={logout}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--accent-rose)' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              <Save size={16} />
              <span>{submitting ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
