<div align="center">
  <img src="web-app/public/brand-logo.svg" alt="Barcody Logo" width="120" height="120" />
  <h1>Barcody</h1>
  <p>Universal Barcode Intelligence &amp; Scanning Suite</p>
</div>

Barcody is a professional, high-performance monorepo designed for scanning, managing, and analyzing barcodes at scale. Built with **Next.js 16**, **NestJS 11**, and **Tailwind CSS v4**, it provides a seamless cross-platform experience with real-time data synchronization and advanced analytics.

## ✨ Core Features

- **📱 Cross-Platform Scanning**: High-performance mobile application for instant precision scanning.
- **📊 Advanced Analytics**: Real-time insights and data visualization for scanned assets.
- **🌐 Dual Dashboards**: Specialized interfaces for both End Users and Administrators.
- **🔐 Secure Auth**: Seamless integration with Google OAuth 2.0.
- **📁 Universal Support**: Full compatibility with QR codes, UPC, EAN, and more.
- **🎨 Elite UI**: Stunning dark-mode interface built with Tailwind CSS v4 and Shadcn UI.
- **🔌 Real-time Updates**: Socket.io integration for instant data synchronization.
- **🐳 Docker Ready**: Fully containerized architecture for effortless deployment.

---

## 📸 Application Preview

### 🌐 User Web App
The end-user experience optimized for speed and clarity.

| Feature | Preview |
|---|---|
| **Modern Landing** | ![Home](assets/preview/web-01-home.gif) |
| **Precision Scanning** | ![Scan](assets/preview/web-02-scan.gif) |
| **Activity History** | ![History](assets/preview/web-03-history.gif) |

### 🛡️ Admin Dashboard
Comprehensive management suite for system administrators.

| Module | Preview |
|---|---|
| **Overview Console** | ![Admin Home](assets/preview/admin-01-home.gif) |
| **Control Center** | ![Admin Dashboard](assets/preview/admin-02-dashboard.gif) |
| **Intelligence Lab** | ![Admin Analytics](assets/preview/admin-03-analytics.gif) |
| **User Governance** | ![Admin Users](assets/preview/admin-04-users.gif) |
| **Global Audit** | ![Admin Scans](assets/preview/admin-05-scans.gif) |

---

## 🛠️ Technology Stack

