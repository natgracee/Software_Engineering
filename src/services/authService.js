import api from '../config/api';

export const authService = {
    // login function
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Register function
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // get user profile
    async getUserProfile() {
        try {
            const response = await api.get('/dashboard');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // logout function
    async logout() {
        try {
            const response = await api.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 