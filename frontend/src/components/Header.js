import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">NewsFlow DAM</Link>
                    <nav>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="nav-link">Admin</Link>
                                )}
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Login</Link>
                                <Link to="/register" className="nav-link">Register</Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;