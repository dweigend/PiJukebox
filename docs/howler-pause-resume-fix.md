# Howler.js Pause/Resume Bug with HTML5 Mode

## Problem Description

When using Howler.js with `html5: true` mode, the pause/resume functionality did not work correctly. After pausing and resuming playback, the audio would restart from the beginning or jump to an incorrect position instead of continuing from where it was paused.

## Symptoms

- Audio plays normally after RFID card scan
- Pressing "E" key (pause) appears to work
- Pressing "E" key again (resume) causes audio to:
  - Either restart from 0:00
  - Or jump to a random position (e.g., from 22.13s to 1.62s)
- Console logs showed correct pause/resume calls but position was not preserved

## Root Cause

The issue was caused by two factors:

### 1. `autoplay: false` Configuration

```typescript
// PROBLEMATIC CODE
this.currentHowl = new Howl({
	src: [song.path],
	autoplay: false, // ❌ Causes seek issues with html5:true
	html5: true
	// ...
});
this.currentSoundId = this.currentHowl.play();
```

With `autoplay: false`, the sound ID management becomes unreliable in HTML5 mode, especially when combined with `seek()` operations.

### 2. Missing Seek Position Management

```typescript
// PROBLEMATIC CODE
togglePause(): void {
  if (this.currentHowl.playing(this.currentSoundId)) {
    this.currentHowl.pause(this.currentSoundId);
  } else {
    this.currentHowl.play(this.currentSoundId);  // ❌ No seek position restoration
  }
}
```

The code did not explicitly save and restore the playback position before/after pause operations.

## Solution

The fix involves two changes:

### 1. Change to `autoplay: true`

```typescript
// FIXED CODE
this.currentHowl = new Howl({
	src: [song.path],
	autoplay: true, // ✅ Reliable seek with html5:true
	html5: true,
	onload: () => {
		// Get sound ID after autoplay starts
		if (this.currentHowl && this.currentSoundId === null) {
			this.currentSoundId = this.currentHowl._sounds[0]._id;
		}
	}
	// ...
});
```

**Why this works:** With `autoplay: true`, Howler.js properly initializes the HTML5 Audio element and sound ID management becomes reliable. The `onload` callback ensures we capture the correct sound ID after autoplay begins.

### 2. Explicit Seek Position Tracking

```typescript
// FIXED CODE
export class AudioManager {
	private currentHowl: Howl | null = null;
	private currentSoundId: number | null = null;
	private pausedSeekPosition: number | null = null; // ✅ Track position

	togglePause(): void {
		if (!this.currentHowl || this.currentSoundId === null) return;

		if (this.currentHowl.playing(this.currentSoundId)) {
			// PAUSE: Save current position
			this.pausedSeekPosition = this.currentHowl.seek(this.currentSoundId) as number;
			this.currentHowl.pause(this.currentSoundId);
			console.log('[AudioManager] Paused at', this.pausedSeekPosition.toFixed(2), 's');
		} else {
			// RESUME: Restore saved position
			if (this.pausedSeekPosition !== null) {
				this.currentHowl.seek(this.pausedSeekPosition, this.currentSoundId);
				console.log('[AudioManager] Resuming from', this.pausedSeekPosition.toFixed(2), 's');
				this.pausedSeekPosition = null;
			}
			this.currentHowl.play(this.currentSoundId);
			console.log('[AudioManager] Resumed');
		}
	}
}
```

**Why this works:** By explicitly saving the seek position with `seek(soundId)` before pausing and restoring it with `seek(position, soundId)` before resuming, we ensure the playback position is preserved across pause/resume cycles.

## Technical Background

### Why HTML5 Mode Has This Issue

Howler.js supports two audio backends:

1. **Web Audio API** (default) - More reliable but higher overhead
2. **HTML5 Audio** (`html5: true`) - Lower overhead, better for mobile, but has quirks

HTML5 Audio elements in browsers have inconsistent behavior across:

- Different browsers (Chrome, Firefox, Safari)
- Different audio formats (MP3, OGG, WAV)
- Different server configurations (with/without Range request support)

The `autoplay` flag and explicit seek position management work around these browser inconsistencies.

### Related Howler.js Issues

This is a known issue in the Howler.js community:

- GitHub Issue #947: "cant resume audio when set html5 to true"
- GitHub Issue #1156: "resume/seek/play issue (and how I workaround it)"
- Stack Overflow: "Howler js pause/resume trouble"

Multiple users reported the same behavior, and the recommended solution is to explicitly manage seek positions and use `autoplay: true` with HTML5 mode.

## Testing Verification

After implementing the fix, testing confirmed:

```
Console Output:
[AudioManager] Playing: Wer Liebt Dem Wachsen Fluegel Komplett
[AudioManager] Paused at 5.43 s      ✅
[AudioManager] Resuming from 5.43 s  ✅
[AudioManager] Resumed
```

The audio now correctly resumes from the exact position where it was paused.

## Best Practices for Howler.js with HTML5 Mode

1. **Always use `autoplay: true`** when using `html5: true` mode
2. **Explicitly track seek position** before pause operations
3. **Restore seek position** after resume operations using `seek(position, soundId)`
4. **Use the `onload` callback** to capture sound IDs reliably
5. **Test across browsers** (Chrome, Firefox, Safari) as HTML5 Audio behavior varies

## Alternative Solutions Considered

### Option 1: Switch to Web Audio API

```typescript
this.currentHowl = new Howl({
	src: [song.path],
	html5: false // Use Web Audio API instead
});
```

**Pros:**

- More reliable pause/resume behavior
- Better cross-browser consistency

**Cons:**

- Higher CPU/memory usage
- Potential issues on mobile devices
- Longer load times for large files

**Decision:** Stick with HTML5 mode since it's better suited for children's audio player on Raspberry Pi (lower resource usage).

### Option 2: Unload and Reload on Resume

```typescript
// Save position, unload, create new Howl, seek to position
```

**Pros:**

- Completely resets audio state

**Cons:**

- Much more complex
- Potential audio gaps during reload
- Unnecessary overhead

**Decision:** Rejected in favor of simpler seek position tracking.

## Commit Reference

The fix was implemented in commit `dfd487c`:

```
fix: implement reliable pause/resume with seek position

- Add pausedSeekPosition tracking to save/restore playback position
- Change autoplay from false to true for reliable seek with html5:true
- Use onload callback to get sound ID after autoplay starts
- Fixes issue where audio would restart from beginning on resume

Tested: Pause at 5.43s, resume continues from 5.43s ✅
```

## Related Documentation

- [Howler.js Documentation](https://howlerjs.com)
- [HTML5 Audio Specification](https://html.spec.whatwg.org/multipage/media.html)
- [Web Audio API vs HTML5 Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
