# Grade Form App

This document contains two guides:
1.  **Single-File App Guide:** Describes the functionality of the `index.html` file.
2.  **Full-Stack Implementation Guide:** A complete, copy-and-paste-ready blueprint.

---

## 1. Single-File App Guide (Current `index.html`)

(This section describes the functionality of the `index.html` file.)
## Features (Single-File App)

*   User registration and login.
*   Password recovery and change password functionality.
*   A "Daily Work & Project Log" form for users to submit.
*   Separate dashboard views for regular users and a master account.
*   A complete grading and feedback loop with status indicators.

---

## How it Works (Single-File App)

### User (Student) Flow

1.  **Register/Login:** Users can create an account or log in.
2.  **Dashboard:** After logging in, the user sees their dashboard, which contains a list of their previous form submissions.
3.  **Form Titles:** Each form in the list is titled `(User's Full Name) Daily Work Log (Date)`. For example: `John Doe Daily Work Log (9/25/2025)`.
4.  **Graded Status:** If the instructor has graded a form, a green "Graded" status will appear next to the form title.
5.  **View Submission:** Clicking on a form in the list allows the user to see their complete, submitted form. This view clearly displays each question from the form, followed by the answer the user provided.
6.  **View Feedback:** If the form has been graded, the "Instructor Feedback & Grading" section will appear at the bottom of their form, showing the score and comments from the instructor.
7.  **Submit New Form:** Users can click "Open New Form" to fill out and submit a new daily log.

### Master Account (Instructor) Flow

1.  **Login:** The instructor logs in using the master account credentials (`master@account.com`).
2.  **Master Dashboard:** The master dashboard displays a list of all registered users. Next to each user's name, a red badge will show the number of their forms that are waiting to be graded.
3.  **View User Submissions:** Clicking on a user's name opens a new view that lists all forms submitted by that specific user.
4.  **Form Statuses:** In this list, each form is clearly marked with either a green "Graded" status or a red "Not Graded" status.
5.  **View & Grade Form:** The instructor can click on any form in the list to view the student's full submission. The view shows each form question followed by the student's answer.
6.  **Attach Feedback:** At the bottom of the student's form, the "Instructor Feedback & Grading" form is displayed. The instructor can fill out the score, bonus points, and comments.
7.  **Save Feedback:** After filling out the feedback, the instructor clicks "Save Feedback". The form's status will update to "Graded", and the student can then see this feedback when they view their submission.
---
---
### (At this time, I am unable to install npm and Node.js, but I have gotten help from Gemini on creating the scaffolding for this project as well as a detailed guide on how to implement this project as a full-stack application.) ###

---
---

# 2. Appendix: Definitive Full-Stack (MERN) Implementation Guide

This guide provides the complete, copy-and-paste-ready code to build a full-stack version of this application.

## Server-Side Code (`server/`)

### **`server/.env`**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_secret
MASTER_EMAIL=master@account.com
```

### **`server/package.json`**
```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.3.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/cors": "^2.8.12",
    "@types/express": "^4.17.13",
    "@types/jsonwebtoken": "^8.5.8",
    "@types/node": "^17.0.31",
    "ts-node": "^10.7.0",
    "typescript": "^4.6.4"
  }
}
```

### **`server/src/index.ts`**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import formRoutes from './routes/forms';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/forms', formRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### **`server/src/models/User.ts`**
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isMaster: boolean;
}

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    isMaster: { type: Boolean, default: false }
});

export default model<IUser>('User', UserSchema);
```

### **`server/src/models/Form.ts`**
```typescript
import { Schema, model, Types, Document } from 'mongoose';

export interface IForm extends Document {
    userId: Types.ObjectId;
    userFullName: string;
    date: Date;
    formData: object;
    feedback: { score: string; bonus: string; comments: string; } | null;
}

const FeedbackSchema = new Schema({ score: { type: String }, bonus: { type: String }, comments: { type: String } }, { _id: false });

const FormSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    userFullName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    formData: { type: Object, required: true },
    feedback: { type: FeedbackSchema, default: null }
});

export default model<IForm>('Form', FormSchema);
```

### **`server/src/middleware/auth.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; isMaster: boolean };
}

export default function(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user: { id: string; isMaster: boolean } };
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
}
```

### **`server/src/routes/auth.ts`**
```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ firstName, lastName, email, password, isMaster: email === process.env.MASTER_EMAIL });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id, isMaster: user.isMaster } };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) { res.status(500).send('Server error'); }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, isMaster: user.isMaster } };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) { res.status(500).send('Server error'); }
});

