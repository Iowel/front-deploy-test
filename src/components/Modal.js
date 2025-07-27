import React, { useState, useEffect } from 'react';
import SessionStepButton from './sessions';
import { SeatsStepButton } from './SeatsGrid';
import PaymentStepButton, { PaymentStep } from './payment';
import StepConnector from './StepConnector';
import SeatsGrid from './SeatsGrid';
import Loader from './Loader';

// Форматирование цены
const formatPrice = (price) => {
  return `${price} ₽`;
};

// Фильтрация сеансов (копия из TestCards.js)
const filterSessions = (sessions, targetDate) => {
  const now = new Date();
  const targetDateTime = new Date(targetDate + 'T00:00:00');
  const currentTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (targetDateTime > now) return sessions;
  if (targetDateTime.toDateString() === now.toDateString()) {
    return sessions.filter(session => session.time > currentTime);
  }
  return [];
};

// Нормализация даты до YYYY-MM-DD
const normalizeDate = (dateStr) => dateStr.slice(0, 10);

const STATUS = {
  SESSION: 'session',
  SEATS: 'seats',
  PAYMENT: 'payment',
};

const STEPS = [
  { key: STATUS.SESSION, label: 'Сеанс', Button: SessionStepButton },
  { key: STATUS.SEATS, label: 'Места', Button: SeatsStepButton },
  { key: STATUS.PAYMENT, label: 'Оплата', Button: PaymentStepButton },
];

