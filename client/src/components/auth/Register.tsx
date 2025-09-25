import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const { register } = useAuth();
    const navigate = useNavigate();
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/');
        } catch (err) { alert('Registration Failed'); }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-light p-4 rounded">
            <h2>Register</h2>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required className="form-control mb-3" />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required className="form-control mb-3" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="form-control mb-3" />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="form-control mb-3" />
            <button type="submit" className="btn btn-primary w-100">Register</button>
            <p className="mt-3">Already have an account? <Link to="/login">Login here</Link></p>
        </form>
    );
};
export default Register;
