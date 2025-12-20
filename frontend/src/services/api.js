/**
 * Axios-like API wrapper using fetch with VITE_API_URL
 */

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = {
    async get(endpoint) {
        const token = localStorage.getItem('access_token');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { data: await response.json() };
    },

    async post(endpoint, data) {
        const token = localStorage.getItem('access_token');
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return { data: await response.json() };
    },
};

export default api;
