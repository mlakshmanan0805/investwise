import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = 'var(--accent-blue-light)',
  iconColor = 'var(--accent-blue)',
  badgeText,
  badgeType = 'emerald'
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
        {subtext && <span className="stat-subtext">{subtext}</span>}
        {badgeText && (
          <span className={`badge badge-${badgeType}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
