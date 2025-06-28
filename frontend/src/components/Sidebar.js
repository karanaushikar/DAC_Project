import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// A small component for the notification badge, makes the code cleaner
const NotificationBadge = ({ count }) => {
    if (!count || count === 0) return null;
    return <span className="notification-badge">{count > 9 ? '9+' : count}</span>;
};

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Placeholder for review queue count - you would fetch this data
    const reviewQueueCount = 5;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        // Don't render the sidebar if there's no user (e.g., on login page)
        return null;
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link to="/dashboard" className="logo">
                    {/* You might want a smaller version of your logo here */}
                    <h2>NewsFlow</h2>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {/* --- ROLE-BASED NAVIGATION --- */}
                {user.role === 'user' && (
                    <>
                        <NavLink to="/dashboard" className="nav-link">My Dashboard</NavLink>
                        {/* --- NEW LINK FOR USER --- */}
                        <NavLink to="/my-collections" className="nav-link">My Collections</NavLink>
                        <NavLink to="/library" className="nav-link">Explore Library</NavLink>
                        <NavLink to="/upload-asset" className="nav-link">Upload Asset</NavLink>
                    </>
                )}

                {user.role === 'reviewer' && (
                    <>
                        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                        {/* --- NEW LINK FOR REVIEWER --- */}
                        <NavLink to="/my-collections" className="nav-link">My Collections</NavLink>
                        <NavLink to="/review-queue" className="nav-link">
                            Review Queue
                            <NotificationBadge count={reviewQueueCount} />
                        </NavLink>
                        <NavLink to="/upload-asset" className="nav-link">Upload Asset</NavLink>
                    </>
                )}

                {user.role === 'admin' && (
                     <>
                        <NavLink to="/admin/assets" className="nav-link">Asset Management</NavLink>
                        <NavLink to="/admin/users" className="nav-link">User Management</NavLink>
                        {/* Admin does not need a "My Collections" link as per our design */}
                     </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <span className="user-name">Welcome, {user.name || 'User'}</span>
                    <span className="user-role">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary btn-logout">
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;