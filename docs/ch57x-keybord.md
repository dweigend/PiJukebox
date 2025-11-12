# CH57x Keyboard Controller - Web Media Player Integration

## Hardware Configuration

**Device**: CH57x 3×1 Macro Keyboard + 1 Rotary Encoder
**Config**: `~/ch57x-keyboard/keyboard-config.yaml`

## Current Key Mappings

| Input             | Physical Key | Browser Event                      |
| ----------------- | ------------ | ---------------------------------- |
| Button 1 (Top)    | `W`          | `KeyboardEvent` key: "w"           |
| Button 2 (Middle) | `E`          | `KeyboardEvent` key: "e"           |
| Button 3 (Bottom) | `R`          | `KeyboardEvent` key: "r"           |
| Knob Left         | Media Key    | `KeyboardEvent` code: "VolumeDown" |
| Knob Press        | Media Key    | `KeyboardEvent` code: "VolumeMute" |
| Knob Right        | Media Key    | `KeyboardEvent` code: "VolumeUp"   |

## Browser Integration

### Basic Event Handler

```typescript
document.addEventListener('keydown', (event) => {
	switch (event.key.toLowerCase()) {
		case 'w':
			playlist.previous();
			event.preventDefault();
			break;
		case 'e':
			audio.paused ? audio.play() : audio.pause();
			event.preventDefault();
			break;
		case 'r':
			playlist.next();
			event.preventDefault();
			break;
	}

	// Volume control (Knob)
	if (event.code === 'VolumeUp') {
		audio.volume = Math.min(1.0, audio.volume + 0.1);
	} else if (event.code === 'VolumeDown') {
		audio.volume = Math.max(0.0, audio.volume - 0.1);
	} else if (event.code === 'VolumeMute') {
		audio.muted = !audio.muted;
	}
});
```

## Empfohlene Mappings

**Standard**: W=Previous, E=Play/Pause, R=Next, Knob=Volume

## Config Ändern

```bash
# Edit ~/ch57x-keyboard/keyboard-config.yaml
~/.cargo/bin/ch57x-keyboard-tool validate ~/ch57x-keyboard/keyboard-config.yaml
~/.cargo/bin/ch57x-keyboard-tool upload ~/ch57x-keyboard/keyboard-config.yaml
```

## Browser Kompatibilität

- Keyboard Events (W, E, R): Universal support
- Volume Keys: Chromium-based browsers (Chrome, Edge) bevorzugt
- Media Session API: Chrome 73+, Firefox 82+, Safari 15+
