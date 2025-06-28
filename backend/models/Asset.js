const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    // --- Core Descriptive Metadata ---
    title: { 
        type: String, 
        required: [true, 'Asset title is required.'],
        trim: true 
    },
    description: { 
        type: String,
        trim: true
    },
    tags: [{ 
        type: String,
        trim: true
    }],
    category: {
        type: String,
        required: [true, 'Asset category is required.'],
    },

    // --- Cloudinary & Technical Information ---
    storageUrl: { // Public URL from Cloudinary's 'secure_url'
        type: String, 
        required: true 
    },
    fileKey: { // Key for management from Cloudinary's 'public_id'
        type: String, 
        required: true 
    },
    fileType: { // The MIME type e.g., 'image/jpeg'
        type: String, 
        required: true 
    },
    fileSize: { // File size in bytes
        type: Number,
        required: true
    },
    
    // --- Management & Ownership ---
    uploader: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    reviewNotes: {
    type: String,
    default: '' 
}

}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Asset', assetSchema);