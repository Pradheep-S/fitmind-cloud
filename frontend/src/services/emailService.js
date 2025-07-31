import axios from 'axios';

// Configure axios base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fitmind-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('fitmind-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Email service functions
export const updateEmailPreferences = async (preferences) => {
  try {
    const response = await api.put('/email/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Failed to update email preferences:', error);
    throw new Error(error.response?.data?.message || 'Failed to update email preferences');
  }
};

export const getEmailPreferences = async () => {
  try {
    const response = await api.get('/email/preferences');
    return response.data;
  } catch (error) {
    console.error('Failed to get email preferences:', error);
    throw new Error(error.response?.data?.message || 'Failed to get email preferences');
  }
};

export const sendTestEmail = async (email, name) => {
  try {
    const response = await api.post('/email/test', { email, name });
    return response.data;
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw new Error(error.response?.data?.message || 'Failed to send test email');
  }
};

export const sendWelcomeEmail = async () => {
  try {
    const response = await api.post('/email/welcome');
    return response.data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error(error.response?.data?.message || 'Failed to send welcome email');
  }
};

export const triggerDailyReminders = async () => {
  try {
    const response = await api.post('/email/daily-reminder/trigger');
    return response.data;
  } catch (error) {
    console.error('Failed to trigger daily reminders:', error);
    throw new Error(error.response?.data?.message || 'Failed to trigger daily reminders');
  }
};

export const getSchedulerStatus = async () => {
  try {
    const response = await api.get('/email/scheduler/status');
    return response.data;
  } catch (error) {
    console.error('Failed to get scheduler status:', error);
    throw new Error(error.response?.data?.message || 'Failed to get scheduler status');
  }
};

export const startScheduler = async () => {
  try {
    const response = await api.post('/email/scheduler/start');
    return response.data;
  } catch (error) {
    console.error('Failed to start scheduler:', error);
    throw new Error(error.response?.data?.message || 'Failed to start scheduler');
  }
};

export const stopScheduler = async () => {
  try {
    const response = await api.post('/email/scheduler/stop');
    return response.data;
  } catch (error) {
    console.error('Failed to stop scheduler:', error);
    throw new Error(error.response?.data?.message || 'Failed to stop scheduler');
  }
};

export default api;
