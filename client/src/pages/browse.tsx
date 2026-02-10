import { useQuery } from "@tanstack/react-query";
import { MovieCard, MovieCardSkeleton } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import type { Movie } from "@shared/schema";

const GENRES = [
  "All",
  "Action",
  "Thriller",
  "Romance",
  "Drama",
  "Fantasy",
  "Adventure",
  "Horror",
  "Comedy",
  "Sci-Fi",
];

export default function Browse() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const initialQ = params.get("q") || "";
  const initialGenre = params.get("genre") || "All";

  const [search, setSearch] = useState(initialQ);
  const [genre, setGenre] = useState(initialGenre);
  const [year, setYear] = useState("All");
  const [quality, setQuality] = useState("All");

  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  const filtered = useMemo(() => {
    if (!movies) return [];
    return movies.filter((m) => {
      const matchSearch =
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      const matchGenre = genre === "All" || m.genre.includes(genre);
      const matchYear = year === "All" || m.year.toString() === year;
      const matchQuality = quality === "All" || m.quality === quality;
      return matchSearch && matchGenre && matchYear && matchQuality;
    });
  }, [movies, search, genre, year, quality]);

  const years = useMemo(() => {
    if (!movies) return [];
    return [...new Set(movies.map((m) => m.year.toString()))].sort((a, b) => Number(b) - Number(a));
  }, [movies]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-browse-title">
          Browse Movies
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-browse-search"
          />
        </div>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="w-[140px]" data-testid="select-genre">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]" data-testid="select-year">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={quality} onValueChange={setQuality}>
          <SelectTrigger className="w-[120px]" data-testid="select-quality">
            <SelectValue placeholder="Quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Quality</SelectItem>
            <SelectItem value="4K">4K</SelectItem>
            <SelectItem value="HD">HD</SelectItem>
            <SelectItem value="SD">SD</SelectItem>
          </SelectContent>
        </Select>
        {(search || genre !== "All" || year !== "All" || quality !== "All") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setGenre("All"); setYear("All"); setQuality("All"); }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center" data-testid="text-no-results">
          <Search className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No movies found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4" data-testid="text-result-count">
            {filtered.length} movie{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
