# Grade Form App

This is a web application for students to submit daily work logs and for an instructor (master account) to provide grades and feedback.

**Note:** The primary file for this application is `index.html`, which runs as a self-contained, single-page application using React and the browser's Local Storage. The full-stack implementation details are included below as a guide for future development.

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

# Appendix: Full-Stack (MERN) Implementation Guide

This section provides a more detailed blueprint for building a full-stack version of this application with a **MongoDB** database, an **Express.js** backend, and a **React** frontend.

## Updated Project Structure

This structure includes more descriptive components for clarity.

```
grade-form-app/
├── client/ (React)
│   └── src/
│       ├── components/
│       │   ├── auth/ (Login, Register, etc.)
│       │   ├── dashboard/ (Dashboard, FormDetailView)
│       │   └── master/ (MasterDashboard, UserFormsView)
│       ├── services/ (api.ts for Axios calls)
│       ├── App.tsx
│       └── ...
└── server/ (Node.js/Express)
    ├── models/ (Mongoose Schemas)
    │   ├── User.ts
    │   └── Form.ts
    ├── routes/ (API Endpoints)
    │   ├── auth.ts
    │   ├── users.ts
    │   └── forms.ts
    ├── middleware/
    │   └── auth.ts (JWT verification)
    └── index.ts
```

---

## Server-Side (Express.js & Mongoose)

### 1. Data Models (`server/models/`)

**`User.ts`**
```typescript
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isMaster: { type: Boolean, default: false } // To identify the master account
});

export default model('User', UserSchema);
```

**`Form.ts`**
```typescript
import { Schema, model, Types } from 'mongoose';

const FeedbackSchema = new Schema({
    score: { type: String },
    bonus: { type: String },
    comments: { type: String }
}, { _id: false });

const FormSchema = new Schema({
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    userFullName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    formData: { type: Object, required: true }, // Stores the Q&A data
    feedback: { type: FeedbackSchema, default: null } // Becomes non-null when graded
});

export default model('Form', FormSchema);
```

### 2. API Routes (`server/routes/`)

**`users.ts` (For Master Account)**
```typescript
import express from 'express';
import auth from '../middleware/auth'; // Middleware to check for master account
import User from '../models/User';
import Form from '../models/Form';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users and their ungraded form counts
// @access  Private (Master only)
router.get('/', auth, async (req, res) => {
    if (!req.user.isMaster) return res.status(403).json({ msg: 'Access denied' });

    try {
        const users = await User.find({ isMaster: false }).select('-password');
        const forms = await Form.find({ feedback: null });

        const usersWithCounts = users.map(user => {
            const ungradedCount = forms.filter(form => form.userId.equals(user._id)).length;
            return { ...user.toObject(), ungradedCount };
        });

        res.json(usersWithCounts);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

export default router;
```

**`forms.ts`**
```typescript
import express from 'express';
import auth from '../middleware/auth';
import Form from '../models/Form';

const router = express.Router();

// @route   POST /api/forms
// @desc    Submit a new form
// @access  Private
router.post('/', auth, async (req, res) => { /* ... implementation ... */ });

// @route   GET /api/forms
// @desc    Get all forms for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => { /* ... implementation ... */ });

// @route   GET /api/forms/user/:userId
// @desc    Get all forms for a specific user (for master)
// @access  Private (Master only)
router.get('/user/:userId', auth, async (req, res) => { /* ... implementation ... */ });

// @route   GET /api/forms/:id
// @desc    Get a single form by its ID
// @access  Private
router.get('/:id', auth, async (req, res) => { /* ... implementation ... */ });

// @route   PUT /api/forms/:id/feedback
// @desc    Add or update feedback for a form (for master)
// @access  Private (Master only)
router.put('/:id/feedback', auth, async (req, res) => { /* ... implementation ... */ });

export default router;
```

---

## Client-Side (React)

Below are more detailed component examples showing how they would interact with the backend API (e.g., using `axios`).

### `MasterDashboard.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Your API service

const MasterDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await api.get('/users');
            setUsers(res.data);
        };
        fetchUsers();
    }, []);

    if (selectedUser) {
        // return <UserFormsView user={selectedUser} onBack={() => setSelectedUser(null)} />
    }

    return (
        <div>
            <h2>Master Dashboard</h2>
            <ul className="list-group">
                {users.map(user => (
                    <li key={user._id} onClick={() => setSelectedUser(user)} className="list-group-item d-flex justify-content-between">
                        {user.firstName} {user.lastName}
                        {user.ungradedCount > 0 && <span className="ungraded-count">{user.ungradedCount}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
```

### `UserFormsView.tsx` (For Master)
```typescript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserFormsView = ({ user, onBack }) => {
    const [forms, setForms] = useState([]);

    useEffect(() => {
        const fetchForms = async () => {
            const res = await api.get(`/forms/user/${user._id}`);
            setForms(res.data);
        };
        fetchForms();
    }, [user]);

    return (
        <div>
            <button onClick={onBack}>Back</button>
            <h3>Forms for {user.firstName}</h3>
            <ul className="list-group">
                {forms.map(form => (
                    <li key={form._id} className="list-group-item d-flex justify-content-between">
                        {`Daily Work Log (${new Date(form.date).toLocaleDateString()})`}
                        {form.feedback 
                            ? <span className="status-indicator graded-status">Graded</span> 
                            : <span className="status-indicator not-graded-status">Not Graded</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
```

### `FormDetailView.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const FormDetailView = ({ formId, user, onBack }) => {
    const [form, setForm] = useState(null);

    useEffect(() => {
        const fetchForm = async () => {
            const res = await api.get(`/forms/${formId}`);
            setForm(res.data);
        };
        fetchForm();
    }, [formId]);

    const handleSaveFeedback = async (feedbackData) => {
        await api.put(`/forms/${form._id}/feedback`, feedbackData);
        // ... refresh form data
    };

    if (!form) return <div>Loading...</div>;

    return (
        <div>
            <button onClick={onBack}>Back</button>
            <h3>{`${form.userFullName} Daily Work Log (${new Date(form.date).toLocaleDateString()})`}</h3>
            {/* ... Render all Q&A pairs from form.formData ... */}

            {/* 
                Conditionally render the InstructorFeedback component.
                - If master user, it's editable.
                - If normal user and form.feedback exists, it's read-only.
            */}
        </div>
    );
};
```