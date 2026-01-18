// Vector Maniac Sound Effects - Arcade Style

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export type VectorSoundType = 'shoot' | 'hit' | 'explosion' | 'salvage' | 'damage' | 'shield' | 'waveComplete' | 'powerup' | 'rareSalvage';

export function playVectorSound(type: VectorSoundType): void {
  try {
    const ctx = getAudioContext();
    
    switch (type) {
      case 'shoot': {
        // Sci-fi laser zap - sharp and punchy
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gain3 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        gain3.connect(ctx.destination);
        
        // Main laser - sharp descending zap
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(2400, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
        gain1.gain.setValueAtTime(0.18, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        
        // High freq sizzle
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(3200, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        
        // Sub bass punch
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(400, ctx.currentTime);
        osc3.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.03);
        gain3.gain.setValueAtTime(0.12, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.06);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.04);
        osc3.start(ctx.currentTime);
        osc3.stop(ctx.currentTime + 0.03);
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
    }
  } catch (e) {
    // Audio context not available
  }
}
