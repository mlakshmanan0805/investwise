import express from 'express';
import { getQuizQuestions, submitQuiz, getQuizHistory } from '../controllers/educationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/quiz', getQuizQuestions);
router.post('/quiz/submit', authenticate, submitQuiz);
router.get('/quiz/history', authenticate, getQuizHistory);

export default router;
