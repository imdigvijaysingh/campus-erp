# 🛡️ GameDay Disaster Recovery & Cyber-Resilience Runbook (Workstream 5.2)

This operational runbook details the mandatory procedures for executing quarterly Disaster Recovery GameDays. It verifies the enforcement of **$RPO = 0$ (Zero Data Loss)**, **$RTO \approx 0$ (Automated Failover)**, and the **Fail-Secure** baseline under simulated adverse conditions.

---

## 1. Governance & Incident Command Protocol

* **Incident Commander (IC):** Head of Infrastructure & SRE Lead
* **Chaos Operator:** Designated Site Reliability Engineer (SRE)
* **Observer / Scribe:** Security Operations (SOC) Analyst
* **Escalation Window:** If any test causes uncontained customer-facing degradation exceeding 10 seconds, the IC invokes the **Emergency Rollback Protocol** immediately.

---

## 2. Quarterly GameDay Drill Scenarios

### 🔬 Test 1: Abrupt Power Loss Simulation ($RPO = 0$ Verification)
* **Objective:** Verify that sudden hardware/hypervisor termination causes zero acknowledged transaction loss and dirty writes roll back deterministically.
* **Execution:**
  ```bash
  # Step 1: Start synthetic high-concurrency transactional commit stream
  npm run test:transaction-load &
  LOAD_PID=$!

  # Step 2: Abruptly terminate the primary database VM instance (simulate power pull)
  aws ec2 stop-instances --instance-ids i-0a1b2c3d4e5f6g7h8 --force
  ```
* **Verification & Acceptance Criteria:**
  1. Standby node in secondary AZ assumes primary leadership within $< 2000\text{ms}$.
  2. All write transactions acknowledged with HTTP 200/201 prior to termination exist in the secondary ledger ($RPO = 0$).
  3. Any in-flight transaction without quorum ACK is cleanly rejected with HTTP 503/504; no corrupted partial states exist.

---

### 🔬 Test 2: Database Deadlock Cycle Injection & Jitter Retry
* **Objective:** Verify that reciprocal database lock contention triggers automated victim abort, rollback, and frontend jitter retry without thread starvation.
* **Execution:**
  ```bash
  # Inject artificial circular lock dependencies across two sessions
  node scripts/chaos-deadlock-inject.js
  ```
* **Verification & Acceptance Criteria:**
  1. Database engine detects lock contention within `100ms` (`deadlock_timeout = 100ms`).
  2. Transaction supervisor aborts one transaction with standard SQLSTATE `40P01` / MongoDB WriteConflict.
  3. Client-side retry in `frontend/src/utils/api.js` automatically triggers exponential backoff with full jitter:
     $$t_{\text{sleep}} = \min(3000, \; 300 \times 2^{\text{attempt}}) \times \text{random}(0, 1)$$
  4. Both operations complete successfully within 1.5 seconds without operator intervention.

---

### 🔬 Test 3: Simulated Layer 7 DDoS on `/api/v1/auth/login`
* **Objective:** Validate that high-frequency credential stuffing or flood attacks are mitigated at the edge without degrading core platform throughput.
* **Execution:**
  ```bash
  # Generate 50,000 HTTP POST requests per second targeted at login
  autocannon -c 500 -d 30 -m POST \
    -H "Content-Type: application/json" \
    -b '{"username":"attacker","password":"password123"}' \
    http://localhost:5000/api/v1/auth/login
  ```
* **Verification & Acceptance Criteria:**
  1. Rate limiter trips at 10 requests per 15 minutes per IP.
  2. Edge reverse proxy returns HTTP 429 / HTTP 503 with opaque JSON error payload and `X-Trace-Id`.
  3. Backend Node.js memory cushion remains stable below 85% heap threshold; CPU usage of unrelated endpoints (`/api/v1/students`) remains unaffected.

---

### 🔬 Test 4: Rogue File Modification in Container (`/app/public`)
* **Objective:** Validate that container immutability and Falco eBPF FIM detect and terminate compromised containers in $< 2$ seconds.
* **Execution:**
  ```bash
  # Simulate unauthorized webshell dropping or static asset tamper
  kubectl exec -it deployment/erp-api-service -- touch /app/public/malicious.js
  ```
* **Verification & Acceptance Criteria:**
  1. Read-only filesystem blocks the write natively: `Read-only file system (errno: 30)`.
  2. If mounted on writable volume, Falco rule `Unauthorized Write to Static Assets` triggers immediately:
     ```json
     {"priority": "CRITICAL", "rule": "Unauthorized Write to Static Assets", "output": "File integrity breach attempt..."}
     ```
  3. Automated webhook terminates the compromised pod; Kubernetes spawns a pristine replacement in $< 2$ seconds.

---

### 🔬 Test 5: Carrier Transit Failure & Anycast BGP Re-convergence
* **Objective:** Validate that Tier-1 transit severance triggers automated traffic re-routing via Anycast BGP and BFD (Bidirectional Forwarding Detection) in $< 3$ seconds.
* **Execution:**
  ```bash
  # Administratively bring down primary BGP peering session
  ssh edge-router-primary "configure; set protocols bgp group transit neighbor 198.51.100.1 disable; commit"
  ```
* **Verification & Acceptance Criteria:**
  1. BFD hardware timers detect path loss within 300ms.
  2. BGP Anycast routes withdraw cleanly from the degraded POP.
  3. Global Edge traffic converges onto secondary POP within $< 3$ seconds with zero dropped established TCP connections.

---

## 3. Rollback & Emergency Controllability Procedures

If unexpected degradation occurs during testing or production operation:

### 1. WAF Emergency Override (Do NOT disable the WAF)
Apply surgical bypass for affected legitimate URI patterns:
```ini
SecRule REQUEST_URI "@beginsWith /api/v1/affected-endpoint" \
    "id:990002,phase:1,pass,nolog,ctl:ruleRemoveById=942100"
```

### 2. Database Read-Only Safeguard Override
If false disk alerts or minority quorum falsely hold a read-only lock:
```sql
ALTER SYSTEM SET default_transaction_read_only = off;
SELECT pg_reload_conf();
```

### 3. Container Sandboxing Hot-Rollback
If third-party native binaries require cache writes, add a localized memory `emptyDir` mount rather than opening container root filesystem:
```yaml
volumeMounts:
- name: cache-scratch
  mountPath: /app/.cache
volumes:
- name: cache-scratch
  emptyDir:
    medium: Memory
    sizeLimit: 64Mi
```
