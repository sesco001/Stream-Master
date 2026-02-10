import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  genre: text("genre").notNull(),
  year: integer("year").notNull(),
  rating: text("rating").notNull().default("0"),
  duration: text("duration").notNull(),
  posterUrl: text("poster_url").notNull(),
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
