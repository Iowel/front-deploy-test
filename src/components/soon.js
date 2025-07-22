import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import Loader from './Loader';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomUniqueIndexes(count, min, max) {
  const set = new Set();
  while (set.size < count) {
    set.add(getRandomInt(min, max));
  }
  return Array.from(set);
}

const Soon = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMovie, setModalMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch топ-100
        const topResp = await fetch('https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS', {
          // const topResp = await fetch('http://localhost:8888/api/get-popular', {
          headers: {
            'X-API-KEY': 'f8730f72-a86f-42c5-971a-cbb75304a8b6',
            'Content-Type': 'application/json',
          }
        });
        const topData = await topResp.json();
        console.log('soon.js API films:', topData.films?.length, topData.films);
        const films = topData.films || [];
        let soonMovies = [];
        if (films.length > 39) {
          const max = Math.min(69, films.length - 1);
          const indexes = getRandomUniqueIndexes(8, 39, max);
          soonMovies = indexes.map(i => films[i]).filter(Boolean);
        } else {
          soonMovies = films.slice(0, 8);
        }
        const normalizeMovie = (m) => ({
          ...m,
          ratingKinopoisk: m.rating ?? null,
          ratingImdb: m.ratingImdb ?? null,
        });
        const all = soonMovies.map(normalizeMovie).slice(0, 15);
        setMovies(all);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки soon:', error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) return <Loader overlay={false} />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 40,
          justifyContent: 'center',
        }}>
          {movies.map((movie, idx) => {
            console.log('SOON_CARD', movie.nameRu || movie.nameEn || movie.nameOriginal, 'KP:', movie.ratingKinopoisk, 'IMDb:', movie.ratingImdb);
            return (
              <div
                key={movie.filmId || movie.kinopoiskId || idx}
                style={{ width: 600, height: 420, position: 'relative', display: 'flex', alignItems: 'flex-start', background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'visible', marginBottom: 0 }}
                onClick={() => { setModalMovie({ ...movie, movieId: movie.filmId || movie.kinopoiskId, genres: movie.genres || [], times: movie.times || [] }); setModalOpen(true); }}
                className="cursor-pointer"
              >
                {/* Постер */}
                <div
                  style={{ width: 320, height: 400, position: 'absolute', top: 10, left: -30, borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                >
                  <img
                    src={movie.posterUrl || movie.posterUrlPreview}
                    alt={movie.nameRu || movie.nameEn || movie.nameOriginal || ''}
                    style={{ width: 320, height: 400, objectFit: 'cover', transition: 'transform 0.2s', willChange: 'transform' }}
                  />
                  {/* Возраст */}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.92)', color: '#222', fontWeight: 700, fontSize: 18, borderRadius: 8, padding: '2px 10px', zIndex: 2 }}>
                    {movie.ratingAgeLimits ? movie.ratingAgeLimits.replace(/[^0-9+]/g, '') + '+' : (movie.year || '—')}
                  </div>
                </div>
                {/* Правая часть */}
                <div style={{ flex: 1, height: 400, marginLeft: 320, marginTop: 30, marginBottom: 30, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', minWidth: 0, maxWidth: 240 }}>
                  {/* Название + Оценка */}
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
                    <div style={{ color: '#111', fontSize: 28, fontWeight: 700, maxWidth: 120, lineHeight: 1.1 }}>
                      {movie.nameRu || movie.nameEn || movie.nameOriginal || ''}
                    </div>
                    {movie.ratingKinopoisk != null && !isNaN(Number(movie.ratingKinopoisk)) && (
                      <div style={{
                        marginLeft: 8,
                        background: '#f3f3f3',
                        borderRadius: 10,
                        padding: '4px 10px',
                        fontWeight: 700,
                        fontSize: 18,
                        color: '#1a7b3b',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{marginRight: 4}}>KP:</span>{movie.ratingKinopoisk}
                      </div>
                    )}
                    {movie.ratingImdb != null && !isNaN(Number(movie.ratingImdb)) && (
                      <div style={{
                        marginLeft: 8,
                        background: '#f3f3f3',
                        borderRadius: 10,
                        padding: '4px 10px',
                        fontWeight: 700,
                        fontSize: 18,
                        color: '#1a3b7b',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{marginRight: 4}}>IMDb:</span>{movie.ratingImdb}
                      </div>
                    )}
                  </div>
                  {/* Жанры */}
                  <div style={{ color: '#888', fontSize: 18, marginTop: 18, marginBottom: 0, maxWidth: 220 }}>
                    {Array.isArray(movie.genres) ? movie.genres.map((g) => g.genre).join(', ') : (movie.genres || []).join(', ')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} movie={modalMovie} showStepper={false} />
    </div>
  );
};

export default Soon; 