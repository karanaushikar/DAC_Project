import React from 'react';
import { Link } from 'react-router-dom';

const CollectionCard = ({ collection }) => {
    // This component expects `collection.assets` to be an array of asset objects.
    // If the array is empty, it will just show placeholders.
    return (
        <Link to={`/collection/${collection._id}`} className="collection-card-link">
            <div className="collection-card">
                <div className="collection-card-thumbnails">
                    {/* Display up to 4 asset thumbnails */}
                    {collection.assets && collection.assets.slice(0, 4).map((asset, index) => (
                        <img key={index} src={asset.filePath} alt="" className="thumbnail" />
                    ))}
                    
                    {/* Add placeholder divs if there are fewer than 4 assets */}
                    {/* This ensures the grid always has 4 squares */}
                    {collection.assets && Array(Math.max(0, 4 - collection.assets.length)).fill(0).map((_, index) => (
                        <div key={`placeholder-${index}`} className="thumbnail placeholder"></div>
                    ))}
                </div>
                <div className="collection-card-info">
                    <h3>{collection.name}</h3>
                    {/* Displaying the actual number of items in the collection */}
                    <p>{collection.assets.length} items</p>
                </div>
            </div>
        </Link>
    );
};

export default CollectionCard;