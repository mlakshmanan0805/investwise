import express from 'express';
import {
  getActivities,
  addActivity,
  getValuationHistory,
  addValuationRecord
} from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getActivities);
router.post('/', addActivity);
router.get('/valuations', getValuationHistory);
router.post('/valuations', addValuationRecord);

export default router;
