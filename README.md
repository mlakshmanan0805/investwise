# InvestWise – Investment Risk and Return Analyzer

> **College Academic Submission Project**  
> A full-stack financial decision analysis application demonstrating portfolio risk modeling, compound annual growth, volatility spreads, Herfindahl-Hirschman Index (HHI) concentration, multi-asset comparison, and scenario simulation.

---

## 1. Project Overview & Objectives

**InvestWise** is an interactive financial software system developed to bridge modern computer science architecture with core financial economics. It allows students, educators, and individual investors to evaluate investment strategies quantitatively without relying on fabricated market numbers or external paid financial APIs.

### Core Academic Learning Goals
1. **Understand Expected Return vs. Guaranteed Return**: Dispel misconceptions that high historical returns guarantee wealth, demonstrating how volatility creates downside risk.
2. **Quantify Compounding Advantage**: Contrast non-compounded simple annual interest with exponential multi-year compound growth ($FV = P(1+r)^n$).
3. **Illustrate Volatility Scenario Bounds**: Calculate illustrative scenario ranges ($r \pm \sigma$) across multi-year holding periods.
4. **Evaluate Concentration & Diversification (HHI)**: Compute the Herfindahl-Hirschman Index ($HHI = \sum s_i^2$) and effective number of holdings ($N_{\text{eff}} = 1 / HHI$) to quantify unsystematic risk reduction.
5. **Multi-Factor Risk Attribution**: Implement a deterministic 4-factor risk scoring engine evaluating annual volatility (40%), asset class characteristics (25%), investment duration (15%), and portfolio concentration (20%).

---

## 2. Technology Stack

### Frontend Client
* **React.js 18** (Modern functional components, state management, custom hooks)
* **Vite 5** (Fast local dev server, production bundler)
* **React Router 6** (Client-side routing with protected authenticated session routes)
* **Recharts 2** (Interactive SVG Pie, Bar, Scatter, and Line charts)
* **Lucide React** (Consistent financial and UI iconography)
* **Custom Responsive CSS3 Design System** (Dark navy `#0A0F1D` base, emerald `#10B981` & royal blue `#3B82F6` accents, custom card styling, print stylesheets for PDF export)

### Backend REST API
* **Node.js (v24 / v20 / v22)**
* **Express.js 4** (Structured REST routing, centralized error handler)
* **bcryptjs** (Salted password hashing, zero plaintext password storage)
* **jsonwebtoken (JWT)** (Stateless bearer token authentication with 7-day expiration)
* **express-rate-limit** (Brute-force protection on authentication routes)

### Database Layer
* **SQLite (via Node 24 native `node:sqlite`)**
* Auto-creates database file (`./data/investwise.db`) and relational schema on initial startup
* Foreign key enforcement (`PRAGMA foreign_keys = ON;`)
* Write-Ahead Logging (`PRAGMA journal_mode = WAL;`)
* Parameterized SQL queries to prevent SQL injection vulnerabilities
* Complete multi-user record privacy isolation

### Testing Framework
* **Node Native Test Runner (`node:test`, `node:assert/strict`)**
* **Supertest** (End-to-end HTTP integration and authentication testing)

---

## 3. Project Structure

