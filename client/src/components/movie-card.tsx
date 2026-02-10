import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Star, Play } from "lucide-react";

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string | null;
  rating: number;
  year: string;
  genreIds: number[];
}

export function MovieCard({ movie }: { movie: TmdbMovie }) {
  if (!movie.posterUrl) return null;

  return (
    <Link href={`/movie/${movie.id}`}>
      <div
        className="group relative rounded-md overflow-visible cursor-pointer transition-transform duration-300"
        data-testid={`card-movie-${movie.id}`}
      >
        <div className="relative aspect-[3/4] rounded-md overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            data-testid={`img-poster-${movie.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
              HD
            </Badge>
          </div>
        </div>
        <div className="mt-2 px-0.5">
          <h3
            className="text-sm font-medium truncate"
            data-testid={`text-title-${movie.id}`}
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs text-muted-foreground" data-testid={`text-rating-${movie.id}`}>
                {Number(movie.rating).toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{movie.year}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-md bg-muted" />
      <div className="mt-2 px-0.5">
        <div className="h-4 bg-muted rounded-md w-3/4" />
        <div className="h-3 bg-muted rounded-md w-1/2 mt-2" />
      </div>
    </div>
  );
}
