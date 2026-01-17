import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEquipment, SHIP_SKINS, SkinOption } from '@/hooks/useEquipment';
import { usePurchases } from '@/hooks/usePurchases';
import { useMusicContext } from '@/contexts/MusicContext';
import { useMegaShips, MEGA_SHIPS, MegaShip } from '@/hooks/useMegaShips';
import { useSoundtrack, SOUNDTRACKS, FREE_SOUNDTRACKS, PREMIUM_SOUNDTRACKS, Soundtrack } from '@/hooks/useSoundtrack';
import { useDifficulty, DifficultyLevel } from '@/hooks/useDifficulty';
import { drawMegaShip } from '@/game/megaShipRenderer';
import { ShopIcon } from './ShopIcons';
import { playPopSoundsWithDelays } from '@/utils/popSound';
import { crossfade, fadeIn } from '@/utils/audioTransitions';

import { ShipSkinColors } from '@/game/megaShipRenderer';

// Draw a mini preview using the actual mega ship renderer with skin colors
function drawMiniShip(ctx: CanvasRenderingContext2D, ship: MegaShip, time: number, skinColors?: ShipSkinColors) {
  ctx.save();
  // Scale down and center - the renderer expects center coordinates
  const scale = 0.9;
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.scale(scale, scale);
  
  // Use the actual mega ship renderer with skin colors
  drawMegaShip(ctx, 0, 0, ship.id, time / 1000, skinColors);
  
  ctx.restore();
}

const MegaShipCard: React.FC<{
  ship: MegaShip;
  isActive: boolean;
  isLocked: boolean;
  skinColors?: ShipSkinColors;
  onSelect: () => void;
}> = ({ ship, isActive, isLocked, skinColors, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const draw = () => {
      if (!running) return;
      const time = Date.now();
      
      ctx.fillStyle = isLocked ? '#1a1a25' : '#0a0a18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (isLocked) {
        ctx.globalAlpha = 0.3;
      }
      
      drawMiniShip(ctx, ship, time, skinColors);
      ctx.globalAlpha = 1;
      
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [ship, isLocked, skinColors]);

  return (
    <button
      onClick={isLocked ? undefined : onSelect}
      disabled={isLocked}
      className={`relative rounded-lg border-2 p-2 transition-all ${
        isLocked 
          ? 'border-gray-700/30 opacity-50 cursor-not-allowed'
          : isActive 
            ? 'border-green-400 bg-green-900/20' 
            : 'border-cyan-400/30 hover:border-cyan-400/60'
      }`}
    >
      <canvas ref={canvasRef} width={80} height={50} className="w-full rounded" />
      <p className={`font-pixel text-[7px] mt-1 truncate ${
        isLocked ? 'text-gray-600' : isActive ? 'text-green-400' : 'text-cyan-400'
      }`}>
        {ship.name}
      </p>
      <p className="font-pixel text-[5px] text-gray-500 truncate">{ship.ability.slice(0, 25)}</p>
      {isActive && <span className="absolute top-1 right-1 text-[8px] text-green-400">✓</span>}
      {isLocked && <span className="absolute top-1 right-1"><ShopIcon type="locked" size={12} /></span>}
    </button>
  );
};

