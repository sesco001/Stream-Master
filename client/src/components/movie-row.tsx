import { MovieCard, MovieCardSkeleton } from "@/components/movie-card";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { Movie } from "@shared/schema";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
  viewAllHref?: string;
}

export function MovieRow({ title, movies, isLoading, viewAllHref }: MovieRowProps) {
  return (
    <section className="mb-8" data-testid={`section-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref}>
            <span
              className="text-sm text-muted-foreground flex items-center gap-1 cursor-pointer transition-colors"
              data-testid={`link-viewall-${title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              View All <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
          : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
      </div>
    </section>
  );
}
