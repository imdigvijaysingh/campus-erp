# 🎓 Shyvora ERP - Modern Institutional Management & Resilience Platform

A modern, full-stack Enterprise Resource Planning (ERP), campus management software, and early-warning institutional outcome engine built for schools, colleges, and higher education universities. Powered by the **MERN Stack** (MongoDB, Express.js 5, React 19, Node.js), Shyvora ERP simplifies everyday campus operations—from student admissions and attendance to staff payroll, fee collection, hostel, transport, and statutory regulatory compliance.

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://react.dev/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![Node](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-orange.svg)](LICENSE)
[![Compliance](https://img.shields.io/badge/Compliance-DPDP_2023_%7C_CERT--In_%7C_NCrF_%7C_UGC_2026-blueviolet.svg)](#-statutory-compliance--regulatory-frameworks)

---

## 🔑 Default Sign-in Credentials

You can sign in using **either your username OR your email address**:

| Role | Username / Email | Password | What They Can Do |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | `superadmin` or `admin@Shyvora.in` | `SuperAdmin@123` | Full access across all institutions, security consoles, system settings, and audit logs |
| **Institution Admin** | `instadmin` or `admin@globaluni.com` | `SuperAdmin@123` | Full access to manage their specific college or school campus operations |

---

## ✨ Key Features & Institutional Capabilities

### 1. 🧠 AI Early-Warning Risk Engine (The Outcome Engine)
* **Outcome-First Architecture:** Unlike legacy ERPs that merely record attendance after the fact, Shyvora acts as an **Outcome Engine** that actively warns school principals, deans, and teachers *before* students fail, drop out, or get debarred.
* **Deterministic 4-Vector Risk Scoring:** Computes a composite student risk index ($0 - 100$) in real time:
  * 📉 **Attendance Deficit (35%):** Predicts students approaching or below the UGC / CBSE statutory 75% exam debarment threshold.
  * 📚 **Academic Backlog (30%):** Detects internal exam failures (< 40–50% passing mark) and grade slides.
  * 💰 **Financial Default (20%):** Flags tuition fee defaults (> 50% overdue) that trigger administrative dropouts.
  * ⚡ **Disengagement (15%):** Identifies missing assignments, lack of portal activity, and counseling flags.
* **Explainable AI Diagnostics:** 1-click student diagnostic modal displaying exact root-cause drivers and dynamic 30-day risk trends.
* **Prescriptive Interventions:** Pre-filled multi-channel action workflows (WhatsApp parent notices, remedial coaching enrollment, mentor counseling, fee installment restructuring).
* **Cohort & Department Heatmaps:** Instant campus-wide distribution and department comparison matrices (`/admin/early-warning`).

### 2. 🔐 Flexible Universal Authentication & RBAC
* **Universal Sign-In:** Sign in seamlessly using either your **username** or **email address**.
* **Role-Based Access Control (RBAC):** Granular, dynamic permissions for SuperAdmins, Admins, Teachers, Cashiers, Wardens, Transport Managers, Librarians, and Students.
* **Session Security:** Multi-device active session registry, 1-click remote session revocation, and automated session expiry modals (`/admin/sessions`).

### 3. 👨‍🎓 Student Management & Student Portal
* **Student Directory:** Centralized student roster with department, batch, enrollment date, and contact details (`/admin/students`).
* **Bulk Data Import:** Add students one-by-one or import hundreds instantly via bulk CSV upload.
* **Dedicated Student Portal (`/erp/dashboard`):** Student self-service workspace to monitor attendance, view assignments, download study materials, access past question papers, and view fees.
* **DigiLocker Academic Bank of Credits (ABC) Sync:** 1-click live synchronization with the national Academic Bank of Credits ledger directly from the student dashboard and admin manager.

### 4. 🎓 National Credit Framework (NCrF) & Curriculum Engine
* **Modular Academic Hierarchy:** Structured according to statutory Indian and international frameworks: `Department → Programme → Branch → Session → Year → Semester → Section → Credits & Course Outcomes (COs)`.
* **Framework Levels:** Conforms to statutory NCrF Levels (Level 4.5 through Level 8.0) across 3-year and 4-year undergraduate honours and postgraduate research tracks (`/admin/courses`).
* **Subjects & Credit Distribution:** Automatic calculation of Lecture, Tutorial, and Practical (L-T-P) hours with NEP course categories (`Major`, `Minor`, `Multidisciplinary`, `AEC`, `SEC`, `VAC`) (`/admin/subjects`).

### 5. 🛡️ APAAR ID Tokenization & CERT-In Forensic Security
* **12-Digit APAAR Tokenization:** Student Automated Permanent Academic Account Registry (APAAR) identifiers are stored encrypted and masked in the UI (`•••• •••• 1234`).
* **Forensic Decryption with Audit Trail:** Decrypting unmasked APAAR IDs requires administrative authorization and writes an immutable **HIGH-risk security alert event** to the forensic audit log.
* **Forensic Audit Log Center (`/admin/audit-logs`):** Immutable, tamper-evident audit trail aligned with CERT-In 6-hour incident reporting requirements.

### 6. 👶 DPDP Section 9 Child Safety Gate (< 18)
* **Automatic Age Detection:** Instant calculation from Date of Birth during public student enrollment (`/erp/signup`).
* **Statutory Minor Protection:** Applicants under 18 automatically activate Child Safety Mode, enforcing verifiable Parent/Guardian details, relation, contact, and statutory consent before academic profile processing.

### 7. ⚖️ DPDP Compliance & Privacy Rights Portal
* **Zero-Login Public Rights Portal (`/privacy`):** Public access for students, parents, and alumni to submit Data Subject Access Requests (SAR) and Data Erasure requests ("Right to be Forgotten").
* **Admin Privacy Center (`/admin/privacy`):** Data Protection Officer (DPO) triage queue, statutory data classification register, and consent repository.

### 8. 🚨 Campus Safety, Anti-Ragging & POSH Redressal
* **Zero-Login Public Safety Portal (`/safety`):** Public grievance submission with confidential and anonymous filing options.
* **24/7 Statutory Helplines:** Integrated UGC Anti-Ragging Helpline (`1800-180-5522`), POSH Act / Internal Complaints Committee (ICC), Equal Opportunity Cell, and Emergency SOS.
* **Admin Safety Center (`/admin/safety`):** Incident investigation, regulatory dispatch, and emergency contact registry.

### 9. 🔒 SOC SIEM & Threat Monitoring Console
* **SOC Threat Monitor (`/admin/soc-security`):** Real-time monitoring of authentication anomalies, brute-force trips, and 401/403 spikes.
* **Active Device Sessions Manager (`/admin/sessions`):** Real-time concurrent device tracker with 1-click remote session termination.

### 10. 👥 Staff & Human Resources (HR) Management
* **Employee Directory:** Maintain comprehensive staff profiles for teachers, administrators, and campus personnel (`/admin/staff`).
* **Staff Attendance:** Daily punch-in/out records for staff members with date filtering.
* **Leave Management:** Staff leave applications with administrative approval/rejection workflows and audit trails.
* **Automated Monthly Payroll:** Automatic calculation of basic pay, allowances (HRA, DA), statutory deductions (EPF), and payslip generation.

### 11. 💳 Digital Campus Finance, Fee Ledger & Invoicing
* **Executive Finance Dashboard (`/admin/fee-portal`):** Real-time visibility into Total Revenue Collected, Expected Receivables, Outstanding Dues, and Collection Efficiency Rate with live KPIs.
* **Itemized Fee Heads:** Record payments categorized by academic particulars (Tuition Fee, Examination Fee, Hostel & Mess, Transportation, Lab & Library, Annual Development).
* **Scholarship & Concession Adjustments:** Pre-configured and custom scholarship waivers (Merit Academic Scholarship, Sports Quota, Staff Ward Subsidy, EWS) with automated reconciliation.
* **Printable Institutional Receipts:** High-fidelity print-ready formal receipts (`REC-YYYY-XXXXX`) formatted with college header banner, verification QR code badge, amount in words, payment method, transaction UTR, and authorized controller seal.
* **Student Self-Serve Online Checkout:** Students can log in to `/erp/dashboard`, inspect remaining balances, simulate or complete online checkout via Razorpay (UPI, QR, Cards, Net Banking), and download audit-ready receipts.

### 12. 🏦 Campus Treasury, Bank Accounts & Payroll Control (`/admin/treasury`)
* **Multi-Bank Liquid Reserve Tracking:** Live tracking of institutional liquid reserves across 3 designated campus bank accounts (HDFC Operations & Payroll, SBI Student Fee Escrow, ICICI Infrastructure & Grants) totaling **₹67.8 Lakhs**.
* **Pending Student Receivables Aging:** Real-time visibility into **₹3.8 Lakhs** outstanding student fees with 3-tier aging buckets (<30 Days, 30–60 Days, >60 Days), course-wise recovery percentages, and 1-click automated SMS/Email payment reminders.
* **Departmental Faculty & Staff Salary Structures:** Detailed pay scale breakdowns across campus departments totaling a **₹24.8 Lakhs / mo** payroll obligation (Basic 50%, HRA 20%, DA 18%, EPF 12%).
* **Payroll Clearance Liabilities:** Itemized roster of staff awaiting monthly payout (**₹6.6 Lakhs** pending), showing employee IDs, designated bank accounts, and 1-click batch corporate NEFT disbursement simulation.

### 13. 🏆 Examination Engine, UGC Letter Grades & Admit Cards
* **Exam Timetable Scheduler:** Publish examination schedules with subject codes, exam dates, room numbers, and Bloom's taxonomy Course Outcomes (COs) (`/admin/exam-controller`).
* **Hall Ticket Eligibility Gate (75% Attendance):** Automated statutory gate enforcing mandatory 75% class attendance before issuing official exam admit cards.
* **High-Fidelity Printable Hall Tickets:** Formal A4 printable admit card (`HT-YYYY-XXXXX`) with college crest, candidate photo, timetable matrix, venue details, barcode/QR verification badge, and student signature slip.
* **UGC 10-Point Letter Grade Transcripts:** Automatic conversion of raw marks to UGC standard letter grades (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`), computing SGPA and cumulative credits.
* **Outcome-Based Education (OBE) Matrix:** Calculates course outcome attainment percentages for NBA/NAAC accreditation compliance.

### 14. 📚 Previous Year Question Papers & Sample Papers Archive (PYQ Bank)
* **Categorized Exam Repository:** Built-in repository for past university/board examination question papers and model sample papers with step-by-step solutions.
* **Dual Stream Hierarchy:**
  * **College Tier:** Segmented by Course (B.Tech, BCA, BBA, B.Com, MBA) and Semester (1st through 8th Sem).
  * **School Tier:** Segmented by Class (6th to 12th) and Stream (Science, Commerce, Arts).
* **Exam Types:** Filter by *Previous Year Exam Paper*, *Sample / Model Paper*, *Pre-Board Paper*, or *Mid-Term Paper*.
* **Integrated In-App PDF Reader:** High-resolution modal preview with document downloading, watermarking, and answer solution view.
* **Student Dashboard Integration:** Directly available to enrolled students in `/erp/dashboard` under the *Old & Sample Papers* workspace.

### 15. 💡 Friendly Admin Experience, Universal "i" Info Popovers & Interactive Playbooks
* **Universal "i" Information Popovers:** Every metric card, alert, and form field features an accessible circular "i" button. Hovering or clicking reveals a friendly, plain-English explanation of what that feature does and a practical tip.
* **Spacious Glassmorphic Design:** Card padding, frosted glass backgrounds (`backdrop-blur-md`), and clear typography with zero confusing jargon.
* **Interactive Step-by-Step Playbooks (`/admin/help`):** Interactive walkthroughs for core administrative tasks (Add a Student, Mark Daily Attendance, Collect Fees & Print Receipts, Issue Hall Tickets, Broadcast Notices, Handle Safety Grievances) with clickable step dots (1, 2, 3, 4) and 1-click shortcut links.
* **Interactive FAQ Accordion:** Plain-English answers to questions most frequently asked by school principals, cashiers, and teachers.

### 16. ⚡ Universal Command Palette & Global Search (`Ctrl + K`)
* **Keyboard-First Omnisearch:** Accessible instantly by pressing `Ctrl + K` (or `Cmd + K` on macOS), or by clicking the top search bar in the navigation header.
* **Instant Navigation Across 25+ ERP Modules:** Eliminates multi-level menu hunting. Type keywords like `"fees"`, `"attendance"`, `"exam"`, `"dpdp"`, `"audit"`, or `"students"` to immediately jump to the desired portal.
* **Full Keyboard Operability:** Navigate results using arrow keys (`↑`, `↓`), hit `Enter` to jump, and `Esc` to dismiss.

### 17. 🏛️ Department Portals
* **Admission Portal (`/admin/admission-portal`):** Manage new student applications, verify uploaded documents, and admit candidates.
* **Teacher Attendance Portal (`/admin/teacher-portal`):** A simplified, mobile-friendly workspace tailored for instructors to take daily roll calls.
* **Librarian Portal (`/admin/librarian-portal`):** Catalog library books, issue/return books, track overdue books, and manage library inventory.

### 18. 🏢 Campus Facilities Management
* **Inventory & Asset Management (`/admin/inventory`):** Track campus physical assets (computers, lab equipment, furniture) and item issuance/return records.
* **Hostel Management (`/admin/hostel`):** Manage hostel blocks, rooms, bed capacity, and student resident room allocations.
* **Transport Management (`/admin/transport`):** Manage bus fleets, travel routes, stops, assigned drivers, student bus passes, and route fees.

### 19. 📢 Communication & Support
* **Announcements & Notifications (`/admin/erp-notifications`):** Broadcast campus-wide notices to students, teachers, or specific cohorts.
* **Help Desk (Ticket Support) (`/admin/helpdesk`):** Centralized support ticket queue to submit, triage, and resolve technical, academic, and administrative queries.

### 20. 🛡️ Enterprise Cyber-Resilience & SRE Architecture
* **Fail-Secure Process Handlers:** Graceful exception traps on `SIGTERM`, `SIGINT`, and `uncaughtException` ensuring dirty in-flight database transactions are terminated safely without data corruption.
* **Distributed Request Tracing (`X-Trace-Id`):** Ingress header correlation tracing every incoming request across gateway, Express controllers, and MongoDB operations.
* **Context Call Budget & Deadline Guard:** Strict 3500ms handler execution budget (`apiTimeoutGuard`) preventing lingering requests from consuming worker threads.
* **Split-Brain Quorum & Minority Partition Lock:** Enforces Consistency over Availability ($C > A$) by locking state mutations into read-only mode during network partitions or degraded DB quorum (`enforceQuorumGuard`).
* **Memory Cushion & Load-Shedding Circuit Breaker (OOM Armor):** Automatically sheds non-critical load with HTTP 503 and `Retry-After: 5` when V8 heap exceeds 85%, retaining an emergency memory buffer for safe transaction commits.
* **Client-Side Exponential Backoff with Full Jitter:** Frontend Axios interceptor automatically recovers from transient server hiccups (429, 502, 503, 504) using randomized exponential backoff:
  $$t_{\text{sleep}} = \min(3000, \; 300 \times 2^{\text{attempt}}) \times \text{random}(0, 1)$$
* **Automated Keep-Alive Ping Service:** Built-in self-pinging background service and GitHub Actions workflow (`.github/workflows/keep-alive.yml`) to prevent cloud instances (e.g. Render PaaS) from sleeping.
* **GameDay Disaster Recovery Runbook:** Battle-tested runbook (`infra/gameday/GAMEDAY_RUNBOOK.md`) covering automated failover ($RTO \approx 0$), zero data loss ($RPO = 0$), deadlock cycle mitigation, and DDoS edge defense.

---

## 🌐 Dynamic Live Server URL Adaptation

All public and statutory compliance routes are **fully decoupled from hardcoded localhost**:
* **Automatic Host Detection:** The application automatically inspects `window.location.origin` (e.g. `https://erp.shyvora.com`, `https://campus.edu:8443`, or any staging host).
* **One-Click Shareable Links:** Both admin and public compliance portals display a live host banner with a **"Copy Public Link"** utility so administrators can copy the exact live URL for college websites, circulars, syllabi, or admission prospectuses.
* **Universal Discovery:** Public portals are directly accessible from the login screen footer (`/authentication/index`), student dashboard sidebars, and the quick command palette (`Ctrl + K`).
* **Dynamic Backend API Resolution:** `frontend/src/utils/api.js` automatically routes API calls to `VITE_API_URL` when provided, or dynamically resolves to `${window.location.origin}/api/v1` on live production servers.

---

## 🗺️ Frontend Pages & Navigation Routes

### 🚪 Public & Student Pages (Zero-Login Required for Compliance)
| Web URL | Page Name | Who Uses It | What It Does |
| :--- | :--- | :--- | :--- |
| `/authentication/index` | Unified Sign-in | All Users | Login page for admins, staff, and students with dynamic host indicator. |
| `/safety` | Public Campus Safety Portal | Public / Students / Parents | Statutory grievance filing, 24/7 UGC Helpline (`1800-180-5522`), POSH/ICC, and Emergency SOS. |
| `/privacy` | Public DPDP Rights Center | Public / Students / Parents | Submit Data Access, Correction, and Complete Erasure requests ("Right to be Forgotten"). |
| `/erp/signup` | Student Registration | New Students | Enrollment form with DPDP Section 9 Child Safety gate for minors (< 18) and APAAR linkage. |
| `/erp/dashboard` | Student Portal | Students | Student dashboard with DigiLocker Academic Bank of Credits (ABC) ledger sync, fees, PYQ papers, assignments, and notes. |

### 🛠️ Admin & Staff Dashboard (`/admin/...`)
| Web URL | Page Name | Access Needed | What It Does |
| :--- | :--- | :--- | :--- |
| `/admin/dashboard` | Dashboard Overview | All Staff / Admins | Summary view showing total users, students count, quick actions, and compliance widgets. |
| `/admin/early-warning` | AI Early-Warning Risk Engine | `students` / Staff / Admin | Student retention & dropout risk engine, 4-vector risk scores, explainable AI diagnostics, and WhatsApp intervention workflows. |
| `/admin/treasury` | Campus Treasury & Accounts | Admin / SuperAdmin | Institutional bank balances (₹67.8L), pending fee aging (₹3.8L), department salary structures, and pending payroll liabilities. |
| `/admin/courses` | Courses & Curriculum (NCrF) | `courses` | Create and organize NCrF-compliant course hierarchies, levels (4.5 to 8.0), and credit hours. |
| `/admin/subjects` | Subjects Manager | `courses` | Manage course subjects, Bloom's course outcomes (COs), L-T-P hours, and NEP paper categories. |
| `/admin/students` | Students Manager | `students` | Manage student records, decrypt APAAR IDs (audit logged), and sync ABC credits. |
| `/admin/safety` | Safety & Welfare Center | `safety` / Admin | Statutory campus safety oversight, incident investigation, and emergency dispatch. |
| `/admin/privacy` | DPDP Privacy Center | `privacy` / Admin | Data Protection Officer (DPO) queue, SAR request resolution, and consent registry. |
| `/admin/soc-security` | SOC SIEM Threat Monitor | SuperAdmin / Admin | Real-time security telemetry, failed login monitoring, and brute-force alert dashboard. |
| `/admin/sessions` | Active Sessions Manager | SuperAdmin / Admin | Multi-device active session tracker with 1-click remote kill. |
| `/admin/audit-logs` | Forensic Audit Logs | SuperAdmin / Admin | Immutable CERT-In compliant forensic audit trail with risk-level filters. |
| `/admin/teacher-portal` | Teacher Attendance | `teacher-portal` | Quick interface for instructors to mark student attendance. |
| `/admin/librarian-portal` | Library Manager | `librarian-portal` | Track books, issues, returns, and library inventory. |
| `/admin/fee-portal` | Campus Treasury & Fee Cashier | `fee-portal` | Executive revenue KPIs, instant student search, concession adjustments, and formal receipt printing. |
| `/admin/exam-controller` | Exam & OBE Controller Portal | `exam-controller` | Timetable scheduling, 75% attendance gate, QR hall tickets, UGC letter grades, and OBE attainment. |
| `/admin/admission-portal` | Admissions Portal | `admission-portal` | Review and admit new student applicants. |
| `/admin/erp-notifications`| Announcements | `erp-notifications` | Create and broadcast campus-wide notices. |
| `/admin/erp-assignments` | Assignments Manager | `erp-assignments` | Create and manage student homework and assignments. |
| `/admin/erp-study-materials` | Study Notes & Docs | `erp-study-materials` | Upload notes, PDFs, syllabus, and study resources. |
| `/admin/erp-attendance` | Student Attendance | `erp-attendance` | View and edit attendance registers for all classes. |
| `/admin/staff` | Staff & Payroll | `staff` | Manage employees, approve leaves, take staff attendance, and generate payroll. |
| `/admin/inventory` | Inventory & Assets | `inventory` | Manage physical assets and item issuance records. |
| `/admin/hostel` | Hostel Management | `hostel` | Manage hostel blocks, rooms, and resident allocations. |
| `/admin/transport` | Transport & Buses | `transport` | Manage bus routes, vehicles, drivers, and transport fees. |
| `/admin/users` | System Accounts | `users` (SuperAdmin) | Create and manage backend login accounts for staff members. |
| `/admin/roles` | Roles & Permissions | `roles` (SuperAdmin) | Define custom permission groups (e.g. Accountant, Warden, Librarian). |
| `/admin/helpdesk` | Support Tickets | `helpdesk` | View and resolve user-submitted complaints and queries. |
| `/admin/profile` | My Profile | Logged-in user | View and update your profile details and password. |
| `/admin/help` | Help & Playbooks (FAQs) | Logged-in user | Interactive step-by-step playbooks (1-2-3-4 steps) and friendly admin FAQ center. |

---

## 📡 Backend REST API Catalog

The frontend communicates with the backend via these endpoints (`http://localhost:5000` or production host):

### 1. 🔐 Authentication & Session Security (`/api/v1/auth`)
* `POST /api/v1/auth/login` - Sign in using username or email + password (rate-limited).
* `POST /api/v1/auth/register` - Create a new user account.
* `GET  /api/v1/auth/me` - Fetch details of the currently logged-in user.
* `PUT  /api/v1/auth/updatedetails` - Update your username, email, or password.
* `GET  /api/v1/auth/users/count` - Get the total number of registered users.
* `GET  /api/v1/auth/sessions` - List active device sessions for the authenticated user.
* `POST /api/v1/auth/sessions/revoke/:id` - Revoke and terminate a specific active device session.
* `POST /api/v1/auth/sessions/revoke-all` - Sign out of all other active device sessions.

### 2. 🧠 AI Early-Warning Risk Engine (`/api/v1/early-warning`)
* `GET   /api/v1/early-warning/summary` - Aggregate executive risk metrics, KPI counts (Critical, Watchlist, On-Track), detention alerts (< 75% attendance), and cohort distribution.
* `GET   /api/v1/early-warning/students` - Paginated and filtered student risk roster with composite scores, risk tiers (`HIGH`, `MODERATE`, `LOW`), detention gates, and primary drivers.
* `GET   /api/v1/early-warning/students/:id` - Explainable AI diagnostic report for an individual student, breaking down composite risk gauge, vector sub-scores, primary root causes, and prescriptive recommendations.
* `POST  /api/v1/early-warning/interventions` - Dispatch and log prescriptive intervention (WhatsApp parent notification, remedial coaching, fee installment restructuring, mentor counseling).
* `PATCH /api/v1/early-warning/interventions/:id` - Update status of an ongoing intervention (`IN_PROGRESS`, `RESOLVED`, `ESCALATED`).
* `POST  /api/v1/early-warning/recalculate` - Trigger real-time campus-wide recalculation of risk scores across all student cohorts.

### 3. 👨‍🎓 Students & APAAR / ABC Security (`/api/v1/students`)
* `GET    /api/v1/students` - Get the full list of students.
* `POST   /api/v1/students` - Add a single new student with APAAR/ABC details.
* `POST   /api/v1/students/bulk` - Upload a batch of students simultaneously via CSV.
* `POST   /api/v1/students/signup` - Public self-signup with automatic DPDP Child Safety age detection.
* `POST   /api/v1/students/login` - Student portal login.
* `GET    /api/v1/students/me` - Get current student's profile.
* `PUT    /api/v1/students/me` - Update current student's personal info.
* `PUT    /api/v1/students/:id` - Update student details by ID (Admin).
* `DELETE /api/v1/students/:id` - Remove a student record.
* `POST   /api/v1/students/:id/reveal-apaar` - **Decryption Endpoint:** Reveal unmasked APAAR ID (Audit logged under CERT-In directions).
* `POST   /api/v1/students/:id/sync-abc` - **DigiLocker ABC Sync:** Synchronize academic credit points with the Academic Bank of Credits.

### 4. 💳 Digital Campus Finance & Invoicing (`/api/v1/fees`)
* `GET  /api/v1/fees/stats` - Institutional financial metrics: Total Expected, Total Collected, Outstanding Dues, Collection Rate, and cleared student count.
* `GET  /api/v1/fees` - Query payment ledger with student, payment method, and status filters.
* `POST /api/v1/fees` - Record fee payment with line-item breakdown and scholarship adjustments (Cashier/Admin).
* `GET  /api/v1/fees/receipt/:receiptNumber` - Fetch formal printable receipt data with student details.
* `POST /api/v1/fees/simulate-online` - Student self-serve online checkout with instant receipt generation.

### 5. 🏆 Examination Engine & UGC Grades (`/api/v1/exams`)
* `GET    /api/v1/exams` - Fetch all examination schedules and timetables.
* `POST   /api/v1/exams` - Create a new semester examination schedule with slot timings and Course Outcomes.
* `GET    /api/v1/exams/:id` - Get examination timetable details and student eligibility matrix.
* `PUT    /api/v1/exams/:id` - Update examination schedule details.
* `POST   /api/v1/exams/:id/eligibility-check` - Automated 75% attendance gate verification for student hall tickets.
* `POST   /api/v1/exams/:id/record-marks` - Record candidate scores, compute UGC 10-point grades, and calculate SGPA/CGPA.
* `GET    /api/v1/exams/:id/student-transcript/:studentId` - Fetch formal transcript data and OBE course outcome attainment report.

### 6. 📚 Previous Year Question Papers & PYQ Bank (`/api/v1/exam-papers`)
* `GET    /api/v1/exam-papers` - Query exam papers archive filtered by course, stream, class, semester, paperType, or search term.
* `GET    /api/v1/exam-papers/filters` - Fetch dynamic filter metadata (available courses, classes, paper types).
* `POST   /api/v1/exam-papers` - Upload/create a new previous year paper or model paper with solution URL.
* `DELETE /api/v1/exam-papers/:id` - Delete an exam paper.
* `PATCH  /api/v1/exam-papers/:id/download` - Increment and track paper download count.

### 7. 🎓 NCrF Courses, Academic Hierarchy & Syllabus (`/api/v1/courses`, `/api/v1/syllabus`)
* `GET    /api/v1/courses` - Fetch complete institutional academic hierarchy (Departments, Courses, NCrF Levels, Semesters, Sections, Subjects).
* `POST   /api/v1/courses` - Create a new department and course offering.
* `PUT    /api/v1/courses/:id` - Update an existing department or curriculum node.
* `DELETE /api/v1/courses/:id` - Remove a department.
* `GET    /api/v1/syllabus` - Fetch syllabus files and curriculum outlines.
* `POST   /api/v1/syllabus` - Upload new syllabus document.

### 8. ⚖️ DPDP Data Subject Rights & Privacy (`/api/v1/privacy`)
* `GET  /api/v1/privacy/requests` - View all Data Subject Access & Erasure requests (DPO queue).
* `POST /api/v1/privacy/requests` - Submit a new Data Subject Access or Erasure Request.
* `PUT  /api/v1/privacy/requests/:id` - Update statutory request status (e.g. In Progress, Fulfilled, Rejected).

### 9. 🔍 SOC Threat Telemetry & Forensic Audit Logs (`/api/v1/audit-logs`)
* `GET /api/v1/audit-logs` - Retrieve immutable security audit trail with risk filters (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
* `GET /api/v1/audit-logs/soc-metrics` - Get aggregated SIEM security analytics (failed logins, brute-force trips, active threats).

### 10. 👥 Staff, Leaves, Attendance & Payroll (`/api/v1/staff`)
* `GET    /api/v1/staff` - Get all staff profiles.
* `POST   /api/v1/staff` - Add a new staff member.
* `PUT    /api/v1/staff/:id` - Edit staff details.
* `DELETE /api/v1/staff/:id` - Delete a staff member.
* `GET    /api/v1/staff/leaves` - View all leave requests.
* `POST   /api/v1/staff/leaves` - Apply for leave.
* `PUT    /api/v1/staff/leaves/:id` - Approve or reject a leave request.
* `DELETE /api/v1/staff/leaves/:id` - Delete a leave request.
* `GET    /api/v1/staff/attendance?date=YYYY-MM-DD` - View staff attendance for a date.
* `POST   /api/v1/staff/attendance` - Record staff attendance.
* `GET    /api/v1/staff/payroll?month=M&year=YYYY` - View payroll records for a month.
* `POST   /api/v1/staff/payroll/generate` - Auto-generate payroll for staff.
* `PUT    /api/v1/staff/payroll/:id` - Update payroll status (Paid / Pending).

### 11. 📝 Student Attendance (`/api/v1/attendance`)
* `GET /api/v1/attendance/students` - Get student attendance records by date and class.
* `PUT /api/v1/attendance/bulk` - Bulk update daily class attendance.

### 12. 📖 Library Management (`/api/v1/library`)
* `GET    /api/v1/library/books` - List all catalogued library books.
* `POST   /api/v1/library/books` - Add a new book to the library catalog.
* `PUT    /api/v1/library/books/:id` - Edit book details and quantity.
* `DELETE /api/v1/library/books/:id` - Remove a book from the catalog.
* `GET    /api/v1/library/issue` - View all active book issuances.
* `POST   /api/v1/library/issue` - Issue a book to a student or staff member.
* `POST   /api/v1/library/return` - Record a book return.

### 13. 🏢 Campus Facilities: Hostel & Transport (`/api/v1/facility`)
* `GET    /api/v1/facility/hostel/rooms` - List hostel blocks and rooms.
* `POST   /api/v1/facility/hostel/rooms` - Create a new hostel room.
* `PUT    /api/v1/facility/hostel/rooms/:id` - Update hostel room details and bed capacity.
* `DELETE /api/v1/facility/hostel/rooms/:id` - Delete a hostel room.
* `GET    /api/v1/facility/hostel/allocations` - View student hostel room allocations.
* `POST   /api/v1/facility/hostel/allocations` - Allocate a hostel bed to a student.
* `PUT    /api/v1/facility/hostel/allocations/:id` - Vacate a hostel room allocation.
* `GET    /api/v1/facility/transport/routes` - List bus routes, vehicle numbers, and stops.
* `POST   /api/v1/facility/transport/routes` - Create a new transport route.
* `PUT    /api/v1/facility/transport/routes/:id` - Update route details.
* `DELETE /api/v1/facility/transport/routes/:id` - Delete a route.
* `GET    /api/v1/facility/transport/allocations` - List student bus allocations.
* `POST   /api/v1/facility/transport/allocations` - Allocate a bus pass to a student.
* `PUT    /api/v1/facility/transport/allocations/:id` - Cancel a student bus pass.
* `PUT    /api/v1/facility/transport/allocations/:id/fee` - Update transport fee.

### 14. 📦 Inventory & Asset Management (`/api/v1/inventory`)
* `GET    /api/v1/inventory/items` - List all physical inventory items.
* `POST   /api/v1/inventory/items` - Add a new inventory item.
* `PUT    /api/v1/inventory/items/:id` - Edit an inventory item.
* `DELETE /api/v1/inventory/items/:id` - Delete an inventory item.
* `GET    /api/v1/inventory/issuance` - View all issued items and borrowing history.
* `POST   /api/v1/inventory/issuance` - Issue an item to a staff member or department.
* `PUT    /api/v1/inventory/issuance/:id` - Update issuance (e.g. mark as returned).

### 15. 📂 Assignments (`/api/v1/assignments`)
* `GET    /api/v1/assignments` - Get all assignments.
* `GET    /api/v1/assignments/my` - Get assignments for the logged-in student's class.
* `POST   /api/v1/assignments` - Create a new assignment.
* `DELETE /api/v1/assignments/:id` - Delete an assignment.

### 16. 📚 Study Materials (`/api/v1/study-materials`)
* `GET    /api/v1/study-materials` - Get all study resources.
* `GET    /api/v1/study-materials/my` - Get study materials for the logged-in student.
* `POST   /api/v1/study-materials` - Upload and publish new study materials.
* `DELETE /api/v1/study-materials/:id` - Delete a study material item.

### 17. 🔔 Announcements & Notifications (`/api/v1/notifications`)
* `GET    /api/v1/notifications` - Get all public/campus announcements.
* `GET    /api/v1/notifications/my` - Get personal notifications for the logged-in user.
* `POST   /api/v1/notifications` - Send a new notification.
* `DELETE /api/v1/notifications/:id` - Remove a notification.

### 18. 🎫 Help Desk & Support Tickets (`/api/v1/tickets`)
* `GET  /api/v1/tickets` - View all submitted help tickets.
* `GET  /api/v1/tickets/my` - View tickets created by you.
* `POST /api/v1/tickets` - Submit a new ticket.
* `PUT  /api/v1/tickets/:id` - Update ticket status (e.g., In Progress, Resolved).

### 19. ⚙️ Institutional Settings (`/api/v1/settings`)
* `GET  /api/v1/settings` - Retrieve institutional configuration and branding details.
* `POST /api/v1/settings` - Update institutional configuration.

### 20. 🛡️ User & Role Management (Admin) (`/api/v1/users`, `/api/v1/roles`)
* `GET    /api/v1/users` - List all system user accounts.
* `POST   /api/v1/users` - Create a new staff/admin user account.
* `PUT    /api/v1/users/:id` - Edit user account details.
* `DELETE /api/v1/users/:id` - Delete a user account.
* `GET    /api/v1/roles` - List all permission roles.
* `POST   /api/v1/roles` - Create a new role with custom permissions.
* `PUT    /api/v1/roles/:id` - Update role permissions.
* `DELETE /api/v1/roles/:id` - Delete a role.

### 21. 🖼️ Media & File Uploads (`/api/v1/media`)
* `GET    /api/v1/media` - Get list of uploaded images and documents.
* `POST   /api/v1/media/upload` - Upload a file to cloud storage (ImageKit API).
* `PUT    /api/v1/media/:id` - Update file metadata.
* `DELETE /api/v1/media/:id` - Delete a file.
* `POST   /api/v1/media/delete-bulk` - Delete multiple files in one request.

### 22. 📜 System Activity Logs (`/api/v1/activities`)
* `GET /api/v1/activities` - View the live audit feed of user actions and logins.

### 23. 💓 Health, Observability & Keep-Alive (`/health`, `/api/v1/health`, `/ping`)
* `GET /health` or `GET /api/v1/health` or `GET /ping` - Returns JSON system status, process uptime, V8 memory pressure metrics (`heapUsedMB`, `heapLimitMB`, `usagePercentage`, `status: HEALTHY | CRITICAL_PRESSURE`), and service name.

---

## 💻 Tech Stack & Architectural Foundation

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER (React 19)                        │
│  Vite • Tailwind CSS 4 • Recharts • Axios Interceptors • React Router  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP/S (X-Trace-Id)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INGRESS & EDGE RESILIENCE                       │
│  Nginx Reverse Proxy • Envoy Circuit Breaker • Coraza Anomaly WAF      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION TIER (Express 5)                    │
│  Trace ID Middleware • Context Call Budget • Split-Brain Quorum Guard  │
│  Memory Cushion Guard (OOM Armor) • Helmet HSTS • Rate Limiting        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ODM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PERSISTENCE & STORAGE                          │
│  MongoDB Atlas Replica Set • ImageKit Cloud Storage • Razorpay Gateway │
└────────────────────────────────────────────────────────────────────────┘
```

* **Frontend:** React 19, Tailwind CSS 4, Vite 7, Axios, React Router v7, React Hot Toast, Recharts, React Helmet Async.
* **Backend:** Node.js, Express.js 5, MongoDB with Mongoose ODM, JSON Web Tokens (JWT), bcryptjs, Morgan.
* **Resilience & SRE:** Distributed Trace Correlation (`X-Trace-Id`), Context Call Budgets (3500ms timeout guard), Split-Brain Quorum Protection, Memory Cushion Circuit Breaker (OOM Armor), Full Jitter Exponential Backoff.
* **Security & Infrastructure (`infra/`):** Envoy Circuit Breaker, Nginx Edge Hardening, Coraza WAF Anomaly Scoring, Falco eBPF Threat Detection, Hardened Kubernetes Pod Security Standards, DNSSEC & CAA Records, Linux kernel OOM tuning.
* **Third-Party Integrations:** Razorpay Payment Gateway, ImageKit CDN Media API, EmailJS Notifications.

---

## ⚖️ Statutory Compliance & Regulatory Frameworks

Shyvora ERP is built ground-up to conform with statutory standards:
1. **Digital Personal Data Protection Act (DPDP Act, 2023 / Rules 2025):** Section 9 verifiable parental consent for minors (< 18), zero-login public SAR and Right to Be Forgotten portals (`/privacy`), and statutory DPO queue (`/admin/privacy`).
2. **CERT-In 6-Hour Security Directions:** Tamper-evident immutable forensic audit logs, elevated authorization for sensitive identity decryption, and real-time SIEM threat metrics (`/admin/audit-logs`, `/admin/soc-security`).
3. **National Credit Framework (NCrF) & NEP 2020:** Levels 4.5 through 8.0, L-T-P modular credit calculations, major/minor categorizations, and DigiLocker Academic Bank of Credits (ABC) synchronization.
4. **UGC Equity Regulations 2026 & POSH Act 2013:** 24/7 UGC Anti-Ragging Helpline integration (`1800-180-5522`), Internal Complaints Committee (ICC) workflows, and anonymous campus grievance reporting (`/safety`, `/admin/safety`).

---

## 🚀 Running the Project Locally

### 1. Prerequisites
* [Node.js (v18+)](https://nodejs.org/) installed on your machine.
* A running [MongoDB](https://www.mongodb.com/) instance (local or MongoDB Atlas connection string).

### 2. Clone and Install Dependencies
Run the installation command in the root project directory:
```bash
npm run install-all
```
*(This installs root dependencies and runs `npm install` inside both `frontend/` and `backend/`)*

### 3. Setup Environment Variables

#### Backend (`backend/.env`):
Create or update `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shyvora_erp?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development

# Cloud Media Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### Frontend (`frontend/.env`):
Create or update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# EmailJS Configuration (Optional for client email alerts)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### 4. Start the Application
From the root project directory, run:
```bash
npm run dev
```
This runs both the backend server (on `http://localhost:5000`) and the Vite frontend (on `http://localhost:5173`) simultaneously via `concurrently`.

Open **`http://localhost:5173`** in your browser, enter `superadmin` or `admin@Shyvora.in` with `SuperAdmin@123`, and explore!

### 5. Running Cloud Keep-Alive (Optional)
To keep cloud free-tier hosting (e.g., Render PaaS) continuously awake:
```bash
npm run keep-alive
```
*(Or let GitHub Actions trigger `.github/workflows/keep-alive.yml` automatically every 14 minutes)*

---

## 🛡️ GameDay Disaster Recovery & Runbooks

For Site Reliability Engineers (SREs) and system administrators, refer to the operational Disaster Recovery & GameDay Runbook:
* **Runbook Location:** [`infra/gameday/GAMEDAY_RUNBOOK.md`](infra/gameday/GAMEDAY_RUNBOOK.md)
* **Testing Scenarios Included:**
  * Abrupt power loss & hypervisor termination ($RPO = 0$ verification)
  * Database deadlock cycle injection and jitter retry
  * Layer 7 DDoS mitigation and rate-limit trip testing
  * Container filesystem immutability & Falco eBPF detection
  * BGP Anycast convergence simulation

---

## 📄 License
This project is licensed under the ISC License. Powered by Shyvora Technologies.
