import React from 'react';

const GlobalLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-[modalFadeIn_0.2s_ease]">
      <div className="bg-white px-8 py-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#6D4C9C] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-800 font-semibold tracking-wide text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
