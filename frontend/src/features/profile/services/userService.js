const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Get authentication headers
 */
function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Get current user information
 * @returns {Promise<{id: number, username: string, email: string}>}
 */
export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
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
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
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
  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
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