export const EquipmentPanel: React.FC = () => {
  const navigate = useNavigate();
  const { equipment, setActiveShipSkin, setLaserColor, setMegaExplosion, setRoverSkin } = useEquipment();
  const { isOwned, hasShipsMegaPack, hasGoldenSkin, hasSoundtrackPack, hasMothershipSkins } = usePurchases();
  const { hasEnteredGalaxy, enterGalaxy, startMusicRef } = useMusicContext();
  const { state: megaShipState, setActiveMegaShip, getActiveMegaShip } = useMegaShips();
  const { state: soundtrackState, setActiveSoundtrack, getActiveSoundtrack } = useSoundtrack();
  const { difficulty, setDifficulty } = useDifficulty();
  
  const hasUltimate = hasGoldenSkin(); // Ultimate edition unlocks difficulty settings
  const hasSoundtrack = hasSoundtrackPack();
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  // If user navigates directly to equipment without entering galaxy, auto-enter
  useEffect(() => {
    if (!hasEnteredGalaxy) {
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  // Play pop sounds on mount for animations
  useEffect(() => {
    // Delays match the animationDelay values: 0, 50, 100, 150, 250, 350, 450ms
    playPopSoundsWithDelays([0, 50, 100, 150, 250, 350, 450]);
  }, []);

  // Cleanup preview audio on unmount - fade back to menu music
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }

      // Fade menu music back in if we had a preview playing (500ms to match other transitions)
      if (startMusicRef?.current && startMusicRef.current.paused) {
        fadeIn(startMusicRef.current, 0.128, 500);
      }
    };
  }, [startMusicRef]);

  // Handle soundtrack selection with preview - smooth crossfade
  const handleSoundtrackSelect = async (track: Soundtrack) => {
    // Set as active soundtrack
    setActiveSoundtrack(track.id);
    
    // Create new preview audio
    const previewAudio = new Audio(track.file);
    previewAudio.loop = true;
    previewAudio.volume = 0;
    previewAudio.preload = 'auto';
    
    // Determine what to crossfade from
    const currentAudio = previewAudioRef.current || startMusicRef?.current;
    
    // Set new preview ref before starting crossfade
    const oldPreview = previewAudioRef.current;
    previewAudioRef.current = previewAudio;
    setPreviewingTrackId(track.id);
    
    // Crossfade from current to new preview
    await crossfade(currentAudio, previewAudio, 0.128, 500, true);
    
    // If we crossfaded from an old preview (not menu music), clean it up
    if (oldPreview && oldPreview !== startMusicRef?.current) {
      oldPreview.pause();
    }
  };

  // Check which skins are available based on purchases
  const isSkinAvailable = (skin: SkinOption): boolean => {
    if (skin.packId === 'default') return true;
    if (skin.packId === 'skins' || skin.packId === 'mothership_skins') return hasMothershipSkins();
    // Ultimate edition unlocks: neon_ships, lunar_expansion, ultimate_edition
    if (skin.packId === 'neon_ships' || skin.packId === 'lunar_expansion' || skin.packId === 'ultimate' || skin.packId === 'ultimate_edition') {
      return hasGoldenSkin(); // hasGoldenSkin checks for ultimate edition
    }
    return false;
  };
  
  // Check if skin is a premium ultimate edition skin (for gold name styling)
  const isUltimateSkin = (skin: SkinOption): boolean => {
    return skin.packId === 'neon_ships' || skin.packId === 'lunar_expansion' || skin.packId === 'ultimate' || skin.packId === 'ultimate_edition';
  };
  
  // Filter visible skins (show all skins now)
  const visibleSkins = SHIP_SKINS;
  
  // Soundtrack section is always visible now
  const isSoundtrackHidden = false;


  const hasMegaPack = hasShipsMegaPack();

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center pt-14 pb-16 px-4 overflow-y-auto"
      style={{ 
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050810 70%, #020305 100%)'
      }}
    >
      {/* Scanlines overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 w-full max-w-md pt-2.5">
        <button
          onClick={() => navigate('/')}
          className="font-pixel text-[10px] text-cyan-400/70 hover:text-cyan-400 mb-4 flex items-center gap-2 opacity-0 animate-pop-in"
          style={{ animationDelay: '0ms' }}
        >
          ← BACK TO MENU
        </button>

        <h1 className="font-pixel text-2xl text-center mb-2 opacity-0 animate-pop-in" style={{ animationDelay: '50ms' }}>
          <span className="text-purple-400" style={{ textShadow: '0 0 20px #aa00ff, 0 0 40px #aa00ff50' }}>
            EQUIPMENT
          </span>
        </h1>

        <p className="font-pixel text-[8px] text-gray-500 text-center mb-6 tracking-wider opacity-0 animate-pop-in" style={{ animationDelay: '100ms' }}>
          CUSTOMIZE YOUR LOADOUT
        </p>
      </div>

      {/* Mega Ships Section */}
      <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '150ms' }}>
        <h2 className="font-pixel text-sm text-yellow-400 mb-2 flex items-center gap-2" style={{ textShadow: '0 0 10px #ffaa00' }}>
          <ShopIcon type="mega_ships_header" size={18} /> MEGA SHIPS
        </h2>
        <p className="font-pixel text-[7px] text-gray-500 mb-3">
          {hasMegaPack ? 'Select your ship with unique abilities' : 'Unlock in Shop: Ships Mega Pack'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {MEGA_SHIPS.map((ship) => {
            const isLocked = ship.id !== 'original' && !hasMegaPack;
            const isActive = megaShipState.activeMegaShipId === ship.id;
            
            // Get the active skin colors for preview
            const activeSkin = SHIP_SKINS.find(s => s.id === equipment.activeShipSkin);
            const skinColors = activeSkin?.colors;
            
            return (
              <MegaShipCard
                key={ship.id}
                ship={ship}
                isActive={isActive}
                isLocked={isLocked}
                skinColors={skinColors}
                onSelect={() => setActiveMegaShip(ship.id)}
              />
            );
          })}
        </div>
        
        {/* Show active ship ability */}
        {hasMegaPack && (
          <div className="mt-3 p-2 rounded-lg border border-yellow-400/30 bg-yellow-900/10">
            <p className="font-pixel text-[8px] text-yellow-400">
              {getActiveMegaShip().name}: {getActiveMegaShip().ability}
            </p>
          </div>
        )}
      </div>

      {/* Ship Skins Section */}
      <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '200ms' }}>
        <h2 className="font-pixel text-sm text-cyan-400 mb-3 flex items-center gap-2" style={{ textShadow: '0 0 10px #00ddff' }}>
          <ShopIcon type="skins_header" size={18} /> SHIP SKINS
        </h2>
        <p className="font-pixel text-[7px] text-gray-500 mb-3">
          {hasMothershipSkins() || hasGoldenSkin() ? 'Select your ship colors' : 'Unlock in Shop'}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {visibleSkins.map((skin) => {
            const isAvailable = isSkinAvailable(skin);
            const isActive = equipment.activeShipSkin === skin.id || 
                            (skin.id === 'default' && !equipment.activeShipSkin);
            
            return (
              <button
                key={skin.id}
                onClick={isAvailable ? () => setActiveShipSkin(skin.id === 'default' ? null : skin.id) : undefined}
                disabled={!isAvailable}
                className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                  !isAvailable
                    ? 'border-gray-700/30 opacity-50 cursor-not-allowed'
                    : isActive 
                      ? 'border-green-400 bg-green-900/20' 
                      : 'border-cyan-400/30 hover:border-cyan-400/60'
                }`}
                style={{
                  background: !isAvailable
                    ? 'linear-gradient(135deg, rgba(20, 20, 30, 0.5) 0%, rgba(15, 15, 25, 0.5) 100%)'
                    : isActive 
                      ? 'linear-gradient(135deg, rgba(0, 255, 100, 0.1) 0%, rgba(0, 100, 50, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(30, 30, 50, 0.5) 0%, rgba(20, 20, 40, 0.5) 100%)',
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Color preview */}
                  <div 
                    className={`w-6 h-6 rounded-full border-2 ${!isAvailable ? 'opacity-50' : ''}`}
                    style={{ 
                      backgroundColor: skin.colors.primary,
                      borderColor: skin.colors.glow,
                      boxShadow: isAvailable ? `0 0 10px ${skin.colors.glow}` : 'none',
                    }}
                  />
                  <div className="text-left">
                    <p 
                      className={`font-pixel text-[9px] ${
                        !isAvailable ? 'text-gray-600' : isActive ? 'text-green-400' : isUltimateSkin(skin) ? 'text-yellow-400' : 'text-cyan-300'
                      }`}
                      style={isUltimateSkin(skin) && isAvailable ? { textShadow: '0 0 8px #ffd700' } : undefined}
                    >
                      {skin.name}
                    </p>
                    {isActive && isAvailable && (
                      <p className="font-pixel text-[7px] text-green-400/70">EQUIPPED</p>
                    )}
                  </div>
                </div>
                {isActive && isAvailable && <span className="absolute top-1 right-1 text-[8px] text-green-400">✓</span>}
                {!isAvailable && <span className="absolute top-1 right-1"><ShopIcon type="locked" size={12} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Soundtracks Section */}
      {!isSoundtrackHidden && (
        <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '250ms' }}>
          <h2 className="font-pixel text-sm text-pink-400 mb-2 flex items-center gap-2" style={{ textShadow: '0 0 10px #ff00aa' }}>
            <ShopIcon type="soundtracks_header" size={18} /> SOUNDTRACKS
          </h2>
          
          {/* Free Soundtracks */}
          <p className="font-pixel text-[7px] text-green-400/70 mb-2">FREE SOUNDTRACKS</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FREE_SOUNDTRACKS.map((track) => {
              const isActive = soundtrackState.activeSoundtrackId === track.id;
              const isPreviewing = previewingTrackId === track.id;
              
              return (
                <button
                  key={track.id}
                  onClick={() => handleSoundtrackSelect(track)}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-green-400 bg-green-900/20' 
                      : 'border-pink-400/30 hover:border-pink-400/60'
                  }`}
                  style={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(0, 255, 100, 0.1) 0%, rgba(0, 100, 50, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(40, 20, 50, 0.5) 0%, rgba(30, 15, 40, 0.5) 100%)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isPreviewing ? (
                      <ShopIcon type="playing" size={18} />
                    ) : (
                      <ShopIcon type="soundtracks_header" size={18} />
                    )}
                    <div className="text-left">
                      <p className={`font-pixel text-[8px] ${isActive ? 'text-green-400' : 'text-pink-300'}`}>
                        {track.name}
                      </p>
                      {track.artist && (
                        <p className="font-pixel text-[6px] text-magenta/70">
                          feat. {track.artist}
                        </p>
                      )}
                    </div>
                  </div>
                  {isActive && <span className="absolute top-1 right-1 text-[8px] text-green-400">✓</span>}
                </button>
              );
            })}
          </div>
          
          {/* Premium Soundtracks */}
          <p className="font-pixel text-[7px] text-gray-500 mb-2">
            {hasSoundtrack ? 'PREMIUM SOUNDTRACKS' : 'UNLOCK IN SHOP: SOUNDTRACK PACK'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PREMIUM_SOUNDTRACKS.map((track) => {
              const isLocked = !hasSoundtrack;
              const isActive = soundtrackState.activeSoundtrackId === track.id;
              const isPreviewing = previewingTrackId === track.id;
              
              return (
                <button
                  key={track.id}
                  onClick={isLocked ? undefined : () => handleSoundtrackSelect(track)}
                  disabled={isLocked}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                    isLocked 
                      ? 'border-gray-700/30 opacity-50 cursor-not-allowed'
                      : isActive 
                        ? 'border-green-400 bg-green-900/20' 
                        : 'border-pink-400/30 hover:border-pink-400/60'
                  }`}
                  style={{
                    background: isLocked 
                      ? 'linear-gradient(135deg, rgba(20, 20, 30, 0.5) 0%, rgba(15, 15, 25, 0.5) 100%)'
                      : isActive 
                        ? 'linear-gradient(135deg, rgba(0, 255, 100, 0.1) 0%, rgba(0, 100, 50, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(40, 20, 50, 0.5) 0%, rgba(30, 15, 40, 0.5) 100%)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isPreviewing ? (
                      <ShopIcon type="playing" size={18} />
                    ) : (
                      <ShopIcon type="soundtracks_header" size={18} />
                    )}
                    <p className={`font-pixel text-[8px] ${
                      isLocked ? 'text-gray-600' : isActive ? 'text-green-400' : 'text-pink-300'
                    }`}>
                      {track.name}
                    </p>
                  </div>
                  {isActive && <span className="absolute top-1 right-1 text-[8px] text-green-400">✓</span>}
                  {isLocked && <span className="absolute top-1 right-1"><ShopIcon type="locked" size={12} /></span>}
                </button>
              );
            })}
          </div>
          
          {/* Show active soundtrack */}
          <div className="mt-3 p-2 rounded-lg border border-pink-400/30 bg-pink-900/10">
            <p className="font-pixel text-[8px] text-pink-400">
              Now Playing: {getActiveSoundtrack().name}
              {getActiveSoundtrack().artist && (
                <span className="text-magenta/70"> feat. {getActiveSoundtrack().artist}</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Difficulty Settings Section - Ultimate Edition only */}
      <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '280ms' }}>
        <h2 className="font-pixel text-sm text-orange-400 mb-2 flex items-center gap-2" style={{ textShadow: '0 0 10px #ff8800' }}>
          <ShopIcon type="ultimate_edition" size={18} /> DIFFICULTY
        </h2>
        <p className="font-pixel text-[7px] text-gray-500 mb-3">
          {hasUltimate ? 'Adjust challenge level' : 'Unlock with Ultimate Edition'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => {
            const isActive = difficulty === level;
            const isLocked = !hasUltimate;
            const labels: Record<DifficultyLevel, { name: string; desc: string; color: string }> = {
              easy: { name: 'EASY', desc: '30% easier', color: 'text-green-400' },
              medium: { name: 'MEDIUM', desc: 'Standard', color: 'text-yellow-400' },
              hard: { name: 'HARD', desc: '40% harder', color: 'text-red-400' },
            };
            const info = labels[level];
            
            return (
              <button
                key={level}
                onClick={() => !isLocked && setDifficulty(level)}
                disabled={isLocked}
                className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
                  isLocked 
                    ? 'border-gray-700/30 opacity-50 cursor-not-allowed'
                    : isActive 
                      ? 'border-orange-400 bg-orange-900/20' 
                      : 'border-orange-400/30 hover:border-orange-400/60'
                }`}
                style={{
                  background: isLocked
                    ? 'rgba(30, 30, 40, 0.3)'
                    : isActive 
                      ? 'linear-gradient(135deg, rgba(255, 136, 0, 0.15) 0%, rgba(200, 100, 0, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(50, 30, 20, 0.5) 0%, rgba(40, 25, 15, 0.5) 100%)',
                }}
              >
                <div className="text-center">
                  <p className={`font-pixel text-[10px] ${isLocked ? 'text-gray-500' : info.color}`}>
                    {info.name}
                  </p>
                </div>
                {isActive && !isLocked && <span className="absolute top-1 right-1 text-[8px] text-orange-400">✓</span>}
                {isLocked && <span className="absolute top-1 right-1"><ShopIcon type="locked" size={12} /></span>}
              </button>
            );
          })}
        </div>
        
        {hasUltimate && (
          <div className="mt-3 p-2 rounded-lg border border-orange-400/30 bg-orange-900/10">
            <p className="font-pixel text-[8px] text-orange-400">
              Active: {difficulty.toUpperCase()} - {
                difficulty === 'easy' ? 'Fewer enemies, less damage' :
                difficulty === 'hard' ? 'More enemies, more damage' :
                'Standard challenge'
              }
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <p className="relative z-10 font-pixel text-[7px] text-gray-600 text-center mt-4 max-w-xs opacity-0 animate-pop-in" style={{ animationDelay: '320ms' }}>
        Purchases are kept forever.
      </p>

      {/* Pop-in animation */}
      <style>{`
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
            filter: drop-shadow(0 0 30px rgba(0, 229, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 0, 255, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 0, 255, 0.3));
          }
          70% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 0px transparent);
          }
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};
