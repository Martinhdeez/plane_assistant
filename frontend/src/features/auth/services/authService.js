const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

/**
 * Login user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();

    // Store token in localStorage
    localStorage.setItem('access_token', data.access_token);

    return data;
}

/**
 * Register new user
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @param {string} role - User role (mantenimiento, oficinista)
 * @returns {Promise<{id: number, username: string, email: string}>}
 */
export async function register(username, email, password, role = 'mantenimiento') {
    const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
}

/**
 * Logout user (clear token)
 */
export function logout() {
    localStorage.removeItem('access_token');
}

/**
 * Get stored access token
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem('access_token');
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    return !!getToken();
}
