// Vector Maniac Sound Effects - Arcade Style
import { triggerHapticFeedback } from '@/utils/popSound';

let audioCtx: AudioContext | null = null;
let laserBuffer: AudioBuffer | null = null;
let gameStartBuffer: AudioBuffer | null = null;
let isLaserLoading = false;
let isGameStartLoading = false;
let gameStartPlayed = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Preload laser sound
async function loadLaserSound(): Promise<void> {
  if (laserBuffer || isLaserLoading) return;
  isLaserLoading = true;
  
  try {
    const ctx = getAudioContext();
    const response = await fetch('/audio/Laser.mp3');
    const arrayBuffer = await response.arrayBuffer();
    laserBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.error('Failed to load laser sound:', e);
  }
  isLaserLoading = false;
}

// Preload game start voice line
async function loadGameStartSound(): Promise<void> {
  if (gameStartBuffer || isGameStartLoading) return;
  isGameStartLoading = true;
  
  try {
    const ctx = getAudioContext();
    const response = await fetch('/audio/Game_start.mp3');
    const arrayBuffer = await response.arrayBuffer();
    gameStartBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.error('Failed to load game start sound:', e);
  }
  isGameStartLoading = false;
}

// Play the game start voice line
export function playGameStartVoice(): void {
  if (gameStartPlayed) return; // Only play once per game session
  
  try {
    const ctx = getAudioContext();
    
    if (gameStartBuffer) {
      gameStartPlayed = true;
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = gameStartBuffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      source.start(ctx.currentTime);
    }
  } catch (e) {
    console.error('Failed to play game start sound:', e);
  }
}

// Reset game start voice (call when starting a new game)
export function resetGameStartVoice(): void {
  gameStartPlayed = false;
}

// Start loading immediately
loadLaserSound();
loadGameStartSound();

export type VectorSoundType = 
  | 'shoot' | 'shoot_shoot' | 'shoot_laser' | 'shoot_plasma' | 'shoot_energy' | 'shoot_pulse' | 'shoot_fire' | 'shoot_ice'
  | 'hit' | 'explosion' | 'salvage' | 'damage' | 'shield' | 'waveComplete' | 'powerup' | 'rareSalvage' | 'bossWarning' | 'bossEnraged' | 'screenShakeHaptic'
  | 'hyperspaceEnter' | 'hyperspaceExit' | 'hyperspaceLoop' | 'warpShield' | 'formationBreaker' | 'timeWarp' | 'magnetPulse';

