import app from './app.js';
import { getDatabase } from './database/db.js';
import { exec } from 'node:child_process';

const PORT = process.env.PORT || 5000;

// Initialize Database on startup
try {
  const db = getDatabase();
  console.log('✅ SQLite Database successfully initialized and verified.');
} catch (error) {
  console.error('❌ Failed to initialize SQLite database:', error);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`🚀 InvestWise Server running on ${url}`);
  console.log(`📊 Health check available at ${url}/api/health`);

  // Auto-open browser in production mode if not running under tests or disabled
  if (process.env.AUTO_OPEN === 'true') {
    const startCmd = process.platform === 'win32' ? `start ${url}` 
      : process.platform === 'darwin' ? `open ${url}` 
      : `xdg-open ${url}`;
    exec(startCmd, () => {});
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down server gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
  });
});
