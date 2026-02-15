# CineVault - Movie Streaming & Downloading Site

## Overview
A Netflix-like movie streaming and downloading platform powered by TMDB (The Movie Database) API. Users sign in to access hundreds of thousands of real movies, build watchlists, download favorites, and watch trailers inline. Features user authentication via Replit Auth.

## Recent Changes
- 2026-02-15: XCASPER streaming integration - Real movie streaming via XCASPER Movies API (multi-provider embeds), updated video player with source switching
- 2026-02-12: Netflix upgrade - User auth, landing page, watchlist, downloads, embedded video player, user profiles
- 2026-02-10: Major upgrade - Live TMDB integration for all pages (home, browse, detail), genre filtering, pagination, similar movies
- 2026-02-10: Initial build - Schema, dark cinema theme, full frontend and backend

## Tech Stack
- Frontend: React + Vite + TanStack Query + wouter + shadcn/ui + Tailwind CSS
- Backend: Express + PostgreSQL + Drizzle ORM
- Auth: Replit Auth (OpenID Connect) with passport
- External APIs: TMDB (movie metadata), XCASPER Movies API (streaming embeds, no key required)
- Theme: Dark cinema theme with purple accents

## Project Architecture
- `shared/schema.ts` - Movie, Watchlist, Download data models (Drizzle + Zod)
- `shared/models/auth.ts` - Users and sessions tables for auth
- `server/tmdb.ts` - TMDB API service
- `server/routes.ts` - REST API endpoints (auth + TMDB proxy + watchlist + downloads + local catalog)
- `server/replit_integrations/auth/` - Replit Auth module (OIDC, passport, session)
- `server/storage.ts` - DatabaseStorage class for movies, watchlist, downloads
- `client/src/pages/` - Landing, Home, Browse, MovieDetail, MyList, MyDownloads, Admin
- `client/src/components/` - HeroSection, MovieCard, MovieRow, AppSidebar, VideoPlayerModal

## API Endpoints

### Auth
- GET `/api/login` - Begin login flow
- GET `/api/logout` - Begin logout flow
- GET `/api/auth/user` - Get current authenticated user

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

### Watchlist (authenticated)
- GET `/api/watchlist` - Get user's watchlist
- GET `/api/watchlist/check/:tmdbId` - Check if movie is in watchlist
- POST `/api/watchlist` - Add to watchlist
- DELETE `/api/watchlist/:tmdbId` - Remove from watchlist

### Downloads (authenticated)
- GET `/api/downloads` - Get user's downloads
- GET `/api/downloads/check/:tmdbId` - Check if movie is downloaded
- POST `/api/downloads` - Add download
- DELETE `/api/downloads/:tmdbId` - Remove download

### Streaming (XCASPER proxy)
- GET `/api/stream/search?keyword=&type=movie` - Search XCASPER ShowBox for streaming sources
- GET `/api/stream/links?id=&type=movie` - Get embed streaming links (VidSrc, MultiEmbed, AutoEmbed, etc.)

### Local Catalog Endpoints
- GET `/api/movies` - List all local catalog movies
- POST `/api/movies` - Create movie manually
- PATCH `/api/movies/:id` - Update movie
- DELETE `/api/movies/:id` - Delete movie

## Key Pages
- `/` (logged out) - Landing page with hero, features, sign-in CTA
- `/` (logged in) - Home with hero, Trending, Now Playing, Popular, Top Rated, Upcoming rows
- `/browse` - Browse/search TMDB with category selector, genre filtering, Load More pagination
- `/movie/:id` - Movie detail with embedded video player, watchlist/download buttons, similar movies
- `/my-list` - User's saved watchlist
- `/downloads` - User's downloaded movies
- `/admin` - Admin panel with catalog management and TMDB import

## Database
- PostgreSQL with Drizzle ORM
- Movies table: id, tmdbId, title, description, genre, year, rating, duration, posterUrl, backdropUrl, videoUrl, trailerUrl, quality, language, director, cast, featured, createdAt
- Users table: id, email, firstName, lastName, profileImageUrl, createdAt, updatedAt
- Sessions table: sid, sess, expire
- Watchlist table: id, userId, tmdbId, title, posterUrl, rating, year, createdAt
- Downloads table: id, userId, tmdbId, title, posterUrl, rating, year, quality, status, createdAt
