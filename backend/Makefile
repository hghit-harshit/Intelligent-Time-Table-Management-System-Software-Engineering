.PHONY: up down restart logs clean rebuild db-setup rebuild seed
# Start all services (MongoDB + Backend with hot reload)
up:
	docker compose -f docker-compose.dev.yml up -d

# Stop all services
down:
	docker compose -f docker-compose.dev.yml down

# Restart all services
restart:
	docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up -d

# Rebuild + start (most useful during development)
rebuild:
	docker compose -f docker-compose.dev.yml up -d --build

seed:
	npm run seed:all:inside

# View logs (follow mode)
logs:
	docker compose -f docker-compose.dev.yml logs -f

# View backend logs only
logs-backend:
	docker compose -f docker-compose.dev.yml logs -f backend

# View MongoDB logs only
logs-mongo:
	docker compose -f docker-compose.dev.yml logs -f mongodb

# Clean up containers and volumes
clean:
	docker compose -f docker-compose.dev.yml down -v

# Rebuild backend container (useful after package.json changes)
rebuild:
	docker compose -f docker-compose.dev.yml up -d --build backend

# Install new dependencies (run inside container)
install:
	docker compose -f docker-compose.dev.yml exec backend npm install

# Shell into backend container
shell:
	docker compose -f docker-compose.dev.yml exec backend sh

# Seed default users (student, prof, admin)
db-setup:
	docker compose -f docker-compose.dev.yml exec backend npm run db-setup:inside
