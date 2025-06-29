import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            // The navigation logic is now handled in the component that uses the user state
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }

    return (
        <div className='form-container'>
            <h2>Login</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit} className='form-group'>
                <label>Email</label>
                <input type="email" placeholder="Email" className=''value={email} onChange={(e) => setEmail(e.target.value)} required />
                
                <label>Password</label>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <br/><br/>
                <button type="submit" className='btn'>Login</button>
            </form>
            <p>Don't have account yet ? <Link to='/register'>Register</Link></p>
        </div>
    );
};
export default LoginPage;