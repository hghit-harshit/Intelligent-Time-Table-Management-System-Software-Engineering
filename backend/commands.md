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
db.slots.find({}, {label:1, days:1, startTime:1, endTime:1}).limit(20)
```

## 4) UI links

- Admin Time Slots: http://localhost:5173/admin/timeslots
- Timetable Engine: http://localhost:5173/admin/timetable-engine
