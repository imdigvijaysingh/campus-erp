#!/usr/bin/env bash
# /infra/network/edge-ddos-hardening.sh
# Layer 3/4 Flood Mitigation, Stateless Conntrack Bypass & eBPF/XDP Filtering (Workstream 4.1)

set -euo pipefail

echo "=========================================================="
echo " Applying Network Perimeter & DDoS Immunity Hardening"
echo "=========================================================="

# 1. Kernel SYN Flood Resistance & Backlog Optimization
sysctl -w net.ipv4.tcp_syncookies=1
sysctl -w net.ipv4.tcp_max_syn_backlog=262144
sysctl -w net.core.netdev_max_backlog=100000
sysctl -w net.core.somaxconn=65535

# Drop invalid packets immediately
iptables -t mangle -A PREROUTING -m conntrack --ctstate INVALID -j DROP

# Drop TCP packets that are new and not SYN
iptables -t mangle -A PREROUTING -p tcp ! --syn -m conntrack --ctstate NEW -j DROP

# 2. Conntrack Table Exhaustion Bypass under Active DDoS
# Bypasses Linux connection tracking for high-volume HTTPS ingress to preserve kernel RAM
echo "[PERIMETER] Enabling raw table stateless conntrack bypass for port 443..."
if ! iptables -t raw -C PREROUTING -p tcp --dport 443 -j NOTRACK 2>/dev/null; then
    iptables -t raw -I PREROUTING -p tcp --dport 443 -j NOTRACK
    iptables -t raw -I OUTPUT -p tcp --sport 443 -j NOTRACK
    echo "[PERIMETER] NOTRACK rules active on TCP port 443."
fi

# 3. eBPF / XDP High-Performance Packet Drop Blueprint
# Driver-level packet filter drop template (attaches to network interface eth0)
if command -v ip > /dev/null 2>&1 && [ -f "/infra/network/xdp_drop_filter.o" ]; then
    echo "[eBPF/XDP] Attaching hardware/driver XDP drop filter to eth0..."
    ip link set dev eth0 xdpgeneric off 2>/dev/null || true
    ip link set dev eth0 xdpgeneric object /infra/network/xdp_drop_filter.o sec xdp_drop
    echo "[eBPF/XDP] Attached successfully."
else
    echo "[eBPF/XDP] Standby mode: Kernel iptables raw NOTRACK active."
fi

echo "=========================================================="
echo " Perimeter Hardening Completed Successfully"
echo "=========================================================="
