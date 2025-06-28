import React, { useState, useEffect } from 'react';
// Import the API functions we created
import { getReviewQueueAssets, updateAssetStatus } from '../api'; 
// Import your reusable AssetCard. We will modify it slightly.
import AssetCard from '../components/AssetCard'; 
// Optional: A loading spinner component
// import Spinner from '../components/Spinner';

const ReviewQueuePage = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch the assets needing review when the component loads
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const data = await getReviewQueueAssets();
                setAssets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []); // The empty array ensures this effect runs only once

    // This function will be called by the buttons on the AssetCard
    const handleReview = async (assetId, newStatus) => {
        try {
            // Ask for confirmation before rejecting
            if (newStatus === 'rejected') {
                const reason = prompt("Please provide a reason for rejection (optional):");
                await updateAssetStatus(assetId, newStatus, reason || '');
            } else {
                await updateAssetStatus(assetId, newStatus);
            }
            
            // On success, remove the reviewed asset from the list to update the UI
            setAssets(prevAssets => prevAssets.filter(asset => asset._id !== assetId));
            
        } catch (err) {
            // Show an alert if the API call fails
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) {
        return <div>Loading assets for review...</div>; // Or <Spinner />
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="review-queue-container">
            <h1>Review Queue</h1>
            {assets.length === 0 ? (
                <div className="empty-queue">
                    <h3>All clear!</h3>
                    <p>There are no assets currently waiting for review.</p>
                </div>
            ) : (
                <p>You have <strong>{assets.length}</strong> {assets.length === 1 ? 'asset' : 'assets'} to review.</p>
            )}

            <div className="assets-grid"> {/* Reusing the grid style from the dashboard */}
                {assets.map(asset => (
                    // We need to pass the 'handleReview' function to each card
                    // And a 'mode' to tell the card to show review buttons
                    <AssetCard 
                        key={asset._id} 
                        asset={asset} 
                        mode="review"
                        onReview={handleReview} 
                    />
                ))}
            </div>
        </div>
    );
};

export default ReviewQueuePage;