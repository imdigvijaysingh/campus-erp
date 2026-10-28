# ERP Software Documentation

Welcome to the ERP Software documentation. This document outlines the core features of the system and provides a comprehensive list of all the exact REST API endpoints available for each module.

## 🚀 Features Overview

This ERP system is designed to handle multiple facets of institutional management, including user access control, academic operations, staff/HR management, inventory tracking, and student communication.

### 1. User Authentication & Role Management
- Secure login and registration with JWT-based authentication.
- Custom role-based access control (RBAC) allowing dynamic assignment of permissions.
- Dedicated user management to oversee system administrators, staff, and students.

### 2. Student Management
- Comprehensive student profiles (signup, single add, and bulk import capabilities).
- Dedicated student portals (login, view profile, edit details).
- Integration with academic modules for tracking attendance and resources.

### 3. Staff & HR Management (Payroll & Attendance)
- Staff profiles and credential management.
- Leave management system (request, approve, reject).
- Daily staff attendance tracking.
- Payroll generation and management for institutional staff.

### 4. Academic Operations
- **Assignments:** Create, distribute, and manage student assignments.
- **Study Materials:** Upload and share educational resources with students.
- **Attendance:** Track and update student attendance (with bulk update support).

### 5. Inventory Management
- Keep track of physical inventory items.
- Manage issuance of items to staff or departments and track their return/status.

### 6. Notifications & Helpdesk (Tickets)
- System-wide or targeted notifications.
- Ticket-based support system for resolving issues reported by users.

### 7. Media Management
- Centralized media handling for uploading images, documents, and other files.
- Bulk media deletion capabilities.

---

## 📡 REST API Endpoints

### Auth & Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Authenticate a user and get token
- `GET /api/v1/auth/me` - Get current logged-in user details
- `PUT /api/v1/auth/updatedetails` - Update user credentials/password
- `GET /api/v1/auth/users/count` - Get the total count of registered users

### Users Management (`/api/v1/users`)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get single user by ID
- `POST /api/v1/users` - Create a new user (admin)
- `PUT /api/v1/users/:id` - Update an existing user
- `DELETE /api/v1/users/:id` - Delete a user

### Roles & Permissions (`/api/v1/roles`)
- `GET /api/v1/roles` - Get all roles
- `GET /api/v1/roles/:id` - Get specific role details
- `POST /api/v1/roles` - Create a new custom role
- `PUT /api/v1/roles/:id` - Update role permissions
- `DELETE /api/v1/roles/:id` - Delete a role

### Student Management (`/api/students`)
- `GET /api/students` - Get all students
- `POST /api/students/signup` - Student self-registration
- `POST /api/students` - Add a new student manually
- `POST /api/students/bulk` - Bulk import students
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Delete a student profile
- `POST /api/students/login` - Student portal login
- `GET /api/students/me` - Get logged-in student profile
- `PUT /api/students/me` - Update logged-in student details

### Staff & HR (`/api/v1/staff`)
- `GET /api/v1/staff` - Get all staff members
- `POST /api/v1/staff` - Add a new staff member
- `PUT /api/v1/staff/:id` - Update staff member details
- `DELETE /api/v1/staff/:id` - Delete a staff member

**Staff Leaves**
- `GET /api/v1/staff/leaves` - Get all leave applications
- `POST /api/v1/staff/leaves` - Apply for leave
- `PUT /api/v1/staff/leaves/:id` - Update leave status (approve/reject)
- `DELETE /api/v1/staff/leaves/:id` - Delete a leave request

**Staff Attendance**
- `GET /api/v1/staff/attendance?date=YYYY-MM-DD` - Get staff attendance for a specific date
- `POST /api/v1/staff/attendance` - Submit/update staff attendance

**Staff Payroll**
- `GET /api/v1/staff/payroll?month=M&year=YYYY` - Get payroll records for a given month
- `POST /api/v1/staff/payroll/generate` - Generate payroll for staff
- `PUT /api/v1/staff/payroll/:id` - Update a specific payroll record

