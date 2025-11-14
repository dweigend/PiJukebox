# Innomaker Amp Pro Setup

Setup-Anleitung für den Innomaker Amp Pro (Merus MA12070P) Verstärker auf Raspberry Pi.

> **Hinweis:** Für dieses Projekt nutze ich den **INNO-MAKER AMP-Pro**. Diese Anleitung beschreibt die komplette Einrichtung über SSH/CLI.

## 📚 Offizielle Dokumentation

- **GitHub Repository:** [INNO-MAKER/AMP-Pro](https://github.com/INNO-MAKER/AMP-Pro)
- **Wiki & Handbuch:** [Geekworm Amp Pro Wiki](https://wiki.geekworm.com/AMP_Pro)

## Hardware-Anforderungen

### Verstärker

- **Produkt:** INNO-MAKER Amp Pro
- **Chipsatz:** Infineon Merus MA12070P (Class-D Amplifier)
- **Leistung:** 2×80W Peak Output (2×50W RMS @ 4Ω)
- **Kompatibilität:** Raspberry Pi 3/4/5 (40-pin GPIO Header)
- **Kühlung:** Passiver Kühlkörper integriert
- **Abmessungen:** HAT-Format (65mm × 56mm)

### Stromversorgung

- **Spannung:** 9-24V DC (±5%), empfohlen 12V oder 19V
- **Strom:** Mindestens 3A (je nach Lautstärke bis zu 5A)
- **Anschluss:** DC Jack (5.5mm × 2.1mm) oder Schraubklemme (2-polig)
- **WICHTIG:** Qualitäts-Netzteil verwenden (Spannungsspitzen können 30V überschreiten)

### Lautsprecher

- **Impedanz:** 4Ω oder 8Ω (empfohlen 4Ω für maximale Leistung)
- **Leistung:** Mindestens 50W RMS pro Kanal
- **Anschluss:** 6-polige Schraubklemme (siehe Pin-Belegung unten)

## ⚠️ Sicherheitshinweise

**CRITICAL - Vor der Installation lesen!**

1. **NIEMALS Hot-Plug!**
   - ✅ Richtig: Netzteil mit Amp Pro verbinden → **dann** Netzteil einschalten
   - ❌ Falsch: Amp Pro bei laufendem Netzteil anschließen
   - **Risiko:** Board wird zerstört!

2. **Stromversorgung:**
   - 9-24V DC ±5%, mindestens 3A
   - Qualitäts-Netzteil verwenden (Spannungsspitzen können 30V überschreiten)

3. **Lautsprecher:**
   - Polarität beachten (nicht verpolen)
   - Korrekte Pin-Belegung (siehe unten)

## Hardware-Anschluss

### Stromversorgung (Wahl zwischen):

- **DC Jack:** 9-24V mit 5.5mm Hohlstecker
- **Green Connector PIN-1/2:** Alternative +/- Versorgung

### Lautsprecher-Pins (Amp Pro):

- **PIN-3:** Right Speaker Negative (-)
- **PIN-4:** Right Speaker Positive (+)
- **PIN-5:** Left Speaker Positive (+)
- **PIN-6:** Left Speaker Negative (-)

## Software-Installation

### Variante 1: Automatische Installation (empfohlen)

```bash
cd docs/hardware/amp-pro
chmod +x install.sh
./install.sh
```

> **Hinweis:** Die Konfigurationsdateien (`asound.conf`, `install.sh`) befinden sich im Unterordner `docs/hardware/amp-pro/`.

Das Script:

1. Fügt `dtoverlay=merus-amp` zu `/boot/firmware/config.txt` hinzu
2. Installiert ALSA-Konfiguration nach `/etc/asound.conf`
3. Erstellt Backup der vorhandenen Konfiguration
4. Bietet Reboot an

### Variante 2: Manuelle Installation

#### Schritt 1: Device Tree Overlay aktivieren

```bash
sudo nano /boot/firmware/config.txt
```

Am Ende hinzufügen:

```
dtoverlay=merus-amp
```

Speichern (Strg+O, Enter, Strg+X)

#### Schritt 2: ALSA-Konfiguration

```bash
sudo cp docs/hardware/amp-pro/asound.conf /etc/asound.conf
```

Oder manuell erstellen:

```bash
sudo nano /etc/asound.conf
```

Inhalt (siehe `docs/hardware/amp-pro/asound.conf`):

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

#### Schritt 3: Reboot

```bash
sudo reboot
```

## Verifizierung

### Nach dem Reboot - Soundkarte prüfen:

```bash
aplay -l
```

**Erwartete Ausgabe:**

```
card 3: sndrpimerusamp [snd_rpi_merus_amp], device 0: Merus Audio Amp ma120x0p-amp-0
```

### Test-Audio abspielen:

```bash
# WAV-Test (2 Kanäle)
speaker-test -c2 -t wav

# Mit MP3 (mpg123 installieren falls nötig)
mpg123 /path/to/test.mp3
```

### Lautstärke anpassen:

```bash
alsamixer
# F6 drücken → "snd_rpi_merus_amp" auswählen
# Pfeiltasten: Lautstärke anpassen
# M: Mute/Unmute
```

Oder per CLI:

```bash
# Lautstärke anzeigen
amixer -c 3 scontrols

# Lautstärke setzen (0-100%)
amixer -c 3 set Master 80% unmute
```

## Lautstärkebegrenzung

Die mitgelieferte `asound.conf` begrenzt die maximale Lautstärke auf **50% der Hardware-Kapazität** (`max_dB -6.0`).

**Anpassung der Maximallautstärke:**

In `/etc/asound.conf` den `max_dB` Wert ändern:

```conf
max_dB -6.0     # ~50% (Standard)
max_dB -10.0    # ~32% (leiser)
max_dB -12.0    # ~25% (sehr sicher für Kinder)
max_dB -3.0     # ~70% (lauter)
max_dB 0.0      # 100% (keine Begrenzung)
```

Nach Änderung:

```bash
sudo alsactl restore
# oder
sudo reboot
```

**Vorteil:** Die Web-Anwendung (howler.js) kann Lautstärke von 0-100% regeln, wobei 100% im Code = 50% der Hardware-Lautstärke entspricht.

## Integration mit kinder_audio_2

Das Projekt nutzt howler.js für Audio-Wiedergabe. Howler.js verwendet automatisch die System-Standard-Soundkarte (definiert in `/etc/asound.conf`).

**Test im Projekt:**

```bash
cd /path/to/kinder_audio_2
bun run dev
```

Browser öffnen → Audio sollte über die angeschlossenen Lautsprecher kommen.

## Troubleshooting

### Problem: Kein Sound / Sound zu leise

```bash
# Prüfen ob gemuted
amixer -c 3 scontrols
amixer -c 3 set Master 80% unmute

# ALSA State neu laden
sudo alsactl restore
```

### Problem: Amp Pro wird nicht erkannt

```bash
# Device Tree Overlay prüfen
vcgencmd get_config dtoverlay
# Sollte enthalten: "dtoverlay=merus-amp"

# Kernel-Module prüfen
lsmod | grep snd
```

### Problem: Falsche Card-Nummer

Wenn `aplay -l` eine andere Card-Nummer als `3` zeigt, passe `/etc/asound.conf` an:

```conf
slave.pcm "hw:X,0"    # X = deine Card-Nummer
control {
    name "Master"
    card X
}
```

### Problem: Config-Datei nicht gefunden

Bei älteren Raspberry Pi OS Versionen liegt die Config unter `/boot/config.txt` statt `/boot/firmware/config.txt`.

## Kompatibilität

**Getestet mit:**

- Raspberry Pi 4 Model B
- Raspberry Pi OS Lite (Debian 12 Bookworm)

**Kompatibel mit:**

- Raspberry Pi 3/4/5
- Raspberry Pi OS (Raspbian)
- Volumio, MoOde Audio, LibreELEC, OSMC

## Weitere Ressourcen

- [GitHub Repository](https://github.com/INNO-MAKER/AMP-Pro)
- [Geekworm Wiki](https://wiki.geekworm.com/AMP_Pro)
- [ALSA softvol Documentation](https://alsa.opensrc.org/Softvol)

## Support

Bei Problemen siehe auch:

- **GitHub Issues:** [kinder_audio_2 Issues](https://github.com/dweigend/kinder_audio_2/issues)
- **INNO-MAKER Support:** [GitHub Issues](https://github.com/INNO-MAKER/AMP-Pro/issues)
- **Geekworm Forum:** [Support Portal](https://www.geekworm.com/pages/contact-us)
