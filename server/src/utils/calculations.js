/**
 * InvestWise - Financial Calculation Engine
 * Reusable, deterministic, and rigorously tested financial mathematics module.
 */

// Asset category risk scores defined by specification
export const ASSET_CATEGORY_SCORES = {
  'Fixed Deposit': 1,
  'Government Bonds': 2,
  'Corporate Bonds': 3,
  'Mutual Funds': 3,
  'Index Funds': 3,
  'Equity': 4,
  'Gold': 3,
  'Real Estate': 3,
  'Cryptocurrency': 5,
  'Other': 3
};

/**
 * Validate numeric calculation inputs
 */
export function validateCalculationInputs({
  initialAmount,
  annualReturn,
  durationYears,
  volatility = 0,
  additionalAmount = 0
}) {
  const errors = [];

  // Initial Investment validation
  if (initialAmount === undefined || initialAmount === null || typeof initialAmount !== 'number') {
    errors.push('Initial investment amount is required and must be a number.');
  } else if (!Number.isFinite(initialAmount) || Number.isNaN(initialAmount)) {
    errors.push('Initial investment amount cannot be NaN or Infinity.');
  } else if (initialAmount <= 0) {
    errors.push('Initial investment amount must be strictly greater than zero.');
  }

  // Duration validation
  if (durationYears === undefined || durationYears === null || typeof durationYears !== 'number') {
    errors.push('Investment duration is required and must be a number.');
  } else if (!Number.isFinite(durationYears) || Number.isNaN(durationYears)) {
    errors.push('Investment duration cannot be NaN or Infinity.');
  } else if (durationYears <= 0) {
    errors.push('Investment duration must be positive and greater than zero.');
  }

  // Volatility validation
  if (volatility !== undefined && volatility !== null) {
    if (typeof volatility !== 'number' || !Number.isFinite(volatility) || Number.isNaN(volatility)) {
      errors.push('Annual volatility must be a valid number.');
    } else if (volatility < 0) {
      errors.push('Annual volatility cannot be negative.');
    }
  }

  // Annual Return validation
  if (annualReturn === undefined || annualReturn === null || typeof annualReturn !== 'number') {
    errors.push('Expected annual return rate is required and must be a number.');
  } else if (!Number.isFinite(annualReturn) || Number.isNaN(annualReturn)) {
    errors.push('Expected annual return cannot be NaN or Infinity.');
  } else if (annualReturn < -100 || annualReturn > 1000) {
    errors.push('Expected annual return must be within a realistic academic range (-100% to 1000%).');
  }

  // Additional Amount validation
  if (additionalAmount !== undefined && additionalAmount !== null) {
    if (typeof additionalAmount !== 'number' || !Number.isFinite(additionalAmount) || Number.isNaN(additionalAmount)) {
      errors.push('Additional contribution amount must be a valid number.');
    } else if (additionalAmount < 0) {
      errors.push('Additional contribution amount cannot be negative.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * A. Simple Annual Return
 * Annual Return = Initial Investment * Annual Return Rate / 100
 */
export function calculateSimpleAnnualReturn(initialAmount, annualReturnRate) {
  return initialAmount * (annualReturnRate / 100);
}

/**
 * B. Total Simple Return
 * Total Return = Initial Investment * Annual Return Rate * Number of Years / 100
 */
export function calculateTotalSimpleReturn(initialAmount, annualReturnRate, durationYears) {
  return initialAmount * (annualReturnRate / 100) * durationYears;
}

/**
 * C. Future Value With Annual Compounding
 * Basic: FV = Initial Investment * (1 + Annual Return Rate / 100)^Number of Years
 * With recurring contributions if enabled:
 * - frequency: 'none' | 'monthly' | 'quarterly' | 'annually'
 */
export function calculateCompoundFutureValue(
  initialAmount,
  annualReturnRate,
  durationYears,
  additionalAmount = 0,
  frequency = 'none'
) {
  const rDecimal = annualReturnRate / 100;

  if (!additionalAmount || frequency === 'none') {
    // Pure initial lump-sum compounding
    // Handle potential -100% or less boundary
    const growthFactor = Math.max(0, 1 + rDecimal);
    return initialAmount * Math.pow(growthFactor, durationYears);
  }

  // Recurring contributions compounding
  let periodsPerYear = 1;
  if (frequency === 'monthly') periodsPerYear = 12;
  else if (frequency === 'quarterly') periodsPerYear = 4;
  else if (frequency === 'annually') periodsPerYear = 1;

  const totalPeriods = durationYears * periodsPerYear;
  const periodicRate = rDecimal / periodsPerYear;

  // Lump sum growth over total periods
  const lumpGrowth = initialAmount * Math.pow(Math.max(0, 1 + periodicRate), totalPeriods);

  // Future value of an ordinary annuity (contributions at end of each period)
  let annuityGrowth = 0;
  if (Math.abs(periodicRate) < 1e-12) {
    annuityGrowth = additionalAmount * totalPeriods;
  } else {
    annuityGrowth = additionalAmount * ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate);
  }

  return Math.max(0, lumpGrowth + annuityGrowth);
}

/**
 * Total Invested Capital (Initial + periodic contributions)
 */
export function calculateTotalInvested(initialAmount, durationYears, additionalAmount = 0, frequency = 'none') {
  let periodsPerYear = 0;
  if (frequency === 'monthly') periodsPerYear = 12;
  else if (frequency === 'quarterly') periodsPerYear = 4;
  else if (frequency === 'annually') periodsPerYear = 1;

  return initialAmount + (additionalAmount * periodsPerYear * durationYears);
}

/**
 * D. Expected Profit or Loss
 * Expected Profit or Loss = Future Value - Total Invested
 */
export function calculateExpectedProfitOrLoss(futureValue, totalInvested) {
  return futureValue - totalInvested;
}

/**
 * E. Total Percentage Return
 * Total Percentage Return = (Future Value - Total Invested) / Total Invested * 100
 */
export function calculateTotalPercentageReturn(futureValue, totalInvested) {
  if (totalInvested <= 0) return 0;
  return ((futureValue - totalInvested) / totalInvested) * 100;
}

/**
 * F. Estimated Volatility-Based Risk Range
 * Lower Estimate = Initial Investment * max(0, 1 + (r - sigma)/100)^n
 * Upper Estimate = Initial Investment * max(0, 1 + (r + sigma)/100)^n
 */
export function calculateVolatilityRiskRange(initialAmount, annualReturnRate, volatility, durationYears) {
  const r = annualReturnRate;
  const sigma = Math.max(0, volatility || 0);
  const n = durationYears;

  const lowerRate = (r - sigma) / 100;
  const upperRate = (r + sigma) / 100;

  const lowerEstimate = initialAmount * Math.pow(Math.max(0, 1 + lowerRate), n);
  const upperEstimate = initialAmount * Math.pow(Math.max(0, 1 + upperRate), n);

  return {
    lowerEstimate,
    upperEstimate,
    spread: upperEstimate - lowerEstimate,
    disclaimer: 'Illustrative scenario range based on constant annual return and volatility approximation. Not a statistically guaranteed minimum, maximum, or confidence interval.'
  };
}

/**
 * Factor Risk Scoring
 */
export function getVolatilityScore(volatility) {
  const v = Math.max(0, volatility || 0);
  if (v < 5) return 1;
  if (v < 10) return 2;
  if (v < 20) return 3;
  if (v < 35) return 4;
  return 5;
}

export function getAssetCategoryScore(category) {
  return ASSET_CATEGORY_SCORES[category] || 3;
}

export function getDurationScore(durationYears) {
  if (durationYears < 1) return 3;
  if (durationYears < 3) return 2;
  if (durationYears < 5) return 2;
  return 1;
}

export function getConcentrationScore(concentrationFractionOrHhi) {
  // If single asset allocation or HHI:
  // Diversified: < 35% or HHI < 0.25 => 1
  // Moderate: 35% - 60% or HHI 0.25 - 0.50 => 3
  // Highly concentrated: > 60% or HHI > 0.50 => 5
  if (concentrationFractionOrHhi <= 0.35) return 1;
  if (concentrationFractionOrHhi <= 0.60) return 3;
  return 5;
}

/**
 * Overall Weighted Risk Score (out of 5)
 * Formula:
 * Volatility: 40% (0.40)
 * Asset category: 25% (0.25)
 * Duration: 15% (0.15)
 * Concentration: 20% (0.20)
 */
export function calculateRiskScore({
  volatility = 0,
  category = 'Other',
  durationYears = 1,
  concentrationScore = 1
}) {
  const vScore = getVolatilityScore(volatility);
  const cScore = getAssetCategoryScore(category);
  const dScore = getDurationScore(durationYears);
  const concScore = typeof concentrationScore === 'number' ? concentrationScore : 1;

  const overallScore = Number((
    (vScore * 0.40) +
    (cScore * 0.25) +
    (dScore * 0.15) +
    (concScore * 0.20)
  ).toFixed(2));

  let riskLevel = 'Moderate Risk';
  let badgeColor = 'amber';
  if (overallScore < 2.3) {
    riskLevel = 'Low Risk';
    badgeColor = 'emerald';
  } else if (overallScore >= 3.6) {
    riskLevel = 'High Risk';
    badgeColor = 'rose';
  }

  // Explanations of risk drivers
  const riskDrivers = [];
  if (vScore >= 4) riskDrivers.push(`High annual volatility (${volatility}%) significantly increases portfolio unpredictability.`);
  if (cScore >= 4) riskDrivers.push(`Asset category "${category}" carries substantial market and capital risk.`);
  if (dScore >= 3) riskDrivers.push(`Short time horizon (<1 year) limits time to recover from short-term market downturns.`);
  if (concScore >= 4) riskDrivers.push('High portfolio concentration increases vulnerability to single-asset shocks.');

  if (riskDrivers.length === 0) {
    riskDrivers.push('Well-balanced risk profile with controlled volatility and appropriate time horizon.');
  }

  const suggestions = [];
  if (vScore >= 4) suggestions.push('Consider blending with lower-volatility fixed income or sovereign debt securities.');
  if (cScore >= 4) suggestions.push('Diversify across asset classes like Index Funds or Sovereign Gold Bonds.');
  if (dScore >= 3) suggestions.push('Align short-term commitments with liquid, capital-preserving instruments.');
  if (concScore >= 4) suggestions.push('Spread capital across non-correlated asset classes to reduce HHI concentration.');

  return {
    overallScore,
    riskLevel,
    badgeColor,
    factors: {
      volatility: { value: volatility, score: vScore, weight: 0.40 },
      category: { value: category, score: cScore, weight: 0.25 },
      duration: { value: durationYears, score: dScore, weight: 0.15 },
      concentration: { score: concScore, weight: 0.20 }
    },
    riskDrivers,
    suggestions,
    educationalDisclaimer: 'This scoring model is educational and deterministic. It does not constitute formal financial suitability advice.'
  };
}

/**
 * Portfolio Diversification Analysis & HHI
 * HHI = Sum of squared allocation fractions (e.g. 0.5^2 + 0.5^2 = 0.50)
 * Effective Number of Holdings = 1 / HHI
 */
export function calculateDiversification(items = []) {
  if (!items || items.length === 0) {
    return {
      hhi: 0,
      scaledHhi: 0,
      effectiveHoldings: 0,
      largestAllocation: 0,
      assetCount: 0,
      categoryCount: 0,
      diversificationLevel: 'None',
      warning: 'Portfolio is empty. Add investments to evaluate diversification.',
      allocations: []
    };
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.initial_amount) || 0), 0);
  if (totalAmount <= 0) {
    return {
      hhi: 0,
      scaledHhi: 0,
      effectiveHoldings: 0,
      largestAllocation: 0,
      assetCount: items.length,
      categoryCount: 0,
      diversificationLevel: 'None',
      warning: 'Total portfolio capital is zero.',
      allocations: []
    };
  }

  // Calculate allocation fractions per item
  const allocations = items.map(item => {
    const amount = Number(item.initial_amount) || 0;
    const fraction = amount / totalAmount;
    return {
      id: item.id,
      name: item.name,
      category: item.asset_category,
      amount,
      fraction,
      percentage: Number((fraction * 100).toFixed(2))
    };
  });

  // Calculate HHI = sum of (fraction_i)^2
  const hhi = Number(allocations.reduce((sum, a) => sum + Math.pow(a.fraction, 2), 0).toFixed(4));
  const scaledHhi = Math.round(hhi * 10000); // 0 to 10,000 scale
  const effectiveHoldings = hhi > 0 ? Number((1 / hhi).toFixed(2)) : 0;

  // Category counts and distribution
  const categoryMap = {};
  allocations.forEach(a => {
    categoryMap[a.category] = (categoryMap[a.category] || 0) + a.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => {
    const fraction = amount / totalAmount;
    return {
      category,
      amount,
      fraction,
      percentage: Number((fraction * 100).toFixed(2))
    };
  }).sort((a, b) => b.amount - a.amount);

  const largestItem = allocations.reduce((max, a) => a.fraction > max.fraction ? a : max, allocations[0]);
  const largestCategory = categoryBreakdown[0];

  let diversificationLevel = 'Well Diversified';
  let warning = null;

  if (items.length === 1) {
    diversificationLevel = 'Very Poor (Single Asset)';
    warning = 'Entire portfolio is concentrated in a single investment (100%). Single-asset risk is extremely high.';
  } else if (largestItem.fraction > 0.50 || hhi > 0.40) {
    diversificationLevel = 'Poor Concentration';
    warning = `Single investment "${largestItem.name}" comprises ${largestItem.percentage}% of the portfolio, exposing you to concentrated downside.`;
  } else if (largestCategory && largestCategory.fraction > 0.60) {
    diversificationLevel = 'Moderate Concentration';
    warning = `Asset class "${largestCategory.category}" constitutes ${largestCategory.percentage}% of your holdings. Consider cross-asset diversification.`;
  } else if (categoryBreakdown.length >= 3 && hhi <= 0.25) {
    diversificationLevel = 'High Diversification';
    warning = null;
  }

  return {
    totalAmount,
    hhi,
    scaledHhi,
    effectiveHoldings,
    largestAllocation: largestItem ? largestItem.percentage : 0,
    largestCategoryAllocation: largestCategory ? largestCategory.percentage : 0,
    assetCount: items.length,
    categoryCount: categoryBreakdown.length,
    diversificationLevel,
    warning,
    allocations,
    categoryBreakdown,
    academicExplanation: 'Diversification reduces unsystematic (idiosyncratic) risk through non-correlated holdings. It cannot eliminate systematic market risk.'
  };
}

/**
 * Aggregate Portfolio Metrics
 */
export function calculatePortfolioSummary(investments = []) {
  if (!investments || investments.length === 0) {
    return {
      totalInvested: 0,
      currentPortfolioValue: 0,
      expectedReturnPercentage: 0,
      expectedProfitOrLoss: 0,
      investmentCount: 0,
      weightedVolatility: 0,
      overallRiskScore: 0,
      overallRiskLevel: 'No Data',
      diversification: calculateDiversification([])
    };
  }

  const totalInvested = investments.reduce((sum, inv) => sum + (Number(inv.initial_amount) || 0), 0);

  if (totalInvested <= 0) {
    return {
      totalInvested: 0,
      currentPortfolioValue: 0,
      expectedReturnPercentage: 0,
      expectedProfitOrLoss: 0,
      investmentCount: investments.length,
      weightedVolatility: 0,
      overallRiskScore: 0,
      overallRiskLevel: 'No Data',
      diversification: calculateDiversification(investments)
    };
  }

  let totalFutureValue = 0;
  let weightedReturnSum = 0;
  let weightedVolatilitySum = 0;
  let weightedRiskScoreSum = 0;

  investments.forEach(inv => {
    const amount = Number(inv.initial_amount) || 0;
    const weight = amount / totalInvested;
    const r = Number(inv.expected_return) || 0;
    const vol = Number(inv.expected_volatility) || 0;
    const dur = Number(inv.duration_years) || 1;

    // Compound future value for individual holding
    const fv = calculateCompoundFutureValue(amount, r, dur);
    totalFutureValue += fv;

    weightedReturnSum += weight * r;
    weightedVolatilitySum += weight * vol;

    const singleRisk = calculateRiskScore({
      volatility: vol,
      category: inv.asset_category,
      durationYears: dur,
      concentrationScore: getConcentrationScore(weight)
    });
    weightedRiskScoreSum += weight * singleRisk.overallScore;
  });

  const expectedReturnPercentage = Number(weightedReturnSum.toFixed(2));
  const weightedVolatility = Number(weightedVolatilitySum.toFixed(2));
  const expectedProfitOrLoss = totalFutureValue - totalInvested;
  const overallRiskScore = Number(weightedRiskScoreSum.toFixed(2));

  let overallRiskLevel = 'Moderate Risk';
  if (overallRiskScore < 2.3) overallRiskLevel = 'Low Risk';
  else if (overallRiskScore >= 3.6) overallRiskLevel = 'High Risk';

  const diversification = calculateDiversification(investments);

  return {
    totalInvested: Number(totalInvested.toFixed(2)),
    currentPortfolioValue: Number(totalFutureValue.toFixed(2)),
    expectedReturnPercentage,
    expectedProfitOrLoss: Number(expectedProfitOrLoss.toFixed(2)),
    investmentCount: investments.length,
    weightedVolatility,
    overallRiskScore,
    overallRiskLevel,
    diversification
  };
}

/**
 * Scenario Simulator Engine
 * Generates Pessimistic (r - sigma), Base Case (r), and Optimistic (r + sigma) projections
 * Over time t = 0 to n
 */
export function simulateScenarios({
  initialAmount,
  annualReturn,
  volatility = 0,
  durationYears,
  additionalAmount = 0,
  frequency = 'none'
}) {
  const r = annualReturn;
  const sigma = Math.max(0, volatility || 0);
  const n = Math.max(1, Math.round(durationYears));

  const scenarios = {
    pessimistic: {
      name: 'Pessimistic Scenario',
      rate: r - sigma,
      description: `Assumes adverse market conditions (r - σ = ${Number((r - sigma).toFixed(2))}%)`
    },
    base: {
      name: 'Base Case Scenario',
      rate: r,
      description: `Assumes baseline expected returns (r = ${Number(r.toFixed(2))}%)`
    },
    optimistic: {
      name: 'Optimistic Scenario',
      rate: r + sigma,
      description: `Assumes favorable market outperformance (r + σ = ${Number((r + sigma).toFixed(2))}%)`
    }
  };

  const yearlyProgression = [];
  for (let year = 0; year <= n; year++) {
    const investedToYear = calculateTotalInvested(initialAmount, year, additionalAmount, frequency);
    const pessVal = calculateCompoundFutureValue(initialAmount, scenarios.pessimistic.rate, year, additionalAmount, frequency);
    const baseVal = calculateCompoundFutureValue(initialAmount, scenarios.base.rate, year, additionalAmount, frequency);
    const optVal = calculateCompoundFutureValue(initialAmount, scenarios.optimistic.rate, year, additionalAmount, frequency);

    yearlyProgression.push({
      year,
      invested: Number(investedToYear.toFixed(2)),
      pessimistic: Number(pessVal.toFixed(2)),
      baseCase: Number(baseVal.toFixed(2)),
      optimistic: Number(optVal.toFixed(2))
    });
  }

  const finalYear = yearlyProgression[yearlyProgression.length - 1];
  const totalInvested = finalYear.invested;

  const summary = {
    initialAmount,
    totalInvested,
    durationYears: n,
    volatility: sigma,
    pessimistic: {
      annualRate: scenarios.pessimistic.rate,
      finalValue: finalYear.pessimistic,
      profitOrLoss: Number((finalYear.pessimistic - totalInvested).toFixed(2)),
      percentageReturn: calculateTotalPercentageReturn(finalYear.pessimistic, totalInvested)
    },
    baseCase: {
      annualRate: scenarios.base.rate,
      finalValue: finalYear.baseCase,
      profitOrLoss: Number((finalYear.baseCase - totalInvested).toFixed(2)),
      percentageReturn: calculateTotalPercentageReturn(finalYear.baseCase, totalInvested)
    },
    optimistic: {
      annualRate: scenarios.optimistic.rate,
      finalValue: finalYear.optimistic,
      profitOrLoss: Number((finalYear.optimistic - totalInvested).toFixed(2)),
      percentageReturn: calculateTotalPercentageReturn(finalYear.optimistic, totalInvested)
    }
  };

  return {
    summary,
    yearlyProgression,
    disclaimer: 'Hypothetical projections for academic and illustrative purposes only. Actual financial outcomes are subject to non-linear market risks.'
  };
}
