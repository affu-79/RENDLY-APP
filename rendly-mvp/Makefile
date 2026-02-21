.PHONY: help setup install dev docker-up docker-down clean backend-dev frontend-dev logs-auth logs-ccs logs-all test

help:
	@echo "Rendly MVP Commands:"
	@echo "  make setup        - Complete setup"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Show dev instructions"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"
	@echo "  make backend-dev  - Start backend services"
	@echo "  make frontend-dev - Start frontend"
	@echo "  make test         - Test service connections"
	@echo "  make clean        - Remove node_modules and build artifacts"

setup:
	@echo "🚀 Setting up Rendly MVP..."
	@bash scripts/setup.sh

install:
	@echo "📦 Installing dependencies..."
	cd backend && npm install && npx lerna bootstrap
	cd frontend && npm install

dev:
	@echo "🔄 Starting development servers..."
	@echo "Run these in separate terminals:"
	@echo "  Terminal 1: make docker-up"
	@echo "  Terminal 2: make backend-dev"
	@echo "  Terminal 3: make frontend-dev"

backend-dev:
	cd backend && npm run dev

frontend-dev:
	cd frontend && npm run dev

docker-up:
	@echo "🐳 Starting Docker containers..."
	docker-compose -f backend/docker-compose.yml up -d

docker-down:
	@echo "🛑 Stopping Docker containers..."
	docker-compose -f backend/docker-compose.yml down

docker-clean:
	@echo "🗑️  Removing Docker volumes..."
	docker-compose -f backend/docker-compose.yml down -v

test:
	@bash scripts/test-connection.sh

clean:
	@echo "🧹 Cleaning up..."
	@find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -name ".next" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -name "dist" -type d -prune -exec rm -rf {} + 2>/dev/null || true

logs-auth:
	docker-compose -f backend/docker-compose.yml logs -f auth-service

logs-ccs:
	docker-compose -f backend/docker-compose.yml logs -f ccs-service

logs-all:
	docker-compose -f backend/docker-compose.yml logs -f
