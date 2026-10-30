import express from 'express';
import {
  getInvestments,
  getInvestmentById,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  loadSamplePortfolio
} from '../controllers/portfolioController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getInvestments);
router.post('/', addInvestment);
router.post('/sample', loadSamplePortfolio);
router.get('/:id', getInvestmentById);
router.put('/:id', updateInvestment);
router.delete('/:id', deleteInvestment);

export default router;
