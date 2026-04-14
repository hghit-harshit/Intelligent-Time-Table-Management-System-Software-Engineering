# Command Runbook

## 1) Start services

### Backend (local)

### Frontend (local)

```bash
cd frontend
npm install
npm run dev
```

### Docker backend + Mongo (dev compose)

```bash
cd backend
make up
```

## 2) Seed data

All seed commands below execute inside the running `backend` container, so they always target the same MongoDB used by the API.

### Seed original slot dataset (30 entries)

```bash
cd backend
npm run seed:slots
```

### Seed scheduler courses/professors test data

```bash
cd backend
npm run seed:scheduler-test
```

### Seed everything

```bash
cd backend
npm run seed:all
```

### If using Docker backend container

```bash
cd backend
docker compose -f docker-compose.dev.yml exec backend npm run seed:slots
docker compose -f docker-compose.dev.yml exec backend npm run seed:scheduler-test
```

## 3) MongoDB shell (Docker)

```bash
docker exec -it timetable-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### Useful Mongo checks

```javascript
use timetable
db.slots.countDocuments()
db.courses.countDocuments()
db.professors.countDocuments()
db.rooms.countDocuments()
db.slots.find({}, {label:1, days:1, startTime:1, endTime:1}).limit(20)
```

## 4) Important: seed and backend must use the same DB

- This project is configured for Docker Mongo seeding by default.
- `npm run seed:slots`, `npm run seed:scheduler-test`, and `npm run seed:all` run inside the backend container and use container environment values.
- If backend runs in Docker compose (`make up`), you can seed from host (`npm run seed:all`) or directly from container (`docker compose -f docker-compose.dev.yml exec backend npm run seed:scheduler-test:inside`).
- If rooms are seeded but classroom assignment still says no rooms, check `db.rooms.countDocuments()` in the Mongo instance used by your running backend.

## 5) UI links

- Admin Time Slots: http://localhost:5173/admin/timeslots
- Timetable Engine: http://localhost:5173/admin/timetable-engine
