import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  FileText,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Shield,
  Layers
} from 'lucide-react';
import { api } from '../api/client.js';
import { formatINR, formatPercentage, formatDate } from '../utils/formatters.js';
import { useNotification } from '../context/NotificationContext.jsx';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);
  const { notify } = useNotification();

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReportData();
      if (res.success) {
        setReport(res);
      }
    } catch (err) {
      notify(err.message || 'Failed to generate portfolio report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const blob = await api.exportCsvBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `investwise_portfolio_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify('Portfolio CSV exported successfully!', 'success');
    } catch (err) {
      notify(err.message || 'CSV export failed', 'error');
    } finally {
      setExportingCsv(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Compiling academic portfolio report...</p>
      </div>
    );
  }

  const {
    reportMetadata = {},
    summary = {},
    diversification = {},
    investments = [],
    portfolioScenarios = {},
    methodology = {},
    academicDisclaimer
  } = report || {};

  return (
    <div>
      {/* Top Action Bar (Hidden on print) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Academic Portfolio Audit Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Comprehensive printable summary including allocation HHI, factor risk metrics, and methodology disclosures
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCsv} disabled={exportingCsv} className="btn btn-secondary btn-sm">
            <Download size={15} />
            <span>{exportingCsv ? 'Exporting...' : 'Export to CSV'}</span>
          </button>

          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={15} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="card report-sheet" style={{ padding: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              InvestWise Portfolio Report
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Investment Risk and Return Analysis • College Academic Project
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div><strong>Generated:</strong> {formatDate(reportMetadata.generatedAt)}</div>
            <div><strong>Investor:</strong> {reportMetadata.studentName} ({reportMetadata.userEmail})</div>
            <div><strong>Stated Risk Profile:</strong> {reportMetadata.riskTolerancePreference}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            1. Portfolio Executive Summary
          </h3>
          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Capital Invested</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{formatINR(summary.totalInvested)}</div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projected Value</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {formatINR(summary.currentPortfolioValue)}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weighted Expected Return</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {formatPercentage(summary.expectedReturnPercentage)}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Calculated Risk Level</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {summary.overallRiskScore} / 5 ({summary.overallRiskLevel})
              </div>
            </div>
          </div>
        </div>

        {/* Investment Breakdown Table */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            2. Detailed Holdings & Returns Matrix
          </h3>
          <div className="table-responsive">
            <table className="table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Holding</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Initial Amount</th>
                  <th style={{ textAlign: 'right' }}>Return (%)</th>
                  <th style={{ textAlign: 'right' }}>Volatility</th>
                  <th style={{ textAlign: 'center' }}>Horizon</th>
                  <th style={{ textAlign: 'right' }}>Future Value</th>
                  <th style={{ textAlign: 'center' }}>Risk</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id}>
                    <td><strong>{inv.name}</strong></td>
                    <td>{inv.asset_category}</td>
                    <td style={{ textAlign: 'right' }}>{formatINR(inv.initial_amount)}</td>
                    <td style={{ textAlign: 'right' }}>{formatPercentage(inv.expected_return)}</td>
                    <td style={{ textAlign: 'right' }}>{inv.expected_volatility}%</td>
                    <td style={{ textAlign: 'center' }}>{inv.duration_years} yrs</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatINR(inv.futureValue)}</td>
                    <td style={{ textAlign: 'center' }}>{inv.riskScore}/5 ({inv.riskLevel})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diversification & HHI Breakdown */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            3. Diversification & Concentration Metrics
          </h3>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <div><strong>Herfindahl-Hirschman Index (HHI):</strong> {diversification.hhi} (Scaled: {diversification.scaledHhi})</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Effective Equally Weighted Holdings:</strong> {diversification.effectiveHoldings}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Diversification Rating:</strong> {diversification.diversificationLevel}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              <div><strong>Distinct Asset Classes:</strong> {diversification.categoryCount}</div>
              <div style={{ marginTop: '0.35rem' }}><strong>Largest Single Holding Weight:</strong> {diversification.largestAllocation}%</div>
              {diversification.warning && (
                <div style={{ marginTop: '0.35rem', color: 'var(--accent-amber)' }}>⚠️ {diversification.warning}</div>
              )}
            </div>
          </div>
        </div>

        {/* 5-Year Portfolio Projections Scenario Table */}
        {portfolioScenarios && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              4. 5-Year Hypothetical Portfolio Growth Scenarios
            </h3>
            <table className="table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Scenario Case</th>
                  <th style={{ textAlign: 'right' }}>Assumed Annual Rate</th>
                  <th style={{ textAlign: 'right' }}>5-Year Projected Value</th>
                  <th style={{ textAlign: 'right' }}>Projected Gain / Loss</th>
                  <th style={{ textAlign: 'right' }}>Total Return</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pessimistic Case (r − σ)</strong></td>
                  <td style={{ textAlign: 'right' }}>{portfolioScenarios.pessimistic?.annualRate}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatINR(portfolioScenarios.pessimistic?.finalValue)}</td>
                  <td style={{ textAlign: 'right' }}>{formatINR(portfolioScenarios.pessimistic?.profitOrLoss)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercentage(portfolioScenarios.pessimistic?.percentageReturn)}</td>
                </tr>
                <tr>
                  <td><strong>Base Case Expected (r)</strong></td>
                  <td style={{ textAlign: 'right' }}>{portfolioScenarios.baseCase?.annualRate}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#60A5FA' }}>{formatINR(portfolioScenarios.baseCase?.finalValue)}</td>
                  <td style={{ textAlign: 'right' }}>{formatINR(portfolioScenarios.baseCase?.profitOrLoss)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercentage(portfolioScenarios.baseCase?.percentageReturn)}</td>
                </tr>
                <tr>
                  <td><strong>Optimistic Case (r + σ)</strong></td>
                  <td style={{ textAlign: 'right' }}>{portfolioScenarios.optimistic?.annualRate}%</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>{formatINR(portfolioScenarios.optimistic?.finalValue)}</td>
                  <td style={{ textAlign: 'right' }}>{formatINR(portfolioScenarios.optimistic?.profitOrLoss)}</td>
                  <td style={{ textAlign: 'right' }}>{formatPercentage(portfolioScenarios.optimistic?.percentageReturn)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Methodology & Formulas Reference */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            5. Mathematical Methodology
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <div>• <strong>Compound Future Value:</strong> {methodology.compoundingFormula}</div>
            <div>• <strong>Volatility Risk Range:</strong> {methodology.volatilityRangeFormula}</div>
            <div>• <strong>HHI Concentration:</strong> {methodology.hhiFormula}</div>
            <div>• <strong>Multi-Factor Risk Scoring:</strong> {methodology.riskFormula}</div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }}>
          <strong>Academic Disclaimer & Limitations:</strong> {academicDisclaimer}
          <div style={{ marginTop: '0.25rem' }}>
            Expected return and volatility metrics are educational mathematical models and do not guarantee actual capital preservation or commercial trading outcomes.
          </div>
        </div>
      </div>
    </div>
  );
}
