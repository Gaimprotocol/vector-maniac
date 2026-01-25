import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { MenuScreen } from './MenuScreen';
import { PauseScreen } from './PauseScreen';
import { GameOverScreen } from './GameOverScreen';
import { VectorManiacEndScreen } from './VectorManiacEndScreen';
import { TouchControls } from './TouchControls';
import { PortalChoiceModal } from './PortalChoiceModal';
import { UpgradePickModal } from './UpgradePickModal';
import { useTouchInput } from '@/game/useTouchInput';
import { useGameLoop } from '@/game/useGameLoop';
import { useEquipment } from '@/hooks/useEquipment';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { usePurchases } from '@/hooks/usePurchases';
import { getStoredSoundtrackFile } from '@/hooks/useSoundtrack';
import { createInitialGameData, startGame, startVectorManiac, pauseGame } from '@/game/gameLogic';
import { selectUpgrade } from '@/game/vectorManiac/gameLogic';
import { GameData } from '@/game/types';
import { primeAudioContext, setSfxMuted as setGlobalSfxMuted } from '@/game/utils';
import { fadeOut, fadeIn, fadeOutAllExcept } from '@/utils/audioTransitions';

interface GameProps {
  autoStart?: boolean;
  onGameEnd?: () => void;
  survivalMode?: boolean;
  vectorManiacMode?: boolean;
  startMusicRef?: React.MutableRefObject<HTMLAudioElement | null>;
  // External reward system props (from Index.tsx)
  externalPendingRewards?: any[];
  externalActiveRewardsList?: { name: string; icon: string; timeLeft: number }[];
  onActivatePendingReward?: (id: string) => void;
}

