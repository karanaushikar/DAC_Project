import { useState, useEffect } from 'react';
import api from '../api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/admin/users');
                setUsers(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
        fetchUsers();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/status`, { status: 'approved' });
            setUsers(users.map(u => u._id === userId ? { ...u, status: 'approved' } : u));
        } catch (error) {
            console.error('Failed to approve user', error);
        }
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <h2>Admin Dashboard - User Management</h2>
            <table>
                <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.status}</td>
                            <td>
                                {user.status === 'pending' && (
                                    <button onClick={() => handleApprove(user._id)}>Approve</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default AdminDashboard;