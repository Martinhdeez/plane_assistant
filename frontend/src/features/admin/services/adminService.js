import { authenticatedFetch, getApiUrl } from '../../../utils/api';

/**
 * Initialize first admin user
 * @param {Object} userData - {username, email, password}
 * @returns {Promise<Object>}
 */
export async function initializeAdmin(userData) {
    const response = await fetch(getApiUrl('/admin/init'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to initialize admin');
    }

    return await response.json();
}

/**
 * Get all users (admin only)
 * @param {Object} filters - {skip?, limit?, role?, division?, is_active?}
 * @returns {Promise<Array>}
 */
export async function getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);
    if (filters.role) params.append('role', filters.role);
    if (filters.division) params.append('division', filters.division);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);

    const response = await authenticatedFetch(
        getApiUrl(`/admin/users?${params.toString()}`),
        { method: 'GET' }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch users');
    }

    return await response.json();
}

/**
 * Create new user (admin only)
 * @param {Object} userData - {username, email, password, role?, division?}
 * @returns {Promise<Object>}
 */
export async function createUser(userData) {
    const response = await authenticatedFetch(getApiUrl('/admin/users'), {
        method: 'POST',
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create user');
    }

    return await response.json();
}

/**
 * Update user (admin only)
 * @param {number} userId
 * @param {Object} userData - {email?, role?, division?, is_active?}
 * @returns {Promise<Object>}
 */
export async function updateUserAdmin(userId, userData) {
    const response = await authenticatedFetch(getApiUrl(`/admin/users/${userId}`), {
        method: 'PUT',
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update user');
    }

    return await response.json();
}

/**
 * Delete user (admin only) - soft delete
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export async function deleteUser(userId) {
    const response = await authenticatedFetch(getApiUrl(`/admin/users/${userId}`), {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete user');
    }

    return await response.json();
}

/**
 * Assign operarios to oficinista (admin only)
 * @param {number} oficinistaId
 * @param {Array<number>} operarioIds
 * @returns {Promise<Object>}
 */
export async function assignOperarios(oficinistaId, operarioIds) {
    const response = await authenticatedFetch(
        getApiUrl(`/admin/users/${oficinistaId}/assign`),
        {
            method: 'PUT',
            body: JSON.stringify({ operario_ids: operarioIds }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to assign operarios');
    }

    return await response.json();
}

/**
 * Get assigned operarios for oficinista (admin only)
 * @param {number} oficinistaId
 * @returns {Promise<Array>}
 */
export async function getAssignedOperarios(oficinistaId) {
    const response = await authenticatedFetch(
        getApiUrl(`/admin/users/${oficinistaId}/assigned`),
        { method: 'GET' }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch assigned operarios');
    }

    return await response.json();
}

/**
 * Get list of all divisions (admin only)
 * @returns {Promise<{divisions: Array<string>}>}
 */
export async function getDivisions() {
    const response = await authenticatedFetch(getApiUrl('/admin/divisions'), {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch divisions');
    }

    return await response.json();
}
