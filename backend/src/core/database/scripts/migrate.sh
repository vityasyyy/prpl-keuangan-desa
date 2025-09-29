#!/usr/bin/env sh
set -e

echo "🚀 Running SQL migrations..."
for file in $(ls database/migrations/*.sql | sort); do
  echo "Applying $file..."
  psql "$DATABASE_URL" -f "$file"
done
echo "✅ All migrations applied."
