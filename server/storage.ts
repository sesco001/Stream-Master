import { type Movie, type InsertMovie, movies } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, desc, and } from "drizzle-orm";

export interface IStorage {
  getAllMovies(): Promise<Movie[]>;
  getMovieById(id: string): Promise<Movie | undefined>;
  getFeaturedMovies(): Promise<Movie[]>;
  searchMovies(query: string): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: string, movie: Partial<InsertMovie>): Promise<Movie | undefined>;
  deleteMovie(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllMovies(): Promise<Movie[]> {
    return db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getMovieById(id: string): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
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
}

export const storage = new DatabaseStorage();
