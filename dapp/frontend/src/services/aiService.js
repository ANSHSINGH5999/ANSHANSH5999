import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Network error. Please try again.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Send a chat message to the AI backend
 * @param {Array} messages - Array of { role: 'user'|'assistant', content: string }
 * @param {Object} context - Optional context (wallet info, staking info)
 * @returns {Promise<{ message: string, model: string }>}
 */
export async function sendMessage(messages, context = null) {
  const response = await apiClient.post('/api/ai/chat', {
    messages,
    context,
  });
  return response.data;
}

/**
 * Get AI-powered portfolio insights
 * @param {Object} portfolioData - User's portfolio data
 * @returns {Promise<{ insights: string, recommendations: Array }>}
 */
export async function getPortfolioInsights(portfolioData) {
  const response = await apiClient.post('/api/ai/insights', {
    portfolioData,
  });
  return response.data;
}

/**
 * Health check for the AI service
 */
export async function checkHealth() {
  try {
    const response = await apiClient.get('/api/health');
    return response.data;
  } catch {
    return { status: 'offline' };
  }
}
