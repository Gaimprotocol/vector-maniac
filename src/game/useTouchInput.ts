import { useState, useCallback } from 'react';
import { InputState } from './types';
import { GAME_CONFIG } from './constants';

const initialInputState: InputState = {
  up: false,
  down: false,
  left: false,
  right: false,
  fire: false,
  bomb: false,
  rescue: false,
  toggleMode: false,
  pause: false,
  touchX: GAME_CONFIG.canvasWidth / 4,
  touchY: GAME_CONFIG.canvasHeight / 2,
  isTouching: false,
};

export function useTouchInput() {
  const [inputState, setInputState] = useState<InputState>(initialInputState);

  const updateInput = useCallback((partial: Partial<InputState>) => {
    setInputState(prev => ({ ...prev, ...partial }));
  }, []);

  return { inputState, updateInput };
}
