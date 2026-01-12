# Tailscale Setup Guide

This guide explains how to configure Tailscale for Barcody to enable secure remote access to your self-hosted backend from your mobile device.

## What is Tailscale?

Tailscale creates a secure, private network (called a "tailnet") between your devices using WireGuard. This allows your mobile app to connect to your self-hosted backend without exposing it to the public internet.

## Prerequisites

- A Tailscale account (free tier is sufficient)
- Tailscale installed on your backend server
- Tailscale app installed on your mobile device

## Backend Setup

### 1. Install Tailscale

**On Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

**On macOS:**
```bash
brew install tailscale
```

**On Windows:**
Download from https://tailscale.com/download

### 2. Start Tailscale and Authenticate

```bash
sudo tailscale up
```

This will open a browser window to authenticate with your Tailscale account.

### 3. Get Your Tailscale IP

```bash
tailscale ip -4
```

This will output something like `100.x.y.z` - this is your Tailscale IP address.

### 4. Configure Backend Environment

The backend will **automatically detect** your Tailscale IP when it starts. However, you can also manually configure it:

**Option A: Automatic Detection (Recommended)**
- No configuration needed! The backend runs `tailscale ip -4` on startup.

**Option B: Manual Configuration**
Edit your `.env` file:
```bash
TAILSCALE_IP=100.x.y.z  # Replace with your actual IP
TAILSCALE_HOSTNAME=barcody-backend  # Optional: custom hostname
```

### 5. Verify Backend Configuration

Start your backend and check the logs:
```bash
make rebuild-dev
```

You should see:
```
[TailscaleService] Tailscale IP auto-detected: 100.x.y.z
```

## Web App Setup

### 1. Access the Setup Page

Once your backend is running with Tailscale configured:

1. Open your web browser
2. Navigate to: `http://localhost:3000/setup/tailscale`
3. You should see:
   - A QR code containing your backend URL
   - The Tailscale IP address
   - A "Test Connection" button

### 2. Test the Connection

Click the **"Test Connection"** button to verify:
- ✅ The backend is reachable via Tailscale IP
- ✅ The health endpoint responds
- ✅ Connection latency is acceptable

## Mobile App Setup

### 1. Install Tailscale on Mobile

- **iOS**: Download from App Store
- **Android**: Download from Google Play

### 2. Connect to Your Tailnet

1. Open the Tailscale app
2. Sign in with the same account as your backend
3. Ensure you're connected (you should see your backend device listed)

### 3. Scan the QR Code

1. Open the Barcody mobile app
2. Go to **Settings** → **"Scan Setup Code"**
3. Point your camera at the QR code on the web setup page
4. The app will automatically configure the backend URL

### 4. Verify Mobile Connection

The mobile app should automatically test the connection and display:
- ✅ Connected to backend
- ✅ Backend version
- ✅ Connection latency

## Troubleshooting

### Backend: "No Tailscale IP detected"

**Cause**: Tailscale is not installed or not running.

**Solution**:
```bash
# Check if Tailscale is running
tailscale status

# If not running, start it
sudo tailscale up
```

### Web: "Failed to load Tailscale configuration"

**Cause**: Backend is not running or Tailscale is not configured.

**Solution**:
1. Ensure backend is running: `docker ps | grep barcody_backend`
2. Check backend logs: `docker logs barcody_backend`
3. Verify Tailscale IP: `docker exec barcody_backend tailscale ip -4`

### Mobile: "Cannot connect to backend"

**Cause**: Mobile device is not on the same Tailscale network.

**Solution**:
1. Open Tailscale app on mobile
2. Ensure you're connected (toggle should be ON)
3. Verify you see your backend device in the device list
4. Try pinging the backend: `ping 100.x.y.z` (from Tailscale app's debug tools)

### Connection Test Fails from Web Browser

**Cause**: Your browser's computer is not on the Tailscale network.

**Solution**:
- Install Tailscale on your computer and connect to the same tailnet
- OR: The test will work from mobile devices that are on Tailscale

## Security Notes

- **Private Network**: Tailscale creates a private, encrypted network. Your backend is NOT exposed to the public internet.
- **Authentication**: All devices must authenticate with your Tailscale account.
- **Access Control**: You can configure Tailscale ACLs to restrict which devices can access your backend.

## Advanced Configuration

### Custom Hostname (MagicDNS)

Tailscale supports MagicDNS, allowing you to use hostnames instead of IP addresses:

1. Enable MagicDNS in your Tailscale admin console
2. Set `TAILSCALE_HOSTNAME` in your backend `.env`
3. Access backend via: `http://barcody-backend.ts.net:8000`

### Multiple Backends

If you run multiple Barcody instances:

1. Give each backend a unique hostname
2. Generate separate QR codes for each
3. Mobile app can switch between backends in settings

## Next Steps

- ✅ Backend configured with Tailscale
- ✅ Web setup page generates QR codes
- 🔲 Mobile app QR scanner (Task 9.3)
- 🔲 Mobile app backend URL configuration
- 🔲 Mobile app connection testing
