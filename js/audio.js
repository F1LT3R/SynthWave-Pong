// Web Audio API synthesized sound effects for SynthWave Neon Pong
import { PLAYER1, PLAYER2 } from './constants.js';

let audioCtx = null;
let masterGain = null;
let noiseBuffer = null;

// Create a reusable white noise buffer
function createNoiseBuffer() {
    const size = audioCtx.sampleRate; // 1 second of noise
    const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

export function initAudio() {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
    noiseBuffer = createNoiseBuffer();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Short square-wave blip with pitch bend
export function playHit(side) {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const freq = side === PLAYER1 ? 440 : 523;

    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.linearRampToValueAtTime(freq * 0.7, t + 0.08);

    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.6, t + 0.005);
    env.gain.linearRampToValueAtTime(0, t + 0.08);

    osc.connect(env);
    env.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.08);
}

// Very short noise burst through bandpass filter
export function playWallBounce() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1.5;

    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.linearRampToValueAtTime(0, t + 0.04);

    src.connect(filter);
    filter.connect(env);
    env.connect(masterGain);
    src.start(t);
    src.stop(t + 0.04);
}

// Ascending arpeggio — 3 sawtooth notes
export function playScore() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const notes = [523, 659, 784]; // C5, E5, G5

    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const env = audioCtx.createGain();
        const start = t + i * 0.1;
        env.gain.setValueAtTime(0, start);
        env.gain.linearRampToValueAtTime(0.5, start + 0.01);
        env.gain.linearRampToValueAtTime(0, start + 0.12);

        osc.connect(env);
        env.connect(masterGain);
        osc.start(start);
        osc.stop(start + 0.12);
    });
}

// Noise burst with frequency sweep — "boom" effect
export function playExplode() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    // Low oscillator sweep
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);

    const oscEnv = audioCtx.createGain();
    oscEnv.gain.setValueAtTime(0.6, t);
    oscEnv.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.connect(oscEnv);
    oscEnv.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.3);

    // Layered noise through sweeping lowpass
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);

    const noiseEnv = audioCtx.createGain();
    noiseEnv.gain.setValueAtTime(0.5, t);
    noiseEnv.gain.linearRampToValueAtTime(0, t + 0.3);

    noise.connect(filter);
    filter.connect(noiseEnv);
    noiseEnv.connect(masterGain);
    noise.start(t);
    noise.stop(t + 0.3);
}

// Rising synth sweep with two oscillators
export function playStart() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    [1, 2].forEach((multiplier) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200 * multiplier, t);
        osc.frequency.exponentialRampToValueAtTime(800 * multiplier, t + 0.5);

        const env = audioCtx.createGain();
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(multiplier === 1 ? 0.4 : 0.2, t + 0.2);
        env.gain.linearRampToValueAtTime(0, t + 0.5);

        osc.connect(env);
        env.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.5);
    });
}

// Descending square-wave sequence with delay tail
export function playGameOver() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const notes = [392, 330, 262, 196]; // G4, E4, C4, G3

    // Simple delay for reverb-like tail
    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.15;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.25;
    const delayEnv = audioCtx.createGain();
    delayEnv.gain.value = 0.4;

    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(delayEnv);
    delayEnv.connect(masterGain);

    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;

        const env = audioCtx.createGain();
        const start = t + i * 0.18;
        env.gain.setValueAtTime(0, start);
        env.gain.linearRampToValueAtTime(0.5, start + 0.01);
        env.gain.linearRampToValueAtTime(0, start + 0.2);

        osc.connect(env);
        env.connect(masterGain);
        env.connect(delay);
        osc.start(start);
        osc.stop(start + 0.2);
    });
}
