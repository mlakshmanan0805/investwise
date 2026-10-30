import { getDatabase } from '../database/db.js';
import { 
  validateCalculationInputs, 
  calculateCompoundFutureValue, 
  calculateExpectedProfitOrLoss,
  calculateTotalPercentageReturn,
  calculateVolatilityRiskRange,
  calculateRiskScore,
  getConcentrationScore
} from '../utils/calculations.js';
import { SAMPLE_INVESTMENTS } from '../utils/sampleData.js';

export function getInvestments(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    let query = 'SELECT * FROM investments WHERE user_id = ?';
    const params = [userId];

    if (category && category !== 'All') {
      query += ' AND asset_category = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      query += ' AND name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    // Allowed sort columns
    const allowedSortColumns = {
      'name': 'name',
      'amount': 'initial_amount',
      'return': 'expected_return',
      'volatility': 'expected_volatility',
      'duration': 'duration_years',
      'created_at': 'created_at'
    };

    const sortCol = allowedSortColumns[sortBy] || 'created_at';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortCol} ${direction}`;

    const rows = db.prepare(query).all(...params);

    // Enrich rows with real-time calculated values
    const enriched = rows.map(inv => {
      const fv = calculateCompoundFutureValue(inv.initial_amount, inv.expected_return, inv.duration_years);
      const profit = calculateExpectedProfitOrLoss(fv, inv.initial_amount);
      const pctReturn = calculateTotalPercentageReturn(fv, inv.initial_amount);
      const risk = calculateRiskScore({
        volatility: inv.expected_volatility,
        category: inv.asset_category,
        durationYears: inv.duration_years,
        concentrationScore: 1
      });
      const range = calculateVolatilityRiskRange(inv.initial_amount, inv.expected_return, inv.expected_volatility, inv.duration_years);

      return {
        ...inv,
        future_value: Number(fv.toFixed(2)),
        expected_profit: Number(profit.toFixed(2)),
        percentage_return: Number(pctReturn.toFixed(2)),
        risk_score: risk.overallScore,
        risk_level: risk.riskLevel,
        badge_color: risk.badgeColor,
        lower_estimate: Number(range.lowerEstimate.toFixed(2)),
        upper_estimate: Number(range.upperEstimate.toFixed(2))
      };
    });

    // Support sorting by computed risk_score if requested
    if (sortBy === 'risk') {
      enriched.sort((a, b) => sortOrder.toUpperCase() === 'ASC' 
        ? a.risk_score - b.risk_score 
        : b.risk_score - a.risk_score);
    }

    return res.status(200).json({
      success: true,
      count: enriched.length,
      investments: enriched
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve investments: ' + error.message
    });
  }
}

export function getInvestmentById(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const inv = db.prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?').get(id, userId);
    if (!inv) {
      return res.status(404).json({
        success: false,
        error: 'Investment record not found or unauthorized access.'
      });
    }

    const fv = calculateCompoundFutureValue(inv.initial_amount, inv.expected_return, inv.duration_years);
    const profit = calculateExpectedProfitOrLoss(fv, inv.initial_amount);
    const pctReturn = calculateTotalPercentageReturn(fv, inv.initial_amount);
    const risk = calculateRiskScore({
      volatility: inv.expected_volatility,
      category: inv.asset_category,
      durationYears: inv.duration_years
    });
    const range = calculateVolatilityRiskRange(inv.initial_amount, inv.expected_return, inv.expected_volatility, inv.duration_years);

    // Fetch related activities and valuation history
    const activities = db.prepare('SELECT * FROM investment_activities WHERE investment_id = ? AND user_id = ? ORDER BY activity_date DESC').all(id, userId);
    const valuations = db.prepare('SELECT * FROM valuation_history WHERE investment_id = ? AND user_id = ? ORDER BY valuation_date ASC').all(id, userId);

    return res.status(200).json({
      success: true,
      investment: {
        ...inv,
        future_value: Number(fv.toFixed(2)),
        expected_profit: Number(profit.toFixed(2)),
        percentage_return: Number(pctReturn.toFixed(2)),
        risk_score: risk.overallScore,
        risk_level: risk.riskLevel,
        risk_factors: risk.factors,
        risk_drivers: risk.riskDrivers,
        suggestions: risk.suggestions,
        lower_estimate: Number(range.lowerEstimate.toFixed(2)),
        upper_estimate: Number(range.upperEstimate.toFixed(2)),
        activities,
        valuations
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve investment details: ' + error.message
    });
  }
}

export function addInvestment(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const {
      name,
      asset_category,
      initial_amount,
      expected_return,
      expected_volatility = 0,
      duration_years,
      risk_tolerance = 'Moderate',
      notes = ''
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Investment name is required.'
      });
    }

    const validCategories = [
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

    if (!asset_category || !validCategories.includes(asset_category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid asset category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Number conversions
    const pAmount = Number(initial_amount);
    const pReturn = Number(expected_return);
    const pVol = Number(expected_volatility);
    const pDur = Number(duration_years);

    const validation = validateCalculationInputs({
      initialAmount: pAmount,
      annualReturn: pReturn,
      volatility: pVol,
      durationYears: pDur
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(' ')
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO investments (
        user_id, name, asset_category, initial_amount, 
        expected_return, expected_volatility, duration_years, 
        risk_tolerance, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      userId,
      name.trim(),
      asset_category,
      pAmount,
      pReturn,
      pVol,
      pDur,
      risk_tolerance,
      notes ? notes.trim() : ''
    );

    const newId = result.lastInsertRowid;

    // Automatically record an "Initial Investment" activity
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO investment_activities (
        user_id, investment_id, activity_type, amount, activity_date, notes
      ) VALUES (?, ?, 'Initial Investment', ?, ?, ?)
    `).run(userId, newId, pAmount, today, `Initial allocation for ${name.trim()}`);

    // Also record baseline initial valuation in valuation_history
    db.prepare(`
      INSERT INTO valuation_history (
        user_id, investment_id, valuation_amount, valuation_date, notes
      ) VALUES (?, ?, ?, ?, 'Initial acquisition cost basis')
    `).run(userId, newId, pAmount, today);

    const created = db.prepare('SELECT * FROM investments WHERE id = ?').get(newId);

    return res.status(201).json({
      success: true,
      message: 'Investment saved successfully!',
      investment: created
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to add investment: ' + error.message
    });
  }
}