```text
investwise/
├── package.json               # Root orchestrator with unified npm scripts
├── README.md                  # Complete academic documentation & guide
├── .gitignore                 # Ignores node_modules, .db files, .env
├── .env.example               # Safe environment variable configuration template
│
├── server/                    # Backend REST API Application
│   ├── package.json
│   ├── .env
│   ├── src/
│   │   ├── app.js             # Express app setup, CORS, route mounting, static serving
│   │   ├── server.js          # Server startup & DB verification
│   │   ├── database/
│   │   │   └── db.js          # SQLite connection, schema DDL, indexes
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT token verification & route protection
│   │   ├── utils/
│   │   │   ├── calculations.js# Pure financial math engine & validation
│   │   │   ├── quizData.js    # 10 comprehensive academic finance questions
│   │   │   └── sampleData.js  # Realistic diversified sample holdings
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, profile, password change
│   │   │   ├── portfolioController.js  # CRUD operations & sample portfolio seeder
│   │   │   ├── analyticsController.js  # Dashboard metrics, risk scoring, comparison
│   │   │   ├── activityController.js   # Transactions, contributions, valuations
│   │   │   ├── educationController.js  # Quiz delivery & scoring
│   │   │   └── reportController.js     # Report data compilation & CSV export
│   │   └── routes/
│   └── tests/
│       ├── calculations.test.js # Financial mathematics master test suite (Tests 1-9)
│       └── api.test.js          # API endpoints & user isolation test suite (Test 10)
│
└── client/                    # Frontend React Application
    ├── package.json
    ├── vite.config.js         # Vite configuration with API proxy to port 5000
    ├── index.html
    └── src/
        ├── api/
        │   └── client.js      # Unified fetch wrapper with auth header interceptor
        ├── components/
        │   ├── Navbar.jsx     # Top nav with user profile and quick actions
        │   ├── Sidebar.jsx    # Responsive navigation sidebar
        │   ├── Layout.jsx     # App shell wrapper
        │   ├── StatCard.jsx   # Premium metric card
        │   ├── ConfirmModal.jsx# Accessible confirmation dialog
        │   ├── EmptyState.jsx # Clean empty states
        │   └── HowCalculatedModal.jsx # Formula reference accordion
        ├── context/
        │   ├── AuthContext.jsx         # Global auth state & token management
        │   └── NotificationContext.jsx # Floating toast alerts
        ├── pages/
        │   ├── LandingPage.jsx         # Public overview & feature hero
        │   ├── LoginPage.jsx           # Sign in with Demo student auto-login
        │   ├── RegisterPage.jsx        # Account registration
        │   ├── DashboardPage.jsx       # Real-time metrics & 4 Recharts charts
        │   ├── CalculatorPage.jsx      # Standalone & portfolio calculator
        │   ├── PortfolioPage.jsx       # CRUD table, search, category filter
        │   ├── ComparisonPage.jsx      # Side-by-side asset comparison
        │   ├── RiskAnalysisPage.jsx    # 4-factor risk scoring engine
        │   ├── DiversificationPage.jsx # HHI & holding weights
        │   ├── ScenarioSimulatorPage.jsx# What-if growth trajectories
        │   ├── EducationPage.jsx       # Curriculum guide & 3 mini-calculators
        │   ├── QuizPage.jsx            # 10-question graded quiz with feedback
        │   ├── ActivityHistoryPage.jsx # Cash flows & valuation records
        │   ├── ReportsPage.jsx         # Printable audit sheet & CSV export
        │   ├── ProfilePage.jsx         # Account settings & risk tolerance
        │   ├── AboutPage.jsx           # Methodology documentation
        │   └── NotFoundPage.jsx        # 404 handler
        ├── styles/
        │   └── main.css       # Complete dark navy design system & print stylesheet
        ├── utils/
        │   └── formatters.js  # Indian Rupee (INR) and percentage formatters
        ├── App.jsx            # React Router declarations & ProtectedRoute guard
        └── main.jsx
```

---

## 4. Database Schema

The application creates 5 relational tables automatically in SQLite:

1. **`users`**
   * `id INTEGER PRIMARY KEY AUTOINCREMENT`
   * `email TEXT NOT NULL UNIQUE COLLATE NOCASE`
   * `password_hash TEXT NOT NULL`
   * `full_name TEXT NOT NULL`
   * `risk_tolerance TEXT DEFAULT 'Moderate'`
   * `created_at, updated_at DATETIME`

2. **`investments`**
   * `id INTEGER PRIMARY KEY AUTOINCREMENT`
   * `user_id INTEGER NOT NULL (FK -> users.id)`
   * `name TEXT NOT NULL`
   * `asset_category TEXT NOT NULL`
   * `initial_amount REAL NOT NULL CHECK(initial_amount > 0)`
   * `expected_return REAL NOT NULL`
   * `expected_volatility REAL NOT NULL DEFAULT 0`
   * `duration_years REAL NOT NULL CHECK(duration_years > 0)`
   * `risk_tolerance TEXT DEFAULT 'Moderate'`
   * `notes TEXT`
   * `created_at, updated_at DATETIME`

3. **`investment_activities`**
   * `id INTEGER PRIMARY KEY AUTOINCREMENT`
   * `user_id INTEGER NOT NULL (FK -> users.id)`
   * `investment_id INTEGER NOT NULL (FK -> investments.id)`
   * `activity_type TEXT NOT NULL` (`Initial Investment`, `Additional Contribution`, `Withdrawal`, `Manual Valuation Update`)
   * `amount REAL NOT NULL CHECK(amount > 0)`
   * `activity_date TEXT NOT NULL`
   * `notes TEXT`

4. **`valuation_history`**
   * `id INTEGER PRIMARY KEY AUTOINCREMENT`
   * `user_id INTEGER NOT NULL (FK -> users.id)`
   * `investment_id INTEGER NOT NULL (FK -> investments.id)`
   * `valuation_amount REAL NOT NULL CHECK(valuation_amount >= 0)`
   * `valuation_date TEXT NOT NULL`
   * `notes TEXT`

5. **`quiz_results`**
   * `id INTEGER PRIMARY KEY AUTOINCREMENT`
   * `user_id INTEGER NOT NULL (FK -> users.id)`
   * `score INTEGER NOT NULL`
   * `total_questions INTEGER NOT NULL`
   * `percentage REAL NOT NULL`
   * `completed_at DATETIME`

