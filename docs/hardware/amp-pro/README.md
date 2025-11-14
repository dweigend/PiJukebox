# INNO-MAKER AMP-Pro Setup Guide

## Hardware Specs

- **Board**: INNO-MAKER AMP-Pro HAT (Merus Audio MA120x0p)
- **Card Number**: 3 (`snd_rpi_merus_amp`)
- **Supported Formats**: S24_LE, S32_LE (NO 16-bit!)
- **Speakers**: 4-8Ω, 60W, 88dB sensitivity

## Quick Setup

### 1. Run Installation Script

```bash
cd docs/hardware/amp-pro
sudo ./install.sh
```

This will:

- Enable `dtoverlay=merus-amp` in `/boot/firmware/config.txt`
- Copy `asound.conf` to `/etc/asound.conf`
- Backup existing config if present
- Prompt for reboot

### 2. After Reboot

```bash
# Check if card 3 is detected
aplay -l

# Test audio
speaker-test -c 2 -t wav -D softvol

# Check volume
amixer -c 3
```

---

## Common Issues

### ❌ Problem: "Sample format non available"

**Symptom:**

```
aplay: set_params:1387: Sample format non available
Available formats: S24_LE, S32_LE
```

**Cause:** AMP-Pro only accepts 24-bit or 32-bit audio. Most audio files are 16-bit.

**Solution:** The provided `asound.conf` uses `plug` device for automatic format conversion (16-bit → 32-bit).

---

### ❌ Problem: No sound despite correct configuration

**Checklist:**

1. **Power Supply**: Use 12-24V, min 3A, high-quality
2. **No double power**: Pi should ONLY be powered via AMP-Pro board
3. **Speaker wiring**: Check L+/L- and R+/R- connections
4. **Volume**: Check with `amixer -c 3` - not muted or 0%?
5. **PulseAudio**: Should be removed (`ps aux | grep pulseaudio`)

**Volume Check:**

```bash
amixer -c 3

# If muted or 0%, set to 80%
amixer -c 3 set Master 80%
```

---

### ❌ Problem: Default device is still "Headphones"

**Possible causes:**

1. **PulseAudio overriding ALSA** → Remove: `sudo apt-get remove pulseaudio`
2. **User config overriding system config** → Check: `ls -la ~/.asoundrc`
3. **ALSA not reloaded** → Reboot or: `sudo alsactl kill rescan`

**Verify default device:**

```bash
aplay -L | grep default
# Should show "default" pointing to softvol/card 3
```

---

## Manual Installation

If `install.sh` doesn't work:

### 1. Enable Device Tree Overlay

```bash
echo "dtoverlay=merus-amp" | sudo tee -a /boot/firmware/config.txt
```

### 2. Copy ALSA Configuration

```bash
sudo cp asound.conf /etc/asound.conf
```

### 3. Reboot

```bash
sudo reboot
```

---

## Testing Commands

```bash
# List audio devices (should show card 3)
aplay -l

# List ALSA devices (should show 'default' and 'softvol')
aplay -L | grep -E "(default|softvol)"

# Test on softvol device
aplay -D softvol /usr/share/sounds/alsa/Front_Center.wav

# Test with speaker-test (2 channels, WAV file test)
speaker-test -c 2 -t wav -D softvol

# Check volume controls
amixer -c 3

# Set volume to 80%
amixer -c 3 set Master 80%
```

---

## Configuration Details

The provided `asound.conf` does the following:

1. **amp_hw**: Hardware device with `plug` for format conversion (16-bit → 32-bit)
   - Explicitly sets format to `S32_LE` (32-bit Little Endian)
   - Ensures compatibility with all audio sources

2. **softvol**: Volume limiter (max -6dB = ~50% volume)
   - Protects speakers from overdrive
   - Protects children's ears from excessive volume

3. **default**: Routes all audio through softvol → amp_hw → card 3
   - Ensures all applications use the correct audio device
   - Automatic format conversion for all audio sources

This ensures:

- ✅ All audio formats work (automatic conversion)
- ✅ Volume is limited to safe levels
- ✅ Card 3 is the default output for all applications

---

## Advanced Troubleshooting

### Still no sound after config?

```bash
# 1. Check if config is loaded
aplay -L | grep softvol

# 2. Test directly on hardware (bypass softvol)
aplay -D plughw:3,0 /usr/share/sounds/alsa/Front_Center.wav

# 3. Check kernel module
lsmod | grep snd_rpi_merus_amp

# 4. Check device tree overlay
dtoverlay -l | grep merus

# 5. Check system logs for errors
sudo journalctl -xe | grep -i audio
sudo journalctl -xe | grep -i alsa
```

### Noise or crackling?

- Check power supply quality (use clean, stable PSU)
- Test with LAN instead of WLAN
- Reduce volume: `amixer -c 3 set Master 60%`
- Check speaker connections (loose wiring can cause noise)

### Under-voltage warnings?

```bash
# Check for under-voltage events
sudo journalctl | grep -i voltage

# Monitor voltage in real-time
vcgencmd get_throttled
```

**Solution:** Use a better power supply (12V/3A or higher)

---

## References

- **GitHub Repo**: https://github.com/INNO-MAKER/AMP-Pro
- **Community Forum**: https://community.volumio.com/t/inno-maker-amp-hat/11274
- **Official Manual**: http://www.inno-maker.com/wp-content/uploads/2017/12/HIFI-AMP-HAT-User-Manual-V1.2.pdf
- **HowToHiFi Guide**: https://howtohifi.com/how-to-install-inno-maker-hifi-dac-pro-raspberry-pi/

---

## Power Supply Recommendations

- **Voltage**: 12-24V DC
- **Current**: Minimum 3A (5A recommended for high volume)
- **Quality**: Use a clean, regulated PSU (avoid cheap switching adapters)
- **Connection**: DC barrel jack (5.5mm) or screw terminals (NOT both!)

**⚠️ NEVER:**

- Hot-plug the power supply (always power off first)
- Use two power sources simultaneously (DC + USB)
- Use a low-quality or noisy PSU (causes crackling/damage)
