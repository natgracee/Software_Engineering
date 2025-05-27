import api from '../config/api';

export const llmService = {
    async processBillText(text) {
        try {
            const response = await api.post('/api/llm/process-bill', { text });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    async processBillImage(imageData) {
        try {
            const response = await api.post('/api/llm/process-image', { image: imageData });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 