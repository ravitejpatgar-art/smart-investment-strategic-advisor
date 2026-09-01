import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api/v1';
    }
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Intercept requests to attach JWT Authorization header if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartvest_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  register: async (data: { email: string; password: string; full_name: string }) => {
    return (await apiClient.post('/auth/register', data)).data;
  },
  login: async (data: { email: string; password: string }) => {
    return (await apiClient.post('/auth/login', data)).data;
  },
  googleAuth: async (data: { email: string; full_name: string; google_id?: string }) => {
    return (await apiClient.post('/auth/google', data)).data;
  },
  githubAuth: async (data: { email: string; full_name: string; github_id?: string }) => {
    return (await apiClient.post('/auth/github', data)).data;
  },
  forgotPassword: async (email: string) => {
    return (await apiClient.post('/auth/forgot-password', { email })).data;
  },
  getMe: async () => {
    return (await apiClient.get('/users/me')).data;
  },
  getProfile: async () => {
    return (await apiClient.get('/users/me/profile')).data;
  },
  updateProfile: async (data: any) => {
    return (await apiClient.put('/users/me/profile', data)).data;
  },
  submitOnboarding: async (data: any) => {
    return (await apiClient.post('/onboarding/submit', data)).data;
  },
  getDashboardSummary: async () => {
    return (await apiClient.get('/dashboard/summary')).data;
  },
  getHealthScore: async () => {
    return (await apiClient.get('/health-score')).data;
  },
  getExpenses: async () => {
    return (await apiClient.get('/expenses')).data;
  },
  createExpense: async (data: any) => {
    return (await apiClient.post('/expenses', data)).data;
  },
  deleteExpense: async (id: number | string) => {
    return (await apiClient.delete(`/expenses/${id}`)).data;
  },
  getExpenseAnalytics: async () => {
    return (await apiClient.get('/expenses/analytics')).data;
  },
  getEmergencyFundStatus: async () => {
    return (await apiClient.get('/emergency-fund')).data;
  },
  getRiskProfile: async () => {
    return (await apiClient.get('/risk/profile')).data;
  },
  evaluateRisk: async (data: any) => {
    return (await apiClient.post('/risk/evaluate', data)).data;
  },
  getRecommendedAllocation: async (model?: string) => {
    return (await apiClient.get('/allocation/recommended', { params: { model } })).data;
  },
  getStockAnalysis: async (symbol: string) => {
    return (await apiClient.get(`/stocks/${symbol}`)).data;
  },
  searchStocks: async (q: string) => {
    return (await apiClient.get('/stocks/search', { params: { q } })).data;
  },
  getPortfolio: async () => {
    return (await apiClient.get('/portfolio')).data;
  },
  addHolding: async (data: any) => {
    return (await apiClient.post('/portfolio/holdings', data)).data;
  },
  deleteHolding: async (id: number | string) => {
    return (await apiClient.delete(`/portfolio/holdings/${id}`)).data;
  },
  getGoals: async () => {
    return (await apiClient.get('/goals')).data;
  },
  createGoal: async (data: any) => {
    return (await apiClient.post('/goals', data)).data;
  },
  deleteGoal: async (id: number | string) => {
    return (await apiClient.delete(`/goals/${id}`)).data;
  },
  calculateGoal: async (data: any) => {
    return (await apiClient.post('/goals/calculate', data)).data;
  },
  getMarketOverview: async () => {
    return (await apiClient.get('/market/overview')).data;
  },
  getMarketMovers: async () => {
    return (await apiClient.get('/market/movers')).data;
  },
  getSectorHeatmap: async () => {
    return (await apiClient.get('/market/heatmap')).data;
  },
  askAssistant: async (payload: string | { question?: string; message?: string; requestId?: string; user_context?: any; history?: any }) => {
    const data = typeof payload === 'string' ? { question: payload, message: payload, requestId: `req_${Date.now()}` } : payload;
    try {
      return (await apiClient.post('/ai/chat', data)).data;
    } catch {
      return (await apiClient.post('/assistant/chat', data)).data;
    }
  },
  getAssistantSuggestions: async () => {
    try {
      return (await apiClient.get('/ai/suggestions')).data;
    } catch {
      return (await apiClient.get('/assistant/suggestions')).data;
    }
  },
  getEducationCourses: async () => {
    return (await apiClient.get('/education/courses')).data;
  },
  verifyQuiz: async (course_id: string, selected_option_index: number) => {
    return (await apiClient.post('/education/verify-quiz', { course_id, selected_option_index })).data;
  },
  getAdminStats: async () => {
    return (await apiClient.get('/admin/stats')).data;
  },
  getAdminUsers: async () => {
    return (await apiClient.get('/admin/users')).data;
  },
  // VestIQ Conversations API
  getConversations: async (q?: string) => {
    return (await apiClient.get('/conversations', { params: q ? { q } : undefined })).data;
  },
  createConversation: async (title?: string) => {
    return (await apiClient.post('/conversations', { title })).data;
  },
  getConversation: async (id: string) => {
    return (await apiClient.get(`/conversations/${id}`)).data;
  },
  addConversationMessage: async (id: string, role: string, content: string, msgId?: string) => {
    return (await apiClient.post(`/conversations/${id}/messages`, { role, content, id: msgId })).data;
  },
  renameConversation: async (id: string, title: string) => {
    return (await apiClient.patch(`/conversations/${id}/rename`, { title })).data;
  },
  pinConversation: async (id: string, is_pinned?: boolean) => {
    return (await apiClient.patch(`/conversations/${id}/pin`, { is_pinned })).data;
  },
  deleteConversation: async (id: string) => {
    return (await apiClient.delete(`/conversations/${id}`)).data;
  },
};

