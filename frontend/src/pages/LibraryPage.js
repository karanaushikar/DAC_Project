import { useState, useEffect } from 'react';
import { getLibraryAssets } from '../api';
import AssetCard from '../components/AssetCard';
import CollectionCard from '../components/CollectionCard'; // Import the new component
import '../index.css'
const LibraryPage = () => {
    // --- NEW: State for both collections and individual assets ---
    const [collections, setCollections] = useState([]);
    const [assets, setAssets] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // We can re-add filtering later. For now, let's focus on displaying the data.

    useEffect(() => {
        const fetchLibrary = async () => {
            setLoading(true);
            try {
                // The API now returns an object with two properties
                const data = await getLibraryAssets();
                setCollections(data.collections);
                setAssets(data.assets);
            } catch (err) {
                setError('Failed to fetch the asset library.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, []);

    if (loading) return <p>Loading library...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div>
            <div className="dashboard-header">
                <h2>Explore Asset Library</h2>
                <p>Search all approved assets and featured collections from across the organization.</p>
            </div>
            
            {/* --- Section for Public Collections --- */}
            {collections.length > 0 && (
                <section className="library-section">
                    <h3>Featured Collections</h3>
                    <div className="collection-grid">
                        {collections.map(collection => (
                            <CollectionCard key={collection._id} collection={collection} />
                        ))}
                    </div>
                </section>
            )}

            {/* --- Section for Individual Assets --- */}
            <section className="library-section">
                <h3>Individual Assets</h3>
                {assets.length === 0 ? (
                    <p>No individual approved assets found.</p>
                ) : (
                    <div className="asset-grid">
                        {assets.map(asset => (
                            <AssetCard key={asset._id} asset={asset} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default LibraryPage;