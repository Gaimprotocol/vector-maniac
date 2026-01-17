import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases, getVisibleProducts, ShopProduct } from '@/hooks/usePurchases';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { PurchasePopup } from './PurchasePopup';
import { RewardedAdOverlay } from './RewardedAdOverlay';
import { AdRewardPopup } from './AdRewardPopup';
import { useMusicContext } from '@/contexts/MusicContext';
import { ShopIcon } from './ShopIcons';
import { playPopSoundsWithDelays } from '@/utils/popSound';

// Map product IDs to icon types
const getIconType = (productId: string): string => {
  const iconMap: Record<string, string> = {
    skins: 'mothership_skins',
    ships: 'ships_mega_pack',
    sound: 'soundtrack_pack',
    survival: 'survival_mode',
    ultimate: 'ultimate_edition',
  };
  return iconMap[productId] || productId;
};

export const ShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ type: 'success' | 'already_owned'; productName: string } | null>(null);
  const { purchaseProduct, restorePurchases, isOwned, isLoading, shouldShowAds } = usePurchases();
  const { 
    isShowingAd, 
    adProgress, 
    pendingReward, 
    showRewardPopup, 
    showRewardedAd, 
    closeRewardPopup,
    isAdReady,
    isAdLoading,
    adError,
    isAdButtonDisabled,
    isNative,
  } = useRewardedAds();
  const { hasEnteredGalaxy, enterGalaxy, primeAudio } = useMusicContext();

  // If user navigates directly to shop without entering galaxy, redirect or auto-enter
  useEffect(() => {
    if (!hasEnteredGalaxy) {
      // Auto-enter galaxy (music will start) when accessing shop
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  // Play pop sounds on mount for product animations
  useEffect(() => {
    const products = getVisibleProducts();
    // Generate delays based on product count: 0, 100, 200, 300...
    const delays = products.map((_, i) => i * 100);
    playPopSoundsWithDelays(delays);
  }, []);

  const handlePurchase = async (item: ShopProduct) => {
    if (isOwned(item.id)) {
      setPopup({ type: 'already_owned', productName: item.name });
      return;
    }
    
    setPurchasing(item.id);
    try {
      const success = await purchaseProduct(item.id);
      if (success) {
        setPopup({ type: 'success', productName: item.name });
      }
    } catch (error) {
      console.error('[IAP] Purchase failed:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setPurchasing('restore');
    try {
      await restorePurchases();
    } catch (error) {
      console.error('[IAP] Restore failed:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const handleWatchAd = () => {
    primeAudio();
    showRewardedAd();
  };

  // Compute if button should be disabled
  const adButtonDisabled = isShowingAd || isAdLoading || isAdButtonDisabled();

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center pt-14 pb-16 px-4 overflow-y-auto"
      style={{ 
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050810 70%, #020305 100%)'
      }}
    >
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: i % 3 === 0 ? '#00e5ff' : i % 3 === 1 ? '#ff00ff' : '#ffff00',
              opacity: Math.random() * 0.5 + 0.2,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

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
          className="font-pixel text-[10px] text-cyan-400/70 hover:text-cyan-400 mb-4 flex items-center gap-2"
        >
          ← BACK TO MENU
        </button>

        <h1 className="font-pixel text-2xl text-center mb-2">
          <span className="text-yellow-400" style={{ textShadow: '0 0 20px #ffff00, 0 0 40px #ffff0050' }}>
            GALACTIC
          </span>{' '}
          <span className="text-cyan-400" style={{ textShadow: '0 0 20px #00e5ff' }}>
            SHOP
          </span>
        </h1>

        <p className="font-pixel text-[8px] text-gray-500 text-center mb-6 tracking-wider">
          POWER UP YOUR ADVENTURE
        </p>
      </div>

      {/* Shop Items */}
      <div className="relative z-10 w-full max-w-md space-y-3">
        {getVisibleProducts().map((item, index) => {
          const owned = isOwned(item.id);
          const isUltimate = item.id === 'ultimate';
          
          return (
            <div
              key={item.id}
              className={`border-2 rounded-lg p-4 transition-all duration-300 animate-pop-in ${
                owned 
                  ? 'border-green-500/50 bg-green-900/10' 
                  : isUltimate
                    ? 'border-yellow-400/50 hover:border-yellow-400'
                    : 'border-cyan-400/30 hover:border-cyan-400/60'
              }`}
              style={{
                background: owned 
                  ? 'linear-gradient(135deg, rgba(0, 255, 100, 0.08) 0%, rgba(0, 100, 50, 0.08) 100%)'
                  : isUltimate
                    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 100, 0, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
                boxShadow: owned 
                  ? '0 0 20px rgba(0, 255, 100, 0.15), inset 0 0 10px rgba(0, 255, 100, 0.05)' 
                  : isUltimate
                    ? '0 0 30px rgba(255, 215, 0, 0.2), inset 0 0 15px rgba(255, 215, 0, 0.05)'
                    : '0 0 20px rgba(0, 229, 255, 0.1), inset 0 0 10px rgba(0, 229, 255, 0.02)',
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShopIcon type={getIconType(item.id)} size={36} owned={owned} />
                  <div>
                    <h3 className={`font-pixel text-[11px] ${
                      owned ? 'text-green-400' : isUltimate ? 'text-yellow-400' : 'text-cyan-400'
                    }`}>
                      {item.name}
                    </h3>
                    <p className="font-pixel text-[8px] text-gray-500">{item.description}</p>
                    {isUltimate && !owned && (
                      <p className="font-pixel text-[6px] text-yellow-400/70 mt-0.5">
                        INCLUDES ALL CURRENT + FUTURE CONTENT FOREVER
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={purchasing !== null || isLoading}
                  className={`font-pixel text-[10px] px-4 py-2 rounded-full transition-all duration-300 
                           border-2 disabled:cursor-not-allowed ${
                    owned 
                      ? 'text-green-400 bg-green-500/20 border-green-500/50' 
                      : 'text-black bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-400 hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 disabled:opacity-50'
                  }`}
                  style={{
                    boxShadow: owned 
                      ? '0 0 15px rgba(0, 255, 100, 0.3)' 
                      : '0 0 15px rgba(255, 255, 0, 0.3)',
                  }}
                >
                  {owned ? '✓ OWNED' : purchasing === item.id ? '...' : item.price}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Watch Ad for Reward Button - only show if ads not removed */}
      {shouldShowAds() && (
        <div className="relative z-10 flex flex-col items-center mt-6">
          <button
            onClick={handleWatchAd}
            disabled={adButtonDisabled}
            className={`font-pixel text-[11px] border-2 rounded-full px-6 py-3 transition-all duration-300 
                       animate-pop-in disabled:opacity-50 disabled:cursor-not-allowed
                       ${isAdLoading 
                         ? 'text-yellow-400 border-yellow-400/50 hover:border-yellow-400 hover:bg-yellow-400/10' 
                         : 'text-green-400 border-green-400/50 hover:border-green-400 hover:bg-green-400/10'
                       }`}
            style={{ 
              boxShadow: isAdLoading 
                ? '0 0 20px rgba(255, 200, 0, 0.2)'
                : '0 0 20px rgba(0, 255, 100, 0.2)',
              animationDelay: `${getVisibleProducts().length * 100 + 100}ms`,
              animationFillMode: 'backwards',
            }}
          >
            {isAdLoading 
              ? '⏳ LOADING AD...' 
              : '🎬 WATCH AD → FREE REWARD'
            }
          </button>
          
          {/* Error message */}
          {adError && (
            <p className="font-pixel text-[8px] text-yellow-400/80 mt-2 text-center animate-pulse">
              {adError}
            </p>
          )}
        </div>
      )}

      {/* Restore Purchases */}
      <button
        onClick={handleRestore}
        disabled={purchasing !== null || isLoading}
        className="relative z-10 font-pixel text-[9px] text-gray-500 hover:text-cyan-400 mt-4 
                   underline underline-offset-4 transition-colors disabled:opacity-50 animate-pop-in"
        style={{ 
          animationDelay: `${getVisibleProducts().length * 100 + 200}ms`,
          animationFillMode: 'backwards',
        }}
      >
        {purchasing === 'restore' ? 'RESTORING...' : 'RESTORE PURCHASES'}
      </button>

      {/* Note */}
      <p 
        className="relative z-10 font-pixel text-[7px] text-gray-600 text-center mt-4 max-w-xs animate-pop-in"
        style={{ 
          animationDelay: `${getVisibleProducts().length * 100 + 300}ms`,
          animationFillMode: 'backwards',
        }}
      >
        Purchases are stored locally on this device
      </p>

      {/* Purchase Popup */}
      {popup && (
        <PurchasePopup
          type={popup.type}
          productName={popup.productName}
          onClose={() => setPopup(null)}
        />
      )}

      {/* Rewarded Ad Overlay - only show on web, native SDK handles its own UI */}
      {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}

      {/* Ad Reward Popup */}
      {showRewardPopup && pendingReward && (
        <AdRewardPopup reward={pendingReward} onClose={closeRewardPopup} />
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes pop-in {
          0% { 
            opacity: 0; 
            transform: scale(0.3);
            filter: drop-shadow(0 0 30px rgba(0, 229, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 0, 255, 0.5));
          }
          50% { 
            transform: scale(1.1);
            filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 0, 255, 0.3));
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
