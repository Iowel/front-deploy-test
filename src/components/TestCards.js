import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Modal from './Modal';

// Форматирование цены
const formatPrice = (price) => {
  return `${price} ₽`;
};

// Фильтрация сеансов
const filterSessions = (sessions, targetDate) => {
  const now = new Date();
  const targetDateTime = new Date(targetDate + 'T00:00:00');
  const currentTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  // Если дата в будущем, показываем все сеансы
  if (targetDateTime > now) {
    return sessions;
  }
  
  // Если сегодня, фильтруем по времени
  if (targetDateTime.toDateString() === now.toDateString()) {
    return sessions.filter(session => session.time > currentTime);
  }
  
  // Если дата в прошлом, не показываем сеансы
  return [];
};

function getRandomPrice(time) {
  // Фиксированные цены в зависимости от времени сеанса
  if (time === '10:00') return '400 ₽';
  if (time === '13:30' || time === '17:00') return '600 ₽';
  if (time === '20:30' || time === '22:00') return '800 ₽';
  return '400 ₽'; // fallback
}

function generateRandomSessions() {
  const startTime = 10; // 10:00
  const endTime = 23; // 23:00
  const sessionDuration = 2; // 2 hours per session
  const maxSessions = 4;
  
  // Generate all possible time slots
  const timeSlots = [];
  for (let hour = startTime; hour < endTime - sessionDuration; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push({
        hour,
        minute,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      });
    }
  }
  
  // Shuffle time slots
  for (let i = timeSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [timeSlots[i], timeSlots[j]] = [timeSlots[j], timeSlots[i]];
  }
  
  // Take first N slots and sort them
  const selectedSlots = timeSlots.slice(0, maxSessions).sort((a, b) => {
    if (a.hour === b.hour) return a.minute - b.minute;
    return a.hour - b.hour;
  });
  
  // Generate sessions with prices based on time
  return selectedSlots.map(slot => {
    let price;
    const hour = parseInt(slot.time.split(':')[0], 10);

    // Define price tiers based on hour
    if (hour < 14) { // Before 2 PM
      const possiblePrices = [200, 250, 300, 350];
      price = possiblePrices[Math.floor(Math.random() * possiblePrices.length)];
    } else if (hour >= 14 && hour < 18) { // 2 PM to before 6 PM
      const possiblePrices = [350, 400, 430, 450, 500];
      price = possiblePrices[Math.floor(Math.random() * possiblePrices.length)];
    } else { // 6 PM onwards
      const possiblePrices = [500, 550, 600];
      price = possiblePrices[Math.floor(Math.random() * possiblePrices.length)];
    }

    return {
      time: slot.time,
      price
    };
  });
}

