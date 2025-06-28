import React, { useState, useEffect } from 'react';
// Import all the necessary API functions
import { getMyCollections, addAssetToCollection, getAssetById } from '../api';

const AddToCollectionModal = ({ assetId, onClose }) => {
    const [myCollections, setMyCollections] = useState([]);
    // --- NEW STATE: to track which collections the asset is already in ---
    const [assetInCollections, setAssetInCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- UPDATED useEffect: fetches both user's collections and asset's status ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both pieces of data at the same time for efficiency
                const [collectionsData, assetDetails] = await Promise.all([
                    getMyCollections(),
                    getAssetById(assetId)
                ]);
                
                setMyCollections(collectionsData);
                // Store the array of collection IDs where the asset is already present
                setAssetInCollections(assetDetails.inCollections);
            } catch (err) {
                console.error(err);
                alert('Could not load collection data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [assetId]); // Dependency array ensures this runs if the assetId changes

    // --- UPDATED handleAddToCollection: now checks before adding ---
    const handleAddToCollection = async (collectionId) => {
        // Prevent adding if it's already in the collection
        if (assetInCollections.includes(collectionId)) {
            return; // Do nothing if already added
        }

        try {
            await addAssetToCollection(collectionId, assetId);
            // Optimistically update the UI to show it's now added, without a full refetch
            setAssetInCollections(prev => [...prev, collectionId]);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Add to Collection</h3>
                {loading ? <p>Loading...</p> : (
                    <ul className="modal-collection-list">
                        {myCollections.length === 0 ? (
                            <p>You have no collections. Create one on the "My Collections" page first!</p>
                        ) : (
                            myCollections.map(collection => {
                                // Check if the current collection's ID is in our state array
                                const isAdded = assetInCollections.includes(collection._id);

                                return (
                                    <li 
                                        key={collection._id} 
                                        onClick={() => handleAddToCollection(collection._id)}
                                        // Add a class to style it differently if it's already added
                                        className={isAdded ? 'added' : ''}
                                    >
                                        <span>{collection.name}</span>
                                        {/* Show the "Added" status text if isAdded is true */}
                                        {isAdded && <span className="status-text">Added</span>}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                )}
                <button className="btn" onClick={onClose}>Done</button>
            </div>
        </div>
    );
};

export default AddToCollectionModal;