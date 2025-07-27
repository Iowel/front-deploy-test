import React from 'react';

export default function StepConnector({ leftStatus, rightStatus, isBlurred }) {
  // leftStatus/rightStatus: 'not-started' | 'active' | 'done'
  // Синий: #2563eb, Зелёный: #10b981, Серый: #e5e7eb
  // Блюр не применяем к полоске, только к основному контенту
  return (
    <div className="relative flex items-center" style={{ width: 75, height: 5 }}>
      {/* Базовая полоска */}
      <div className="absolute left-0 top-0 w-full h-full rounded-full shadow-md bg-gray-200" />
      {/* Цветная часть */}
      {leftStatus === 'done' ? (
        <div className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 shadow-md" style={{ width: '100%' }} />
      ) : rightStatus === 'active' ? (
        <div className="absolute left-0 top-0 h-full rounded-full bg-blue-600 shadow-md" style={{ width: '60%' }} />
      ) : null}
    </div>
  );
} 