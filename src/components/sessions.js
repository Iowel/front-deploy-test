import React from 'react';

export default function SessionStepButton({ isActive, isDone, onClick, disabled }) {
  let colorClass = 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100';
  if (isDone) colorClass = 'bg-emerald-500 text-white border-emerald-500 shadow';
  else if (isActive) colorClass = 'bg-blue-600 text-white border-blue-600 shadow';
  return (
    <button
      className={
        'px-5 py-1 rounded-full border text-[15px] font-medium transition-all ' + colorClass
      }
      style={{ minWidth: 80, outline: 'none' }}
      onClick={onClick}
      disabled={disabled}
    >
      Сеанс
    </button>
  );
} 