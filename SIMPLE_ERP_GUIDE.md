# 📖 Shyvora ERP: Easy Guide for the Founder

> **Note for You:**  
> It is 100% normal to feel overwhelmed! An ERP is a very large system.  
> You do **not** need to learn all of it today. Take it **one page at a time**.

---

## 🧭 The Big Picture: Only 4 Buckets!

Do not think of your ERP as 50 separate features. Think of it as **4 simple boxes**:

| Box | What it is | Key Pages |
| :--- | :--- | :--- |
| **1. The Students** | The people who study here | Students List, Student Profile, Student Dashboard |
| **2. The Teaching** | What happens in classrooms | Courses, Daily Attendance, Exams, AI Early Warning |
| **3. Campus Facilities** | Money and physical things | Fee Cashier, Hostel, Bus (Transport), Library, Items (Inventory) |
| **4. Settings & Safety** | Control room and protection | Login accounts, Roles/Permissions, Audit Logs, Safety & Grievances |

---

## 📚 Technical Dictionary (Simple Words)

Here are the technical words used in your software, explained in very simple English:

| Technical Word | Simple Meaning | Real-Life Example |
| :--- | :--- | :--- |
| **Frontend** | What you see on the screen (buttons, forms, colors). | The website page open in your browser (`localhost:5173`). |
| **Backend** | The engine working behind the screen that handles data and logic. | The Node.js server running in the background (`localhost:5000`). |
| **Database (MongoDB)** | The digital notebook where all information is permanently saved. | Where student names, phone numbers, and marks are stored. |
| **API** | A messenger that carries questions from the screen to the database and brings back answers. | When you click "Save Student", the API carries the form data to the backend. |
| **JWT / Token** | A digital entry pass (wristband) given after you type your password. | Your browser remembers this token so you don't have to type your password on every click. |
| **RBAC (Role Based Access)** | Giving different keys to different people. | An Admin can see everything; a Student can only see their own attendance and fees. |
| **Audit Log / Trail** | A diary that records who did what and at what time. | "Admin John changed student fee from ₹50,000 to ₹40,000 on Oct 24 at 2:15 PM." |
| **Early Warning / Risk Score** | An automatic calculation (0 to 100%) that tells you if a student is about to fail or drop out. | If attendance is low and fees are unpaid, the risk score goes high (Red). |
| **Concession** | A discount or scholarship on tuition fees. | Giving ₹5,000 discount to a poor or merit student. |
| **APAAR ID** | A 12-digit Indian government ID for every student (like Aadhaar, but for education). | Stored safely to track student credits on DigiLocker. |
| **Biometric** | Marking attendance using fingerprint or face scanner. | A device at the college gate that punches time. |

---

## 🗺️ Page-by-Page Breakdown

### Box 1: Students & Accounts

#### 1. Students Directory (`/admin/students`)
* **What it does:** Shows a list of all students enrolled in the college.
* **What you can do:**
  * Add a new student one by one.
  * Upload a CSV file to add 100+ students at once.
  * Search a student by name, roll number, or APAAR ID.
  * Click on a student to see their full profile, contact info, and parent details.
* **What it cannot do:** It does not mark attendance or collect fees (those have their own pages).

#### 2. Student Dashboard (`/erp/dashboard`)
* **What it does:** The private student portal that students see when they log in.
* **What you can do:**
  * See your own attendance percentage.
  * See your fee balance and pay online.
  * Download study notes and view homework assignments.
  * Check your DigiLocker Academic Bank of Credits (ABC).
* **What it cannot do:** Students cannot edit their marks or change other students' data.

---

### Box 2: Academics & Learning

#### 3. AI Early Warning Engine (`/admin/early-warning`)
* **What it does:** Detects students who are in danger of failing, dropping out, or getting debarred from exams.
* **What you can do:**
  * See high-risk students in red badges.
  * Click **"Diagnose"** to see exactly *why* they are at risk (low attendance, failing marks, or unpaid fee).
  * Click **"Take Action"** to send an automatic WhatsApp warning message to their parent.
