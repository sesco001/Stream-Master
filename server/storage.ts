import { type Movie, type InsertMovie, movies, type Watchlist, type InsertWatchlist, watchlist, type Download, type InsertDownload, downloads } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and } from "drizzle-orm";

export interface IStorage {
  getAllMovies(): Promise<Movie[]>;
  getMovieById(id: string): Promise<Movie | undefined>;
  getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined>;
  getFeaturedMovies(): Promise<Movie[]>;
  searchMovies(query: string): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: string, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: string): Promise<boolean>;
  getWatchlist(userId: string): Promise<Watchlist[]>;
  addToWatchlist(item: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: string, tmdbId: number): Promise<boolean>;
  isInWatchlist(userId: string, tmdbId: number): Promise<boolean>;
  getDownloads(userId: string): Promise<Download[]>;
  addDownload(item: InsertDownload): Promise<Download>;
  removeDownload(userId: string, tmdbId: number): Promise<boolean>;
  isDownloaded(userId: string, tmdbId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllMovies(): Promise<Movie[]> {
    return db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getMovieById(id: string): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async getMovieByTmdbId(tmdbId: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.tmdbId, tmdbId));
    return movie;
  }

  async getFeaturedMovies(): Promise<Movie[]> {
    return db.select().from(movies).where(eq(movies.featured, true)).orderBy(desc(movies.createdAt));
  }

  async searchMovies(query: string): Promise<Movie[]> {
    return db
      .select()
      .from(movies)
      .where(ilike(movies.title, `%${query}%`))
      .orderBy(desc(movies.createdAt));
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [created] = await db.insert(movies).values(movie).returning();
    return created;
  }

  async updateMovie(id: string, movie: Partial<InsertMovie>): Promise<Movie | undefined> {
    const [updated] = await db
      .update(movies)
      .set(movie)
      .where(eq(movies.id, id))
      .returning();
    return updated;
  }

  async deleteMovie(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(movies)
      .where(eq(movies.id, id))
      .returning();
    return !!deleted;
  }

  async getWatchlist(userId: string): Promise<Watchlist[]> {
    return db.select().from(watchlist).where(eq(watchlist.userId, userId)).orderBy(desc(watchlist.createdAt));
  }

  async addToWatchlist(item: InsertWatchlist): Promise<Watchlist> {
    const [created] = await db.insert(watchlist).values(item).returning();
    return created;
  }

  async removeFromWatchlist(userId: string, tmdbId: number): Promise<boolean> {
    const [deleted] = await db.delete(watchlist).where(and(eq(watchlist.userId, userId), eq(watchlist.tmdbId, tmdbId))).returning();
    return !!deleted;
  }

  async isInWatchlist(userId: string, tmdbId: number): Promise<boolean> {
    const [item] = await db.select().from(watchlist).where(and(eq(watchlist.userId, userId), eq(watchlist.tmdbId, tmdbId)));
    return !!item;
  }

  async getDownloads(userId: string): Promise<Download[]> {
    return db.select().from(downloads).where(eq(downloads.userId, userId)).orderBy(desc(downloads.createdAt));
  }

  async addDownload(item: InsertDownload): Promise<Download> {
    const [created] = await db.insert(downloads).values(item).returning();
    return created;
  }

  async removeDownload(userId: string, tmdbId: number): Promise<boolean> {
    const [deleted] = await db.delete(downloads).where(and(eq(downloads.userId, userId), eq(downloads.tmdbId, tmdbId))).returning();
    return !!deleted;
  }

  async isDownloaded(userId: string, tmdbId: number): Promise<boolean> {
    const [item] = await db.select().from(downloads).where(and(eq(downloads.userId, userId), eq(downloads.tmdbId, tmdbId)));
    return !!item;
  }
}

export const storage = new DatabaseStorage();
