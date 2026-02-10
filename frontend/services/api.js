import axios from 'axios';

const getBaseURL = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API] Error details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            baseURL: error.config?.baseURL,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    signup: (email, password) => api.post('/auth/signup', { email, password }),
};

export const financeApi = {
    getHistorical: () => api.get('/financials/historical'),
    getValuation: () => api.get('/financials/valuation'),
    getAssumptions: () => api.get('/financials/assumptions'),
};

export default api;
