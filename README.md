# Insurance Comparator

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose)

Plateforme de comparaison de mutuelles santé avec parsing intelligent de garanties via Claude AI.

## Quick Start

```bash
git clone https://github.com/YoannDmg/insurance-comparator.git
cd insurance-comparator
make start
```

**Frontend** : http://localhost:5173 | **API** : http://localhost:3000

### Importer les données

```bash
cp .env.example .env    # Configurer ANTHROPIC_API_KEY
make parse-all          # Parse les PDFs via Claude
make seed               # Importe en base
```

### Commandes utiles

```bash
make up      # Lancer les services
make down    # Arrêter les services
make logs    # Suivre les logs
make help    # Voir toutes les commandes
```

## Architecture

**Pipeline de données (one-time)**
```
PDF ──▶ scripts/parse.py ──▶ JSON ──▶ make seed ──▶ MongoDB
           (Claude AI)
```

**Application (runtime)**
```
┌─────────────────────────────────┐
│       Frontend • :5173          │
│   React 19 + Vite + Tailwind    │
└───────────────┬─────────────────┘
                │ /api
                ▼
┌─────────────────────────────────┐
│       Backend • :3000           │
│     NestJS 11 + Mongoose        │
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│      MongoDB 7 • :27017         │
└─────────────────────────────────┘
```

---

## Stack

| Couche | Technologies |
|--------|--------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | NestJS 11, TypeScript, Mongoose, Jest |
| Database | MongoDB 7 |
| Parsing | Python 3, Claude API, pdfplumber |
| Infra | Docker Compose, Nginx |

---

## Installation

**Prérequis** : Docker & Docker Compose, Python 3.10+ (pour le parsing)

**Variables d'environnement** (`.env`) :

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clé API Claude (pour le parsing PDF) |
| `MONGODB_URI` | URI MongoDB (défaut: `mongodb://localhost:27017/insurance_comparator`) |

---

## Structure du projet

```
insurance-comparator/
├── backend/           # API REST NestJS
├── frontend/          # Application React
├── scripts/           # Pipeline de parsing PDF
├── data/              # Données assureurs (PDF + JSON)
├── docker-compose.yml
└── Makefile
```

| Module | Description | Documentation |
|--------|-------------|---------------|
| [backend/](backend/) | API REST, endpoints, modèle de données | [README](backend/README.md) |
| [frontend/](frontend/) | Application React, pages, composants | [README](frontend/README.md) |
| [scripts/](scripts/) | Pipeline de parsing PDF → JSON via Claude | [README](scripts/README.md) |

---

## Licence

MIT
