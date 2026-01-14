# Barcody - Barcode Scanner for Anything

## Makefile Commands

- `make help`: Show help message
- `make logs`: Tail logs of all containers
- `make stop`: Stop all containers
- `make dev`: Start development environment (hot reload)
- `make prod`: Start production environment (always builds images)
- `make restart-dev`: Restart development environment
- `make restart-prod`: Restart production environment
- `make rebuild-dev`: Rebuild dev environment (use if deps change)

## Environment Setup

1. Copy `.env.example` to `.env` in `backend/` and `web-app/` directories.
2. Generate a secure secret for `ANALYTICS_HASH_SECRET` in `backend/.env`:
   ```bash
   openssl rand -hex 32
   ```

## Access

- **Web App**: http://localhost:3000
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/api/docs
