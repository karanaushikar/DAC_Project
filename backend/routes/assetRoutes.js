const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
    uploadAsset,
    getAssets,
    updateAssetStatus,
    deleteAsset,
    getReviewQueueAssets,
    getLibraryAssets,
    getAssetById
} = require('../controllers/assetController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');
// 1. Correctly destructure 'authorize' from the imported object
const { authorize } = require('../middleware/roleMiddleware'); 

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Asset Routes ---

// GET /api/assets -> Get all assets based on user role
router.get('/', protect, getAssets);

// POST /api/assets/upload -> Upload a new asset
router.post('/upload', protect, upload.single('asset'), uploadAsset);

// GET /api/assets/review -> Get assets for the review queue
router.get(
    '/review',
    protect,
    authorize('reviewer'), // 2. Call your 'authorize' function with the allowed role(s)
    getReviewQueueAssets
);

// PUT /api/assets/:id/status -> Update an asset's status
router.put(
    '/:id/status',
    protect,
    authorize('reviewer'), // Use 'authorize' here as well for consistency
    updateAssetStatus
);

// DELETE /api/assets/:id -> Delete an asset
router.delete('/:id', protect, deleteAsset);

// Route for the central library
router.get('/library', protect, getLibraryAssets); 

router.route('/:id')
    .get(protect, getAssetById) 
    .put(protect, updateAssetStatus) // Assuming this is your update status route
    .delete(protect, deleteAsset);

module.exports = router;