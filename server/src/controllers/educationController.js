import { getDatabase } from '../database/db.js';
import { QUIZ_QUESTIONS } from '../utils/quizData.js';

export function getQuizQuestions(req, res) {
  // Strip correctAnswerIndex so user cannot inspect payload before submission
  const sanitized = QUIZ_QUESTIONS.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));

  return res.status(200).json({
    success: true,
    totalQuestions: sanitized.length,
    questions: sanitized
  });
}

export function submitQuiz(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const { answers } = req.body; // Map or object { 1: optionIndex, 2: optionIndex, ... }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Please submit answers as an object with question IDs as keys.'
      });
    }

    let score = 0;
    const breakdown = QUIZ_QUESTIONS.map(q => {
      const selectedIndex = answers[q.id];
      const isCorrect = selectedIndex !== undefined && Number(selectedIndex) === q.correctAnswerIndex;
      if (isCorrect) {
        score++;
      }

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        userAnswerIndex: selectedIndex !== undefined ? Number(selectedIndex) : null,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation
      };
    });

    const totalQuestions = QUIZ_QUESTIONS.length;
    const percentage = Number(((score / totalQuestions) * 100).toFixed(1));

    // Save result to quiz_results table
    db.prepare(`
      INSERT INTO quiz_results (user_id, score, total_questions, percentage)
      VALUES (?, ?, ?, ?)
    `).run(userId, score, totalQuestions, percentage);

    return res.status(200).json({
      success: true,
      score,
      totalQuestions,
      percentage,
      breakdown,
      feedback: percentage >= 80 
        ? 'Outstanding! You have demonstrated exceptional mastery of investment and risk principles.' 
        : percentage >= 60 
          ? 'Good performance! Review the explanations above to strengthen your financial intuition.' 
          : 'Keep learning! Revisit the education modules and retake the quiz to boost your confidence.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate quiz submission: ' + error.message
    });
  }
}

export function getQuizHistory(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user.id;

    const history = db.prepare(`
      SELECT * FROM quiz_results 
      WHERE user_id = ? 
      ORDER BY completed_at DESC
    `).all(userId);

    return res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve quiz history: ' + error.message
    });
  }
}
