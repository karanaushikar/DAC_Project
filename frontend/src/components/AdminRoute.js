import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || user.role !== 'admin') {
        // If not an admin, redirect to the general dashboard or login page
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default AdminRoute;