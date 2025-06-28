import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../index.css'
const UploadAssetPage = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Photos'); // Default category
    const [tags, setTags] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('asset', file); // 'asset' must match the backend upload.single('asset')
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('tags', tags);

        try {
            await api.post('/assets/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Asset uploaded successfully! It is now pending review.');
            setTimeout(() => navigate('/dashboard'), 2000); // Redirect after 2 seconds
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload asset.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Upload New Asset</h2>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Asset File</label>
                    <input type="file" onChange={handleFileChange} required />
                </div>
                <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Company Logo 2024" required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of the asset."></textarea>
                </div>
                 <div className="form-group">
                    <label>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="Photos">Photos</option>
                        <option value="Logos">Logos</option>
                        <option value="Videos">Videos</option>
                        <option value="Documents">Documents</option>
                        <option value="Designs">Designs</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tags (comma-separated)</label>
                    <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., marketing, q4, report" />
                </div>
                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Asset'}
                </button>
            </form>
        </div>
    );
};

export default UploadAssetPage;