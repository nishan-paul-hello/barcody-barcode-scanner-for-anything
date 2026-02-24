<div align="center">
  <img src="web-app/public/brand-logo.svg" alt="Barcody Logo" width="120" height="120" />
  <h1>Barcody</h1>
  <p>Universal Barcode Intelligence & Scanning Suite</p>
</div>

Barcody is a professional, high-performance monorepo designed for scanning, managing, and analyzing barcodes at scale. Built with **Next.js 16**, **NestJS 11**, and **Tailwind CSS v4**, it provides a seamless cross-platform experience with real-time data synchronization and advanced analytics.

<div align="center">
  <br />
  <img src="web-app/public/brand-logo.svg" alt="Barcody Dashboard" width="100%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); opacity: 0.8;" />
  <br />
</div>

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

---

## 🚀 Installation & Setup

Barcody uses a hybrid setup: Docker for services (Database, Redis) and either Docker or local Node.js for the applications.

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
Runs the apps locally with hot-reloading enabled, connected to the Dockerized database. Best for coding.

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

> **Access points:**
> - **Web App**: [http://localhost:3000](http://localhost:3000)
> - **Admin Dashboard**: [http://localhost:3001](http://localhost:3001)
> - **API Docs**: [http://localhost:3002/api/docs](http://localhost:3002/api/docs)

---

<div align="center">
  <img src="web-app/public/company-logo.svg" alt="KAI Logo" width="80" height="80" />
  <p>Built with ❤️ by <a href="https://kaiverse.vercel.app/" target="_blank"><b>KAI</b></a></p>
</div>

