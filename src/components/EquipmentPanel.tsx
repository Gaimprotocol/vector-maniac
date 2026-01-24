import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEquipment, SHIP_SKINS, SkinOption } from '@/hooks/useEquipment';
import { usePurchases } from '@/hooks/usePurchases';
import { useMusicContext } from '@/contexts/MusicContext';
import { useMegaShips, MEGA_SHIPS, MegaShip } from '@/hooks/useMegaShips';
import { useSoundtrack, FREE_SOUNDTRACKS, PREMIUM_SOUNDTRACKS, Soundtrack } from '@/hooks/useSoundtrack';
import { useDifficulty, DifficultyLevel } from '@/hooks/useDifficulty';
import { drawMegaShip, ShipSkinColors } from '@/game/megaShipRenderer';
import { playPopSoundsWithDelays } from '@/utils/popSound';
import { crossfade, fadeIn } from '@/utils/audioTransitions';
import { 
  ArrowBackIcon, ShipIcon, SkinIcon, MusicIcon, SettingsIcon, 
  CheckIcon, LockIcon, PlayingIcon 
} from './VectorIcons';

// Draw a mini preview using the actual mega ship renderer with skin colors
function drawMiniShip(ctx: CanvasRenderingContext2D, ship: MegaShip, time: number, skinColors?: ShipSkinColors) {
  ctx.save();
  const scale = 0.9;
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.scale(scale, scale);
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
      
      ctx.fillStyle = isLocked ? '#0a1510' : '#051510';
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
      className={`relative rounded border p-2 transition-all ${
        isLocked 
          ? 'border-[#00ff88]/10 opacity-50 cursor-not-allowed'
          : isActive 
            ? 'border-[#00ff88] bg-[#00ff88]/10' 
            : 'border-[#00ff88]/30 hover:border-[#00ff88]/60'
      }`}
    >
      <canvas ref={canvasRef} width={80} height={50} className="w-full rounded" />
      <p 
        className={`text-[7px] mt-1 truncate ${
          isLocked ? 'text-[#00ff88]/30' : isActive ? 'text-[#00ff88]' : 'text-[#00ff88]/70'
        }`}
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        {ship.name}
      </p>
      <p 
        className="text-[5px] text-[#00ff88]/40 truncate"
        style={{ fontFamily: 'Rajdhani, sans-serif' }}
      >
        {ship.ability.slice(0, 25)}
      </p>
      {isActive && <span className="absolute top-1 right-1"><CheckIcon size={10} /></span>}
      {isLocked && <span className="absolute top-1 right-1"><LockIcon size={12} /></span>}
    </button>
  );
};

