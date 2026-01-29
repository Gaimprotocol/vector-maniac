import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases, getVisibleProducts, ShopProduct } from '@/hooks/usePurchases';
import { useScrapCurrency } from '@/hooks/useScrapCurrency';
import { useShipUpgrades, SHIP_UPGRADES } from '@/hooks/useShipUpgrades';
import { PurchasePopup } from './PurchasePopup';
import { LegendaryUnlockAnimation } from './LegendaryUnlockAnimation';
import { InsufficientScrapsPopup } from './InsufficientScrapsPopup';
import { useMusicContext } from '@/contexts/MusicContext';
import { ShipPreview } from './ShipPreview';
import { UpgradeStatPreview } from './UpgradeStatPreview';
import { playPopSoundsWithDelays, playPurchaseSound, triggerHapticFeedback } from '@/utils/popSound';
import { 
  UpgradeIcon, StoreIcon, ScrapIcon, CheckIcon, ArrowBackIcon, 
  ZapIcon, ShieldIcon, TargetIcon, HexIcon, AimIcon, ShipIcon 
} from './VectorIcons';

// Map upgrade IDs to vector icons
const getUpgradeIcon = (upgradeId: string, size: number = 20) => {
  const iconMap: Record<string, React.ReactNode> = {
    cannon_power: <ZapIcon size={size} />,
    rapid_fire: <AimIcon size={size} />,
    hull_armor: <ShieldIcon size={size} />,
    thrusters: <ShipIcon size={size} />,
    magnet_range: <HexIcon size={size} />,
    energy_shield: <ShieldIcon size={size} />,
    piercing_rounds: <TargetIcon size={size} />,
    extra_cannons: <AimIcon size={size} />,
  };
  return iconMap[upgradeId] || <ZapIcon size={size} />;
};

type TabType = 'upgrades' | 'store';

