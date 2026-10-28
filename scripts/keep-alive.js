#!/usr/bin/env node

/**
 * ⚡ Shyvora Render Anti-Sleep Keep-Alive Daemon
 * 
 * Render.com free-tier web services sleep after 15 minutes of inactivity.
 * This script sends an automated HTTP ping every 5 minutes so your backend
 * and website never go to sleep and remain instantly fast for every user.
 * 
 * Usage:
 *   node scripts/keep-alive.js
 *   node scripts/keep-alive.js --interval 5 --urls https://shyvora-full-stack-backend.onrender.com/health
 */

const https = require('https');
const http = require('http');

// Parse CLI args
const args = process.argv.slice(2);
const getArgValue = (flag, defaultValue) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
};

// Configuration
const INTERVAL_MINUTES = parseFloat(getArgValue('--interval', process.env.INTERVAL_MINUTES || '5'));
const INTERVAL_MS = Math.max(1, INTERVAL_MINUTES) * 60 * 1000;

const defaultUrls = [
  'https://shyvora-full-stack-backend.onrender.com/health',
  'https://shyvora-full-stack-backend.onrender.com/'
];

const inputUrls = getArgValue('--urls', process.env.TARGET_URLS);
const TARGET_URLS = inputUrls
  ? inputUrls.split(',').map(u => u.trim()).filter(Boolean)
  : defaultUrls;

// Statistics
let stats = {
  totalPings: 0,
  successful: 0,
  failed: 0,
  startTime: new Date()
};

const formatTime = () => new Date().toLocaleTimeString('en-US', { hour12: false });
const formatDate = () => new Date().toISOString().split('T')[0];

console.log('\n======================================================');
console.log('  ⚡ SHYVORA RENDER ANTI-SLEEP KEEP-ALIVE DAEMON');
console.log('======================================================');
console.log(`[Config] Started at: ${formatDate()} ${formatTime()}`);
console.log(`[Config] Ping Interval: ${INTERVAL_MINUTES} minute(s) (${INTERVAL_MS / 1000}s)`);
console.log(`[Config] Targets:`);
TARGET_URLS.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
console.log('======================================================\n');

/**
 * Ping a single URL
 */
const pingUrl = (targetUrl) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const isHttps = targetUrl.startsWith('https://');
    const client = isHttps ? https : http;

    try {
      const parsedUrl = new URL(targetUrl);
      const req = client.get(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          headers: {
            'User-Agent': 'Shyvora-KeepAlive-Bot/1.0',
            'Accept': 'application/json, text/plain, */*'
          },
          timeout: 25000 // 25s timeout
        },
        (res) => {
          const latency = Date.now() - startTime;
          res.resume(); // consume response body

          const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
          resolve({
            url: targetUrl,
            status: res.statusCode,
            latency,
            success: isSuccess
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url: targetUrl,
          status: 'TIMEOUT',
          latency: Date.now() - startTime,
          success: false,
          error: 'Request timed out after 25s'
        });
      });

      req.on('error', (err) => {
        resolve({
          url: targetUrl,
          status: 'ERROR',
          latency: Date.now() - startTime,
          success: false,
          error: err.message
        });
      });
    } catch (parseError) {
      resolve({
        url: targetUrl,
        status: 'INVALID_URL',
        latency: 0,
        success: false,
        error: parseError.message
      });
    }
  });
};

/**
 * Ping all targets concurrently
 */
const performCycle = async () => {
  const cycleTime = formatTime();
  stats.totalPings++;

  console.log(`[${cycleTime}] Running ping cycle #${stats.totalPings}...`);

  for (const url of TARGET_URLS) {
    const result = await pingUrl(url);

    if (result.success) {
      stats.successful++;
      console.log(`  ✓ [${result.status}] ${result.url} - ${result.latency}ms (Service Hot & Awake)`);
    } else {
      stats.failed++;
      console.warn(`  ✗ [${result.status}] ${result.url} - ${result.error || 'Failed'} (${result.latency}ms)`);
    }
  }

  const successRate = Math.round((stats.successful / (stats.successful + stats.failed || 1)) * 100);
  console.log(`  📊 Cycle done. Success rate: ${successRate}% (${stats.successful} ok / ${stats.failed} err)\n`);
};

// Run first ping immediately on startup
performCycle();

// Schedule recurring cycle
const intervalHandle = setInterval(performCycle, INTERVAL_MS);

// Clean graceful shutdown on CTRL+C
const shutdown = () => {
  clearInterval(intervalHandle);
  console.log('\n======================================================');
  console.log('  Keep-Alive Daemon Shutting Down');
  console.log(`  Total Pings: ${stats.totalPings} | Success: ${stats.successful} | Errors: ${stats.failed}`);
  console.log('======================================================\n');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
