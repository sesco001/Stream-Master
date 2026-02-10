import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Star, Clock, Globe } from "lucide-react";
import { Link } from "wouter";
import type { Movie } from "@shared/schema";

interface HeroSectionProps {
  movie?: Movie;
  isLoading?: boolean;
}

export function HeroSection({ movie, isLoading }: HeroSectionProps) {
  if (isLoading || !movie) {
    return (
      <div className="relative w-full h-[70vh] min-h-[500px] animate-pulse bg-muted rounded-md" />
    );
  }

  return (
    <div
      className="relative w-full h-[70vh] min-h-[500px] rounded-md overflow-hidden mb-8"
      data-testid="section-hero"
    >
      <img
        src={movie.backdropUrl || "/images/hero-bg.png"}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative h-full flex items-center px-6 md:px-12 lg:px-16">
        <div className="max-w-2xl space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
            <Badge variant="secondary" className="text-xs bg-white/10 border-0 text-white">
              {movie.quality}
            </Badge>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
            data-testid="text-hero-title"
          >
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-300 flex-wrap">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              {movie.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {movie.duration}
            </span>
            <span>{movie.year}</span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {movie.language}
            </span>
          </div>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed line-clamp-3 max-w-xl">
            {movie.description}
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Link href={`/movie/${movie.id}`}>
              <Button size="lg" data-testid="button-hero-watch">
                <Play className="w-4 h-4 mr-2" />
                Watch Now
              </Button>
            </Link>
            <Link href={`/movie/${movie.id}`}>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-sm" data-testid="button-hero-details">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
