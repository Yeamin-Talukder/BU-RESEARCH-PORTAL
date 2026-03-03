# BU Research Portal - Server

The backend service for the Barishal University Research Portal, a comprehensive manuscript submission and peer-review management system.

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt
- **Mailing**: Nodemailer
- **File Handling**: Multer
- **Development**: Nodemon

## 🛠️ Features

- **Authentication System**: Secure registration, email verification, and password reset.
- **Role-Based Access Control**: Support for Authors, Reviewers, Associated Editors, Editor-in-Chiefs, Admins, and Super Admins.
- **Manuscript Management**: Submission, tracking, and versioning.
- **Peer Review Workflow**: Reviewer assignment, recommendation, and editorial decision making.
- **Archive System**: Management of Volumes and Issues.
- **Notification System**: In-app and email notifications.
- **Seeding System**: Built-in scripts for initializing users, departments, and journals.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- SMTP credentials (for email notifications)

## ⚙️ Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/research
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   ```

3. **Running the Server**:
   ```bash
   npm start
   ```
   The server will be available at `http://localhost:3001`.

## 🗄️ Database Seeding

The server includes several seeding scripts to initialize the system:

- `index.js`: Automatically seeds the Super Admin, a default Publisher, a default Journal, and Departments on startup.
- `seed_demo_users.js`: Seeds sample users with various roles.
- `seed-demo-papers.js`: Seeds sample manuscripts.
- `seed-archive.js`: Seeds initial volumes and issues.

To run a specific seed script:
```bash
node seed_demo_users.js
```

## 🛣️ API Endpoints Summary

### Authentication
- `POST /register`: New user registration.
- `POST /verify-email`: Verify email with 6-digit code.
- `POST /login`: User login and token generation.
- `POST /auth/forgot-password`: Request password reset code.
- `POST /auth/reset-password`: Reset password with code.

### User Management
- `GET /users`: Fetch all users (Admin/Editor).
- `GET /users/:id`: Fetch detailed user profile.

### Manuscripts & Archive
- `GET /volumes`: Get all volumes.
- `POST /volumes`: Create a new volume (Admin).
- `GET /volumes/:id/issues`: Get issues for a volume.
- `POST /issues`: Create a new issue.
- `PUT /issues/:id/publish`: Mark an issue as published.
- `GET /issues/:id/papers`: Get published papers in an issue.
- `PUT /papers/:id/assign-issue`: Assign paper to an issue.

### Notifications
- `GET /notifications/:userId`: Fetch notifications for a user.
- `GET /notifications/unread-count`: Get unread count.
- `PUT /notifications/mark-read`: Mark specified notifications as read.
- `PUT /notifications/read-all`: Mark all notifications as read for a user.

## 📁 Directory Structure

- `index.js`: Main application entry point and API definitions.
- `uploads/`: directory for storing profile pictures and manuscript files.
- `seed*.js`: Various database seeding utilities.
- `.env`: Environment variables (do not commit).
