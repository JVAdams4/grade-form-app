import React, { useState } from 'react';
import api from '../../services/api';

const InstructorFeedback = ({ feedback, formId, isMaster, onFeedbackSaved }) => {
    const [data, setData] = useState(feedback || { score: '', bonus: '', comments: '' });
    const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

    const handleSave = async () => {
        try {
            const res = await api.put(`/forms/${formId}/feedback`, data);
            onFeedbackSaved(res.data);
            alert('Feedback saved!');
        } catch (err) { alert('Failed to save feedback.'); }
    };

    return (
        <div className="mt-4 p-3 rounded bg-secondary text-white">
            <h4>Instructor Feedback & Grading</h4>
            <p><strong>3-2-1 Daily Work Grading System</strong>: 3 – Mastery, 2 – Needs Improvement, 1 – Incomplete.</p>
            <div className="row mb-3">
                <div className="col-auto"><label className="form-label">Score:</label><input type="text" name="score" value={data.score} onChange={handleChange} readOnly={!isMaster} className="form-control" /></div>
                <div className="col-auto"><label className="form-label">Bonus:</label><input type="text" name="bonus" value={data.bonus} onChange={handleChange} readOnly={!isMaster} className="form-control" /></div>
            </div>
            <div className="mb-3"><label className="form-label">Comments:</label><textarea name="comments" value={data.comments} onChange={handleChange} readOnly={!isMaster} className="form-control" rows="3"></textarea></div>
            {isMaster && <button className="btn btn-success" onClick={handleSave}>Save Feedback</button>}
        </div>
    );
};
export default InstructorFeedback;
