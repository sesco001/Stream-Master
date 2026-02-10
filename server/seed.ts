import { db } from "./db";
import { movies } from "@shared/schema";
import { fetchPopularMovies, fetchTopRatedMovies, fetchTrendingMovies, fetchMovieDetails } from "./tmdb";

export async function seedMovies() {
  const existing = await db.select({ id: movies.id }).from(movies).limit(1);
  if (existing.length > 0) {
    console.log("Movies already seeded, skipping");
    return;
  }

  if (!process.env.TMDB_API_KEY) {
    console.log("No TMDB_API_KEY set, skipping seed");
    return;
  }

  console.log("Seeding movies from TMDB...");

  try {
    const [popular, trending, topRated] = await Promise.all([
      fetchPopularMovies(1),
      fetchTrendingMovies(),
      fetchTopRatedMovies(1),
    ]);

    const allIds = new Set<number>();
    for (const id of [...trending, ...popular, ...topRated]) {
      allIds.add(id);
    }

    const featuredIds = new Set(trending.slice(0, 5));

    const uniqueIds = Array.from(allIds).slice(0, 30);

    let inserted = 0;
    for (const tmdbId of uniqueIds) {
      try {
        const movie = await fetchMovieDetails(tmdbId);
        movie.featured = featuredIds.has(tmdbId);
        await db.insert(movies).values(movie).onConflictDoNothing();
        inserted++;
        if (inserted % 10 === 0) {
          console.log(`Seeded ${inserted} movies...`);
        }
      } catch (err) {
        console.error(`Failed to fetch TMDB movie ${tmdbId}:`, err);
      }
    }

    console.log(`Seeded ${inserted} real movies from TMDB`);
  } catch (err) {
    console.error("TMDB seed error:", err);
  }
}
