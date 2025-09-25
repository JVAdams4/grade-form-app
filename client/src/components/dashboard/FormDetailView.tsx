import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import InstructorFeedback from './InstructorFeedback';

const FormDetailView = ({ formId, onBack }) => {
    const [form, setForm] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await api.get(`/forms/${formId}`);
                setForm(res.data);
            } catch (err) { console.error(err); }
        };
        fetchForm();
    }, [formId]);

    if (!form) return <p>Loading form...</p>;

    const { formData } = form;

    return (
        <div>
            <button className="btn btn-secondary mb-3" onClick={onBack}>Back to List</button>
            <h3>{`${form.userFullName} Daily Work Log (${new Date(form.date).toLocaleDateString()})`}</h3>
            <div className="p-3 rounded bg-light text-dark">
                <h4>1. Daily Goals & Progress</h4>
                <div className="mb-2"><strong>My main goal for today is:</strong><p className="bg-white p-2 rounded text-dark">{formData.dailyGoal || 'N/A'}</p></div>
                <div className="mb-2"><strong>What I will focus on:</strong><p className="bg-white p-2 rounded text-dark">{formData.focusOn || 'N/A'}</p></div>
                <div className="mb-2"><strong>Evidence of Work:</strong><p className="bg-white p-2 rounded text-dark">{formData.evidenceOfWork || 'N/A'}</p></div>
                <hr/>
                <h4>2. Reflection & Next Steps</h4>
                <div className="mb-2"><strong>What went well today? (Wins!):</strong><p className="bg-white p-2 rounded text-dark">{formData.whatWentWell || 'N/A'}</p></div>
                <div className="mb-2"><strong>What challenges did I face?:</strong><p className="bg-white p-2 rounded text-dark">{formData.challenges || 'N/A'}</p></div>
                <div className="mb-2"><strong>What do I need help with?:</strong><p className="bg-white p-2 rounded text-dark">{formData.helpNeeded || 'N/A'}</p></div>
                <div className="mb-2"><strong>What are my next steps for tomorrow?:</strong><p className="bg-white p-2 rounded text-dark">{formData.nextSteps || 'N/A'}</p></div>
                <hr/>
                <h4>3. Productivity & Self-Assessment</h4>
                <div className="mb-2"><strong>Productivity:</strong><p className="bg-white p-2 rounded text-dark">{formData.productivity || 'N/A'}</p></div>
                <div className="mb-2"><strong>Focus:</strong><p className="bg-white p-2 rounded text-dark">{formData.focus || 'N/A'}</p></div>
                <div className="mb-2"><strong>Overall Satisfaction:</strong><p className="bg-white p-2 rounded text-dark">{formData.overallSatisfaction || 'N/A'}</p></div>
            </div>
            {(user.isMaster || form.feedback) && <InstructorFeedback feedback={form.feedback} formId={form._id} isMaster={user.isMaster} onFeedbackSaved={(updatedForm) => setForm(updatedForm)} />}
        </div>
    );
};
export default FormDetailView;
