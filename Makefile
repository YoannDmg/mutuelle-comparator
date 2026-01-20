.PHONY: help start db backend-dev frontend-dev up down logs build test lint install clean seed mongo-shell parse-list extract-all parse-all

VENV = scripts/.venv
PYTHON = $(VENV)/bin/python

# =============================================================================
# HELP
# =============================================================================

help:
	@echo "Insurance Comparator - Available Commands"
	@echo ""
	@echo "DEVELOPMENT"
	@echo "  start            Start all services (Docker) with info"
	@echo "  db               Start MongoDB only"
	@echo "  backend-dev      Start backend in watch mode"
	@echo "  frontend-dev     Start frontend in watch mode"
	@echo ""
	@echo "DOCKER (production)"
	@echo "  up               Start all containers"
	@echo "  down             Stop all containers"
	@echo "  logs             Show all logs (or: logs-backend, logs-frontend)"
	@echo ""
	@echo "BUILD & TEST"
	@echo "  build            Build backend + frontend"
	@echo "  test             Run all tests"
	@echo "  lint             Run linters"
	@echo ""
	@echo "DATABASE"
	@echo "  seed             Import JSON data into MongoDB"
	@echo "  mongo-shell      Open MongoDB shell"
	@echo ""
	@echo "PARSING (PDF -> JSON)"
	@echo "  parse-list       List available insurers"
	@echo "  extract-<name>   Extract text from PDF (e.g. make extract-apicil)"
	@echo "  parse-<name>     Parse with Claude API (e.g. make parse-april)"
	@echo "  extract-all      Extract all insurers"
	@echo "  parse-all        Parse all insurers"
	@echo ""
	@echo "SETUP & CLEANUP"
	@echo "  install          Install all dependencies"
	@echo "  clean            Remove build artifacts"
	@echo "  clean-data       Remove parsed data files"
	@echo "  clean-all        Remove everything"

# =============================================================================
# DEVELOPMENT
# =============================================================================

start:
	@echo ""
	@echo "╔══════════════════════════════════════════════════════════════════╗"
	@echo "║                Insurance Comparator - Starting...                ║"
	@echo "╚══════════════════════════════════════════════════════════════════╝"
	@echo ""
	@docker-compose up -d
	@echo ""
	@echo "┌──────────────────────────────────────────────────────────────────┐"
	@echo "│  Services                                                        │"
	@echo "├──────────────────────────────────────────────────────────────────┤"
	@echo "│  Frontend     http://localhost:5173                              │"
	@echo "│  Backend      http://localhost:3000                              │"
	@echo "│  MongoDB      mongodb://localhost:27017                          │"
	@echo "├──────────────────────────────────────────────────────────────────┤"
	@echo "│  Logs: make logs                                                 │"
	@echo "│  Stop: make down                                                 │"
	@echo "└──────────────────────────────────────────────────────────────────┘"
	@echo ""

db:
	docker-compose up -d mongodb

backend-dev:
	cd backend && npm run start:dev

frontend-dev:
	cd frontend && npm run dev

# =============================================================================
# DOCKER
# =============================================================================

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# =============================================================================
# BUILD & TEST
# =============================================================================

build:
	cd backend && npm run build
	cd frontend && npm run build

test:
	cd backend && npm test

lint:
	cd backend && npm run lint
	cd frontend && npm run lint

# =============================================================================
# DATABASE
# =============================================================================

seed:
	@echo "Seeding database..."
	@for f in data/*/parsed.json; do \
		echo "  Importing $$f..."; \
		docker-compose exec -T mongodb mongoimport \
			--uri="mongodb://localhost:27017/insurance_comparator" \
			--collection=insurers \
			--file=/seed-data/$$(basename $$(dirname $$f))/parsed.json \
			--mode=upsert \
			--upsertFields=name; \
	done

mongo-shell:
	docker-compose exec mongodb mongosh insurance_comparator

# =============================================================================
# SETUP
# =============================================================================

install:
	cd backend && npm install
	cd frontend && npm install
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install -r scripts/requirements.txt

# =============================================================================
# PARSING (PDF -> JSON)
# =============================================================================

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(VENV)/bin/pip install -r scripts/requirements.txt

parse-list: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py list

extract-%: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py extract $*

parse-%: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py parse $*

extract-all: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py extract-all

parse-all: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py parse-all

# =============================================================================
# CLEANUP
# =============================================================================

clean:
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf $(VENV)
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

clean-data:
	rm -f data/*/extracted-text.txt
	rm -f data/*/claude-response.txt
	rm -f data/*/parsed.json

clean-all: clean clean-data
