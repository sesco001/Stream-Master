import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MovieCard } from "@/components/movie-card";
import type { TmdbMovie } from "@/components/movie-card";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Star,
  Clock,
  Globe,
  Calendar,
  User,
  Users,
  ArrowLeft,
  Film,
  Heart,
  Download,
  Check,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TmdbMovieFull {
  id: number;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string | null;
  rating: string;
  year: number;
  genres: string;
  duration: string;
  language: string;
  director: string | null;
  cast: string | null;
  trailerKey: string | null;
  quality: string;
  similar: TmdbMovie[];
}

export default function MovieDetail() {
  const [, params] = useRoute("/movie/:id");
  const tmdbId = params?.id;
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerMode, setPlayerMode] = useState<"watch" | "trailer">("watch");
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: movie, isLoading } = useQuery<TmdbMovieFull>({
    queryKey: ["/api/tmdb/movie", tmdbId],
    enabled: !!tmdbId,
  });

  const { data: watchlistStatus } = useQuery<{ inWatchlist: boolean }>({
    queryKey: ["/api/watchlist/check", tmdbId],
    enabled: !!tmdbId && isAuthenticated,
  });

  const { data: downloadStatus } = useQuery<{ isDownloaded: boolean }>({
    queryKey: ["/api/downloads/check", tmdbId],
    enabled: !!tmdbId && isAuthenticated,
  });

  const addToWatchlist = useMutation({
    mutationFn: async () => {
      if (!movie) return;
      await apiRequest("POST", "/api/watchlist", {
        tmdbId: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        rating: movie.rating,
        year: String(movie.year),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/check", tmdbId] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({ title: "Added to My List" });
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/watchlist/${tmdbId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/check", tmdbId] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      toast({ title: "Removed from My List" });
    },
  });

  const addDownload = useMutation({
    mutationFn: async () => {
      if (!movie) return;
      await apiRequest("POST", "/api/downloads", {
        tmdbId: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        rating: movie.rating,
        year: String(movie.year),
        quality: movie.quality,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads/check", tmdbId] });
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      toast({ title: "Download started", description: "Movie added to your downloads" });
    },
  });

  const inWatchlist = watchlistStatus?.inWatchlist || false;
  const isDownloaded = downloadStatus?.isDownloaded || false;

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <Skeleton className="aspect-[3/4] rounded-md" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The movie you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button data-testid="button-go-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="page-movie-detail">
      <div className="relative w-full h-[50vh] min-h-[400px]">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-64 relative z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 text-white" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          <div className="flex-shrink-0">
            <div className="aspect-[3/4] rounded-md overflow-hidden">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover"
                data-testid="img-detail-poster"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="default">{movie.genres.split(",")[0]}</Badge>
                <Badge variant="secondary">{movie.quality}</Badge>
                <Badge variant="secondary">{movie.language}</Badge>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight text-white"
                data-testid="text-detail-title"
              >
                {movie.title}
              </h1>
            </div>

            <div className="flex items-center gap-5 text-sm text-gray-300 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {movie.rating}/10
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {movie.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {movie.year}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {movie.language}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-2xl" data-testid="text-detail-description">
              {movie.overview}
            </p>

            {movie.director && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Director:</span>
                <span>{movie.director}</span>
              </div>
            )}
            {movie.cast && (
              <div className="flex items-start gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Cast:</span>
                <span>{movie.cast}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {movie.trailerKey && (
                <Button
                  size="lg"
                  data-testid="button-watch"
                  onClick={() => {
                    setPlayerMode("watch");
                    setShowPlayer(true);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Now
                </Button>
              )}
              {movie.trailerKey && (
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/15 text-white backdrop-blur-sm"
                  data-testid="button-trailer"
                  onClick={() => {
                    setPlayerMode("trailer");
                    setShowPlayer(true);
                  }}
                >
                  <Film className="w-4 h-4 mr-2" />
                  Watch Trailer
                </Button>
              )}
              {isAuthenticated && (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    className={`backdrop-blur-sm ${inWatchlist ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/15 text-white"}`}
                    data-testid="button-add-watchlist"
                    onClick={() => inWatchlist ? removeFromWatchlist.mutate() : addToWatchlist.mutate()}
                    disabled={addToWatchlist.isPending || removeFromWatchlist.isPending}
                  >
                    {inWatchlist ? <Check className="w-4 h-4 mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
                    {inWatchlist ? "In My List" : "My List"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className={`backdrop-blur-sm ${isDownloaded ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-white/5 border-white/15 text-white"}`}
                    data-testid="button-download"
                    onClick={() => !isDownloaded && addDownload.mutate()}
                    disabled={addDownload.isPending || isDownloaded}
                  >
                    {isDownloaded ? <Check className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                    {isDownloaded ? "Downloaded" : "Download"}
                  </Button>
                </>
              )}
            </div>

            <Card className="p-5 mt-6">
              <h3 className="font-semibold mb-3">Movie Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Genre</span>
                  <span>{movie.genres}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Year</span>
                  <span>{movie.year}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Quality</span>
                  <span>{movie.quality}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Language</span>
                  <span>{movie.language}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Duration</span>
                  <span>{movie.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Rating</span>
                  <span>{movie.rating}/10</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {movie.similar && movie.similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight mb-4">Similar Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movie.similar.filter(m => m.posterUrl).map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-20" />

      {showPlayer && movie?.trailerKey && (
        <VideoPlayerModal
          youtubeKey={movie.trailerKey}
          title={playerMode === "trailer" ? `${movie.title} - Trailer` : movie.title}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
}
