import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// A small component for the notification badge, makes the code cleaner
const NotificationBadge = ({ count }) => {
    if (!count || count === 0) return null;
    return <span className="notification-badge">{count > 9 ? '9+' : count}</span>;
};

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // This is a placeholder for the number of items in the review queue.
    // In a real app, you would fetch this data.
    const reviewQueueCount = 5;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to={user ? "/dashboard" : "/"} className="logo">NewsFlow</Link>
                    
                    <nav className="main-nav">
                        {user ? (
                            // --- LOGGED-IN USER VIEW ---
                            <div className="nav-links-loggedIn">
                                {/* Role-specific navigation links */}
                                {user.role === 'user' && (
                                    <>
                                        <NavLink to="/dashboard" className="nav-link">My Dashboard</NavLink>
                                        <NavLink to="/library" className="nav-link">Explore Library</NavLink>
                                    </>
                                )}

                                {user.role === 'reviewer' && (
                                    <>
                                        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                                        <NavLink to="/review-queue" className="nav-link">
                                            Review Queue
                                            <NotificationBadge count={reviewQueueCount} />
                                        </NavLink>
                                    </>
                                )}

                                {user.role === 'admin' && (
                                    <>
                                        <NavLink to="/admin/assets" className="nav-link">Asset Management</NavLink>
                                        <NavLink to="/admin/users" className="nav-link">User Management</NavLink>
                                        <NavLink to="/review-queue" className="nav-link">
                                            Review Queue
                                            <NotificationBadge count={reviewQueueCount} />
                                        </NavLink>
                                    </>
                                )}
                                
                                {/* Links and actions for ALL logged-in users */}
                                <div className="user-actions">
                                    <Link to="/upload-asset" className="btn btn-primary">Upload Asset</Link>
                                    <span className="user-welcome">Welcome, {user.name || 'User'}</span>
                                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                                </div>
                            </div>
                        ) : (
                            // --- LOGGED-OUT USER VIEW ---
                            <div className="nav-links-loggedOut">
                                <NavLink to="/login" className="nav-link">Login</NavLink>
                                <NavLink to="/register" className="nav-link">Register</NavLink>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;