export function updateInvestment(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Investment record not found or unauthorized access.'
      });
    }

    const {
      name,
      asset_category,
      initial_amount,
      expected_return,
      expected_volatility,
      duration_years,
      risk_tolerance,
      notes
    } = req.body;

    const updatedName = name ? name.trim() : existing.name;
    const updatedCategory = asset_category || existing.asset_category;
    const pAmount = initial_amount !== undefined ? Number(initial_amount) : existing.initial_amount;
    const pReturn = expected_return !== undefined ? Number(expected_return) : existing.expected_return;
    const pVol = expected_volatility !== undefined ? Number(expected_volatility) : existing.expected_volatility;
    const pDur = duration_years !== undefined ? Number(duration_years) : existing.duration_years;
    const updatedTolerance = risk_tolerance || existing.risk_tolerance;
    const updatedNotes = notes !== undefined ? notes : existing.notes;

    const validation = validateCalculationInputs({
      initialAmount: pAmount,
      annualReturn: pReturn,
      volatility: pVol,
      durationYears: pDur
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(' ')
      });
    }

    db.prepare(`
      UPDATE investments
      SET name = ?, asset_category = ?, initial_amount = ?,
          expected_return = ?, expected_volatility = ?, duration_years = ?,
          risk_tolerance = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      updatedName,
      updatedCategory,
      pAmount,
      pReturn,
      pVol,
      pDur,
      updatedTolerance,
      updatedNotes,
      id,
      userId
    );

    const updated = db.prepare('SELECT * FROM investments WHERE id = ?').get(id);

    return res.status(200).json({
      success: true,
      message: 'Investment updated successfully!',
      investment: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update investment: ' + error.message
    });
  }
}

export function deleteInvestment(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { id } = req.params;

    const existing = db.prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found or unauthorized access.'
      });
    }

    db.prepare('DELETE FROM investments WHERE id = ? AND user_id = ?').run(id, userId);

    return res.status(200).json({
      success: true,
      message: `Investment "${existing.name}" removed successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete investment: ' + error.message
    });
  }
}

export function loadSamplePortfolio(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const inserted = [];
    for (const sample of SAMPLE_INVESTMENTS) {
      const resStmt = db.prepare(`
        INSERT INTO investments (
          user_id, name, asset_category, initial_amount, 
          expected_return, expected_volatility, duration_years, 
          risk_tolerance, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        sample.name,
        sample.asset_category,
        sample.initial_amount,
        sample.expected_return,
        sample.expected_volatility,
        sample.duration_years,
        sample.risk_tolerance,
        sample.notes
      );

      const invId = resStmt.lastInsertRowid;

      // Activity
      db.prepare(`
        INSERT INTO investment_activities (
          user_id, investment_id, activity_type, amount, activity_date, notes
        ) VALUES (?, ?, 'Initial Investment', ?, ?, ?)
      `).run(userId, invId, sample.initial_amount, today, 'Sample portfolio demonstration initial investment');

      // Valuation
      db.prepare(`
        INSERT INTO valuation_history (
          user_id, investment_id, valuation_amount, valuation_date, notes
        ) VALUES (?, ?, ?, ?, 'Sample portfolio acquisition baseline')
      `).run(userId, invId, sample.initial_amount, today);

      inserted.push(invId);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully loaded ${inserted.length} sample investments into your portfolio!`,
      count: inserted.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to load sample portfolio: ' + error.message
    });
  }
}
