# Dev Bhoomi Site - Backend

This is the backend REST API for the Dev Bhoomi Site. Built with Node.js, Express, and MongoDB, it serves as the core engine powering the public website, the Content Management System (CMS), and the Enterprise Resource Planning (ERP) portal.

## ✨ Features

- **RESTful API Architecture:** Clean, modular, and well-structured API endpoints.
- **ERP API Capabilities:** Dedicated controllers and models for Student management, Attendance tracking, Assignments, Classes, and Study Materials.
- **CMS API Capabilities:** Complete CRUD logic for managing dynamic website content such as Notices, Testimonials, Media files, Affiliations, and global Settings.
- **Database:** MongoDB integration using Mongoose for schema validation, relationships, and data modeling.
- **Authentication & Authorization:** Secure authentication using JSON Web Tokens (JWT) and `bcryptjs`. Includes role-based access control (Admin, Faculty, Student) for CMS and ERP endpoints.
- **File Uploads & Management:** Handles multipart/form-data via `multer` and integrates deeply with `imagekit` for optimized cloud storage.
- **Robust Security:**
  - `helmet`: Secures HTTP headers.
  - `cors`: Cross-Origin Resource Sharing for secure frontend access.
  - `express-rate-limit`: Basic rate-limiting against brute-force attacks.
  - `express-mongo-sanitize`: Prevents NoSQL Operator Injection.
  - `xss-clean`: Sanitizes user input against XSS.

## 🏢 ERP & CMS Database Architecture

The backend provides distinct models and controllers to handle the dual nature of the application:

### ERP Data Flow
- **Models:** `Student.js`, `CourseClass.js`, `Assignment.js`, `StudyMaterial.js`.
- **Controllers:** `studentController.js`, `attendanceController.js`, `classController.js`, `assignmentController.js`.
- **Functionality:** Handles complex relations like linking students to classes, tracking daily attendance records, managing assignment submissions, and internal notifications.

### CMS Data Flow
- **Models:** `Notice.js`, `Testimonial.js`, `Affiliation.js`, `Media.js`, `Setting.js`, `User.js`.
- **Controllers:** `noticeController.js`, `mediaController.js`, `testimonialController.js`, `userController.js`.
- **Functionality:** Provides endpoints for the admin dashboard to upload media directly to ImageKit, publish notices, approve testimonials, and manage user roles.

## 🛠️ Technologies Used

- [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
- [JSON Web Tokens (JWT)](https://jwt.io/) & [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [ImageKit](https://imagekit.io/) & [Multer](https://www.npmjs.com/package/multer)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the root of the `backend` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   
   # ImageKit config for CMS media uploads
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=your_url_endpoint
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## 📁 Directory Structure

```
backend/
├── controllers/     # Route handlers for ERP and CMS logic
├── models/          # Mongoose schemas (Student, Notice, User, etc.)
├── routes/          # API route definitions
├── middleware/      # Auth & error handling middlewares
├── config/          # DB connection & integrations
├── utils/           # Utility functions (token generation, etc.)
├── server.js        # Main Express application entry
└── package.json     # Dependencies
```
