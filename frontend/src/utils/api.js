import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api/v1";
  }
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/api/v1`;
  }
  return "https://Shyvora-full-stack-backend.onrender.com/api/v1";
};

/**
 * Full Jitter Exponential Backoff Calculation (Phase 0 Workstream 0.2)
 * Formula: t_sleep = min(t_max, t_base * 2^attempt) * random(0, 1)
 */
const calculateFullJitterDelay = (attempt, baseMs = 300, maxMs = 3000) => {
  const exponentialCap = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  return Math.floor(exponentialCap * Math.random());
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // Resilient context budget: 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token & Trace Correlation ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cms_token") || localStorage.getItem("studentToken") || localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Attach client trace ID if not already generated
    if (!config.headers["X-Trace-Id"]) {
      const traceId = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'cli-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
      config.headers["X-Trace-Id"] = traceId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: 401 Revocation & Exponential Jitter Retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // 1. Session Revocation (401)
    if (response && response.status === 401) {
      localStorage.removeItem("cms_token");
      localStorage.removeItem("studentToken");
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminUsername");
      localStorage.removeItem("sessionExpiresAt");

      if (typeof window !== "undefined" && window.location.pathname !== "/authentication/index") {
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }
      return Promise.reject(error);
    }

    // 2. Exponential Backoff with Full Jitter for Transient Errors (502, 503, 504, 429, Network Drops)
    if (!config) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;
    const maxRetries = config.maxRetries ?? 3;

    // Retry criteria: 503 (Load shedding), 502/504 (Gateway timeout), 429 (Rate limit), or Network error
    const isTransientStatus = response && [429, 502, 503, 504].includes(response.status);
    const isNetworkError = !response && (error.code === 'ECONNABORTED' || error.message.includes('Network Error'));
    const isIdempotentMethod = ['get', 'head', 'options', 'put'].includes(config.method?.toLowerCase() || '');

    // Allow retry on idempotent requests or transient server-side load shedding
    if ((isTransientStatus || isNetworkError) && (isIdempotentMethod || response?.status === 503) && config.__retryCount < maxRetries) {
      config.__retryCount += 1;
      
      const retryAfterHeader = response?.headers?.['retry-after'];
      let delayMs = 0;

      if (retryAfterHeader && !isNaN(Number(retryAfterHeader))) {
        delayMs = Number(retryAfterHeader) * 1000;
      } else {
        delayMs = calculateFullJitterDelay(config.__retryCount - 1);
      }

      console.warn(`[API RESILIENCE] Transient failure (${response?.status || error.code}). Retrying request (Attempt ${config.__retryCount}/${maxRetries}) in ${delayMs}ms with full jitter. Route: ${config.url}`);

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return api(config);
    }

    return Promise.reject(error);
  },
);

export default api;
