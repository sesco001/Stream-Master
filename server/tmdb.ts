import type { InsertMovie } from "@shared/schema";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

function getApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

async function tmdbFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "en-US");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  return res.json();
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function mapLanguage(code: string): string {
  const map: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    hi: "Hindi",
    pt: "Portuguese",
    ru: "Russian",
    ar: "Arabic",
  };
  return map[code] || code.toUpperCase();
}

export async function fetchMovieDetails(tmdbId: number): Promise<InsertMovie> {
  const data = await tmdbFetch(`/movie/${tmdbId}`, {
    append_to_response: "credits,videos",
  });

  const genres = (data.genres || []).map((g: any) => g.name).join(", ");
  const year = data.release_date ? parseInt(data.release_date.split("-")[0]) : 2024;
  const rating = data.vote_average ? data.vote_average.toFixed(1) : "0";
  const duration = data.runtime ? formatRuntime(data.runtime) : "N/A";
  const posterUrl = data.poster_path
    ? `${IMG_BASE}/w500${data.poster_path}`
    : "/images/movie-1.png";
  const backdropUrl = data.backdrop_path
    ? `${IMG_BASE}/w1280${data.backdrop_path}`
    : null;

  const directors = (data.credits?.crew || [])
    .filter((c: any) => c.job === "Director")
    .map((c: any) => c.name)
    .slice(0, 2)
    .join(", ");

  const castList = (data.credits?.cast || [])
    .slice(0, 5)
    .map((c: any) => c.name)
    .join(", ");

  const trailer = (data.videos?.results || []).find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  );
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  return {
    tmdbId: data.id,
    title: data.title,
    description: data.overview || "No description available.",
    genre: genres || "Unknown",
    year,
    rating,
    duration,
    posterUrl,
    backdropUrl,
    videoUrl: null,
    trailerUrl,
    quality: "HD",
    language: mapLanguage(data.original_language || "en"),
    director: directors || null,
    cast: castList || null,
    featured: false,
  };
}

export async function fetchPopularMovies(page = 1): Promise<number[]> {
  const data = await tmdbFetch("/movie/popular", { page: page.toString() });
  return (data.results || []).map((m: any) => m.id);
}

export async function fetchTopRatedMovies(page = 1): Promise<number[]> {
  const data = await tmdbFetch("/movie/top_rated", { page: page.toString() });
  return (data.results || []).map((m: any) => m.id);
}

export async function fetchTrendingMovies(): Promise<number[]> {
  const data = await tmdbFetch("/trending/movie/week");
  return (data.results || []).map((m: any) => m.id);
}

export async function searchTmdbMovies(query: string): Promise<Array<{id: number; title: string; year: string; posterUrl: string; rating: number}>> {
  const data = await tmdbFetch("/search/movie", { query });
  return (data.results || []).slice(0, 20).map((m: any) => ({
    id: m.id,
    title: m.title,
    year: m.release_date ? m.release_date.split("-")[0] : "N/A",
    posterUrl: m.poster_path ? `${IMG_BASE}/w200${m.poster_path}` : "/images/movie-1.png",
    rating: m.vote_average || 0,
  }));
}
