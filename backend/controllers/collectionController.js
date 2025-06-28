const Collection = require('../models/Collection');
const Asset = require('../models/Asset'); // We need this to check assets

// @desc    Create a new collection
// @route   POST /api/collections
// @access  Private
exports.createCollection = async (req, res, next) => {
    try {
        const { name, description, isPublic } = req.body;

        // A regular user cannot create a public collection
        if (req.user.role === 'user' && isPublic) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to create public collections.' });
        }

        const collection = await Collection.create({
            name,
            description,
            isPublic: req.user.role === 'reviewer' ? isPublic : false, // Ensure only reviewers can set it
            owner: req.user.id,
        });

        res.status(201).json(collection);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all collections owned by the logged-in user
// @route   GET /api/collections
// @access  Private
exports.getMyCollections = async (req, res, next) => {
    try {
        const collections = await Collection.find({ owner: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json(collections);
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single collection by its ID
// @route   GET /api/collections/:id
// @access  Private
exports.getCollectionById = async (req, res, next) => {
    try {
        const collection = await Collection.findById(req.params.id).populate({
            path: 'assets',
            populate: { path: 'uploader', select: 'name' } // Populate assets and their uploaders
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found.' });
        }

        // Security Check: Allow access if it's public, or if the user owns it
        if (!collection.isPublic && collection.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to view this collection.' });
        }

        res.status(200).json(collection);
    } catch (error) {
        next(error);
    }
};

// @desc    Add an asset to a collection
// @route   PUT /api/collections/:id/add
// @access  Private
exports.addAssetToCollection = async (req, res, next) => {
    try {
        const { assetId } = req.body;
        const collection = await Collection.findById(req.params.id);

        // Security checks
        if (!collection) { return res.status(404).json({ message: 'Collection not found.' }); }
        if (collection.owner.toString() !== req.user.id) { return res.status(403).json({ message: 'Forbidden: You can only add to your own collections.' }); }
        
        const asset = await Asset.findById(assetId);
        if (!asset) { return res.status(404).json({ message: 'Asset not found.' }); }
        
        // Add asset if it's not already in the collection
        if (!collection.assets.includes(assetId)) {
            collection.assets.push(assetId);
            await collection.save();
        }

        res.status(200).json(collection);
    } catch (error) {
        next(error);
    }
};

// @desc    Remove an asset from a collection
// @route   PUT /api/collections/:id/remove
// @access  Private
exports.removeAssetFromCollection = async (req, res, next) => {
    try {
        const { assetId } = req.body;
        const collection = await Collection.findById(req.params.id);

        if (!collection) { return res.status(404).json({ message: 'Collection not found.' }); }
        if (collection.owner.toString() !== req.user.id) { return res.status(403).json({ message: 'Forbidden: You can only remove from your own collections.' }); }
        
        collection.assets.pull(assetId); // Mongoose's .pull() is perfect for removing items from an array
        await collection.save();

        res.status(200).json(collection);
    } catch (error) {
        next(error);
    }
};


// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private
exports.deleteCollection = async (req, res, next) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) { return res.status(404).json({ message: 'Collection not found.' }); }
        if (collection.owner.toString() !== req.user.id) { return res.status(403).json({ message: 'Forbidden: You can only delete your own collections.' }); }

        await collection.deleteOne();
        res.status(200).json({ success: true, message: 'Collection deleted.' });
    } catch (error) {
        next(error);
    }
};


// @desc    Update a collection's details (name, description, isPublic)
// @route   PUT /api/collections/:id
// @access  Private
exports.updateCollection = async (req, res, next) => {
    try {
        const collection = await Collection.findById(req.params.id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found.' });
        }

        // Security check: only owner or reviewer can edit
        if (collection.owner.toString() !== req.user.id && req.user.role !== 'reviewer') {
            return res.status(403).json({ message: 'Forbidden: You cannot edit this collection.' });
        }

        const { name, description, isPublic } = req.body;

        collection.name = name || collection.name;
        collection.description = description || collection.description;

        // Security check: only a reviewer can make a collection public
        if (req.user.role === 'reviewer') {
            collection.isPublic = isPublic;
        }

        const updatedCollection = await collection.save();
        res.status(200).json(updatedCollection);

    } catch (error) {
        next(error);
    }
};