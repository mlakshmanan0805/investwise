import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Layout and Common
import Layout from './components/Layout.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CalculatorPage from './pages/CalculatorPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import ComparisonPage from './pages/ComparisonPage.jsx';
import RiskAnalysisPage from './pages/RiskAnalysisPage.jsx';
import DiversificationPage from './pages/DiversificationPage.jsx';
import ScenarioSimulatorPage from './pages/ScenarioSimulatorPage.jsx';
import EducationPage from './pages/EducationPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ActivityHistoryPage from './pages/ActivityHistoryPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        Loading InvestWise session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Standalone Landing, Login, and Register */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Application Shell with Sidebar and Navbar */}
            <Route element={<Layout />}>
              {/* Public Exploration Pages in Shell */}
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/education" element={<EducationPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Protected Member Pages */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <PortfolioPage />
                </ProtectedRoute>
              } />

              <Route path="/compare" element={
                <ProtectedRoute>
                  <ComparisonPage />
                </ProtectedRoute>
              } />

              <Route path="/risk-analysis" element={
                <ProtectedRoute>
                  <RiskAnalysisPage />
                </ProtectedRoute>
              } />

              <Route path="/diversification" element={
                <ProtectedRoute>
                  <DiversificationPage />
                </ProtectedRoute>
              } />

              <Route path="/simulator" element={
                <ProtectedRoute>
                  <ScenarioSimulatorPage />
                </ProtectedRoute>
              } />

              <Route path="/quiz" element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              } />

              <Route path="/activities" element={
                <ProtectedRoute>
                  <ActivityHistoryPage />
                </ProtectedRoute>
              } />

              <Route path="/reports" element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* 404 in Shell */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
