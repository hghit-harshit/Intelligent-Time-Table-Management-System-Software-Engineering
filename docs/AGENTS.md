# AGENTS.md

## Multi-Service Architecture
This is a 3-service application that must be started in separate terminals:

### Service Startup Order
```bash
# 1. Backend (Express + MongoDB) — port 5001
cd backend
npm run dev

# 2. Google Classroom integration — port 4000  
cd google-classroom-service
npm run dev

# 3. Frontend (React + Vite) — port 5173
cd frontend
npm run dev
```

## Critical Development Commands

### Backend (backend/)
- **Development**: `npm run dev` (uses tsx watch)
- **Build**: `npm run build` (TypeScript compilation)
- **Database seeding**: 
  - `npm run seed:slots:inside` — populate initial slots
  - `npm run seed:scheduler-test:inside` — test data for scheduler
  - `npm run seed:all:inside` — both seeds combined
- **Docker seeding**: Use `npm run seed:slots:docker` etc. when running via Docker

### Frontend (frontend/)
- **Development**: `npm run dev`
- **Linting**: `npm run lint` (ESLint with React/TypeScript rules)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Environment Setup

### Backend (.env requirements)
```bash
PORT=5001
MONGODB_URI=mongodb://localhost:27017/timetable
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Database Configuration
- Default MongoDB: `localhost:27017`
- Docker MongoDB: `admin:admin123@mongodb:27017/timetable?authSource=admin`
- Use `docker-compose.dev.yml` for full development setup

## Project Structure Notes

### Backend Architecture
- **Entry point**: `src/server.ts` (not server.js)
- **API routes**: All prefixed with `/api` and require authentication middleware
- **Database**: Mongoose models in `models/`, routes in `routes/`
- **TypeScript**: Configured with NodeNext module resolution

### Frontend Architecture  
- **Framework**: React 19 + Vite + TypeScript
- **UI**: Material UI v7 + Tailwind CSS v4
- **Routing**: React Router v7
- **Build tool**: Vite with React and Tailwind plugins

### Integration Service
- **Purpose**: Google Classroom OAuth2 integration
- **Entry**: `server.js` (plain Node.js, no TypeScript)
- **Dependencies**: google-auth-library, googleapis

## Important Development Quirks

1. **Port Configuration**: Backend runs on port 5001 (not 5000 as README may suggest)
2. **Authentication**: All API routes require auth middleware (`/api/*`)
3. **Database Seeding**: Essential for development - run seed scripts before testing
4. **No Tests**: No test framework currently configured
5. **Docker Setup**: Use `docker-compose.dev.yml` for development with MongoDB
6. **File Extensions**: Backend uses `.ts` files, entry point is `src/server.ts`

## Tech Stack Summary
| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, TypeScript, Material UI v7, Tailwind CSS v4 |
| Backend | Node.js, Express, TypeScript, MongoDB, Mongoose, Zod |
| Integration | Google Classroom API, OAuth2, google-auth-library |
| Development | tsx, ESLint, Docker, Vite |