import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path resolution
const dbDirectory = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = process.env.DB_PATH 
  ? path.resolve(process.cwd(), process.env.DB_PATH) 
  : path.join(dbDirectory, 'investwise.db');

// Ensure parent dir of DB_PATH exists
const parentDir = path.dirname(dbPath);
if (!fs.existsSync(parentDir)) {
  fs.mkdirSync(parentDir, { recursive: true });
}

let dbInstance = null;

export function getDatabase(customPath) {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const activePath = customPath || dbPath;
  const db = new DatabaseSync(activePath);

  // Enforce foreign key constraints and WAL mode
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  initSchema(db);

  if (!customPath) {
    dbInstance = db;
  }
  return db;
}

export function initSchema(db) {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      risk_tolerance TEXT DEFAULT 'Moderate' CHECK(risk_tolerance IN ('Conservative', 'Moderate', 'Aggressive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Investments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      asset_category TEXT NOT NULL CHECK(asset_category IN (
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
      )),
      initial_amount REAL NOT NULL CHECK(initial_amount > 0),
      expected_return REAL NOT NULL,
      expected_volatility REAL NOT NULL DEFAULT 0 CHECK(expected_volatility >= 0),
      duration_years REAL NOT NULL CHECK(duration_years > 0),
      risk_tolerance TEXT DEFAULT 'Moderate' CHECK(risk_tolerance IN ('Conservative', 'Moderate', 'Aggressive')),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Investment Activities Table (Transactions, cash flows, contributions, withdrawals)
  db.exec(`
    CREATE TABLE IF NOT EXISTS investment_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      investment_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL CHECK(activity_type IN (
        'Initial Investment',
        'Additional Contribution',
        'Withdrawal',
        'Manual Valuation Update'
      )),
      amount REAL NOT NULL CHECK(amount > 0),
      activity_date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
    );
  `);

  // 4. Valuation History Table (Historical date-stamped valuations)
  db.exec(`
    CREATE TABLE IF NOT EXISTS valuation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      investment_id INTEGER NOT NULL,
      valuation_amount REAL NOT NULL CHECK(valuation_amount >= 0),
      valuation_date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
    );
  `);

  // 5. Quiz Results Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      percentage REAL NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create performance and security indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
    CREATE INDEX IF NOT EXISTS idx_activities_investment ON investment_activities(investment_id);
    CREATE INDEX IF NOT EXISTS idx_activities_user ON investment_activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_valuation_investment ON valuation_history(investment_id);
    CREATE INDEX IF NOT EXISTS idx_valuation_user ON valuation_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_results(user_id);
  `);
}

export default getDatabase;
