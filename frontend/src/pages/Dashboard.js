

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssets } from '../api'; // Import our new flexible getAssets function
import AssetCard from '../components/AssetCard';

const Dashboard = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NEW: State for filter values ---
    const [filters, setFilters] = useState({
        search: '',
        status: '',
    });

    // --- NEW: Handler for filter changes ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const clearFilters = () => {
        setFilters({ search: '', status: '' });
    };

    // --- UPDATED: useEffect now depends on filters ---
    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                // Pass the current filters to the API call
                const data = await getAssets(filters);
                setAssets(data);
            } catch (err) {
                setError('Failed to fetch assets.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, [filters]); // This hook now re-runs whenever the 'filters' object changes

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div>
            <div className="dashboard-header">
                <h2>My Assets</h2>
            </div>
            
            {/* ---  Filter Bar --- */}
            <div className="filter-bar">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by title or tag..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="filter-search"
                />
                <select 
                    name="status" 
                    value={filters.status} 
                    onChange={handleFilterChange} 
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
            </div>

            {loading ? (
                <div>Loading assets...</div>
            ) : assets.length === 0 ? (
                <div className="empty-dashboard">
                    <p>No assets match your filters. Why not upload one?</p>
                    <Link to="/upload-asset" className="btn">Upload New Asset</Link>
                </div>
            ) : (
                <div className="asset-grid">
                    {assets.map(asset => (
                        <AssetCard key={asset._id} asset={asset} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;