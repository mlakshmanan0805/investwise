import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function HowCalculatedModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary btn-sm"
        style={{
          width: '100%',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          border: '1px dashed var(--border-color)',
          padding: '0.65rem 1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)' }}>
          <HelpCircle size={16} />
          <span style={{ fontWeight: 600 }}>How is this calculated? (Mathematical Formulas)</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div style={{
          marginTop: '0.75rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          lineHeight: 1.6
        }}>
          <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} /> Financial Calculation Reference
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>1. Simple Annual Return:</strong>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
                Annual Return = Initial Investment × (Annual Return Rate / 100)
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Measures the linear non-compounded annual nominal gain.</p>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>2. Total Simple Return:</strong>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
                Total Return = Initial Investment × (Annual Return Rate / 100) × Duration (Years)
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>3. Compound Future Value (Annual Compounding):</strong>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
                Future Value (FV) = Initial Investment × (1 + Annual Return Rate / 100)^Number of Years
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Assumes interest earned in prior years is reinvested to generate exponential compounding growth.
              </p>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>4. Expected Profit or Loss:</strong>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
                Profit or Loss = Future Value − Total Invested Capital
              </div>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>5. Volatility-Based Illustrative Risk Range:</strong>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
                Lower Estimate = Initial Investment × max(0, 1 + (r − σ) / 100)^n<br />
                Upper Estimate = Initial Investment × max(0, 1 + (r + σ) / 100)^n
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Where r = annual return percentage, σ = annual volatility percentage, n = duration in years.
                Notice this is an illustrative scenario range, not a statistically guaranteed confidence interval.
              </p>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>6. Weighted Risk Scoring Formula (out of 5):</strong>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
                Risk Score = (Volatility Score × 40%) + (Asset Category Score × 25%) + (Duration Score × 15%) + (Concentration Score × 20%)
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Scores &lt; 2.3 = Low Risk | 2.3 to 3.59 = Moderate Risk | ≥ 3.6 = High Risk.
              </p>
            </div>

            <div>
              <strong style={{ color: 'var(--text-primary)' }}>7. Herfindahl-Hirschman Index (HHI) & Effective Holdings:</strong>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#93C5FD', margin: '0.2rem 0' }}>
                HHI = Σ (Allocation Fraction_i)^2 | Effective Holdings = 1 / HHI
              </div>
              <p style={{ color: 'var(--text-muted)' }}>
                Example: Two equal 50% holdings yield 0.50^2 + 0.50^2 = 0.50 (Effective holdings = 2.0).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
