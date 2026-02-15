import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
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
  await setupAuth(app);
  registerAuthRoutes(app);

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

  app.get("/api/watchlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const list = await storage.getWatchlist(userId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.get("/api/watchlist/check/:tmdbId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tmdbId = parseInt(req.params.tmdbId);
      const inList = await storage.isInWatchlist(userId, tmdbId);
      res.json({ inWatchlist: inList });
    } catch (err) {
      res.status(500).json({ message: "Failed to check watchlist" });
    }
  });

  app.post("/api/watchlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tmdbId, title, posterUrl, rating, year } = req.body;
      const existing = await storage.isInWatchlist(userId, tmdbId);
      if (existing) {
        return res.status(409).json({ message: "Already in watchlist" });
      }
      const item = await storage.addToWatchlist({ userId, tmdbId, title, posterUrl, rating, year });
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:tmdbId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tmdbId = parseInt(req.params.tmdbId);
      await storage.removeFromWatchlist(userId, tmdbId);
      res.json({ message: "Removed from watchlist" });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  app.get("/api/downloads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const list = await storage.getDownloads(userId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });

  app.get("/api/downloads/check/:tmdbId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tmdbId = parseInt(req.params.tmdbId);
      const downloaded = await storage.isDownloaded(userId, tmdbId);
      res.json({ isDownloaded: downloaded });
    } catch (err) {
      res.status(500).json({ message: "Failed to check downloads" });
    }
  });

  app.post("/api/downloads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tmdbId, title, posterUrl, rating, year, quality } = req.body;
      const existing = await storage.isDownloaded(userId, tmdbId);
      if (existing) {
        return res.status(409).json({ message: "Already downloaded" });
      }
      const item = await storage.addDownload({ userId, tmdbId, title, posterUrl, rating, year, quality });
      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ message: "Failed to add download" });
    }
  });

  const xcasperHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://movieapi.xcasper.space/",
    "Origin": "https://movieapi.xcasper.space",
  };

  app.get("/api/stream/search", async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      const type = (req.query.type as string) || "movie";
      if (!keyword) return res.status(400).json({ message: "keyword is required" });
      const response = await fetch(
        `https://movieapi.xcasper.space/api/showbox/search?keyword=${encodeURIComponent(keyword)}&type=${encodeURIComponent(type)}`,
        { headers: xcasperHeaders }
      );
      if (!response.ok) {
        return res.status(502).json({ message: "Streaming service unavailable", success: false });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Stream search error:", err);
      res.status(500).json({ message: "Failed to search for streams" });
    }
  });

  app.get("/api/stream/links", async (req, res) => {
    try {
      const id = req.query.id as string;
      const type = (req.query.type as string) || "movie";
      if (!id) return res.status(400).json({ message: "id is required" });
      const response = await fetch(
        `https://movieapi.xcasper.space/api/stream?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`,
        { headers: xcasperHeaders }
      );
      if (!response.ok) {
        return res.status(502).json({ message: "Streaming service unavailable", success: false });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Stream links error:", err);
      res.status(500).json({ message: "Failed to fetch stream links" });
    }
  });

  app.delete("/api/downloads/:tmdbId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tmdbId = parseInt(req.params.tmdbId);
      await storage.removeDownload(userId, tmdbId);
      res.json({ message: "Removed from downloads" });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove download" });
    }
  });

  return httpServer;
}