* **What it cannot do:** It does not automatically expel students; it only warns teachers and principals early so they can help.

#### 4. Daily Attendance (`/admin/erp-attendance`)
* **What it does:** Tracks student attendance for every class and section.
* **What you can do:**
  * Mark Present, Absent, or Late.
  * See students whose attendance is below 75% (the minimum needed to sit in exams).
* **What it cannot do:** It does not track teacher salaries (that is in Staff & Payroll).

#### 5. Courses & Programs (`/admin/courses`)
* **What it does:** Sets up the college degrees, classes, and subjects.
* **What you can do:**
  * Create Programs (e.g., B.Tech, BCA, Class 8th).
  * Add semesters, sections (Section A, B), and subjects (Mathematics, Java, Physics).
* **What it cannot do:** It does not assign teachers to classes (done in Timetable).

---

### Box 3: Campus Operations & Money

#### 6. Fee & Cashier Terminal (`/admin/fee-portal`)
* **What it does:** Collects college fees and gives receipts.
* **What you can do:**
  * Search a student and see how much fee they owe.
  * Collect payment (Cash, UPI, Card, Net Banking).
  * Print or download digital PDF receipts.
  * Give fee concessions (discounts) with approval.
* **What it cannot do:** It does not pay money to suppliers (that is Treasury).

#### 7. Hostel Management (`/admin/hostel`)
* **What it does:** Manages campus hostel buildings, rooms, and student beds.
* **What you can do:**
  * Add hostels (Boys Hostel, Girls Hostel).
  * Assign a student to a room and bed.
  * Track occupied beds vs. empty beds.

#### 8. Transport & Fleet (`/admin/transport`)
* **What it does:** Manages college buses, routes, and drivers.
* **What you can do:**
  * Add bus routes (Route 1: City Center to Campus).
  * Assign students to buses.
  * Track vehicle details and driver phone numbers.

#### 9. Library Management (`/admin/librarian-portal`)
* **What it does:** Digital book catalogue for the campus library.
* **What you can do:**
  * Search books by title, author, or ISBN barcode.
  * Issue a book to a student or teacher.
  * Track return due dates and late fines.

---

### Box 4: Administration, People & Safety

#### 10. Staff & Payroll (`/admin/staff`)
* **What it does:** Records all college employees (teachers, lab assistants, drivers, clerks).
* **What you can do:**
  * Store employee job titles, salaries, joining dates, and departments.
  * Track staff attendance.
* **What it cannot do:** It does not automatically transfer money to bank accounts (you export the salary sheet).

#### 11. Role Permissions / RBAC (`/admin/roles`)
* **What it does:** Controls who is allowed to click what in the software.
* **What you can do:**
  * Give a Cashier permission to ONLY see Fees.
  * Give a Teacher permission to ONLY mark Attendance and Marks.
  * Keep the Admin with full permissions.

#### 12. Security & SOC Console (`/admin/soc-security`)
* **What it does:** Security guard for the software.
* **What you can do:**
  * See if someone tried to guess passwords (wrong password attempts).
  * See who is logged in right now and from what device.
  * Kill a session if a computer was left logged in.

---

## 🗓️ Your 7-Day Relaxed Learning Plan

Do **not** try to learn everything at once. Spend only **15–20 minutes each day**:

- **Day 1:** Open `/admin/students`. Click on one student. See their profile. Add one fake student to see how easy it is.
- **Day 2:** Open `/admin/erp-attendance`. Mark attendance for one class.
- **Day 3:** Open `/admin/fee-portal`. Search that student. Collect ₹1,000 fake fee and print the receipt.
- **Day 4:** Open `/erp/dashboard`. Log in as a student to see what the student sees.
- **Day 5:** Open `/admin/early-warning`. Click "Diagnose" on Rohan Verma. See the AI explanation and click "Take Action" (WhatsApp).
- **Day 6:** Open `/admin/hostel` and `/admin/transport`. Look at room and bus routes.
- **Day 7:** Open `/admin/roles` to see how simple permission checkboxes work.

---
*Created for Digvijay Pundir — Shyvora Technologies*
