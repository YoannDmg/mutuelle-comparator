# Insurance Comparator

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose)

Plateforme de comparaison de mutuelles santé avec parsing intelligent de garanties via Claude AI.

## Table des matières

- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Développement](#développement)
- [Structure du projet](#structure-du-projet)
- [Pipeline de données](#pipeline-de-données)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         React 19 + Vite + Tailwind                       │
│                            shadcn/ui components                          │
│                              Port: 5173                                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTP /api
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                         NestJS 11 + TypeScript                          │
│                           REST API + Mongoose                            │
│                              Port: 3000                                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ MongoDB Driver
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATABASE                                    │
│                            MongoDB 7                                     │
│                     Collection: insurers                                 │
│                              Port: 27017                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stack technique

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| NestJS | 11.x | Framework backend |
| TypeScript | 5.7 | Typage statique |
| Mongoose | 8.x | ODM MongoDB |
| class-validator | 0.14 | Validation DTO |
| Jest | 30.x | Tests unitaires |

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.x | UI Library |
| Vite | 7.x | Build tool |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | 3.x | Composants UI |
| @base-ui/react | 1.x | Headless components |

### Infrastructure

| Technologie | Version | Rôle |
|-------------|---------|------|
| Docker | - | Conteneurisation |
| Docker Compose | 3.8 | Orchestration |
| MongoDB | 7.x | Base de données |
| Nginx | Alpine | Reverse proxy (prod) |

### Scripts

| Technologie | Rôle |
|-------------|------|
| Python 3.x | Pipeline de parsing |
| Anthropic SDK | Claude API |
| pdfplumber | Extraction PDF |

---

## Installation

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- Python 3.10+ (pour le parsing)

### Setup rapide

```bash
# Cloner le repo
git clone https://github.com/YoannDmg/insurance-comparator.git && cd insurance-comparator

# Installer les dépendances
make install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés API
```

### Variables d'environnement

```env
# Claude API (parsing)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# MongoDB
MONGODB_URI=mongodb://localhost:27017/insurance_comparator

# Backend
PORT=3000
FRONTEND_URL=http://localhost:5173
```

---

## Développement

### Démarrage rapide

```bash
make up      # Lancer tous les services (Docker)
make down    # Arrêter les services
make logs    # Suivre les logs
```

> Toutes les commandes disponibles : `make help`

### Pipeline de données

```bash
# Lister les assureurs disponibles
make parse-list

# Extraire et parser un assureur
make extract-april       # Extraction PDF → texte
make parse-april         # Parsing Claude → JSON

# Importer en base
make seed                # Import JSON → MongoDB
```

---

## Structure du projet

```
insurance-comparator/
├── backend/
│   ├── src/
│   │   ├── main.ts                 # Entry point
│   │   ├── app.module.ts           # Root module
│   │   ├── domain/
│   │   │   ├── types.ts            # Types partagés
│   │   │   └── index.ts
│   │   └── insurers/
│   │       ├── insurers.module.ts
│   │       ├── insurers.controller.ts
│   │       ├── insurers.service.ts
│   │       └── schemas/
│   │           └── insurer.schema.ts
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   └── ui/                 # shadcn/ui
│   │   └── lib/
│   │       └── utils.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── scripts/
│   ├── parse.py                    # Pipeline Claude
│   └── requirements.txt
│
├── data/
│   ├── april/
│   │   └── parsed.json
│   └── apicil/
│       └── parsed.json
│
├── docker-compose.yml
├── Makefile
├── .env.example
└── README.md
```

---

## Pipeline de données

### Flux de traitement

```
PDF Assureur
     │
     ▼ pdfplumber (extract)
     │
Texte brut (.txt)
     │
     ▼ Claude API (parse)
     │
JSON structuré (.json)
     │
     ▼ mongoimport (seed)
     │
MongoDB Collection
```

## Licence

MIT
