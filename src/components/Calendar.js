import React, { useState, useRef, useEffect } from 'react';

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

function getDaysArray(year, month) {
  // month: 0-based
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  // react-datepicker: неделя начинается с понедельника
  let startWeekDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = 0; i < startWeekDay; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  // добиваем до полного количества недель (6 строк)
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function Calendar({ selectedDate, onDateChange, className = '', scrolled = false, isTodayNavActive = false }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
  const [picked, setPicked] = useState(selectedDate || today);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  const days = getDaysArray(viewYear, viewMonth);

  function isPast(day) {
    if (!day) return false;
    const date = new Date(viewYear, viewMonth, day, 0, 0, 0, 0);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  }

  function isSelected(day) {
    if (!day) return false;
    return (
      picked &&
      picked.getFullYear() === viewYear &&
      picked.getMonth() === viewMonth &&
      picked.getDate() === day
    );
  }

  function handlePick(day) {
    if (!day || isPast(day)) return;
    const date = new Date(viewYear, viewMonth, day);
    setPicked(date);
    onDateChange && onDateChange(date);
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  // Закрытие по клику вне
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Формат даты для кнопки
  const formatPicked = (date) => {
    if (!date) return '';
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  // Проверка: выбрана ли сегодняшняя дата
  const isToday = picked && picked.getFullYear() === today.getFullYear() && picked.getMonth() === today.getMonth() && picked.getDate() === today.getDate();

  const baseStyles = 'font-montserrat px-4 py-3 rounded-md transition-all duration-200';
  const scrolledStyles = 'text-black/70 hover:bg-gray-100 hover:text-black';
  const defaultStyles = 'text-white/90 hover:bg-white/10 hover:text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]';

  // Синхронизация picked/viewYear/viewMonth с selectedDate
  useEffect(() => {
    if (selectedDate) {
      setPicked(selectedDate);
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  return (
    <div className={"relative inline-block " + className}>
      <button
        ref={buttonRef}
        className={[
          baseStyles,
          'min-w-[120px] max-w-[220px] w-auto',
          scrolled ? scrolledStyles : defaultStyles
        ].join(' ')}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {isTodayNavActive ? 'Календарь' : (picked ? `Календарь, ${formatPicked(picked)}` : 'Календарь')}
      </button>
      {open && (
        <div
          ref={popoverRef}
          className="absolute left-0 z-50 mt-2 bg-[#09f] rounded-2xl shadow-xl p-4 w-[320px]"
          style={{ top: '100%', left: '-150px' }}
        >
          {/* Навигация */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="text-white text-2xl px-2 hover:bg-white/20 rounded-full transition"><span>&larr;</span></button>
            <div className="text-white text-xl font-semibold">{MONTHS[viewMonth]} {viewYear}</div>
            <button onClick={nextMonth} className="text-white text-2xl px-2 hover:bg-white/20 rounded-full transition"><span>&rarr;</span></button>
          </div>
          {/* Дни недели */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-white text-[15px] font-bold text-center">{d}</div>
            ))}
          </div>
          {/* Числа */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day, i) => (
              <button
                key={i}
                className={
                  [
                    'w-10 h-10 text-[17px] flex items-center justify-center mx-auto',
                    day ? 'cursor-pointer' : '',
                    isPast(day) ? 'text-white/40 bg-white/10 cursor-not-allowed' : 'text-white hover:bg-white/20',
                    isSelected(day) ? 'bg-white/20 text-[#09f] font-bold' : '',
                    'rounded-full transition'
                  ].join(' ')
                }
                disabled={!day || isPast(day)}
                onClick={() => handlePick(day)}
                style={{ outline: 'none' }}
              >
                {day || ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 