export default function Modal({ open, onClose, movie, session, showStepper = true, modalStyle = {}, contentStyle = {}, allMoviesData, setModalMovie, reopenModalWithAllSessions }) {
  const [status, setStatus] = useState(STATUS.SESSION);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const [details, setDetails] = useState(null);
  const [staff, setStaff] = useState([]);
  const [showMaxSeatsMsg, setShowMaxSeatsMsg] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('sbp'); // 'sbp' | 'card' | 'pushkin'
  const [showCancelPaymentDialog, setShowCancelPaymentDialog] = useState(false);
  const [showCancelSeatsDialog, setShowCancelSeatsDialog] = useState(false);
  const [zoom, setZoom] = useState(1);
  const onZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const onZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.7));

  // Загружаем подробную инфу о фильме по id и staff
  useEffect(() => {
    if (open && movie?.movieId) {
      setDetails(null);
      setStaff([]);
      const cached = localStorage.getItem(`movie_${movie.movieId}`);
      if (cached) {
        setDetails(JSON.parse(cached));
      } else {
        fetch(`/api/get-cache/${movie.movieId}`)
          .then(res => res.json())
          .then(data => {
            setDetails(data);
            try {
              localStorage.setItem(`movie_${movie.movieId}`, JSON.stringify(data));
            } catch (e) { /* ignore quota errors */ }
          })
          .catch(() => setDetails(null));
      }
      fetch(`/api/get-staff/${movie.movieId}`, { 
          headers: {
          
            'Content-Type': 'application/json',
          }
      })
        .then(res => res.json())
        .then(data => setStaff(data))
        .catch(() => setStaff([]));
      }
  }, [open, movie]);

  // seats генерируем динамически для каждого фильма/сеанса
  useEffect(() => {
    if (open && movie) {
      setStatus(session ? STATUS.SEATS : STATUS.SESSION);
      setSelectedSession(session ? session : null);
      setSelectedSeats([]);
      // Ключ для кэша: movieId + date + time
      let cacheKey;
      if (session && session.time) {
        cacheKey = `seats_${movie.movieId}_${session.date}_${session.time}`;
      } else {
        cacheKey = `seats_${movie.movieId}_default`;
      }
      let cachedSeats = JSON.parse(localStorage.getItem(cacheKey));
      if (!cachedSeats) {
        // Создаем массив всех мест, с случайными занятыми местами
        cachedSeats = Array.from({ length: 9 * 14 }, (_, i) => ({
          row: Math.floor(i / 14) + 1,
          seat: (i % 14) + 1,
          taken: Math.random() < 0.2 // 20% шанс что место занято
        }));
        localStorage.setItem(cacheKey, JSON.stringify(cachedSeats));
      }
      setSeats(cachedSeats);
    }
  }, [open, movie, session]);

  if (!open || !movie) return null;

  // Если movieId отсутствует или 0 — кастомная модалка (например, из карусели новостей)
  if (!movie.movieId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="relative bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadein" style={modalStyle}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black text-3xl font-bold z-10 md:top-6 md:right-8"
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
          {/* Пустой блок для ручного заполнения */}
          <div style={{ textAlign: 'left', color: '#888', fontSize: 22, width: '100%', ...contentStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Text content with padding */}
            <div style={{
              padding: '0',
              fontSize: 18,
              color: '#222',
              fontWeight: 500,
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box',
              marginTop: 16,
            }}>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#111' }}>{movie.nameRu}</h2>
              {/* Use dangerouslySetInnerHTML to render HTML content */}
              <div 
                style={{ fontSize: 16, lineHeight: 1.6, color: '#111' }}
                dangerouslySetInnerHTML={{ __html: movie.description }}
              >
              </div>
            </div>
            {/* Image with specific size and margin */}
            <img 
              src={movie.posterUrl} 
              alt={movie.nameRu}
              style={{
                width: 800, // New width
                height: 400, // New height
                objectFit: 'cover',
                marginTop: 30, // 30px gap below text
                borderRadius: 20, // Keep rounded corners for the image in modal
              }} 
            />
          </div>
        </div>
      </div>
    );
  }

  // UI helpers
  const statusColor = {
    [STATUS.SESSION]: 'bg-blue-600 hover:bg-blue-700',
    [STATUS.SEATS]: 'bg-emerald-600 hover:bg-emerald-700',
    [STATUS.PAYMENT]: 'bg-orange-600 hover:bg-orange-700',
  };

  // Новый способ: вычисляем индекс активного шага
  const activeStep = STEPS.findIndex(s => s.key === status);

  // Смена статуса по кнопкам
  const handleSessionClick = (sessionObj) => {
    setSelectedSession(sessionObj);
    setStatus(STATUS.SEATS);
  };
  const handleToPayment = () => setStatus(STATUS.PAYMENT);
  const handleBack = () => {
    if (status === STATUS.SEATS) {
      setStatus(STATUS.SESSION);
      setSelectedSession(null);
      // Гарантированно пересоздаём modalMovie с актуальными allSessions через функцию из TestCards
      if (reopenModalWithAllSessions && movie && movie.movieId) {
        reopenModalWithAllSessions(movie.movieId);
      }
    }
    if (status === STATUS.PAYMENT) setStatus(STATUS.SEATS);
  };

  // Получаем список сеансов для фильма
  // movie.times — массив времён, но нет дат и цен, поэтому делаем фейковые
  const sessionList = movie.times.map((time) => ({
    date: '',
    time,
    price: 520, // можно доработать, если надо
  }));

  // Добавляю функцию генерации цены
  function getRandomPrice() {
    const prices = [320, 420, 520, 620, 720, 820, 920];
    return prices[Math.floor(Math.random() * prices.length)] + ' ₽';
  }

  // Функция форматирования длительности
  function formatDuration(mins) {
    if (!mins || isNaN(mins)) return 'длительность: 1 час 20 минут';
    if (mins < 60) return `длительность: ${mins} минут`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `длительность: ${h} ${h === 1 ? 'час' : (h < 5 ? 'часа' : 'часов')}${m ? ` ${m} минут` : ''}`;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={e => {
        if (e.target === e.currentTarget) {
          if (status === STATUS.PAYMENT) {
            setShowCancelPaymentDialog(true);
          } else {
            onClose();
          }
        }
      }}
    >
      <div
        className="relative bg-[#f9fafb] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-fadein w-full max-w-[98vw] md:max-w-[1360px] max-h-[95vh] overflow-y-auto pr-6 box-border"
        style={{ minWidth: 320, border: '1.5px solid #e0e7ef', boxShadow: '0 8px 40px rgba(59,130,246,0.10)' }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={() => {
            if (status === STATUS.PAYMENT) {
              setShowCancelPaymentDialog(true);
            } else {
              onClose();
            }
          }}
          className="absolute text-gray-400 hover:text-black text-3xl font-bold z-10"
          style={{ top: 24, right: 24, lineHeight: 1 }}
        >
          ×
        </button>
        {/* Loader поверх модалки при загрузке деталей */}
        {(!details || staff.length === 0) && <Loader overlay />}
        {/* Кнопки-шаги */}
        {showStepper && (
          <div className="flex flex-row items-center absolute left-[40px] top-[40px] z-20">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStep;
              const isDone = idx < activeStep;
              const isFuture = idx > activeStep;
              const leftStatus = idx === 0 ? 'not-started' : (idx - 1 < activeStep ? 'done' : (idx - 1 === activeStep ? 'active' : 'not-started'));
              const rightStatus = idx < activeStep ? 'done' : (idx === activeStep ? 'active' : 'not-started');
              const Button = step.Button;
              const isSeatsBlurred = status === STATUS.PAYMENT && step.key === STATUS.SEATS;
              const isSessionDisabled = session && step.key === STATUS.SESSION;
              return <React.Fragment key={step.key}>
                <Button
                  isActive={isActive}
                  isDone={isDone}
                  onClick={() => !isFuture && !isSessionDisabled && setStatus(step.key)}
                  disabled={isFuture || isSessionDisabled}
                  isBlurred={isSeatsBlurred}
                />
                {idx < STEPS.length - 1 && (
                  <div style={{ width: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StepConnector leftStatus={rightStatus} rightStatus={STEPS[idx + 1].key === status ? 'active' : (idx + 1 < activeStep ? 'done' : 'not-started')} isBlurred={status === STATUS.PAYMENT && step.key === STATUS.SEATS} />
                  </div>
                )}
              </React.Fragment>;
            })}
          </div>
        )}
        {/* Правая часть (рамки сеансов) */}
        {showStepper && (
          <div style={{
            position: 'absolute',
            top: 90,
            right: 12,
            minWidth: 365,
            zIndex: 2
          }}>
            {status === 'session' && movie.allSessions && (
              <div className="flex flex-col items-start min-w-[365px]">
                <div className="text-[18px] text-black font-semibold mb-2">
                  Ближайшие сеансы
                </div>
                <div className="w-[365px] flex flex-col gap-[70px]">
                  {movie.allSessions && movie.allSessions.length > 0 ? (
                    // Фильтруем только на сегодня и завтра
                    (() => {
                      // Удаляем дубли по (date, time)
                      const uniqueSessions = [];
                      const seen = new Set();
                      for (const s of movie.allSessions) {
                        const key = s.date + '_' + s.time;
                        if (!seen.has(key)) {
                          uniqueSessions.push(s);
                          seen.add(key);
                        }
                      }
                      // Группируем по нормализованной дате
                      const sessionsByDate = uniqueSessions.reduce((acc, s) => {
                        const normDate = normalizeDate(s.date);
                        if (!acc[normDate]) acc[normDate] = [];
                        acc[normDate].push(s);
                        return acc;
                      }, {});
                      // Универсально: ближайшие две даты >= сегодня
                      const todayStr = normalizeDate(new Date().toISOString());
                      const allDates = Object.keys(sessionsByDate).sort();
                      const filteredDates = allDates.filter(date => date >= todayStr).slice(0, 2);
                      if (filteredDates.length === 0) return <div className="text-gray-400 text-sm mt-8">Нет сеансов</div>;
                      return filteredDates.map(date => {
                        let sessions = sessionsByDate[date];
                        // Для сегодня фильтруем по времени
                        if (date === todayStr) {
                          sessions = filterSessions(sessions, date);
                        }
                        if (!sessions.length) return null;
                        const d = new Date(date);
                        const day = d.toLocaleDateString('ru-RU', { weekday: 'long' });
                        const dayNum = d.getDate();
                        const month = d.toLocaleDateString('ru-RU', { month: 'long' });
                        const prettyDate = `${day.charAt(0).toUpperCase() + day.slice(1)}, ${dayNum} ${month}`;
                        return (
                          <div key={date} className="mb-1">
                            <div className="text-[15px] font-semibold mb-[20px] text-black">{prettyDate}</div>
                            <div className="w-[365px] border border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-y-2 bg-white/80 mb-2">
                              <div className="flex flex-wrap gap-x-[30px] w-full justify-center mt-2 mb-2">
                                {sessions.map((s) => (
                                  <div
                                    key={date + s.time}
                                    className="cursor-pointer flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                                    style={{
                                      height: 72,
                                      borderRadius: 18,
                                      maxWidth: 88,
                                      width: 88,
                                      background: 'linear-gradient(135deg, #f6f8fa 0%, #e0e7ef 100%)',
                                      boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
                                      border: '1.5px solid #e0e7ef',
                                      transition: 'background 0.2s, box-shadow 0.2s',
                                    }}
                                    onClick={() => {
                                      const sessionObj = (movie.allSessions || []).find(ss => normalizeDate(ss.date) === date && ss.time === s.time);
                                      setSelectedSession({ date, time: s.time, price: sessionObj?.price || 520 });
                                      setStatus('seats');
                                      // Сохраняем занятые места для этого сеанса
                                      const cacheKey = `seats_${movie.movieId}_${date}_${s.time}`;
                                      const cachedSeats = localStorage.getItem(cacheKey);
                                      if (cachedSeats) {
                                        setSeats(JSON.parse(cachedSeats));
                                      }
                                    }}
                                  >
                                    <span style={{ color: '#111', fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px' }}>{s.time}</span>
                                    <span style={{ color: '#111', fontSize: 15, marginTop: 8, fontWeight: 500 }}>{formatPrice(((movie.allSessions || []).find(ss => normalizeDate(ss.date) === date && ss.time === s.time)?.price) || 520)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()
                  ) : (
                    <div className="text-gray-400 text-sm mt-8">Нет сеансов</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Основной контент */}
        {showStepper ? (
          status === 'session' ? (
            <div className="flex flex-row gap-10 w-full pt-[100px] pl-[40px] pr-[40px]">
              {/* Постер */}
              <div className="w-[280px] h-[435px] rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img
                  src={movie.posterUrl}
                  alt={movie.nameRu}
                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
                />
              </div>
              {/* Инфоблок */}
              <div className="flex flex-col max-w-[520px] w-full" style={{marginLeft: '-20px'}}>
                {/* Название */}
                <div className="text-[32px] font-bold mb-0 leading-tight break-words" style={{color:'#111'}}>{movie.nameRu}</div>
                {/* Страна и длительность */}
                <div className="text-[18px] mt-[8px] mb-0 leading-snug break-words" style={{color:'#6b7280'}}>
                  {details?.countries?.map(c => c.country).join(', ') || '—'}{details?.filmLength ? `, ${details.filmLength} минут` : ''}
                </div>
                {/* Жанр */}
                <div className="text-[18px] mt-[5px] mb-0 leading-snug break-words" style={{color:'#6b7280'}}>
                  {movie.genres.map((g) => g.genre).join(', ')}
                </div>
                {/* Возрастной рейтинг */}
                <div className="mt-[12px] mb-0">
                  <div className="w-[50px] h-[40px] bg-[#f6f8fa] rounded-xl flex items-center justify-center shadow text-[22px] font-bold border border-[#e0e7ef]" style={{color:'#3b82f6'}}>
                    {details?.ratingAgeLimits ? details.ratingAgeLimits.replace(/[^0-9]/g, '') : '—'}
                  </div>
                </div>
                {/* Режиссёр */}
                <div className="flex items-center mt-[18px]">
                  <span className="text-[18px] min-w-[140px]" style={{color:'#6b7280'}}>Режиссер</span>
                  <span className="text-[18px] capitalize break-words" style={{color:'#111'}}>{staff.find(p => p.professionKey === 'DIRECTOR')?.nameRu || '—'}</span>
                </div>
                {/* В главных ролях */}
                <div className="flex items-center mt-[12px]">
                  <span className="text-[18px] min-w-[140px]" style={{color:'#6b7280'}}>В главных ролях</span>
                  <span className="text-[18px] capitalize" style={{maxWidth: 400, display: 'inline-block', whiteSpace: 'normal', wordBreak: 'break-word', color:'#111'}}>
                    {staff.filter(p => p.professionKey === 'ACTOR').slice(0, 3).map(a => a.nameRu).join(', ') || '—'}
                  </span>
                </div>
                {/* Описание */}
                <div className="mt-[24px] text-[16px] leading-relaxed" style={{maxWidth: 520, color:'#111'}}>
                  {details?.description || '—'}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center pt-[120px] px-[40px]" style={{ minHeight: 700, position: 'relative' }}>
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
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-start', width: '100%', marginLeft: 40 }}>
                {/* Контейнер для одновременного блюра */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', filter: status === 'payment' ? 'blur(1px)' : undefined, pointerEvents: status === 'payment' ? 'none' : undefined }}>
                  {/* Рамка с сеткой мест */}
                  <div style={{ width: 700, height: 540, border: '1.5px solid #e0e7ef', borderRadius: 18, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <SeatsGrid seats={seats} setSeats={setSeats} onChangeSelectedSeats={setSelectedSeats} selectedSeats={selectedSeats} zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} movie={movie} selectedSession={selectedSession} />
                  </div>
                  {/* Инфоблок справа вне рамки, но по высоте с рамкой */}
                  <div style={{ marginLeft: 30, minWidth: 220, maxWidth: 320, height: 540, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                    <div style={{ color: '#111', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{movie.nameRu}</div>
                    <div style={{ color: '#6b7280', fontSize: 16, marginBottom: 18 }}>
                      {formatDuration(details?.filmLength || 80)}
                    </div>
                    <div style={{ color: '#222', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Выбранные места:</div>
                    <div style={{ width: '100%', background: '#f6f8fa', borderRadius: 12, padding: 8, minWidth: 180 }}>
                      {selectedSeats.length > 0 ? selectedSeats.map((s, idx) => (
                        <div key={s.row + '-' + s.seat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: idx !== selectedSeats.length - 1 ? '1px solid #e0e7ef' : 'none', padding: '8px 0' }}>
                          <div>
                            <div style={{ color: '#111', fontSize: 18, fontWeight: 600 }}>{s.row} ряд, {s.seat} место</div>
                            <div style={{ color: '#6b7280', fontSize: 16, marginTop: 2 }}>{formatPrice(selectedSession.price)}</div>
                          </div>
                          <button onClick={() => setSelectedSeats(selectedSeats.filter(x => !(x.row === s.row && x.seat === s.seat)))} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 12 }}>
                            <svg width="24" height="24" fill="none" stroke="#b0b0b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="8" width="12" height="10" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M10 12v4"/><path d="M14 12v4"/></svg>
                          </button>
                        </div>
                      )) : <div style={{ color: '#b0b0b0', fontSize: 16, padding: 8 }}>—</div>}
                    </div>
                  </div>
                </div>
                {/* Кнопки зума не блюрятся */}
                <div style={{ position: 'absolute', right: 18, top: 18 }}>
                  {/* Можно вынести кнопки зума из SeatsGrid, если они там */}
                </div>
              </div>
              {/* Кнопка Далее — только если есть выбранные места и не на шаге оплаты */}
              {selectedSeats.length > 0 && status !== 'payment' && (
                <button
                  onClick={handleToPayment}
                  style={{
                    position: 'absolute',
                    bottom: 15,
                    left: '50%',
                    transform: 'translateX(130px)',
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 600,
                    borderRadius: 16,
                    padding: '16px 64px',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.10)',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 30
                  }}
                >
                  Далее
                </button>
              )}
            </div>
          )
        ) : (
          // Только инфоблок о фильме (без степпера и шагов)
          <div className="flex flex-row gap-10 w-full" style={{ padding: 40 }}>
            {/* Постер */}
            <div className="w-[280px] h-[435px] rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
              <img
                src={movie.posterUrl}
                alt={movie.nameRu}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105 cursor-pointer"
              />
            </div>
            {/* Инфоблок */}
            <div className="flex flex-col max-w-[520px] w-full" style={{marginLeft: '-20px'}}>
              {/* Название */}
              <div className="text-[32px] font-bold mb-0 leading-tight break-words" style={{color:'#111'}}>{movie.nameRu}</div>
              {/* Страна и длительность */}
              <div className="text-[18px] mt-[8px] mb-0 leading-snug break-words" style={{color:'#6b7280'}}>
                {details?.countries?.map(c => c.country).join(', ') || '—'}{details?.filmLength ? `, ${details.filmLength} минут` : ''}
              </div>
              {/* Жанр */}
              <div className="text-[18px] mt-[5px] mb-0 leading-snug break-words" style={{color:'#6b7280'}}>
                {(movie.genres || []).map((g) => g.genre).join(', ')}
              </div>
              {/* Возрастной рейтинг */}
              <div className="mt-[12px] mb-0">
                <div className="w-[50px] h-[40px] bg-[#f6f8fa] rounded-xl flex items-center justify-center shadow text-[22px] font-bold border border-[#e0e7ef]" style={{color:'#3b82f6'}}>
                  {details?.ratingAgeLimits ? details.ratingAgeLimits.replace(/[^0-9]/g, '') : '—'}
                </div>
              </div>
              {/* Режиссёр */}
              <div className="flex items-center mt-[18px]">
                <span className="text-[18px] min-w-[140px]" style={{color:'#6b7280'}}>Режиссер</span>
                <span className="text-[18px] capitalize break-words" style={{color:'#111'}}>{staff.find(p => p.professionKey === 'DIRECTOR')?.nameRu || '—'}</span>
              </div>
              {/* В главных ролях */}
              <div className="flex items-center mt-[12px]">
                <span className="text-[18px] min-w-[140px]" style={{color:'#6b7280'}}>В главных ролях</span>
                <span className="text-[18px] capitalize" style={{maxWidth: 400, display: 'inline-block', whiteSpace: 'normal', wordBreak: 'break-word', color:'#111'}}>
                  {(staff.filter(p => p.professionKey === 'ACTOR').slice(0, 3).map(a => a.nameRu).join(', ')) || '—'}
                </span>
              </div>
              {/* Описание */}
              <div style={{ flex: 1, maxWidth: 600, paddingTop: 20 }}>
                <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, color: '#111' }}>{movie.nameRu}</h2>
                {/* Use dangerouslySetInnerHTML to render HTML content */}
                <div 
                  style={{ fontSize: 16, lineHeight: 1.6, color: '#111' }}
                  dangerouslySetInnerHTML={{ __html: movie.description }}
                >
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Overlay для оплаты */}
        {status === STATUS.PAYMENT && selectedSeats.length > 0 && (
          <PaymentStep
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
            onClose={onClose}
            selectedSeats={selectedSeats}
            selectedSession={selectedSession}
            movie={movie}
          />
        )}
        {showCancelSeatsDialog && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30" style={{backdropFilter: 'blur(2px)'}}>
            <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center max-w-[350px] w-full">
              <div className="mb-4">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="22" r="22" fill="#FFEB3B"/>
                  <path d="M22 13v11" stroke="#FFB300" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="22" cy="30" r="2" fill="#FFB300"/>
                </svg>
              </div>
              <div className="text-[22px] font-semibold text-black mb-2 text-center">Отменить оплату?</div>
              <div className="text-gray-400 text-[16px] mb-6 text-center">Заказ будет удален, а занятые места станут свободными.</div>
              <div className="flex flex-row gap-4 w-full justify-between">
                <button
                  className="text-blue-500 text-[18px] font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                  style={{minWidth: 80}}
                  onClick={() => setShowCancelSeatsDialog(false)}
                >Нет</button>
                <button
                  className="bg-blue-500 text-white text-[18px] font-medium px-8 py-2 rounded-lg hover:bg-blue-600 transition"
                  style={{minWidth: 100}}
                  onClick={() => {
                    setShowCancelSeatsDialog(false);
                    onClose();
                  }}
                >Да</button>
              </div>
            </div>
          </div>
        )}
        {showCancelPaymentDialog && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30" style={{backdropFilter: 'blur(2px)'}}>
            <div className="bg-white rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center max-w-[350px] w-full">
              <div className="mb-4">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="22" cy="22" r="22" fill="#FFEB3B"/>
                  <path d="M22 13v11" stroke="#FFB300" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="22" cy="30" r="2" fill="#FFB300"/>
                </svg>
              </div>
              <div className="text-[22px] font-semibold text-black mb-2 text-center">Отменить оплату?</div>
              <div className="text-gray-400 text-[16px] mb-6 text-center">Заказ будет удален, а занятые места станут свободными.</div>
              <div className="flex flex-row gap-4 w-full justify-between">
                <button
                  className="text-blue-500 text-[18px] font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                  style={{minWidth: 80}}
                  onClick={() => setShowCancelPaymentDialog(false)}
                >Нет</button>
                <button
                  className="bg-blue-500 text-white text-[18px] font-medium px-8 py-2 rounded-lg hover:bg-blue-600 transition"
                  style={{minWidth: 100}}
                  onClick={() => {
                    setShowCancelPaymentDialog(false);
                    onClose();
                  }}
                >Да</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 

