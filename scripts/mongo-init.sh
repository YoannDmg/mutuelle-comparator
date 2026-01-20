#!/bin/bash
# Script d'initialisation MongoDB - Importe les données au premier démarrage

echo "=== MongoDB Init Script ==="

# Vérifie si la collection existe déjà et contient des données
count=$(mongosh --quiet --eval "db.getSiblingDB('insurance_comparator').insurers.countDocuments()")

if [ "$count" -gt 0 ]; then
    echo "Database already seeded ($count insurers). Skipping."
    exit 0
fi

echo "Seeding database..."

# Importe chaque fichier parsed.json trouvé dans /seed-data
for dir in /seed-data/*/; do
    if [ -f "${dir}parsed.json" ]; then
        name=$(basename "$dir")
        echo "  Importing $name..."
        mongoimport \
            --uri="mongodb://localhost:27017/insurance_comparator" \
            --collection=insurers \
            --file="${dir}parsed.json" \
            --mode=upsert \
            --upsertFields=name
    fi
done

echo "=== Seeding complete ==="
