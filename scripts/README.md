# PDF Parser

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Claude API](https://img.shields.io/badge/Claude-Sonnet_4-CC785C?logo=anthropic&logoColor=white)](https://anthropic.com)

Pipeline d'extraction et de parsing de garanties mutuelles depuis des PDFs via Claude AI.

## Quick Start

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python parse.py --help
```

## Workflow

```
data/april/source.pdf
        ↓ extract
data/april/extracted-text.txt
        ↓ parse (Claude API)
data/april/parsed.json
```

## Commandes

| Commande | Description |
|----------|-------------|
| `python parse.py list` | Liste les assureurs disponibles |
| `python parse.py extract <insurer>` | Extrait le texte du PDF |
| `python parse.py extract-all` | Extrait tous les PDFs |
| `python parse.py parse <insurer>` | Extraction + parsing Claude |
| `python parse.py parse-all` | Parse tous les assureurs |

## Données générées

Les fichiers parsés sont dans [`data/`](../data/) :

| Assureur | PDF source | JSON parsé |
|----------|------------|------------|
| APICIL | [source.pdf](../data/apicil/source.pdf) | [parsed.json](../data/apicil/parsed.json) |
| APRIL | [source.pdf](../data/april/source.pdf) | [parsed.json](../data/april/parsed.json) |

## Ajouter un assureur

1. Créer un dossier dans `data/` (ex: `data/april/`)
2. Y placer le PDF nommé `source.pdf`
3. Lancer `python parse.py parse april`

## Configuration

Nécessite `ANTHROPIC_API_KEY` dans le fichier `.env` à la racine du projet.

## Dépendances

- **pdfplumber** - Extraction de texte PDF
- **anthropic** - Client API Claude
- **python-dotenv** - Chargement des variables d'environnement
