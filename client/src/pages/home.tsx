import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/hero-section";
import { MovieRow } from "@/components/movie-row";
import type { Movie } from "@shared/schema";

export default function Home() {
  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  const { data: featured, isLoading: featuredLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies/featured"],
  });

  const featuredMovie = featured?.[0];

  const genres = movies
    ? Array.from(new Set(movies.flatMap((m) => m.genre.split(",").map((g) => g.trim()))))
    : [];

  const getMoviesByGenre = (genre: string) =>
    movies?.filter((m) => m.genre.includes(genre)) ?? [];

  const latestMovies = movies
    ? [...movies].sort((a, b) => (b.year ?? 0) - (a.year ?? 0)).slice(0, 12)
    : [];

  return (
    <div className="min-h-screen">
      <HeroSection movie={featuredMovie} isLoading={featuredLoading} />

      <div className="max-w-[1400px] mx-auto px-4 pb-12">
        <MovieRow
          title="Latest Releases"
          movies={latestMovies}
          isLoading={isLoading}
          viewAllHref="/browse"
        />

        {genres.slice(0, 5).map((genre) => (
          <MovieRow
            key={genre}
            title={genre}
            movies={getMoviesByGenre(genre).slice(0, 6)}
            isLoading={isLoading}
            viewAllHref={`/browse?genre=${encodeURIComponent(genre)}`}
          />
        ))}
      </div>
    </div>
  );
}
