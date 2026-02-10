import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema } from "@shared/schema";
import { searchTmdbMovies, fetchMovieDetails } from "./tmdb";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  app.get("/api/tmdb/search", async (req, res) => {
    try {
      const query = (req.query.q as string) || "";
      if (!query) return res.json([]);
      const results = await searchTmdbMovies(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: "Failed to search TMDB" });
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

  return httpServer;
}
