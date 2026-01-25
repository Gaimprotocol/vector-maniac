import { useState, useCallback, useEffect } from 'react';
import { adMobService } from '@/services/admob';

export interface AdReward {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Rewards now give 20% improvements (max stacked 40%)
const AD_REWARDS: AdReward[] = [
  { id: 'double_bombs', name: 'DOUBLE BOMBS', description: 'Auto-fire double bombs for 45 sec', icon: '◉' },
  { id: 'triple_shots', name: 'TRIPLE SHOTS', description: 'Triple laser shots for 30 sec', icon: '⫷' },
  { id: 'double_laser', name: 'DOUBLE LASER', description: 'Double laser shots for 40 sec', icon: '⚡' },
  { id: 'shield_boost', name: 'SHIELD BOOST', description: 'Shield protection for 60 sec', icon: '⬡' },
  { id: 'double_points', name: 'DOUBLE POINTS', description: 'Double score for 40 sec', icon: '◆' },
  { id: 'speed_boost', name: 'SPEED BOOST', description: '+20% movement speed for 45 sec', icon: '▷' },
];

export interface ActiveAdRewards {
  doubleBombsUntil: number | null; // Timestamp when double bombs expire
  tripleShotsUntil: number | null; // Timestamp when triple shots expire
  doubleLaserUntil: number | null; // Timestamp when double laser expire
  shieldBoostUntil: number | null; // Timestamp when shield expire
  doublePointsUntil: number | null; // Timestamp when double points expire
  speedBoostUntil: number | null; // Timestamp when speed boost expire
}

// Store remaining time when paused (in milliseconds)
interface PausedRewards {
  doubleBombsRemaining: number | null;
  tripleShotsRemaining: number | null;
  doubleLaserRemaining: number | null;
  shieldBoostRemaining: number | null;
  doublePointsRemaining: number | null;
  speedBoostRemaining: number | null;
}

const STORAGE_KEY = 'galactic_overdrive_ad_rewards';
const PENDING_REWARDS_KEY = 'galactic_overdrive_pending_rewards';
const SESSION_AD_COUNT_KEY = 'galactic_overdrive_session_ad_count';
const MAX_ADS_PER_SESSION = 2;

const defaultAdRewards: ActiveAdRewards = {
  doubleBombsUntil: null,
  tripleShotsUntil: null,
  doubleLaserUntil: null,
  shieldBoostUntil: null,
  doublePointsUntil: null,
  speedBoostUntil: null,
};

const defaultPausedRewards: PausedRewards = {
  doubleBombsRemaining: null,
  tripleShotsRemaining: null,
  doubleLaserRemaining: null,
  shieldBoostRemaining: null,
  doublePointsRemaining: null,
  speedBoostRemaining: null,
};

// Pending rewards that can be activated manually
export interface PendingReward {
  id: string;
  rewardId: string;
  name: string;
  icon: string;
  description: string;
}

export function useRewardedAds() {
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [pendingReward, setPendingReward] = useState<AdReward | null>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedRewards, setPausedRewards] = useState<PausedRewards>(defaultPausedRewards);
  
  // New safe ad flow states
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [adButtonDisabledUntil, setAdButtonDisabledUntil] = useState<number | null>(null);
  
