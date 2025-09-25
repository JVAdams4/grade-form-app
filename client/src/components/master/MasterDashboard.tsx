import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import UserFormsView from './UserFormsView';

const MasterDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users');
                setUsers(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    if (selectedUser) {
        return <UserFormsView user={selectedUser} onBack={() => setSelectedUser(null)} />
    }

    if (loading) return <p>Loading users...</p>;

    return (
        <div>
            <h2>Master Dashboard</h2>
            <ul className="list-group">
                {users.map(user => (
                    <li key={user._id} onClick={() => setSelectedUser(user)} className="list-group-item d-flex justify-content-between align-items-center" style={{cursor: 'pointer'}}>
                        {user.firstName} {user.lastName}
                        {user.ungradedCount > 0 && <span className="badge bg-danger rounded-pill">{user.ungradedCount}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default MasterDashboard;
