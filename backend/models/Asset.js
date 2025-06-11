const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    storageUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    metadata: {
        title: { type: String },
        description: { type: String },
        tags: [{ type: String }],
    },
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);