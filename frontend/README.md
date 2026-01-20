# Frontend - Comparateur de Mutuelles

Application web de comparaison de mutuelles santé.

## Stack technique

- **React 19** - Framework UI
- **TypeScript 5.9** - Typage statique
- **Vite 7** - Build tool et dev server
- **Tailwind CSS 4** - Styling utility-first
- **shadcn/ui** (Base UI) - Composants UI

## Architecture

```
App.tsx (providers)
    └── AppLayout (navigation + header + routing)
            ├── InsurersListPage
            ├── InsurerDetailPage
            └── ComparisonPage
```

- **App.tsx** : Point d'entrée, ne contient que les providers
- **AppLayout** : Gère la navigation, le header, et le routing entre les pages

## Structure du projet

```
src/
├── components/
│   ├── ui/                    # Composants shadcn/ui (Button, Card, Badge...)
│   ├── insurer-card.tsx       # Carte assureur (liste)
│   ├── guarantee-card.tsx     # Carte garantie (détail)
│   └── comparison-table.tsx   # Table de comparaison
├── context/
│   └── comparison-context.tsx # État des assureurs sélectionnés
├── layouts/
│   └── app-layout.tsx         # Navigation + Header + Routing
├── pages/
│   ├── insurers-list.tsx      # Liste des assureurs
│   ├── insurer-detail.tsx     # Détail d'un assureur
│   └── comparison.tsx         # Comparaison côte à côte
├── lib/
│   ├── api.ts                 # Client API + types
│   └── utils.ts               # Helpers (cn, etc.)
├── App.tsx                    # Providers uniquement
├── main.tsx                   # Bootstrap React
└── index.css                  # Styles globaux + Tailwind
```

## Scripts

```bash
# Développement (port 5173)
npm run dev

# Build production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint
```

## Configuration API

Le proxy Vite redirige les appels `/api/*` vers le backend :

```typescript
// vite.config.ts
proxy: {
  "/api": {
    target: "http://localhost:3000",
    rewrite: (path) => path.replace(/^\/api/, "")
  }
}
```

**Exemples d'appels :**
- `fetch('/api/insurers')` → `GET http://localhost:3000/insurers`
- `fetch('/api/insurers/april')` → `GET http://localhost:3000/insurers/april`

## Pages

### Liste des assureurs (`/`)
- Affiche tous les assureurs disponibles
- Recherche par nom/marque
- Sélection multiple pour comparaison

### Détail assureur
- Affiche les formules d'un assureur
- Visualisation des garanties par catégorie

### Comparaison
- Tableau comparatif côte à côte
- Sélecteur de formule par assureur
- Filtre par catégorie de garantie

## Catégories de garanties

| Clé | Label |
|-----|-------|
| `hospitalization` | Hospitalisation |
| `general_care` | Soins courants |
| `optical` | Optique |
| `dental` | Dentaire |
| `hearing_aids` | Audiologie |

## Ajout de composants UI

Utiliser la CLI shadcn pour ajouter des composants :

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

## Variables d'environnement

Aucune variable d'environnement requise côté frontend. La configuration API est gérée par le proxy Vite.
