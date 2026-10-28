#!/usr/bin/env bash
# /infra/scripts/oom-tuning.sh
# Linux cgroups v2 & Deterministic OOM Tuning (Workstream 3.2)
# Prioritizes core transactional daemons over ephemeral background workers

set -euo pipefail

echo "=========================================================="
echo " Starting Deterministic OOM Score Adjustment Tiering"
echo "=========================================================="

# 1. Tier 0: Core Relational & Document Engines (Highest Survivability)
# -1000 disables OOM killer selection completely for stateful storage
for db_proc in postgres mongod; do
    if pgrep -x "$db_proc" > /dev/null 2>&1; then
        for pid in $(pgrep -x "$db_proc"); do
            echo -1000 > "/proc/$pid/oom_score_adj"
            echo "[OOM TIER 0] Process '$db_proc' (PID: $pid) protected with oom_score_adj = -1000"
        done
    fi
done

# 2. Tier 1: Core API & Gateway Daemons (High Survivability)
for gateway_proc in envoy nginx; do
    if pgrep -x "$gateway_proc" > /dev/null 2>&1; then
        for pid in $(pgrep -x "$gateway_proc"); do
            echo -500 > "/proc/$pid/oom_score_adj"
            echo "[OOM TIER 1] Process '$gateway_proc' (PID: $pid) configured with oom_score_adj = -500"
        done
    fi
done

# 3. Tier 2: Application API Servers (Balanced)
if pgrep -f "node.*server.js" > /dev/null 2>&1; then
    for pid in $(pgrep -f "node.*server.js"); do
        echo 0 > "/proc/$pid/oom_score_adj"
        echo "[OOM TIER 2] Backend API Worker (PID: $pid) set to neutral oom_score_adj = 0"
    done
fi

# 4. Tier 3: Ephemeral Background Workers & Batch Jobs (Sacrificial)
# These may be killed during extreme memory pressure to preserve transaction integrity
for worker_pattern in "bullmq:worker" "celery" "queue:work"; do
    if pgrep -f "$worker_pattern" > /dev/null 2>&1; then
        for pid in $(pgrep -f "$worker_pattern"); do
            echo 500 > "/proc/$pid/oom_score_adj"
            echo "[OOM TIER 3] Background worker '$worker_pattern' (PID: $pid) set to sacrificial oom_score_adj = 500"
        done
    fi
done

echo "=========================================================="
echo " OOM Score Tiering Completed Successfully"
echo "=========================================================="