export const ShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ type: 'success' | 'already_owned' | 'not_enough'; productName: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('upgrades');
  const [hoveredUpgrade, setHoveredUpgrade] = useState<string | null>(null);
  const [upgradeVersion, setUpgradeVersion] = useState(0);
  const [purchaseFlash, setPurchaseFlash] = useState<string | null>(null);
  const [showLegendaryAnimation, setShowLegendaryAnimation] = useState(false);
  const [insufficientPopup, setInsufficientPopup] = useState<{ itemName: string; cost: number } | null>(null);
  
  const { purchaseProduct, isOwned, isLoading: purchasesLoading, shouldShowAds } = usePurchases();
  const { scraps, addScraps, spendScraps, canAfford } = useScrapCurrency();
  const {
    getUpgradeLevel,
    getUpgradeCost,
    isUpgradeMaxed,
    purchaseUpgrade,
    allUpgrades,
    upgrades,
    isLoading: upgradesLoading,
    storageAvailable,
  } = useShipUpgrades();
  
  const { hasEnteredGalaxy, enterGalaxy, primeAudio } = useMusicContext();

  useEffect(() => {
    if (!hasEnteredGalaxy) {
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  useEffect(() => {
    const items = activeTab === 'upgrades' ? allUpgrades : getVisibleProducts();
    const delays = items.map((_, i) => i * 80);
    playPopSoundsWithDelays(delays);
  }, [activeTab, allUpgrades]);

  const handleUpgradePurchase = (upgradeId: string) => {
    const upgrade = SHIP_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = getUpgradeCost(upgradeId);

    if (isUpgradeMaxed(upgradeId)) {
      setPopup({ type: 'already_owned', productName: upgrade.name });
      return;
    }

    if (!canAfford(cost)) {
      setInsufficientPopup({ itemName: upgrade.name, cost });
      return;
    }

    if (!spendScraps(cost)) return;

    const success = purchaseUpgrade(upgradeId);
    if (!success) {
      addScraps(cost);
      setPopup({ type: 'already_owned', productName: upgrade.name });
      return;
    }

    playPurchaseSound();
    triggerHapticFeedback('success');
    setUpgradeVersion(v => v + 1);
    setPurchaseFlash(upgradeId);
    setTimeout(() => setPurchaseFlash(null), 800);
    setPopup({ type: 'success', productName: upgrade.name });
  };

  const handleStorePurchase = async (item: ShopProduct) => {
    if (item.type !== 'scraps' && item.id !== 'omega_pack' && isOwned(item.id)) {
      setPopup({ type: 'already_owned', productName: item.name });
      return;
    }
    
    // Check if omega pack already owned
    if (item.id === 'omega_pack' && isOwned('omega')) {
      setPopup({ type: 'already_owned', productName: item.name });
      return;
    }
    
    setPurchasing(item.id);
    try {
      const success = await purchaseProduct(item.id);
      if (success) {
        if (item.type === 'scraps' && item.scrapAmount) {
          addScraps(item.scrapAmount);
        }
        // Omega pack gives 5000 scraps bonus + legendary animation
        if (item.id === 'omega_pack') {
          addScraps(5000);
          playPurchaseSound();
          triggerHapticFeedback('success');
          setShowLegendaryAnimation(true);
          return; // Don't show regular popup
        }
        setPopup({ type: 'success', productName: item.name });
      }
    } catch (error) {
      console.error('[IAP] Purchase failed:', error);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center pt-10 pb-4 px-4 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #051510 0%, #020a08 70%, #010504 100%)' }}
    >
      {/* Floating neon particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: '#00ff88',
              opacity: Math.random() * 0.4 + 0.1,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="text-[11px] tracking-wider text-[#00ff88]/60 hover:text-[#00ff88] mb-3 flex items-center gap-2 transition-colors"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          <ArrowBackIcon size={14} glow={false} /> BACK TO MENU
        </button>

        <h1 className="text-xl text-center mb-1 tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
          <span className="text-[#00ff88]" style={{ textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8850' }}>
            SHIP WORKSHOP
          </span>
        </h1>

        {/* Scrap Balance */}
        <div className="flex justify-center items-center gap-2 mb-3">
          <ScrapIcon size={16} />
          <span 
            className="text-[13px] text-[#00ff88]" 
            style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #00ff88' }}
          >
            {scraps.toLocaleString()} SCRAPS
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 text-[10px] py-2 rounded border transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upgrades'
                ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                : 'border-[#00ff88]/30 bg-transparent text-[#00ff88]/50 hover:border-[#00ff88]/60'
            }`}
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            <UpgradeIcon size={14} glow={activeTab === 'upgrades'} /> UPGRADES
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 text-[10px] py-2 rounded border transition-all flex items-center justify-center gap-2 ${
              activeTab === 'store'
                ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                : 'border-[#00ff88]/30 bg-transparent text-[#00ff88]/50 hover:border-[#00ff88]/60'
            }`}
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            <StoreIcon size={14} glow={activeTab === 'store'} /> STORE
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="relative z-10 w-full max-w-md flex-1 overflow-y-auto pb-4">
        {activeTab === 'upgrades' ? (
          <div className="space-y-4">
            {/* Ship Preview */}
            <div className="flex flex-col items-center">
              <div 
                className="text-[9px] text-[#00ff88]/50 mb-2 uppercase tracking-[0.3em]"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                Your Ship
              </div>
              <ShipPreview
                key={upgradeVersion}
                width={180}
                height={120}
                upgradeVersion={upgradeVersion}
                upgrades={upgrades}
              />
              <div 
                className="mt-2 text-[7px] text-[#00ff88]/40 text-center"
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                STORAGE: {storageAvailable ? 'OK' : 'BLOCKED'} • UPGRADES: {Object.keys(upgrades || {}).length}
              </div>
            </div>
            
            {/* Upgrades Grid */}
            <div className="grid grid-cols-2 gap-2">
              {allUpgrades.map((upgrade, index) => {
                const level = upgrades[upgrade.id] || 0;
                const cost = getUpgradeCost(upgrade.id);
                const maxed = level >= upgrade.maxLevel;
                const affordable = canAfford(cost);
                
                return (
                  <div
                    key={upgrade.id}
                    className={`relative border rounded-lg p-3 transition-all duration-300 animate-pop-in ${
                      purchaseFlash === upgrade.id ? 'scale-105' : ''
                    } ${
                      maxed 
                        ? 'border-[#00ff88]/50 bg-[#00ff88]/5' 
                        : affordable
                          ? 'border-[#00ff88]/30 hover:border-[#00ff88]/60'
                          : 'border-[#00ff88]/15'
                    }`}
                    style={{
                      background: purchaseFlash === upgrade.id
                        ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)'
                        : maxed 
                          ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 100, 50, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(0, 255, 136, 0.03) 0%, rgba(0, 50, 30, 0.03) 100%)',
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'backwards',
                      boxShadow: purchaseFlash === upgrade.id 
                        ? '0 0 30px rgba(0, 255, 136, 0.4), inset 0 0 20px rgba(0, 255, 136, 0.1)' 
                        : 'none',
                    }}
                    onMouseEnter={() => setHoveredUpgrade(upgrade.id)}
                    onMouseLeave={() => setHoveredUpgrade(null)}
                    onTouchStart={() => setHoveredUpgrade(upgrade.id)}
                    onTouchEnd={() => setHoveredUpgrade(null)}
                  >
                    {purchaseFlash === upgrade.id && (
                      <div 
                        className="absolute inset-0 rounded-lg pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(0, 255, 136, 0.3) 0%, transparent 70%)',
                          animation: 'pulse-flash 0.6s ease-out forwards',
                        }}
                      />
                    )}
                    
                    {hoveredUpgrade === upgrade.id && !purchaseFlash && (
                      <UpgradeStatPreview upgrade={upgrade} currentLevel={level} upgrades={upgrades} />
                    )}
                    
                    <div className="flex items-start justify-between mb-2">
                      {getUpgradeIcon(upgrade.id, 22)}
                      <span 
                        className={`text-[10px] transition-all duration-300 ${
                          purchaseFlash === upgrade.id ? 'text-[#00ff88] scale-110' : 'text-[#00ff88]/80'
                        }`}
                        style={{ 
                          fontFamily: 'Orbitron, monospace',
                          textShadow: purchaseFlash === upgrade.id ? '0 0 10px #00ff88' : 'none',
                        }}
                      >
                        LVL {level}/{upgrade.maxLevel}
                      </span>
                    </div>
                    
                    <h3 
                      className={`text-[9px] mb-1 ${maxed ? 'text-[#00ff88]' : 'text-[#00ff88]/90'}`}
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {upgrade.name}
                    </h3>
                    <p 
                      className="text-[7px] text-[#00ff88]/40 mb-2 leading-tight"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {upgrade.description}
                    </p>
                    
                    {/* Level progress bar */}
                    <div className="w-full h-1 bg-[#00ff88]/10 rounded-full mb-2 overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500 bg-[#00ff88]"
                        style={{ 
                          width: `${(level / upgrade.maxLevel) * 100}%`,
                          boxShadow: purchaseFlash === upgrade.id ? '0 0 10px #00ff88' : '0 0 5px #00ff88',
                        }}
                      />
                    </div>
                    
                    <button
                      onClick={() => handleUpgradePurchase(upgrade.id)}
                      disabled={maxed || upgradesLoading}
                      className={`w-full text-[8px] py-1.5 rounded transition-all duration-200 transform
                        hover:scale-105 active:scale-90 flex items-center justify-center gap-1 ${
                        maxed 
                          ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' 
                          : affordable
                            ? 'bg-[#00ff88] text-black hover:bg-[#44ffaa] hover:shadow-lg hover:shadow-[#00ff88]/30'
                            : 'bg-[#00ff88]/10 text-[#00ff88]/40 border border-[#00ff88]/20'
                      }`}
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {maxed ? (
                        <><CheckIcon size={10} /> MAXED</>
                      ) : (
                        <><ScrapIcon size={10} glow={false} /> {cost}</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
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
                  className={`border rounded-lg p-3 transition-all duration-300 animate-pop-in ${
                    owned 
                      ? 'border-[#00ff88]/50 bg-[#00ff88]/5' 
                      : 'border-[#00ff88]/30 hover:border-[#00ff88]/60'
                  }`}
                  style={{
                    background: owned 
                      ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 100, 50, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 255, 136, 0.03) 0%, rgba(0, 50, 30, 0.03) 100%)',
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StoreIcon size={28} />
                      <div>
                        <h3 
                          className={`text-[10px] ${owned ? 'text-[#00ff88]' : 'text-[#00ff88]/90'}`}
                          style={{ fontFamily: 'Orbitron, monospace' }}
                        >
                          {item.name}
                        </h3>
                        <p 
                          className="text-[7px] text-[#00ff88]/40"
                          style={{ fontFamily: 'Rajdhani, sans-serif' }}
                        >
                          {item.description}
                        </p>
                        {isScrapPack && item.scrapAmount && (
                          <p 
                            className="text-[7px] text-[#00ff88]/60 mt-0.5 flex items-center gap-1"
                            style={{ fontFamily: 'Orbitron, monospace' }}
                          >
                            +{item.scrapAmount.toLocaleString()} <ScrapIcon size={8} />
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStorePurchase(item)}
                      disabled={purchasing !== null || purchasesLoading}
                      className={`text-[9px] px-3 py-2 rounded transition-all duration-300 
                               border disabled:cursor-not-allowed ${
                        owned 
                          ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30' 
                          : 'text-black bg-[#00ff88] border-[#00ff88] hover:bg-[#44ffaa] hover:scale-105 disabled:opacity-50'
                      }`}
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {owned ? (
                        <span className="flex items-center gap-1"><CheckIcon size={10} /> OWNED</span>
                      ) : purchasing === item.id ? (
                        'PROCESSING...'
                      ) : (
                        item.price
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup */}
      {popup && (
        <PurchasePopup
          type={popup.type}
          productName={popup.productName}
          onClose={() => setPopup(null)}
        />
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
        @keyframes pulse-flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      
      {/* Legendary unlock animation for Omega Pack */}
      {showLegendaryAnimation && (
        <LegendaryUnlockAnimation 
          onComplete={() => {
            setShowLegendaryAnimation(false);
            setPurchasing(null);
          }} 
        />
      )}
      
      {/* Insufficient scraps popup */}
      <InsufficientScrapsPopup
        isOpen={!!insufficientPopup}
        onClose={() => setInsufficientPopup(null)}
        currentScraps={scraps}
        requiredScraps={insufficientPopup?.cost || 0}
        itemName={insufficientPopup?.itemName}
      />
    </div>
  );
};
