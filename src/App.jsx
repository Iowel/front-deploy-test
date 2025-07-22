import React, { useState } from 'react';
import MovieList from './MovieList';
import MovieForm from './MovieForm';
import './style.css';

export default function App() {
  const [movies, setMovies] = useState([
    { id: 1, title: 'Inception' },
    { id: 2, title: 'Interstellar' },
  ]);

  const addMovie = (title) => {
    setMovies([...movies, { id: Date.now(), title }]);
  };

  return (
    <div className="container">
      <h1>🎬 Movie List</h1>
      <MovieForm onAdd={addMovie} />
      <MovieList movies={movies} />
    </div>
  );
}
