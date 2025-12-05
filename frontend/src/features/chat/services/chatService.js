const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Get authentication token from localStorage
 */
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Get all chats for the current user
 * @returns {Promise<Array>}
 */
export async function getChats() {
    const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch chats');
    }

    const data = await response.json();
    return data.chats;
}

/**
 * Create a new chat
 * @param {string} title - Chat title
 * @returns {Promise<Object>}
 */
export async function createChat(title) {
    const response = await fetch(`${API_BASE_URL}/chats/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create chat');
    }

    return await response.json();
}

/**
 * Get a specific chat with all messages
 * @param {number} chatId
 * @returns {Promise<Object>}
 */
export async function getChat(chatId) {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch chat');
    }

    return await response.json();
}

/**
 * Delete a chat
 * @param {number} chatId
 * @returns {Promise<void>}
 */
export async function deleteChat(chatId) {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete chat');
    }
}

/**
 * Update chat title
 * @param {number} chatId
 * @param {string} title - New title
 * @returns {Promise<Object>}
 */
export async function updateChatTitle(chatId, title) {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update chat title');
    }

    return await response.json();
}

/**
 * Send a message in a chat (with optional image) and get AI response
 * @param {number} chatId
 * @param {string} content - Message content
 * @param {File|null} image - Optional image file
 * @returns {Promise<Object>} Response with user_message and ai_message
 */
export async function sendMessage(chatId, content, image = null) {
    const token = localStorage.getItem('access_token');

    // Use FormData to support file uploads
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
        formData.append('image', image);
    }

    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
    });

    if (!response.ok) {
        // Get response text first
        const responseText = await response.text();

        // Try to parse as JSON
        let errorMessage = 'Failed to send message';
        try {
            const error = JSON.parse(responseText);
            errorMessage = error.detail || errorMessage;
        } catch (e) {
            // If not JSON, use the text directly
            errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    return await response.json();
}
