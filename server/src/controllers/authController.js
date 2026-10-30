import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';

export function register(req, res) {
  try {
    const { email, password, full_name, risk_tolerance = 'Moderate' } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, valid email address, and a password.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email format.'
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters in length.'
      });
    }

    const validTolerances = ['Conservative', 'Moderate', 'Aggressive'];
    const selectedTolerance = validTolerances.includes(risk_tolerance) ? risk_tolerance : 'Moderate';

    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const insertStmt = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, risk_tolerance)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertStmt.run(email.toLowerCase().trim(), password_hash, full_name.trim(), selectedTolerance);
    const newUser = db.prepare('SELECT id, email, full_name, risk_tolerance, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: newUser,
      token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
}

export function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both email and password.'
      });
    }

    const db = getDatabase();
    const user = db.prepare('SELECT id, email, password_hash, full_name, risk_tolerance, created_at FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password credentials.'
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      risk_tolerance: user.risk_tolerance,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: safeUser,
      token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
}

export function getCurrentUser(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

export function updateProfile(req, res) {
  try {
    const { full_name, risk_tolerance, new_password, current_password } = req.body;
    const db = getDatabase();

    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    let updatedName = currentUser.full_name;
    if (full_name && typeof full_name === 'string') {
      updatedName = full_name.trim();
    }

    const validTolerances = ['Conservative', 'Moderate', 'Aggressive'];
    let updatedTolerance = currentUser.risk_tolerance;
    if (risk_tolerance && validTolerances.includes(risk_tolerance)) {
      updatedTolerance = risk_tolerance;
    }

    let updatedHash = currentUser.password_hash;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to set a new password.'
        });
      }
      const match = bcrypt.compareSync(current_password, currentUser.password_hash);
      if (!match) {
        return res.status(400).json({
          success: false,
          error: 'Current password does not match.'
        });
      }
      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters long.'
        });
      }
      updatedHash = bcrypt.hashSync(new_password, bcrypt.genSaltSync(10));
    }

    db.prepare(`
      UPDATE users
      SET full_name = ?, risk_tolerance = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(updatedName, updatedTolerance, updatedHash, req.user.id);

    const refreshed = db.prepare('SELECT id, email, full_name, risk_tolerance, created_at, updated_at FROM users WHERE id = ?').get(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: refreshed
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile: ' + error.message
    });
  }
}

export function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}
