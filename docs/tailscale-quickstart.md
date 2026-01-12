# Tailscale Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Install Tailscale on Backend Server
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

### 2. Start Backend
```bash
cd backend
make rebuild-dev
```

Backend will auto-detect Tailscale IP and log:
```
[TailscaleService] Tailscale IP auto-detected: 100.x.y.z
```

### 3. Generate QR Code
1. Open browser: `http://localhost:3000/setup/tailscale`
2. You'll see a QR code with your backend URL

### 4. Connect Mobile (Coming Soon - Task 9.3)
1. Install Tailscale app on phone
2. Connect to same Tailscale account
3. Open Barcody → Settings → "Scan Setup Code"
4. Scan the QR code

## ✅ Verification Checklist

- [ ] Tailscale installed: `tailscale version`
- [ ] Tailscale running: `tailscale status`
- [ ] IP detected: `tailscale ip -4`
- [ ] Backend running: `docker ps | grep barcody_backend`
- [ ] Web setup page loads: `http://localhost:3000/setup/tailscale`
- [ ] QR code visible on setup page
- [ ] Test connection button works

## 🔧 Environment Variables

**Required**: None (auto-detection works!)

**Optional**:
```bash
TAILSCALE_IP=100.x.y.z          # Manual override
TAILSCALE_HOSTNAME=my-backend    # Custom hostname
```

## 🐛 Common Issues

**"No Tailscale IP detected"**
```bash
sudo tailscale up  # Start Tailscale
```

**"Connection test fails"**
- Ensure your computer is also on Tailscale
- Or test from mobile device on Tailscale

## 📱 Mobile Setup (Pending Task 9.3)

The mobile QR scanner will be implemented next to complete the setup flow.
