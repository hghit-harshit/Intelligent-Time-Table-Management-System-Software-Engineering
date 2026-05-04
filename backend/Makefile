.PHONY: up down fresh restart logs clean rebuild rebuild-backend db-setup seed
# Start all services (does NOT seed — use 'make fresh' for a clean start with seed)
up:
	docker compose -f docker-compose.dev.yml up -d

# Stop all services and wipe volumes
down:
	docker compose -f docker-compose.dev.yml down -v

# Wipe DB volumes + start fresh + seed everything (use this for a clean dev start)
fresh:
	@echo "==> Wiping DB volumes..."
	docker compose -f docker-compose.dev.yml down -v
	@echo "==> Starting services..."
	docker compose -f docker-compose.dev.yml up -d
	@echo "==> Waiting for backend to be ready..."
	@sleep 15
	@echo "==> Seeding database..."
	$(MAKE) seed
	@echo "==> Done! Fresh start complete."

# Restart all services
restart:
	docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up -d


seed:
	docker compose -f docker-compose.dev.yml exec backend npm run seed:all:inside

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

# Rebuild everything
rebuild:
	docker compose -f docker-compose.dev.yml up -d --build

# Rebuild backend container only
rebuild-backend:
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
