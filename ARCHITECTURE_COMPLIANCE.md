# 🛡️ Shyvora: The Secure Digital Campus Operating System
## Master Architecture, Security by Design & Compliance Blueprint (2026–2027)

> **Document Version:** 1.0.0  
> **Last Updated:** October 2026  
> **Applicable Regulations:** Digital Personal Data Protection Act, 2023 & Rules 2025 | CERT-In Directions 70B | UGC Regulations (Equity 2026, Anti-Ragging, ICC) | National Credit Framework (NCrF) | APAAR / ABC Guidelines | Rights of Persons with Disabilities (RPwD) Act

---

## 1. Executive Vision & Philosophy

Shyvora is not merely a college management website; it is an **enterprise-grade, secure, multi-tenant digital campus operating system**. 

When educational institutions entrust their academic records, staff payroll, student PII, and financial ledgers to a platform, security and statutory compliance cannot be afterthoughts. Shyvora is built upon the principle of **Security & Privacy by Design**:

```
                       ┌─────────────────────────────────────────┐
                       │     ZERO-TRUST MULTI-TENANT SAAS         │
                       └────────────────────┬────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│   DATA PRIVACY   │               │   CYBERSECURITY  │               │  CAMPUS WELFARE  │
│  DPDP 2023/2025  │               │   CERT-In 6-HR   │               │  UGC EQUITY 2026 │
│Child Safety Mode │               │  SOC & Immutable │               │   ANTI-RAGGING   │
│Consent Management│               │    Audit Trail   │               │    ICC / POSH    │
└──────────────────┘               └──────────────────┘               └──────────────────┘
```

---

## 2. Regulatory Compliance Roadmap

### 2.1. Digital Personal Data Protection (DPDP) Act, 2023 & Rules, 2025
- **Rule 4 Commencement (13 November 2026):** Baseline safeguards, security logging, and incident notification framework.
- **Full Operational Commencement (13 May 2027):** Rules 3, 5–16, 22, 23 (Verifiable Parental Consent, Data Subject Rights, Retention & Erasure, Data Protection Officer / Privacy Center).

#### Mandated Architecture:
1. **Tenant-Level Data Inventory:** Every data collection categorized by classification (`Public`, `Internal`, `Confidential`, `Restricted PII`).
2. **Consent Lifecycle Engine:** Tracking explicit consents with versioned privacy notices and instant consent withdrawal.
3. **Data Subject Rights (SAR):** Standardized workflows for Data Access Requests, Data Correction Requests, Data Deletion Requests (Right to be Forgotten), and Portability Export.
4. **Data Retention Policies:** Every sensitive record includes a `retentionUntil` timestamp. Automatic purging/anonymization workflows execute once the educational/legal purpose expires.

---

### 2.2. Child Data Protection & Minor Safety Mode (School Edition)
The DPDP framework strictly limits processing of children's data:
- **Age Classification:** Students tagged as `Minor` (<18 years) automatically enter **Child Safety Mode**.
- **Verifiable Parental Consent:** Accounts for minors must be linked to a verified Parent/Guardian profile.
- **Zero Behavioral Tracking:** Strict prohibition of engagement tracking, screen-time profiling, or targeted algorithmic promotions.
- **Narrow Safety Exemptions:** Location tracking is permitted strictly for **physical transport safety** (bus transit tracking while active) and institutional physical security.

---

### 2.3. CERT-In Cyber Security Directions (No. 20(3)/2022-CERT-In)
- **Mandatory 6-Hour Reporting:** Cyber security incidents (unauthorized access, ransomware, data leaks, denial of service) must be detected and structured for reporting within 6 hours.
- **NTP Time Synchronization:** All application servers and database logs must synchronize with Indian Standard Time (IST / NTP) servers to ensure legally defensible forensic trails.
- **ERP Security Operations Center (SOC):** Built-in real-time monitoring of authentication anomalies, rate-limit trips, 401/403 spikes, impossible travel, and bulk export attempts.

---

### 2.4. UGC Campus Welfare & Safety Regulations (2026)
- **Promotion of Equity in Higher Education Institutions Regulations, 2026:**
  - Establishment of an Equal Opportunity Centre interface.
  - Digital reporting channel for caste, gender, disability, or identity discrimination.
  - 24/7 Campus Emergency helpline directory.
- **Anti-Ragging Regulations:** Digital submission of mandatory student/parent anti-ragging affidavits, anonymous complaint filing, inquiry committee tracking, and statutory report generation.
- **Internal Complaints Committee (ICC / POSH):** End-to-end confidential sexual harassment grievance workflow with identity redaction for non-committee reviewers.

---

### 2.5. National Credit Framework (NCrF) & APAAR / Academic Bank of Credits (ABC)
- **NCrF Structure:** Modular academic hierarchy: `Institution → Programme → Academic Year → Semester → Course → Credits → Learning Outcomes → Assessment → Transcript`.
- **APAAR ID & DigiLocker:** APAAR numbers and ABC account identifiers are **tokenized and masked** in the UI (`•••• •••• 1234`). Only authorized registrars can decrypt identifiers with full audit tracking.

---

## 3. Core Technical Architecture

