import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Film,
  Star,
  Clock,
  Loader2,
  Search,
  Download,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Movie, InsertMovie } from "@shared/schema";

const emptyMovie: Partial<InsertMovie> = {
  title: "",
  description: "",
  genre: "",
  year: new Date().getFullYear(),
  rating: "7.0",
  duration: "2h 0m",
  posterUrl: "",
  videoUrl: "",
  trailerUrl: "",
  quality: "HD",
  language: "English",
  director: "",
  cast: "",
  featured: false,
};

interface TmdbSearchResult {
  id: number;
  title: string;
  year: string;
  posterUrl: string;
  rating: number;
}

export default function Admin() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState<Partial<InsertMovie>>(emptyMovie);
  const [tmdbSearch, setTmdbSearch] = useState("");
  const [tmdbResults, setTmdbResults] = useState<TmdbSearchResult[]>([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());

  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<InsertMovie>) =>
      apiRequest("POST", "/api/movies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies/featured"] });
      toast({ title: "Movie added successfully" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertMovie> }) =>
      apiRequest("PATCH", `/api/movies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies/featured"] });
      toast({ title: "Movie updated successfully" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/movies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies/featured"] });
      toast({ title: "Movie deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(emptyMovie);
    setEditingMovie(null);
    setDialogOpen(false);
  };

  const openEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setForm({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      year: movie.year,
      rating: movie.rating,
      duration: movie.duration,
      posterUrl: movie.posterUrl,
      videoUrl: movie.videoUrl || "",
      trailerUrl: movie.trailerUrl || "",
      quality: movie.quality,
      language: movie.language,
      director: movie.director || "",
      cast: movie.cast || "",
      featured: movie.featured || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.genre || !form.posterUrl) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (editingMovie) {
      updateMutation.mutate({ id: editingMovie.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleTmdbSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbSearch.trim()) return;
    setTmdbSearching(true);
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(tmdbSearch.trim())}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setTmdbResults(data);
    } catch {
      toast({ title: "Search failed", variant: "destructive" });
    } finally {
      setTmdbSearching(false);
    }
  };

  const handleImport = async (tmdbId: number) => {
    setImportingIds((prev) => new Set(prev).add(tmdbId));
    try {
      const res = await apiRequest("POST", `/api/tmdb/import/${tmdbId}`);
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies/featured"] });
      setImportedIds((prev) => new Set(prev).add(tmdbId));
      toast({ title: `Imported "${data.title}"` });
    } catch (err: any) {
      if (err.message?.includes("409")) {
        setImportedIds((prev) => new Set(prev).add(tmdbId));
        toast({ title: "Already imported" });
      } else {
        toast({ title: "Import failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setImportingIds((prev) => {
        const next = new Set(prev);
        next.delete(tmdbId);
        return next;
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const updateField = (field: keyof InsertMovie, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-title">
          Movie Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Import from TMDB or manually add movies to your catalog
        </p>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList>
          <TabsTrigger value="catalog" data-testid="tab-catalog">
            <Film className="w-4 h-4 mr-2" />
            My Catalog ({movies?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="import" data-testid="tab-import">
            <Download className="w-4 h-4 mr-2" />
            Import from TMDB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-movie">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manually
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMovie ? "Edit Movie" : "Add New Movie"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4" data-testid="form-movie">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={form.title || ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="Movie title"
                        data-testid="input-title"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="genre">Genre *</Label>
                      <Input
                        id="genre"
                        value={form.genre || ""}
                        onChange={(e) => updateField("genre", e.target.value)}
                        placeholder="Action, Thriller"
                        data-testid="input-genre"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={form.description || ""}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Movie description..."
                      className="resize-none"
                      rows={3}
                      data-testid="input-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={form.year || ""}
                        onChange={(e) => updateField("year", parseInt(e.target.value))}
                        data-testid="input-year"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rating">Rating</Label>
                      <Input
                        id="rating"
                        value={form.rating || ""}
                        onChange={(e) => updateField("rating", e.target.value)}
                        placeholder="8.5"
                        data-testid="input-rating"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={form.duration || ""}
                        onChange={(e) => updateField("duration", e.target.value)}
                        placeholder="2h 30m"
                        data-testid="input-duration"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quality">Quality</Label>
                      <Select value={form.quality || "HD"} onValueChange={(v) => updateField("quality", v)}>
                        <SelectTrigger data-testid="select-quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4K">4K</SelectItem>
                          <SelectItem value="HD">HD</SelectItem>
                          <SelectItem value="SD">SD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        value={form.language || ""}
                        onChange={(e) => updateField("language", e.target.value)}
                        placeholder="English"
                        data-testid="input-language"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="director">Director</Label>
                      <Input
                        id="director"
                        value={form.director || ""}
                        onChange={(e) => updateField("director", e.target.value)}
                        placeholder="Director name"
                        data-testid="input-director"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cast">Cast</Label>
                    <Input
                      id="cast"
                      value={form.cast || ""}
                      onChange={(e) => updateField("cast", e.target.value)}
                      placeholder="Actor 1, Actor 2"
                      data-testid="input-cast"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="posterUrl">Poster URL *</Label>
                    <Input
                      id="posterUrl"
                      value={form.posterUrl || ""}
                      onChange={(e) => updateField("posterUrl", e.target.value)}
                      placeholder="https://..."
                      data-testid="input-poster-url"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="videoUrl">Video/Stream URL</Label>
                      <Input
                        id="videoUrl"
                        value={form.videoUrl || ""}
                        onChange={(e) => updateField("videoUrl", e.target.value)}
                        placeholder="https://..."
                        data-testid="input-video-url"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="trailerUrl">Trailer URL</Label>
                      <Input
                        id="trailerUrl"
                        value={form.trailerUrl || ""}
                        onChange={(e) => updateField("trailerUrl", e.target.value)}
                        placeholder="https://..."
                        data-testid="input-trailer-url"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.featured || false}
                      onCheckedChange={(v) => updateField("featured", v)}
                      data-testid="switch-featured"
                    />
                    <Label>Featured on homepage</Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={resetForm} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} data-testid="button-submit">
                      {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingMovie ? "Save Changes" : "Add Movie"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-muted rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded-md w-1/3" />
                      <div className="h-4 bg-muted rounded-md w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !movies || movies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Film className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No movies yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Use the "Import from TMDB" tab to add real movies, or add them manually.
              </p>
            </div>
          ) : (
            <div className="grid gap-3" data-testid="list-admin-movies">
              {movies.map((movie) => (
                <Card key={movie.id} className="p-4" data-testid={`card-admin-movie-${movie.id}`}>
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-medium truncate">{movie.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {movie.genre.split(",")[0]}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {movie.rating}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {movie.duration}
                            </span>
                            <span className="text-xs text-muted-foreground">{movie.year}</span>
                            {movie.featured && (
                              <Badge variant="default" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(movie)}
                            data-testid={`button-edit-${movie.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Delete this movie?")) {
                                deleteMutation.mutate(movie.id);
                              }
                            }}
                            data-testid={`button-delete-${movie.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {movie.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-1">Search TMDB</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Search The Movie Database for any movie and import it with all metadata, poster, cast, and trailer info.
            </p>
            <form onSubmit={handleTmdbSearch} className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for a movie... (e.g. Inception, The Dark Knight)"
                  value={tmdbSearch}
                  onChange={(e) => setTmdbSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-tmdb-search"
                />
              </div>
              <Button type="submit" disabled={tmdbSearching} data-testid="button-tmdb-search">
                {tmdbSearching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </form>
          </Card>

          {tmdbResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" data-testid="list-tmdb-results">
              {tmdbResults.map((result) => {
                const isImporting = importingIds.has(result.id);
                const isImported = importedIds.has(result.id);
                return (
                  <Card key={result.id} className="overflow-visible" data-testid={`card-tmdb-${result.id}`}>
                    <div className="aspect-[3/4] overflow-hidden rounded-t-md">
                      <img
                        src={result.posterUrl}
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-2">
                      <h4 className="text-sm font-medium truncate">{result.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{result.year}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {result.rating.toFixed(1)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        variant={isImported ? "secondary" : "default"}
                        disabled={isImporting || isImported}
                        onClick={() => handleImport(result.id)}
                        data-testid={`button-import-${result.id}`}
                      >
                        {isImporting ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : isImported ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Download className="w-3 h-3 mr-1" />
                        )}
                        {isImported ? "Imported" : isImporting ? "Importing..." : "Import"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {tmdbResults.length === 0 && tmdbSearch && !tmdbSearching && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No results found. Try a different search term.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