### Student Attendance (`/api/v1/attendance`)
- `GET /api/v1/attendance/students` - Fetch student attendance records
- `PUT /api/v1/attendance/bulk` - Bulk update attendance for a class

### Assignments (`/api/v1/assignments`)
- `GET /api/v1/assignments` - Get all assignments
- `GET /api/v1/assignments/my` - Get assignments specific to the logged-in user
- `POST /api/v1/assignments` - Create a new assignment
- `DELETE /api/v1/assignments/:id` - Delete an assignment

### Study Materials (`/api/v1/study-materials`)
- `GET /api/v1/study-materials` - Get all study materials
- `GET /api/v1/study-materials/my` - Get study materials specific to logged-in user
- `POST /api/v1/study-materials` - Upload new study material
- `DELETE /api/v1/study-materials/:id` - Delete study material

### Inventory (`/api/v1/inventory`)
- `GET /api/v1/inventory/items` - View all inventory items
- `POST /api/v1/inventory/items` - Add new inventory item
- `PUT /api/v1/inventory/items/:id` - Update inventory item
- `DELETE /api/v1/inventory/items/:id` - Delete inventory item
- `GET /api/v1/inventory/issuance` - View all issued items
- `POST /api/v1/inventory/issuance` - Issue an item to a user/department
- `PUT /api/v1/inventory/issuance/:id` - Update issuance record (e.g., mark returned)

### Notifications (`/api/v1/notifications`)
- `GET /api/v1/notifications` - Get all global notifications
- `GET /api/v1/notifications/my` - Get notifications for the logged-in user
- `POST /api/v1/notifications` - Create and send a new notification
- `DELETE /api/v1/notifications/:id` - Delete a notification

### Support Tickets (`/api/v1/tickets`)
- `GET /api/v1/tickets` - View all support tickets
- `GET /api/v1/tickets/my` - View tickets created by logged-in user
- `POST /api/v1/tickets` - Create a new support ticket
- `PUT /api/v1/tickets/:id` - Update ticket status

### Media Management (`/api/v1/media`)
- `GET /api/v1/media` - Get all uploaded media files
- `POST /api/v1/media/upload` - Upload a new media file
- `PUT /api/v1/media/:id` - Update media file metadata
- `DELETE /api/v1/media/:id` - Delete a media file
- `POST /api/v1/media/delete-bulk` - Bulk delete media files

### Activities (`/api/v1/activities`)
- `GET /api/v1/activities` - Get recent system activities/logs

### AI Early-Warning Risk Engine (`/api/v1/early-warning`)
Autonomous Student Attrition, Debarment & Dropout Risk Engine evaluating 4 real-time vectors: Attendance (35%), Academic performance (30%), Financial dues (20%), and Engagement/Discipline (15%).
- `GET /api/v1/early-warning/summary` - Aggregate executive risk metrics, KPI counts (Critical, Watchlist, On-Track), detention alerts (< 75% attendance), and cohort distribution.
- `GET /api/v1/early-warning/students` - Paginated and filtered student risk roster with composite scores, risk tiers (`HIGH`, `MODERATE`, `LOW`), detention gates, and primary drivers. Query params: `tier`, `department`, `search`, `page`, `limit`.
- `GET /api/v1/early-warning/students/:studentId/diagnose` - Explainable AI diagnostic report for an individual student, breaking down composite risk gauge, vector sub-scores, primary root causes, and prescriptive recommendations.
- `POST /api/v1/early-warning/interventions` - Dispatch and log prescriptive intervention (WhatsApp parent notification, remedial coaching, fee installment restructuring, mentor counseling).
- `PATCH /api/v1/early-warning/interventions/:id/status` - Update status of an ongoing intervention (`IN_PROGRESS`, `RESOLVED`, `ESCALATED`).
- `POST /api/v1/early-warning/recalculate` - Trigger real-time campus-wide recalculation of risk scores across all student cohorts.

