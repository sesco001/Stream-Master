import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tmdbId: integer("tmdb_id").unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  genre: text("genre").notNull(),
  year: integer("year").notNull(),
  rating: text("rating").notNull().default("0"),
  duration: text("duration").notNull(),
  posterUrl: text("poster_url").notNull(),
  backdropUrl: text("backdrop_url"),
  videoUrl: text("video_url"),
  trailerUrl: text("trailer_url"),
  quality: text("quality").notNull().default("HD"),
  language: text("language").notNull().default("English"),
  director: text("director"),
  cast: text("cast"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
});

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export * from "./models/auth";

export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  title: text("title").notNull(),
  posterUrl: text("poster_url").notNull(),
  rating: text("rating").default("0"),
  year: text("year"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  createdAt: true,
});
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlist.$inferSelect;

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tmdbId: integer("tmdb_id").notNull(),
  title: text("title").notNull(),
  posterUrl: text("poster_url").notNull(),
  rating: text("rating").default("0"),
  year: text("year"),
  quality: text("quality").default("HD"),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  createdAt: true,
});
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;
