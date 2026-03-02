.PHONY: switch-env \
        dev-lh build-lh up-lh refresh-lh \
        dev-ts build-ts up-ts refresh-ts cert-ts funnel-on-ts funnel-off-ts \
        down restart logs help

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

build-lh:
	@$(MAKE) switch-env BACKEND=localhost
	@set -a && . ./web-app/.env && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans --force-recreate

up-lh:
	@$(MAKE) switch-env BACKEND=localhost
	@set -a && . ./web-app/.env && docker compose -f docker-compose.yml up -d

refresh-lh:
	@$(MAKE) switch-env BACKEND=localhost
	@set -a && . ./web-app/.env && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --force-recreate -V --remove-orphans

dev-ts:
	@$(MAKE) switch-env BACKEND=tailscale
	docker compose -f docker-compose.yml -f docker-compose.local-proxy.yml up -d postgres redis ts-web ts-admin ts-api
	npm run dev

build-ts:
	@$(MAKE) switch-env BACKEND=tailscale
	@set -a && . ./web-app/.env && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans --force-recreate

up-ts:
	@$(MAKE) switch-env BACKEND=tailscale
	@set -a && . ./web-app/.env && docker compose -f docker-compose.yml up -d

refresh-ts:
	@$(MAKE) switch-env BACKEND=tailscale
	@set -a && . ./web-app/.env && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --force-recreate -V --remove-orphans

cert-ts:
	@docker exec barcody-barcode-scanner-for-anything-ts-web-1 tailscale cert barcody.tamarin-ph.ts.net 2>/dev/null || true
	@docker exec barcody-barcode-scanner-for-anything-ts-api-1 tailscale cert api-barcody.tamarin-ph.ts.net 2>/dev/null || true
	@docker exec barcody-barcode-scanner-for-anything-ts-admin-1 tailscale cert admin-barcody.tamarin-ph.ts.net 2>/dev/null || true

funnel-on-ts:
	@find infra/tailscale/ -name "*.json" -exec sed -i '/\"AllowFunnel\": {/,/}/ s/: false/: true/' {} +
	@docker compose restart ts-web ts-admin ts-api

funnel-off-ts:
	@find infra/tailscale/ -name "*.json" -exec sed -i '/\"AllowFunnel\": {/,/}/ s/: true/: false/' {} +
	@docker compose restart ts-web ts-admin ts-api

down:
	docker compose -f docker-compose.yml down

restart:
	docker compose -f docker-compose.yml restart

logs:
	docker compose -f docker-compose.yml logs -f

help:
	@echo "    make dev-lh           - Dev mode on localhost (hot reload)"
	@echo "    make build-lh         - Build production image for localhost"
	@echo "    make up-lh            - Start production containers (localhost)"
	@echo "    make refresh-lh       - Deep rebuild for localhost (use if deps change)"
	@echo "    make dev-ts           - Dev mode via Tailscale (hot reload)"
	@echo "    make build-ts         - Build production image for Tailscale"
	@echo "    make up-ts            - Start production containers (Tailscale)"
	@echo "    make refresh-ts       - Deep rebuild for Tailscale (use if deps change)"
	@echo "    make cert-ts          - Provision Tailscale TLS certs (run once)"
	@echo "    make funnel-on-ts     - Enable public access via Tailscale Funnel"
	@echo "    make funnel-off-ts    - Disable public access (Tailnet only)"
	@echo "    make down             - Stop all containers"
	@echo "    make restart          - Restart all containers (no rebuild)"
	@echo "    make logs             - Tail logs of all containers"
