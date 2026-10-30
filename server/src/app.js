import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import {
  validateCalculationInputs,
  calculateSimpleAnnualReturn,
  calculateTotalSimpleReturn,
  calculateCompoundFutureValue,
  calculateExpectedProfitOrLoss,
  calculateTotalPercentageReturn,
  calculateVolatilityRiskRange,
  calculateRiskScore
} from './utils/calculations.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and middleware
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) 
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000', 'http://127.0.0.1:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.railway.app') ||
      origin.endsWith('.up.railway.app') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.lhr.life')
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed for this origin.'));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health Check Endpoint (Required by Section 14)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'InvestWise – Investment Risk and Return Analyzer',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Standalone Financial Calculation API (Usable without auth for public calculator exploration)
app.post('/api/calculate', (req, res) => {
  try {
    const {
      initialAmount,
      annualReturn,
      durationYears,
      volatility = 0,
      category = 'Other',
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
        errors: validation.errors
      });
    }

    const simpleAnnualReturn = calculateSimpleAnnualReturn(pAmount, pReturn);
    const totalSimpleReturn = calculateTotalSimpleReturn(pAmount, pReturn, pDur);
    const compoundFutureValue = calculateCompoundFutureValue(pAmount, pReturn, pDur, pAdd, frequency);
    const totalInvested = pAmount + (frequency === 'monthly' ? pAdd * 12 * pDur : frequency === 'quarterly' ? pAdd * 4 * pDur : frequency === 'annually' ? pAdd * pDur : 0);
    const expectedProfit = calculateExpectedProfitOrLoss(compoundFutureValue, totalInvested);
    const totalPercentageReturn = calculateTotalPercentageReturn(compoundFutureValue, totalInvested);
    const volatilityRange = calculateVolatilityRiskRange(pAmount, pReturn, pVol, pDur);
    const riskScoring = calculateRiskScore({
      volatility: pVol,
      category,
      durationYears: pDur,
      concentrationScore: 1
    });

    return res.status(200).json({
      success: true,
      inputs: {
        initialAmount: pAmount,
        annualReturn: pReturn,
        durationYears: pDur,
        volatility: pVol,
        category,
        additionalAmount: pAdd,
        frequency
      },
      results: {
        simpleAnnualReturn: Number(simpleAnnualReturn.toFixed(2)),
        totalSimpleReturn: Number(totalSimpleReturn.toFixed(2)),
        compoundFutureValue: Number(compoundFutureValue.toFixed(2)),
        totalInvested: Number(totalInvested.toFixed(2)),
        expectedProfit: Number(expectedProfit.toFixed(2)),
        totalPercentageReturn: Number(totalPercentageReturn.toFixed(2)),
        volatilityRange: {
          lowerEstimate: Number(volatilityRange.lowerEstimate.toFixed(2)),
          upperEstimate: Number(volatilityRange.upperEstimate.toFixed(2)),
          spread: Number(volatilityRange.spread.toFixed(2)),
          disclaimer: volatilityRange.disclaimer
        },
        riskScoring
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Calculation failed: ' + error.message
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/reports', reportRoutes);

// Static client bundle serving in production
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(status).json({
    success: false,
    error: isProduction 
      ? 'An unexpected internal server error occurred.' 
      : err.message || 'Internal Server Error'
  });
});

export default app;
