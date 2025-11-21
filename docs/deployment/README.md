# Raspberry Pi Deployment

Deploy PiJukebox on Raspberry Pi OS with labwc (Wayland).

---

## Setup

### 1. Install Project

```bash
# Move to /opt (required - home directory not accessible at boot)
sudo mv ~/PiJukebox /opt/pijukebox
sudo chown -R $USER:$USER /opt/pijukebox
cd /opt/pijukebox
bun install
bun run build
```

### 2. Create Systemd Service

Create `/etc/systemd/system/pijukebox.service`:

```ini
[Unit]
Description=PiJukebox Bun Server
After=network-online.target local-fs.target
Wants=network-online.target

[Service]
Type=simple
User=pi
Group=pi
WorkingDirectory=/opt/pijukebox
ExecStartPre=/bin/sleep 5
ExecStart=/usr/local/bin/bun run start --host
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

**Important**:

- Replace `User=pi` with your username
- Update `ExecStart=` with output of `which bun`

Enable service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pijukebox.service
sudo systemctl start pijukebox.service
```

### 3. Chromium Kiosk Autostart

Create `~/.config/labwc/autostart`:

```bash
#!/bin/sh
until curl -s http://localhost:3000 > /dev/null; do
   sleep 2
done

DISPLAY=:0 chromium \
  --ozone-platform=wayland \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --password-store=basic \
  http://localhost:3000 &
```

Make executable:

```bash
chmod +x ~/.config/labwc/autostart
```

Reboot:

```bash
sudo reboot
```

---

## Updates

```bash
# Build locally
bun run build

# Sync to Pi
rsync -avz --exclude node_modules --exclude .git \
  ./ pi@raspberrypi.local:/opt/pijukebox/

# Restart service
ssh pi@raspberrypi.local "sudo systemctl restart pijukebox.service"
```

---

## Troubleshooting

```bash
# Check service
sudo systemctl status pijukebox.service

# View logs
sudo journalctl -u pijukebox.service -n 50

# Test manually
cd /opt/pijukebox
bun run start --host
```

---

## Access

- **Local**: `http://localhost:3000`
- **Network**: `http://<PI_IP>:3000` (find with `hostname -I`)
- **mDNS**: `http://raspberrypi.local:3000`

---

## Security

### CSRF Protection

**Current Configuration:** CSRF origin checks are **disabled** in `svelte.config.js`:

```javascript
csrf: {
	checkOrigin: false;
}
```

**Why disabled:**

- Allows access from any device in your local network (Mac, phone, tablet)
- Necessary for remote admin access via IP address (e.g., `http://192.168.1.177:3000/admin`)

**Security Status:**

✅ **SAFE for:**

- Local network only (home network, no internet access)
- Raspberry Pi without port forwarding
- Internal use (family/household)

❌ **UNSAFE for:**

- Internet-exposed servers (port forwarding enabled)
- Public IP addresses
- Cloud deployments

**If you need to expose this to the internet:**

1. Enable CSRF origin check in `svelte.config.js`:

```javascript
csrf: {
	checkOrigin: true;
}
```

2. Configure allowed origins (if using reverse proxy):

```javascript
csrf: {
  checkOrigin: true,
  origin: ['https://yourdomain.com']
}
```

3. Consider additional security:
   - Add authentication (basic auth, OAuth)
   - Use HTTPS (Let's Encrypt, reverse proxy)
   - Implement rate limiting
   - Use a VPN instead of public exposure

**Recommendation:** Keep the Pi on your local network only. Use VPN or Tailscale for remote access from outside your home.
