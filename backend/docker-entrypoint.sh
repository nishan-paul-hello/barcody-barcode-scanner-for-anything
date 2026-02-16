#!/bin/sh
set -e

# Load environment variables if needed (handled by Docker/Nest but safe to have)
# . /app/backend/.env # Not strictly needed if using env_file in compose

echo "--- Barcody Backend Entrypoint ---"

# Run migrations if we are in production
if [ "$NODE_ENV" = "production" ]; then
  echo "Running database migrations..."
  # Use the compiled JS config for migrations in production
  npm run migration:run:prod
else
  echo "Skipping automatic migrations (not in production mode or dev handles it)"
fi

echo "Starting application with: $@"
exec "$@"
