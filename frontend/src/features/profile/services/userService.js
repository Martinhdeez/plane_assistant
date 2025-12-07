import { authenticatedFetch, getApiUrl } from '../../../utils/api';

/**
 * Get current user information
 * @returns {Promise<{id: number, username: string, email: string}>}
 */
export async function getCurrentUser() {
  const response = await authenticatedFetch(getApiUrl('/users/me'), {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch user');
  }

  return await response.json();
}

/**
 * Update user information
 * @param {Object} data - {username?, email?}
 * @returns {Promise<Object>}
 */
export async function updateUser(data) {
  const response = await authenticatedFetch(getApiUrl('/users/me'), {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update user');
  }

  return await response.json();
}

/**
 * Update user password
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */
export async function updatePassword(currentPassword, newPassword) {
  const response = await authenticatedFetch(getApiUrl('/users/me/password'), {
    method: 'PATCH',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update password');
  }

  return await response.json();
}
