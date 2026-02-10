import { db } from "./db";
import { movies } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedMovies() {
  const existing = await db.select({ id: movies.id }).from(movies).limit(1);
  if (existing.length > 0) return;

  const seedData = [
    {
      title: "Neon Horizon",
      description:
        "In 2087, a rogue AI threatens to merge virtual and physical realities. A former hacker must navigate a neon-drenched cyberpunk metropolis to stop it before the boundaries between worlds collapse forever.",
      genre: "Sci-Fi, Action",
      year: 2024,
      rating: "8.5",
      duration: "2h 18m",
      posterUrl: "/images/movie-1.png",
      videoUrl: null,
      trailerUrl: null,
      quality: "4K",
      language: "English",
      director: "Alex Rivera",
      cast: "Keanu Reeves, Ana de Armas, Oscar Isaac",
      featured: true,
    },
    {
      title: "Shadows of Deceit",
      description:
        "A decorated detective uncovers a web of corruption that reaches the highest levels of government. As the truth becomes deadlier than the lies, she must decide who to trust in a city where everyone has secrets.",
      genre: "Thriller, Crime",
      year: 2024,
      rating: "8.1",
      duration: "2h 5m",
      posterUrl: "/images/movie-2.png",
      videoUrl: null,
      trailerUrl: null,
      quality: "HD",
      language: "English",
      director: "David Fincher",
      cast: "Cate Blanchett, Idris Elba, Jake Gyllenhaal",
      featured: false,
    },
    {
      title: "Eternal Tides",
      description:
        "Two strangers meet on a remote coastal village during a storm and discover a connection that transcends time itself. A sweeping love story spanning decades, continents, and the mysteries of fate.",
      genre: "Romance, Drama",
      year: 2023,
      rating: "7.8",
      duration: "2h 12m",
      posterUrl: "/images/movie-3.png",
      videoUrl: null,
      trailerUrl: null,
      quality: "HD",
      language: "English",
      director: "Greta Gerwig",
      cast: "Florence Pugh, Timothee Chalamet, Saoirse Ronan",
      featured: false,
    },
    {
      title: "Realm of the Forgotten",
      description:
        "When an ancient seal breaks, legendary creatures return to a world that has forgotten them. A young warrior must unite the fractured kingdoms before darkness consumes everything.",
      genre: "Fantasy, Adventure",
      year: 2024,
      rating: "8.3",
      duration: "2h 42m",
      posterUrl: "/images/movie-4.png",
      videoUrl: null,
      trailerUrl: null,
      quality: "4K",
      language: "English",
      director: "Denis Villeneuve",
      cast: "Dev Patel, Zendaya, Pedro Pascal",
      featured: true,
    },
    {
      title: "The Whispering House",
      description:
        "A family moves into a Victorian mansion with a dark past. Strange whispers echo through the halls at night, and the children begin speaking to someone invisible. Not all ghosts want to be found.",
      genre: "Horror",
      year: 2023,
      rating: "7.4",
      duration: "1h 52m",
      posterUrl: "/images/movie-5.png",
      videoUrl: null,
      trailerUrl: null,
      quality: "HD",
      language: "English",
      director: "Ari Aster",
      cast: "Toni Collette, Milly Shapiro, Lucas Hedges",
      featured: false,
    },
    {
      title: "Laugh Track",
      description:
        "A washed-up comedian accidentally goes viral and must navigate sudden fame, a chaotic tour, and a rivalry with the internet's most popular influencer. Hilarity and heart collide.",
      genre: "Comedy",
      year: 2024,
      rating: "7.6",
      duration: "1h 48m",
      posterUrl: "/images/movie-6.png",
      videoUrl: null,
      trailerUrl: null,
      quality: "HD",
      language: "English",
      director: "Taika Waititi",
      cast: "Ryan Reynolds, Awkwafina, Jack Black",
      featured: false,
    },
  ];

  await db.insert(movies).values(seedData);
  console.log("Seeded 6 movies successfully");
}
