import { getDatabase } from '../database/db.js';
import {
  validateCalculationInputs,
  calculateCompoundFutureValue,
  calculateExpectedProfitOrLoss,
  calculateTotalPercentageReturn,
  calculateVolatilityRiskRange,
  calculateRiskScore,
  calculatePortfolioSummary,
  calculateDiversification,
  simulateScenarios
} from '../utils/calculations.js';

export function getDashboardSummary(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const investments = db.prepare('SELECT * FROM investments WHERE user_id = ?').all(userId);
    const summary = calculatePortfolioSummary(investments);

    // Chart 1: Portfolio Allocation by Category
    const categoryTotals = {};
    investments.forEach(inv => {
      categoryTotals[inv.asset_category] = (categoryTotals[inv.asset_category] || 0) + inv.initial_amount;
    });

    const categoryAllocationChart = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: Number(amount.toFixed(2)),
      percentage: summary.totalInvested > 0 ? Number(((amount / summary.totalInvested) * 100).toFixed(2)) : 0
    }));

    // Chart 2: Asset Class Investment Amounts Bar Chart
    const assetClassBarChart = categoryAllocationChart.map(item => ({
      category: item.name,
      amount: item.value
    }));

    // Chart 3: Expected Return Comparison Chart
    const returnComparisonChart = investments.map(inv => ({
      name: inv.name.length > 18 ? inv.name.substring(0, 16) + '...' : inv.name,
      fullName: inv.name,
      expectedReturn: inv.expected_return,
      volatility: inv.expected_volatility,
      category: inv.asset_category
    }));

    // Chart 4: Risk vs Return Scatter Plot Data (X: Volatility, Y: Return, Z: Amount)
    const scatterPlotData = investments.map(inv => ({
      name: inv.name,
      volatility: inv.expected_volatility,
      expectedReturn: inv.expected_return,
      amount: inv.initial_amount,
      category: inv.asset_category
    }));

    // Chart 5: Historical Portfolio Valuation
    const historicalValuations = db.prepare(`
      SELECT valuation_date, SUM(valuation_amount) as total_value
      FROM valuation_history
      WHERE user_id = ?
      GROUP BY valuation_date
      ORDER BY valuation_date ASC
    `).all(userId);

    const hasSufficientHistory = historicalValuations && historicalValuations.length >= 2;

    return res.status(200).json({
      success: true,
      summary,
      charts: {
        categoryAllocation: categoryAllocationChart,
        assetClassBars: assetClassBarChart,
        returnComparison: returnComparisonChart,
        riskReturnScatter: scatterPlotData,
        historicalValuations: hasSufficientHistory ? historicalValuations : [],
        hasSufficientHistory
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to generate dashboard summary: ' + error.message
    });
  }
}

export function getRiskAnalysis(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const investments = db.prepare('SELECT * FROM investments WHERE user_id = ?').all(userId);
    const summary = calculatePortfolioSummary(investments);

    const userProfile = db.prepare('SELECT risk_tolerance FROM users WHERE id = ?').get(userId);
    const userTolerance = userProfile ? userProfile.risk_tolerance : 'Moderate';

    // Detailed breakdown per investment
    const investmentRiskDetails = investments.map(inv => {
      const risk = calculateRiskScore({
        volatility: inv.expected_volatility,
        category: inv.asset_category,
        durationYears: inv.duration_years,
        concentrationScore: summary.totalInvested > 0 ? (inv.initial_amount / summary.totalInvested > 0.35 ? 4 : 1) : 1
      });

      return {
        id: inv.id,
        name: inv.name,
        category: inv.asset_category,
        amount: inv.initial_amount,
        volatility: inv.expected_volatility,
        expectedReturn: inv.expected_return,
        durationYears: inv.duration_years,
        overallScore: risk.overallScore,
        riskLevel: risk.riskLevel,
        badgeColor: risk.badgeColor,
        factors: risk.factors,
        riskDrivers: risk.riskDrivers,
        suggestions: risk.suggestions
      };
    });

    // Tolerance alignment analysis
    let alignmentMessage = '';
    let isAligned = true;

    if (userTolerance === 'Conservative' && summary.overallRiskLevel === 'High Risk') {
      isAligned = false;
      alignmentMessage = 'Risk Mismatch: Your profile preference is Conservative, but your portfolio exhibits High Risk characteristics. Consider reducing high-volatility holdings.';
    } else if (userTolerance === 'Aggressive' && summary.overallRiskLevel === 'Low Risk') {
      isAligned = false;
      alignmentMessage = 'Growth Opportunity: Your profile preference is Aggressive, but your holdings are predominantly low-yield, capital-preserving instruments.';
    } else {
      alignmentMessage = `Portfolio risk (${summary.overallRiskLevel}) is reasonably aligned with your stated preference (${userTolerance}).`;
    }

    return res.status(200).json({
      success: true,
      userTolerance,
      overallRiskScore: summary.overallRiskScore,
      overallRiskLevel: summary.overallRiskLevel,
      weightedVolatility: summary.weightedVolatility,
      alignment: {
        isAligned,
        message: alignmentMessage
      },
      investments: investmentRiskDetails,
      disclaimer: 'Risk assessment models provide deterministic educational scoring. They do not substitute for professional asset-liability management or accredited financial advisory.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to perform risk analysis: ' + error.message
    });
  }
}

