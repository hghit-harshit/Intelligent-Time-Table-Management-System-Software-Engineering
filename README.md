# Smart Timetable for DISHA

Intelligent Timetable Management System for academic scheduling, course enrollment, exam planning, and Google Classroom integration.

---

## How to Run

Start all three services in separate terminals:

```bash
# 1. Main backend (Express + MongoDB) — port 5000
cd backend
npm run dev

# 2. Google Classroom integration service — port 4000
cd google-classroom-service
npm run dev

# 3. Frontend (React + Vite) — port 5173
cd frontend
npm run dev
```

---

## Project Structure

```
├── backend/                    # Main MERN backend (Express + MongoDB)
│   ├── controllers/            # Route handlers
│   ├── models/                 # Mongoose schemas (Request, Slot, etc.)
│   ├── routes/                 # API route definitions
│   ├── server.js               # Entry point (port 5000)
│   └── .env.example            # Environment variable template
│
├── google-classroom-service/   # Google Classroom OAuth integration
│   ├── server.js               # Entry point (port 4000)
│   ├── credentials.json        # Google OAuth2 client credentials
│   ├── token.json              # Stored OAuth2 tokens
│   └── package.json            # Dependencies
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Shared UI components (Layout, CalendarView)
│   │   ├── pages/              # Page components (Student, Faculty, Admin, etc.)
│   │   ├── styles/             # Design tokens and MUI theme
│   │   └── App.jsx             # Router and app shell
│   ├── index.html              # HTML entry point
│   └── vite.config.js          # Vite configuration
│
└── README.md
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, Material UI (MUI v7), Tailwind CSS v4 |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Integration | Google Classroom API, Google OAuth2 |

## AI Assistant Setup

The student AI Assistant uses the Gemini API through the backend. Add these values to `backend/.env` before starting the backend:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```