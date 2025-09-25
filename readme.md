# Grade Form App

This is a web application for students to submit daily work logs and for an instructor (master account) to provide grades and feedback.

## Features

*   User registration and login.
*   Password recovery and change password functionality.
*   A "Daily Work & Project Log" form for users to submit.
*   Separate dashboard views for regular users and a master account.
*   A complete grading and feedback loop with status indicators.

---

## How it Works

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

## Technical Details

*   The application is a single-page application built using **React** and **Bootstrap**.
*   All data (users and forms) is stored in the browser's **Local Storage** for persistence across sessions. This means no backend server or database is required to run this application as-is.
*   The UI is designed with a modern, dark theme.

### Form Content

The "Daily Work & Project Log" includes the following sections:

*   **1. Daily Goals & Progress**
*   **2. Reflection & Next Steps**
*   **3. Productivity & Self-Assessment**

The "Instructor Feedback & Grading" form includes:

*   A 3-2-1 scoring system.
*   Fields for a score, bonus points, and comments.
