.PHONY: switch-env dev-lh dev-ts ts-certs build up down restart refresh logs funnel-on funnel-off help

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

WEB_PORT ?= 3000
ADMIN_PORT ?= 3001
BACKEND_PORT ?= 3002

switch-env:
	@cat envs/web-app/.env.base envs/web-app/.env.$(BACKEND) > web-app/.env
	@cat envs/admin-dashboard/.env.base envs/admin-dashboard/.env.$(BACKEND) > admin-dashboard/.env
	@cat envs/backend/.env.base envs/backend/.env.$(BACKEND) > backend/.env

dev-lh:
	@$(MAKE) switch-env BACKEND=localhost
	docker compose up -d postgres redis
	npm run dev

dev-ts:
	@$(MAKE) switch-env BACKEND=tailscale
	docker compose -f docker-compose.yml -f docker-compose.local-proxy.yml up -d postgres redis ts-web ts-admin ts-api
	npm run dev

ts-certs:
	@docker exec barcody-barcode-scanner-for-anything-ts-web-1 tailscale cert barcody.tamarin-ph.ts.net 2>/dev/null || true
	@docker exec barcody-barcode-scanner-for-anything-ts-api-1 tailscale cert api-barcody.tamarin-ph.ts.net 2>/dev/null || true
	@docker exec barcody-barcode-scanner-for-anything-ts-admin-1 tailscale cert admin-barcody.tamarin-ph.ts.net 2>/dev/null || true

build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans --force-recreate

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

refresh:
	docker compose up -d --build --force-recreate -V --remove-orphans

logs:
	docker compose logs -f

funnel-on:
	@find infra/tailscale/ -name "*.json" -exec sed -i '/\"AllowFunnel\": {/,/}/ s/: false/: true/' {} +
	@docker compose restart ts-web ts-admin ts-api

funnel-off:
	@find infra/tailscale/ -name "*.json" -exec sed -i '/\"AllowFunnel\": {/,/}/ s/: true/: false/' {} +
	@docker compose restart ts-web ts-admin ts-api

help:
	@echo "    switch-env  					- Manually copy .env files (BACKEND=localhost|tailscale)"
	@echo "    make dev-lh   				- Pure localhost, no Tailscale (fast)"
	@echo "    make dev-ts   				- Dev via Tailscale network"
	@echo "    make ts-certs        - Provision Tailscale TLS certs (run once on first setup)"
	@echo "    build       					- Start production environment (Docker)"
	@echo "    up          					- Start full environment (Docker)"
	@echo "    down        					- Stop all containers"
	@echo "    restart     					- Restart all containers"
	@echo "    refresh     					- Deep rebuild (use if deps change)"
	@echo "    logs        					- Tail logs of all containers"
	@echo "    funnel-on   					- Enable public access via Tailscale Funnel"
	@echo "    funnel-off  					- Disable public access (Tailnet only)"