### 3.1. Zero-Trust Multi-Tenancy
```
HTTP Request 
   │
   ▼
authMiddleware (Validates JWT / Session Cookie)
   │
   ▼
tenantMiddleware (Extracts req.tenantId from verified user token)
   │
   ├── User is SuperAdmin? → Can query all or specify tenant (Logged with HIGH risk)
   │
   └── User is Institution User? → Query strictly scoped: { institutionId: req.tenantId }
       (Never trust institutionId from req.body or req.query)
```

### 3.2. Structured High-Fidelity Audit Event Model
Every security-sensitive action writes an immutable event:

```typescript
interface AuditLog {
  actor: {
    userId: ObjectId;
    username: string;
    role: string;
  };
  institutionId: ObjectId;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'FAILED_LOGIN' | 'REVOKE' | 'SECURITY_ALERT';
  resource: string; // e.g., 'Student', 'FeePayment', 'Role', 'Attendance'
  resourceId?: string;
  diff?: {
    field: string;
    before: any;
    after: any;
  }[];
  metadata: {
    ip: string;
    userAgent: string;
    requestId: string;
    route: string;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
}
```

### 3.3. Session Management & Device Registry
- Tokens: 15-minute access token + rotating refresh tokens.
- Storage: Secure, HttpOnly, SameSite cookies.
- Device Registry (`Session` model): Tracks active logins (OS, browser, IP, location, last active).
- Features: "Revoke Device" and "Sign Out All Other Sessions".

---

## 4. UI / UX Design Standards

1. **Collapsible Modular Sidebar:** Group 20+ modules into 6 clean accordions:
   - 📊 **Overview**
   - 🎓 **Academics**
   - 👥 **People & HR**
   - 🏛️ **Campus Operations**
   - 🛡️ **Safety & Compliance**
   - ⚙️ **Administration & Security**
2. **"Needs Attention" Triage Widget:** Proactive alerts on the dashboard (attendance anomalies, overdue fees, safety grievances, security incidents).
3. **`Ctrl + K` Command Palette:** Instant universal search and keyboard actions.
4. **Accessibility (RPwD Compliant):** Full keyboard navigability, high-contrast support, font scaling, and `prefers-reduced-motion` compliance.

---

## 5. Phased Implementation Roadmap

- [x] **Phase 1: Multi-Tenant Zero-Trust & Audit Logging Engine**
  - Tenant scoping middleware (`tenantMiddleware.js`).
  - Structured immutable Audit Log model & interceptor.
  - Active Device Session Registry & Revocation API.
  - SOC SIEM threat monitoring console.
- [x] **Phase 2: Command-Center Navigation & UI Evolution**
  - Collapsible sidebar accordions with state persistence.
  - "Needs Attention" triage board on Dashboard.
  - `Ctrl + K` Command Palette component.
- [x] **Phase 3: DPDP Privacy Center & Rights Fulfillment**
  - Privacy Center backend & frontend (Data inventory, consent repository).
  - Public unauthenticated portal `/privacy` for Data Subject Access Requests (SAR) & erasure.
  - Live Server URL Adaptor reading `window.location.origin` with 1-click clipboard link sharing.
- [x] **Phase 4: Campus Safety & UGC Welfare Center**
  - Confidential incident reporting (UGC Anti-Ragging Helpline 1800-180-5522, Equity 2026, POSH/ICC).
  - Public unauthenticated portal `/safety` for students, victims, and parents.
  - Emergency directory and statutory incident triage console (`/admin/safety`).
- [x] **Phase 5: Academic Engine (NCrF & APAAR/ABC Tokenization & Child Safety Mode)**
  - National Credit Framework (NCrF) modular course hierarchy with Framework Levels (4.5 to 8.0) and credit hours.
  - APAAR ID (12-digit Automated Permanent Academic Account Registry) with security masking (`•••• •••• 1234`).
  - Restricted APAAR decryption endpoint (`POST /api/v1/students/:id/reveal-apaar`) with mandatory high-risk forensic audit trail.
  - Academic Bank of Credits (ABC) & DigiLocker sync endpoint and student ledger widget.
  - DPDP Section 9 Child Safety Mode in public student enrollment (`/erp/signup`) and administration (`StudentsManager.jsx`) with verifiable parental consent gates.
- [x] **Phase 6: Digital Campus Finance, Fee Ledger & Invoicing**
  - Multi-tenant institutional fee ledger with line-item breakdowns (Tuition, Exam, Hostel & Mess, Transport, Lab & Library).
  - Concession & scholarship adjustments (Merit Scholarship, Sports Quota, Staff Ward, EWS, Custom deductions).
  - Automated tamper-evident receipt generation (`REC-YYYY-XXXXX`) with printable formal institutional receipt layout, QR verification stamp, amount in words, and authorized signatory watermark.
  - Student balance auto-reconciliation (`totalAmount`, `paidAmount`, remaining balance dues, last payment date and amount).
  - Self-serve online payment simulation for students (UPI / QR Code, Cards, Net Banking) with instant receipt download.
  - Institutional financial analytics & executive KPI metrics (`/api/v1/fees/stats`): Total Revenue, Expected Receivables, Outstanding Dues, and Collection Efficiency Rate.
