import React, { useState, useEffect } from 'react';

export default function SeatsGrid({ seats, setSeats, onChangeSelectedSeats, zoom = 1, onZoomIn, onZoomOut, isBlurred = false, selectedSeats = [], movie, selectedSession }) {
  // 9 рядов, 14 мест в ряду
  const rows = 9;
  const cols = 14;
  const seatSize = 32 * zoom;
  const seatGap = 4 * zoom;

  const [localSelectedSeats, setLocalSelectedSeats] = useState([]);
  const [showMaxSeatsMsg, setShowMaxSeatsMsg] = useState(false);

  useEffect(() => {
    setLocalSelectedSeats(selectedSeats);
  }, [selectedSeats]);

  useEffect(() => {
    const cacheKey = `seats_${movie.movieId}_${selectedSession.date}_${selectedSession.time}`;
    const cachedSeats = JSON.parse(localStorage.getItem(cacheKey));
    if (cachedSeats) {
      setSeats(cachedSeats);
    }
  }, [selectedSession]);

  const handleSeatClick = (seat) => {
    if (seat.taken) return;
    const isSelected = localSelectedSeats.some((s) => s.row === seat.row && s.seat === seat.seat);
    if (!isSelected && localSelectedSeats.length >= 5) {
      setShowMaxSeatsMsg(true);
      setTimeout(() => setShowMaxSeatsMsg(false), 1800);
      return;
    }
    const newSelected = isSelected
      ? localSelectedSeats.filter((s) => !(s.row === seat.row && s.seat === seat.seat))
      : [...localSelectedSeats, seat];
    setLocalSelectedSeats(newSelected);
    if (onChangeSelectedSeats) onChangeSelectedSeats(newSelected);
  };

  return (
    <div style={{ position: 'relative', width: cols * (seatSize + seatGap) + 140, background: '#fff', borderRadius: 18, paddingTop: 0, filter: isBlurred ? 'blur(1px)' : undefined, pointerEvents: isBlurred ? 'none' : undefined }}>
      {/* Сообщение о лимите мест */}
      {showMaxSeatsMsg && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ef4444',
            color: '#fff',
            fontWeight: 700,
            fontSize: 20,
            borderRadius: 10,
            padding: '12px 36px',
            zIndex: 50,
            boxShadow: '0 2px 12px rgba(239,68,68,0.10)',
            opacity: showMaxSeatsMsg ? 1 : 0,
            transition: 'opacity 0.4s',
            border: '2px solid #fff',
            marginBottom: 10,
            pointerEvents: 'none',
          }}
        >
          Максимум 5 мест
        </div>
      )}
      {/* Надпись "Сцена" по центру */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 18, marginBottom: 8 }}>
        <span style={{ color: '#bbb', fontSize: 28 * zoom, fontWeight: 'bold', letterSpacing: 2 }}>Сцена</span>
      </div>
      {/* Сетка мест с номерами рядов и зумом */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
        {/* Номера рядов слева */}
        <div style={{ display: 'flex', flexDirection: 'column', marginRight: 8 }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ height: seatSize + seatGap, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 500, fontSize: 16 * zoom }}>{i + 1}</div>
          ))}
        </div>
        {/* Места */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex', flexDirection: 'row', marginBottom: seatGap }}>
              {Array.from({ length: cols }).map((_, seatIdx) => {
                const seat = seats.find(s => s.row === rowIdx + 1 && s.seat === seatIdx + 1);
                const isSelected = localSelectedSeats.some(s => s.row === rowIdx + 1 && s.seat === seatIdx + 1);
                return (
                  <div
                    key={seatIdx}
                    onClick={() => seat && !seat.taken && handleSeatClick(seat)}
                    style={{
                      width: seatSize,
                      height: seatSize,
                      margin: seatGap / 2,
                      borderRadius: 8 * zoom,
                      background: seat?.taken ? '#e5e7eb' : isSelected ? '#34d399' : '#60a5fa',
                      border: isSelected ? `${2 * zoom}px solid #059669` : `1.5px solid #d1d5db`,
                      cursor: seat?.taken ? 'not-allowed' : 'pointer',
                      opacity: seat?.taken ? 0.5 : 1,
                      transition: 'background 0.2s, border 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Можно добавить номер места */}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Номера рядов справа */}
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 8 }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ height: seatSize + seatGap, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 500, fontSize: 16 * zoom }}>{i + 1}</div>
          ))}
        </div>
        {/* Кнопки зума */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginLeft: 18 }}>
          <button
            onClick={onZoomIn}
            disabled={zoom >= 1.5}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: zoom >= 1.5 ? '#e5e7eb' : '#f3f3f3',
              border: 'none',
              fontSize: 28,
              color: '#444',
              boxShadow: '0 1px 4px #0001',
              cursor: zoom >= 1.5 ? 'not-allowed' : 'pointer',
              marginBottom: 6,
              transition: 'background 0.2s',
              opacity: zoom >= 1.5 ? 0.5 : 1
            }}
          >+
          </button>
          <button
            onClick={onZoomOut}
            disabled={zoom <= 0.7}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: zoom <= 0.7 ? '#e5e7eb' : '#f3f3f3',
              border: 'none',
              fontSize: 28,
              color: '#444',
              boxShadow: '0 1px 4px #0001',
              cursor: zoom <= 0.7 ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: zoom <= 0.7 ? 0.5 : 1
            }}
          >–
          </button>
        </div>
      </div>
    </div>
  );
}

export function SeatsStepButton({ isActive, isDone, onClick, disabled, isBlurred }) {
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
      Места
    </button>
  );
} 