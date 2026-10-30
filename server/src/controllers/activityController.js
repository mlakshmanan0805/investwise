import { getDatabase } from '../database/db.js';

export function getActivities(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { investmentId } = req.query;

    let query = `
      SELECT a.*, i.name as investment_name, i.asset_category
      FROM investment_activities a
      JOIN investments i ON a.investment_id = i.id
      WHERE a.user_id = ?
    `;
    const params = [userId];

    if (investmentId) {
      query += ' AND a.investment_id = ?';
      params.push(investmentId);
    }

    query += ' ORDER BY a.activity_date DESC, a.id DESC';

    const activities = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve investment activities: ' + error.message
    });
  }
}

export function addActivity(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const {
      investment_id,
      activity_type,
      amount,
      activity_date,
      notes = ''
    } = req.body;

    if (!investment_id || !activity_type || !amount || !activity_date) {
      return res.status(400).json({
        success: false,
        error: 'Investment, activity type, amount, and date are required.'
      });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Activity amount must be a positive number greater than zero.'
      });
    }

    const validTypes = [
      'Initial Investment',
      'Additional Contribution',
      'Withdrawal',
      'Manual Valuation Update'
    ];

    if (!validTypes.includes(activity_type)) {
      return res.status(400).json({
        success: false,
        error: `Activity type must be one of: ${validTypes.join(', ')}`
      });
    }

    // Verify investment ownership
    const inv = db.prepare('SELECT * FROM investments WHERE id = ? AND user_id = ?').get(investment_id, userId);
    if (!inv) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found or unauthorized access.'
      });
    }

    // Begin database transaction
    db.exec('BEGIN TRANSACTION;');

    try {
      // Insert activity record
      const stmt = db.prepare(`
        INSERT INTO investment_activities (
          user_id, investment_id, activity_type, amount, activity_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      const actResult = stmt.run(userId, investment_id, activity_type, numAmount, activity_date, notes ? notes.trim() : '');

      // Adjust investment initial_amount if it is a cash contribution or withdrawal
      if (activity_type === 'Additional Contribution') {
        db.prepare('UPDATE investments SET initial_amount = initial_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(numAmount, investment_id);
      } else if (activity_type === 'Withdrawal') {
        if (numAmount > inv.initial_amount) {
          db.exec('ROLLBACK;');
          return res.status(400).json({
            success: false,
            error: `Withdrawal amount (Rs ${numAmount}) cannot exceed recorded investment principal (Rs ${inv.initial_amount}).`
          });
        }
        db.prepare('UPDATE investments SET initial_amount = initial_amount - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
          .run(numAmount, investment_id);
      } else if (activity_type === 'Manual Valuation Update') {
        // Record valuation snapshot
        db.prepare(`
          INSERT INTO valuation_history (
            user_id, investment_id, valuation_amount, valuation_date, notes
          ) VALUES (?, ?, ?, ?, ?)
        `).run(userId, investment_id, numAmount, activity_date, notes || 'Manual valuation adjustment');
      }

      db.exec('COMMIT;');

      const created = db.prepare('SELECT * FROM investment_activities WHERE id = ?').get(actResult.lastInsertRowid);
      return res.status(201).json({
        success: true,
        message: `${activity_type} recorded successfully!`,
        activity: created
      });
    } catch (innerErr) {
      db.exec('ROLLBACK;');
      throw innerErr;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to record activity: ' + error.message
    });
  }
}

export function getValuationHistory(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { investmentId } = req.query;

    let query = `
      SELECT v.*, i.name as investment_name
      FROM valuation_history v
      JOIN investments i ON v.investment_id = i.id
      WHERE v.user_id = ?
    `;
    const params = [userId];

    if (investmentId) {
      query += ' AND v.investment_id = ?';
      params.push(investmentId);
    }

    query += ' ORDER BY v.valuation_date ASC, v.id ASC';

    const history = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: history.length,
      history,
      hasSufficientData: history.length >= 2,
      notice: history.length < 2 ? 'Insufficient historical data to construct multi-period performance curves.' : null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve valuation history: ' + error.message
    });
  }
}

export function addValuationRecord(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { investment_id, valuation_amount, valuation_date, notes = '' } = req.body;

    if (!investment_id || valuation_amount === undefined || !valuation_date) {
      return res.status(400).json({
        success: false,
        error: 'Investment ID, valuation amount, and date are required.'
      });
    }

    const numVal = Number(valuation_amount);
    if (isNaN(numVal) || !isFinite(numVal) || numVal < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valuation amount must be a non-negative number.'
      });
    }

    const inv = db.prepare('SELECT id FROM investments WHERE id = ? AND user_id = ?').get(investment_id, userId);
    if (!inv) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found or unauthorized access.'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO valuation_history (
        user_id, investment_id, valuation_amount, valuation_date, notes
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(userId, investment_id, numVal, valuation_date, notes ? notes.trim() : '');
    const created = db.prepare('SELECT * FROM valuation_history WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Valuation record saved successfully!',
      valuation: created
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to record valuation: ' + error.message
    });
  }
}
