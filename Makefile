.PHONY: test test-watch test-coverage test-backend install-backend build-backend dev-backend seed-all

# Default target
help:
	@echo "Available commands:"
	@echo "  make test            Run all backend tests"
	@echo "  make test-watch      Run tests in watch mode"
	@echo "  make test-coverage   Run tests with coverage report"
	@echo "  make install         Install backend dependencies"
	@echo "  make build           Build backend TypeScript"
	@echo "  make dev             Start backend in dev mode"
	@echo "  make seed-all        Run all seed scripts"
	@echo "  make lint            Run TypeScript type check"

# ─── Testing ───────────────────────────────────────────────────────────────────

test:
	cd backend && NODE_ENV=test npx vitest run

test-watch:
	cd backend && NODE_ENV=test npx vitest

test-coverage:
	cd backend && NODE_ENV=test npx vitest run --coverage

# ─── Backend ───────────────────────────────────────────────────────────────────

install-backend:
	cd backend && npm install

build-backend:
	cd backend && npm run build

dev-backend:
	cd backend && npm run dev

# ─── Seeding ───────────────────────────────────────────────────────────────────

seed-all:
	cd backend && npm run seed:all:inside

seed-slots:
	cd backend && npm run seed:slots:inside

seed-courses:
	cd backend && npm run seed:courses:inside

seed-enrollments:
	cd backend && npm run seed:enrollments:inside

seed-timetable:
	cd backend && npm run seed:faculty-timetable:inside

# ─── Docker ────────────────────────────────────────────────────────────────────

docker-up:
	docker compose -f docker-compose.dev.yml up -d

docker-down:
	docker compose -f docker-compose.dev.yml down

docker-logs:
	docker compose -f docker-compose.dev.yml logs -f

docker-seed-all:
	cd backend && npm run seed:all

# ─── Quality ───────────────────────────────────────────────────────────────────

lint:
	cd backend && npx tsc --noEmit