export const EquipmentPanel: React.FC = () => {
  const navigate = useNavigate();
  const { equipment, setActiveShipSkin } = useEquipment();
  const { hasShipsMegaPack, hasGoldenSkin, hasSoundtrackPack, hasMothershipSkins } = usePurchases();
  const { hasEnteredGalaxy, enterGalaxy, startMusicRef } = useMusicContext();
  const { state: megaShipState, setActiveMegaShip, getActiveMegaShip } = useMegaShips();
  const { state: soundtrackState, setActiveSoundtrack } = useSoundtrack();
  const { difficulty, setDifficulty } = useDifficulty();
  
  const hasUltimate = hasGoldenSkin();
  const hasSoundtrack = hasSoundtrackPack();
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasEnteredGalaxy) {
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  useEffect(() => {
    playPopSoundsWithDelays([0, 50, 100, 150, 250, 350, 450]);
  }, []);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (startMusicRef?.current && startMusicRef.current.paused) {
        fadeIn(startMusicRef.current, 0.128, 500);
      }
    };
  }, [startMusicRef]);

  const handleSoundtrackSelect = async (track: Soundtrack) => {
    setActiveSoundtrack(track.id);
    
    const previewAudio = new Audio(track.file);
    previewAudio.loop = true;
    previewAudio.volume = 0;
    previewAudio.preload = 'auto';
    
    const currentAudio = previewAudioRef.current || startMusicRef?.current;
    const oldPreview = previewAudioRef.current;
    previewAudioRef.current = previewAudio;
    setPreviewingTrackId(track.id);
    
    await crossfade(currentAudio, previewAudio, 0.128, 500, true);
    
    if (oldPreview && oldPreview !== startMusicRef?.current) {
      oldPreview.pause();
    }
  };

  const isSkinAvailable = (skin: SkinOption): boolean => {
    if (skin.packId === 'default') return true;
    if (skin.packId === 'skins' || skin.packId === 'mothership_skins') return hasMothershipSkins();
    if (skin.packId === 'neon_ships' || skin.packId === 'lunar_expansion' || skin.packId === 'ultimate' || skin.packId === 'ultimate_edition') {
      return hasGoldenSkin();
    }
    return false;
  };
  
  const isUltimateSkin = (skin: SkinOption): boolean => {
    return skin.packId === 'neon_ships' || skin.packId === 'lunar_expansion' || skin.packId === 'ultimate' || skin.packId === 'ultimate_edition';
  };
  
  const visibleSkins = SHIP_SKINS;
  const hasMegaPack = hasShipsMegaPack();

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center pt-14 pb-16 px-4 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at center, #051510 0%, #020a08 70%, #010504 100%)' }}
    >
      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 w-full max-w-md pt-2.5">
        <button
          onClick={() => navigate('/')}
          className="text-[11px] tracking-wider text-[#00ff88]/60 hover:text-[#00ff88] mb-4 flex items-center gap-2 transition-colors opacity-0 animate-pop-in"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '0ms' }}
        >
          <ArrowBackIcon size={14} glow={false} /> BACK TO MENU
        </button>

        <h1 
          className="text-2xl text-center mb-2 opacity-0 animate-pop-in tracking-widest"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '50ms' }}
        >
          <span className="text-[#00ff88]" style={{ textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8850' }}>
            EQUIPMENT
          </span>
        </h1>

        <p 
          className="text-[8px] text-[#00ff88]/40 text-center mb-6 tracking-[0.3em] opacity-0 animate-pop-in"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '100ms' }}
        >
          CUSTOMIZE YOUR LOADOUT
        </p>
      </div>

      {/* Mega Ships Section */}
      <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '150ms' }}>
        <h2 
          className="text-sm text-[#00ff88] mb-2 flex items-center gap-2"
          style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #00ff88' }}
        >
          <ShipIcon size={18} /> MEGA SHIPS
        </h2>
        <p 
          className="text-[7px] text-[#00ff88]/40 mb-3"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          {hasMegaPack ? 'Select your ship with unique abilities' : 'Unlock in Shop: Ships Mega Pack'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {MEGA_SHIPS.map((ship) => {
            const isLocked = ship.id !== 'original' && !hasMegaPack;
            const isActive = megaShipState.activeMegaShipId === ship.id;
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
        
        {hasMegaPack && (
          <div className="mt-3 p-2 rounded border border-[#00ff88]/30 bg-[#00ff88]/5">
            <p 
              className="text-[8px] text-[#00ff88]"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {getActiveMegaShip().name}: {getActiveMegaShip().ability}
            </p>
          </div>
        )}
      </div>

      {/* Ship Skins Section */}
      <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '200ms' }}>
        <h2 
          className="text-sm text-[#00ff88] mb-3 flex items-center gap-2"
          style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #00ff88' }}
        >
          <SkinIcon size={18} /> SHIP SKINS
        </h2>
        <p 
          className="text-[7px] text-[#00ff88]/40 mb-3"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
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
                className={`relative p-3 rounded border transition-all duration-300 ${
                  !isAvailable
                    ? 'border-[#00ff88]/10 opacity-50 cursor-not-allowed'
                    : isActive 
                      ? 'border-[#00ff88] bg-[#00ff88]/10' 
                      : 'border-[#00ff88]/30 hover:border-[#00ff88]/60'
                }`}
                style={{
                  background: !isAvailable
                    ? 'linear-gradient(135deg, rgba(0, 50, 30, 0.2) 0%, rgba(0, 30, 20, 0.2) 100%)'
                    : isActive 
                      ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 100, 50, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 50, 30, 0.3) 0%, rgba(0, 30, 20, 0.3) 100%)',
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-6 h-6 rounded-full border ${!isAvailable ? 'opacity-50' : ''}`}
                    style={{ 
                      backgroundColor: skin.colors.primary,
                      borderColor: skin.colors.glow,
                      boxShadow: isAvailable ? `0 0 10px ${skin.colors.glow}` : 'none',
                    }}
                  />
                  <div className="text-left">
                    <p 
                      className={`text-[9px] ${
                        !isAvailable ? 'text-[#00ff88]/30' : isActive ? 'text-[#00ff88]' : isUltimateSkin(skin) ? 'text-[#aaffaa]' : 'text-[#00ff88]/80'
                      }`}
                      style={{ 
                        fontFamily: 'Orbitron, monospace',
                        textShadow: isUltimateSkin(skin) && isAvailable ? '0 0 8px #00ff88' : undefined 
                      }}
                    >
                      {skin.name}
                    </p>
                    {isActive && isAvailable && (
                      <p 
                        className="text-[7px] text-[#00ff88]/60"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        EQUIPPED
                      </p>
                    )}
                  </div>
                </div>
                {isActive && isAvailable && <span className="absolute top-1 right-1"><CheckIcon size={10} /></span>}
                {!isAvailable && <span className="absolute top-1 right-1"><LockIcon size={12} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Soundtracks Section */}
      <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '250ms' }}>
        <h2 
          className="text-sm text-[#00ff88] mb-2 flex items-center gap-2"
          style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #00ff88' }}
        >
          <MusicIcon size={18} /> SOUNDTRACKS
        </h2>
        
        {/* Free Soundtracks */}
        <p 
          className="text-[7px] text-[#00ff88]/60 mb-2"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          FREE SOUNDTRACKS
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {FREE_SOUNDTRACKS.map((track) => {
            const isActive = soundtrackState.activeSoundtrackId === track.id;
            const isPreviewing = previewingTrackId === track.id;
            
            return (
              <button
                key={track.id}
                onClick={() => handleSoundtrackSelect(track)}
                className={`relative p-3 rounded border transition-all duration-300 ${
                  isActive 
                    ? 'border-[#00ff88] bg-[#00ff88]/10' 
                    : 'border-[#00ff88]/30 hover:border-[#00ff88]/60'
                }`}
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 100, 50, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(0, 50, 30, 0.3) 0%, rgba(0, 30, 20, 0.3) 100%)',
                }}
              >
                <div className="flex items-center gap-2">
                  {isPreviewing ? <PlayingIcon size={18} /> : <MusicIcon size={18} />}
                  <div className="text-left">
                    <p 
                      className={`text-[8px] ${isActive ? 'text-[#00ff88]' : 'text-[#00ff88]/80'}`}
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {track.name}
                    </p>
                    {track.artist && (
                      <p 
                        className="text-[6px] text-[#00ff88]/40"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        feat. {track.artist}
                      </p>
                    )}
                  </div>
                </div>
                {isActive && <span className="absolute top-1 right-1"><CheckIcon size={10} /></span>}
              </button>
            );
          })}
        </div>
        
        {/* Premium Soundtracks */}
        <p 
          className="text-[7px] text-[#00ff88]/40 mb-2"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
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
                className={`relative p-3 rounded border transition-all duration-300 ${
                  isLocked 
                    ? 'border-[#00ff88]/10 opacity-50 cursor-not-allowed'
                    : isActive 
                      ? 'border-[#00ff88] bg-[#00ff88]/10' 
                      : 'border-[#00ff88]/30 hover:border-[#00ff88]/60'
                }`}
                style={{
                  background: isLocked 
                    ? 'linear-gradient(135deg, rgba(0, 50, 30, 0.2) 0%, rgba(0, 30, 20, 0.2) 100%)'
                    : isActive 
                      ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 100, 50, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 50, 30, 0.3) 0%, rgba(0, 30, 20, 0.3) 100%)',
                }}
              >
                <div className="flex items-center gap-2">
                  {isPreviewing && !isLocked ? <PlayingIcon size={18} /> : <MusicIcon size={18} />}
                  <div className="text-left">
                    <p 
                      className={`text-[8px] ${isLocked ? 'text-[#00ff88]/30' : isActive ? 'text-[#00ff88]' : 'text-[#00ff88]/80'}`}
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {track.name}
                    </p>
                    {track.artist && (
                      <p 
                        className="text-[6px] text-[#00ff88]/40"
                        style={{ fontFamily: 'Rajdhani, sans-serif' }}
                      >
                        feat. {track.artist}
                      </p>
                    )}
                  </div>
                </div>
                {isActive && !isLocked && <span className="absolute top-1 right-1"><CheckIcon size={10} /></span>}
                {isLocked && <span className="absolute top-1 right-1"><LockIcon size={12} /></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Settings (Ultimate Edition only) */}
      {hasUltimate && (
        <div className="relative z-10 w-full max-w-md mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '300ms' }}>
          <h2 
            className="text-sm text-[#00ff88] mb-2 flex items-center gap-2"
            style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #00ff88' }}
          >
            <SettingsIcon size={18} /> DIFFICULTY
          </h2>
          <p 
            className="text-[7px] text-[#00ff88]/40 mb-3"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Ultimate Edition exclusive setting
          </p>
          <div className="flex gap-2">
            {(['easy', 'normal', 'hard'] as DifficultyLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-2 rounded border transition-all ${
                  difficulty === level
                    ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                    : 'border-[#00ff88]/30 text-[#00ff88]/50 hover:border-[#00ff88]/60'
                }`}
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                <span className="text-[9px] uppercase">{level}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
            filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.6));
          }
          70% {
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 0px transparent);
          }
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};
