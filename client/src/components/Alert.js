import React from 'react';

// Alert variants: error, success, info, warning
const Alert = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const styles = {
    error:   'bg-red-50   border-red-200   text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info:    'bg-blue-50  border-blue-200  text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  const icons = { error: '❌', success: '✅', info: 'ℹ️', warning: '⚠️' };

  return (
    <div className={`flex items-start gap-2 border rounded-lg p-3 text-sm ${styles[type]}`}>
      <span>{icons[type]}</span>
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none">
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
