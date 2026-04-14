# Backend Command Runbook

This runbook is aligned with the current TypeScript backend in src.

## 1) Install dependencies

Run once after cloning, then again after dependency updates.

```bash
cd backend
npm install
```

## 2) Run backend locally

Use local MongoDB or set MONGODB_URI in environment.

```bash
cd backend
npm run dev
```

One-shot start without watcher:

```bash
cd backend
npm start
```

## 3) Build TypeScript backend

```bash
cd backend
npm run build
```

## 4) Run backend + Mongo with Docker Compose

```bash
cd backend
make up
```

Stop and clean containers:

```bash
cd backend
make down
```

## 5) Seed data

Recommended when running backend via Docker compose, so seeds target the same MongoDB instance.

Seed slot data:

```bash
cd backend
npm run seed:slots
```

Seed scheduler test data:

```bash
cd backend
npm run seed:scheduler-test
```

Seed everything:

```bash
cd backend
npm run seed:all
```

Direct inside-container seed scripts:

```bash
cd backend
npm run seed:slots:inside
npm run seed:scheduler-test:inside
npm run seed:all:inside
```

## 6) Mongo shell and checks (Docker)

Open Mongo shell:

```bash
docker exec -it timetable-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

Useful checks:

```javascript
use timetable
db.slots.countDocuments()
db.courses.countDocuments()
db.professors.countDocuments()
db.rooms.countDocuments()
db.requests.countDocuments()
db.slots.find({}, { label: 1, occurrences: 1 }).limit(20)
```

## 7) API base and key endpoints

Base URL:

http://localhost:5001/api

Core endpoints:

- GET /slots
- GET /slots/:id
- POST /slots
- PUT /slots/:id
- DELETE /slots/:id
- POST /scheduler/generate
- POST /scheduler/assign-classrooms
- GET /requests
- GET /requests/:id
- POST /requests
- PATCH /requests/:id/approve
- PATCH /requests/:id/reject

Health endpoint:

- GET /ping

## 8) Troubleshooting

Port 5001 already in use:

```bash
lsof -i :5001
kill -9 <PID>
```

Backend connects to wrong DB:

- Verify MONGODB_URI for local runs.
- For Docker runs, backend uses mongodb service from docker-compose.dev.yml.

Python solver issues:

- Verify Python and OR-Tools are installed in backend runtime environment.
- Optional env override for solver interpreter:
	- ORTOOLS_PYTHON_BIN=python3
