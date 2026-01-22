import { authenticatedFetch, getApiUrl } from '../../../utils/api';

export const generateHistory = async (chatId) => {
    const response = await authenticatedFetch(getApiUrl(`/chats/${chatId}/generate-history`), {
        method: 'POST',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate history');
    }

    return await response.json();
};

export const getHistories = async () => {
    const response = await authenticatedFetch(getApiUrl('/histories'), {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch histories');
    }

    return await response.json();
};

export const getHistory = async (historyId) => {
    const response = await authenticatedFetch(getApiUrl(`/histories/${historyId}`), {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch history');
    }

    return await response.json();
};

export const getChatHistory = async (chatId) => {
    const response = await authenticatedFetch(getApiUrl(`/chats/${chatId}/history`), {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch chat history');
    }

    return await response.json();
};

export const deleteHistory = async (historyId) => {
    const response = await authenticatedFetch(getApiUrl(`/histories/${historyId}`), {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete history');
    }
};

export const exportHistoryPDF = async (historyId) => {
    const response = await authenticatedFetch(getApiUrl(`/histories/${historyId}/pdf`), {
        method: 'GET',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to export PDF');
    }

    return await response.blob();
};

