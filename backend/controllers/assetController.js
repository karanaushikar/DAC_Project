const Asset = require('../models/Asset');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const User = require('../models/User')
const Collection = require('../models/Collection');
// Configure Cloudinary (this part is unchanged)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload a file buffer to Cloudinary (unchanged)
const streamUpload = (req) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "dam_assets" },
            (error, result) => {
                if (result) { resolve(result); }
                else { reject(error); }
            }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
};

/**
 * @desc    Upload a new asset
 * @route   POST /api/assets/upload
 * @access  Private (Any logged-in user)
 */
exports.uploadAsset = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file.' });
        }
        const { title, description, tags, category } = req.body;
        const result = await streamUpload(req);

        const asset = new Asset({
            title: title || req.file.originalname,
            description: description || '',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            category: category || 'Uncategorized',
            storageUrl: result.secure_url,
            fileKey: result.public_id, // CRITICAL: saving the public_id as fileKey
            fileType: req.file.mimetype,
            fileSize: result.bytes,
            uploader: req.user.id,
            status: 'pending',
        });

        const createdAsset = await asset.save();
        res.status(201).json(createdAsset);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get assets with optional filtering
 * @route   GET /api/assets
 * @access  Private
 */
exports.getAssets = async (req, res, next) => {
    try {
        const { status, fileType, search } = req.query;
        let query = {}; // Start with an empty query

        // --- ROLE-BASED ACCESS CONTROL ---
        // For this general route, a 'user' or 'reviewer' will only see their own assets by default.
        // A separate 'library' or 'admin' route can show all assets.
        query.uploader = req.user.id;

        // --- DYNAMIC FILTERING ---
        // Add filters to the query if they are provided in the URL
        if (status) {
            query.status = status;
        }
        if (fileType) {
            // Use a regex for partial matching, e.g., 'image' finds 'image/png' and 'image/jpeg'
            query.fileType = { $regex: `^${fileType}`, $options: 'i' };
        }
        if (search) {
            // Search in both title and tags
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const assets = await Asset.find(query)
            .populate('uploader', 'name email')
            .sort({ createdAt: -1 });

        res.json(assets);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update an asset's status (approve/reject)
 * @route   PUT /api/assets/:id/status
 * @access  Private (Reviewer, Admin)
 */
exports.updateAssetStatus = async (req, res, next) => {
    try {
        // We get both status and notes from the request body
        const { status, notes } = req.body; 

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        
        asset.status = status;
        
        // --- LOGIC FOR HANDLING NOTES ---
        if (status === 'rejected') {
            // If the asset is rejected, save the notes.
            asset.reviewNotes = notes || 'No reason provided.'; 
        } else if (status === 'approved') {
            // If it's approved, clear any previous rejection notes.
            asset.reviewNotes = ''; 
        }

        const updatedAsset = await asset.save();
        res.json(updatedAsset);

    } catch (error) {
        next(error);
    }
};

 

/**
 * @desc    Delete an asset uploaded by the user
 * @route   DELETE /api/assets/:id
 * @access  Private (Owner of the asset)
 */
exports.deleteAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // --- THE CRITICAL OWNERSHIP CHECK ---
        // Verify that the user requesting the delete is the one who uploaded it.
        if (asset.uploader.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this asset' });
        }

        // 1. Delete the file from Cloudinary using its public_id, which you've stored as 'fileKey'
        if (asset.fileKey) {
            await cloudinary.uploader.destroy(asset.fileKey);
        }

        // 2. Delete the asset from the MongoDB database
        await asset.remove();

        res.status(200).json({ id: req.params.id, message: 'Asset deleted successfully' });

    } catch (error) {
        next(error); // Pass any errors to the central error handler
    }
};


/**
 * @desc    Get all assets pending review
 * @route   GET /api/assets/review
 * @access  Private (Reviewer ONLY)
 */
exports.getReviewQueueAssets = async (req, res, next) => {
    try {
        // Find all assets with the status of 'pending'
        const assetsToReview = await Asset.find({ status: 'pending' })
            .populate('uploader', 'name email') // Get uploader's info
            .sort({ createdAt: 1 }); // Sort by oldest first (first-in, first-out queue)

        res.json(assetsToReview);
    } catch (error) {
        next(error); // Pass error to the central error handler
    }
};


/**
 * @desc    Get all public collections AND individual approved assets for the central library.
 * @route   GET /api/assets/library
 * @access  Private (Any logged-in user)
 */
exports.getLibraryAssets = async (req, res, next) => {
    try {
        // --- 1. Fetch all Public Collections ---
        // We populate the owner's name and the first 4 assets to use as thumbnails.
        const publicCollections = await Collection.find({ isPublic: true })
            .populate('owner', 'name')
            .populate({
                path: 'assets',
                select: 'filePath fileType', // Select only the fields needed for a thumbnail
                perDocumentLimit: 4 // Limit to 4 thumbnails per collection card
            })
            .sort({ updatedAt: -1 });

        // --- 2. Fetch all Individual Approved Assets (that are NOT in a public collection) ---
        // First, get an array of all asset IDs that are already inside our public collections.
        let assetsInPublicCollections = [];
        publicCollections.forEach(collection => {
            assetsInPublicCollections.push(...collection.assets.map(asset => asset._id));
        });

        // Now, find all approved assets whose ID is 'not in' that array.
        const individualAssets = await Asset.find({ 
            status: 'approved',
            _id: { $nin: assetsInPublicCollections } 
        })
        .populate('uploader', 'name')
        .sort({ createdAt: -1 });

        // --- 3. Return the structured data to the frontend ---
        res.status(200).json({
            collections: publicCollections,
            assets: individualAssets
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single asset by its ID
 * @route   GET /api/assets/:id
 * @access  Private
 */
exports.getAssetById = async (req, res, next) => {
    try {
        // We also need to get the collections this asset is a part of.
        // First, find the asset itself.
        const asset = await Asset.findById(req.params.id).populate('uploader', 'name');
        
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        // Second, find all collections owned by the current user that contain this asset's ID.
        const collectionsContainingAsset = await Collection.find({ 
            owner: req.user.id, 
            assets: req.params.id 
        }).select('_id'); // We only need the IDs

        // Convert the result to a simple array of strings for easy lookup on the frontend
        const collectionIds = collectionsContainingAsset.map(c => c._id.toString());

        // Return a combined object
        res.status(200).json({ 
            asset: asset, 
            inCollections: collectionIds 
        });

    } catch (error) {
        
        next(error);
    }
};