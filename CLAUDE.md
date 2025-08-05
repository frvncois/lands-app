# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (Vue 3 + Vite)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Backend Server (Express)
- `cd server && npm run dev` - Start backend development server with nodemon
- `cd server && npm start` - Start backend production server

## Architecture Overview

### Frontend Stack
- **Vue 3** with Composition API
- **Vite** as build tool and dev server
- **Pinia** for state management with persistence
- **Vue Router 4** for routing with authentication guards
- **Supabase** for authentication and database operations

### Key Frontend Architecture Patterns

**State Management (Pinia)**
- `stores/user.js` - Central user authentication and project management store
- Uses composition API pattern with reactive refs and computed properties
- Persists `currentProjectId` to localStorage
- Handles authentication state, user profile, projects, and collaborator invitations

**Services Layer**
- `services/supabase.js` - Supabase client configuration
- `services/api.js` - API service class for calling Supabase Edge Functions
- Uses singleton pattern with centralized auth token management

**Component Organization**
- Components organized by feature domains (auth/, content/, design/, etc.)
- Reusable UI components in global/, input/, button/ directories
- Each major feature has its own component directory

**Authentication Flow**
- JWT-based authentication through Supabase Auth
- Route guards check session validity before navigation
- Auth state managed centrally in user store with automatic token refresh

### Backend Architecture
- **Express.js** server with CORS enabled
- Separate routes for MusicBrainz API integration and Stripe payments
- CommonJS module system

### Project Structure
```
src/
├── components/          # Vue components organized by feature
├── views/              # Main page components
├── stores/             # Pinia stores
├── services/           # API services and external integrations
├── router/             # Vue Router configuration
├── utils/              # Utility functions
└── data/               # Static data files

server/                 # Express backend
├── routes/             # API route handlers
└── index.js           # Server entry point
```

### Important Implementation Details

**UUID Project IDs**
- Projects use UUID strings, not numeric IDs
- Router handles both numeric and UUID IDs via string conversion

**API Integration**
- All backend calls go through Supabase Edge Functions
- Frontend `apiService` handles authentication tokens automatically
- Error handling includes timeout management and retry logic for rate limits

**Content Management**
- Projects contain multiple content types: links, posts, releases, shows, merch
- Content arrays are always initialized as empty arrays to prevent undefined errors
- Real-time updates through API calls, no local-only state

**Collaborator System**
- Invitation-based collaboration with email validation
- Project-level permissions managed through invitation records
- Users can be invited to multiple projects simultaneously

## Environment Variables Required

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (server/.env)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Security Headers
Vite dev server includes comprehensive security headers:
- X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- Referrer-Policy, Permissions-Policy, Strict-Transport-Security