---

## 5. Quick Start Instructions (How to Run)

The application runs smoothly on standard Windows laptops, macOS, or Linux.

### Prerequisites
* **Node.js**: v20, v22, or v24 installed
* **npm**: v9+ or v10+

### Option A: Recommended Development Mode (Starts Both Server & Frontend)

Open PowerShell or Command Prompt in the project root directory (`d:\personal finance project`):

```bash
# 1. Install all dependencies (root, server, and client)
npm.cmd run install:all

# 2. Start the development server (runs backend on port 5000 and Vite client on port 5173)
npm.cmd run dev
```

Then open your browser at:
👉 **`http://localhost:5173`**

*(Note: On Windows PowerShell, use `npm.cmd` if standard `npm` triggers a script execution policy notice).*

---

### Option B: Standalone Production Server Mode (Single Port 5000)

You can also run the entire application through a single Express process:

```bash
# 1. Build the frontend client bundle
npm.cmd run build

# 2. Start the backend server
npm.cmd start
```

Then open your browser at:
👉 **`http://localhost:5000`**

---

### Option C: Running Frontend and Backend in Separate Terminals

**Terminal 1 (Backend REST API):**
```bash
cd server
node src/server.js
# Backend runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npx.cmd vite
# Frontend runs on http://localhost:5173
```

---

## 6. How to Run Automated Tests

The project includes 24 automated unit and API integration tests covering all financial formulas, validation boundaries, and multi-user isolation rules:

```bash
# Run all tests from root
npm.cmd test
```

### Verified Test Results Summary:
* ✅ **Test 1**: Rs 10,000 at 10% annual return for 1 year = FV Rs 11,000, Profit Rs 1,000
* ✅ **Test 2**: Rs 10,000 at 10% annual return for 2 years = FV Rs 12,100, Profit Rs 2,100
* ✅ **Test 3**: Rs 10,000 at -10% negative annual return for 1 year = FV Rs 9,000, Profit -Rs 1,000
* ✅ **Test 4**: Rs 10,000 at 10% return, 5% volatility for 1 year = Lower Rs 10,500, Upper Rs 11,500
* ✅ **Test 5**: Equal 50/50 allocation = HHI 0.50, Effective Holdings = 2
* ✅ **Test 6**: Validation rejects zero and negative investment amount
* ✅ **Test 7**: Validation rejects negative and zero investment duration
* ✅ **Test 8**: Validation rejects negative annual volatility
* ✅ **Test 9**: Validation rejects NaN and Infinity inputs
* ✅ **Test 10**: Multi-user isolation — User B cannot retrieve, modify, or delete User A's investments
* ✅ **User Registration, Login, and duplicate email prevention (409 Conflict)**
* ✅ **CRUD operations, transaction ledgering, and CSV file exports**
* ✅ **Quiz grading engine and history tracking**

---

## 7. Sample User Workflow

1. **Sign In**: Navigate to `http://localhost:5173/login`. Click **"Demo Student Auto-Login"** or create a new user via **"Create Account"**.
2. **Explore Dashboard**: View current portfolio metrics. If starting fresh, click **"Load Sample Portfolio"** to populate 5 diverse Indian asset holdings (HDFC Term Deposit, RBI 10-Yr G-Sec, Nifty 50 Index Fund, Midcap Mutual Fund, Sovereign Gold Bonds).
3. **Use the Calculator**: Head to `/calculator`. Test different initial amounts, return rates, and volatility assumptions. Click **"Save to Portfolio"** to add your custom calculation directly to your holdings.
4. **Inspect Risk Analysis**: Open `/risk-analysis` to observe how the 4-factor scoring engine evaluates volatility, asset class characteristics, time horizon, and portfolio concentration. Check your profile alignment status.
5. **Analyze Diversification**: Open `/diversification` to view the Herfindahl-Hirschman Index (HHI) and calculate the effective number of equally weighted holdings ($1 / HHI$).
6. **Compare Assets**: Open `/compare`. Select 2 to 4 investments to inspect side-by-side matrices, future value bar comparisons, and risk-return trade-offs.
7. **Simulate Growth**: Open `/simulator`. Adjust the horizon and annual volatility to generate comparative trajectories for Pessimistic ($r - \sigma$), Base Case ($r$), and Optimistic ($r + \sigma$) market scenarios.
8. **Learn & Take Quiz**: Head to `/education` to explore interactive mini-calculators (Simple vs Compound, Rule of 72, Emergency Fund), then test your understanding in `/quiz`.
9. **Export Reports**: Open `/reports`. Click **"Export to CSV"** to download an RFC-compliant `.csv` spreadsheet, or click **"Print / Save PDF"** to generate a clean academic summary report.

---

## 8. Financial Formulas Reference

