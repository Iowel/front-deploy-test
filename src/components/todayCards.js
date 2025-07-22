import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from './Loader';

// Получаем сегодняшнюю дату в формате YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];


const ALL_MOVIES_DATA = {
  [today]: [  
    {
      movieId: 8366, 
      times: ["10:00", "12:30", "15:00"]
    },
    {
      movieId: 39864, 
      times: ["16:30", "19:00", "21:30"]
    }
  ],
  "2025-05-04": [  
    {
      movieId: 4642708, 
      times: ["11:00", "13:30"]
    },
    {
      movieId: 4664634, 
      times: ["17:00", "20:00"]
    },
    {
      movieId: 1143242, 
      times: ["14:30", "19:30", "22:00"]
    }
  ],
  "2025-05-05": [  
    {
      movieId: 1209439,
      times: ["12:00", "15:00", "18:00"]
    },
    {
      movieId: 1395478,
      times: ["14:00", "17:30", "21:00"]
    }
  ]
};

// Отладочный вывод доступных дат
console.log('Доступные даты:', Object.keys(ALL_MOVIES_DATA));

const TodayCards = () => {
  const { date } = useParams(); // Получаем дату из URL
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoviesByDate = async () => {
      try {
        const targetDate = date || today;
        const moviesForDate = ALL_MOVIES_DATA[targetDate] || [];
  
        if (!moviesForDate.length) {
          setMovies([]);
          setLoading(false);
          return;
        }
  
        const moviePromises = moviesForDate.map(async (movieData) => {
          const resp = await fetch(`/api/get-cache/${movieData.movieId}`, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          const movieInfo = await resp.json();
          return {
            ...movieInfo,
            times: movieData.times,
          };
        });
  
        const moviesData = await Promise.all(moviePromises);
        setMovies(moviesData);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке фильмов:', error);
        setLoading(false);
      }
    };
  
    fetchMoviesByDate();
  }, [date]);

  if (loading) return <Loader overlay={false} />;

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
        <div className="text-xl text-gray-600">
          На эту дату сеансов нет
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <div key={movie.kinopoiskId} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={movie.posterUrl}
                  alt={movie.nameRu}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-1 m-2 rounded">
                  {movie.ratingKinopoisk}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{movie.nameRu}</h3>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-gray-600">{movie.ratingKinopoisk}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.genres.map((genre, index) => (
                    <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm">
                      {genre.genre}
                    </span>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="flex flex-wrap gap-2">
                    {movie.times.map((time, index) => (
                      <button 
                        key={index}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodayCards; 