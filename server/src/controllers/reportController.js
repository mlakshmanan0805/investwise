import { getDatabase } from '../database/db.js';
import {
  calculateCompoundFutureValue,
  calculateExpectedProfitOrLoss,
  calculateTotalPercentageReturn,
  calculateVolatilityRiskRange,
  calculateRiskScore,
  calculatePortfolioSummary,
  calculateDiversification,
  simulateScenarios
} from '../utils/calculations.js';

export function getReportData(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const user = db.prepare('SELECT id, full_name, email, risk_tolerance, created_at FROM users WHERE id = ?').get(userId);
    const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY initial_amount DESC').all(userId);

    const summary = calculatePortfolioSummary(investments);
    const diversification = calculateDiversification(investments);

    const enrichedInvestments = investments.map(inv => {
      const fv = calculateCompoundFutureValue(inv.initial_amount, inv.expected_return, inv.duration_years);
      const profit = calculateExpectedProfitOrLoss(fv, inv.initial_amount);
      const pct = calculateTotalPercentageReturn(fv, inv.initial_amount);
      const risk = calculateRiskScore({
        volatility: inv.expected_volatility,
        category: inv.asset_category,
        durationYears: inv.duration_years,
        concentrationScore: summary.totalInvested > 0 ? (inv.initial_amount / summary.totalInvested > 0.35 ? 4 : 1) : 1
      });
      const range = calculateVolatilityRiskRange(inv.initial_amount, inv.expected_return, inv.expected_volatility, inv.duration_years);

      return {
        ...inv,
        futureValue: Number(fv.toFixed(2)),
        expectedProfit: Number(profit.toFixed(2)),
        percentageReturn: Number(pct.toFixed(2)),
        riskScore: risk.overallScore,
        riskLevel: risk.riskLevel,
        lowerEstimate: Number(range.lowerEstimate.toFixed(2)),
        upperEstimate: Number(range.upperEstimate.toFixed(2))
      };
    });

    // Baseline scenario comparison for entire portfolio
    let portfolioScenarios = null;
    if (summary.totalInvested > 0) {
      portfolioScenarios = simulateScenarios({
        initialAmount: summary.totalInvested,
        annualReturn: summary.expectedReturnPercentage,
        volatility: summary.weightedVolatility,
        durationYears: 5
      });
    }

    return res.status(200).json({
      success: true,
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        studentName: user.full_name,
        userEmail: user.email,
        riskTolerancePreference: user.risk_tolerance,
        totalAssets: investments.length
      },
      summary,
      diversification,
      investments: enrichedInvestments,
      portfolioScenarios: portfolioScenarios ? portfolioScenarios.summary : null,
      methodology: {
        compoundingFormula: 'Future Value = Initial Investment × (1 + r / 100)^n',
        volatilityRangeFormula: 'Lower = P × max(0, 1 + (r - σ)/100)^n; Upper = P × max(0, 1 + (r + σ)/100)^n',
        hhiFormula: 'HHI = Σ (Allocation Fraction)^2; Effective Holdings = 1 / HHI',
        riskFormula: 'Overall Risk = (Volatility Score × 0.40) + (Category Score × 0.25) + (Duration Score × 0.15) + (Concentration Score × 0.20)'
      },
      academicDisclaimer: 'InvestWise is an academic finance application. Calculations and projections are illustrative mathematical models and do not guarantee market returns or capital safety.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate report data: ' + error.message
    });
  }
}

/**
 * Helper to escape CSV cell according to RFC 4180
 */
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function exportCsv(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const investments = db.prepare('SELECT * FROM investments WHERE user_id = ? ORDER BY id ASC').all(userId);

    const headers = [
      'Investment ID',
      'Investment Name',
      'Asset Category',
      'Initial Investment (Rs)',
      'Expected Annual Return (%)',
      'Expected Volatility (%)',
      'Duration (Years)',
      'Estimated Future Value (Rs)',
      'Expected Profit / Loss (Rs)',
      'Total Return (%)',
      'Risk Score (/5)',
      'Risk Level',
      'Lower Illustrative Estimate (Rs)',
      'Upper Illustrative Estimate (Rs)',
      'Risk Tolerance Profile',
      'Notes',
      'Created Date'
    ];

    const rows = investments.map(inv => {
      const fv = calculateCompoundFutureValue(inv.initial_amount, inv.expected_return, inv.duration_years);
      const profit = calculateExpectedProfitOrLoss(fv, inv.initial_amount);
      const pct = calculateTotalPercentageReturn(fv, inv.initial_amount);
      const risk = calculateRiskScore({
        volatility: inv.expected_volatility,
        category: inv.asset_category,
        durationYears: inv.duration_years
      });
      const range = calculateVolatilityRiskRange(inv.initial_amount, inv.expected_return, inv.expected_volatility, inv.duration_years);

      return [
        inv.id,
        inv.name,
        inv.asset_category,
        inv.initial_amount.toFixed(2),
        inv.expected_return.toFixed(2),
        inv.expected_volatility.toFixed(2),
        inv.duration_years,
        fv.toFixed(2),
        profit.toFixed(2),
        pct.toFixed(2),
        risk.overallScore,
        risk.riskLevel,
        range.lowerEstimate.toFixed(2),
        range.upperEstimate.toFixed(2),
        inv.risk_tolerance,
        inv.notes,
        inv.created_at
      ].map(escapeCsv).join(',');
    });

    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="investwise_portfolio.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to export CSV: ' + error.message
    });
  }
}
