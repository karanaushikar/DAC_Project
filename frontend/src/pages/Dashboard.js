import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
    const { user } = useAuth();

    // The component will only render if the user is authenticated,
    // thanks to the PrivateRoute.
    if (!user) {
        return null; 
    }

    return (
        <div>
            <h2>Dashboard</h2>
            <h3>Welcome, {user.name}!</h3>
            <p>Your Role: <strong>{user.role}</strong></p>
            
            <div className="dashboard-content">
                <h4>Your Actions:</h4>
                <ul>
                    {user.role === 'user' && (
                        <li>Upload new assets (images, videos, etc.)</li>
                    )}
                    {user.role === 'reviewer' && (
                        <>
                            <li>Upload new assets</li>
                            <li>Review and approve/reject assets from other users</li>
                            <li>Create and manage collections</li>
                        </>
                    )}
                    {user.role === 'admin' && (
                        <li>As an Admin, you can manage users from the Admin Dashboard.</li>
                    )}
                </ul>
                <p>
                    This is your main workspace. Future features like an asset grid,
                    upload forms, and review queues will appear here.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;