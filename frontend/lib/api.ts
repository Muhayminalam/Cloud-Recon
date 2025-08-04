import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Auth endpoints
  register: (email: string, password: string) =>
    api.post('/api/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/api/login', { email, password }),
  
  getProfile: () =>
    api.get('/api/me'),

  // Scan endpoints
  performScan: (target: string) =>
    api.post('/api/scan', { target }),

  // Payload endpoints
  testPayload: (payload_type: string, target_url: string, payload: string) =>
    api.post('/api/payload', { payload_type, target_url, payload }),

  // Logs endpoints
  getLogs: (params?: { limit?: number; offset?: number; tool?: string }) =>
    api.get('/api/logs', { params }),

  deleteLog: (logId: string) =>
    api.delete(`/api/logs/${logId}`),

  // CVE endpoints
  getCVEs: (params?: { severity?: string; tag?: string; limit?: number }) =>
    api.get('/api/cves', { params }),

  getCVEById: (cveId: string) =>
    api.get(`/api/cves/${cveId}`),

  searchCVEs: (searchTerm: string, limit?: number) =>
    api.get(`/api/cves/search/${searchTerm}`, { params: { limit } }),

  // PCAP endpoints
  getPCAPData: () =>
    api.get('/api/pcap'),

  getSetupGuide: () =>
    api.get('/api/setup'),
};

export default api;