- **Frameworks**: [Next.js 16](https://nextjs.org/), [NestJS 11](https://nestjs.com/)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Mobile**: [React Native](https://reactnative.dev/)
- **Backend**: [Node.js 22](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/), [Redis](https://redis.io/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Real-time**: [Socket.io](https://socket.io/)
- **API Docs**: [Swagger/OpenAPI](https://swagger.io/)
- **Containerization**: [Docker](https://www.docker.com/)
- **Private Networking**: [Tailscale](https://tailscale.com/)

---

## 🚀 Installation & Setup

Barcody uses a hybrid setup: Docker for services (Database, Redis, Tailscale Sidecars) and either Docker or local Node.js for the applications.

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js 22+**
- **Docker** and **Docker Compose**
- **Git**

### 2. Clone the Repository

```bash
git clone https://github.com/nishan-paul-2022/barcody-barcode-scanner-for-anything
cd barcody-barcode-scanner-for-anything
```

### 3. Configuration

Create your environment configuration in both the backend and web-app directories:

```bash
cp backend/.env.example backend/.env
cp web-app/.env.example web-app/.env
```

#### 3.1 ⚙️ App Configuration
Essential settings for the application server.
- **Backend**: Update `backend/.env` with your secrets.
- **Web App**: Update `web-app/.env` with the API URL.
- **Hash Secret**: Run `openssl rand -hex 32` and paste into `ANALYTICS_HASH_SECRET` in `backend/.env`.

#### 3.2 🌐 Google OAuth
To enable user login, you must set up Google OAuth in the Google Cloud Console.
- **Authorized Redirect URI**: `http://localhost:3000/api/auth/callback/google`

### 4. Running the Application

Choose the method that fits your needs:

#### Option A: Local Development (Recommended)
Runs the apps locally with hot-reloading enabled, connected to the Dockerized database and Tailscale proxies. Best for active coding.

```bash
make dev
```

#### Option B: Full Docker Environment
Runs the entire application suite in Docker containers.

```bash
make up
```

#### Option C: Production Build
Optimized production deployment via Docker.

```bash
make build
```

> **Local access points:**
> - **Web App**: [http://localhost:3000](http://localhost:3000)
> - **Admin Dashboard**: [http://localhost:3001](http://localhost:3001)
> - **API Docs**: [http://localhost:3002/api/docs](http://localhost:3002/api/docs)

---

## 🔒 Tailscale Private Network Setup

Barcody uses **Tailscale** to create a secure, private network (Tailnet) so you can access all services remotely over HTTPS without exposing anything to the public internet. The stack uses a **Sidecar Architecture** — each service gets its own Tailscale container with a dedicated subdomain and automatic SSL certificate.

### Why Tailscale?

| Without Tailscale | With Tailscale |
|---|---|
| Services only accessible on `localhost` | Access from any device, anywhere |
| No HTTPS in development | Automatic HTTPS via Let's Encrypt |
| Requires port forwarding / reverse proxy | Zero-config private networking |
| Backend exposed publicly | Backend stays fully private |

---

### Part 1 — Account Creation (Web)

1. Go to **[tailscale.com](https://tailscale.com)** and click **"Get Started for Free"**.
2. Sign in with **Google** (or your preferred SSO provider).
3. Complete onboarding — your account creates a private **Tailnet** automatically.

---

### Part 2 — Install Tailscale on Ubuntu (Terminal)

Run the official one-line install script on your Linux machine:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Authenticate your machine and join your Tailnet:

```bash
sudo tailscale up
```

A login link will appear in your terminal. Open it in your browser and approve the device. Once done, verify your machine has a Tailscale IP:

```bash
tailscale ip -4
# Expected output: 100.x.x.x
```

---

### Part 3 — Admin Console Configuration (Web)

Log in to the **[Tailscale Admin Console](https://login.tailscale.com/admin/machines)** and configure the following:

#### 3.1 Enable MagicDNS
> **Settings → DNS → MagicDNS → Enable**

This allows devices on your Tailnet to reach each other by hostname (e.g., `barcody.your-tailnet.ts.net`) instead of raw IP addresses.

#### 3.2 Enable HTTPS Certificates
> **Settings → DNS → HTTPS Certificates → Enable**

This allows Tailscale to issue automatic SSL certificates from Let's Encrypt for your Tailnet hostnames.

#### 3.3 Rename Your Machine (Optional but Recommended)
> **Go to the Machines tab → Click the `...` menu next to your PC → Rename**

Give your development machine a clean, short name (e.g., `kai`). This becomes part of your domain: `barcody.kai.ts.net`.

#### 3.4 Generate an Auth Key
> **Settings → Keys → Generate Auth Key**

This key allows Docker containers to join your Tailnet automatically (non-interactively).

| Setting | Value |
|---|---|
| **Type** | Reusable |
| **Pre-authorized** | ✅ Yes |
| **Expiry** | Set to your preference |

Copy the generated key — it starts with `tskey-auth-...`.

---

### Part 4 — Set Your Domain in the Project

#### 4.1 Add the Auth Key to the Root `.env`

Open the root `.env` file and add your Tailscale auth key:

```bash
# .env (root of the project)
TS_AUTHKEY=tskey-auth-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 4.2 Update the Serve Config Files

The Tailscale sidecar containers read JSON config files from `infra/tailscale/` to know which domain and port to serve. You need to update these with **your own Tailnet domain**.

Your Tailnet domain follows the pattern: `<machine-name>.<tailnet-name>.ts.net`

Find your exact domain in the [Tailscale Admin Console](https://login.tailscale.com/admin/machines) → click your machine → copy the full MagicDNS name.

Update all three serve config files:

**`infra/tailscale/web.json`** — Web App (port 3000)
```json
{
  "TCP": { "443": { "HTTPS": true } },
  "Web": {
    "barcody.<your-tailnet>.ts.net:443": {
      "Handlers": {
        "/": { "Proxy": "http://web:3000" }
      }
    }
  },
  "AllowFunnel": {
    "barcody.<your-tailnet>.ts.net:443": false
  }
}
```

**`infra/tailscale/admin.json`** — Admin Dashboard (port 3001)
```json
{
  "TCP": { "443": { "HTTPS": true } },
  "Web": {
    "admin-barcody.<your-tailnet>.ts.net:443": {
      "Handlers": {
        "/": { "Proxy": "http://admin-dashboard:3001" }
      }
    }
  },
  "AllowFunnel": {
    "admin-barcody.<your-tailnet>.ts.net:443": false
  }
}
```

**`infra/tailscale/api.json`** — Backend API (port 3002)
```json
{
  "TCP": { "443": { "HTTPS": true } },
  "Web": {
    "api-barcody.<your-tailnet>.ts.net:443": {
      "Handlers": {
        "/": { "Proxy": "http://backend:3002" }
      }
    }
  },
  "AllowFunnel": {
    "api-barcody.<your-tailnet>.ts.net:443": false
  }
}
```

> **Local dev variants**: For `make dev` mode (apps run locally, not in Docker), use the `-local` variants in `infra/tailscale/` — they proxy to `host.docker.internal` instead of Docker service names.

#### 4.3 Update the API URL in docker-compose.yml

When the web and admin containers are built, they need to know the Tailscale API URL at build time. Open `docker-compose.yml` and update the build args:

```yaml
# docker-compose.yml — web service
args:
  - NEXT_PUBLIC_API_URL=https://api-barcody.<your-tailnet>.ts.net/api/v1

# docker-compose.yml — admin-dashboard service
args:
  - NEXT_PUBLIC_API_URL=https://api-barcody.<your-tailnet>.ts.net/api/v1
```

---

### Part 5 — Launch & Verify

Start the full stack (including Tailscale sidecars):

```bash
make dev     # Local dev with Tailscale proxies
# or
make up      # Full Docker stack
```

Wait ~2 minutes for the Tailscale containers to register with the network and fetch SSL certificates. Then verify:

```bash
# Check that the web sidecar received its SSL certificate
docker logs barcody-barcode-scanner-for-anything-ts-web-1
# Look for: cert("barcody..."): got cert

# Check API sidecar
docker logs barcody-barcode-scanner-for-anything-ts-api-1
# Look for: cert("api-barcody..."): got cert
```

#### Your Private HTTPS URLs

Once running, your services are accessible at:

| Service | URL |
|---|---|
| 🌐 Web App | `https://barcody.<your-tailnet>.ts.net` |
| 🛡️ Admin Dashboard | `https://admin-barcody.<your-tailnet>.ts.net` |
| ⚙️ Backend API | `https://api-barcody.<your-tailnet>.ts.net/api/v1` |
| 📖 API Docs | `https://api-barcody.<your-tailnet>.ts.net/api/docs` |

---

### Part 6 — Mobile & Remote Access

Access all services from your phone or any other device using the Tailscale app.

#### 6.1 Install the Tailscale App

- **iOS**: Search for **Tailscale** in the **App Store** and install it.
- **Android**: Search for **Tailscale** in the **Google Play Store** and install it.

#### 6.2 Login & Connect

1. Open the Tailscale app on your phone.
2. Tap **Sign in** and use the **same account** you used to create your Tailnet.
3. Toggle the **VPN switch to ON**.

#### 6.3 Rename Your Mobile Device (Recommended)

In the [Tailscale Admin Console](https://login.tailscale.com/admin/machines), rename your phone to something like `mobile` for easy identification.

#### 6.4 Access the App

Open your browser on mobile and navigate to the full Tailscale URL:

- **Web App**: `https://barcody.<your-tailnet>.ts.net`
- **Admin**: `https://admin-barcody.<your-tailnet>.ts.net`

> **Troubleshooting Tips**:
> - Always use the **full HTTPS URL** — do not omit the `https://` prefix.
> - If a URL fails to load, toggle Tailscale **OFF → ON** on your phone to refresh the MagicDNS list.
> - If you see a "Not Secure" warning, wait ~2 minutes for the sidecar to obtain its SSL certificate, then retry.

---

### Part 7 — Tailscale Funnel (Optional Public Access)

By default, all services are **private** (Tailnet only). To temporarily expose a service to the public internet, use the Makefile shortcuts:

```bash
# Enable public access for all services
make funnel-on

# Disable public access (back to Tailnet only)
make funnel-off
```

> ⚠️ **Warning**: Funnel makes your services publicly accessible on the internet. Only enable this for demos or testing, and always disable it afterward with `make funnel-off`.

---

### Part 8 — Tailscale Architecture Overview

```
Your Device (Tailscale ON)
        │
        │  Tailnet (encrypted WireGuard)
        │
┌───────▼─────────────────────────────────────────┐
│                 Docker Stack                    │
│                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ ts-web   │    │ ts-admin │    │ ts-api   │   │
│  │ sidecar  │    │ sidecar  │    │ sidecar  │   │
│  │ :443 SSL │    │ :443 SSL │    │ :443 SSL │   │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘   │
│       │               │               │         │
│  ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐   │
│  │  web     │    │ admin-   │    │ backend  │   │
│  │  :3000   │    │ dashboard│    │  :3002   │   │
│  └──────────┘    │  :3001   │    └──────────┘   │
│                  └──────────┘                   │
│  ┌──────────┐    ┌──────────┐                   │
│  │ postgres │    │  redis   │                   │
│  │  :5432   │    │  :6379   │                   │
│  └──────────┘    └──────────┘                   │
└─────────────────────────────────────────────────┘
```

Each app is paired with a dedicated Tailscale **sidecar container** that:
- Registers a unique hostname on the Tailnet (e.g., `barcody`, `admin-barcody`, `api-barcody`)
- Manages SSL certificate issuance automatically via Let's Encrypt
- Acts as a reverse proxy, forwarding HTTPS traffic to the app container on the internal Docker network

---

## 📋 Makefile Reference

| Command | Description |
|---|---|
| `make dev` | Start local development (Apps local + DB & Tailscale in Docker) |
| `make up` | Start full Docker environment |
| `make build` | Build and start production containers |
| `make down` | Stop all containers |
| `make restart` | Restart all containers |
| `make refresh` | Deep rebuild (use when dependencies change) |
| `make logs` | Tail logs from all containers |
| `make funnel-on` | Enable public internet access via Tailscale Funnel |
| `make funnel-off` | Disable public access (Tailnet-only mode) |

---

<div align="center">
  <img src="web-app/public/company-logo.svg" alt="KAI Logo" width="80" height="80" />
  <p>Built with ❤️ by <a href="https://kaiverse.vercel.app/" target="_blank"><b>KAI</b></a></p>
</div>
