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
        const resp = await fetch('/api/get-popular');
        const data = await resp.json();
        const validMovies = Array.isArray(data.docs) ? data.docs.filter(movie => {
          if (!movie) return false;
          const poster = movie.poster;
          if (!poster) return false;
          if (!poster.url && !poster.previewUrl) return false;
          if (poster.url === '' && poster.previewUrl === '') return false;
          return true;
        }) : [];
        setMovies(validMovies);
        try {
          localStorage.setItem('soon_movies', JSON.stringify(validMovies));
        } catch (e) { /* ignore quota errors */ }
        setLoading(false);
      } catch (error) {
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
          {movies.map((movie) => {
            return (
              <div
                key={movie.id}
                style={{ width: 600, height: 420, position: 'relative', display: 'flex', alignItems: 'flex-start', background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', overflow: 'visible', marginBottom: 0 }}
                onClick={() => { setModalMovie({ ...movie, movieId: movie.id, genres: movie.genres || [], times: movie.times || [] }); setModalOpen(true); }}
                className="cursor-pointer"
              >
                {/* Постер */}
                <div
                  style={{ width: 320, height: 400, position: 'absolute', top: 10, left: -30, borderRadius: 18, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                >
                  <img
                    src={movie.poster?.url || movie.poster?.previewUrl}
                    alt={movie.name || movie.alternativeName || ''}
                    style={{ width: 320, height: 400, objectFit: 'cover', transition: 'transform 0.2s', willChange: 'transform' }}
                  />
                  {/* Возраст */}
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.92)', color: '#222', fontWeight: 700, fontSize: 18, borderRadius: 8, padding: '2px 10px', zIndex: 2 }}>
                    {movie.ageRating ? movie.ageRating + '+' : (movie.year || '—')}
                  </div>
                </div>
                {/* Правая часть */}
                <div style={{ flex: 1, height: 400, marginLeft: 320, marginTop: 30, marginBottom: 30, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', minWidth: 0, maxWidth: 240 }}>
                  {/* Название + Оценка */}
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
                    <div style={{ color: '#111', fontSize: 28, fontWeight: 700, maxWidth: 220, lineHeight: 1.1 }}>
                      {movie.name || movie.alternativeName || ''}
                    </div>
                    {movie.rating?.kp != null && !isNaN(Number(movie.rating.kp)) && (
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
                        <span style={{marginRight: 4}}>KP:</span>{movie.rating.kp}
                      </div>
                    )}
                    {movie.rating?.imdb != null && !isNaN(Number(movie.rating.imdb)) && (
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
                        <span style={{marginRight: 4}}>IMDb:</span>{movie.rating.imdb}
                      </div>
                    )}
                  </div>
                  {/* Жанры */}
                  <div style={{ color: '#888', fontSize: 18, marginTop: 18, marginBottom: 0, maxWidth: 220 }}>
                    {Array.isArray(movie.genres) ? movie.genres.map((g) => g.name).join(', ') : (movie.genres || []).join(', ')}
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
