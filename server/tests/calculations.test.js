import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCalculationInputs,
  calculateSimpleAnnualReturn,
  calculateTotalSimpleReturn,
  calculateCompoundFutureValue,
  calculateExpectedProfitOrLoss,
  calculateTotalPercentageReturn,
  calculateVolatilityRiskRange,
  calculateRiskScore,
  calculateDiversification,
  calculatePortfolioSummary,
  simulateScenarios
} from '../src/utils/calculations.js';

describe('Financial Calculation Engine - Academic Master Test Suite', () => {

  it('Test 1: Rs 10,000 at 10% annual return for 1 year yields FV = Rs 11,000 and Profit = Rs 1,000', () => {
    const principal = 10000;
    const rate = 10;
    const duration = 1;

    const fv = calculateCompoundFutureValue(principal, rate, duration);
    const profit = calculateExpectedProfitOrLoss(fv, principal);

    assert.equal(Math.round(fv), 11000, 'Future value must equal Rs 11,000');
    assert.equal(Math.round(profit), 1000, 'Expected profit must equal Rs 1,000');
  });

  it('Test 2: Rs 10,000 at 10% annual return for 2 years yields FV = Rs 12,100 and Profit = Rs 2,100', () => {
    const principal = 10000;
    const rate = 10;
    const duration = 2;

    const fv = calculateCompoundFutureValue(principal, rate, duration);
    const profit = calculateExpectedProfitOrLoss(fv, principal);

    assert.equal(Math.round(fv), 12100, 'Future value after 2 years compounding must equal Rs 12,100');
    assert.equal(Math.round(profit), 2100, 'Expected profit must equal Rs 2,100');
  });

  it('Test 3: Rs 10,000 at -10% negative annual return for 1 year yields FV = Rs 9,000 and Profit = -Rs 1,000', () => {
    const principal = 10000;
    const rate = -10;
    const duration = 1;

    const fv = calculateCompoundFutureValue(principal, rate, duration);
    const profit = calculateExpectedProfitOrLoss(fv, principal);

    assert.equal(Math.round(fv), 9000, 'Future value under negative return must equal Rs 9,000');
    assert.equal(Math.round(profit), -1000, 'Expected profit under negative return must equal -Rs 1,000');
  });

  it('Test 4: Rs 10,000 at 10% return, 5% volatility for 1 year yields Lower = Rs 10,500 and Upper = Rs 11,500', () => {
    const principal = 10000;
    const rate = 10;
    const volatility = 5;
    const duration = 1;

    const range = calculateVolatilityRiskRange(principal, rate, volatility, duration);

    assert.equal(Math.round(range.lowerEstimate), 10500, 'Lower illustrative estimate must equal Rs 10,500');
    assert.equal(Math.round(range.upperEstimate), 11500, 'Upper illustrative estimate must equal Rs 11,500');
  });

  it('Test 5: Equal 50/50 portfolio allocation yields HHI = 0.50 and Effective Holdings = 2', () => {
    const mockInvestments = [
      { id: 1, name: 'Asset A', asset_category: 'Equity', initial_amount: 50000 },
      { id: 2, name: 'Asset B', asset_category: 'Government Bonds', initial_amount: 50000 }
    ];

    const result = calculateDiversification(mockInvestments);

    assert.equal(result.hhi, 0.50, 'HHI for equal 50/50 weights must be 0.50');
    assert.equal(result.effectiveHoldings, 2, 'Effective number of equally weighted holdings must be 2');
  });

  it('Test 6: Validation rejects zero and negative investment amount', () => {
    const testZero = validateCalculationInputs({ initialAmount: 0, annualReturn: 10, durationYears: 1 });
    assert.equal(testZero.isValid, false, 'Zero investment amount must be rejected');
    assert.match(testZero.errors[0], /greater than zero/i);

    const testNegative = validateCalculationInputs({ initialAmount: -500, annualReturn: 10, durationYears: 1 });
    assert.equal(testNegative.isValid, false, 'Negative investment amount must be rejected');
  });

  it('Test 7: Validation rejects negative and zero investment duration', () => {
    const testZeroDur = validateCalculationInputs({ initialAmount: 10000, annualReturn: 10, durationYears: 0 });
    assert.equal(testZeroDur.isValid, false, 'Zero duration must be rejected');

    const testNegativeDur = validateCalculationInputs({ initialAmount: 10000, annualReturn: 10, durationYears: -3 });
    assert.equal(testNegativeDur.isValid, false, 'Negative duration must be rejected');
  });

  it('Test 8: Validation rejects negative volatility', () => {
    const testNegativeVol = validateCalculationInputs({
      initialAmount: 10000,
      annualReturn: 10,
      durationYears: 2,
      volatility: -5
    });
    assert.equal(testNegativeVol.isValid, false, 'Negative volatility must be rejected');
    assert.match(testNegativeVol.errors[0], /cannot be negative/i);
  });

  it('Test 9: Validation rejects NaN and Infinity inputs', () => {
    const testNaN = validateCalculationInputs({
      initialAmount: NaN,
      annualReturn: 10,
      durationYears: 1
    });
    assert.equal(testNaN.isValid, false, 'NaN amount must be rejected');

    const testInf = validateCalculationInputs({
      initialAmount: 10000,
      annualReturn: Infinity,
      durationYears: 1
    });
    assert.equal(testInf.isValid, false, 'Infinity return must be rejected');

    const testDurInf = validateCalculationInputs({
      initialAmount: 10000,
      annualReturn: 8,
      durationYears: -Infinity
    });
    assert.equal(testDurInf.isValid, false, '-Infinity duration must be rejected');
  });

  it('Scenario Simulator calculates pessimistic, base case, and optimistic paths correctly', () => {
    const sim = simulateScenarios({
      initialAmount: 10000,
      annualReturn: 12,
      volatility: 6,
      durationYears: 2
    });

    assert.equal(sim.summary.pessimistic.annualRate, 6, 'Pessimistic annual rate is 12 - 6 = 6%');
    assert.equal(sim.summary.baseCase.annualRate, 12, 'Base case annual rate is 12%');
    assert.equal(sim.summary.optimistic.annualRate, 18, 'Optimistic annual rate is 12 + 6 = 18%');
    assert.equal(sim.yearlyProgression.length, 3, 'Progression contains years 0, 1, 2');
  });

  it('Portfolio summary handles empty portfolio gracefully', () => {
    const emptySummary = calculatePortfolioSummary([]);
    assert.equal(emptySummary.totalInvested, 0);
    assert.equal(emptySummary.currentPortfolioValue, 0);
    assert.equal(emptySummary.investmentCount, 0);
    assert.equal(emptySummary.overallRiskLevel, 'No Data');
  });
});