| Formula Name | Mathematical Formulation | Description |
| :--- | :--- | :--- |
| **Simple Annual Return** | $\text{AR} = P \times \frac{r}{100}$ | Linear, non-compounded annual nominal gain. |
| **Total Simple Return** | $\text{TR} = P \times \frac{r}{100} \times n$ | Linear total return over $n$ years without reinvestment. |
| **Compound Future Value** | $\text{FV} = P \times \left(1 + \frac{r}{100}\right)^n$ | Exponential growth assuming annual reinvestment of returns. |
| **Expected Profit / Loss** | $\text{Profit} = \text{FV} - P$ | Net gain or capital contraction relative to principal. |
| **Volatility Risk Bounds** | $\text{Lower} = P \times \max\left(0, 1 + \frac{r - \sigma}{100}\right)^n$<br>$\text{Upper} = P \times \max\left(0, 1 + \frac{r + \sigma}{100}\right)^n$ | Illustrative scenario range based on constant return and volatility approximation. |
| **Herfindahl-Hirschman Index** | $\text{HHI} = \sum_{i=1}^N (s_i)^2$ | Measure of portfolio concentration where $s_i$ is allocation fraction. |
| **Effective Holdings** | $N_{\text{eff}} = \frac{1}{\text{HHI}}$ | Number of hypothetical equally weighted holdings equivalent to current concentration. |
| **Weighted Portfolio Return** | $r_{\text{portfolio}} = \sum_{i=1}^N (w_i \times r_i)$ | Capital-weighted expected annual return. |
| **Multi-Factor Risk Score** | $\text{Score} = (0.40 \cdot V) + (0.25 \cdot C) + (0.15 \cdot D) + (0.20 \cdot K)$ | Deterministic 1-5 score across Volatility ($V$), Category ($C$), Duration ($D$), Concentration ($K$). |

---

## 9. API Endpoint Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Create user account with name, email, password, and risk tolerance
* `POST /api/auth/login` — Sign in and receive JWT bearer token
* `GET /api/auth/me` — Verify session and fetch current authenticated user details
* `PUT /api/auth/profile` — Update investor name, risk tolerance, or password
* `POST /api/auth/logout` — Terminate session

### Standalone Calculation (`/api/calculate`)
* `POST /api/calculate` — Public financial calculation endpoint (future value, simple return, volatility range, factor scoring)

### Portfolio Management (`/api/portfolio`)
* `GET /api/portfolio` — Retrieve user's investments with real-time future value and risk metrics
* `POST /api/portfolio` — Create new investment holding
* `POST /api/portfolio/sample` — Load 5 realistic sample assets into user's account
* `GET /api/portfolio/:id` — Get detailed breakdown of a holding
* `PUT /api/portfolio/:id` — Update holding parameters
* `DELETE /api/portfolio/:id` — Permanently delete an investment position

### Analytics & Projections (`/api/analytics`)
* `GET /api/analytics/dashboard` — Aggregated portfolio summary, asset distribution, and scatter plot data
* `GET /api/analytics/risk` — 4-factor risk attribution scores and tolerance alignment report
* `GET /api/analytics/diversification` — Herfindahl-Hirschman Index (HHI) and effective holdings
* `POST /api/analytics/compare` — Compare 2 to 4 investments side-by-side
* `POST /api/analytics/simulate` — Multi-year scenario simulator ($r - \sigma$, $r$, $r + \sigma$)

### Activities & Valuations (`/api/activities`)
* `GET /api/activities` — Transaction log of capital contributions and withdrawals
* `POST /api/activities` — Record new transaction or manual valuation mark
* `GET /api/activities/valuations` — Date-stamped valuation history for performance plotting
* `POST /api/activities/valuations` — Add dated valuation point

### Education & Quiz (`/api/education`)
* `GET /api/education/quiz` — Fetch 10 multiple-choice financial curriculum questions
* `POST /api/education/quiz/submit` — Submit quiz answers, receive instant grading & explanations
* `GET /api/education/quiz/history` — Prior quiz attempt history

### Reports (`/api/reports`)
* `GET /api/reports/data` — Compiled audit report payload
* `GET /api/reports/export/csv` — Download RFC-compliant CSV spreadsheet of all portfolio holdings

---

## 10. Academic Limitations & Disclaimer

1. **Model Approximations**: Mathematical compounding models assume continuous geometric return rates. In real-world capital markets, annual returns fluctuate unpredictably with non-Gaussian "fat tails".
2. **Educational Purpose**: InvestWise is developed strictly for academic evaluation and collegiate demonstration. It does not constitute commercial financial advice or investment solicitation.
3. **No Fabricated Live Feeds**: All values presented in the application reflect either user-saved SQLite records or explicit academic sample scenarios.

---

**InvestWise Project Team**  
*College Academic Project Submission • October 2026*

