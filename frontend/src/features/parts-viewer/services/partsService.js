import api from '../../../services/api';

/**
 * Get all parts with optional search and category filter
 */
export const getParts = async (searchQuery = '', category = '') => {
    try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (category) params.append('category', category);

        const response = await api.get(`/parts/?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching parts:', error);
        throw error;
    }
};

/**
 * Get a specific part by ID
 */
export const getPartById = async (id) => {
    try {
        const response = await api.get(`/parts/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching part:', error);
        throw error;
    }
};
