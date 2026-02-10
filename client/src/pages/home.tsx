import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/hero-section";
import { MovieRow } from "@/components/movie-row";
import type { TmdbMovie } from "@/components/movie-card";

interface TmdbResponse {
  results: TmdbMovie[];
  totalPages: number;
}

export default function Home() {
  const { data: trending, isLoading: trendingLoading } = useQuery<TmdbResponse>({
    queryKey: ["/api/tmdb/trending"],
  });

  const { data: popular, isLoading: popularLoading } = useQuery<TmdbResponse>({
    queryKey: ["/api/tmdb/popular"],
  });

  const { data: topRated, isLoading: topRatedLoading } = useQuery<TmdbResponse>({
    queryKey: ["/api/tmdb/top-rated"],
  });

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery<TmdbResponse>({
    queryKey: ["/api/tmdb/now-playing"],
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery<TmdbResponse>({
    queryKey: ["/api/tmdb/upcoming"],
  });

  const heroMovie = trending?.results?.[0];

  return (
    <div className="min-h-screen">
      <HeroSection movie={heroMovie} isLoading={trendingLoading} />

      <div className="max-w-[1400px] mx-auto px-4 pb-12">
        <MovieRow
          title="Trending This Week"
          movies={trending?.results?.slice(1, 13) || []}
          isLoading={trendingLoading}
          viewAllHref="/browse?category=trending"
        />

        <MovieRow
          title="Now Playing"
          movies={nowPlaying?.results?.slice(0, 12) || []}
          isLoading={nowPlayingLoading}
          viewAllHref="/browse?category=now-playing"
        />

        <MovieRow
          title="Popular"
          movies={popular?.results?.slice(0, 12) || []}
          isLoading={popularLoading}
          viewAllHref="/browse?category=popular"
        />

        <MovieRow
          title="Top Rated"
          movies={topRated?.results?.slice(0, 12) || []}
          isLoading={topRatedLoading}
          viewAllHref="/browse?category=top-rated"
        />

        <MovieRow
          title="Upcoming"
          movies={upcoming?.results?.slice(0, 12) || []}
          isLoading={upcomingLoading}
          viewAllHref="/browse?category=upcoming"
        />
      </div>
    </div>
  );
}
