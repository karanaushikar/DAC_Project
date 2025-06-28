import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api',
});

// Interceptor to add the token to every request
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

/*
 * @desc Fetches assets from the backend, with optional filtering.
 * @param {object} filters - An object like { status: 'approved', search: 'report' }
 */
export const getAssets = async (filters = {}) => {
    try {
        // Axios 'params' will automatically convert the filters object into a URL query string
        // e.g., api.get('/assets', { params: { status: 'approved' } })
        const { data } = await api.get('/assets', { params: filters });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch assets.');
    }
};

/**
 * @desc Fetches a single asset by its ID.
 * @route GET /api/assets/:id
 */
export const getAssetById = async (assetId) => {
    try {
        // We need to create this route on the backend
        const { data } = await api.get(`/assets/${assetId}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch asset details.');
    }
};

/**
 * @desc Fetches all approved content (collections and assets) for the central library.
 */
export const getLibraryAssets = async (filters = {}) => {
    try {
        const { data } = await api.get('/assets/library', { params: filters });
        return data; // This 'data' will now be the { collections, assets } object
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch library assets.');
    }
};

// ================================================================
// ===                REVIEWER-ONLY FUNCTIONS                   ===
// ================================================================

/**
 * @desc Fetches assets that are pending review.
 * @route GET /api/assets/review
 * @access Private (Reviewer ONLY)
 */
export const getReviewQueueAssets = async () => {
    try {
        const { data } = await api.get('/assets/review');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch review queue.');
    }
};

/**
 * @desc Updates the status of an asset (e.g., to 'approved' or 'rejected').
 * @route PUT /api/assets/:assetId/status
 * @access Private (Reviewer ONLY)
 */
export const updateAssetStatus = async (assetId, newStatus, reviewNotes = '') => {
    try {
        const { data } = await api.put(`/assets/${assetId}/status`, { 
            status: newStatus, 
            notes: reviewNotes
        });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update asset status.');
    }
};

/**
 * @desc Fetches all collections owned by the current user.
 * @route GET /api/collections
 */
export const getMyCollections = async () => {
    try {
        const { data } = await api.get('/collections');
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch collections.');
    }
};

/**
 * @desc Creates a new collection.
 * @route POST /api/collections
 * @param {object} collectionData - { name, description, isPublic }
 */
export const createCollection = async (collectionData) => {
    try {
        const { data } = await api.post('/collections', collectionData);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create collection.');
    }
};

/**
 * @desc Fetches a single collection by its ID.
 * @route GET /api/collections/:id
 */
export const getCollectionById = async (collectionId) => {
    try {
        const { data } = await api.get(`/collections/${collectionId}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch collection details.');
    }
};

/**
 * @desc Adds a specific asset to a specific collection.
 * @route PUT /api/collections/:collectionId/add
 * @param {string} collectionId
 * @param {string} assetId
 */
export const addAssetToCollection = async (collectionId, assetId) => {
    try {
        const { data } = await api.put(`/collections/${collectionId}/add`, { assetId });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add asset to collection.');
    }
};

/**
 * @desc Removes a specific asset from a specific collection.
 * @route PUT /api/collections/:collectionId/remove
 * @param {string} collectionId
 * @param {string} assetId
 */
export const removeAssetFromCollection = async (collectionId, assetId) => {
    try {
        const { data } = await api.put(`/collections/${collectionId}/remove`, { assetId });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to remove asset from collection.');
    }
};

/**
 * @desc Deletes an entire collection.
 * @route DELETE /api/collections/:collectionId
 */
export const deleteCollection = async (collectionId) => {
    try {
        const { data } = await api.delete(`/collections/${collectionId}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete collection.');
    }
};

// Add this to your api/index.js file

/**
 * @desc Updates a collection's details.
 * @route PUT /api/collections/:collectionId
 */
export const updateCollection = async (collectionId, updateData) => {
    try {
        const { data } = await api.put(`/collections/${collectionId}`, updateData);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update collection.');
    }
};

export default api;