// Simple pop sound using Web Audio API
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playPopSound = (volume: number = 0.15) => {
  try {
    const ctx = getAudioContext();
    
    // Create oscillator for the pop
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Pop sound characteristics - short high-pitched blip
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    
    // Quick attack and decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silently fail if audio context isn't available
  }
};

// Play multiple pop sounds with delays (for staggered animations)
export const playPopSoundsWithDelays = (delays: number[], volume: number = 0.12) => {
  delays.forEach((delay) => {
    setTimeout(() => playPopSound(volume), delay);
  });
};

// Play a satisfying purchase/upgrade sound effect
export const playPurchaseSound = (volume: number = 0.25) => {
  try {
    const ctx = getAudioContext();
    
    // Layer 1: Rising arpeggio "cha-ching" effect
    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6 - major chord arpeggio
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
      
      const startTime = ctx.currentTime + i * 0.06;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * (1 - i * 0.15), startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
      
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
    
    // Layer 2: Shimmer/sparkle effect
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    
    shimmerOsc.type = 'triangle';
    shimmerOsc.frequency.setValueAtTime(2000, ctx.currentTime);
    shimmerOsc.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.15);
    
    shimmerGain.gain.setValueAtTime(0, ctx.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 0.02);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    shimmerOsc.start(ctx.currentTime);
    shimmerOsc.stop(ctx.currentTime + 0.35);
    
  } catch (e) {
    // Silently fail if audio context isn't available
  }
};

// Trigger haptic feedback (vibration)
export const triggerHapticFeedback = (pattern: 'light' | 'medium' | 'heavy' | 'success' | 'rage' | 'death' = 'medium') => {
  try {
    if (!navigator.vibrate) return;
    
    switch (pattern) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(30);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        // Double pulse for success feeling
        navigator.vibrate([30, 50, 50]);
        break;
      case 'rage':
        // Intense rumble pattern for boss rage mode
        navigator.vibrate([80, 40, 120, 40, 80]);
        break;
      case 'death':
        // Heavy impact followed by fading rumbles for player death
        navigator.vibrate([150, 50, 100, 40, 80, 30, 50]);
        break;
    }
  } catch (e) {
    // Silently fail if vibration isn't available
  }
};
