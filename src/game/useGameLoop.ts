import { useRef, useEffect, useCallback } from 'react';
import { GameData, InputState } from './types';
import { updateGame } from './gameLogic';

export interface AdRewardCheckers {
  isDoubleBombsActive: () => boolean;
  isTripleShotsActive: () => boolean;
  isDoubleLaserActive: () => boolean;
  isShieldBoostActive: () => boolean;
  isDoublePointsActive: () => boolean;
  isSpeedBoostActive: () => boolean;
}

interface UseGameLoopProps {
  gameData: GameData;
  setGameData: React.Dispatch<React.SetStateAction<GameData>>;
  inputState: InputState;
  adRewardCheckers?: AdRewardCheckers;
}

export function useGameLoop({ gameData, setGameData, inputState, adRewardCheckers }: UseGameLoopProps) {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const inputRef = useRef<InputState>(inputState);
  const adCheckersRef = useRef<AdRewardCheckers | undefined>(adRewardCheckers);

  // Keep input ref updated
  useEffect(() => {
    inputRef.current = inputState;
  }, [inputState]);

  // Keep ad checkers ref updated
  useEffect(() => {
    adCheckersRef.current = adRewardCheckers;
  }, [adRewardCheckers]);

  const gameLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Fixed timestep at ~60fps
    if (deltaTime > 0) {
      setGameData(prevData => {
        // Update ad reward flags every frame
        let updatedData = prevData;
        if (adCheckersRef.current) {
          updatedData = {
            ...prevData,
            adDoubleBombsActive: adCheckersRef.current.isDoubleBombsActive(),
            adTripleShotsActive: adCheckersRef.current.isTripleShotsActive(),
            adDoubleLaserActive: adCheckersRef.current.isDoubleLaserActive(),
            adShieldActive: adCheckersRef.current.isShieldBoostActive(),
            adDoublePointsActive: adCheckersRef.current.isDoublePointsActive(),
            adSpeedActive: adCheckersRef.current.isSpeedBoostActive(),
          };
        }
        return updateGame(updatedData, inputRef.current, deltaTime);
      });
    }

    frameRef.current = requestAnimationFrame(gameLoop);
  }, [setGameData]);

  useEffect(() => {
    if (
      gameData.state === 'playing' ||
      gameData.state === 'bunker' ||
      gameData.state === 'rover' ||
      gameData.state === 'underwater' ||
      gameData.state === 'arena' ||
      gameData.state === 'survival' ||
      gameData.state === 'pilotRunner' ||
      gameData.state === 'paratrooper' ||
      gameData.state === 'forwardFlight'
    ) {
      frameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameData.state, gameLoop]);
}
