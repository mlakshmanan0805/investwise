/**
 * InvestWise API Client
 * Centralized fetch client with automatic JWT token attachment and error interception.
 */

const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('investwise_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle CSV or file downloads
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      if (!res.ok) throw new Error('Failed to download CSV export');
      return await res.blob();
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        // Clear invalid token
        localStorage.removeItem('investwise_token');
        localStorage.removeItem('investwise_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      const errorMsg = data.error || (data.errors ? data.errors.join(' ') : 'Request failed with status ' + res.status);
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (payload) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  // Calculation (Standalone)
  calculate: (payload) => apiRequest('/calculate', { method: 'POST', body: JSON.stringify(payload) }),

  // Portfolio
  getInvestments: (params = '') => apiRequest(`/portfolio${params ? '?' + params : ''}`),
  getInvestment: (id) => apiRequest(`/portfolio/${id}`),
  addInvestment: (payload) => apiRequest('/portfolio', { method: 'POST', body: JSON.stringify(payload) }),
  updateInvestment: (id, payload) => apiRequest(`/portfolio/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteInvestment: (id) => apiRequest(`/portfolio/${id}`, { method: 'DELETE' }),
  loadSamplePortfolio: () => apiRequest('/portfolio/sample', { method: 'POST' }),

  // Analytics
  getDashboard: () => apiRequest('/analytics/dashboard'),
  getRiskAnalysis: () => apiRequest('/analytics/risk'),
  getDiversification: () => apiRequest('/analytics/diversification'),
  compareInvestments: (payload) => apiRequest('/analytics/compare', { method: 'POST', body: JSON.stringify(payload) }),
  simulateScenarios: (payload) => apiRequest('/analytics/simulate', { method: 'POST', body: JSON.stringify(payload) }),

  // Activities
  getActivities: (params = '') => apiRequest(`/activities${params ? '?' + params : ''}`),
  addActivity: (payload) => apiRequest('/activities', { method: 'POST', body: JSON.stringify(payload) }),
  getValuations: (params = '') => apiRequest(`/activities/valuations${params ? '?' + params : ''}`),
  addValuation: (payload) => apiRequest('/activities/valuations', { method: 'POST', body: JSON.stringify(payload) }),

  // Education & Quiz
  getQuizQuestions: () => apiRequest('/education/quiz'),
  submitQuiz: (payload) => apiRequest('/education/quiz/submit', { method: 'POST', body: JSON.stringify(payload) }),
  getQuizHistory: () => apiRequest('/education/quiz/history'),

  // Reports
  getReportData: () => apiRequest('/reports/data'),
  exportCsvBlob: () => apiRequest('/reports/export/csv')
};
