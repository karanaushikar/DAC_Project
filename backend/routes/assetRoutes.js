const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import controller functions
const {
    uploadAsset,
    getAssets,
    updateAssetStatus,
} = require('../controllers/assetController');

// Import middleware
const { protect, reviewer } = require('../middleware/authMiddleware');

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define routes
router.route('/')
    .post(protect, upload.single('asset'), uploadAsset) // 'asset' is the name of the form field for the file
    .get(protect, getAssets);

router.route('/:id/status')
    .put(protect, reviewer, updateAssetStatus);

// THIS IS THE LINE THAT FIXES THE ORIGINAL ERROR
module.exports = router;