/**
 * Render Keep-Alive / Heartbeat Daemon
 * 
 * Render free web services spin down (sleep) after 15 minutes of inactivity.
 * When deployed on Render, Render automatically sets the `RENDER_EXTERNAL_URL` env variable.
 * This module sends an HTTP request every 10 minutes (before the 15-minute sleep threshold)
 * to keep the service continuously warm and responsive.
 */

const https = require('https');
const http = require('http');

const startKeepAlive = () => {
  // Render automatically sets RENDER_EXTERNAL_URL in production
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.KEEP_ALIVE_URL;
  
  if (!targetUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[Keep-Alive] RENDER_EXTERNAL_URL not set. Internal self-ping skipped.');
    }
    return;
  }

  // Ping every 10 minutes (600,000 ms) - safely under the 15-minute inactivity timeout
  const INTERVAL_MS = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS, 10) || 10 * 60 * 1000;
  
  // Format health endpoint URL
  const pingUrl = targetUrl.replace(/\/+$/, '') + '/health';
  console.log(`[Keep-Alive] Initialized self-ping service for: ${pingUrl} (every ${INTERVAL_MS / 60000} mins)`);

  const sendPing = () => {
    const startTime = Date.now();
    const client = pingUrl.startsWith('https') ? https : http;

    client.get(pingUrl, (res) => {
      const duration = Date.now() - startTime;
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`[Keep-Alive] ✓ Ping successful: ${res.statusCode} (${duration}ms) at ${new Date().toLocaleTimeString()}`);
      } else {
        console.warn(`[Keep-Alive] ⚠ Ping returned status ${res.statusCode} (${duration}ms)`);
      }
      // Consume response data to free up memory
      res.resume();
    }).on('error', (err) => {
      console.error(`[Keep-Alive] ✗ Ping error: ${err.message}`);
    });
  };

  // Schedule recurring pings
  const timer = setInterval(sendPing, INTERVAL_MS);
  
  // Clean up on process exit
  process.on('SIGTERM', () => clearInterval(timer));
  process.on('SIGINT', () => clearInterval(timer));
};

module.exports = startKeepAlive;
