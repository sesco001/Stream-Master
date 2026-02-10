import { useQuery } from "@tanstack/react-query";
import { MovieCard, MovieCardSkeleton } from "@/components/movie-card";
import type { TmdbMovie } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface TmdbResponse {
  results: TmdbMovie[];
  totalPages: number;
}

interface Genre {
  id: number;
  name: string;
}

const CATEGORIES = [
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
  { value: "top-rated", label: "Top Rated" },
  { value: "now-playing", label: "Now Playing" },
  { value: "upcoming", label: "Upcoming" },
];

export default function Browse() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const initialQ = params.get("q") || "";
  const initialCategory = params.get("category") || "popular";

  const [search, setSearch] = useState(initialQ);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [genreId, setGenreId] = useState("all");
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<TmdbMovie[]>([]);

  const { data: genres } = useQuery<Genre[]>({
    queryKey: ["/api/tmdb/genres"],
  });

  const isSearching = searchQuery.trim().length > 0;

  const searchEndpoint = isSearching
    ? `/api/tmdb/search?q=${encodeURIComponent(searchQuery)}&page=${page}`
    : genreId !== "all"
    ? `/api/tmdb/discover?genre=${genreId}&page=${page}`
    : `/api/tmdb/${category}?page=${page}`;

  const { data, isLoading, isFetching } = useQuery<TmdbResponse>({
    queryKey: [searchEndpoint],
  });

  useEffect(() => {
    setPage(1);
    setAllMovies([]);
  }, [searchQuery, category, genreId]);

  useEffect(() => {
    if (data?.results) {
      if (page === 1) {
        setAllMovies(data.results);
      } else {
        setAllMovies((prev) => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = data.results.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
      }
    }
  }, [data, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
  };

  const totalPages = data?.totalPages || 1;
  const canLoadMore = page < totalPages && page < 20;

  const currentLabel = isSearching
    ? `Results for "${searchQuery}"`
    : genreId !== "all"
    ? `${genres?.find(g => g.id.toString() === genreId)?.name || "Genre"} Movies`
    : CATEGORIES.find(c => c.value === category)?.label || "Popular";

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-browse-title">
          Browse Movies
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 flex-wrap">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search any movie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-browse-search"
            />
          </div>
          <Button type="submit" data-testid="button-search">
            <Search className="w-4 h-4" />
          </Button>
        </form>
        <Select value={category} onValueChange={(v) => { setCategory(v); setGenreId("all"); setSearchQuery(""); setSearch(""); }}>
          <SelectTrigger className="w-[150px]" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={genreId} onValueChange={(v) => { setGenreId(v); setSearchQuery(""); setSearch(""); }}>
          <SelectTrigger className="w-[150px]" data-testid="select-genre">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {(genres || []).map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || genreId !== "all" || category !== "popular") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setSearchQuery(""); setGenreId("all"); setCategory("popular"); }}
            data-testid="button-clear-filters"
          >
            Clear
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4" data-testid="text-browse-label">
        {currentLabel} {allMovies.length > 0 && `(${allMovies.length} movies)`}
      </p>

      {isLoading && page === 1 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 18 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : allMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-no-results">
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No movies found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Try a different search term or browse a different category.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          {canLoadMore && (
            <div className="flex justify-center mt-8">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                data-testid="button-load-more"
              >
                {isFetching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Load More Movies
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
