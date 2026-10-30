import express from 'express';
import {
  getDashboardSummary,
  getRiskAnalysis,
  getDiversificationAnalysis,
  compareInvestments,
  runScenarioSimulator
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardSummary);
router.get('/risk', getRiskAnalysis);
router.get('/diversification', getDiversificationAnalysis);
router.post('/compare', compareInvestments);
router.post('/simulate', runScenarioSimulator);

export default router;
