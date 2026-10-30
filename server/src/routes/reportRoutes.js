import express from 'express';
import { getReportData, exportCsv } from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/data', getReportData);
router.get('/export/csv', exportCsv);

export default router;
