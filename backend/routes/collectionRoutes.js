const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Your login protection middleware

// Import all controller functions
const {
    createCollection,
    getMyCollections,
    getCollectionById,
    addAssetToCollection,
    removeAssetFromCollection,
    deleteCollection,
    updateCollection
} = require('../controllers/collectionController');

// Define the routes
router.route('/')
    .post(protect, createCollection)
    .get(protect, getMyCollections);

router.route('/:id')
    .get(protect, getCollectionById)
    .put(protect, updateCollection)
    .delete(protect, deleteCollection);

router.route('/:id/add')
    .put(protect, addAssetToCollection);
    
router.route('/:id/remove')
    .put(protect, removeAssetFromCollection);

module.exports = router;