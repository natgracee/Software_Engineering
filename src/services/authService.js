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
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // update user profile
    async updateProfile(profileData) {
        try {
            const response = await api.put('/auth/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // delete user account
    async deleteAccount() {
        try {
            const response = await api.delete('/auth/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // logout function
    async logout() {
        try {
            localStorage.removeItem('token');
            return { message: 'Logged out successfully' };
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // function to get user's groups
    async getUserGroups() {
        try {
            const response = await api.get('/auth/groups');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // function to create a group
    async createGroup(groupData) {
        try {
            const formData = new FormData();
            formData.append('groupName', groupData.groupName);
            if (groupData.profilePicture) {
                formData.append('profilePicture', groupData.profilePicture);
            }

            const response = await api.post('/auth/groups', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // function to get a single group by ID
    async getGroupById(groupId) {
        try {
            const response = await api.get(`/auth/groups/${groupId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // function for a user to join a group
    async joinGroup(groupId) {
        try {
            const response = await api.post(`/auth/groups/${groupId}/join`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 