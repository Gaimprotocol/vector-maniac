import { useState, useEffect, useCallback } from 'react';
import { InputState } from './types';

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
  touchX: 200,
  touchY: 195,
  isTouching: false,
};

export function useInput() {
  const [inputState, setInputState] = useState<InputState>(initialInputState);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    
    setInputState(prev => {
      const newState = { ...prev };
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newState.up = true;
          break;
        case 's':
        case 'arrowdown':
          newState.down = true;
          break;
        case 'a':
        case 'arrowleft':
          newState.left = true;
          break;
        case 'd':
        case 'arrowright':
          newState.right = true;
          break;
        case ' ':
          newState.fire = true;
          break;
        case 'x':
          newState.bomb = true;
          break;
        case 'r':
          newState.rescue = true;
          break;
        case 'shift':
          newState.toggleMode = true;
          break;
        case 'escape':
        case 'p':
          newState.pause = true;
          break;
      }
      
      return newState;
    });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setInputState(prev => {
      const newState = { ...prev };
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newState.up = false;
          break;
        case 's':
        case 'arrowdown':
          newState.down = false;
          break;
        case 'a':
        case 'arrowleft':
          newState.left = false;
          break;
        case 'd':
        case 'arrowright':
          newState.right = false;
          break;
        case ' ':
          newState.fire = false;
          break;
        case 'x':
          newState.bomb = false;
          break;
        case 'r':
          newState.rescue = false;
          break;
        case 'shift':
          newState.toggleMode = false;
          break;
        case 'escape':
        case 'p':
          newState.pause = false;
          break;
      }
      
      return newState;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return inputState;
}