const TestCards = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMovie, setModalMovie] = useState(null);
  const [modalSession, setModalSession] = useState(null);
  const [initialStep, setInitialStep] = useState(0);
  const [visibleMovies, setVisibleMovies] = useState([]);
  const observer = useRef();
  const lastMovieElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const newMovies = movies.slice(0, visibleMovies.length + 2);
        setVisibleMovies(newMovies);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, movies, visibleMovies.length]);

  // Расписание сеансов с ценами
  const SESSIONS_SCHEDULE = generateRandomSessions();
  
  // Получаем текущее время в локальном часовом поясе
  const getCurrentLocalTime = () => {
    return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Получаем дату в формате YYYY-MM-DD из локальной даты
  const getDateFromLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Получаем начало текущего дня в локальном времени
  const getTodayLocal = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  // Получаем начало завтрашнего дня в локальном времени
  const getTomorrowLocal = () => {
    const today = getTodayLocal();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  };
  
  // Всегда строим WEEK_DATES и ALL_MOVIES_DATA от system today
  const todayLocal = getTodayLocal();
  const todayFormatted = getDateFromLocal(todayLocal);
  const tomorrowFormatted = getDateFromLocal(getTomorrowLocal());
  const WEEK_DATES = Array.from({length: 7}, (_, i) => {
    const date = new Date(todayLocal);
    date.setDate(todayLocal.getDate() + i);
    return getDateFromLocal(date);
  });

  const [allMoviesData, setAllMoviesData] = useState({});
  const [currentDate, setCurrentDate] = useState(todayFormatted);

  // Эффект для отслеживания смены дня
  useEffect(() => {
    const checkDateChange = () => {
      const now = new Date();
      const newToday = getDateFromLocal(getTodayLocal());
      
      if (newToday !== currentDate) {
        setCurrentDate(newToday);
        // Если мы на странице сегодняшней даты, перенаправляем на новую дату
        if (!date || date === currentDate) {
          navigate(`/date/${newToday}`);
        }
      }
    };

    // Проверяем каждую минуту
    const interval = setInterval(checkDateChange, 60000);
    // Проверяем сразу при монтировании
    checkDateChange();

    return () => clearInterval(interval);
  }, [currentDate, date, navigate]);

  // Обновляем зависимости для загрузки фильмов
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const newAllMoviesData = {};
        const manualMovies = [];
        const movieIds = [
          4443734, 1237984, 5504100, 5518231, 5427621, 1115213, 1320476, 5965493, 4476147, 6224943, 7004437, 5001443, 5304486, 7224468
        ];
        const sessionTemplate = generateRandomSessions();
        // Новый диапазон дат
        const start = new Date('2025-07-22');
        const end = new Date('2025-09-01');
        let day = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1), day++) {
          const dateStr = getDateFromLocal(new Date(d));
          // Перемешиваем movieIds для каждого дня
          const shuffledIds = [...movieIds];
          for (let i = shuffledIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
          }
          const idsForDay = shuffledIds.slice(0, 5);
          newAllMoviesData[dateStr] = [];
          for (let i = 0; i < 5; i++) {
            const movieId = idsForDay[i];
            let info = null;
            const cached = localStorage.getItem(`movie_${movieId}`);
            if (cached) {
              info = JSON.parse(cached);
            } else {
              try {
                const resp = await fetch(`/api/get-cache/${movieId}`);
                if (resp.status === 429) { // Rate limit exceeded
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                  continue; // Retry with next API key
                }
                info = await resp.json();
                if (info) {
                  localStorage.setItem(`movie_${movieId}`, JSON.stringify(info));
                }
              } catch (error) {
                continue; // Skip this movie on error
              }
            }
            if (info) {
              newAllMoviesData[dateStr].push({
                movieId,
                nameRu: info.nameRu || '',
                posterUrl: info.posterUrl || info.posterUrlPreview || '',
                genres: info.genres || [],
                times: filterSessions(generateRandomSessions(), dateStr),
                date: dateStr,
                staff: []
              });
            }
          }
        }

        setAllMoviesData(newAllMoviesData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [currentDate]);

  // Обновляем эффект для отображения фильмов
  useEffect(() => {
    let targetDate;
    if (date) {
      targetDate = date;
    } else {
      targetDate = currentDate;
    }

    const requestedDate = new Date(targetDate);
    // Store the originally requested date
    const originalRequestedDate = targetDate;

    // Check if the requested date is in the past relative to system today
    if (requestedDate < getTodayLocal()) {
      targetDate = currentDate; // If past, revert to system today
    }

    // Check if there are movies for the targetDate derived above.
    // If not, set movies to an empty array *only if* the original requested date was not today.
    // If the original request was for today and there are no movies for today (after filtering past sessions), we still want to show the 'no sessions' message.
    const moviesForTargetDate = allMoviesData[targetDate] || [];

    if (moviesForTargetDate.length === 0 && targetDate === originalRequestedDate) {
      // If no movies for the requested date, and it's the date we intended to show
      setMovies([]);
      setVisibleMovies([]);
    } else if (moviesForTargetDate.length === 0) {
       // If no movies for the targetDate (which might have been reverted to today),
       // check if there are movies for today. If not, show 'no sessions'.
       const moviesForCurrentDate = allMoviesData[currentDate] || [];
       if (moviesForCurrentDate.length === 0) {
         setMovies([]);
         setVisibleMovies([]);
       } else {
         // If there are movies for today, but the requested date had none
         // We should still show 'no sessions' for the requested date
         // However, if the requested date was in the past and reverted to today, show today's movies.
          if (requestedDate >= getTodayLocal()) {
            setMovies([]);
            setVisibleMovies([]);
          } else {
            setMovies(moviesForCurrentDate);
            setVisibleMovies(moviesForCurrentDate.slice(0, 2));
          }
       }
    } else {
      // If there are movies for the target date, filter them and set states
      const filteredMovies = moviesForTargetDate.filter(movie => {
        const sessionTargetDate = movie.date || targetDate; // Use movie's date if available, otherwise the determined targetDate
        return filterSessions(movie.times, sessionTargetDate).length > 0;
      });
      setMovies(filteredMovies);
      setVisibleMovies(filteredMovies.slice(0, 2));
    }

    setLoading(false);
  }, [date, allMoviesData, currentDate]);

  // Функция для пересоздания modalMovie с allSessions (для Modal)
  const reopenModalWithAllSessions = (movieId) => {
    let foundMovie = null;
    Object.values(allMoviesData).forEach(moviesArr => {
      moviesArr.forEach(m => {
        if (m.movieId === movieId) foundMovie = m;
      });
    });
    if (foundMovie) {
      const allSessionsMap = {};
      Object.entries(allMoviesData).forEach(([date, moviesArr]) => {
        moviesArr.forEach(m => {
          if (m.movieId === movieId) {
            m.times.forEach(session => {
              if (!allSessionsMap[date]) allSessionsMap[date] = new Set();
              allSessionsMap[date].add(JSON.stringify(session));
            });
          }
        });
      });
      const allSessions = [];
      const seen = new Set();
      Object.entries(allSessionsMap).forEach(([date, sessionsSet]) => {
        Array.from(sessionsSet).forEach(sessionStr => {
          const session = JSON.parse(sessionStr);
          const key = date + '_' + session.time;
          if (!seen.has(key)) {
            allSessions.push({ date, ...session });
            seen.add(key);
          }
        });
      });
      setModalMovie({ ...foundMovie, allSessions, staff: [] });
      setModalSession(null);
      setInitialStep(0);
    }
  };

  if (loading) return <div className="text-center p-4">Загрузка...</div>;

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f8fa]">
        <div
          className="text-xl font-semibold text-[#6b7280] transition-all duration-300 transform hover:scale-110 hover:text-[#3b82f6] animate-bounce cursor-pointer select-none"
          style={{ animationIterationCount: 1 }}
          onClick={() => window.location.reload()}
          title="Обновить страницу"
        >
          На эту дату сеансов нет
        </div>
      </div>
    );
  }

  // Фильтруем фильмы, у которых есть хотя бы один актуальный сеанс
  const filteredMovies = movies.filter(movie => {
    const targetDate = movie.date || date || currentDate;
    return filterSessions(movie.times, targetDate).length > 0;
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f8fa]">
      <div className="container mx-auto px-4" style={{ marginTop: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 48,
          width: '100%',
          justifyItems: 'start',
          alignContent: 'start'
        }}>
          {visibleMovies.map((movie, index) => (
            <div
              key={movie.movieId}
              ref={index === visibleMovies.length - 1 ? lastMovieElementRef : null}
              style={{
                width: 600,
                height: 420,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                background: '#fff',
                borderRadius: 28,
                boxShadow: '0 6px 32px rgba(59,130,246,0.07)',
                border: '1.5px solid #e0e7ef',
                overflow: 'visible',
                marginBottom: 0
              }}
            >
              {/* Постер */}
              <div
                style={{ width: 320, height: 400, position: 'absolute', top: 10, left: -30, borderRadius: 22, overflow: 'hidden', boxShadow: '0 4px 16px rgba(59,130,246,0.10)', cursor: 'pointer' }}
                onClick={() => {
                  // Собираем allSessions для фильма
                  const allSessionsMap = {};
                  Object.entries(allMoviesData).forEach(([date, moviesArr]) => {
                    moviesArr.forEach(m => {
                      if (m.movieId === movie.movieId) {
                        m.times.forEach(session => {
                          if (!allSessionsMap[date]) allSessionsMap[date] = new Set();
                          allSessionsMap[date].add(JSON.stringify(session));
                        });
                      }
                    });
                  });
                  // Убираем дубли по (date, time)
                  const allSessions = [];
                  const seen = new Set();
                  Object.entries(allSessionsMap).forEach(([date, sessionsSet]) => {
                    Array.from(sessionsSet).forEach(sessionStr => {
                      const session = JSON.parse(sessionStr);
                      const key = date + '_' + session.time;
                      if (!seen.has(key)) {
                        allSessions.push({ date, ...session });
                        seen.add(key);
                      }
                    });
                  });
                  setModalMovie({ ...movie, allSessions });
                  setModalSession(null);
                  setInitialStep(0);
                  setModalOpen(true);
                }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.nameRu}
                  style={{ width: 320, height: 400, objectFit: 'cover', transition: 'transform 0.2s', willChange: 'transform' }}
                  className="hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/320x400?text=No+Poster';
                  }}
                />
              </div>
              {/* Правая часть */}
              <div style={{ flex: 1, height: 400, marginLeft: 320, marginTop: 30, marginBottom: 30, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', minWidth: 0, maxWidth: 240 }}>
                {/* Название */}
                <div style={{ color: '#111', fontSize: 28, fontWeight: 700, maxWidth: 220, lineHeight: 1.1 }}>
                  {movie.nameRu}
                </div>
                {/* Жанры */}
                <div style={{ color: '#111', fontSize: 18, marginTop: 18, marginBottom: 0, maxWidth: 220 }}>
                  {movie.genres.map((g) => g.genre).join(', ')}
                </div>
                {/* Время и цена */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  maxWidth: 300,
                  margin: '32px auto 0 auto',
                  padding: 0,
                  paddingRight: 0,
                  paddingBottom: 4
                }}>
                  {movie.times.slice(0, 4).map((session, idx) => (
                    <div
                      key={session.time}
                      className="cursor-pointer flex flex-col items-center justify-center transition-all duration-200 hover:scale-105"
                      style={{ 
                        flex: 'none',
                        width: 50,
                        minWidth: 0, 
                        height: 72, 
                        borderRadius: 18, 
                        marginRight: idx !== movie.times.slice(0, 4).length - 1 ? 10 : 0, 
                        maxWidth: 88,
                        background: 'linear-gradient(135deg, #f6f8fa 0%, #e0e7ef 100%)',
                        boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
                        border: '1.5px solid #e0e7ef',
                        transition: 'background 0.2s, box-shadow 0.2s',
                        textAlign: 'center',
                      }}
                      onClick={() => {
                        setModalMovie(movie);
                        setModalSession({ ...session, date: movie.date });
                        setInitialStep(1);
                        setModalOpen(true);
                      }}
                    >
                      <span style={{ color: '#111', fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px' }}>{session.time}</span>
                      <span style={{ color: '#111', fontSize: 14, marginTop: 8, fontWeight: 500 }}>{formatPrice(session.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} movie={modalMovie} session={modalSession} initialStep={initialStep} allMoviesData={allMoviesData} setModalMovie={setModalMovie} reopenModalWithAllSessions={reopenModalWithAllSessions} />
    </div>
  );
};

export default TestCards; 