export function playVectorSound(type: VectorSoundType): void {
  try {
    const ctx = getAudioContext();
    
    // Handle ship-specific shoot sounds
    if (type.startsWith('shoot_')) {
      const soundType = type.replace('shoot_', '') as string;
      playShipShootSound(ctx, soundType);
      return;
    }
    
    switch (type) {
      case 'shoot': {
        // Default shoot - Play laser MP3 (clipped to first 0.15 seconds)
        if (laserBuffer) {
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          source.buffer = laserBuffer;
          source.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          source.start(ctx.currentTime, 0, 0.15); // Start at 0, play for 0.15 seconds
        } else {
          // Fallback synthesized sound if not loaded yet
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(2400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.06);
        }
        break;
      }
      
      case 'hit': {
        // Punchy arcade hit sound
        const osc = ctx.createOscillator();
        const noise = ctx.createOscillator();
        const gain = ctx.createGain();
        const noiseGain = ctx.createGain();
        
        osc.connect(gain);
        noise.connect(noiseGain);
        gain.connect(ctx.destination);
        noiseGain.connect(ctx.destination);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        
        // Noise burst for impact
        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(300, ctx.currentTime);
        noise.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
        noiseGain.gain.setValueAtTime(0.12, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.05);
        break;
      }
      
      case 'explosion': {
        // Massive multi-layered explosion
        // Layer 1: Deep sub bass thump
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60, ctx.currentTime);
        sub.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.5);
        subGain.gain.setValueAtTime(0.4, ctx.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        sub.start(ctx.currentTime);
        sub.stop(ctx.currentTime + 0.5);
        
        // Layer 2: Low rumble
        const rumble = ctx.createOscillator();
        const rumbleGain = ctx.createGain();
        rumble.connect(rumbleGain);
        rumbleGain.connect(ctx.destination);
        rumble.type = 'sawtooth';
        rumble.frequency.setValueAtTime(120, ctx.currentTime);
        rumble.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.35);
        rumbleGain.gain.setValueAtTime(0.25, ctx.currentTime);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        rumble.start(ctx.currentTime);
        rumble.stop(ctx.currentTime + 0.35);
        
        // Layer 3: Mid punch
        const mid = ctx.createOscillator();
        const midGain = ctx.createGain();
        mid.connect(midGain);
        midGain.connect(ctx.destination);
        mid.type = 'square';
        mid.frequency.setValueAtTime(250, ctx.currentTime);
        mid.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
        midGain.gain.setValueAtTime(0.2, ctx.currentTime);
        midGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        mid.start(ctx.currentTime);
        mid.stop(ctx.currentTime + 0.2);
        
        // Layer 4: High crackle burst
        const crack = ctx.createOscillator();
        const crackGain = ctx.createGain();
        crack.connect(crackGain);
        crackGain.connect(ctx.destination);
        crack.type = 'sawtooth';
        crack.frequency.setValueAtTime(1200, ctx.currentTime);
        crack.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
        crackGain.gain.setValueAtTime(0.15, ctx.currentTime);
        crackGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        crack.start(ctx.currentTime);
        crack.stop(ctx.currentTime + 0.12);
        
        // Layer 5: White noise burst (simulated with multiple oscillators)
        for (let i = 0; i < 4; i++) {
          const noise = ctx.createOscillator();
          const noiseGain = ctx.createGain();
          noise.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.type = 'sawtooth';
          noise.frequency.setValueAtTime(800 + Math.random() * 1500, ctx.currentTime);
          noise.frequency.exponentialRampToValueAtTime(50 + Math.random() * 100, ctx.currentTime + 0.15);
          noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15 + Math.random() * 0.1);
          noise.start(ctx.currentTime);
          noise.stop(ctx.currentTime + 0.25);
        }
        
        // Layer 6: Delayed secondary explosion
        const delay = 0.08;
        const boom2 = ctx.createOscillator();
        const boom2Gain = ctx.createGain();
        boom2.connect(boom2Gain);
        boom2Gain.connect(ctx.destination);
        boom2.type = 'sine';
        boom2.frequency.setValueAtTime(80, ctx.currentTime + delay);
        boom2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + delay + 0.3);
        boom2Gain.gain.setValueAtTime(0, ctx.currentTime);
        boom2Gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        boom2Gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
        boom2.start(ctx.currentTime + delay);
        boom2.stop(ctx.currentTime + delay + 0.3);
        break;
      }
      
      case 'salvage': {
        // Arcade coin/pickup sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        // Bright bling
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc1.frequency.setValueAtTime(1320, ctx.currentTime + 0.04);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        
        // Harmonic
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760, ctx.currentTime);
        osc2.frequency.setValueAtTime(2640, ctx.currentTime + 0.04);
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.12);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.1);
        break;
      }
      
      case 'rareSalvage': {
        // Epic jackpot/rare pickup sound
        const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const gain2 = ctx.createGain();
          osc.connect(gain);
          osc2.connect(gain2);
          gain.connect(ctx.destination);
          gain2.connect(ctx.destination);
          
          const startTime = ctx.currentTime + i * 0.05;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
          
          // Sparkle harmonics
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 2, startTime);
          gain2.gain.setValueAtTime(0.05, startTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
          
          osc.start(startTime);
          osc.stop(startTime + 0.2);
          osc2.start(startTime);
          osc2.stop(startTime + 0.15);
        });
        break;
      }
      
      case 'damage': {
        // Arcade damage/buzz sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        // Harsh buzz
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(150, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
        gain1.gain.setValueAtTime(0.18, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        
        // Dissonant overlay
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(180, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.1, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.2);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.15);
        break;
      }
      
      case 'shield': {
        // Energy shield activation
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(600, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.15);
        break;
      }
      
      case 'waveComplete': {
        // Victory fanfare
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const gain2 = ctx.createGain();
          osc.connect(gain);
          osc2.connect(gain2);
          gain.connect(ctx.destination);
          gain2.connect(ctx.destination);
          
          const startTime = ctx.currentTime + i * 0.08;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          
          osc2.type = 'square';
          osc2.frequency.setValueAtTime(freq / 2, startTime);
          gain2.gain.setValueAtTime(0.05, startTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
          
          osc.start(startTime);
          osc.stop(startTime + 0.25);
          osc2.start(startTime);
          osc2.stop(startTime + 0.2);
        });
        break;
      }
      
      case 'powerup': {
        // Power-up pickup with rising arpeggio
        const notes = [392, 494, 587, 784, 988]; // G4, B4, D5, G5, B5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const gain2 = ctx.createGain();
          osc.connect(gain);
          osc2.connect(gain2);
          gain.connect(ctx.destination);
          gain2.connect(ctx.destination);
          
          const startTime = ctx.currentTime + i * 0.04;
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
          
          // Shimmer overlay
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 2, startTime);
          gain2.gain.setValueAtTime(0.04, startTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
          
          osc.start(startTime);
          osc.stop(startTime + 0.15);
          osc2.start(startTime);
          osc2.stop(startTime + 0.12);
        });
        break;
      }
      
      case 'bossWarning': {
        // Alarming siren sound - oscillating warning
        const duration = 1.5;
        
        // Siren sweep - low to high to low
        for (let i = 0; i < 3; i++) {
          const startTime = ctx.currentTime + i * 0.5;
          
          const siren = ctx.createOscillator();
          const sirenGain = ctx.createGain();
          siren.connect(sirenGain);
          sirenGain.connect(ctx.destination);
          
          siren.type = 'sawtooth';
          siren.frequency.setValueAtTime(200, startTime);
          siren.frequency.exponentialRampToValueAtTime(800, startTime + 0.25);
          siren.frequency.exponentialRampToValueAtTime(200, startTime + 0.5);
          
          sirenGain.gain.setValueAtTime(0.2, startTime);
          sirenGain.gain.setValueAtTime(0.2, startTime + 0.45);
          sirenGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
          
          siren.start(startTime);
          siren.stop(startTime + 0.5);
        }
        
        // Sub bass rumble underneath
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.type = 'sine';
        bass.frequency.setValueAtTime(50, ctx.currentTime);
        bassGain.gain.setValueAtTime(0.3, ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        bass.start(ctx.currentTime);
        bass.stop(ctx.currentTime + duration);
        
        // High-pitched alarm beeps
        for (let i = 0; i < 6; i++) {
          const beepTime = ctx.currentTime + i * 0.25;
          const beep = ctx.createOscillator();
          const beepGain = ctx.createGain();
          beep.connect(beepGain);
          beepGain.connect(ctx.destination);
          beep.type = 'square';
          beep.frequency.setValueAtTime(1200, beepTime);
          beepGain.gain.setValueAtTime(0.1, beepTime);
          beepGain.gain.exponentialRampToValueAtTime(0.001, beepTime + 0.1);
          beep.start(beepTime);
          beep.stop(beepTime + 0.1);
        }
        break;
      }
      
      case 'bossEnraged': {
        // Aggressive rage activation sound - distorted roar
        const duration = 0.8;
        
        // Deep rumbling growl
        const growl = ctx.createOscillator();
        const growlGain = ctx.createGain();
        growl.connect(growlGain);
        growlGain.connect(ctx.destination);
        growl.type = 'sawtooth';
        growl.frequency.setValueAtTime(80, ctx.currentTime);
        growl.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + duration);
        growlGain.gain.setValueAtTime(0.35, ctx.currentTime);
        growlGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        growl.start(ctx.currentTime);
        growl.stop(ctx.currentTime + duration);
        
        // Rising danger tone
        const danger = ctx.createOscillator();
        const dangerGain = ctx.createGain();
        danger.connect(dangerGain);
        dangerGain.connect(ctx.destination);
        danger.type = 'square';
        danger.frequency.setValueAtTime(150, ctx.currentTime);
        danger.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
        danger.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
        dangerGain.gain.setValueAtTime(0.2, ctx.currentTime);
        dangerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        danger.start(ctx.currentTime);
        danger.stop(ctx.currentTime + 0.5);
        
        // Rapid distorted beeps
        for (let i = 0; i < 4; i++) {
          const beepTime = ctx.currentTime + i * 0.08;
          const beep = ctx.createOscillator();
          const beepGain = ctx.createGain();
          beep.connect(beepGain);
          beepGain.connect(ctx.destination);
          beep.type = 'sawtooth';
          beep.frequency.setValueAtTime(800 + i * 100, beepTime);
          beepGain.gain.setValueAtTime(0.15, beepTime);
          beepGain.gain.exponentialRampToValueAtTime(0.001, beepTime + 0.06);
          beep.start(beepTime);
          beep.stop(beepTime + 0.06);
        }
        
        // Low impact thump
        const thump = ctx.createOscillator();
        const thumpGain = ctx.createGain();
        thump.connect(thumpGain);
        thumpGain.connect(ctx.destination);
        thump.type = 'sine';
        thump.frequency.setValueAtTime(100, ctx.currentTime);
        thump.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
        thumpGain.gain.setValueAtTime(0.4, ctx.currentTime);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        thump.start(ctx.currentTime);
        thump.stop(ctx.currentTime + 0.3);
        break;
      }
      
      case 'screenShakeHaptic': {
        // Trigger haptic feedback for screen shake events (boss rage, big explosions)
        triggerHapticFeedback('rage');
        break;
      }
      
      // ============= HYPERSPACE SOUNDS =============
      
      case 'hyperspaceEnter': {
        // Dramatic warp drive activation - rising synth whoosh
        const duration = 1.2;
        
        // Rising synth sweep
        const sweep = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        sweep.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(80, ctx.currentTime);
        sweep.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.6);
        sweep.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + duration);
        sweepGain.gain.setValueAtTime(0.25, ctx.currentTime);
        sweepGain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.5);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        sweep.start(ctx.currentTime);
        sweep.stop(ctx.currentTime + duration);
        
        // Deep bass rumble
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.type = 'sine';
        bass.frequency.setValueAtTime(40, ctx.currentTime);
        bass.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration);
        bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        bass.start(ctx.currentTime);
        bass.stop(ctx.currentTime + duration);
        
        // Shimmer harmonics
        for (let i = 0; i < 5; i++) {
          const harmonic = ctx.createOscillator();
          const harmonicGain = ctx.createGain();
          harmonic.connect(harmonicGain);
          harmonicGain.connect(ctx.destination);
          harmonic.type = 'sine';
          const startTime = ctx.currentTime + i * 0.1;
          harmonic.frequency.setValueAtTime(400 * (i + 1), startTime);
          harmonic.frequency.exponentialRampToValueAtTime(800 * (i + 1), startTime + 0.5);
          harmonicGain.gain.setValueAtTime(0.08 / (i + 1), startTime);
          harmonicGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
          harmonic.start(startTime);
          harmonic.stop(startTime + 0.6);
        }
        
        triggerHapticFeedback('rage');
        break;
      }
      
      case 'hyperspaceExit': {
        // Warp drive deceleration - falling synth whoosh
        const duration = 0.8;
        
        // Falling synth sweep
        const sweep = ctx.createOscillator();
        const sweepGain = ctx.createGain();
        sweep.connect(sweepGain);
        sweepGain.connect(ctx.destination);
        sweep.type = 'sawtooth';
        sweep.frequency.setValueAtTime(3000, ctx.currentTime);
        sweep.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
        sweepGain.gain.setValueAtTime(0.3, ctx.currentTime);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        sweep.start(ctx.currentTime);
        sweep.stop(ctx.currentTime + duration);
        
        // Impact thump at end
        const thump = ctx.createOscillator();
        const thumpGain = ctx.createGain();
        thump.connect(thumpGain);
        thumpGain.connect(ctx.destination);
        thump.type = 'sine';
        thump.frequency.setValueAtTime(80, ctx.currentTime + 0.3);
        thump.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);
        thumpGain.gain.setValueAtTime(0.001, ctx.currentTime);
        thumpGain.gain.setValueAtTime(0.5, ctx.currentTime + 0.3);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        thump.start(ctx.currentTime);
        thump.stop(ctx.currentTime + duration);
        
        triggerHapticFeedback('rage');
        break;
      }
      
      case 'hyperspaceLoop': {
        // Continuous engine hum/pulse (played periodically during hyperspace)
        const pulse = ctx.createOscillator();
        const pulseGain = ctx.createGain();
        pulse.connect(pulseGain);
        pulseGain.connect(ctx.destination);
        pulse.type = 'sine';
        pulse.frequency.setValueAtTime(60, ctx.currentTime);
        pulse.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
        pulse.frequency.setValueAtTime(60, ctx.currentTime + 0.2);
        pulseGain.gain.setValueAtTime(0.15, ctx.currentTime);
        pulseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        pulse.start(ctx.currentTime);
        pulse.stop(ctx.currentTime + 0.3);
        break;
      }
      
      case 'warpShield': {
        // Energy shield activation - crystalline charge up
        const duration = 0.5;
        const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
        
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          const startTime = ctx.currentTime + i * 0.05;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
          osc.start(startTime);
          osc.stop(startTime + 0.3);
        });
        
        // Shimmer layer
        const shimmer = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        shimmer.connect(shimmerGain);
        shimmerGain.connect(ctx.destination);
        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(2000, ctx.currentTime);
        shimmer.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.2);
        shimmerGain.gain.setValueAtTime(0.08, ctx.currentTime);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        shimmer.start(ctx.currentTime);
        shimmer.stop(ctx.currentTime + duration);
        break;
      }
      
      case 'formationBreaker': {
        // Massive shockwave blast - deep explosion with energy release
        const duration = 0.8;
        
        // Initial impact
        const impact = ctx.createOscillator();
        const impactGain = ctx.createGain();
        impact.connect(impactGain);
        impactGain.connect(ctx.destination);
        impact.type = 'sine';
        impact.frequency.setValueAtTime(200, ctx.currentTime);
        impact.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
        impactGain.gain.setValueAtTime(0.5, ctx.currentTime);
        impactGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        impact.start(ctx.currentTime);
        impact.stop(ctx.currentTime + 0.3);
        
        // Spreading shockwave
        const wave = ctx.createOscillator();
        const waveGain = ctx.createGain();
        wave.connect(waveGain);
        waveGain.connect(ctx.destination);
        wave.type = 'sawtooth';
        wave.frequency.setValueAtTime(800, ctx.currentTime);
        wave.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
        waveGain.gain.setValueAtTime(0.3, ctx.currentTime);
        waveGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        wave.start(ctx.currentTime);
        wave.stop(ctx.currentTime + duration);
        
        // Energy crackle
        for (let i = 0; i < 8; i++) {
          const crackle = ctx.createOscillator();
          const crackleGain = ctx.createGain();
          crackle.connect(crackleGain);
          crackleGain.connect(ctx.destination);
          const crackleTime = ctx.currentTime + i * 0.05 + Math.random() * 0.02;
          crackle.type = 'square';
          crackle.frequency.setValueAtTime(1000 + Math.random() * 2000, crackleTime);
          crackleGain.gain.setValueAtTime(0.1, crackleTime);
          crackleGain.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.03);
          crackle.start(crackleTime);
          crackle.stop(crackleTime + 0.03);
        }
        
        triggerHapticFeedback('rage');
        break;
      }
      
      case 'timeWarp': {
        // Time dilation effect - warbling slowdown
        const duration = 0.6;
        
        // Descending warble
        const warble = ctx.createOscillator();
        const warbleGain = ctx.createGain();
        warble.connect(warbleGain);
        warbleGain.connect(ctx.destination);
        warble.type = 'sine';
        warble.frequency.setValueAtTime(800, ctx.currentTime);
        warble.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
        warbleGain.gain.setValueAtTime(0.2, ctx.currentTime);
        warbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        warble.start(ctx.currentTime);
        warble.stop(ctx.currentTime + duration);
        
        // Pulsating undertone
        for (let i = 0; i < 6; i++) {
          const pulse = ctx.createOscillator();
          const pulseGain = ctx.createGain();
          pulse.connect(pulseGain);
          pulseGain.connect(ctx.destination);
          const pulseTime = ctx.currentTime + i * 0.1;
          pulse.type = 'triangle';
          pulse.frequency.setValueAtTime(150 - i * 15, pulseTime);
          pulseGain.gain.setValueAtTime(0.12, pulseTime);
          pulseGain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.08);
          pulse.start(pulseTime);
          pulse.stop(pulseTime + 0.08);
        }
        break;
      }
      
      case 'magnetPulse': {
        // Magnetic attraction pulse - electrical charging sound
        const duration = 0.4;
        
        // Electric charge up
        const charge = ctx.createOscillator();
        const chargeGain = ctx.createGain();
        charge.connect(chargeGain);
        chargeGain.connect(ctx.destination);
        charge.type = 'sawtooth';
        charge.frequency.setValueAtTime(100, ctx.currentTime);
        charge.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        charge.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration);
        chargeGain.gain.setValueAtTime(0.2, ctx.currentTime);
        chargeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        charge.start(ctx.currentTime);
        charge.stop(ctx.currentTime + duration);
        
        // Magnetic hum
        const hum = ctx.createOscillator();
        const humGain = ctx.createGain();
        hum.connect(humGain);
        humGain.connect(ctx.destination);
        hum.type = 'sine';
        hum.frequency.setValueAtTime(60, ctx.currentTime);
        humGain.gain.setValueAtTime(0.25, ctx.currentTime);
        humGain.gain.setValueAtTime(0.25, ctx.currentTime + 0.2);
        humGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        hum.start(ctx.currentTime);
        hum.stop(ctx.currentTime + duration);
        
        // Sparkle pings
        for (let i = 0; i < 5; i++) {
          const ping = ctx.createOscillator();
          const pingGain = ctx.createGain();
          ping.connect(pingGain);
          pingGain.connect(ctx.destination);
          const pingTime = ctx.currentTime + i * 0.06;
          ping.type = 'sine';
          ping.frequency.setValueAtTime(1500 + i * 200, pingTime);
          pingGain.gain.setValueAtTime(0.08, pingTime);
          pingGain.gain.exponentialRampToValueAtTime(0.001, pingTime + 0.05);
          ping.start(pingTime);
          ping.stop(pingTime + 0.05);
        }
        break;
      }
    }
  } catch (e) {
    // Audio context not available
  }
}

