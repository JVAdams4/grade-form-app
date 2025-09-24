# Grade Form App (Node.js and React Version)

This file contains the code for a full-stack web application using the MERN stack (MongoDB, Express, React, Node.js) as originally planned. This is for your reference if you are able to use Node.js and npm in the future.

## Project Structure

```
grade-form-app/
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChangePassword.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── MasterDashboard.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
└── server/
    ├── src/
    │   ├── auth.ts
    │   ├── database.ts
    │   ├── forms.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

---

## Server-side Code (`server` directory)

### `package.json`

```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "start": "nodemon src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.0.12",
    "nodemailer": "^6.7.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/cors": "^2.8.12",
    "@types/express": "^4.17.13",
    "@types/jsonwebtoken": "^8.5.5",
    "@types/node": "^16.11.6",
    "@types/nodemailer": "^6.4.4",
    "nodemon": "^2.0.14",
    "ts-node": "^10.4.0",
    "typescript": "^4.4.4"
  }
}
```

### `src/auth.ts`

```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import nodemailer from 'nodemailer';
import auth from '../middleware/auth';

const router = express.Router();

// ... (Register and Login routes)

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        const payload = {
            user: {
                id: user.id,
            },
        };

        const token = jwt.sign(payload, 'yourJwtSecret', { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            // configure your email provider here
        });

        const mailOptions = {
            from: 'your-email@example.com',
            to: user.email,
            subject: 'Password Reset Link',
            html: `<p>Click <a href="http://localhost:3000/reset-password/${token}">here</a> to reset your password.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.json({ msg: 'Password reset link sent to your email' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, 'yourJwtSecret');
        const user = await User.findById(decoded.user.id);

        if (!user) {
            return res.status(400).json({ msg: 'Invalid token' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.json({ msg: 'Password reset successful' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Change Password
router.post('/change-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ msg: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
```

---

## Client-side Code (`client` directory)

### `src/App.tsx`

```typescript
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Form from './components/Form';
import MasterDashboard from './components/MasterDashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ChangePassword from './components/ChangePassword';

const App: React.FC = () => {
    // ... (state and functions)

    return (
        <Router>
            <div className="container mt-5">
                <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
                    <div className="container-fluid d-flex justify-content-between">
                        <div>
                            <a className="navbar-brand" href="#">Grade Form App</a>
                            {user && (
                                <Link to="/change-password">
                                    <button className="btn btn-secondary btn-sm me-2">Change Password</button>
                                </Link>
                            )}
                        </div>
                        {user && (
                            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
                        )}
                    </div>
                </nav>

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/form" element={<Form />} />
                    <Route path="/master" element={<MasterDashboard />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
```

### `src/components/Dashboard.tsx`

```typescript
// ... (imports)

const Dashboard: React.FC = () => {
    // ... (state and functions)

    return (
        <div>
            <h2>Welcome, {user.firstName} {user.lastName}!</h2>
            <button className="btn btn-primary mb-4" onClick={onNewForm}>Open New Form</button>
            {/* ... (rest of the component) */}
        </div>
    );
};

export default Dashboard;
```

// ... (rest of the components)

## Instructor Feedback

This feature allows a "master account" to provide feedback and a grade for each submitted form.

### Features:

*   **Feedback Form:** A dedicated form for instructors to provide a score and comments.
*   **Master Account Access:** Only the master account (`master@account.com`) can fill out the feedback form.
*   **Viewable by Users:** Students can view the feedback on their submitted forms after the instructor has submitted it. The feedback is read-only for students.
*   **Grading System:** The feedback form includes a 3-2-1 grading system for daily work.

### How it works:

1.  A student submits a "Daily Work & Project Log" form.
2.  The master account can view all submitted forms in the "Master Dashboard", where they can fill out the "Instructor Feedback & Grading" section for each form.
3.  The feedback form is not visible to the student initially.
4.  Once the master account saves the feedback (by providing a score or comments), the feedback section becomes visible to the student at the bottom of their submitted form on their dashboard.