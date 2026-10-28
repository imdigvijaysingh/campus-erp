import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-purple-500',
    info: 'bg-[#8B5CF6]',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-[3000] animate-[modalSlideUp_0.3s_ease]`}>
      {type === 'success' && <i className="fas fa-check-circle"></i>}
      {type === 'error' && <i className="fas fa-exclamation-circle"></i>}
      {type === 'info' && <i className="fas fa-info-circle"></i>}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:text-gray-200">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Toast;
