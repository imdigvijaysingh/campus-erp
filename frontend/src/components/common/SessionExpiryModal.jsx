import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const DURATION_MS = 8500; // 8.5 seconds smooth countdown

const SessionExpiryModal = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardSize, setCardSize] = useState({ width: 400, height: 440 });
  const [headPoints, setHeadPoints] = useState({ left: null, right: null });

  const cardRef = useRef(null);
  const leftPathRef = useRef(null);
  const rightPathRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Listen for session expired events + expose global helper for testing
  useEffect(() => {
    const handleSessionExpired = () => {
      setIsOpen(true);
      setProgress(0);
      setIsCompleted(false);
      startTimeRef.current = null;
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    window.__triggerSessionExpiry = handleSessionExpired;

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      delete window.__triggerSessionExpiry;
    };
  }, []);

  // Measure card dimensions accurately for pixel-perfect border SVG
  useEffect(() => {
    if (!isOpen || !cardRef.current) return;

    const measure = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setCardSize({ width: rect.width, height: rect.height });
        }
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  const redirectToLogin = () => {
    setIsOpen(false);
    setIsCompleted(false);
    
    // Thoroughly flush stored tokens and auth flags
    localStorage.removeItem("cms_token");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("userPermissions");

    // Seamlessly navigate to Unified Login page
    window.location.href = '/authentication/index';
  };

  // Guaranteed wall-clock fallback timer:
  // Ensures redirect fires even if tab was in background / throttled by browser
  useEffect(() => {
    if (!isOpen) return;

    const fallbackTimer = setTimeout(() => {
      redirectToLogin();
    }, DURATION_MS + 600);

    return () => clearTimeout(fallbackTimer);
  }, [isOpen]);

  // Run the smooth border animation loop (60fps)
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const tick = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const currentProgress = Math.min(elapsed / DURATION_MS, 1);
      setProgress(currentProgress);

      // Track the leading tips of the left and right beams
      if (leftPathRef.current && rightPathRef.current) {
        try {
          const lTotal = leftPathRef.current.getTotalLength();
          const rTotal = rightPathRef.current.getTotalLength();
          if (lTotal > 0 && rTotal > 0) {
            const lPt = leftPathRef.current.getPointAtLength(lTotal * currentProgress);
            const rPt = rightPathRef.current.getPointAtLength(rTotal * currentProgress);
            setHeadPoints({
              left: { x: lPt.x, y: lPt.y },
              right: { x: rPt.x, y: rPt.y }
            });
          }
        } catch {
          // Geometry calculation fallback
        }
      }

      if (currentProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        // Border completed! Trigger collision burst
        setIsCompleted(true);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, isCompleted, cardSize]);

  // When dual lasers collide at bottom center, allow 500ms for glowing burst effect then redirect
  useEffect(() => {
    if (!isCompleted) return;

    const burstTimer = setTimeout(() => {
      redirectToLogin();
    }, 500);

    return () => clearTimeout(burstTimer);
  }, [isCompleted]);


  if (!isOpen) return null;

  // Geometry calculations for dual symmetric border tracing
  const strokeWidth = 4.5;
  const pad = strokeWidth / 2;
  const radius = 24; // matches rounded-3xl
  const effW = cardSize.width - strokeWidth;
  const effH = cardSize.height - strokeWidth;
  const effR = Math.max(4, radius - pad);
  const centerX = cardSize.width / 2;

  // Left path: starts at Top-Center (centerX, pad) -> Top-Left -> Left Border -> Bottom-Left -> Bottom-Center
  const leftPathD = `
    M ${centerX} ${pad}
    H ${pad + effR}
    A ${effR} ${effR} 0 0 0 ${pad} ${pad + effR}
    V ${pad + effH - effR}
    A ${effR} ${effR} 0 0 0 ${pad + effR} ${pad + effH}
    H ${centerX}
  `.replace(/\s+/g, ' ').trim();

  // Right path: starts at Top-Center (centerX, pad) -> Top-Right -> Right Border -> Bottom-Right -> Bottom-Center
  const rightPathD = `
    M ${centerX} ${pad}
    H ${pad + effW - effR}
    A ${effR} ${effR} 0 0 1 ${pad + effW} ${pad + effR}
    V ${pad + effH - effR}
    A ${effR} ${effR} 0 0 1 ${pad + effW - effR} ${pad + effH}
    H ${centerX}
  `.replace(/\s+/g, ' ').trim();

  const estimatedHalfPerimeter = (effW / 2 - effR) + (Math.PI * effR / 2) + (effH - 2 * effR) + (Math.PI * effR / 2) + (effW / 2 - effR);
  const leftTotalLength = leftPathRef.current ? leftPathRef.current.getTotalLength() : estimatedHalfPerimeter;
  const rightTotalLength = rightPathRef.current ? rightPathRef.current.getTotalLength() : estimatedHalfPerimeter;

  const leftDashOffset = leftTotalLength * (1 - progress);
  const rightDashOffset = rightTotalLength * (1 - progress);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[999999] flex justify-center items-center p-4 animate-[fadeIn_0.3s_ease]">
      {/* Outer wrapper to anchor SVG glow over card borders */}
      <div className={`relative w-full max-w-sm sm:max-w-md transition-all duration-300 ${isCompleted ? 'scale-[1.02]' : 'scale-100'}`}>
        
        {/* Shiny Glowing SVG Border Timer Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          style={{ overflow: 'visible' }}
          viewBox={`0 0 ${cardSize.width} ${cardSize.height}`}
        >
          {/* Subtle dark track groove so the border channel is visible & defined */}
          <path
            d={leftPathD}
            fill="none"
            stroke="rgba(15, 23, 42, 0.2)"
            strokeWidth={strokeWidth + 2.5}
            strokeLinecap="round"
          />
          <path
            d={rightPathD}
            fill="none"
            stroke="rgba(15, 23, 42, 0.2)"
            strokeWidth={strokeWidth + 2.5}
            strokeLinecap="round"
          />

          {/* Layer 1: Neon Violet Aura Underglow (starts from top, streams down borders) */}
          <path
            d={leftPathD}
            fill="none"
            stroke="#a855f7"
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            strokeDasharray={leftTotalLength}
            strokeDashoffset={leftDashOffset}
            opacity="0.85"
            style={{
              filter: 'drop-shadow(0 0 10px #a855f7) drop-shadow(0 0 20px rgba(168, 85, 247, 0.9))',
            }}
          />
          <path
            d={rightPathD}
            fill="none"
            stroke="#a855f7"
            strokeWidth={strokeWidth + 2}
            strokeLinecap="round"
            strokeDasharray={rightTotalLength}
            strokeDashoffset={rightDashOffset}
            opacity="0.85"
            style={{
              filter: 'drop-shadow(0 0 10px #a855f7) drop-shadow(0 0 20px rgba(168, 85, 247, 0.9))',
            }}
          />

          {/* Layer 2: Ultra-Bright Shiny White Laser Core */}
          <path
            ref={leftPathRef}
            d={leftPathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={leftTotalLength}
            strokeDashoffset={leftDashOffset}
            style={{
              filter: 'drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px #ffffff) drop-shadow(0 0 14px rgba(255, 255, 255, 0.9))',
            }}
          />
          <path
            ref={rightPathRef}
            d={rightPathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={rightTotalLength}
            strokeDashoffset={rightDashOffset}
            style={{
              filter: 'drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px #ffffff) drop-shadow(0 0 14px rgba(255, 255, 255, 0.9))',
            }}
          />

          {/* Layer 3: Moving Starburst Heads (left & right tips tracing down borders) */}
          {progress > 0.005 && progress < 0.995 && headPoints.left && (
            <g transform={`translate(${headPoints.left.x}, ${headPoints.left.y})`}>
              <circle r="12" fill="rgba(168, 85, 247, 0.4)" filter="blur(3px)" />
              <circle r="7" fill="rgba(255, 255, 255, 0.85)" filter="blur(1px)" />
              <circle r="4" fill="#ffffff" />
              {/* Radiant spark crosshair */}
              <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-7" x2="0" y2="7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {progress > 0.005 && progress < 0.995 && headPoints.right && (
            <g transform={`translate(${headPoints.right.x}, ${headPoints.right.y})`}>
              <circle r="12" fill="rgba(168, 85, 247, 0.4)" filter="blur(3px)" />
              <circle r="7" fill="rgba(255, 255, 255, 0.85)" filter="blur(1px)" />
              <circle r="4" fill="#ffffff" />
              {/* Radiant spark crosshair */}
              <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-7" x2="0" y2="7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {/* Completion Collision Burst at Bottom Center */}
          {isCompleted && (
            <g transform={`translate(${centerX}, ${pad + effH})`}>
              <circle r="20" fill="rgba(168, 85, 247, 0.6)" filter="blur(6px)" />
              <circle r="12" fill="rgba(255, 255, 255, 0.9)" filter="blur(2px)" />
              <circle r="6" fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* Modal Card */}
        <div
          ref={cardRef}
          className={`relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 ${
            isCompleted ? 'ring-4 ring-white shadow-[0_0_60px_rgba(255,255,255,0.8)]' : 'ring-1 ring-slate-900/10'
          }`}
        >
          {/* Top Red Security Header */}
          <div className="relative bg-gradient-to-br from-red-500 via-rose-500 to-red-600 p-7 flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl pointer-events-none"></div>

            {/* Lock Emblem with glowing ring */}
            <div className="relative w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner ring-4 ring-white/30">
              <i className="fas fa-lock text-3xl text-white drop-shadow-md"></i>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8 sm:p-9 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2.5 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Session Expired
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-7 max-w-xs mx-auto">
              For your security, your session has timed out. Please log in again to continue working.
            </p>

            {/* Log In Again Button */}
            <button
              type="button"
              onClick={redirectToLogin}
              className="w-full relative z-40 cursor-pointer group bg-gradient-to-r from-[#6D4C9C] via-[#7C3AED] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 flex items-center justify-center gap-2.5 text-base"
            >
              <span>Log In Again</span>
              <i className="fas fa-arrow-right text-sm transition-transform group-hover:translate-x-1"></i>
            </button>

            {/* Non-numerical Status Indicator (strictly NO numbers) */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Auto-redirecting to login portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryModal;

