const Asset = require('../models/Asset');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary (it will use the .env variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// A helper function to upload a file buffer to Cloudinary
const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            } else {
                reject(error);
            }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

// @desc    Upload a new asset
// @route   POST /api/assets
// @access  Private (User, Reviewer, Admin)
exports.uploadAsset = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file.' });
    }

    try {
        const result = await streamUpload(req);

        const asset = new Asset({
            originalName: req.file.originalname,
            storageUrl: result.secure_url, // URL from Cloudinary
            fileType: req.file.mimetype,
            uploader: req.user._id, // From 'protect' middleware
            metadata: {
                title: req.body.title || req.file.originalname,
                description: req.body.description || '',
            },
        });

        const createdAsset = await asset.save();
        res.status(201).json(createdAsset);
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ message: 'Error uploading file.' });
    }
};

// @desc    Get assets based on user role
// @route   GET /api/assets
// @access  Private
exports.getAssets = async (req, res) => {
    try {
        let assets;
        // If the user is a standard 'user', only show their own uploads
        if (req.user.role === 'user') {
            assets = await Asset.find({ uploader: req.user._id }).populate('uploader', 'name email').sort({ createdAt: -1 });
        } else {
            // If the user is a 'reviewer' or 'admin', show all assets
            assets = await Asset.find({}).populate('uploader', 'name email').sort({ createdAt: -1 });
        }
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an asset's status (approve/reject)
// @route   PUT /api/assets/:id/status
// @access  Private (Reviewer, Admin)
exports.updateAssetStatus = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (asset) {
            asset.status = req.body.status || asset.status; // 'approved' or 'rejected'
            const updatedAsset = await asset.save();
            res.json(updatedAsset);
        } else {
            res.status(404).json({ message: 'Asset not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};