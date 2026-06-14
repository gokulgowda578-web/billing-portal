import React from 'react';

const Spinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}
      />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};

export default Spinner;
