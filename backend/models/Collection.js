const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A collection must have a name'],
        trim: true,
        maxlength: [100, 'Collection name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // A reference to the user who created it
        required: true,
    },
    assets: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Asset', // An array of references to assets in this collection
    }],
    isPublic: {
        type: Boolean,
        default: false, // Collections are private by default
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Collection', collectionSchema);