  const [sessionAdCount, setSessionAdCount] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_AD_COUNT_KEY);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [activeRewards, setActiveRewards] = useState<ActiveAdRewards>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultAdRewards, ...JSON.parse(stored) } : defaultAdRewards;
    } catch {
      return defaultAdRewards;
    }
  });
  
  // Pending rewards that user can activate manually
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>(() => {
    try {
      const stored = localStorage.getItem(PENDING_REWARDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Check if native platform and set up event listeners
  useEffect(() => {
    const native = adMobService.isNativePlatform();
    setIsNative(native);
    
    if (native) {
      // Set up event listeners for native ads
      const unsubLoaded = adMobService.onRewardedAdLoaded(() => {
        console.log('[useRewardedAds] Ad loaded callback');
        setIsAdReady(true);
        setIsAdLoading(false);
        setAdError(null);
      });
      
      const unsubFailed = adMobService.onRewardedAdFailed((error) => {
        console.log('[useRewardedAds] Ad failed callback:', error);
        setIsAdReady(false);
        setIsAdLoading(false);
        setAdError('Failed to load ad');
      });
      
      const unsubClosed = adMobService.onRewardedAdClosed(() => {
        console.log('[useRewardedAds] Ad closed callback');
        setIsShowingAd(false);
        setIsAdReady(false);
        // Ad will auto-prepare via service
      });
      
      // Check initial state
      setIsAdReady(adMobService.isRewardedAdReady());
      
      return () => {
        unsubLoaded();
        unsubFailed();
        unsubClosed();
      };
    } else {
      // Web simulation - always "ready"
      setIsAdReady(true);
    }
  }, []);

  const saveActiveRewards = useCallback((rewards: ActiveAdRewards) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
      setActiveRewards(rewards);
    } catch (error) {
      console.error('[AdRewards] Failed to save:', error);
    }
  }, []);

  const savePendingRewards = useCallback((rewards: PendingReward[]) => {
    try {
      localStorage.setItem(PENDING_REWARDS_KEY, JSON.stringify(rewards));
      setPendingRewards(rewards);
    } catch (error) {
      console.error('[AdRewards] Failed to save pending rewards:', error);
    }
  }, []);

  // Add a reward to pending list (not activated yet)
  const addToPendingRewards = useCallback((reward: AdReward) => {
    const newPending: PendingReward = {
      id: `${reward.id}_${Date.now()}`,
      rewardId: reward.id,
      name: reward.name,
      icon: reward.icon,
      description: reward.description,
    };
    const updated = [...pendingRewards, newPending];
    savePendingRewards(updated);
    console.log('[AdRewards] Added to pending:', newPending);
  }, [pendingRewards, savePendingRewards]);

  const incrementSessionAdCount = useCallback(() => {
    const newCount = sessionAdCount + 1;
    setSessionAdCount(newCount);
    try {
      sessionStorage.setItem(SESSION_AD_COUNT_KEY, newCount.toString());
    } catch (error) {
      console.error('[AdRewards] Failed to save session count:', error);
    }
  }, [sessionAdCount]);

  // Reset session ad count (called when a new game session starts)
  const resetSessionAdCount = useCallback(() => {
    setSessionAdCount(0);
    try {
      sessionStorage.setItem(SESSION_AD_COUNT_KEY, '0');
    } catch (error) {
      console.error('[AdRewards] Failed to reset session count:', error);
    }
  }, []);

  // Check if player can watch more ads this session
  const canWatchAd = useCallback(() => {
    return sessionAdCount < MAX_ADS_PER_SESSION;
  }, [sessionAdCount]);

  // Get remaining ad watches
  const remainingAdWatches = useCallback(() => {
    return Math.max(0, MAX_ADS_PER_SESSION - sessionAdCount);
  }, [sessionAdCount]);

  // Get random reward
  const getRandomReward = useCallback((): AdReward => {
    const index = Math.floor(Math.random() * AD_REWARDS.length);
    return AD_REWARDS[index];
  }, []);

  // Apply reward to state (timed rewards, stackable by extending duration)
  const applyReward = useCallback((reward: AdReward) => {
    const now = Date.now();
    const newRewards = { ...activeRewards };
    
    // Stack rewards by extending time (each stack adds full duration, max 2x = 40% effect window)
    const extendTime = (current: number | null, duration: number): number => {
      if (current && current > now) {
        // Stack: extend the existing timer (max 2x duration)
        return Math.min(current + duration, now + duration * 2);
      }
      return now + duration;
    };

    switch (reward.id) {
      case 'double_bombs':
        newRewards.doubleBombsUntil = extendTime(newRewards.doubleBombsUntil, 45000);
        break;
      case 'triple_shots':
        newRewards.tripleShotsUntil = extendTime(newRewards.tripleShotsUntil, 30000);
        break;
      case 'double_laser':
        newRewards.doubleLaserUntil = extendTime(newRewards.doubleLaserUntil, 40000);
        break;
      case 'shield_boost':
        newRewards.shieldBoostUntil = extendTime(newRewards.shieldBoostUntil, 60000);
        break;
      case 'double_points':
        newRewards.doublePointsUntil = extendTime(newRewards.doublePointsUntil, 40000);
        break;
      case 'speed_boost':
        newRewards.speedBoostUntil = extendTime(newRewards.speedBoostUntil, 45000);
        break;
    }
    saveActiveRewards(newRewards);
    console.log('[AdRewards] Applied reward:', reward.id, 'New state:', newRewards);
  }, [activeRewards, saveActiveRewards]);

  // Activate a pending reward (called when user taps the reward button)
  const activatePendingReward = useCallback((pendingId: string) => {
    const pending = pendingRewards.find(p => p.id === pendingId);
    if (!pending) {
      console.log('[AdRewards] Pending reward not found:', pendingId);
      return;
    }
    
    // Find the full reward data
    const reward = AD_REWARDS.find(r => r.id === pending.rewardId);
    if (reward) {
      applyReward(reward);
    }
    
    // Remove from pending
    const updated = pendingRewards.filter(p => p.id !== pendingId);
    savePendingRewards(updated);
    console.log('[AdRewards] Activated pending reward:', pending.rewardId);
  }, [pendingRewards, savePendingRewards, applyReward]);

  // Check if the ad button should be disabled (cooldown after "not ready" message)
  const isAdButtonDisabled = useCallback(() => {
    if (adButtonDisabledUntil && Date.now() < adButtonDisabledUntil) {
      return true;
    }
    return false;
  }, [adButtonDisabledUntil]);

  // Try to prepare an ad (used when ad is not ready)
  const prepareAd = useCallback(async () => {
    if (isNative) {
      console.log('[useRewardedAds] Preparing ad...');
      setIsAdLoading(true);
      setAdError(null);
      await adMobService.prepareRewardedAd();
      // Result will come via event callbacks
    }
  }, [isNative]);

  // Grant the reward (called only when SDK confirms reward earned)
  const grantReward = useCallback((onComplete?: () => void) => {
    console.log('[useRewardedAds] Granting reward...');
    incrementSessionAdCount();
    const reward = getRandomReward();
    setPendingReward(reward);
    setShowRewardPopup(true);
    addToPendingRewards(reward);
    onComplete?.();
  }, [incrementSessionAdCount, getRandomReward, addToPendingRewards]);

  // Show rewarded ad with SAFE FLOW
  const showRewardedAd = useCallback((onComplete?: () => void) => {
    // Check if player can still watch ads this session
    if (!canWatchAd()) {
      console.log('[useRewardedAds] Max ads reached for this session');
      setAdError('Maximum ads watched this session');
      onComplete?.();
      return;
    }

    // Clear any previous error
    setAdError(null);

    if (isNative) {
      // SAFE FLOW: Check if ad is ready FIRST
      if (!adMobService.isRewardedAdReady()) {
        console.log('[useRewardedAds] Ad NOT ready - preparing...');
        setAdError('No ad available right now. Try again in a moment.');
        
        // Disable button for 4 seconds
        setAdButtonDisabledUntil(Date.now() + 4000);
        
        // Start preparing an ad
        prepareAd();
        
        // Do NOT attempt to show
        return;
      }

      // Ad IS ready - show it
      console.log('[useRewardedAds] Ad ready - showing...');
      setIsShowingAd(true);

      // Set up one-time reward listener for THIS ad view
      const unsubReward = adMobService.onRewardEarned(() => {
        console.log('[useRewardedAds] Reward earned event received!');
        grantReward(onComplete);
        unsubReward();
      });

      // Show the ad
      adMobService.showRewardedAd().then((result) => {
        if (!result.success) {
          console.log('[useRewardedAds] Show failed:', result.error);
          setIsShowingAd(false);
          setAdError(result.error || 'Failed to show ad');
          unsubReward(); // Clean up listener on failure
        }
        // Note: setIsShowingAd(false) is handled by onRewardedAdClosed callback
      });
    } else {
      // Web simulation - always works
      setIsShowingAd(true);
      setAdProgress(0);
      
      const duration = 5000 + Math.random() * 2000;
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setAdProgress(progress);
        
        if (progress >= 1) {
          clearInterval(interval);
          setIsShowingAd(false);
          
          // Simulate reward earned event
          grantReward(onComplete);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isNative, canWatchAd, prepareAd, grantReward]);

  // Show interstitial ad (between levels)
  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    if (isNative) {
      const result = await adMobService.showInterstitialAd();
      return result.success;
    }
    // Skip interstitial on web
    return true;
  }, [isNative]);

  const closeRewardPopup = useCallback(() => {
    setShowRewardPopup(false);
    setPendingReward(null);
  }, []);

  // Pause all active rewards (save remaining time, clear timestamps)
  const pauseRewards = useCallback(() => {
    if (isPaused) return; // Already paused
    
    const now = Date.now();
    const remaining: PausedRewards = {
      doubleBombsRemaining: activeRewards.doubleBombsUntil && activeRewards.doubleBombsUntil > now 
        ? activeRewards.doubleBombsUntil - now : null,
      tripleShotsRemaining: activeRewards.tripleShotsUntil && activeRewards.tripleShotsUntil > now 
        ? activeRewards.tripleShotsUntil - now : null,
      doubleLaserRemaining: activeRewards.doubleLaserUntil && activeRewards.doubleLaserUntil > now 
        ? activeRewards.doubleLaserUntil - now : null,
      shieldBoostRemaining: activeRewards.shieldBoostUntil && activeRewards.shieldBoostUntil > now 
        ? activeRewards.shieldBoostUntil - now : null,
      doublePointsRemaining: activeRewards.doublePointsUntil && activeRewards.doublePointsUntil > now 
        ? activeRewards.doublePointsUntil - now : null,
      speedBoostRemaining: activeRewards.speedBoostUntil && activeRewards.speedBoostUntil > now 
        ? activeRewards.speedBoostUntil - now : null,
    };
    
    console.log('[AdRewards] Pausing rewards, remaining times:', remaining);
    setPausedRewards(remaining);
    setIsPaused(true);
    
    // Clear active timestamps while paused (rewards won't trigger during bonus maps)
    saveActiveRewards(defaultAdRewards);
  }, [isPaused, activeRewards, saveActiveRewards]);

  // Resume all paused rewards (restore timestamps from remaining time)
  const resumeRewards = useCallback(() => {
    if (!isPaused) return; // Not paused
    
    const now = Date.now();
    const restored: ActiveAdRewards = {
      doubleBombsUntil: pausedRewards.doubleBombsRemaining ? now + pausedRewards.doubleBombsRemaining : null,
      tripleShotsUntil: pausedRewards.tripleShotsRemaining ? now + pausedRewards.tripleShotsRemaining : null,
      doubleLaserUntil: pausedRewards.doubleLaserRemaining ? now + pausedRewards.doubleLaserRemaining : null,
      shieldBoostUntil: pausedRewards.shieldBoostRemaining ? now + pausedRewards.shieldBoostRemaining : null,
      doublePointsUntil: pausedRewards.doublePointsRemaining ? now + pausedRewards.doublePointsRemaining : null,
      speedBoostUntil: pausedRewards.speedBoostRemaining ? now + pausedRewards.speedBoostRemaining : null,
    };
    
    console.log('[AdRewards] Resuming rewards, restored timestamps:', restored);
    saveActiveRewards(restored);
    setPausedRewards(defaultPausedRewards);
    setIsPaused(false);
  }, [isPaused, pausedRewards, saveActiveRewards]);

  // Check if specific rewards are currently active (only when not paused)
  const isDoubleBombsActive = useCallback(() => {
    if (isPaused) return false;
    return activeRewards.doubleBombsUntil !== null && Date.now() < activeRewards.doubleBombsUntil;
  }, [activeRewards, isPaused]);

  const isTripleShotsActive = useCallback(() => {
    if (isPaused) return false;
    return activeRewards.tripleShotsUntil !== null && Date.now() < activeRewards.tripleShotsUntil;
  }, [activeRewards, isPaused]);

  const isDoubleLaserActive = useCallback(() => {
    if (isPaused) return false;
    return activeRewards.doubleLaserUntil !== null && Date.now() < activeRewards.doubleLaserUntil;
  }, [activeRewards, isPaused]);

  const isShieldBoostActive = useCallback(() => {
    if (isPaused) return false;
    return activeRewards.shieldBoostUntil !== null && Date.now() < activeRewards.shieldBoostUntil;
  }, [activeRewards, isPaused]);

  const isDoublePointsActive = useCallback(() => {
    if (isPaused) return false;
    return activeRewards.doublePointsUntil !== null && Date.now() < activeRewards.doublePointsUntil;
  }, [activeRewards, isPaused]);

  const isSpeedBoostActive = useCallback(() => {
    if (isPaused) return false;
    return activeRewards.speedBoostUntil !== null && Date.now() < activeRewards.speedBoostUntil;
  }, [activeRewards, isPaused]);

  // Get list of active rewards for display (show paused rewards too with remaining time)
  const getActiveRewardsList = useCallback(() => {
    const now = Date.now();
    const active: { name: string; icon: string; timeLeft: number }[] = [];
    
    if (isPaused) {
      // Show paused rewards with their remaining time
      if (pausedRewards.doubleBombsRemaining) {
        active.push({ name: 'DOUBLE BOMBS ⏸', icon: '💣', timeLeft: pausedRewards.doubleBombsRemaining });
      }
      if (pausedRewards.tripleShotsRemaining) {
        active.push({ name: 'TRIPLE SHOTS ⏸', icon: '🔱', timeLeft: pausedRewards.tripleShotsRemaining });
      }
      if (pausedRewards.doubleLaserRemaining) {
        active.push({ name: 'DOUBLE LASER ⏸', icon: '⚡', timeLeft: pausedRewards.doubleLaserRemaining });
      }
      if (pausedRewards.shieldBoostRemaining) {
        active.push({ name: 'SHIELD ⏸', icon: '🛡️', timeLeft: pausedRewards.shieldBoostRemaining });
      }
      if (pausedRewards.doublePointsRemaining) {
        active.push({ name: 'x2 POINTS ⏸', icon: '⭐', timeLeft: pausedRewards.doublePointsRemaining });
      }
      if (pausedRewards.speedBoostRemaining) {
        active.push({ name: 'SPEED ⏸', icon: '💨', timeLeft: pausedRewards.speedBoostRemaining });
      }
    } else {
      // Show active rewards
      if (activeRewards.doubleBombsUntil && activeRewards.doubleBombsUntil > now) {
        active.push({ name: 'DOUBLE BOMBS', icon: '💣', timeLeft: activeRewards.doubleBombsUntil - now });
      }
      if (activeRewards.tripleShotsUntil && activeRewards.tripleShotsUntil > now) {
        active.push({ name: 'TRIPLE SHOTS', icon: '🔱', timeLeft: activeRewards.tripleShotsUntil - now });
      }
      if (activeRewards.doubleLaserUntil && activeRewards.doubleLaserUntil > now) {
        active.push({ name: 'DOUBLE LASER', icon: '⚡', timeLeft: activeRewards.doubleLaserUntil - now });
      }
      if (activeRewards.shieldBoostUntil && activeRewards.shieldBoostUntil > now) {
        active.push({ name: 'SHIELD', icon: '🛡️', timeLeft: activeRewards.shieldBoostUntil - now });
      }
      if (activeRewards.doublePointsUntil && activeRewards.doublePointsUntil > now) {
        active.push({ name: 'x2 POINTS', icon: '⭐', timeLeft: activeRewards.doublePointsUntil - now });
      }
      if (activeRewards.speedBoostUntil && activeRewards.speedBoostUntil > now) {
        active.push({ name: 'SPEED', icon: '💨', timeLeft: activeRewards.speedBoostUntil - now });
      }
    }
    
    return active;
  }, [activeRewards, isPaused, pausedRewards]);

  const clearSessionRewards = useCallback(() => {
    saveActiveRewards(defaultAdRewards);
    setPausedRewards(defaultPausedRewards);
    setIsPaused(false);
  }, [saveActiveRewards]);

  // Get pending rewards list for UI
  const getPendingRewardsList = useCallback(() => {
    return pendingRewards;
  }, [pendingRewards]);

  return {
    isShowingAd,
    adProgress,
    pendingReward,
    showRewardPopup,
    activeRewards,
    isNative,
    isPaused,
    showRewardedAd,
    showInterstitialAd,
    closeRewardPopup,
    isDoubleBombsActive,
    isTripleShotsActive,
    isDoubleLaserActive,
    isShieldBoostActive,
    isDoublePointsActive,
    isSpeedBoostActive,
    getActiveRewardsList,
    getPendingRewardsList,
    activatePendingReward,
    clearSessionRewards,
    canWatchAd,
    remainingAdWatches,
    resetSessionAdCount,
    sessionAdCount,
    pauseRewards,
    resumeRewards,
    pendingRewards,
    // New safe ad flow exports
    isAdReady,
    isAdLoading,
    adError,
    isAdButtonDisabled,
    prepareAd,
  };
}
