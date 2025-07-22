export default function MovieList({ movies }) {
    return (
      <ul>
        {movies.map((m) => (
          <li key={m.id}>{m.title}</li>
        ))}
      </ul>
    );
  }
  