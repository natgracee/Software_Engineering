import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const API_ENDPOINTS = {
  OCR: `${API_URL}/api/ocr`,
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    PROFILE: `${API_URL}/auth/profile`,
    GOOGLE: `${API_URL}/auth/google`,
    GOOGLE_CALLBACK: `${API_URL}/auth/google/callback`
  },
  GROUPS: {
    LIST: `${API_URL}/auth/groups`,
    CREATE: `${API_URL}/auth/groups`,
    GET: (groupId) => `${API_URL}/auth/groups/${groupId}`,
    JOIN: (groupId) => `${API_URL}/auth/groups/${groupId}/join`
  }
};

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000 // Increased timeout to 30 seconds
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Set longer timeout for LLM endpoints
        if (config.url.includes('/api/llm')) {
            config.timeout = 60000; // 60 seconds for LLM endpoints
        }

        console.log('Making request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            response: error.response?.data
        });

        // Only redirect to login if it's not a login request
        if (error.response?.status === 401 && !error.config?.url.includes('/auth/login')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        if (error.message === 'Network Error') {
            console.error('Network Error Details:', {
                message: error.message,
                config: error.config,
                code: error.code
            });
        }

        return Promise.reject(error);
    }
);

export default api; 