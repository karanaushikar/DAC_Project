import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // We need this to check the user's role
import { getMyCollections, createCollection, deleteCollection } from '../api';

const MyCollectionsPage = () => {
    const { user } = useAuth(); // Get user info for role-specific features
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the "Create New Collection" form
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDesc, setNewCollectionDesc] = useState('');
    const [isPublic, setIsPublic] = useState(false); // For the reviewer's checkbox

    // Fetch collections when the component loads
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const data = await getMyCollections();
                setCollections(data);
            } catch (err) {
                setError('Failed to load your collections.');
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    // Handler for the create form submission
    const handleCreateCollection = async (e) => {
        e.preventDefault();
        if (!newCollectionName.trim()) {
            alert('Please provide a name for the collection.');
            return;
        }
        try {
            const collectionData = { 
                name: newCollectionName, 
                description: newCollectionDesc,
                isPublic: user.role === 'reviewer' ? isPublic : false
            };
            const newCollection = await createCollection(collectionData);
            // Add the new collection to the top of the list for immediate feedback
            setCollections([newCollection, ...collections]);
            // Reset the form fields
            setNewCollectionName('');
            setNewCollectionDesc('');
            setIsPublic(false);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    // Handler for deleting a collection
    const handleDelete = async (collectionId) => {
        if (window.confirm('Are you sure you want to delete this collection? This cannot be undone.')) {
            try {
                await deleteCollection(collectionId);
                // Remove the collection from the UI
                setCollections(prev => prev.filter(c => c._id !== collectionId));
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    if (loading) return <p>Loading your collections...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="collections-page">
            <h1>My Collections</h1>

            {/* --- Create New Collection Form --- */}
            <div className="create-collection-form">
                <h3>Create a New Collection</h3>
                <form onSubmit={handleCreateCollection}>
                    <input
                        type="text"
                        placeholder="Collection Name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Optional: Description"
                        value={newCollectionDesc}
                        onChange={(e) => setNewCollectionDesc(e.target.value)}
                    ></textarea>
                    
                    {/* --- Reviewer-only feature --- */}
                    {user.role === 'reviewer' && (
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            Make this collection public
                        </label>
                    )}

                    <button type="submit" className="btn">Create Collection</button>
                </form>
            </div>

            <hr />

            {/* --- List of Existing Collections --- */}
            <h2>Your Existing Collections</h2>
            {collections.length === 0 ? (
                <p>You haven't created any collections yet.</p>
            ) : (
                <ul className="collection-list">
                    {collections.map(collection => (
                        <li key={collection._id} className="collection-item">
                            <Link to={`/collection/${collection._id}`} className="collection-link">
                                <span className="collection-name">{collection.name}</span>
                                <span className="collection-asset-count">{collection.assets.length} assets</span>
                            </Link>
                            <button onClick={() => handleDelete(collection._id)} className="btn-delete-small">
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyCollectionsPage;