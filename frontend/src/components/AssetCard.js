import React, { useState } from 'react'; // Import useState for managing the modal
import { useAuth } from '../hooks/useAuth'; 
import AddToCollectionModal from './AddToCollectionModal'; // Import the new modal component

// The component now accepts 'mode', 'onReview', and 'onDelete' props
const AssetCard = ({ asset, mode, onReview, onDelete }) => {
    const { user } = useAuth(); // Get the currently logged-in user
    
    // --- NEW: State to control the visibility of the "Add to Collection" modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);

    // A function to get a color based on the asset status (your function, unchanged)
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#28a745';
            case 'pending': return '#ffc107';
            case 'rejected': return '#dc3545';
            default: return '#6c757d';
        }
    };

    // --- RENDER FUNCTION FOR ACTION BUTTONS (your function, unchanged) ---
    const renderCardActions = () => {
        if (mode === 'review') {
            return (
                <div className="card-actions review-actions">
                    <button className="btn btn-success" onClick={() => onReview(asset._id, 'approved')}>Approve</button>
                    <button className="btn btn-danger" onClick={() => onReview(asset._id, 'rejected')}>Reject</button>
                </div>
            );
        }
        
        if (user && asset.uploader && user.id === asset.uploader._id) {
             return (
                <div className="card-actions owner-actions">
                    <button className="btn btn-delete" onClick={() => onDelete(asset._id)}>Delete</button>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            {/* --- NEW: The modal will render here when isModalOpen is true --- */}
            {isModalOpen && (
                <AddToCollectionModal 
                    assetId={asset._id} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}

            <div className="asset-card">
                <div className="asset-card-image-container">
                    {asset.fileType && asset.fileType.startsWith('image/') ? (
                        <img src={asset.storageUrl} alt={asset.title} className="asset-card-image" />
                    ) : (
                        <div className="asset-card-placeholder">
                            <span>{asset.fileType ? asset.fileType.split('/')[1] : 'File'}</span>
                        </div>
                    )}

                    {/* --- NEW: "Add to Collection" button --- */}
                    {/* This button is shown to users and reviewers, but not in 'review' mode to keep the UI clean */}
                    {(user.role === 'user' || user.role === 'reviewer') && mode !== 'review' && (
                        <button 
                            className="btn-add-to-collection" 
                            onClick={() => setIsModalOpen(true)}
                            title="Add to Collection"
                        >
                            +
                        </button>
                    )}
                </div>
                <div className="asset-card-info">
                    <h4 className="asset-card-title" title={asset.title}>{asset.title}</h4>
                    
                    {asset.status === 'rejected' && asset.reviewNotes && (
                        <div className="rejection-note">
                            <strong>Reviewer Note:</strong>
                            <p>{asset.reviewNotes}</p>
                        </div>
                    )}
                    
                    <div className="asset-card-footer">
                        <span>by {asset.uploader?.name || 'Unknown'}</span>
                        <span className="asset-card-status" style={{ backgroundColor: getStatusColor(asset.status) }}>
                            {asset.status}
                        </span>
                    </div>
                </div>
                
                {renderCardActions()}
            </div>
        </>
    );
};

export default AssetCard;