import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GAME_CONFIG } from '@/game/constants';
import { crossfade, fadeOut } from '@/utils/audioTransitions';
import { 
  createPilotRunnerState, 
  updatePilotRunnerState, 
  renderPilotRunner,
  PilotRunnerState 
} from '@/game/pilotRunner';
import {
  createParatrooperState,
  updateParatrooper,
  renderParatrooper,
  ParatrooperState,
  playParatrooperSound,
  ParatrooperSoundType
} from '@/game/paratrooper';
import {
  createForwardFlightState,
  updateForwardFlight,
  renderForwardFlight,
  ForwardFlightState,
  playDrillSound
} from '@/game/forwardFlight';
import {
  createBunkerState,
  updateBunkerState,
  renderBunkerScene,
  BunkerState
} from '@/game/bunkerDefense';
import {
  createRoverState,
  updateRoverState,
  renderRoverScene,
  MoonRoverState
} from '@/game/moonRover';
import {
  createUnderwaterState,
  updateUnderwaterState,
  renderUnderwaterScene,
  UnderwaterState
} from '@/game/underwater';
import {
  createArenaState,
  updateArenaState,
  renderArenaMode,
  ArenaState
} from '@/game/arenaMode';

type TestMode = 'menu' | 'pilotRunner' | 'paratrooper' | 'forwardFlight' | 'bunker' | 'rover' | 'underwater' | 'arena' | 'boss';

// Music tracks for each bonus mode
const BONUS_MUSIC: Record<string, string> = {
  pilotRunner: '/audio/Pilote_shooter.mp3',
  paratrooper: '/audio/Paratrooper.mp3',
  forwardFlight: '/audio/Underground_Drilling_Assault.mp3',
  bunker: '/audio/Bunker_map.mp3',
  rover: '/audio/Buggy.mp3',
  underwater: '/audio/Sub.mp3',
  arena: '/audio/Arena_level.mp3',
};

