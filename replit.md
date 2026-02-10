# CineVault - Movie Streaming & Downloading Site

## Overview
A movie streaming and downloading platform with a custom movie API. Users can browse, search, and view movie details. Admins can manage the movie catalog through an admin panel.

## Recent Changes
- 2026-02-10: Initial build - Schema, dark cinema theme, full frontend and backend

## Tech Stack
- Frontend: React + Vite + TanStack Query + wouter + shadcn/ui + Tailwind CSS
- Backend: Express + PostgreSQL + Drizzle ORM
- Theme: Dark cinema theme with purple accents

## Project Architecture
- `shared/schema.ts` - Movie data model (Drizzle + Zod)
- `server/db.ts` - Database connection (pg pool)
- `server/storage.ts` - DatabaseStorage class with CRUD operations
- `server/routes.ts` - REST API endpoints for movies
- `server/seed.ts` - Seeds 6 movies with generated poster images
- `client/src/pages/` - Home, Browse, MovieDetail, Admin pages
- `client/src/components/` - Navbar, HeroSection, MovieCard, MovieRow

## API Endpoints
- GET `/api/movies` - List all movies
- GET `/api/movies/featured` - Featured movies
- GET `/api/movies/search?q=` - Search movies
- GET `/api/movies/:id` - Single movie
- POST `/api/movies` - Create movie
- PATCH `/api/movies/:id` - Update movie
- DELETE `/api/movies/:id` - Delete movie

## Key Pages
- `/` - Home with hero, featured movies, genre rows
- `/browse` - Browse with search, genre/year/quality filters
- `/movie/:id` - Movie detail with poster, info, watch/download buttons
- `/admin` - Admin panel to add/edit/delete movies

## Database
- PostgreSQL with Drizzle ORM
- Movies table: id, title, description, genre, year, rating, duration, posterUrl, videoUrl, trailerUrl, quality, language, director, cast, featured, createdAt
