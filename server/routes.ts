import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema } from "@shared/schema";
import {
  searchTmdbMovies,
  fetchMovieDetails,
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  discoverByGenre,
  searchMovies,
  getGenres,
  getMovieDetail,
} from "./tmdb";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/tmdb/trending", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const data = await getTrending(page);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch trending movies" });
    }
  });

  app.get("/api/tmdb/popular", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const data = await getPopular(page);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch popular movies" });
    }
  });

  app.get("/api/tmdb/top-rated", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const data = await getTopRated(page);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch top rated movies" });
    }
  });

  app.get("/api/tmdb/now-playing", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const data = await getNowPlaying(page);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch now playing movies" });
    }
  });

  app.get("/api/tmdb/upcoming", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const data = await getUpcoming(page);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch upcoming movies" });
    }
  });

  app.get("/api/tmdb/genres", async (_req, res) => {
    try {
      const genres = await getGenres();
      res.json(genres);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  app.get("/api/tmdb/discover", async (req, res) => {
    try {
      const genreId = parseInt(req.query.genre as string) || 28;
      const page = parseInt(req.query.page as string) || 1;
      const data = await discoverByGenre(genreId, page);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to discover movies" });
    }
  });

  app.get("/api/tmdb/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      if (!query) return res.json({ results: [], totalPages: 0 });
      const page = parseInt(req.query.page as string) || 1;
      const data = await searchMovies(query, page);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to search TMDB" });
    }
  });

  app.get("/api/tmdb/movie/:id", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.id);
      if (isNaN(tmdbId)) return res.status(400).json({ message: "Invalid ID" });
      const movie = await getMovieDetail(tmdbId);
      res.json(movie);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch movie details" });
    }
  });

  app.post("/api/tmdb/import/:tmdbId", async (req, res) => {
    try {
      const tmdbId = parseInt(req.params.tmdbId);
      if (isNaN(tmdbId)) {
        return res.status(400).json({ message: "Invalid TMDB ID" });
      }
      const existing = await storage.getMovieByTmdbId(tmdbId);
      if (existing) {
        return res.status(409).json({ message: "Movie already imported", movie: existing });
      }
      const movieData = await fetchMovieDetails(tmdbId);
      const movie = await storage.createMovie(movieData);
      res.status(201).json(movie);
    } catch (err) {
      console.error("TMDB import error:", err);
      res.status(500).json({ message: "Failed to import movie from TMDB" });
    }
  });

  app.get("/api/movies", async (_req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/featured", async (_req, res) => {
    try {
      const movies = await storage.getFeaturedMovies();
      res.json(movies);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch featured movies" });
    }
  });

  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      const movies = await storage.searchMovies(query);
      res.json(movies);
    } catch (err) {
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const movie = await storage.getMovieById(req.params.id);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch movie" });
    }
  });

  app.post("/api/movies", async (req, res) => {
    try {
      const parsed = insertMovieSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid movie data",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const movie = await storage.createMovie(parsed.data);
      res.status(201).json(movie);
    } catch (err) {
      res.status(500).json({ message: "Failed to create movie" });
    }
  });

  app.patch("/api/movies/:id", async (req, res) => {
    try {
      const parsed = insertMovieSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid movie data",
          errors: parsed.error.flatten().fieldErrors,
        });
      }
      const movie = await storage.updateMovie(req.params.id, parsed.data);
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json(movie);
    } catch (err) {
      res.status(500).json({ message: "Failed to update movie" });
    }
  });

  app.delete("/api/movies/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMovie(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Movie not found" });
      }
      res.json({ message: "Movie deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete movie" });
    }
  });

  return httpServer;
}