router.get('/', auth, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user!.id);
        res.json(user);
    } catch (err) { res.status(500).send('Server Error'); }
});

export default router;
```

### **`server/src/routes/users.ts`**
```typescript
import express from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Form from '../models/Form';

const router = express.Router();

router.get('/', auth, async (req: AuthRequest, res) => {
    if (!req.user!.isMaster) return res.status(403).json({ msg: 'Access denied' });
    try {
        const users = await User.find({ isMaster: false }).select('-password');
        const forms = await Form.find({ feedback: null });
        const usersWithCounts = users.map(user => {
            const ungradedCount = forms.filter(form => form.userId.equals(user._id)).length;
            return { ...user.toObject(), ungradedCount };
        });
        res.json(usersWithCounts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
```

### **`server/src/routes/forms.ts`**
```typescript
import express from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import Form from '../models/Form';
import User from '../models/User';

const router = express.Router();

router.post('/', auth, async (req: AuthRequest, res) => {
    const { formData } = req.body;
    try {
        const user = await User.findById(req.user!.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        const newForm = new Form({ userId: user._id, userFullName: `${user.firstName} ${user.lastName}`, formData });
        const form = await newForm.save();
        res.json(form);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/', auth, async (req: AuthRequest, res) => {
    try {
        const forms = await Form.find({ userId: req.user!.id }).sort({ date: -1 });
        res.json(forms);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/user/:userId', auth, async (req: AuthRequest, res) => {
    if (!req.user!.isMaster) return res.status(403).json({ msg: 'Access denied' });
    try {
        const forms = await Form.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(forms);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.get('/:id', auth, async (req: AuthRequest, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).json({ msg: 'Form not found' });
        if (form.userId.toString() !== req.user!.id && !req.user!.isMaster) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        res.json(form);
    } catch (err) { res.status(500).send('Server Error'); }
});

router.put('/:id/feedback', auth, async (req: AuthRequest, res) => {
    if (!req.user!.isMaster) return res.status(403).json({ msg: 'Access denied' });
    try {
        const form = await Form.findByIdAndUpdate(req.params.id, { $set: { feedback: req.body } }, { new: true });
        if (!form) return res.status(404).json({ msg: 'Form not found' });
        res.json(form);
    } catch (err) { res.status(500).send('Server Error'); }
});

export default router;
```

## Client-Side Code (`client/`)

### **`client/src/services/api.ts`**
```typescript
import axios from 'axios';
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) { config.headers['x-auth-token'] = token; }
  return config;
});
export default api;
```

### **`client/src/context/AuthContext.tsx`**
```typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth');
          setUser(res.data);
        } catch (err) { localStorage.removeItem('token'); }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const userRes = await api.get('/auth');
    setUser(userRes.data);
  };
  
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    const userRes = await api.get('/auth');
    setUser(userRes.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### **`client/src/App.tsx`**
```typescript
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import MasterDashboard from './components/master/MasterDashboard';
import Navbar from './components/layout/Navbar';

const PrivateRoute = ({ children, isMasterRoute = false }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (isMasterRoute && !user.isMaster) return <Navigate to="/" />;
    if (!isMasterRoute && user.isMaster) return <Navigate to="/master" />;
    return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/master" element={<PrivateRoute isMasterRoute={true}><MasterDashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <div className="container mt-5"><AppRoutes /></div>
    </Router>
  </AuthProvider>
);

export default App;
```

### **`client/src/components/layout/Navbar.tsx`**
```typescript
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Grade Form App</Link>
        {user && <button className="btn btn-outline-danger" onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
};
export default Navbar;
```

### **`client/src/components/auth/Login.tsx`**
```typescript
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) { alert('Login Failed'); }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-light p-4 rounded">
            <h2>Login</h2>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="form-control mb-3" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="form-control mb-3" />
            <button type="submit" className="btn btn-primary w-100">Login</button>
            <p className="mt-3">Don't have an account? <Link to="/register">Register here</Link></p>
        </form>
    );
};
export default Login;
```

### **`client/src/components/auth/Register.tsx`**
```typescript
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
```

### **`client/src/components/dashboard/Dashboard.tsx`**
```typescript
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
```

### **`client/src/components/dashboard/NewForm.tsx`**
```typescript
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
```

### **`client/src/components/master/MasterDashboard.tsx`**
```typescript
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
```

### **`client/src/components/master/UserFormsView.tsx`**
```typescript
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
```

### **`client/src/components/dashboard/FormDetailView.tsx`**
```typescript
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
```

### **`client/src/components/dashboard/InstructorFeedback.tsx`**
```typescript
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
```