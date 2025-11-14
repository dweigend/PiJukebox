# CH57x USB Controller Setup

Setup guide for configuring CH57x-based USB macro keyboards for PiJukebox playback control.

> **Note:** This project uses a CH57x USB controller configured with **W/E/R keys** for Previous/Pause/Next playback control.

## 📚 Official Documentation

- **GitHub Repository:** [kriomant/ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool)
- **Configuration Example:** [example-mapping.yaml](https://github.com/kriomant/ch57x-keyboard-tool/blob/master/example-mapping.yaml)

## What is ch57x-keyboard-tool?

A cross-platform utility for configuring small macro keyboards using CH57x chipsets (CH9350, CH9329, CH9350L). It replaces vendor's Windows-only software with a configuration-file-based approach.

**Key Features:**

- Cross-platform (Linux, macOS, Windows)
- YAML-based configuration
- Multi-layer support (up to 3 layers)
- Key sequences and macros
- No runtime required (static configuration)

## Hardware Requirements

### Supported Devices

USB keyboards with vendor/product IDs:

- `1189:8890` (most common)
- `1189:8840`
- `1189:8842`

**Confirmed Compatible Models:**

- 3×4 with 2 knobs
- 3×3 with 2 knobs
- 3×2 with 1 knob
- 3×1 with 1 knob
- 4×1 without knobs

**For PiJukebox:**
Any CH57x controller with at least 3 buttons (W, E, R mapping)

### Identify Your Device

```bash
# Linux/Raspberry Pi
lsusb | grep 1189

# Expected output:
# Bus 001 Device 005: ID 1189:8890 ...
```

## Software Installation

### Raspberry Pi / Linux

#### Option 1: Install from Cargo (Recommended)

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 2. Install ch57x-keyboard-tool
cargo install ch57x-keyboard-tool

# 3. Verify installation
ch57x-keyboard-tool --version
```

#### Option 2: Download Prebuilt Binary

```bash
# Download latest release from GitHub
wget https://github.com/kriomant/ch57x-keyboard-tool/releases/latest/download/ch57x-keyboard-tool-linux-x86_64
chmod +x ch57x-keyboard-tool-linux-x86_64
sudo mv ch57x-keyboard-tool-linux-x86_64 /usr/local/bin/ch57x-keyboard-tool
```

### Linux Permissions Setup

**Option A: Use sudo (Quick)**

```bash
sudo ch57x-keyboard-tool <command>
```

**Option B: Configure udev rules (Recommended for permanent setup)**

```bash
# 1. Create udev rule
sudo nano /etc/udev/rules.d/50-usb-macrokeyboard.rules
```

Add the following line:

```
SUBSYSTEM=="usb", ATTRS{idVendor}=="1189", ATTRS{idProduct}=="8890", MODE="0666"
```

```bash
# 2. Reload udev rules
sudo udevadm control --reload-rules
sudo udevadm trigger

# 3. Reconnect the keyboard
```

## Configuration for PiJukebox

### Basic W/E/R Configuration

Create a configuration file for playback control:

**File:** `pijukebox-controller.yaml`

```yaml
# PiJukebox Playback Controller Configuration
# W = Previous, E = Pause/Play, R = Next

orientation: normal

# Device specifications (adjust based on your controller)
rows: 1
columns: 3
knobs: 0

# Layer 1: Playback controls
layers:
  - buttons:
      - - 'w' # Previous track
        - 'e' # Pause/Play toggle
        - 'r' # Next track
```

### Advanced Configuration (Multi-row Controller)

For controllers with more buttons:

**File:** `pijukebox-advanced.yaml`

```yaml
orientation: normal

rows: 3
columns: 3
knobs: 0

layers:
  # Layer 1: Main playback controls
  - buttons:
      # Row 1: Volume controls (optional)
      - - 'volumedown'
        - 'mute'
        - 'volumeup'

      # Row 2: Playback controls
      - - 'w' # Previous
        - 'e' # Pause/Play
        - 'r' # Next

      # Row 3: Additional functions (customize as needed)
      - - 'home' # Return to home
        - 'f5' # Refresh
        - 'esc' # Exit fullscreen
```

### Configuration with Knobs

If your controller has rotary encoders:

```yaml
orientation: normal

rows: 3
columns: 3
knobs: 2

layers:
  - buttons:
      - - 'w'
        - 'e'
        - 'r'
      - - 'home'
        - 'f5'
        - 'esc'
      - - '1'
        - '2'
        - '3'

    knobs:
      # Knob 1: Volume control
      - ccw: 'volumedown'
        press: 'mute'
        cw: 'volumeup'

      # Knob 2: Track navigation
      - ccw: 'w' # Previous track
        press: 'e' # Pause/Play
        cw: 'r' # Next track
```

## Upload Configuration

### 1. Validate Configuration

Always validate before uploading:

```bash
ch57x-keyboard-tool validate pijukebox-controller.yaml
```

**Expected output:**

```
Configuration is valid
```

### 2. Upload to Device

```bash
# Connect controller via USB, then:
sudo ch57x-keyboard-tool upload pijukebox-controller.yaml
```

**Expected output:**

```
Configuration uploaded successfully
```

### 3. Test

Press the keys (W, E, R) and verify they emit the correct keypresses in your system.

**Quick test on Linux:**

```bash
# Install xev if not available
sudo apt install x11-utils

# Monitor key events
xev | grep KeyPress
```

Press W/E/R on the controller - you should see corresponding key events.

## Available Key Names

Get a complete list of supported keys:

```bash
ch57x-keyboard-tool show-keys
```

**Common keys for media control:**

- `w`, `e`, `r` - Letter keys
- `prev`, `next` - Media previous/next
- `play` - Media play/pause
- `mute`, `volumeup`, `volumedown` - Volume control
- `home`, `esc`, `f5` - Navigation keys

**Modifiers:**

- `ctrl`, `alt`, `shift`, `cmd`/`win`

**Special actions:**

- `click`, `rclick`, `mclick` - Mouse clicks
- `wheelup`, `wheeldown` - Scroll wheel
- `move(x,y)` - Mouse movement

## Integration with PiJukebox

The PiJukebox KeyboardManager (`src/lib/managers/KeyboardManager.svelte.ts`) listens for W/E/R key events:

```typescript
// W = Previous track
// E = Pause/Play toggle
// R = Next track
```

**Recommended Configuration:**

- Use simple letter keys (w, e, r) instead of media keys
- Avoid modifier keys (Ctrl, Alt) for main playback controls
- Keep configuration on Layer 1 only (no layer switching needed)

## Troubleshooting

### Device Not Found

```bash
# Check if device is connected
lsusb | grep 1189

# If device has different vendor/product ID
ch57x-keyboard-tool --vendor-id 0x1189 --product-id 0x8890 upload config.yaml
```

### Permission Denied

```bash
# Quick fix: Use sudo
sudo ch57x-keyboard-tool upload config.yaml

# Permanent fix: Set up udev rules (see above)
```

### Configuration Validation Fails

```bash
# Check YAML syntax
ch57x-keyboard-tool validate pijukebox-controller.yaml

# Common issues:
# - Incorrect indentation (use spaces, not tabs)
# - Missing colons or quotes
# - Wrong number of buttons (rows × columns)
```

### Keys Not Working After Upload

1. **Reconnect the controller** (unplug and plug back in)
2. **Verify configuration was uploaded:**
   ```bash
   ch57x-keyboard-tool validate pijukebox-controller.yaml
   sudo ch57x-keyboard-tool upload pijukebox-controller.yaml
   ```
3. **Test with system key monitor** (xev on Linux)

### 3×1 Keyboard Modifier Limitation

On 3×1 keyboards, modifiers only work on the first key in sequences. If you need modifiers, upgrade to a larger controller.

## LED Configuration (Optional)

Some controllers support LED customization:

```bash
# Syntax: ch57x-keyboard-tool led <layer> <mode> [options]

# Examples:
ch57x-keyboard-tool led 0 backlight 5      # Backlight brightness level 5
ch57x-keyboard-tool led 0 shock 3          # Shock effect, speed 3
ch57x-keyboard-tool led 0 press 4          # Press-reactive, level 4
```

**Available modes:**

- `backlight <level>` - Static backlight (0-7)
- `shock <speed>` - Pulsing effect (0-7)
- `press <level>` - Keys light up on press (0-7)

## Example Files

Configuration examples are included in this directory:

- `pijukebox-controller.yaml` - Basic 3-button setup (W/E/R)
- `pijukebox-advanced.yaml` - Full controller with volume controls
- `pijukebox-knobs.yaml` - Configuration with rotary encoders

## Additional Resources

- **GitHub Repository:** [kriomant/ch57x-keyboard-tool](https://github.com/kriomant/ch57x-keyboard-tool)
- **Example Configuration:** [example-mapping.yaml](https://github.com/kriomant/ch57x-keyboard-tool/blob/master/example-mapping.yaml)
- **Issue Tracker:** [Report bugs](https://github.com/kriomant/ch57x-keyboard-tool/issues)

## Support

For issues specific to PiJukebox integration:

- **GitHub Issues:** [PiJukebox Issues](https://github.com/dweigend/PiJukebox/issues)

For ch57x-keyboard-tool issues:

- **Tool Issues:** [ch57x-keyboard-tool Issues](https://github.com/kriomant/ch57x-keyboard-tool/issues)

---

**Last Updated:** 2025-11-14
