import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  RefreshCw,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { api } from '../api/client.js';
import { useNotification } from '../context/NotificationContext.jsx';

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { notify } = useNotification();

  const loadQuestions = async () => {
    setLoading(true);
    setSubmitted(false);
    setUserAnswers({});
    setResult(null);

    try {
      const res = await api.getQuizQuestions();
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (err) {
      notify(err.message || 'Failed to load quiz questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const selectOption = (qId, optionIdx) => {
    if (submitted) return; // Prevent modifying after submission
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      const confirmIncomplete = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Do you want to submit anyway?`
      );
      if (!confirmIncomplete) return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitQuiz({ answers: userAnswers });
      if (res.success) {
        setResult(res);
        setSubmitted(true);
        notify(`Quiz graded! Your score: ${res.score}/${res.totalQuestions} (${res.percentage}%)`, 'success');
      }
    } catch (err) {
      notify(err.message || 'Failed to grade quiz submission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading financial curriculum questions...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Investment & Risk Mastery Quiz
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Test your comprehension of compounding, volatility, liquidity risk, HHI concentration, and asset valuation.
        </p>
      </div>

      {/* Result Score Banner when submitted */}
      {submitted && result && (
        <div className="card" style={{
          backgroundColor: result.percentage >= 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          borderColor: result.percentage >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: result.percentage >= 70 ? 'var(--accent-emerald-light)' : 'var(--accent-amber-light)',
                color: result.percentage >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  Score: {result.score} / {result.totalQuestions} ({result.percentage}%)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  {result.feedback}
                </p>
              </div>
            </div>

            <button onClick={loadQuestions} className="btn btn-secondary btn-sm">
              <RotateCcw size={15} />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {questions.map((q, idx) => {
            const breakdownItem = submitted && result ? result.breakdown.find(b => b.id === q.id) : null;
            const selectedIdx = userAnswers[q.id];

            return (
              <div
                key={q.id}
                className="card"
                style={{
                  borderLeft: breakdownItem
                    ? breakdownItem.isCorrect ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-rose)'
                    : '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <span style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--accent-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {q.question}
                    </h4>
                  </div>

                  {breakdownItem && (
                    breakdownItem.isCorrect ? (
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={13} /> Correct (+1)
                      </span>
                    ) : (
                      <span className="badge badge-rose">
                        <XCircle size={13} /> Incorrect
                      </span>
                    )
                  )}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt, oIdx) => {
                    const isSelected = selectedIdx === oIdx;
                    let optionStyle = {
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-input)',
                      cursor: submitted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.15s ease'
                    };

                    if (!submitted && isSelected) {
                      optionStyle.borderColor = 'var(--accent-emerald)';
                      optionStyle.backgroundColor = 'rgba(16, 185, 129, 0.12)';
                      optionStyle.color = 'var(--text-primary)';
                    }

                    if (submitted && breakdownItem) {
                      if (oIdx === breakdownItem.correctAnswerIndex) {
                        optionStyle.borderColor = 'var(--accent-emerald)';
                        optionStyle.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                        optionStyle.color = '#6EE7B7';
                      } else if (isSelected && !breakdownItem.isCorrect) {
                        optionStyle.borderColor = 'var(--accent-rose)';
                        optionStyle.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                        optionStyle.color = '#FCA5A5';
                      }
                    }

                    return (
                      <div
                        key={oIdx}
                        style={optionStyle}
                        onClick={() => selectOption(q.id, oIdx)}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                          backgroundColor: isSelected ? 'var(--accent-emerald)' : 'transparent',
                          flexShrink: 0
                        }} />
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box when submitted */}
                {breakdownItem && (
                  <div style={{
                    marginTop: '0.85rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    borderLeft: '3px solid var(--accent-blue)'
                  }}>
                    <strong style={{ color: 'var(--accent-blue)' }}>Concept Explanation:</strong> {breakdownItem.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '220px' }}
            >
              {submitting ? 'Grading...' : 'Submit Answers for Scoring'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
