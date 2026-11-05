// Procedural Web Audio API sound synthesizer - Zero 404 dependencies!

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Active robotic voice filter session state
interface RoboticVoiceFilterSession {
  masterGain: GainNode;
  oscillators: OscillatorNode[];
  filters: BiquadFilterNode[];
  isActive: boolean;
}

let activeFilterSession: RoboticVoiceFilterSession | null = null;

/**
 * Starts a synthesized metallic resonance & vocoder carrier filter using Web Audio API
 * Provides a cinematic, metallic 'Jarvis' intercom acoustic tone in sync with speech
 */
export const startRoboticVoiceFilter = (intensity: number = 0.8) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Terminate existing session if active
    stopRoboticVoiceFilter();

    const now = ctx.currentTime;

    // Master filter gain for subtle non-intrusive blending
    const masterGain = ctx.createGain();
    const targetVolume = Math.min(0.065, 0.045 * intensity);
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(targetVolume, now + 0.05);

    // 1. Sub-Harmonic Helmet / Transducer Resonance (65Hz & 130Hz)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(65.41, now); // C2 resonance

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(140, now);
    subFilter.Q.setValueAtTime(3.5, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.3, now);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);

    // 2. High-Tech Metallic Ring Modulation & Resonant Formant Comb
    const ringCarrier = ctx.createOscillator();
    ringCarrier.type = 'sine';
    ringCarrier.frequency.setValueAtTime(54.0, now); // 54Hz metallic hum

    const formantFilter1 = ctx.createBiquadFilter();
    formantFilter1.type = 'bandpass';
    formantFilter1.frequency.setValueAtTime(1250, now);
    formantFilter1.Q.setValueAtTime(8.0, now);

    const formantFilter2 = ctx.createBiquadFilter();
    formantFilter2.type = 'peaking';
    formantFilter2.frequency.setValueAtTime(2600, now);
    formantFilter2.gain.setValueAtTime(5.5, now);
    formantFilter2.Q.setValueAtTime(5.0, now);

    // LFO for subtle acoustic dispersion
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(6.5, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(15, now);
    lfo.connect(lfoGain);
    lfoGain.connect(formantFilter1.frequency);

    ringCarrier.connect(formantFilter1);
    formantFilter1.connect(formantFilter2);
    formantFilter2.connect(masterGain);

    masterGain.connect(ctx.destination);

    subOsc.start(now);
    ringCarrier.start(now);
    lfo.start(now);

    activeFilterSession = {
      masterGain,
      oscillators: [subOsc, ringCarrier, lfo],
      filters: [subFilter, formantFilter1, formantFilter2],
      isActive: true,
    };
  } catch (err) {
    console.debug('Robotic filter failed to start:', err);
  }
};

/**
 * Cleanly stops and disconnects the Web Audio API robotic filter chain
 */
export const stopRoboticVoiceFilter = () => {
  if (!activeFilterSession || !activeFilterSession.isActive) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const session = activeFilterSession;
    activeFilterSession = null;

    session.masterGain.gain.cancelScheduledValues(now);
    session.masterGain.gain.setValueAtTime(session.masterGain.gain.value, now);
    session.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    setTimeout(() => {
      session.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      session.filters.forEach((f) => {
        try {
          f.disconnect();
        } catch {}
      });
      session.masterGain.disconnect();
    }, 90);
  } catch (err) {
    console.debug('Robotic filter failed to stop:', err);
  }
};

export const playSound = (
  type: 'boot' | 'listen_start' | 'listen_end' | 'success' | 'alert' | 'tick' | 'pulse' | 'activate'
) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'listen_start') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12); // D6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } else if (type === 'listen_end') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === 'boot') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.6);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(370, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'pulse') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.3);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'activate') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch (err) {
    console.debug('Sound FX suppressed:', err);
  }
};