export default function BonusTest() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMode, setCurrentMode] = useState<TestMode>('menu');
  const [gameState, setGameState] = useState<PilotRunnerState | null>(null);
  const [paratrooperState, setParatrooperState] = useState<ParatrooperState | null>(null);
  const [forwardFlightState, setForwardFlightState] = useState<ForwardFlightState | null>(null);
  const [bunkerState, setBunkerState] = useState<BunkerState | null>(null);
  const [roverState, setRoverState] = useState<MoonRoverState | null>(null);
  const [underwaterState, setUnderwaterState] = useState<UnderwaterState | null>(null);
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const animationRef = useRef<number>(0);
  const inputRef = useRef({ left: false, right: false, up: false, down: false, fire: false, jump: false, special: false, touchX: 0, touchY: 0, isTouching: false });
  const tapRef = useRef({ tap: false, tapX: 0, tapY: 0 });
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Handle music for bonus modes with smooth crossfade
  useEffect(() => {
    const handleMusicTransition = async () => {
      const oldMusic = musicRef.current;
      
      // Start new music based on mode
      if (currentMode !== 'menu' && currentMode !== 'boss') {
        const musicSrc = BONUS_MUSIC[currentMode];
        if (musicSrc) {
          const newAudio = new Audio(musicSrc);
          newAudio.loop = true;
          newAudio.volume = 0;
          newAudio.preload = 'auto';
          musicRef.current = newAudio;
          
          // Crossfade from old to new
          await crossfade(oldMusic, newAudio, 0.128, 600, true);
        }
      } else {
        // Fade out when returning to menu
        if (oldMusic) {
          await fadeOut(oldMusic, 600, true);
          musicRef.current = null;
        }
      }
    };
    
    handleMusicTransition();

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, [currentMode]);

  const startMode = useCallback((mode: TestMode) => {
    setCurrentMode(mode);
    if (mode === 'pilotRunner') {
      setGameState(createPilotRunnerState());
    } else if (mode === 'paratrooper') {
      setParatrooperState(createParatrooperState(10));
    } else if (mode === 'forwardFlight') {
      setForwardFlightState(createForwardFlightState(15, GAME_CONFIG));
    } else if (mode === 'bunker') {
      setBunkerState(createBunkerState(3));
    } else if (mode === 'rover') {
      setRoverState(createRoverState(5));
    } else if (mode === 'underwater') {
      setUnderwaterState(createUnderwaterState(8));
    } else if (mode === 'arena') {
      setArenaState(createArenaState(7));
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (currentMode === 'menu' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (currentMode === 'pilotRunner' && gameState) {
        const newState = updatePilotRunnerState(gameState, inputRef.current);
        setGameState(newState);
        renderPilotRunner(ctx, newState);
        
        if (newState.phase === 'complete') {
          setTimeout(() => setCurrentMode('menu'), 2000);
        }
      } else if (currentMode === 'paratrooper' && paratrooperState) {
        const newState = updateParatrooper(paratrooperState, {
          ...tapRef.current,
          left: inputRef.current.left,
          right: inputRef.current.right
        });
        
        // Play sounds from the sound queue
        newState.soundQueue.forEach(sound => {
          playParatrooperSound(sound as ParatrooperSoundType);
        });
        
        setParatrooperState(newState);
        renderParatrooper(ctx, newState);
        
        tapRef.current.tap = false;
        
        if (newState.phase === 'complete') {
          setTimeout(() => setCurrentMode('menu'), 3000);
        }
      } else if (currentMode === 'forwardFlight' && forwardFlightState) {
        const newState = updateForwardFlight(forwardFlightState, {
          left: inputRef.current.left,
          right: inputRef.current.right,
          up: inputRef.current.up,
          down: inputRef.current.down,
          fire: inputRef.current.fire,
          special: inputRef.current.special,
          touchX: inputRef.current.touchX,
          touchY: inputRef.current.touchY,
          isTouching: inputRef.current.isTouching
        }, 16.67, GAME_CONFIG);
        
        // Play sounds based on triggers
        if (newState.sounds.drill) playDrillSound('drill');
        if (newState.sounds.shoot) playDrillSound('shoot');
        if (newState.sounds.explosion) playDrillSound('explosion');
        if (newState.sounds.crystalCollect) playDrillSound('crystal');
        if (newState.sounds.damage) playDrillSound('damage');
        if (newState.sounds.baseDestroyed) playDrillSound('baseDestroyed');
        
        setForwardFlightState(newState);
        renderForwardFlight(ctx, newState, GAME_CONFIG);
        
        if (newState.phase === 'complete' || newState.phase === 'failed') {
          setTimeout(() => setCurrentMode('menu'), 3000);
        }
      } else if (currentMode === 'bunker' && bunkerState) {
        const bunkerInput = {
          touchX: inputRef.current.touchX,
          touchY: inputRef.current.touchY,
          isTouching: inputRef.current.isTouching,
          fire: inputRef.current.fire || inputRef.current.isTouching,
        };
        const newState = updateBunkerState(bunkerState, bunkerInput);
        setBunkerState(newState);
        renderBunkerScene(ctx, newState);
        
        if (newState.phase === 'complete' || newState.bunkerDestroyed) {
          setTimeout(() => setCurrentMode('menu'), 3000);
        }
      } else if (currentMode === 'rover' && roverState) {
        const roverInput = {
          touchX: inputRef.current.touchX,
          touchY: inputRef.current.touchY,
          isTouching: inputRef.current.isTouching,
          fire: inputRef.current.fire || inputRef.current.isTouching,
        };
        const newState = updateRoverState(roverState, roverInput);
        setRoverState(newState);
        renderRoverScene(ctx, newState);
        
        if (newState.phase === 'complete' || newState.roverDestroyed) {
          setTimeout(() => setCurrentMode('menu'), 3000);
        }
      } else if (currentMode === 'underwater' && underwaterState) {
        const underwaterInput = {
          touchX: inputRef.current.touchX,
          touchY: inputRef.current.touchY,
          isTouching: inputRef.current.isTouching,
          fire: inputRef.current.fire || inputRef.current.isTouching,
        };
        const newState = updateUnderwaterState(underwaterState, underwaterInput);
        setUnderwaterState(newState);
        renderUnderwaterScene(ctx, newState);
        
        if (newState.phase === 'complete' || newState.subDestroyed) {
          setTimeout(() => setCurrentMode('menu'), 3000);
        }
      } else if (currentMode === 'arena' && arenaState) {
        const arenaInput = {
          touchX: inputRef.current.touchX,
          touchY: inputRef.current.touchY,
          isTouching: inputRef.current.isTouching,
          fire: inputRef.current.fire || inputRef.current.isTouching,
        };
        const newState = updateArenaState(arenaState, arenaInput);
        setArenaState(newState);
        renderArenaMode(ctx, newState);
        
        if (newState.phase === 'complete' || newState.health <= 0) {
          setTimeout(() => setCurrentMode('menu'), 3000);
        }
      }
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentMode, gameState, paratrooperState, forwardFlightState, bunkerState, roverState, underwaterState, arenaState]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') inputRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') inputRef.current.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') inputRef.current.down = true;
      if (e.key === ' ') inputRef.current.jump = true;
      if (e.key === 'z' || e.key === 'Control') inputRef.current.fire = true;
      if (e.key === 'x') inputRef.current.special = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') inputRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') inputRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') inputRef.current.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') inputRef.current.down = false;
      if (e.key === ' ') inputRef.current.jump = false;
      if (e.key === 'z' || e.key === 'Control') inputRef.current.fire = false;
      if (e.key === 'x') inputRef.current.special = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch input for aiming
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    
    if (rect) {
      const scaleX = GAME_CONFIG.canvasWidth / rect.width;
      const scaleY = GAME_CONFIG.canvasHeight / rect.height;
      inputRef.current.touchX = (touch.clientX - rect.left) * scaleX;
      inputRef.current.touchY = (touch.clientY - rect.top) * scaleY;
      inputRef.current.isTouching = true;
      
      // For paratrooper mode, register tap
      if (currentMode === 'paratrooper') {
        tapRef.current.tap = true;
        tapRef.current.tapX = (touch.clientX - rect.left) * scaleX;
        tapRef.current.tapY = (touch.clientY - rect.top) * scaleY;
      }
    }
  };

  // Mouse click for paratrooper (desktop)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (currentMode === 'paratrooper') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        tapRef.current.tap = true;
        tapRef.current.tapX = e.clientX - rect.left;
        tapRef.current.tapY = e.clientY - rect.top;
      }
    }
  };

  // Jump button handler
  const handleJumpPress = () => {
    inputRef.current.jump = true;
    setTimeout(() => {
      inputRef.current.jump = false;
    }, 100);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const scaleX = GAME_CONFIG.canvasWidth / rect.width;
      const scaleY = GAME_CONFIG.canvasHeight / rect.height;
      inputRef.current.touchX = (touch.clientX - rect.left) * scaleX;
      inputRef.current.touchY = (touch.clientY - rect.top) * scaleY;
    }
  };

  const handleTouchEnd = () => {
    inputRef.current.isTouching = false;
  };

  if (currentMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Bonus Map Test</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-4xl w-full">
          <Button 
            onClick={() => startMode('bunker')}
            className="h-16 text-sm bg-gray-700 hover:bg-gray-600"
          >
            <div className="text-center">
              <div className="text-lg">🏰 Bunker</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => startMode('rover')}
            className="h-16 text-sm bg-orange-700 hover:bg-orange-600"
          >
            <div className="text-center">
              <div className="text-lg">🚗 Moon Rover</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => startMode('underwater')}
            className="h-16 text-sm bg-cyan-700 hover:bg-cyan-600"
          >
            <div className="text-center">
              <div className="text-lg">🚢 Submarine</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => startMode('arena')}
            className="h-16 text-sm bg-red-700 hover:bg-red-600"
          >
            <div className="text-center">
              <div className="text-lg">⚔️ Arena</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => startMode('pilotRunner')}
            className="h-16 text-sm bg-green-600 hover:bg-green-700"
          >
            <div className="text-center">
              <div className="text-lg">🏃 Pilot Runner</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => startMode('paratrooper')}
            className="h-16 text-sm bg-blue-600 hover:bg-blue-700"
          >
            <div className="text-center">
              <div className="text-lg">🪂 Paratrooper</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => startMode('forwardFlight')}
            className="h-16 text-sm bg-amber-700 hover:bg-amber-800"
          >
            <div className="text-center">
              <div className="text-lg">⛏️ Deep Drill</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => startMode('boss')}
            disabled
            className="h-16 text-sm bg-purple-600 hover:bg-purple-700 opacity-50"
          >
            <div className="text-center">
              <div className="text-lg">👾 Boss Battle</div>
            </div>
          </Button>
        </div>
        
        <Button 
          onClick={() => navigate('/')}
          variant="outline"
          className="mt-4"
        >
          Back to Main Menu
        </Button>
        
        <div className="text-gray-400 text-xs mt-2">
          Controls: Arrow keys/WASD, Space to jump, Z/X to shoot
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.canvasWidth}
        height={GAME_CONFIG.canvasHeight}
        className="border border-gray-700 max-w-full cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCanvasClick}
      />
      
      {/* Jump button - styled to match game's retro arcade aesthetic */}
      {currentMode === 'pilotRunner' && (
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleJumpPress();
          }}
          onClick={handleJumpPress}
          className="fixed left-4 bottom-24 w-20 h-20 select-none touch-none z-50"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            border: '3px solid #00ffff',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(0, 255, 255, 0.2), 0 4px 0 #0a0a15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Inner glow ring */}
          <div 
            style={{
              position: 'absolute',
              inset: '4px',
              borderRadius: '50%',
              border: '2px solid rgba(0, 255, 255, 0.3)',
              background: 'radial-gradient(circle at 30% 30%, rgba(0, 255, 255, 0.15), transparent 60%)',
            }}
          />
          {/* Arrow icon */}
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none"
            style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.8))' }}
          >
            <path 
              d="M12 4L12 20M12 4L6 10M12 4L18 10" 
              stroke="#00ffff" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      
      <Button 
        onClick={() => setCurrentMode('menu')}
        variant="outline"
        className="mt-4"
      >
        Back to Test Menu
      </Button>
    </div>
  );
}
