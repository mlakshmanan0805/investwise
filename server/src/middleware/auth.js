import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'investwise_academic_jwt_secret_key_2026_xyz987';

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No authorization token provided.'
      });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired authentication session. Please log in again.'
        });
      }

      const db = getDatabase();
      const user = db.prepare('SELECT id, email, full_name, risk_tolerance, created_at FROM users WHERE id = ?').get(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User account associated with this session no longer exists.'
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal authentication error: ' + error.message
    });
  }
}

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      risk_tolerance: user.risk_tolerance
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
