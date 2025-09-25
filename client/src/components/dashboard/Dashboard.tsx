import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FormDetailView from './FormDetailView';
import NewForm from './NewForm';

const Dashboard = () => {
    const [forms, setForms] = useState([]);
    const [view, setView] = useState('list'); // 'list', 'detail', 'new'
    const [selectedFormId, setSelectedFormId] = useState(null);

    useEffect(() => {
        const fetchForms = async () => {
            const res = await api.get('/forms');
            setForms(res.data);
        };
        // Fetch forms only when the view is 'list'
        if (view === 'list') {
            fetchForms();
        }
    }, [view]);

    const handleViewChange = (newView, formId = null) => {
        setSelectedFormId(formId);
        setView(newView);
    }

    if (view === 'new') return <NewForm onFormSubmit={() => setView('list')} />;
    if (view === 'detail') return <FormDetailView formId={selectedFormId} onBack={() => setView('list')} />;

    return (
        <div>
            <h2>Your Dashboard</h2>
            <button className="btn btn-primary mb-4" onClick={() => handleViewChange('new')}>Open New Form</button>
            <h3>Your Previous Forms</h3>
            <ul className="list-group">
                {forms.map(form => (
                    <li key={form._id} onClick={() => handleViewChange('detail', form._id)} className="list-group-item d-flex justify-content-between align-items-center" style={{cursor: 'pointer'}}>
                        <span>{`Daily Work Log (${new Date(form.date).toLocaleDateString()})`}</span>
                        {form.feedback && <span className="badge bg-success">Graded</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default Dashboard;
