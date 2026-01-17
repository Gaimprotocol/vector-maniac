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
