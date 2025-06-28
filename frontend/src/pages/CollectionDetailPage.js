import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getCollectionById, updateCollection, removeAssetFromCollection } from '../api';
import AssetCard from '../components/AssetCard';

const CollectionDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCollection = async () => {
        try {
            const data = await getCollectionById(id);
            setCollection(data);
        } catch (err) {
            setError('Could not fetch collection. It may be private or does not exist.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollection();
    }, [id]);

    const handlePublicToggle = async (e) => {
        const newIsPublicStatus = e.target.checked;
        try {
            // Optimistically update the UI
            setCollection(prev => ({ ...prev, isPublic: newIsPublicStatus }));
            await updateCollection(id, { isPublic: newIsPublicStatus });
        } catch (err) {
            alert('Failed to update status. Reverting.');
            // Revert UI on failure
            setCollection(prev => ({ ...prev, isPublic: !newIsPublicStatus }));
        }
    };

    const handleRemoveAsset = async (assetId) => {
        if (window.confirm('Are you sure you want to remove this asset from the collection?')) {
            try {
                await removeAssetFromCollection(id, assetId);
                // Refetch the collection to show the updated asset list
                fetchCollection(); 
            } catch (err) {
                alert(`Failed to remove asset: ${err.message}`);
            }
        }
    };

    if (loading) return <p>Loading collection details...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!collection) return <p>Collection not found.</p>;

    const isOwner = user && user.id === collection.owner._id;

    return (
        <div className="collection-detail-page">
            <div className="collection-detail-header">
                <div>
                    <h1>{collection.name}</h1>
                    <p>{collection.description}</p>
                    <small>Owned by: You</small>
                </div>
                {/* Only reviewers who own the collection see the public toggle */}
                {user.role === 'reviewer' && isOwner && (
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={collection.isPublic}
                            onChange={handlePublicToggle}
                        />
                        Make Public
                    </label>
                )}
            </div>

            <hr />

            {collection.assets.length === 0 ? (
                <p>This collection is empty. Go to the <Link to="/library">Library</Link> to add assets.</p>
            ) : (
                <div className="asset-grid">
                    {collection.assets.map(asset => (
                        <div key={asset._id} className="asset-wrapper">
                             <AssetCard asset={asset} />
                             {/* Only the collection owner can remove assets from it */}
                             {isOwner && (
                                 <button onClick={() => handleRemoveAsset(asset._id)} className="btn-remove-from-collection">
                                     Remove from Collection
                                 </button>
                             )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollectionDetailPage;