/**
 * API utility with automatic token expiration handling
 */

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

/**
 * Handle 401 Unauthorized responses by logging out user
 */
function handleUnauthorized() {
    console.log('Token expired or invalid - logging out');
    localStorage.removeItem('access_token');
    window.location.href = '/';
}

/**
 * Make authenticated API request with automatic logout on 401
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('access_token');

    // Check if body is FormData
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...options.headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!isFormData && headers['Content-Type'] !== undefined) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    } else if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    // Remove Content-Type if explicitly set to undefined (for FormData)
    if (headers['Content-Type'] === undefined) {
        delete headers['Content-Type'];
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Auto-logout on 401 Unauthorized
    if (response.status === 401) {
        handleUnauthorized();
        throw new Error('Session expired. Please login again.');
    }

    return response;
}

/**
 * Get full API URL
 */
export function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

export { API_BASE_URL };
