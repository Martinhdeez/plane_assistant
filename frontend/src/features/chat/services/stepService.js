import { authenticatedFetch, getApiUrl } from '../../../utils/api';

/**
 * Get all steps for a chat
 * @param {number} chatId
 * @returns {Promise<Object>}
 */
export async function getSteps(chatId) {
    const response = await authenticatedFetch(getApiUrl(`/chats/${chatId}/steps`), {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch steps');
    }

    return await response.json();
}

/**
 * Get current incomplete step
 * @param {number} chatId
 * @returns {Promise<Object|null>}
 */
export async function getCurrentStep(chatId) {
    const response = await authenticatedFetch(getApiUrl(`/chats/${chatId}/steps/current`), {
        method: 'GET',
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null; // No current step found
        }
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch current step');
    }

    return await response.json();
}

/**
 * Mark a step as completed
 * @param {number} chatId
 * @param {number} stepId
 * @returns {Promise<Object>}
 */
export async function completeStep(chatId, stepId) {
    const response = await authenticatedFetch(getApiUrl(`/chats/${chatId}/steps/${stepId}/complete`), {
        method: 'PATCH',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to complete step');
    }

    return await response.json();
}
