// Futuristic Cyber Web Audio Sound Synthesizer & Ambient Music Engine
let audioCtx = null;
let soundEnabled = false;

// Ambient Music Synthesis State
let bgMusicGain = null;
let bgMusicInterval = null;
let isMusicPlaying = false;

const getContext = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export function setSoundEnabledState(enabled) {
  soundEnabled = enabled;
  if (enabled) {
    const ctx = getContext();
    if (ctx) startAmbientMusic();
  } else {
    stopAmbientMusic();
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

// ----------------------------------------------------
// Ambient Background Music Generator (Sweet Cyber Synth)
// ----------------------------------------------------

// Light, sweet ambient chord notes in Hz (Cmaj7, Am9, Fmaj7, G6)
const AMBIENT_CHORDS = [
  [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
  [220.00, 261.63, 329.63, 392.00], // Am9 (A3, C4, E4, G4)
  [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
  [196.00, 246.94, 293.66, 392.00]  // G6 (G3, B3, D4, G4)
];

let chordIndex = 0;

export function startAmbientMusic() {
  if (isMusicPlaying) return;
  const ctx = getContext();
  if (!ctx) return;

  try {
    isMusicPlaying = true;
    bgMusicGain = ctx.createGain();
    bgMusicGain.gain.setValueAtTime(0.001, ctx.currentTime);
    bgMusicGain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 2); // Soft 2s fade in

    bgMusicGain.connect(ctx.destination);

    const playChordCycle = () => {
      if (!isMusicPlaying || !soundEnabled) return;
      const currentChord = AMBIENT_CHORDS[chordIndex];
      chordIndex = (chordIndex + 1) % AMBIENT_CHORDS.length;

      // Play soft warm sine pad notes
      currentChord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600 + idx * 200, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 3.8);

        noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1.2);
        noteGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(bgMusicGain);

        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + 3.9);
      });

      // Play a soft high arpeggio bell note
      const arpeggioFreq = currentChord[Math.floor(Math.random() * currentChord.length)] * 2;
      const arpOsc = ctx.createOscillator();
      const arpGain = ctx.createGain();

      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpeggioFreq, ctx.currentTime + 1.5);

      arpGain.gain.setValueAtTime(0.001, ctx.currentTime + 1.5);
      arpGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 1.7);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

      arpOsc.connect(arpGain);
      arpGain.connect(bgMusicGain);

      arpOsc.start(ctx.currentTime + 1.5);
      arpOsc.stop(ctx.currentTime + 3.3);
    };

    playChordCycle();
    bgMusicInterval = setInterval(playChordCycle, 4000);
  } catch (e) {
    console.debug('Ambient music startup note:', e);
  }
}

export function stopAmbientMusic() {
  isMusicPlaying = false;
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  if (bgMusicGain && audioCtx) {
    try {
      bgMusicGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8); // Smooth fade out
      setTimeout(() => {
        if (bgMusicGain) {
          bgMusicGain.disconnect();
          bgMusicGain = null;
        }
      }, 800);
    } catch (e) {
      console.debug('Ambient music fadeout note:', e);
    }
  }
}

// ----------------------------------------------------
// UI Sound Effects
// ----------------------------------------------------

// 1. Subtle High-Tech Hover Blip
export function playHoverSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.debug('Audio playback note:', e);
  }
}

// 2. Sci-Fi UI Click Sound
export function playClickSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.debug('Audio click note:', e);
  }
}

// 3. Cyber Terminal Mechanical Key Stroke
export function playTerminalKeySound() {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.02;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch (e) {
    console.debug('Terminal audio key note:', e);
  }
}

// 4. Access Granted / Success Power-up Chime
export function playAccessGrantedSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
    });
  } catch (e) {
    console.debug('Access sound note:', e);
  }
}

// 5. Access Denied / Error Pulse Sound
export function playErrorSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.setValueAtTime(120, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.debug('Error sound note:', e);
  }
}
