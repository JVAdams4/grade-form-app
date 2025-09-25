import React, { useState } from 'react';
import api from '../../services/api';

const NewForm = ({ onFormSubmit }) => {
    const [formData, setFormData] = useState({
        dailyGoal: '', focusOn: '', evidenceOfWork: '', whatWentWell: '',
        challenges: '', helpNeeded: '', nextSteps: '', productivity: '', focus: '', overallSatisfaction: ''
    });

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/forms', { formData });
            alert('Form Submitted!');
            onFormSubmit();
        } catch (err) { alert('Submission Failed'); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Daily Work & Project Log</h3>
            <h4>1. Daily Goals & Progress</h4>
            <div className="mb-3"><label className="form-label">My main goal for today is:</label><input type="text" name="dailyGoal" value={formData.dailyGoal} onChange={handleChange} className="form-control" /></div>
            <div className="mb-3"><label className="form-label">What I will focus on:</label><textarea name="focusOn" value={formData.focusOn} onChange={handleChange} className="form-control"></textarea></div>
            <div className="mb-3"><label className="form-label">Evidence of Work:</label><textarea name="evidenceOfWork" value={formData.evidenceOfWork} onChange={handleChange} className="form-control"></textarea></div>
            <h4>2. Reflection & Next Steps</h4>
            <div className="mb-3"><label className="form-label">What went well today? (Wins!):</label><input type="text" name="whatWentWell" value={formData.whatWentWell} onChange={handleChange} className="form-control" /></div>
            <div className="mb-3"><label className="form-label">What challenges did I face?:</label><input type="text" name="challenges" value={formData.challenges} onChange={handleChange} className="form-control" /></div>
            <div className="mb-3"><label className="form-label">What do I need help with?:</label><input type="text" name="helpNeeded" value={formData.helpNeeded} onChange={handleChange} className="form-control" /></div>
            <div className="mb-3"><label className="form-label">What are my next steps for tomorrow?:</label><input type="text" name="nextSteps" value={formData.nextSteps} onChange={handleChange} className="form-control" /></div>
            <h4>3. Productivity & Self-Assessment</h4>
            <div className="mb-3"><label className="form-label">Productivity:</label><select name="productivity" value={formData.productivity} onChange={handleChange} className="form-select"><option value="">Select...</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
            <div className="mb-3"><label className="form-label">Focus:</label><select name="focus" value={formData.focus} onChange={handleChange} className="form-select"><option value="">Select...</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div>
            <div className="mb-3"><label className="form-label">Overall Satisfaction:</label><select name="overallSatisfaction" value={formData.overallSatisfaction} onChange={handleChange} className="form-select"><option value="">Select...</option><option value="😞">😞</option><option value="😐">😐</option><option value="🙂">🙂</option><option value="😃">😃</option></select></div>
            <button type="submit" className="btn btn-success">Save and Send to Teacher</button>
        </form>
    );
};
export default NewForm;
