import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases, getVisibleProducts, ShopProduct } from '@/hooks/usePurchases';
import { useScrapCurrency } from '@/hooks/useScrapCurrency';
import { useShipUpgrades, SHIP_UPGRADES } from '@/hooks/useShipUpgrades';
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
    scraps_small: 'scraps',
    scraps_medium: 'scraps',
    scraps_large: 'scraps',
    random_evolve: 'random',
  };
  return iconMap[productId] || productId;
};

type TabType = 'upgrades' | 'store';

export const ShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ type: 'success' | 'already_owned' | 'not_enough'; productName: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('upgrades');
  
  const { purchaseProduct, isOwned, isLoading, shouldShowAds } = usePurchases();
  const { scraps, addScraps, spendScraps, canAfford } = useScrapCurrency();
  const { getUpgradeLevel, getUpgradeCost, isUpgradeMaxed, purchaseUpgrade, allUpgrades } = useShipUpgrades();
  
  const { 
    isShowingAd, 
    adProgress, 
    pendingReward, 
    showRewardPopup, 
    showRewardedAd, 
    closeRewardPopup,
    isAdLoading,
    adError,
    isAdButtonDisabled,
    isNative,
  } = useRewardedAds();
  const { hasEnteredGalaxy, enterGalaxy, primeAudio } = useMusicContext();

  // If user navigates directly to shop without entering galaxy, redirect or auto-enter
  useEffect(() => {
    if (!hasEnteredGalaxy) {
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  // Play pop sounds on mount for product animations
  useEffect(() => {
    const items = activeTab === 'upgrades' ? allUpgrades : getVisibleProducts();
    const delays = items.map((_, i) => i * 80);
    playPopSoundsWithDelays(delays);
  }, [activeTab, allUpgrades]);

  const handleUpgradePurchase = (upgradeId: string) => {
    const cost = getUpgradeCost(upgradeId);
    const upgrade = SHIP_UPGRADES.find(u => u.id === upgradeId);
    
    if (!upgrade) return;
    
    if (isUpgradeMaxed(upgradeId)) {
      setPopup({ type: 'already_owned', productName: upgrade.name });
      return;
    }
    
    if (!canAfford(cost)) {
      setPopup({ type: 'not_enough', productName: upgrade.name });
      return;
    }
    
    if (spendScraps(cost)) {
      purchaseUpgrade(upgradeId);
      setPopup({ type: 'success', productName: upgrade.name });
    }
  };

  const handleStorePurchase = async (item: ShopProduct) => {
    if (item.type !== 'scraps' && isOwned(item.id)) {
      setPopup({ type: 'already_owned', productName: item.name });
      return;
    }
    
    setPurchasing(item.id);
    try {
      const success = await purchaseProduct(item.id);
      if (success) {
        // If it's a scrap pack, add the scraps
        if (item.type === 'scraps' && item.scrapAmount) {
          addScraps(item.scrapAmount);
        }
        // If it's random evolve, give random upgrade levels
        if (item.id === 'random_evolve') {
          const randomUpgrades = [...SHIP_UPGRADES].sort(() => Math.random() - 0.5).slice(0, 2);
          randomUpgrades.forEach(upgrade => {
            if (!isUpgradeMaxed(upgrade.id)) {
              purchaseUpgrade(upgrade.id);
            }
          });
        }
        setPopup({ type: 'success', productName: item.name });
      }
    } catch (error) {
      console.error('[IAP] Purchase failed:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const handleWatchAd = () => {
    primeAudio();
    showRewardedAd();
  };

  const adButtonDisabled = isShowingAd || isAdLoading || isAdButtonDisabled();

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center pt-10 pb-4 px-4 overflow-hidden"
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
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="font-pixel text-[10px] text-cyan-400/70 hover:text-cyan-400 mb-3 flex items-center gap-2"
        >
          ← BACK TO MENU
        </button>

        <h1 className="font-pixel text-xl text-center mb-1">
          <span className="text-yellow-400" style={{ textShadow: '0 0 20px #ffff00, 0 0 40px #ffff0050' }}>
            SHIP
          </span>{' '}
          <span className="text-cyan-400" style={{ textShadow: '0 0 20px #00e5ff' }}>
            WORKSHOP
          </span>
        </h1>

        {/* Scrap Balance */}
        <div className="flex justify-center items-center gap-2 mb-3">
          <span className="font-pixel text-[14px] text-yellow-400" style={{ textShadow: '0 0 10px #ffff00' }}>
            ⚙️ {scraps.toLocaleString()} SCRAPS
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 font-pixel text-[10px] py-2 rounded-lg border-2 transition-all ${
              activeTab === 'upgrades'
                ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                : 'border-gray-600 bg-transparent text-gray-500 hover:border-gray-500'
            }`}
          >
            🔧 UPGRADES
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 font-pixel text-[10px] py-2 rounded-lg border-2 transition-all ${
              activeTab === 'store'
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                : 'border-gray-600 bg-transparent text-gray-500 hover:border-gray-500'
            }`}
          >
            💰 STORE
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="relative z-10 w-full max-w-md flex-1 overflow-y-auto pb-4">
        {activeTab === 'upgrades' ? (
          /* Upgrades Grid */
          <div className="grid grid-cols-2 gap-2">
            {allUpgrades.map((upgrade, index) => {
              const level = getUpgradeLevel(upgrade.id);
              const cost = getUpgradeCost(upgrade.id);
              const maxed = isUpgradeMaxed(upgrade.id);
              const affordable = canAfford(cost);
              
              return (
                <div
                  key={upgrade.id}
                  className={`border-2 rounded-lg p-3 transition-all duration-300 animate-pop-in ${
                    maxed 
                      ? 'border-green-500/50 bg-green-900/10' 
                      : affordable
                        ? 'border-cyan-400/40 hover:border-cyan-400/70'
                        : 'border-gray-600/40'
                  }`}
                  style={{
                    background: maxed 
                      ? 'linear-gradient(135deg, rgba(0, 255, 100, 0.08) 0%, rgba(0, 100, 50, 0.08) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{upgrade.icon}</span>
                    <span className="font-pixel text-[8px] text-gray-400">
                      LVL {level}/{upgrade.maxLevel}
                    </span>
                  </div>
                  
                  <h3 className={`font-pixel text-[9px] mb-1 ${maxed ? 'text-green-400' : 'text-cyan-400'}`}>
                    {upgrade.name}
                  </h3>
                  <p className="font-pixel text-[7px] text-gray-500 mb-2 leading-tight">
                    {upgrade.description}
                  </p>
                  
                  {/* Level progress bar */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full mb-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all ${maxed ? 'bg-green-500' : 'bg-cyan-500'}`}
                      style={{ width: `${(level / upgrade.maxLevel) * 100}%` }}
                    />
                  </div>
                  
                  <button
                    onClick={() => handleUpgradePurchase(upgrade.id)}
                    disabled={maxed || isLoading}
                    className={`w-full font-pixel text-[8px] py-1.5 rounded transition-all ${
                      maxed 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : affordable
                          ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                          : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {maxed ? '✓ MAXED' : `⚙️ ${cost}`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Store Products */
          <div className="space-y-2">
            {getVisibleProducts().map((item, index) => {
              const owned = item.type !== 'scraps' && isOwned(item.id);
              const isScrapPack = item.type === 'scraps';
              
              return (
                <div
                  key={item.id}
                  className={`border-2 rounded-lg p-3 transition-all duration-300 animate-pop-in ${
                    owned 
                      ? 'border-green-500/50 bg-green-900/10' 
                      : isScrapPack
                        ? 'border-yellow-400/40 hover:border-yellow-400/70'
                        : 'border-cyan-400/30 hover:border-cyan-400/60'
                  }`}
                  style={{
                    background: owned 
                      ? 'linear-gradient(135deg, rgba(0, 255, 100, 0.08) 0%, rgba(0, 100, 50, 0.08) 100%)'
                      : isScrapPack
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 150, 0, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h3 className={`font-pixel text-[10px] ${
                          owned ? 'text-green-400' : isScrapPack ? 'text-yellow-400' : 'text-cyan-400'
                        }`}>
                          {item.name}
                        </h3>
                        <p className="font-pixel text-[7px] text-gray-500">{item.description}</p>
                        {isScrapPack && item.scrapAmount && (
                          <p className="font-pixel text-[7px] text-yellow-400/70 mt-0.5">
                            +{item.scrapAmount.toLocaleString()} ⚙️
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStorePurchase(item)}
                      disabled={purchasing !== null || isLoading}
                      className={`font-pixel text-[9px] px-3 py-2 rounded-full transition-all duration-300 
                               border-2 disabled:cursor-not-allowed ${
                        owned 
                          ? 'text-green-400 bg-green-500/20 border-green-500/50' 
                          : 'text-black bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-400 hover:from-yellow-300 hover:to-yellow-400 hover:scale-105 disabled:opacity-50'
                      }`}
                    >
                      {owned ? '✓ OWNED' : purchasing === item.id ? '...' : item.price}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Watch Ad for Reward Button */}
            {shouldShowAds() && (
              <div className="flex flex-col items-center mt-4">
                <button
                  onClick={handleWatchAd}
                  disabled={adButtonDisabled}
                  className={`font-pixel text-[10px] border-2 rounded-full px-5 py-2.5 transition-all duration-300 
                             animate-pop-in disabled:opacity-50 disabled:cursor-not-allowed
                             ${isAdLoading 
                               ? 'text-yellow-400 border-yellow-400/50 hover:border-yellow-400 hover:bg-yellow-400/10' 
                               : 'text-green-400 border-green-400/50 hover:border-green-400 hover:bg-green-400/10'
                             }`}
                  style={{ 
                    boxShadow: isAdLoading 
                      ? '0 0 20px rgba(255, 200, 0, 0.2)'
                      : '0 0 20px rgba(0, 255, 100, 0.2)',
                  }}
                >
                  {isAdLoading 
                    ? '⏳ LOADING AD...' 
                    : '🎬 WATCH AD → FREE SCRAPS'
                  }
                </button>
                
                {adError && (
                  <p className="font-pixel text-[7px] text-yellow-400/80 mt-2 text-center animate-pulse">
                    {adError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Purchase Popup */}
      {popup && (
        <PurchasePopup
          type={popup.type === 'not_enough' ? 'already_owned' : popup.type}
          productName={popup.type === 'not_enough' ? 'Not enough scraps!' : popup.productName}
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
