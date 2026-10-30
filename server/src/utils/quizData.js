/**
 * InvestWise - Educational Quiz Dataset
 * High quality academic financial questions covering core curriculum concepts.
 */

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary relationship between investment risk and expected return?",
    options: [
      "Higher potential returns generally require accepting greater potential risk and volatility.",
      "Higher returns are guaranteed by investing for longer durations.",
      "Lower risk investments always produce superior compounding over time.",
      "There is no correlation between risk and investment returns."
    ],
    correctAnswerIndex: 0,
    explanation: "Fundamental financial theory posits that investors demand higher expected returns to compensate for taking on higher uncertainty, market fluctuations, and potential loss of capital."
  },
  {
    id: 2,
    question: "How does compound interest differ from simple interest?",
    options: [
      "Simple interest compounds monthly, whereas compound interest compounds yearly.",
      "Compound interest earns interest on both the initial principal and accumulated prior interest, while simple interest earns returns solely on the principal.",
      "Simple interest yields higher returns over long investment horizons.",
      "Compound interest applies only to high-risk equity assets."
    ],
    correctAnswerIndex: 1,
    explanation: "Compound interest generates exponential growth because interest earned in each period is reinvested to generate additional returns in subsequent periods."
  },
  {
    id: 3,
    question: "What does the Herfindahl-Hirschman Index (HHI) measure in portfolio management?",
    options: [
      "The exact annual dividend yield of a portfolio.",
      "The concentration of asset weights; a lower HHI signifies greater diversification across holdings.",
      "The statutory tax liability on long-term capital gains.",
      "The credit default probability of government securities."
    ],
    correctAnswerIndex: 1,
    explanation: "HHI equals the sum of squared allocation fractions. A portfolio equally split across two assets yields HHI = 0.50, whereas 10 equal assets yield HHI = 0.10. Lower HHI indicates superior diversification."
  },
  {
    id: 4,
    question: "What type of risk cannot be eliminated through asset diversification alone?",
    options: [
      "Systematic (Market) Risk",
      "Unsystematic (Company-specific) Risk",
      "Single-asset concentration risk",
      "Management default risk"
    ],
    correctAnswerIndex: 0,
    explanation: "Diversification effectively eliminates idiosyncratic or unsystematic risk (e.g. one firm failing), but systematic market risk (macroeconomic recessions, interest rate hikes, wars) impacts virtually all assets."
  },
  {
    id: 5,
    question: "If an investor earns a 7% nominal return while annual inflation is 6%, what is their approximate real return?",
    options: [
      "13.0%",
      "1.0%",
      "7.0%",
      "-1.0%"
    ],
    correctAnswerIndex: 1,
    explanation: "Real return approximately equals Nominal Return minus Inflation Rate (7% - 6% = 1%). Inflation erodes real purchasing power."
  },
  {
    id: 6,
    question: "What does 'Volatility' (standard deviation of returns) represent in financial analysis?",
    options: [
      "A guaranteed drop in portfolio capital.",
      "The degree of variation or dispersion of an asset's price and returns over time.",
      "The fixed interest payout agreed upon by the issuer.",
      "The total brokerage expense charged per trade."
    ],
    correctAnswerIndex: 1,
    explanation: "Volatility measures price unpredictability and dispersion around the mean return. Higher volatility means greater potential swings in portfolio value."
  },
  {
    id: 7,
    question: "Which of the following asset classes typically exhibits the lowest capital volatility and highest safety of principal?",
    options: [
      "Cryptocurrency",
      "Small-Cap Equities",
      "Government Bonds and Bank Fixed Deposits",
      "Real Estate Investment Trusts (REITs)"
    ],
    correctAnswerIndex: 2,
    explanation: "Sovereign government securities and insured bank fixed deposits carry explicit state backing and guaranteed interest payouts, providing high capital preservation with minimal volatility."
  },
  {
    id: 8,
    question: "What does Liquidity Risk refer to?",
    options: [
      "The risk that cash will lose value due to currency depreciation.",
      "The inability to convert an investment into cash quickly at fair market value without substantial discounts.",
      "The risk of a company's dividend payout being reduced.",
      "Fluctuations in foreign exchange conversion fees."
    ],
    correctAnswerIndex: 1,
    explanation: "Liquidity risk occurs when an investor cannot sell an asset quickly without accepting a steep markdown or waiting months (common in physical real estate and private equity)."
  },
  {
    id: 9,
    question: "Why is an Emergency Fund of 3 to 6 months of expenses recommended prior to aggressive investing?",
    options: [
      "To maximize stock market leverage during flash crashes.",
      "To prevent having to prematurely liquidate long-term volatile investments at a loss during unforeseen life events.",
      "It is a legal requirement mandated by financial regulatory authorities.",
      "To earn higher compound yields than equity mutual funds."
    ],
    correctAnswerIndex: 1,
    explanation: "An emergency fund acts as a financial shock absorber, shielding an investor from forced selling of equities or real estate during sudden market downturns or personal crises."
  },
  {
    id: 10,
    question: "According to the 'Rule of 72', approximately how many years will it take for an investment to double at an 8% annual return?",
    options: [
      "12 years",
      "9 years",
      "6 years",
      "7.2 years"
    ],
    correctAnswerIndex: 1,
    explanation: "The Rule of 72 states that doubling time in years ≈ 72 / annual return percentage. Here: 72 / 8 = 9 years."
  }
];
