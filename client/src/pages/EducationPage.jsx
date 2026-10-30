import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  Flame,
  Clock,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export default function EducationPage() {
  // Mini Calculator 1: Simple vs Compound Interest
  const [mcPrincipal, setMcPrincipal] = useState(10000);
  const [mcRate, setMcRate] = useState(10);
  const [mcYears, setMcYears] = useState(5);

  const mcSimple = mcPrincipal * (1 + (mcRate / 100) * mcYears);
  const mcCompound = mcPrincipal * Math.pow(1 + mcRate / 100, mcYears);
  const mcDiff = mcCompound - mcSimple;

  // Mini Calculator 2: Rule of 72
  const [r72Rate, setR72Rate] = useState(8);
  const r72Years = r72Rate > 0 ? (72 / r72Rate).toFixed(1) : 0;

  // Mini Calculator 3: Emergency Fund
  const [monthlyExpense, setMonthlyExpense] = useState(30000);
  const [fundMonths, setFundMonths] = useState(6);
  const targetFund = monthlyExpense * fundMonths;

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Financial Education Center
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Academic concepts of risk, expected return, diversification, inflation, and capital preservation.
          </p>
        </div>

        <Link to="/quiz" className="btn btn-primary btn-sm">
          <HelpCircle size={15} />
          <span>Take Knowledge Quiz</span>
        </Link>
      </div>

      {/* Interactive Mini-Calculators Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Calculator size={18} color="var(--accent-emerald)" />
            <span>Interactive Financial Explorers</span>
          </h3>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {/* Mini Calc 1: Simple vs Compound */}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-emerald)' }}>
              1. Simple vs. Compound Growth
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Observe exponential reinvestment over time:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <label>Principal: {formatINR(mcPrincipal)}</label>
              <input type="range" min="1000" max="100000" step="1000" value={mcPrincipal} onChange={(e) => setMcPrincipal(Number(e.target.value))} />

              <label>Annual Return: {mcRate}%</label>
              <input type="range" min="1" max="25" step="0.5" value={mcRate} onChange={(e) => setMcRate(Number(e.target.value))} />

              <label>Horizon: {mcYears} Years</label>
              <input type="range" min="1" max="20" step="1" value={mcYears} onChange={(e) => setMcYears(Number(e.target.value))} />

              <div style={{ marginTop: '0.75rem', padding: '0.65rem', backgroundColor: 'var(--bg-card)', borderRadius: '4px' }}>
                <div>Simple: <strong>{formatINR(mcSimple)}</strong></div>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Compound: <strong>{formatINR(mcCompound)}</strong></div>
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', marginTop: '0.2rem' }}>
                  Compounding Bonus: +{formatINR(mcDiff)}
                </div>
              </div>
            </div>
          </div>

          {/* Mini Calc 2: Rule of 72 */}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
              2. Rule of 72 (Doubling Time)
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Formula: Doubling Years ≈ 72 ÷ Annual Return (%)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <label>Assumed Return: {r72Rate}% per year</label>
              <input type="range" min="2" max="24" step="0.5" value={r72Rate} onChange={(e) => setR72Rate(Number(e.target.value))} />

              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Time to Double:</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.25rem 0' }}>
                  {r72Years} Years
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  At {r72Rate}%, Rs 1 Lakh becomes Rs 2 Lakhs in ~{r72Years} years.
                </div>
              </div>
            </div>
          </div>

          {/* Mini Calc 3: Emergency Fund */}
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-amber)' }}>
              3. Emergency Buffer Estimator
            </h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Shielding long-term investments from forced panic sales:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <label>Monthly Expenses: {formatINR(monthlyExpense)}</label>
              <input type="range" min="10000" max="150000" step="5000" value={monthlyExpense} onChange={(e) => setMonthlyExpense(Number(e.target.value))} />

              <label>Buffer Horizon: {fundMonths} Months</label>
              <input type="range" min="3" max="12" step="1" value={fundMonths} onChange={(e) => setFundMonths(Number(e.target.value))} />

              <div style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: 'var(--bg-card)', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Emergency Reserve:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.2rem 0' }}>
                  {formatINR(targetFund)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Hold in liquid savings / bank FDs.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Educational Modules Grid */}
      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Module 1 */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} color="var(--accent-emerald)" />
            <span>1. What is an Investment & Expected Return?</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            An <strong>investment</strong> is an allocation of current financial capital with the objective of generating future income, profit, or capital appreciation. 
            <strong>Expected Return</strong> is the anticipated rate of gain based on mathematical projections or historical averages. 
            Importantly, expected return is <em>not guaranteed</em>: unlike bank debt covenants, market-linked assets fluctuate continuously.
          </p>
        </div>

        {/* Module 2 */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="var(--accent-amber)" />
            <span>2. The Risk-Return Spectrum</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            Financial economics states that higher expected returns invariably carry higher uncertainty and volatility. 
            Risk represents the probability and magnitude of actual outcomes differing from expected returns, including the potential for permanent capital loss. 
            No investment can provide guaranteed high returns with zero risk.
          </p>
        </div>
      </div>

      {/* Six Fundamental Investment Risks */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame size={18} color="var(--accent-rose)" />
          <span>Six Core Types of Financial Risk</span>
        </h3>

        <div className="grid-3" style={{ gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>1. Inflation Risk</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              The risk that purchasing power decreases faster than nominal interest earned, reducing real economic wealth.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>2. Market (Systematic) Risk</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Macroeconomic declines (recessions, geopolitical events, monetary shocks) that affect almost all securities simultaneously.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>3. Credit / Default Risk</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              The risk that a bond or debt issuer fails to meet contractual coupon interest or principal repayments.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>4. Liquidity Risk</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Inability to sell or convert an asset into cash quickly at fair market value without accepting a heavy price haircut.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>5. Interest-Rate Risk</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              The risk that rising benchmark interest rates depress existing fixed-rate bond prices and property values.
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>6. Volatility Risk</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              The frequency and intensity of price oscillations around the mean return over shorter time horizons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