export const Game: React.FC<GameProps> = ({ 
  autoStart = false, 
  onGameEnd, 
  survivalMode = false,
  vectorManiacMode = false, 
  startMusicRef,
  externalPendingRewards,
  externalActiveRewardsList,
  onActivatePendingReward: externalActivatePendingReward,
}) => {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState<GameData>(createInitialGameData);
  const [musicMuted, setMusicMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [hasUsedAdContinue, setHasUsedAdContinue] = useState(false); // Track if player used ad continue this session
  const { inputState, updateInput } = useTouchInput();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainMusicRef = useRef<HTMLAudioElement | null>(null);
  const hazardMusicRef = useRef<HTMLAudioElement | null>(null);
  const vectorManiacMusicRef = useRef<HTMLAudioElement | null>(null);
  const hasAutoStarted = useRef(false);
  
  // Purchase system for Ultimate Edition check
  const { hasGoldenSkin } = usePurchases();
  
  // Ad reward system
  const {
    activeRewards: adRewards,
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
    resetSessionAdCount,
    pauseRewards,
    resumeRewards,
    isPaused: areRewardsPaused,
  } = useRewardedAds();
  
  // Equipment system (active skins)
  const { equipment } = useEquipment();

  // Auto-start game when autoStart prop is true
  useEffect(() => {
    if (autoStart && !hasAutoStarted.current && gameData.state === 'menu') {
      hasAutoStarted.current = true;
      if (vectorManiacMode) {
        setGameData(prev => startVectorManiac(prev));
      } else {
        setGameData(prev => startGame(prev));
      }
    }
  }, [autoStart, vectorManiacMode, gameData.state]);

  // Get the current soundtrack file
  const currentSoundtrackFile = getStoredSoundtrackFile();

  // Initialize and preload all music tracks
  useEffect(() => {
    const initAudio = (src: string, volume: number) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.volume = volume;
      audio.preload = 'auto';
      audio.load();
      return audio;
    };
    
    mainMusicRef.current = initAudio(currentSoundtrackFile, 0.128);
    hazardMusicRef.current = initAudio('/audio/Hazard_zone.mp3', 0.128);
    vectorManiacMusicRef.current = initAudio('/audio/Main_music.mp3', 0.128);
    
    return () => {
      [mainMusicRef, hazardMusicRef, vectorManiacMusicRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, [currentSoundtrackFile]);

  // Prime audio context on first user interaction for mobile (without interrupting music)
  useEffect(() => {
    const primeAudio = () => {
      // Only prime the AudioContext for sound effects - don't touch music
      primeAudioContext();
      document.removeEventListener('touchstart', primeAudio);
      document.removeEventListener('click', primeAudio);
    };
    
    document.addEventListener('touchstart', primeAudio, { once: true });
    document.addEventListener('click', primeAudio, { once: true });
    
    return () => {
      document.removeEventListener('touchstart', primeAudio);
      document.removeEventListener('click', primeAudio);
    };
  }, []);

  // Control music based on game state and mute settings with smooth crossfades
  useEffect(() => {
    const mainMusic = mainMusicRef.current;
    const hazardMusic = hazardMusicRef.current;
    const vectorManiacMusic = vectorManiacMusicRef.current;
    if (!mainMusic || !hazardMusic || !vectorManiacMusic) return;
    
    const allMusic = [mainMusic, hazardMusic, vectorManiacMusic];
    allMusic.forEach(m => m.muted = musicMuted);
    
    const FADE_DURATION = 500; // Duration for sequential fade (out then in)
    const HAZARD_CROSSFADE = 300; // Quick crossfade for hazard zone
    
    // Quick crossfade for hazard zone (simultaneous fade out/in)
    const quickCrossfadeToHazard = () => {
      fadeOutAllExcept(allMusic, [hazardMusic], HAZARD_CROSSFADE, [mainMusic]);
      fadeIn(hazardMusic, 0.128, HAZARD_CROSSFADE);
    };
    
    if (gameData.state === 'vectorManiac') {
      // Vector Maniac - crossfade to Vector Maniac music
      (async () => {
        // Fade out start music if playing
        if (startMusicRef?.current && !startMusicRef.current.paused) {
          await fadeOut(startMusicRef.current, FADE_DURATION, true);
        }
        // Fade out any other music except Vector Maniac
        const otherTracks = allMusic.filter(m => m !== vectorManiacMusic && !m.paused);
        if (otherTracks.length > 0) {
          await Promise.all(otherTracks.map(track => fadeOut(track, FADE_DURATION, true)));
        }
        // Then fade in Vector Maniac music
        await fadeIn(vectorManiacMusic, 0.128, FADE_DURATION);
      })();
    } else if (gameData.state === 'playing' && gameData.inHazardZone) {
      // Hazard Zone - quick crossfade (300ms)
      quickCrossfadeToHazard();
    } else if (gameData.state === 'playing') {
      // Sequential fade: fade out ALL playing music, then fade in main music
      (async () => {
        // Fade out start music if playing
        if (startMusicRef?.current && !startMusicRef.current.paused) {
          await fadeOut(startMusicRef.current, FADE_DURATION, true);
        }
        // Fade out any other music that might still be playing
        const otherTracks = allMusic.filter(m => m !== mainMusic && !m.paused);
        if (otherTracks.length > 0) {
          await Promise.all(otherTracks.map(track => fadeOut(track, FADE_DURATION, true)));
        }
        // Then fade in main music
        await fadeIn(mainMusic, 0.128, FADE_DURATION);
      })();
    } else if (gameData.state === 'menu') {
      // Fade out all game music when returning to menu
      fadeOutAllExcept(allMusic, [], FADE_DURATION, [mainMusic]);
    } else if (gameData.state === 'paused' || gameData.state === 'gameover') {
      // Fade out when paused/gameover
      allMusic.forEach(m => fadeOut(m, 800, false));
    }
  }, [gameData.state, gameData.inHazardZone, musicMuted, startMusicRef]);

  // Pause/resume ad rewards based on game state (pause during bonus maps)
  useEffect(() => {
    const bonusStates = ['bunker', 'rover', 'underwater', 'arena', 'pilotRunner', 'paratrooper', 'forwardFlight'];
    const isBonusMap = bonusStates.includes(gameData.state);
    
    if (isBonusMap && !areRewardsPaused) {
      console.log('[Game] Entering bonus map, pausing ad rewards');
      pauseRewards();
    } else if (!isBonusMap && areRewardsPaused && gameData.state === 'playing') {
      console.log('[Game] Returning to main game, resuming ad rewards');
      resumeRewards();
    }
  }, [gameData.state, areRewardsPaused, pauseRewards, resumeRewards]);

  // Handle pause input
  useEffect(() => {
    const activeStates = ['playing', 'paused', 'bunker', 'rover', 'underwater', 'arena', 'survival', 'pilotRunner', 'paratrooper', 'forwardFlight', 'vectorManiac'];
    if (inputState.pause && activeStates.includes(gameData.state)) {
      if (gameData.state === 'paused') {
        setGameData(prev => ({ ...prev, state: prev.previousState || 'playing' }));
      } else {
        setGameData(prev => ({ ...prev, state: 'paused', previousState: prev.state as any }));
      }
      updateInput({ pause: false });
    }
  }, [inputState.pause, gameData.state, updateInput]);

  // Create ad reward checkers object for game loop
  const adRewardCheckers = {
    isDoubleBombsActive,
    isTripleShotsActive,
    isDoubleLaserActive,
    isShieldBoostActive,
    isDoublePointsActive,
    isSpeedBoostActive,
  };

  // Game loop
  useGameLoop({ 
    gameData, 
    setGameData, 
    inputState,
    adRewardCheckers,
  });

  const handleStart = useCallback(() => {
    // Reset ad continue flag for new game
    setHasUsedAdContinue(false);
    
    // Reset session ad count for new game session
    resetSessionAdCount();
    
    // Check active timed rewards
    const hasDoublePoints = isDoublePointsActive();
    const hasShield = isShieldBoostActive();
    const hasSpeed = isSpeedBoostActive();
    const hasDoubleBombs = isDoubleBombsActive();
    const hasTripleShots = isTripleShotsActive();
    const hasDoubleLaser = isDoubleLaserActive();
    
    console.log('[Game] Starting with active rewards - DoublePoints:', hasDoublePoints, 'Shield:', hasShield, 'Speed:', hasSpeed);
    
    setGameData(prev => {
      const newData = startGame({ ...prev, hasUltimateEdition: hasGoldenSkin() });
      return {
        ...newData,
        score: 0,
        hasUltimateEdition: hasGoldenSkin(),
        // Store active reward states for game logic
        adDoublePointsActive: hasDoublePoints,
        adShieldActive: hasShield,
        adSpeedActive: hasSpeed,
        adDoubleBombsActive: hasDoubleBombs,
        adTripleShotsActive: hasTripleShots,
        adDoubleLaserActive: hasDoubleLaser,
      };
    });
  }, [isDoublePointsActive, isShieldBoostActive, isSpeedBoostActive, isDoubleBombsActive, isTripleShotsActive, isDoubleLaserActive, resetSessionAdCount, hasGoldenSkin]);

  // Handle continue after watching ad - restore player with full health
  const handleContinueWithAd = useCallback(() => {
    setHasUsedAdContinue(true);
    setGameData(prev => ({
      ...prev,
      state: prev.previousState || 'playing',
      player: {
        ...prev.player,
        health: prev.player.maxHealth,
        invulnerable: true,
        invulnerableTimer: 180, // 3 seconds of invulnerability
      },
    }));
  }, []);

  const handleResume = useCallback(() => {
    setGameData(prev => ({ ...prev, state: prev.previousState || 'playing' }));
  }, []);

  const handleQuit = useCallback(() => {
    hasAutoStarted.current = false;
    setGameData(createInitialGameData());
    onGameEnd?.();
  }, [onGameEnd]);

  const handleStartVectorManiac = useCallback(() => {
    setHasUsedAdContinue(false);
    resetSessionAdCount();
    setGameData(prev => startVectorManiac(prev));
  }, [resetSessionAdCount]);

  // Handle continue for Vector Maniac after watching ad
  const handleVectorManiacContinue = useCallback(() => {
    setHasUsedAdContinue(true);
    setGameData(prev => {
      if (!prev.vectorManiacState) return prev;
      return {
        ...prev,
        vectorManiacState: {
          ...prev.vectorManiacState,
          phase: 'playing',
          health: prev.vectorManiacState.maxHealth,
          invulnerableTimer: 120, // 2 seconds of invulnerability
        },
      };
    });
  }, []);


  const isNewHighScore = gameData.state === 'gameover' && gameData.score >= gameData.highScore && gameData.score > 0;

  return (
    <div className="relative w-full h-full bg-black">
      {/* Game canvas - full screen */}
      <div className="relative w-full h-full overflow-hidden">
        <GameCanvas 
          ref={canvasRef} 
          gameData={gameData}
          activeShipSkin={equipment.activeShipSkin}
        />

        {/* Touch controls */}
        <TouchControls 
          onInputChange={updateInput} 
          gameState={gameData.state}
          canvasRef={canvasRef}
        />

        {/* HUD overlay - only for regular game mode (Vector Maniac renders its own HUD on canvas) */}
        {gameData.state === 'playing' && (
          <GameUI 
            gameData={gameData} 
            activeRewards={externalActiveRewardsList || getActiveRewardsList()}
            pendingRewards={externalPendingRewards || getPendingRewardsList()}
            onActivatePendingReward={externalActivatePendingReward || activatePendingReward}
          />
        )}

        {/* Menu screens */}
        {gameData.state === 'menu' && !autoStart && (
          <MenuScreen 
            highScore={gameData.highScore} 
            onStart={handleStart}
            onStartVectorManiac={handleStartVectorManiac}
            startMusicRef={startMusicRef}
          />
        )}

        {gameData.state === 'paused' && (
          <PauseScreen 
            onResume={handleResume} 
            onQuit={handleQuit}
            musicMuted={musicMuted}
            sfxMuted={sfxMuted}
            onToggleMusic={() => setMusicMuted(prev => !prev)}
            onToggleSfx={() => {
              setSfxMuted(prev => {
                const newValue = !prev;
                setGlobalSfxMuted(newValue);
                return newValue;
              });
            }}
          />
        )}

        {gameData.state === 'gameover' && (
          <GameOverScreen
            score={gameData.score}
            highScore={gameData.highScore}
            rescuedCount={gameData.rescuedCount}
            isNewHighScore={isNewHighScore}
            onRestart={handleStart}
            onQuit={handleQuit}
            onContinue={handleContinueWithAd}
            canContinueWithAd={!hasUsedAdContinue}
          />
        )}

        {/* Vector Maniac upgrade pick */}
        {gameData.state === 'vectorManiac' && gameData.vectorManiacState?.phase === 'upgradePick' && (
          <UpgradePickModal
            picksRemaining={gameData.vectorManiacState.upgradesPending}
            totalPicks={1}
            currentUpgrades={{}}
            onSelectUpgrade={(upgradeId) => {
              setGameData(prev => ({
                ...prev,
                vectorManiacState: selectUpgrade(prev.vectorManiacState, upgradeId),
              }));
            }}
          />
        )}

        {/* Vector Maniac game over */}
        {gameData.state === 'vectorManiac' && gameData.vectorManiacState?.phase === 'gameOver' && (
          <VectorManiacEndScreen
            isVictory={false}
            score={gameData.vectorManiacState.score}
            salvageCount={gameData.vectorManiacState.salvageCount}
            wave={gameData.vectorManiacState.currentWave}
            highScore={gameData.highScore}
            onRestart={handleStartVectorManiac}
            onQuit={handleQuit}
            onContinue={handleVectorManiacContinue}
            canContinueWithAd={!hasUsedAdContinue}
          />
        )}

        {/* Vector Maniac victory */}
        {gameData.state === 'vectorManiac' && gameData.vectorManiacState?.phase === 'victory' && (
          <VectorManiacEndScreen
            isVictory={true}
            score={gameData.vectorManiacState.score}
            salvageCount={gameData.vectorManiacState.salvageCount}
            wave={9}
            highScore={gameData.highScore}
            onRestart={handleStartVectorManiac}
            onQuit={handleQuit}
          />
        )}

      </div>
    </div>
  );
};
