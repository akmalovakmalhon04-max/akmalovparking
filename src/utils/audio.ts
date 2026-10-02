/**
 * Synthesizes all game audio via Web Audio API.
 * High fidelity, zero external network requests, zero broken assets.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;

  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private vibrationEnabled: boolean = true;
  private soundVolume: number = 0.8;
  private musicVolume: number = 0.4;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSettings(sound: boolean, music: boolean, vibration: boolean, soundVol: number, musicVol: number) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.vibrationEnabled = vibration;
    this.soundVolume = soundVol;
    this.musicVolume = musicVol;

    if (!this.soundEnabled && this.isEngineRunning) {
      this.stopEngine();
    }
    if (!this.musicEnabled && this.isMusicPlaying) {
      this.stopMusic();
    } else if (this.musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12 * this.soundVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {
      // Ignore audio interruptions
    }
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const playTone = (freq: number, start: number, dur: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15 * this.soundVolume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      };

      playTone(987.77, now, 0.08); // B5
      playTone(1318.51, now + 0.07, 0.15); // E6
    } catch {
      // Ignore
    }
  }

  public playBlinkerTick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08 * this.soundVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // Ignore
    }
  }

  public playGearShift() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.12 * this.soundVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // Ignore
    }
  }

  public playCrash() {
    if (this.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 200]);
      } catch {
        // Safe vibration fallback
      }
    }

    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise buffer for crash texture
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.4);

      // Low bass impact thud
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(130, now);
      bass.frequency.exponentialRampToValueAtTime(30, now + 0.3);
      bassGain.gain.setValueAtTime(0.5 * this.soundVolume, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      bass.connect(bassGain);
      bassGain.connect(this.ctx.destination);

      bass.start(now);
      bass.stop(now + 0.32);
    } catch {
      // Ignore
    }
  }

  public playBrake() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.Q.setValueAtTime(5, now);

      gain.gain.setValueAtTime(0.06 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }

  public playRadarFlash() {
    if (this.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch {
        // Safe vibration fallback
      }
    }

    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High-frequency radar beep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

      gain.gain.setValueAtTime(0.25 * this.soundVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  public playPoliceSiren() {
    if (this.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch {
        // Safe vibration fallback
      }
    }

    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Classic police siren high-low pitch modulation
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.35);
      osc.frequency.linearRampToValueAtTime(650, now + 0.7);
      osc.frequency.linearRampToValueAtTime(950, now + 1.05);

      gain.gain.setValueAtTime(0.2 * this.soundVolume, now);
      gain.gain.linearRampToValueAtTime(0.2 * this.soundVolume, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.35);
    } catch {
      // Ignore
    }
  }

  public playWin() {
    if (this.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate([80, 50, 80, 50, 150]);
      } catch {
        // Ignore
      }
    }

    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        const startTime = now + idx * 0.1;
        const dur = idx === 3 ? 0.5 : 0.12;

        gain.gain.setValueAtTime(0.2 * this.soundVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    } catch {
      // Ignore
    }
  }

  public playGameOver() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [392.00, 369.99, 329.63, 261.63]; // G4, F#4, E4, C4
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        const startTime = now + idx * 0.12;
        const dur = idx === 3 ? 0.6 : 0.15;

        gain.gain.setValueAtTime(0.15 * this.soundVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    } catch {
      // Ignore
    }
  }

  public startEngine() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      const now = this.ctx.currentTime;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.04 * this.soundVolume, now);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(180, now);

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(45, now);

      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(90, now);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.isEngineRunning = true;
    } catch {
      // Ignore
    }
  }

  public updateEngine(speedNormalized: number, isReversing: boolean) {
    if (!this.isEngineRunning || !this.ctx || !this.soundEnabled) return;

    try {
      const now = this.ctx.currentTime;
      const speed = Math.max(0, Math.min(1, Math.abs(speedNormalized)));

      const baseFreq = isReversing ? 55 : 45;
      const maxFreq = isReversing ? 110 : 160;
      const targetFreq = baseFreq + speed * (maxFreq - baseFreq);

      this.engineOsc1?.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.engineOsc2?.frequency.setTargetAtTime(targetFreq * 2.01, now, 0.05);

      const filterFreq = 180 + speed * 420;
      this.engineFilter?.frequency.setTargetAtTime(filterFreq, now, 0.05);

      const targetGain = (0.04 + speed * 0.08) * this.soundVolume;
      this.engineGain?.gain.setTargetAtTime(targetGain, now, 0.05);
    } catch {
      // Ignore
    }
  }

  public stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc1) {
        this.engineOsc1.stop();
        this.engineOsc1.disconnect();
      }
      if (this.engineOsc2) {
        this.engineOsc2.stop();
        this.engineOsc2.disconnect();
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
      }
    } catch {
      // Ignore
    }
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.engineGain = null;
    this.isEngineRunning = false;
  }

  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    // Pleasant ambient synth chord progression (Lo-Fi Drive vibes)
    const chords = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [196.00, 246.94, 293.66, 392.00], // G
    ];

    let chordIdx = 0;

    const playNextChord = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicEnabled) return;
      try {
        const chord = chords[chordIdx % chords.length];
        chordIdx++;
        const now = this.ctx.currentTime;
        const dur = 2.4;

        chord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.02 * this.musicVolume, now + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + dur + 0.1);
        });
      } catch {
        // Ignore
      }
    };

    playNextChord();
    this.musicInterval = setInterval(playNextChord, 2400);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public triggerHaptic(duration = 50) {
    if (this.vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch {
        // Fallback
      }
    }
  }
}

export const audio = new AudioManager();
