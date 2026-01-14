# Tailscale Professional Setup: From Zero to World Class

This guide provides a comprehensive "Zero-to-End" workflow for setting up Tailscale, from the initial installation on your Ubuntu machine to the expert **Sidecar Architecture** for professional subdomain-based access.

---

## 🧠 The Concept: Why Tailscale?

Tailscale creates a secure, private network (a "Tailnet") between your devices. 
- **Privacy**: Your backend is NEVER exposed to the public internet.
- **Convenience**: Access your local services from your phone or laptop anywhere in the world as if they were local.
- **Security**: Automatic HTTPS certificates and per-device access controls.

---

## Part 1: Account Creation & Initial Setup

Before using Tailscale, you must have an account.

### 1. Create a Tailscale Account
1.  Go to [Tailscale.com](https://tailscale.com) and click **Get Started for Free**.
2.  Choose **Log in with Google** (or your preferred provider).
3.  **Note**: For this project, we are using: `engineerfortoday@gmail.com`.

### 2. Install Tailscale on Ubuntu
Run the official installation script on your server:
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

### 3. Authenticate & Connect
Start Tailscale and follow the login link in your browser:
```bash
sudo tailscale up
```
Login with the `engineerfortoday@gmail.com` account to join the Tailnet.

### 4. Verify Local Connectivity
Confirm your machine has joined and has a Tailscale IP (starting with `100.x.x.x`):
```bash
tailscale ip -4
```

---

## Part 2: Tailscale Admin Console Config

Login to the [Tailscale Admin Console](https://login.tailscale.com/admin/machines) to enable critical features:

1.  **Enable MagicDNS**: Settings > DNS > MagicDNS (**Required** for hostnames like `kai.ts.net`).
2.  **Enable HTTPS Certificates**: Settings > DNS > HTTPS Certificates (**Required** for standard SSL).
4.  **Rename Machines (Optional but Recommended)**:
    *   Find your PC in the list and rename it to: `kai`.
    *   Find your phone/mobile device in the list and rename it to: `mobile`.
5.  **Generate Auth Key**: Settings > Keys > **Generate Auth Key**.
    *   **Type**: Reusable (Required for multiple apps).
    *   **Pre-authorized**: ✅.
    *   Copy this key (starts with `tskey-auth-...`).

---

## Part 3: Professional Sidecar Architecture

We use the **Sidecar Pattern** to give every application its own independent identity and subdomain.

### 1. Root Configuration
Add your generated key to the root `.env` file of the project:
```bash
# /.env
TS_AUTHKEY=tskey-auth-khmwV9L4Uu11CNTRL-gxUG9SDVPiZ6u1n84Wg8iZSW2pSZNEBs
```

### 2. Sidecar Serve Definitions (`infra/tailscale/`)
We define JSON files that tell Tailscale how to route incoming traffic inside Docker.

**Example: `infra/tailscale/api.json`**
```json
{
  "TCP": { "443": { "HTTPS": true } },
  "Web": {
    "api-barcody.tamarin-ph.ts.net:443": {
      "Handlers": {
        "/": { "Proxy": "http://backend:3002" }
      }
    }
  }
}
```

### 3. Docker Integration (`docker-compose.yml`)
Each app is paired with a Tailscale container that handles its network identity.

```yaml
services:
  ts-api:
    image: tailscale/tailscale:latest
    hostname: api-barcody
    environment:
      - TS_AUTHKEY=${TS_AUTHKEY}
      - TS_SERVE_CONFIG=/config/api.json
    volumes:
      - ./infra/tailscale/api.json:/config/api.json
      - ts_api_state:/var/lib/tailscale
    cap_add: [NET_ADMIN]
```

---

## Part 4: Access & Verification

### 1. Launch the Stack
```bash
make rebuild-dev
```

### 2. Verify Security
Check logs to ensure the sidecar received its SSL certificate from Let's Encrypt:
```bash
docker logs barcody-barcode-scanner-for-anything-ts-web-1
# Look for: cert("barcody..."): got cert
```

### 3. The Professional URLs
*   **Web App**: `https://barcody.tamarin-ph.ts.net`
*   **Admin Dashboard**: `https://admin-barcody.tamarin-ph.ts.net`
*   **Backend API**: `https://api-barcody.tamarin-ph.ts.net/api/v1`

---

## Part 5: Mobile & Remote Access

To access the apps from your phone or tablet:

### 1. Install & Login
1.  **Download**: Search for **Tailscale** in the **App Store (iOS)** or **Google Play Store (Android)** and install it.
2.  **Login**: Open the app and log in using the same Google account (`engineerfortoday@gmail.com`).

### 2. Rename & Activate
1.  **Identity**: Once logged in, go to the Tailscale Admin Console and rename this new mobile node to `mobile` for easy identification.
2.  **Turn ON**: Toggle the VPN switch to **ON** in the mobile app.

### 3. Accessing the Apps
*   **Full URL**: Always include the full tailnet suffix (`.tamarin-ph.ts.net`).
*   **DNS Refresh**: If it fails, toggle Tailscale OFF and then ON again on your phone to refresh the MagicDNS list.
*   **SSL Warning**: If you see "Not Secure", ensure the Tailscale Sidecar has had ~2 minutes to fetch the certificate, and use `https://` explicitly.

---
*Architecture curated for the Barcody Stack.*
