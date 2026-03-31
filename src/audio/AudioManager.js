/**
 * AudioManager — manages Web Audio context, ambient loop, and SFX synthesis.
 * Extracted from GameScene.js to isolate the audio subsystem concern.
 */
export class AudioManager {
  constructor(phaserTime) {
    this._time = phaserTime;
    this.audioContext = null;
    this.masterGain = null;
    this.ambientNodes = null;
    this.muted = false;
  }

  ensure() {
    if (this.audioContext) {
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }
      this._applyMuteState();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.audioContext = new Ctx();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.audioContext.currentTime);
    this.masterGain.connect(this.audioContext.destination);
    this._startAmbientLoop();
    this._applyMuteState();
  }

  setMuted(muted) {
    this.muted = muted;
    this._applyMuteState();
  }

  playSfx(kind) {
    if (!this.audioContext || this.muted) return;
    const now = this.audioContext.currentTime;
    if (kind === "shot") { this._tone(180, 0.05, "square", 0.05, now); return; }
    if (kind === "zombie-hit") { this._tone(120, 0.05, "sawtooth", 0.045, now); return; }
    if (kind === "zombie-kill") { this._tone(300, 0.05, "square", 0.04, now); this._tone(440, 0.06, "triangle", 0.03, now + 0.04); return; }
    if (kind === "civilian-error") { this._tone(640, 0.07, "square", 0.03, now); this._tone(240, 0.1, "square", 0.025, now + 0.08); return; }
    if (kind === "crosshair-warning") { this._tone(760, 0.025, "triangle", 0.014, now); return; }
    if (kind === "ui-click") { this._tone(700, 0.035, "triangle", 0.018, now); this._tone(920, 0.04, "triangle", 0.012, now + 0.03); return; }
    if (kind === "wave-alert") { this._tone(260, 0.06, "sawtooth", 0.025, now); this._tone(360, 0.07, "sawtooth", 0.02, now + 0.08); this._tone(480, 0.08, "triangle", 0.018, now + 0.18); return; }
    if (kind === "danger-alert") { this._tone(200, 0.12, "sawtooth", 0.03, now); return; }
    if (kind === "critical-alert") { this._tone(92, 0.14, "square", 0.03, now); this._tone(92, 0.12, "square", 0.02, now + 0.22); return; }
    if (kind === "civilian-scream") { this._tone(520, 0.08, "triangle", 0.018, now); return; }
    if (kind === "powerup-positive") { this._tone(420, 0.06, "triangle", 0.03, now); this._tone(560, 0.08, "triangle", 0.02, now + 0.05); return; }
    if (kind === "rescue-bonus") { this._tone(360, 0.06, "triangle", 0.03, now); this._tone(520, 0.09, "triangle", 0.025, now + 0.05); return; }
    if (kind === "level-clear") { this._tone(520, 0.09, "triangle", 0.03, now); this._tone(660, 0.1, "triangle", 0.024, now + 0.1); return; }
    if (kind === "game-over") { this._tone(260, 0.12, "sawtooth", 0.03, now); this._tone(180, 0.18, "square", 0.028, now + 0.1); }
  }

  stopAll() {
    if (!this.ambientNodes) return;
    const { base, shimmer, siren } = this.ambientNodes;
    try { base.stop(); shimmer.stop(); siren.stop(); } catch (_) {}
    this.ambientNodes = null;
  }

  _applyMuteState() {
    if (!this.audioContext || !this.masterGain) return;
    const targetGain = this.muted ? 0.0001 : 0.18;
    this.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.masterGain.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.03);
  }

  _startAmbientLoop() {
    if (!this.audioContext || this.ambientNodes) return;
    const base = this.audioContext.createOscillator();
    const shimmer = this.audioContext.createOscillator();
    const siren = this.audioContext.createOscillator();
    const baseGain = this.audioContext.createGain();
    const shimmerGain = this.audioContext.createGain();
    const sirenGain = this.audioContext.createGain();
    base.type = "triangle";
    shimmer.type = "sine";
    siren.type = "sine";
    base.frequency.setValueAtTime(62, this.audioContext.currentTime);
    shimmer.frequency.setValueAtTime(184, this.audioContext.currentTime);
    siren.frequency.setValueAtTime(310, this.audioContext.currentTime);
    baseGain.gain.setValueAtTime(0.018, this.audioContext.currentTime);
    shimmerGain.gain.setValueAtTime(0.006, this.audioContext.currentTime);
    sirenGain.gain.setValueAtTime(0.003, this.audioContext.currentTime);
    base.connect(baseGain).connect(this.masterGain);
    shimmer.connect(shimmerGain).connect(this.masterGain);
    siren.connect(sirenGain).connect(this.masterGain);
    base.start(); shimmer.start(); siren.start();
    this._time.addEvent({
      delay: 1800,
      loop: true,
      callback: () => {
        if (!this.audioContext || !this.ambientNodes) return;
        const now = this.audioContext.currentTime;
        siren.frequency.cancelScheduledValues(now);
        siren.frequency.setValueAtTime(260, now);
        siren.frequency.linearRampToValueAtTime(340, now + 0.55);
        siren.frequency.linearRampToValueAtTime(260, now + 1.1);
      }
    });
    this.ambientNodes = { base, shimmer, siren, baseGain, shimmerGain, sirenGain };
  }

  _tone(frequency, duration, waveType, volume, startAt) {
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain).connect(this.masterGain ?? this.audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration);
  }
}
