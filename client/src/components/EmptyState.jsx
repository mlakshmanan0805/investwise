import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no items recorded in this section yet.',
  icon: Icon = FolderOpen,
  primaryAction,
  secondaryAction
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: 'rgba(30, 41, 59, 0.3)',
      border: '2px dashed var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-input)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
        color: 'var(--accent-blue)'
      }}>
        <Icon size={26} />
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
        {description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {primaryAction && (
          <button onClick={primaryAction.onClick} className="btn btn-primary btn-sm">
            {primaryAction.icon && <primaryAction.icon size={15} />}
            <span>{primaryAction.label}</span>
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="btn btn-secondary btn-sm">
            {secondaryAction.icon && <secondaryAction.icon size={15} />}
            <span>{secondaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}
