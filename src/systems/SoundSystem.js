/**
 * SoundSystem - Pure Web Audio API Synthesizer for rich vintage sound effects.
 * Requires zero external audio files and works instantly in all browsers.
 */
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(frequency, duration = 0.4, type = 'sine', decay = 0.3) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio note error:', e);
    }
  }

  // Music Box Chime for puzzle buttons
  playMusicBoxNote(noteName) {
    const notes = {
      'red': 523.25,     // C5
      'blue': 659.25,    // E5
      'yellow': 783.99,  // G5
      'green': 880.00,   // A5
      'correct': 1046.50 // C6
    };
    const freq = notes[noteName] || 523.25;
    this.playNote(freq, 0.6, 'triangle');
    // Subtone for rich resonance
    setTimeout(() => this.playNote(freq * 1.5, 0.4, 'sine'), 40);
  }

  // Paper note reading rustle
  playPaperSound() {
    this.playNote(300, 0.15, 'triangle');
    setTimeout(() => this.playNote(220, 0.12, 'sine'), 60);
  }

  // Key collection sparkle
  playKeyPickup() {
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      setTimeout(() => this.playNote(f, 0.3, 'triangle'), i * 80);
    });
  }

  // Drawer / Door unlock
  playUnlockSound() {
    this.playNote(400, 0.2, 'sawtooth');
    setTimeout(() => this.playNote(800, 0.4, 'triangle'), 100);
  }

  // Enemy Alert ("❗")
  playAlertSound() {
    this.playNote(220, 0.2, 'sawtooth');
    setTimeout(() => this.playNote(180, 0.3, 'sawtooth'), 80);
  }

  // Hiding in closet sound
  playHideSound() {
    this.playNote(160, 0.25, 'sine');
    setTimeout(() => this.playNote(120, 0.3, 'sine'), 100);
  }

  // Ambient creepy music box melody
  playMusicBoxMelody() {
    const melody = [523.25, 659.25, 783.99, 659.25, 523.25, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      setTimeout(() => this.playNote(freq, 0.5, 'triangle'), i * 220);
    });
  }
}

export const sounds = new SoundSystem();
