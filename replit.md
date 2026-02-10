# CineVault - Movie Streaming & Downloading Site

## Overview
A movie streaming and downloading platform powered by TMDB (The Movie Database) API. The site pulls real movie data live from TMDB, giving access to hundreds of thousands of real movies with posters, backdrops, cast, directors, trailers, and ratings. Admins can import movies into a local catalog from TMDB or add them manually.

## Recent Changes
- 2026-02-10: Major upgrade - Live TMDB integration for all pages (home, browse, detail), genre filtering, pagination, similar movies
- 2026-02-10: Initial build - Schema, dark cinema theme, full frontend and backend

## Tech Stack
- Frontend: React + Vite + TanStack Query + wouter + shadcn/ui + Tailwind CSS
- Backend: Express + PostgreSQL + Drizzle ORM
- External API: TMDB (The Movie Database) for live movie data
- Theme: Dark cinema theme with purple accents

## Project Architecture
- `shared/schema.ts` - Movie data model (Drizzle + Zod) for local catalog
- `server/tmdb.ts` - TMDB API service (trending, popular, top-rated, now-playing, upcoming, search, discover, movie details)
- `server/routes.ts` - REST API endpoints (TMDB proxy + local catalog CRUD)
- `server/storage.ts` - DatabaseStorage class for local catalog
- `server/seed.ts` - Seeds 30 movies from TMDB on first startup
- `client/src/pages/` - Home, Browse, MovieDetail, Admin pages
- `client/src/components/` - HeroSection, MovieCard, MovieRow, AppSidebar

## API Endpoints

### TMDB Proxy Endpoints (live data)
- GET `/api/tmdb/trending?page=` - Trending movies this week
- GET `/api/tmdb/popular?page=` - Popular movies
- GET `/api/tmdb/top-rated?page=` - Top rated movies
- GET `/api/tmdb/now-playing?page=` - Now playing in theaters
- GET `/api/tmdb/upcoming?page=` - Upcoming movies
- GET `/api/tmdb/genres` - All movie genres
- GET `/api/tmdb/discover?genre=&page=` - Discover by genre
- GET `/api/tmdb/search?q=&page=` - Search TMDB
- GET `/api/tmdb/movie/:id` - Full movie details with cast, trailer, similar movies
- POST `/api/tmdb/import/:tmdbId` - Import a TMDB movie to local catalog

### Local Catalog Endpoints
- GET `/api/movies` - List all local catalog movies
- GET `/api/movies/featured` - Featured movies from catalog
- GET `/api/movies/search?q=` - Search local catalog
- GET `/api/movies/:id` - Single movie from catalog
- POST `/api/movies` - Create movie manually
- PATCH `/api/movies/:id` - Update movie
- DELETE `/api/movies/:id` - Delete movie

## Key Pages
- `/` - Home with hero (trending movie), rows for Trending, Now Playing, Popular, Top Rated, Upcoming
- `/browse` - Browse/search TMDB with category selector, genre filtering, and Load More pagination
- `/movie/:id` - Movie detail with TMDB data: backdrop, poster, cast, director, trailer, similar movies
- `/admin` - Admin panel with catalog management and TMDB import (search & one-click import)

## Database
- PostgreSQL with Drizzle ORM
- Movies table: id, tmdbId, title, description, genre, year, rating, duration, posterUrl, backdropUrl, videoUrl, trailerUrl, quality, language, director, cast, featured, createdAt
