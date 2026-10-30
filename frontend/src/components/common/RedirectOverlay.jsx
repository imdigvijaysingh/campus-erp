import React from 'react';

const RedirectOverlay = ({ message = "Logging in..." }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-[99999] flex flex-col items-center justify-center animate-[modalFadeIn_0.3s_ease]">
      <div className="w-16 h-16 border-4 border-white/20 border-t-[#6D4C9C] rounded-full animate-spin mb-6"></div>
      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wider animate-pulse text-center px-4">
        {message}
      </h2>
    </div>
  );
};

export default RedirectOverlay;
