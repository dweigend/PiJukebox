# Innomaker Amp Pro Setup

Setup guide for the Innomaker Amp Pro (Merus MA12070P) amplifier on Raspberry Pi.

> **Note:** This project uses the **INNO-MAKER AMP-Pro**. This guide describes the complete setup via SSH/CLI.

## 📚 Official Documentation

- **GitHub Repository:** [INNO-MAKER/AMP-Pro](https://github.com/INNO-MAKER/AMP-Pro)
- **Wiki & Manual:** [Geekworm Amp Pro Wiki](https://wiki.geekworm.com/AMP_Pro)

## Hardware Requirements

### Amplifier

- **Product:** INNO-MAKER Amp Pro
- **Chipset:** Infineon Merus MA12070P (Class-D Amplifier)
- **Power:** 2×80W Peak Output (2×50W RMS @ 4Ω)
- **Compatibility:** Raspberry Pi 3/4/5 (40-pin GPIO Header)
- **Cooling:** Integrated passive heatsink
- **Dimensions:** HAT format (65mm × 56mm)

### Power Supply

- **Voltage:** 9-24V DC (±5%), recommended 12V or 19V
- **Current:** Minimum 3A (up to 5A depending on volume)
- **Connection:** DC Jack (5.5mm × 2.1mm) or screw terminal (2-pin)
- **IMPORTANT:** Use quality power supply (voltage spikes can exceed 30V)

### Speakers

- **Impedance:** 4Ω or 8Ω (4Ω recommended for maximum power)
- **Power:** Minimum 50W RMS per channel
- **Connection:** 6-pin screw terminal (see pinout below)

## ⚠️ Safety Warnings

**CRITICAL - Read before installation!**

1. **NEVER Hot-Plug!**
   - ✅ Correct: Connect power supply to Amp Pro → **then** turn on power supply
   - ❌ Wrong: Connect Amp Pro while power supply is running
   - **Risk:** Board will be destroyed!

2. **Power Supply:**
   - 9-24V DC ±5%, minimum 3A
   - Use quality power supply (voltage spikes can exceed 30V)

3. **Speakers:**
   - Observe polarity (do not reverse)
   - Correct pin assignment (see below)

## Hardware Connection

### Power Supply (Choose one):

- **DC Jack:** 9-24V with 5.5mm barrel connector
- **Green Connector PIN-1/2:** Alternative +/- supply

### Speaker Pins (Amp Pro):

- **PIN-3:** Right Speaker Negative (-)
- **PIN-4:** Right Speaker Positive (+)
- **PIN-5:** Left Speaker Positive (+)
- **PIN-6:** Left Speaker Negative (-)

## Software Installation

### Option 1: Automatic Installation (Recommended)

```bash
cd docs/hardware/amp-pro
chmod +x install.sh
./install.sh
```

> **Note:** Configuration files (`asound.conf`, `install.sh`) are located in the `docs/hardware/amp-pro/` subdirectory.

The script will:

1. Add `dtoverlay=merus-amp` to `/boot/firmware/config.txt`
2. Install ALSA configuration to `/etc/asound.conf`
3. Create backup of existing configuration
4. Offer to reboot

### Option 2: Manual Installation

#### Step 1: Enable Device Tree Overlay

```bash
sudo nano /boot/firmware/config.txt
```

Add at the end:

```
dtoverlay=merus-amp
```

Save (Ctrl+O, Enter, Ctrl+X)

#### Step 2: ALSA Configuration

```bash
sudo cp docs/hardware/amp-pro/asound.conf /etc/asound.conf
```

Or create manually:

```bash
sudo nano /etc/asound.conf
```

Content (see `docs/hardware/amp-pro/asound.conf`):

```conf
# Softvol PCM with 50% volume limit
pcm.softvol {
    type softvol
    slave.pcm "hw:3,0"          # Amp Pro (Card 3)
    control {
        name "Master"
        card 3
    }
    min_dB -40.0                # Minimum
    max_dB -6.0                 # Maximum: ~50% hardware volume
}

pcm.!default {
    type plug
    slave.pcm "softvol"
}

ctl.!default {
    type hw
    card 3
}
```

#### Step 3: Reboot

```bash
sudo reboot
```

## Verification

### After Reboot - Check Sound Card:

```bash
aplay -l
```

**Expected output:**

```
card 3: sndrpimerusamp [snd_rpi_merus_amp], device 0: Merus Audio Amp ma120x0p-amp-0
```

### Test Audio Playback:

```bash
# WAV test (2 channels)
speaker-test -c2 -t wav

# With MP3 (install mpg123 if needed)
mpg123 /path/to/test.mp3
```

### Adjust Volume:

```bash
alsamixer
# Press F6 → Select "snd_rpi_merus_amp"
# Arrow keys: Adjust volume
# M: Mute/Unmute
```

Or via CLI:

```bash
# Show volume
amixer -c 3 scontrols

# Set volume (0-100%)
amixer -c 3 set Master 80% unmute
```

## Volume Limiting

The included `asound.conf` limits maximum volume to **50% of hardware capacity** (`max_dB -6.0`).

**Adjusting Maximum Volume:**

Edit `max_dB` value in `/etc/asound.conf`:

```conf
max_dB -6.0     # ~50% (default)
max_dB -10.0    # ~32% (quieter)
max_dB -12.0    # ~25% (very safe for children)
max_dB -3.0     # ~70% (louder)
max_dB 0.0      # 100% (no limit)
```

After modification:

```bash
sudo alsactl restore
# or
sudo reboot
```

**Advantage:** The web application (howler.js) can control volume from 0-100%, where 100% in code = 50% of hardware volume.

## Integration with PiJukebox

This project uses howler.js for audio playback. Howler.js automatically uses the system default sound card (defined in `/etc/asound.conf`).

**Test in project:**

```bash
cd /path/to/PiJukebox
bun run dev
```

Open browser → Audio should play through connected speakers.

## Troubleshooting

### Problem: No Sound / Sound Too Quiet

```bash
# Check if muted
amixer -c 3 scontrols
amixer -c 3 set Master 80% unmute

# Reload ALSA state
sudo alsactl restore
```

### Problem: Amp Pro Not Detected

```bash
# Check device tree overlay
vcgencmd get_config dtoverlay
# Should contain: "dtoverlay=merus-amp"

# Check kernel modules
lsmod | grep snd
```

### Problem: Wrong Card Number

If `aplay -l` shows a different card number than `3`, adjust `/etc/asound.conf`:

```conf
slave.pcm "hw:X,0"    # X = your card number
control {
    name "Master"
    card X
}
```

### Problem: Config File Not Found

On older Raspberry Pi OS versions, the config is located at `/boot/config.txt` instead of `/boot/firmware/config.txt`.

## Compatibility

**Tested with:**

- Raspberry Pi 4 Model B
- Raspberry Pi OS Lite (Debian 12 Bookworm)

**Compatible with:**

- Raspberry Pi 3/4/5
- Raspberry Pi OS (Raspbian)
- Volumio, MoOde Audio, LibreELEC, OSMC

## Additional Resources

- [GitHub Repository](https://github.com/INNO-MAKER/AMP-Pro)
- [Geekworm Wiki](https://wiki.geekworm.com/AMP_Pro)
- [ALSA softvol Documentation](https://alsa.opensrc.org/Softvol)

## Support

For issues, see also:

- **GitHub Issues:** [PiJukebox Issues](https://github.com/dweigend/PiJukebox/issues)
- **INNO-MAKER Support:** [GitHub Issues](https://github.com/INNO-MAKER/AMP-Pro/issues)
- **Geekworm Forum:** [Support Portal](https://www.geekworm.com/pages/contact-us)
