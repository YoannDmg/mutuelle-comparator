.PHONY: help install install-backend install-scripts backend-dev backend-build backend-test backend-lint parse-list extract-all parse-all clean clean-data clean-all

VENV = scripts/.venv
PYTHON = $(VENV)/bin/python

# Default target
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Setup:"
	@echo "  install            Install all dependencies (backend + scripts)"
	@echo "  install-backend    Install backend dependencies"
	@echo "  install-scripts    Install Python venv + dependencies"
	@echo ""
	@echo "Backend:"
	@echo "  backend-dev        Start backend in dev mode"
	@echo "  backend-build      Build backend for production"
	@echo "  backend-test       Run backend tests"
	@echo "  backend-lint       Run linter"
	@echo ""
	@echo "Parsing:"
	@echo "  parse-list         List available insurers"
	@echo "  extract-<name>     Extract text from PDF       (e.g. make extract-apicil)"
	@echo "  parse-<name>       Parse with Claude API       (e.g. make parse-april)"
	@echo "  extract-all        Extract all insurers"
	@echo "  parse-all          Parse all insurers"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean              Remove build artifacts (dist, venv, cache)"
	@echo "  clean-data         Remove generated data (extracted, parsed)"
	@echo "  clean-all          Remove everything"

# ============== Setup ==============

install: install-backend install-scripts

install-backend:
	cd backend && npm install

$(VENV)/bin/activate:
	python3 -m venv $(VENV)

install-scripts: $(VENV)/bin/activate
	$(VENV)/bin/pip install -r scripts/requirements.txt

# ============== Backend ==============

backend-dev:
	cd backend && npm run start:dev

backend-build:
	cd backend && npm run build

backend-test:
	cd backend && npm test

backend-lint:
	cd backend && npm run lint

# ============== Parsing ==============

parse-list: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py list

# Dynamic targets: extract-<insurer> and parse-<insurer>
extract-%: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py extract $*

parse-%: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py parse $*

# Batch operations
extract-all: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py extract-all

parse-all: $(VENV)/bin/activate
	@$(PYTHON) scripts/parse.py parse-all

# ============== Cleanup ==============

clean:
	rm -rf backend/dist
	rm -rf $(VENV)
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

clean-data:
	rm -f data/*/extracted-text.txt
	rm -f data/*/claude-response.txt
	rm -f data/*/parsed.json

clean-all: clean clean-data
