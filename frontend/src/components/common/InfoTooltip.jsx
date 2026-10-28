import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Info Tooltip / Popover ("i" button)
 * Rendered via React Portal at z-[99999] with intelligent viewport auto-flip
 * so it is ALWAYS on the top layer and never obscured by sticky navbars, tables, or cards.
 */
const InfoTooltip = ({ title, text, tip, position = 'top' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, actualPosition: position, arrowLeft: 144 });
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 288; // w-72 = 18rem = 288px
    const tooltipEstimatedHeight = 160;
    const margin = 8;
    const navbarThreshold = 72; // height of sticky top navbar + buffer
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let chosenPosition = position;

    // Smart vertical auto-flip:
    // If set to 'top' but not enough headroom under the sticky navbar, flip to 'bottom'
    if (position === 'top' && (rect.top - navbarThreshold < tooltipEstimatedHeight + margin)) {
      chosenPosition = 'bottom';
    } else if (position === 'bottom' && (viewportHeight - rect.bottom < tooltipEstimatedHeight + margin) && (rect.top - navbarThreshold > tooltipEstimatedHeight + margin)) {
      chosenPosition = 'top';
    }

    let top = 0;
    if (chosenPosition === 'bottom') {
      top = rect.bottom + margin;
    } else if (chosenPosition === 'top') {
      top = rect.top - tooltipEstimatedHeight - margin;
    } else {
      top = rect.top + rect.height / 2 - tooltipEstimatedHeight / 2;
    }

    // Horizontal alignment with boundary clamping
    const idealLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const minLeft = 12;
    const maxLeft = Math.max(minLeft, viewportWidth - tooltipWidth - 12);
    const left = Math.max(minLeft, Math.min(maxLeft, idealLeft));

    // Arrow pointer position relative to tooltip left edge
    const arrowLeft = Math.max(16, Math.min(tooltipWidth - 16, (rect.left + rect.width / 2) - left));

    setCoords({
      top,
      left,
      actualPosition: chosenPosition,
      arrowLeft
    });
  }, [position]);

  // Refine exact top position once tooltip is measured in the DOM
  useEffect(() => {
    if (isOpen && tooltipRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const actualHeight = tooltipRef.current.offsetHeight;
      if (coords.actualPosition === 'top') {
        const exactTop = rect.top - actualHeight - 8;
        if (Math.abs(exactTop - coords.top) > 1) {
          setCoords((prev) => ({ ...prev, top: exactTop }));
        }
      }
    }
  }, [isOpen, coords.actualPosition, coords.top]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    calculatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  const handleTooltipMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, calculatePosition]);

  return (
    <div className="relative inline-flex items-center ml-1.5" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label="More Information"
        title="Click or hover to learn what this does"
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-serif transition cursor-pointer select-none shadow-xs active:scale-95 ${
          isOpen
            ? 'bg-[#6D4C9C] text-white ring-2 ring-[#6D4C9C]/30'
            : 'bg-purple-50 text-[#6D4C9C] hover:bg-[#6D4C9C] hover:text-white border border-purple-200'
        }`}
      >
        i
      </button>

      {/* Popover Bubble rendered via React Portal directly into document.body */}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999
            }}
            className="w-72 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-left transition-opacity duration-150 pointer-events-auto animate-[modalFadeIn_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center gap-1.5 font-bold text-xs text-purple-300 pb-1.5 mb-1.5 border-b border-slate-800">
                <i className="fas fa-circle-question text-purple-400"></i>
                <span>{title}</span>
              </div>
            )}
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {text}
            </p>
            {tip && (
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[11px] text-amber-300 font-medium flex items-start gap-1">
                <span className="shrink-0 font-bold">💡 Tip:</span>
                <span>{tip}</span>
              </div>
            )}

            {/* Micro arrow indicator */}
            <div
              style={{
                left: `${coords.arrowLeft}px`,
                transform: 'translateX(-50%) rotate(45deg)'
              }}
              className={`absolute w-2.5 h-2.5 bg-slate-900/95 border-slate-700/80 ${
                coords.actualPosition === 'bottom'
                  ? '-top-1.25 border-l border-t'
                  : '-bottom-1.25 border-r border-b'
              }`}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default InfoTooltip;