export function getDiversificationAnalysis(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const investments = db.prepare('SELECT * FROM investments WHERE user_id = ?').all(userId);
    const diversification = calculateDiversification(investments);

    return res.status(200).json({
      success: true,
      diversification
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to perform diversification analysis: ' + error.message
    });
  }
}

export function compareInvestments(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { investmentIds, customItems } = req.body;

    let itemsToCompare = [];

    if (Array.isArray(investmentIds) && investmentIds.length > 0) {
      if (investmentIds.length < 2 || investmentIds.length > 4) {
        return res.status(400).json({
          success: false,
          error: 'Please select between 2 and 4 investments to compare.'
        });
      }

      const placeholders = investmentIds.map(() => '?').join(',');
      const rows = db.prepare(`
        SELECT * FROM investments 
        WHERE id IN (${placeholders}) AND user_id = ?
      `).all(...investmentIds, userId);

      if (rows.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'At least 2 valid saved investments must be selected.'
        });
      }

      itemsToCompare = rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.asset_category,
        initialAmount: Number(r.initial_amount),
        annualReturn: Number(r.expected_return),
        volatility: Number(r.expected_volatility),
        durationYears: Number(r.duration_years)
      }));
    } else if (Array.isArray(customItems) && customItems.length >= 2 && customItems.length <= 4) {
      itemsToCompare = customItems.map(item => ({
        name: item.name || 'Custom Option',
        category: item.category || 'Other',
        initialAmount: Number(item.initialAmount || 10000),
        annualReturn: Number(item.annualReturn || 0),
        volatility: Number(item.volatility || 0),
        durationYears: Number(item.durationYears || 1)
      }));
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please provide between 2 and 4 investments or custom items to compare.'
      });
    }

    const comparisonResults = itemsToCompare.map(item => {
      const fv = calculateCompoundFutureValue(item.initialAmount, item.annualReturn, item.durationYears);
      const profit = calculateExpectedProfitOrLoss(fv, item.initialAmount);
      const pctReturn = calculateTotalPercentageReturn(fv, item.initialAmount);
      const risk = calculateRiskScore({
        volatility: item.volatility,
        category: item.category,
        durationYears: item.durationYears,
        concentrationScore: 1
      });
      const range = calculateVolatilityRiskRange(item.initialAmount, item.annualReturn, item.volatility, item.durationYears);

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        initialAmount: item.initialAmount,
        annualReturn: item.annualReturn,
        volatility: item.volatility,
        durationYears: item.durationYears,
        futureValue: Number(fv.toFixed(2)),
        expectedProfit: Number(profit.toFixed(2)),
        percentageReturn: Number(pctReturn.toFixed(2)),
        riskScore: risk.overallScore,
        riskLevel: risk.riskLevel,
        badgeColor: risk.badgeColor,
        lowerEstimate: Number(range.lowerEstimate.toFixed(2)),
        upperEstimate: Number(range.upperEstimate.toFixed(2))
      };
    });

    // Trade-off observations
    const highestReturnItem = [...comparisonResults].sort((a, b) => b.annualReturn - a.annualReturn)[0];
    const lowestRiskItem = [...comparisonResults].sort((a, b) => a.riskScore - b.riskScore)[0];

    const observations = [];
    if (highestReturnItem.id !== lowestRiskItem.id) {
      observations.push(`Notice that "${highestReturnItem.name}" delivers the highest expected return (${highestReturnItem.annualReturn}%), but also entails a higher risk score (${highestReturnItem.riskScore}/5) than "${lowestRiskItem.name}" (${lowestRiskItem.riskScore}/5).`);
      observations.push('Higher expected returns demand tolerance for market drawdowns; they do not guarantee wealth creation.');
    } else {
      observations.push(`"${highestReturnItem.name}" currently offers an optimal balance of return relative to its risk profile in this comparison.`);
    }

    return res.status(200).json({
      success: true,
      comparison: comparisonResults,
      insights: observations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to compare investments: ' + error.message
    });
  }
}

export function runScenarioSimulator(req, res) {
  try {
    const {
      initialAmount = 100000,
      annualReturn = 10,
      volatility = 8,
      durationYears = 5,
      additionalAmount = 0,
      frequency = 'none'
    } = req.body;

    const pAmount = Number(initialAmount);
    const pReturn = Number(annualReturn);
    const pVol = Number(volatility);
    const pDur = Number(durationYears);
    const pAdd = Number(additionalAmount || 0);

    const validation = validateCalculationInputs({
      initialAmount: pAmount,
      annualReturn: pReturn,
      volatility: pVol,
      durationYears: pDur,
      additionalAmount: pAdd
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(' ')
      });
    }

    const simulation = simulateScenarios({
      initialAmount: pAmount,
      annualReturn: pReturn,
      volatility: pVol,
      durationYears: pDur,
      additionalAmount: pAdd,
      frequency
    });

    return res.status(200).json({
      success: true,
      ...simulation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Simulation failed: ' + error.message
    });
  }
}
