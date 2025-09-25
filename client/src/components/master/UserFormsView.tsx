import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FormDetailView from '../dashboard/FormDetailView';

const UserFormsView = ({ user, onBack }) => {
    const [forms, setForms] = useState([]);
    const [selectedFormId, setSelectedFormId] = useState(null);

    useEffect(() => {
        const fetchForms = async () => {
            const res = await api.get(`/forms/user/${user._id}`);
            setForms(res.data);
        };
        fetchForms();
    }, [user]);

    if (selectedFormId) {
        return <FormDetailView formId={selectedFormId} onBack={() => setSelectedFormId(null)} />
    }

    return (
        <div>
            <button className="btn btn-secondary mb-3" onClick={onBack}>Back to Users</button>
            <h3>Forms for {user.firstName} {user.lastName}</h3>
            <ul className="list-group">
                {forms.map(form => (
                    <li key={form._id} onClick={() => setSelectedFormId(form._id)} className="list-group-item d-flex justify-content-between align-items-center" style={{cursor: 'pointer'}}>
                        <span>{`Daily Work Log (${new Date(form.date).toLocaleDateString()})`}</span>
                        {form.feedback ? <span className="badge bg-success">Graded</span> : <span className="badge bg-warning text-dark">Not Graded</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default UserFormsView;
