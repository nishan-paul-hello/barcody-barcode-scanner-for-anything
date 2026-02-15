.PHONY: build up down rebuild logs help dev infra

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

WEB_PORT ?= 3000
ADMIN_PORT ?= 3001
BACKEND_PORT ?= 3002

build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans --force-recreate

up:
	docker compose up -d

dev:
	docker compose -f docker-compose.yml -f docker-compose.local-proxy.yml up -d postgres redis ts-web ts-admin ts-api
	npm run dev

infra:
	docker compose -f docker-compose.yml -f docker-compose.local-proxy.yml up -d postgres redis ts-web ts-admin ts-api

down:
	docker compose down

restart:
	docker compose restart

refresh:
	docker compose up -d --build --force-recreate -V --remove-orphans

logs:
	docker compose logs -f

help:
	@echo "  build       - Start production environment (Docker)"
	@echo "  up          - Start full development environment (Docker)"
	@echo "  dev         - Start local development (Apps local, DB in Docker)"
	@echo "  infra       - Start only DB and Redis in Docker"
	@echo "  down        - Stop all containers"
	@echo "  restart     - Restart all containers"
	@echo "  refresh     - Deep rebuild of dev (use if deps change)"
	@echo "  logs        - Tail logs of all containers"