// Ship-specific shoot sounds
function playShipShootSound(ctx: AudioContext, soundType: string): void {
  switch (soundType) {
    case 'laser': {
      // High-pitched laser beam
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(3200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
      break;
    }
    
    case 'plasma': {
      // Deep pulsing plasma sound
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const gain2 = ctx.createGain();
      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      // Harmonic
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(800, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
      gain2.gain.setValueAtTime(0.1, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.08);
      break;
    }
    
    case 'energy': {
      // Electric zap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
      osc.frequency.setValueAtTime(2000, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
      break;
    }
    
    case 'pulse': {
      // Heavy thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
      break;
    }
    
    case 'fire': {
      // Crackling fire burst
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600 + Math.random() * 400, ctx.currentTime + i * 0.02);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + i * 0.02 + 0.06);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.02 + 0.06);
        osc.start(ctx.currentTime + i * 0.02);
        osc.stop(ctx.currentTime + i * 0.02 + 0.06);
      }
      break;
    }
    
    case 'ice': {
      // Crystal ice shatter
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const gain2 = ctx.createGain();
      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      // Shimmer
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(4800, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.04);
      gain2.gain.setValueAtTime(0.06, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.06);
      break;
    }
    
    default: {
      // Default shoot sound (same as original)
      if (laserBuffer) {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        source.buffer = laserBuffer;
        source.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        source.start(ctx.currentTime, 0, 0.15);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(2400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      }
      break;
    }
  }
}
