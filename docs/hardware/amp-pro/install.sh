#!/bin/bash
# Innomaker Amp Pro Installation Script for Raspberry Pi
# Repository: https://github.com/dweigend/kinder_audio_2

set -e

echo "=========================================="
echo "Innomaker Amp Pro Setup"
echo "=========================================="
echo ""

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    echo "⚠️  Warning: This doesn't appear to be a Raspberry Pi"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 1. Enable device tree overlay
echo "1. Configuring device tree overlay..."
CONFIG_FILE="/boot/firmware/config.txt"
OVERLAY_LINE="dtoverlay=merus-amp"

if ! grep -q "^$OVERLAY_LINE" "$CONFIG_FILE" 2>/dev/null; then
    echo "   Adding '$OVERLAY_LINE' to $CONFIG_FILE"
    echo "$OVERLAY_LINE" | sudo tee -a "$CONFIG_FILE" > /dev/null
    echo "   ✅ Device tree overlay added"
else
    echo "   ✅ Device tree overlay already configured"
fi

# 2. Copy ALSA configuration
echo ""
echo "2. Installing ALSA configuration..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASOUND_CONF="/etc/asound.conf"

if [ -f "$ASOUND_CONF" ]; then
    echo "   ⚠️  Existing $ASOUND_CONF found"
    echo "   Creating backup: ${ASOUND_CONF}.backup"
    sudo cp "$ASOUND_CONF" "${ASOUND_CONF}.backup"
fi

sudo cp "$SCRIPT_DIR/asound.conf" "$ASOUND_CONF"
echo "   ✅ ALSA configuration installed"

# 3. Show summary
echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: Reboot required for changes to take effect"
echo ""
echo "After reboot:"
echo "  1. Check audio devices: aplay -l"
echo "  2. Test audio: speaker-test -c2 -t wav"
echo "  3. Adjust volume: alsamixer (F6 → snd_rpi_merus_amp)"
echo ""
read -p "Reboot now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo reboot
else
    echo ""
    echo "Remember to reboot manually: sudo reboot"
fi
