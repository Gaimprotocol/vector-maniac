// Ship Model Definitions - 20 unique mothership designs with different shapes
// Each model has a unique draw function that renders a distinct silhouette

export interface ShipModel {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    cockpit: string;
  };
}

// 40 Unique Vector Maniac Ship Models
export const SHIP_MODELS: ShipModel[] = [
  // ============= BASE FLEET (20 ships) =============
  {
    id: 'default',
    name: 'ZERO POINT',
    description: 'Origin fighter - where all vectors begin',
    colors: { primary: '#00ff88', secondary: '#00aa55', accent: '#88ffaa', glow: '#00ff88', cockpit: '#ffffff' }
  },
  {
    id: 'viper',
    name: 'PIXEL FANG',
    description: 'Razor-thin interceptor with binary venom',
    colors: { primary: '#00ffcc', secondary: '#00aa88', accent: '#88ffdd', glow: '#00ffcc', cockpit: '#ffffff' }
  },
  {
    id: 'phantom',
    name: 'GHOST PROTOCOL',
    description: 'Stealth mesh with null-signature hull',
    colors: { primary: '#44ff88', secondary: '#22aa44', accent: '#aaffcc', glow: '#44ff88', cockpit: '#ffffff' }
  },
  {
    id: 'hammer',
    name: 'CRASH DUMP',
    description: 'Heavy striker with memory-burst cannons',
    colors: { primary: '#00ff66', secondary: '#00aa44', accent: '#88ff88', glow: '#00ff66', cockpit: '#ccffcc' }
  },
  {
    id: 'needle',
    name: 'THREAD ZERO',
    description: 'Ultra-slim data-needle for max velocity',
    colors: { primary: '#66ffaa', secondary: '#44aa77', accent: '#ccffdd', glow: '#66ffaa', cockpit: '#ffffff' }
  },
  {
    id: 'trident',
    name: 'FORK BOMB',
    description: 'Triple-vector assault with spread fire',
    colors: { primary: '#00ff99', secondary: '#00aa66', accent: '#88ffbb', glow: '#00ff99', cockpit: '#aaffcc' }
  },
  {
    id: 'mantis',
    name: 'BUG TRACKER',
    description: 'Insectoid hunter with curved scan-wings',
    colors: { primary: '#33ff77', secondary: '#22aa55', accent: '#99ffaa', glow: '#33ff77', cockpit: '#ccff88' }
  },
  {
    id: 'scorpion',
    name: 'STACK TRACE',
    description: 'Curved chassis with tail-mounted stinger',
    colors: { primary: '#11ff88', secondary: '#11aa55', accent: '#77ffaa', glow: '#11ff88', cockpit: '#aaffcc' }
  },
  {
    id: 'delta',
    name: 'DELTA MERGE',
    description: 'Triangular stealth with diff-core engine',
    colors: { primary: '#00ffaa', secondary: '#00aa77', accent: '#66ffcc', glow: '#00ffaa', cockpit: '#ccffee' }
  },
  {
    id: 'stingray',
    name: 'FLAT MAP',
    description: 'Low-profile glider with wide sensor array',
    colors: { primary: '#22ff99', secondary: '#11aa66', accent: '#88ffbb', glow: '#22ff99', cockpit: '#ddffee' }
  },
  {
    id: 'phoenix',
    name: 'HOT RELOAD',
    description: 'Regenerating fighter with flame vectors',
    colors: { primary: '#44ffaa', secondary: '#33aa77', accent: '#bbffcc', glow: '#44ffaa', cockpit: '#ffffff' }
  },
  {
    id: 'shark',
    name: 'HEAP SHARK',
    description: 'Aggressive predator with memory-fin design',
    colors: { primary: '#00ff77', secondary: '#00aa55', accent: '#66ff99', glow: '#00ff77', cockpit: '#aaffbb' }
  },
  {
    id: 'wasp',
    name: 'ASYNC WASP',
    description: 'Quick stinger with parallel attack threads',
    colors: { primary: '#55ff88', secondary: '#44aa66', accent: '#aaffaa', glow: '#55ff88', cockpit: '#eeffcc' }
  },
  {
    id: 'corsair',
    name: 'PIRATE HASH',
    description: 'Rogue coder with asymmetric hull',
    colors: { primary: '#11ff99', secondary: '#11aa66', accent: '#77ffbb', glow: '#11ff99', cockpit: '#ccffdd' }
  },
  {
    id: 'specter',
    name: 'NULL POINTER',
    description: 'Ghostly frame with void-reference systems',
    colors: { primary: '#88ffbb', secondary: '#66aa88', accent: '#ccffdd', glow: '#88ffbb', cockpit: '#ffffff' }
  },
  {
    id: 'raptor',
    name: 'BIT RIPPER',
    description: 'Predator class with binary talons',
    colors: { primary: '#33ffaa', secondary: '#22aa77', accent: '#99ffcc', glow: '#33ffaa', cockpit: '#ddffee' }
  },
  {
    id: 'aurora',
    name: 'GRADIENT FLOW',
    description: 'Elegant curves with spectrum-shift hull',
    colors: { primary: '#00ffdd', secondary: '#00aa99', accent: '#88ffee', glow: '#00ffdd', cockpit: '#ffffff' }
  },
  {
    id: 'gladiator',
    name: 'CORE TANK',
    description: 'Massive armored battle-processor',
    colors: { primary: '#44ff99', secondary: '#33aa77', accent: '#aaffcc', glow: '#44ff99', cockpit: '#ffffff' }
  },
  {
    id: 'eclipse',
    name: 'RING BUFFER',
    description: 'Circular design with orbital weapon ring',
    colors: { primary: '#00ff88', secondary: '#00aa66', accent: '#66ffaa', glow: '#00ff88', cockpit: '#ccffdd' }
  },
  {
    id: 'basilisk',
    name: 'RECURSION',
    description: 'Serpentine hull with self-referential core',
    colors: { primary: '#22ff77', secondary: '#11aa55', accent: '#88ff99', glow: '#22ff77', cockpit: '#aaffbb' }
  },
  // ============= MEGA PACK FLEET (20 ships) =============
  {
    id: 'interceptor',
    name: 'REGEX BLADE',
    description: 'Pattern-matching interceptor',
    colors: { primary: '#00ffbb', secondary: '#00aa88', accent: '#77ffdd', glow: '#00ffbb', cockpit: '#eeffff' }
  },
  {
    id: 'valkyrie',
    name: 'CHROME CAST',
    description: 'Reflective attacker with mirror-hull',
    colors: { primary: '#66ffaa', secondary: '#44aa77', accent: '#bbffcc', glow: '#66ffaa', cockpit: '#ffffff' }
  },
  {
    id: 'crimson',
    name: 'ERROR STATE',
    description: 'Critical-path hunter with fault sensors',
    colors: { primary: '#33ff99', secondary: '#22aa66', accent: '#99ffbb', glow: '#33ff99', cockpit: '#ddffee' }
  },
  {
    id: 'goldwing',
    name: 'WIDE CAST',
    description: 'Broadcast-class with expanded range',
    colors: { primary: '#55ff88', secondary: '#44aa66', accent: '#aaffaa', glow: '#55ff88', cockpit: '#ccffcc' }
  },
  {
    id: 'cobalt',
    name: 'STREAM LINE',
    description: 'Flow-optimized vector fighter',
    colors: { primary: '#00ffcc', secondary: '#00aa99', accent: '#88ffdd', glow: '#00ffcc', cockpit: '#ffffff' }
  },
  {
    id: 'ironclad',
    name: 'HARD CACHE',
    description: 'Armored frigate with persistent shields',
    colors: { primary: '#44ff77', secondary: '#33aa55', accent: '#99ff99', glow: '#44ff77', cockpit: '#aaffbb' }
  },
  {
    id: 'redtail',
    name: 'QUICK SORT',
    description: 'Rapid interceptor with priority targeting',
    colors: { primary: '#22ffaa', secondary: '#11aa77', accent: '#88ffcc', glow: '#22ffaa', cockpit: '#ddffee' }
  },
  {
    id: 'sunburst',
    name: 'BURST MODE',
    description: 'Explosive attacker with overclock core',
    colors: { primary: '#66ff99', secondary: '#55aa77', accent: '#bbffbb', glow: '#66ff99', cockpit: '#ffffff' }
  },
  {
    id: 'steelwolf',
    name: 'PACK HUNTER',
    description: 'Aggressive swarm-class fighter',
    colors: { primary: '#00ff99', secondary: '#00aa77', accent: '#77ffbb', glow: '#00ff99', cockpit: '#ccffdd' }
  },
  {
    id: 'blueshift',
    name: 'PHASE SHIFT',
    description: 'Dimensional racer with warp-vector drive',
    colors: { primary: '#33ffbb', secondary: '#22aa88', accent: '#99ffdd', glow: '#33ffbb', cockpit: '#eeffff' }
  },
  {
    id: 'thunderbolt',
    name: 'POWER SURGE',
    description: 'Massive cruiser with voltage core',
    colors: { primary: '#11ff88', secondary: '#11aa66', accent: '#88ffaa', glow: '#11ff88', cockpit: '#ccffcc' }
  },
  {
    id: 'yellowjacket',
    name: 'INJECT POINT',
    description: 'Agile fighter with penetration stingers',
    colors: { primary: '#55ffaa', secondary: '#44aa77', accent: '#aaffcc', glow: '#55ffaa', cockpit: '#ffffff' }
  },
  {
    id: 'silverfox',
    name: 'TRACE LOG',
    description: 'Elegant scout with deep-scan sensors',
    colors: { primary: '#77ff99', secondary: '#55aa77', accent: '#bbffbb', glow: '#77ff99', cockpit: '#ddffdd' }
  },
  {
    id: 'firebird',
    name: 'CORE MELT',
    description: 'Thermal attacker with fusion drive',
    colors: { primary: '#44ffbb', secondary: '#33aa88', accent: '#aaffdd', glow: '#44ffbb', cockpit: '#ffffff' }
  },
  {
    id: 'arctic',
    name: 'COLD BOOT',
    description: 'Cryo-fighter with freeze protocols',
    colors: { primary: '#88ffcc', secondary: '#66aa99', accent: '#ccffee', glow: '#88ffcc', cockpit: '#ffffff' }
  },
  {
    id: 'commander',
    name: 'ROOT ACCESS',
    description: 'Command vessel with admin privileges',
    colors: { primary: '#22ff99', secondary: '#11aa77', accent: '#99ffcc', glow: '#22ff99', cockpit: '#ddffee' }
  },
  {
    id: 'scarlet',
    name: 'EDGE CASE',
    description: 'Precision duelist with boundary sensors',
    colors: { primary: '#00ffaa', secondary: '#00aa88', accent: '#77ffcc', glow: '#00ffaa', cockpit: '#eeffff' }
  },
  {
    id: 'goldenrod',
    name: 'LOAD BALANCE',
    description: 'Distribution-class transport hunter',
    colors: { primary: '#55ff99', secondary: '#44aa77', accent: '#aaffbb', glow: '#55ff99', cockpit: '#ccffdd' }
  },
  {
    id: 'bluehawk',
    name: 'COMPILE TIME',
    description: 'Swift builder with rapid-fire arrays',
    colors: { primary: '#33ffaa', secondary: '#22aa88', accent: '#99ffcc', glow: '#33ffaa', cockpit: '#ffffff' }
  },
  {
    id: 'titanium',
    name: 'KERNEL PANIC',
    description: 'Ultra-armored destroyer class',
    colors: { primary: '#66ffbb', secondary: '#55aa88', accent: '#bbffdd', glow: '#66ffbb', cockpit: '#eeffff' }
  },
  // ============= SECRET OMEGA PACK EXCLUSIVE =============
  {
    id: 'omega_prime',
    name: 'OMEGA PRIME',
    description: '⬡ LEGENDARY - Exclusive Omega Pack ship',
    colors: { primary: '#ffd700', secondary: '#1a1a2e', accent: '#00ff88', glow: '#ffd700', cockpit: '#ffffff' }
  },
  // ============= ARENA EXCLUSIVE SHIPS =============
  {
    id: 'hex_phantom',
    name: 'HEX PHANTOM',
    description: '◆ ARENA LEGENDARY - Hexagonal stealth fighter',
    colors: { primary: '#00ffaa', secondary: '#00aa66', accent: '#88ffdd', glow: '#00ffaa', cockpit: '#ffffff' }
  },
  {
    id: 'pulse_wraith',
    name: 'PULSE WRAITH',
    description: '◆ ARENA LEGENDARY - Spectral energy attacker',
    colors: { primary: '#88ff00', secondary: '#55aa00', accent: '#ccff88', glow: '#88ff00', cockpit: '#ffffff' }
  },
  {
    id: 'grid_reaper',
    name: 'GRID REAPER',
    description: '◆ ARENA LEGENDARY - Angular death machine',
    colors: { primary: '#00ffcc', secondary: '#00aa88', accent: '#88ffee', glow: '#00ffcc', cockpit: '#ff4444' }
  },
  {
    id: 'null_striker',
    name: 'NULL STRIKER',
    description: '◆ ARENA LEGENDARY - Zero-point energy fighter',
    colors: { primary: '#ff00ff', secondary: '#aa00aa', accent: '#ff88ff', glow: '#ff00ff', cockpit: '#00ffff' }
  }
];

// Draw functions for each ship model
// ctx is already translated to ship center
export function drawShipModel(
  ctx: CanvasRenderingContext2D,
  modelId: string,
  width: number,
  height: number,
  time: number,
  quality: 'game' | 'preview' = 'preview'
): void {
  const model = SHIP_MODELS.find(m => m.id === modelId) || SHIP_MODELS[0];
  const colors = model.colors;
  
  // Clear shadow for clean rendering
  ctx.shadowBlur = 0;
  
  switch (modelId) {
    case 'viper':
      drawViper(ctx, width, height, colors, time);
      break;
    case 'phantom':
      drawPhantom(ctx, width, height, colors, time);
      break;
    case 'hammer':
      drawHammer(ctx, width, height, colors, time);
      break;
    case 'needle':
      drawNeedle(ctx, width, height, colors, time);
      break;
    case 'trident':
      drawTrident(ctx, width, height, colors, time);
      break;
    case 'mantis':
      drawMantis(ctx, width, height, colors, time);
      break;
    case 'scorpion':
      drawScorpion(ctx, width, height, colors, time);
      break;
    case 'delta':
      drawDelta(ctx, width, height, colors, time);
      break;
    case 'stingray':
      drawStingray(ctx, width, height, colors, time);
      break;
    case 'phoenix':
      drawPhoenix(ctx, width, height, colors, time);
      break;
    case 'shark':
      drawShark(ctx, width, height, colors, time);
      break;
    case 'wasp':
      drawWasp(ctx, width, height, colors, time);
      break;
    case 'corsair':
      drawCorsair(ctx, width, height, colors, time);
      break;
    case 'specter':
      drawSpecter(ctx, width, height, colors, time);
      break;
    case 'raptor':
      drawRaptor(ctx, width, height, colors, time);
      break;
    case 'aurora':
      drawAurora(ctx, width, height, colors, time);
      break;
    case 'gladiator':
      drawGladiator(ctx, width, height, colors, time);
      break;
    case 'eclipse':
      drawEclipse(ctx, width, height, colors, time);
      break;
    case 'basilisk':
      drawBasilisk(ctx, width, height, colors, time);
      break;
    // NEW 20 RETRO SCI-FI SHIPS
    case 'interceptor':
      drawInterceptor(ctx, width, height, colors, time);
      break;
    case 'valkyrie':
      drawValkyrie(ctx, width, height, colors, time);
      break;
    case 'crimson':
      drawCrimson(ctx, width, height, colors, time);
      break;
    case 'goldwing':
      drawGoldwing(ctx, width, height, colors, time);
      break;
    case 'cobalt':
      drawCobalt(ctx, width, height, colors, time);
      break;
    case 'ironclad':
      drawIronclad(ctx, width, height, colors, time);
      break;
    case 'redtail':
      drawRedtail(ctx, width, height, colors, time);
      break;
    case 'sunburst':
      drawSunburst(ctx, width, height, colors, time);
      break;
    case 'steelwolf':
      drawSteelwolf(ctx, width, height, colors, time);
      break;
    case 'blueshift':
      drawBlueshift(ctx, width, height, colors, time);
      break;
    case 'thunderbolt':
      drawThunderbolt(ctx, width, height, colors, time);
      break;
    case 'yellowjacket':
      drawYellowjacket(ctx, width, height, colors, time);
      break;
    case 'silverfox':
      drawSilverfox(ctx, width, height, colors, time);
      break;
    case 'firebird':
      drawFirebird(ctx, width, height, colors, time);
      break;
    case 'arctic':
      drawArctic(ctx, width, height, colors, time);
      break;
    case 'commander':
      drawCommander(ctx, width, height, colors, time);
      break;
    case 'scarlet':
      drawScarlet(ctx, width, height, colors, time);
      break;
    case 'goldenrod':
      drawGoldenrod(ctx, width, height, colors, time);
      break;
    case 'bluehawk':
      drawBluehawk(ctx, width, height, colors, time);
      break;
    case 'titanium':
      drawTitanium(ctx, width, height, colors, time);
      break;
    case 'omega_prime':
      drawOmegaPrime(ctx, width, height, colors, time, quality);
      break;
    // ARENA EXCLUSIVE SHIPS
    case 'hex_phantom':
      drawHexPhantom(ctx, width, height, colors, time);
      break;
    case 'pulse_wraith':
      drawPulseWraith(ctx, width, height, colors, time);
      break;
    case 'grid_reaper':
      drawGridReaper(ctx, width, height, colors, time);
      break;
    case 'null_striker':
      drawNullStriker(ctx, width, height, colors, time);
      break;
    default:
      drawFalcon(ctx, width, height, colors, time);
  }
}

// DEFAULT: ZERO POINT - Origin vector fighter
function drawFalcon(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const pulse = Math.sin(time / 200) * 0.2 + 0.8;
  
  // Hexagonal main body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);           // Front point
  ctx.lineTo(25, -6);
  ctx.lineTo(5, -8);
  ctx.lineTo(-15, -6);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 6);
  ctx.lineTo(5, 8);
  ctx.lineTo(25, 6);
  ctx.closePath();
  ctx.fill();
  
  // Inner wireframe lines
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(0, -5);
  ctx.lineTo(-15, 0);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.stroke();
  
  // Grid pattern on body
  ctx.strokeStyle = colors.accent + '44';
  for (let i = -10; i <= 20; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, -6);
    ctx.lineTo(i, 6);
    ctx.stroke();
  }
  
  // Angular wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-12, -14);
  ctx.lineTo(-18, -10);
  ctx.lineTo(-12, -6);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-12, 14);
  ctx.lineTo(-18, 10);
  ctx.lineTo(-12, 6);
  ctx.closePath();
  ctx.fill();
  
  // Wing tip nodes
  ctx.fillStyle = colors.glow;
  ctx.beginPath();
  ctx.arc(-15, -12, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-15, 12, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit - digital display
  ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
  ctx.fillRect(26, -2, 6, 4);
  
  drawEngine(ctx, -20, 0, colors, time);
}

// PIXEL FANG - Binary venom interceptor
function drawViper(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const scan = (time / 100) % 40;
  
  // Sharp arrow body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(30, -4);
  ctx.lineTo(5, -5);
  ctx.lineTo(-15, -4);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-15, 4);
  ctx.lineTo(5, 5);
  ctx.lineTo(30, 4);
  ctx.closePath();
  ctx.fill();
  
  // Pixelated teeth pattern
  ctx.fillStyle = colors.accent;
  for (let i = 0; i < 5; i++) {
    const x = 25 - i * 8;
    ctx.fillRect(x, -3, 3, 2);
    ctx.fillRect(x, 1, 3, 2);
  }
  
  // Fang wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -5);
  ctx.lineTo(-5, -16);
  ctx.lineTo(-10, -14);
  ctx.lineTo(-5, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 5);
  ctx.lineTo(-5, 16);
  ctx.lineTo(-10, 14);
  ctx.lineTo(-5, 5);
  ctx.closePath();
  ctx.fill();
  
  // Scan line effect
  ctx.fillStyle = colors.glow + '66';
  ctx.fillRect(-20 + scan, -5, 2, 10);
  
  // Digital cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(32, -2, 8, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// GHOST PROTOCOL - Null-signature stealth
function drawPhantom(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const flicker = Math.sin(time / 80) * 0.3 + 0.7;
  
  // Triangular stealth hull
  ctx.globalAlpha = 0.85 * flicker;
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(15, -7);
  ctx.lineTo(-20, -5);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 5);
  ctx.lineTo(15, 7);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Null-signature pattern (dashed outline)
  ctx.strokeStyle = colors.glow;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(15, -7);
  ctx.lineTo(-20, -5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(15, 7);
  ctx.lineTo(-20, 5);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Stealth wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -7);
  ctx.lineTo(-15, -15);
  ctx.lineTo(-22, -12);
  ctx.lineTo(-15, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 7);
  ctx.lineTo(-15, 15);
  ctx.lineTo(-22, 12);
  ctx.lineTo(-15, 5);
  ctx.closePath();
  ctx.fill();
  
  // Digital cockpit slit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(25, -1, 10, 2);
  
  drawEngine(ctx, -25, 0, colors, time);
}

// CRASH DUMP - Memory-burst heavy striker
function drawHammer(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const pulse = Math.sin(time / 150) * 0.15 + 0.85;
  
  // Rectangular tank hull
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(30, -8);
  ctx.lineTo(30, 8);
  ctx.lineTo(-20, 7);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, -7);
  ctx.closePath();
  ctx.fill();
  
  // Data block pattern
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(20, -7, 8, 6);
  ctx.fillRect(20, 1, 8, 6);
  ctx.fillRect(8, -6, 10, 4);
  ctx.fillRect(8, 2, 10, 4);
  ctx.fillRect(-5, -5, 10, 3);
  ctx.fillRect(-5, 2, 10, 3);
  
  // Memory dump indicator
  ctx.fillStyle = `rgba(255, 100, 100, ${pulse})`;
  ctx.fillRect(-18, -3, 6, 6);
  
  // Burst cannons
  ctx.fillStyle = colors.accent;
  ctx.fillRect(28, -10, 4, 4);
  ctx.fillRect(28, 6, 4, 4);
  
  // Viewport
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(22, -2, 6, 4);
  
  drawEngine(ctx, -25, 0, colors, time, 1.2);
}

// THREAD ZERO - Ultra-slim data-needle
function drawNeedle(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const dataFlow = (time / 50) % 60;
  
  // Needle-thin body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(45, 0);
  ctx.lineTo(35, -2);
  ctx.lineTo(-20, -2);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 2);
  ctx.lineTo(35, 2);
  ctx.closePath();
  ctx.fill();
  
  // Data thread running through
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.lineDashOffset = -dataFlow;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(40, 0);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Tiny stabilizers
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-10, -2);
  ctx.lineTo(-18, -7);
  ctx.lineTo(-20, -5);
  ctx.lineTo(-15, -2);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-10, 2);
  ctx.lineTo(-18, 7);
  ctx.lineTo(-20, 5);
  ctx.lineTo(-15, 2);
  ctx.closePath();
  ctx.fill();
  
  // Point light cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(40, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time, 0.6);
}

// FORK BOMB - Triple-vector assault ship
function drawTrident(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const pulse = Math.sin(time / 120) * 0.3 + 0.7;
  
  // Three parallel prongs
  ctx.fillStyle = colors.primary;
  // Center prong
  ctx.fillRect(-15, -2, 50, 4);
  // Upper prong
  ctx.fillRect(-10, -10, 35, 4);
  // Lower prong
  ctx.fillRect(-10, 6, 35, 4);
  
  // Connecting block
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-15, -10, 8, 24);
  
  // Fork node tips
  ctx.fillStyle = `rgba(136, 255, 187, ${pulse})`;
  ctx.fillRect(33, -1, 4, 2);
  ctx.fillRect(23, -9, 4, 2);
  ctx.fillRect(23, 7, 4, 2);
  
  // Process indicator lights
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-10, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, -8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, 8, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -15, -8, colors, time, 0.4);
  drawEngine(ctx, -15, 0, colors, time, 0.6);
  drawEngine(ctx, -15, 8, colors, time, 0.4);
}

// BUG TRACKER - Insectoid hunter with scan-wings
function drawMantis(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const scan = (time / 100) % 30;
  
  // Segmented hexagonal body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(25, -5);
  ctx.lineTo(5, -6);
  ctx.lineTo(-15, -5);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 5);
  ctx.lineTo(5, 6);
  ctx.lineTo(25, 5);
  ctx.closePath();
  ctx.fill();
  
  // Segmentation lines
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1;
  for (let i = -5; i <= 20; i += 10) {
    ctx.beginPath();
    ctx.moveTo(i, -5);
    ctx.lineTo(i, 5);
    ctx.stroke();
  }
  
  // Angular scan-wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(-10, -16);
  ctx.lineTo(-20, -12);
  ctx.lineTo(-15, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 6);
  ctx.lineTo(-10, 16);
  ctx.lineTo(-20, 12);
  ctx.lineTo(-15, 5);
  ctx.closePath();
  ctx.fill();
  
  // Scan beam effect
  ctx.fillStyle = colors.glow + '44';
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(35 + scan, -scan * 0.5);
  ctx.lineTo(35 + scan, scan * 0.5);
  ctx.closePath();
  ctx.fill();
  
  // Compound eyes (dual cockpits)
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(28, -3, 5, 2);
  ctx.fillRect(28, 1, 5, 2);
  
  drawEngine(ctx, -20, 0, colors, time);
}

// STACK TRACE - Curved chassis with tail-stinger
function drawScorpion(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const tailPulse = Math.sin(time / 100) * 3;
  
  // Blocky main hull
  ctx.fillStyle = colors.primary;
  ctx.fillRect(-18, -6, 35, 12);
  
  // Stack segments on body
  ctx.fillStyle = colors.secondary;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-15 + i * 8, -5, 6, 3);
    ctx.fillRect(-15 + i * 8, 2, 6, 3);
  }
  
  // Curved trace tail
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(17, 0);
  ctx.quadraticCurveTo(30, -5 + tailPulse, 40, -12 + tailPulse);
  ctx.stroke();
  
  // Stinger point
  ctx.fillStyle = colors.glow;
  ctx.beginPath();
  ctx.arc(40, -12 + tailPulse, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Claw wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-15, -6);
  ctx.lineTo(-22, -12);
  ctx.lineTo(-25, -8);
  ctx.lineTo(-18, -6);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-15, 6);
  ctx.lineTo(-22, 12);
  ctx.lineTo(-25, 8);
  ctx.lineTo(-18, 6);
  ctx.closePath();
  ctx.fill();
  
  // Debug viewport
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(10, -2, 6, 4);
  
  drawEngine(ctx, -18, 0, colors, time);
}

// DELTA MERGE - Diff-core triangular stealth
function drawDelta(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const merge = Math.sin(time / 200) * 0.2 + 0.8;
  
  // Perfect delta triangle
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(-22, -16);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-22, 16);
  ctx.closePath();
  ctx.fill();
  
  // Inner diff pattern
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(-12, -10);
  ctx.lineTo(-8, 0);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.stroke();
  
  // Merge indicator lines
  ctx.strokeStyle = `rgba(102, 255, 204, ${merge})`;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-15, -12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-15, 12);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Merge nodes
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-20, -15, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-20, 15, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit core
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(20, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -18, 0, colors, time);
}

// FLAT MAP - Wide sensor array glider
function drawStingray(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const sweep = Math.sin(time / 150) * 2;
  
  // Wide hexagonal body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(20, -4);
  ctx.lineTo(-5, -8);
  ctx.lineTo(-25, -10 + sweep);
  ctx.lineTo(-30, 0);
  ctx.lineTo(-25, 10 - sweep);
  ctx.lineTo(-5, 8);
  ctx.lineTo(20, 4);
  ctx.closePath();
  ctx.fill();
  
  // Grid pattern on wide wings
  ctx.strokeStyle = colors.secondary + '88';
  ctx.lineWidth = 0.5;
  for (let i = -20; i <= 10; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, -8);
    ctx.lineTo(i - 5, 0);
    ctx.lineTo(i, 8);
    ctx.stroke();
  }
  
  // Sensor array indicator
  ctx.fillStyle = colors.accent;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-20 + i * 8, -1, 3, 2);
  }
  
  // Data stream tail
  ctx.strokeStyle = colors.glow;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-42, 0);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Dual viewports
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(18, -2, 8, 1.5);
  ctx.fillRect(18, 0.5, 8, 1.5);
}

// HOT RELOAD - Regenerating flame fighter
function drawPhoenix(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const reload = (time / 100) % 30;
  const pulse = Math.sin(time / 80) * 0.3 + 0.7;
  
  // Angular phoenix body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -5);
  ctx.lineTo(5, -6);
  ctx.lineTo(-15, -4);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 4);
  ctx.lineTo(5, 6);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Reload progress wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(-10, -16);
  ctx.lineTo(-18, -12);
  ctx.lineTo(-12, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 6);
  ctx.lineTo(-10, 16);
  ctx.lineTo(-18, 12);
  ctx.lineTo(-12, 4);
  ctx.closePath();
  ctx.fill();
  
  // Hot reload indicator (circular progress)
  ctx.strokeStyle = `rgba(187, 255, 204, ${pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, (reload / 30) * Math.PI * 2);
  ctx.stroke();
  
  // Flame tips
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-14, -14, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-14, 14, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(28, -2, 8, 4);
  
  drawEngine(ctx, -20, 0, colors, time);
}

// HEAP SHARK - Memory-fin predator
function drawShark(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const bite = Math.sin(time / 100) * 2;
  
  // Streamlined data body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(40 + bite, 0);
  ctx.lineTo(28, -5);
  ctx.lineTo(5, -6);
  ctx.lineTo(-18, -5);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 5);
  ctx.lineTo(5, 6);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Dorsal heap-fin
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(-5, -16);
  ctx.lineTo(-12, -12);
  ctx.lineTo(-8, -6);
  ctx.closePath();
  ctx.fill();
  
  // Side memory-fins
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(-15, -11);
  ctx.lineTo(-20, -8);
  ctx.lineTo(-15, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-5, 5);
  ctx.lineTo(-15, 11);
  ctx.lineTo(-20, 8);
  ctx.lineTo(-15, 5);
  ctx.closePath();
  ctx.fill();
  
  // Byte teeth pattern
  ctx.fillStyle = colors.accent;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(30 - i * 6, -2, 2, 1);
    ctx.fillRect(30 - i * 6, 1, 2, 1);
  }
  
  // Eye viewport
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(32, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// ASYNC WASP - Parallel attack stinger
function drawWasp(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const buzz = Math.sin(time / 50) * 1;
  
  // Striped async body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -3);
  ctx.lineTo(-15, -3);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 3);
  ctx.lineTo(28, 3);
  ctx.closePath();
  ctx.fill();
  
  // Async stripes (parallel lines)
  ctx.fillStyle = colors.accent;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(20 - i * 8, -2, 3, 4);
  }
  
  // Rapid wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(8, -3);
  ctx.lineTo(-5, -12 + buzz);
  ctx.lineTo(-15, -10 + buzz);
  ctx.lineTo(-5, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(8, 3);
  ctx.lineTo(-5, 12 - buzz);
  ctx.lineTo(-15, 10 - buzz);
  ctx.lineTo(-5, 3);
  ctx.closePath();
  ctx.fill();
  
  // Stinger
  ctx.fillStyle = colors.glow;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(45, 0);
  ctx.lineTo(38, -1);
  ctx.closePath();
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// PIRATE HASH - Rogue asymmetric coder
function drawCorsair(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  // Rugged asymmetric hull
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(32, 0);
  ctx.lineTo(25, -5);
  ctx.lineTo(-8, -6);
  ctx.lineTo(-20, -3);
  ctx.lineTo(-22, 4);
  ctx.lineTo(-8, 7);
  ctx.lineTo(25, 5);
  ctx.closePath();
  ctx.fill();
  
  // Asymmetric wings (hash collision visual)
  ctx.fillStyle = colors.secondary;
  // Larger top wing
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(-10, -16);
  ctx.lineTo(-20, -12);
  ctx.lineTo(-12, -6);
  ctx.closePath();
  ctx.fill();
  
  // Smaller bottom wing
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.lineTo(-8, 11);
  ctx.lineTo(-14, 9);
  ctx.lineTo(-8, 7);
  ctx.closePath();
  ctx.fill();
  
  // Hash symbol emblem
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, -4);
  ctx.lineTo(12, 4);
  ctx.moveTo(18, -4);
  ctx.lineTo(18, 4);
  ctx.moveTo(10, -2);
  ctx.lineTo(20, -2);
  ctx.moveTo(10, 2);
  ctx.lineTo(20, 2);
  ctx.stroke();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(24, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// NULL POINTER - Void-reference ghost
function drawSpecter(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const ghostPulse = Math.sin(time / 100) * 0.25 + 0.75;
  
  // Semi-transparent ethereal body
  ctx.globalAlpha = 0.7 * ghostPulse;
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(25, -6);
  ctx.lineTo(0, -7);
  ctx.lineTo(-20, -5);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 5);
  ctx.lineTo(0, 7);
  ctx.lineTo(25, 6);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Null pointer trail
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-35, -5);
  ctx.lineTo(-40, 0);
  ctx.lineTo(-35, 5);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Void reference indicator (dashed box)
  ctx.strokeStyle = colors.glow;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(0, -5, 15, 10);
  ctx.setLineDash([]);
  
  // Glowing core (null state)
  ctx.fillStyle = `rgba(255, 255, 255, ${ghostPulse})`;
  ctx.beginPath();
  ctx.arc(20, 0, 4, 0, Math.PI * 2);
  ctx.fill();
}

// BIT RIPPER - Predator with binary talons
function drawRaptor(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const rip = Math.sin(time / 80) * 2;
  
  // Angular predator body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(28, -5);
  ctx.lineTo(5, -6);
  ctx.lineTo(-18, -4);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 4);
  ctx.lineTo(5, 6);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Binary claw wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.lineTo(-5, -15 + rip);
  ctx.lineTo(-15, -12 + rip);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.lineTo(-5, 15 - rip);
  ctx.lineTo(-15, 12 - rip);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  
  // Binary talons (1s and 0s pattern)
  ctx.fillStyle = colors.accent;
  ctx.font = '6px monospace';
  ctx.fillText('1', 36, 2);
  ctx.fillText('0', 36, -1);
  
  // Ripper cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(30, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// GRADIENT FLOW - Spectrum-shift hull
function drawAurora(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const flow = (time / 100) % 40;
  
  // Flowing curved body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -5);
  ctx.lineTo(0, -6);
  ctx.lineTo(-22, -4);
  ctx.lineTo(-28, 0);
  ctx.lineTo(-22, 4);
  ctx.lineTo(0, 6);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Gradient flow lines
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const offset = (flow + i * 10) % 40;
    ctx.beginPath();
    ctx.moveTo(-20 + offset, -5);
    ctx.lineTo(-15 + offset, 0);
    ctx.lineTo(-20 + offset, 5);
    ctx.stroke();
  }
  
  // Spectrum wings
  ctx.fillStyle = colors.accent + '88';
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(-10, -14);
  ctx.lineTo(-22, -10);
  ctx.lineTo(-15, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 6);
  ctx.lineTo(-10, 14);
  ctx.lineTo(-22, 10);
  ctx.lineTo(-15, 4);
  ctx.closePath();
  ctx.fill();
  
  // Flow core
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(30, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -28, 0, colors, time);
}

// CORE TANK - Massive battle-processor
function drawGladiator(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const process = Math.sin(time / 120) * 0.2 + 0.8;
  
  // Heavy rectangular hull
  ctx.fillStyle = colors.primary;
  ctx.fillRect(-22, -8, 50, 16);
  
  // Processor blocks
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-18, -7, 12, 6);
  ctx.fillRect(-18, 1, 12, 6);
  ctx.fillRect(-2, -7, 12, 6);
  ctx.fillRect(-2, 1, 12, 6);
  ctx.fillRect(14, -7, 12, 6);
  ctx.fillRect(14, 1, 12, 6);
  
  // Processing indicator lights
  ctx.fillStyle = `rgba(170, 255, 204, ${process})`;
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(-15 + i * 16, -4, 2, 2);
    ctx.fillRect(-15 + i * 16, 2, 2, 2);
  }
  
  // Heavy cannons
  ctx.fillStyle = colors.accent;
  ctx.fillRect(26, -10, 6, 4);
  ctx.fillRect(26, 6, 6, 4);
  
  // Command viewport
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(22, -2, 6, 4);
  
  drawEngine(ctx, -22, -5, colors, time, 0.6);
  drawEngine(ctx, -22, 5, colors, time, 0.6);
}

// RING BUFFER - Circular orbital weapon
function drawEclipse(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const rotate = time / 200;
  
  // Outer ring structure
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(5, 0, 16, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner core
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(5, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Rotating buffer segments
  ctx.save();
  ctx.translate(5, 0);
  ctx.rotate(rotate);
  ctx.fillStyle = colors.accent;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.fillRect(12, -2, 5, 4);
  }
  ctx.restore();
  
  // Nose pointer
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(21, 0);
  ctx.lineTo(35, 0);
  ctx.lineTo(21, -3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(21, 0);
  ctx.lineTo(35, 0);
  ctx.lineTo(21, 3);
  ctx.closePath();
  ctx.fill();
  
  // Core cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(5, 0, 5, 0, Math.PI * 2);
  ctx.fill();
}

// RECURSION - Self-referential serpent
function drawBasilisk(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const recurse = Math.sin(time / 100) * 3;
  
  // Coiled body segments
  ctx.fillStyle = colors.primary;
  
  // Main segment
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -4);
  ctx.lineTo(5, -5 + recurse);
  ctx.lineTo(-15, -3);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 3);
  ctx.lineTo(5, 5 - recurse);
  ctx.lineTo(28, 4);
  ctx.closePath();
  ctx.fill();
  
  // Recursive tail segments (smaller copies)
  ctx.globalAlpha = 0.7;
  ctx.save();
  ctx.translate(-22, 0);
  ctx.scale(0.6, 0.6);
  ctx.beginPath();
  ctx.moveTo(20, 0 + recurse);
  ctx.lineTo(10, -4 + recurse);
  ctx.lineTo(-10, -3);
  ctx.lineTo(-15, 0);
  ctx.lineTo(-10, 3);
  ctx.lineTo(10, 4 - recurse);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
  
  // Hood pattern
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(25, -4);
  ctx.lineTo(15, -12);
  ctx.lineTo(10, -8);
  ctx.lineTo(18, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(25, 4);
  ctx.lineTo(15, 12);
  ctx.lineTo(10, 8);
  ctx.lineTo(18, 4);
  ctx.closePath();
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(32, -2, 4, 1.5);
  ctx.fillRect(32, 0.5, 4, 1.5);
  
  drawEngine(ctx, -20, 0, colors, time, 0.7);
}

// ============= MEGA PACK FLEET - 20 VECTOR MANIAC SHIPS =============

// REGEX BLADE - Pattern-matching interceptor
function drawInterceptor(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const match = (time / 80) % 30;
  
  // Blade-like body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(30, -4);
  ctx.lineTo(0, -5);
  ctx.lineTo(-18, -3);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 3);
  ctx.lineTo(0, 5);
  ctx.lineTo(30, 4);
  ctx.closePath();
  ctx.fill();
  
  // Regex pattern lines
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 2]);
  ctx.beginPath();
  ctx.moveTo(-15 + match, -3);
  ctx.lineTo(25 + match, -3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-15 + match, 3);
  ctx.lineTo(25 + match, 3);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Match indicator wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-10, -14);
  ctx.lineTo(-18, -10);
  ctx.lineTo(-12, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(-10, 14);
  ctx.lineTo(-18, 10);
  ctx.lineTo(-12, 3);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(32, -2, 8, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// CHROME CAST - Reflective mirror-hull
function drawValkyrie(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const reflect = Math.sin(time / 100) * 0.3 + 0.7;
  
  // Chrome body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(32, -5);
  ctx.lineTo(5, -6);
  ctx.lineTo(-15, -4);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 4);
  ctx.lineTo(5, 6);
  ctx.lineTo(32, 5);
  ctx.closePath();
  ctx.fill();
  
  // Reflection lines
  ctx.strokeStyle = `rgba(187, 255, 204, ${reflect})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-10 + i * 12, -5);
    ctx.lineTo(-5 + i * 12, 5);
    ctx.stroke();
  }
  
  // Cast wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.lineTo(-5, -16);
  ctx.lineTo(-15, -12);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.lineTo(-5, 16);
  ctx.lineTo(-15, 12);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(34, -2, 6, 4);
  
  drawEngine(ctx, -20, 0, colors, time);
}

// ERROR STATE - Critical-path hunter
function drawCrimson(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const error = Math.sin(time / 60) * 0.4 + 0.6;
  
  // Angular error body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -6);
  ctx.lineTo(5, -7);
  ctx.lineTo(-18, -5);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 5);
  ctx.lineTo(5, 7);
  ctx.lineTo(28, 6);
  ctx.closePath();
  ctx.fill();
  
  // Error indicator (flashing)
  ctx.fillStyle = `rgba(255, 100, 100, ${error})`;
  ctx.fillRect(10, -3, 6, 6);
  
  // Dual engine pods
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-18, -10, 18, 4);
  ctx.fillRect(-18, 6, 18, 4);
  
  // Fault lines
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-15, -8);
  ctx.lineTo(-2, -8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-15, 8);
  ctx.lineTo(-2, 8);
  ctx.stroke();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(28, -2, 8, 4);
  
  drawEngine(ctx, -18, -8, colors, time, 0.6);
  drawEngine(ctx, -18, 8, colors, time, 0.6);
}

// WIDE CAST - Broadcast-class expanded range
function drawGoldwing(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const broadcast = (time / 150) % 20;
  
  // Wide broadcast hull
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(32, 0);
  ctx.lineTo(25, -8);
  ctx.lineTo(0, -10);
  ctx.lineTo(-18, -8);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-18, 8);
  ctx.lineTo(0, 10);
  ctx.lineTo(25, 8);
  ctx.closePath();
  ctx.fill();
  
  // Broadcast wave rings
  ctx.strokeStyle = colors.glow + '44';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const r = 8 + i * 6 + broadcast;
    ctx.beginPath();
    ctx.arc(0, 0, r, -0.5, 0.5);
    ctx.stroke();
  }
  
  // Signal panels
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-15, -9, 25, 3);
  ctx.fillRect(-15, 6, 25, 3);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(22, -3, 8, 6);
  
  drawEngine(ctx, -25, 0, colors, time, 1.2);
}

// STREAM LINE - Flow-optimized fighter
function drawCobalt(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const flow = (time / 60) % 50;
  
  // Streamlined body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(45, 0);
  ctx.lineTo(35, -4);
  ctx.lineTo(5, -5);
  ctx.lineTo(-18, -3);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 3);
  ctx.lineTo(5, 5);
  ctx.lineTo(35, 4);
  ctx.closePath();
  ctx.fill();
  
  // Flow stream lines
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const offset = (flow + i * 15) % 50;
    ctx.beginPath();
    ctx.moveTo(-20 + offset, -2 - i);
    ctx.lineTo(-10 + offset, -2 - i);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-20 + offset, 2 + i);
    ctx.lineTo(-10 + offset, 2 + i);
    ctx.stroke();
  }
  
  // Dorsal stabilizer
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-8, -12);
  ctx.lineTo(-15, -8);
  ctx.lineTo(-10, -3);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(36, -2, 7, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// HARD CACHE - Persistent shield frigate
function drawIronclad(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const cache = Math.sin(time / 150) * 0.2 + 0.8;
  
  // Blocky armored hull
  ctx.fillStyle = colors.primary;
  ctx.fillRect(-22, -7, 52, 14);
  
  // Cache blocks
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-18, -6, 10, 5);
  ctx.fillRect(-18, 1, 10, 5);
  ctx.fillRect(-5, -6, 10, 5);
  ctx.fillRect(-5, 1, 10, 5);
  ctx.fillRect(8, -6, 10, 5);
  ctx.fillRect(8, 1, 10, 5);
  
  // Cache status lights
  ctx.fillStyle = `rgba(170, 255, 187, ${cache})`;
  ctx.fillRect(-15, -4, 2, 2);
  ctx.fillRect(-2, -4, 2, 2);
  ctx.fillRect(11, -4, 2, 2);
  
  // Command viewport
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(22, -3, 8, 6);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// QUICK SORT - Priority targeting interceptor
function drawRedtail(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  // Slim quick body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(32, -4);
  ctx.lineTo(5, -5);
  ctx.lineTo(-18, -3);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 3);
  ctx.lineTo(5, 5);
  ctx.lineTo(32, 4);
  ctx.closePath();
  ctx.fill();
  
  // Sort indicator bars (descending)
  ctx.fillStyle = colors.accent;
  ctx.fillRect(20, -3, 8, 2);
  ctx.fillRect(20, 1, 6, 2);
  ctx.fillRect(8, -3, 6, 2);
  ctx.fillRect(8, 1, 4, 2);
  
  // Priority tail fins
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-10, -3);
  ctx.lineTo(-18, -11);
  ctx.lineTo(-22, -8);
  ctx.lineTo(-15, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-10, 3);
  ctx.lineTo(-18, 11);
  ctx.lineTo(-22, 8);
  ctx.lineTo(-15, 3);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(34, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// BURST MODE - Overclock explosive attacker
function drawSunburst(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const burst = Math.sin(time / 50) * 0.4 + 0.6;
  
  // Central core body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -6);
  ctx.lineTo(5, -8);
  ctx.lineTo(-15, -6);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 6);
  ctx.lineTo(5, 8);
  ctx.lineTo(28, 6);
  ctx.closePath();
  ctx.fill();
  
  // Burst rays
  ctx.fillStyle = colors.secondary;
  for (let i = 0; i < 4; i++) {
    const angle = (i - 1.5) * 0.5;
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(angle);
    ctx.fillRect(-18, -2, 12, 3);
    ctx.restore();
  }
  
  // Overclock core (pulsing)
  ctx.fillStyle = `rgba(187, 255, 187, ${burst})`;
  ctx.beginPath();
  ctx.arc(10, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(28, -2, 8, 4);
  
  drawEngine(ctx, -20, 0, colors, time);
}

// PACK HUNTER - Swarm-class fighter
function drawSteelwolf(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const hunt = Math.sin(time / 80) * 2;
  
  // Wolf pack body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(30, -5);
  ctx.lineTo(5, -6);
  ctx.lineTo(-18, -4);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 4);
  ctx.lineTo(5, 6);
  ctx.lineTo(30, 5);
  ctx.closePath();
  ctx.fill();
  
  // Ear-like hunter fins
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(15, -6);
  ctx.lineTo(5, -15 + hunt);
  ctx.lineTo(-5, -11 + hunt);
  ctx.lineTo(5, -6);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(15, 6);
  ctx.lineTo(5, 15 - hunt);
  ctx.lineTo(-5, 11 - hunt);
  ctx.lineTo(5, 6);
  ctx.closePath();
  ctx.fill();
  
  // Pack indicator lights
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(3, -13 + hunt, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3, 13 - hunt, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(32, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// PHASE SHIFT - Dimensional warp racer
function drawBlueshift(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const phase = Math.sin(time / 100) * 0.3 + 0.7;
  
  // Aerodynamic phase body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(48, 0);
  ctx.lineTo(38, -4);
  ctx.lineTo(5, -5);
  ctx.lineTo(-20, -3);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 3);
  ctx.lineTo(5, 5);
  ctx.lineTo(38, 4);
  ctx.closePath();
  ctx.fill();
  
  // Phase shift ghost trail
  ctx.globalAlpha = 0.3 * phase;
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(30, -3);
  ctx.lineTo(-10, -4);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-10, 4);
  ctx.lineTo(30, 3);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Speed wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-10, -13);
  ctx.lineTo(-18, -10);
  ctx.lineTo(-10, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(-10, 13);
  ctx.lineTo(-18, 10);
  ctx.lineTo(-10, 3);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(40, -2, 6, 4);
  
  drawEngine(ctx, -25, 0, colors, time);
}

// POWER SURGE - Voltage core cruiser
function drawThunderbolt(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const surge = Math.sin(time / 60) * 0.4 + 0.6;
  
  // Massive cruiser hull
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(28, -9);
  ctx.lineTo(0, -11);
  ctx.lineTo(-22, -8);
  ctx.lineTo(-28, 0);
  ctx.lineTo(-22, 8);
  ctx.lineTo(0, 11);
  ctx.lineTo(28, 9);
  ctx.closePath();
  ctx.fill();
  
  // Power core
  ctx.fillStyle = `rgba(136, 255, 170, ${surge})`;
  ctx.beginPath();
  ctx.arc(5, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Voltage lines
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, -6);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-20, 6);
  ctx.stroke();
  
  // Weapon pods
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-15, -13, 18, 4);
  ctx.fillRect(-15, 9, 18, 4);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(25, -3, 8, 6);
  
  drawEngine(ctx, -28, 0, colors, time, 1.3);
}

// INJECT POINT - Penetration stinger
function drawYellowjacket(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const inject = Math.sin(time / 50) * 1;
  
  // Injection body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(32, -4);
  ctx.lineTo(5, -5);
  ctx.lineTo(-18, -4);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 4);
  ctx.lineTo(5, 5);
  ctx.lineTo(32, 4);
  ctx.closePath();
  ctx.fill();
  
  // Inject stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(15, -4, 5, 8);
  ctx.fillRect(5, -4, 4, 8);
  ctx.fillRect(-5, -4, 4, 8);
  
  // Stinger wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(8, -5);
  ctx.lineTo(-5, -14 + inject);
  ctx.lineTo(-15, -10 + inject);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(8, 5);
  ctx.lineTo(-5, 14 - inject);
  ctx.lineTo(-15, 10 - inject);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  
  // Injection needle
  ctx.fillStyle = colors.glow;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(50, 0);
  ctx.lineTo(42, -1);
  ctx.closePath();
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// TRACE LOG - Deep-scan scout
function drawSilverfox(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const trace = (time / 100) % 40;
  
  // Elegant scout body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(30, -5);
  ctx.lineTo(5, -6);
  ctx.lineTo(-18, -4);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 4);
  ctx.lineTo(5, 6);
  ctx.lineTo(30, 5);
  ctx.closePath();
  ctx.fill();
  
  // Trace scan lines
  ctx.strokeStyle = colors.accent + '88';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const x = -15 + ((trace + i * 8) % 40);
    ctx.beginPath();
    ctx.moveTo(x, -4);
    ctx.lineTo(x, 4);
    ctx.stroke();
  }
  
  // Sensor wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.lineTo(-5, -14);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.lineTo(-5, 14);
  ctx.lineTo(-15, 10);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(32, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// CORE MELT - Fusion thermal attacker
function drawFirebird(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const melt = Math.sin(time / 60) * 0.3 + 0.7;
  
  // Angular melt body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -6);
  ctx.lineTo(5, -7);
  ctx.lineTo(-18, -5);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 5);
  ctx.lineTo(5, 7);
  ctx.lineTo(28, 6);
  ctx.closePath();
  ctx.fill();
  
  // Core melt center (pulsing)
  ctx.fillStyle = `rgba(170, 255, 221, ${melt})`;
  ctx.beginPath();
  ctx.arc(8, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  
  // Heat wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -7);
  ctx.lineTo(-10, -16);
  ctx.lineTo(-20, -12);
  ctx.lineTo(-12, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 7);
  ctx.lineTo(-10, 16);
  ctx.lineTo(-20, 12);
  ctx.lineTo(-12, 5);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(30, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// COLD BOOT - Freeze protocol fighter
function drawArctic(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const cold = Math.sin(time / 120) * 0.2 + 0.8;
  
  // Crystal-like body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(30, -5);
  ctx.lineTo(10, -6);
  ctx.lineTo(-15, -5);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 5);
  ctx.lineTo(10, 6);
  ctx.lineTo(30, 5);
  ctx.closePath();
  ctx.fill();
  
  // Ice crystal pattern
  ctx.strokeStyle = `rgba(204, 255, 238, ${cold})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(5, -4);
  ctx.lineTo(-5, 0);
  ctx.lineTo(5, 4);
  ctx.closePath();
  ctx.stroke();
  
  // Cold wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(-10, -14);
  ctx.lineTo(-18, -10);
  ctx.lineTo(-10, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 6);
  ctx.lineTo(-10, 14);
  ctx.lineTo(-18, 10);
  ctx.lineTo(-10, 5);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(32, -2, 6, 4);
  
  drawEngine(ctx, -20, 0, colors, time);
}

// ROOT ACCESS - Admin command vessel
function drawCommander(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const access = Math.sin(time / 100) * 0.3 + 0.7;
  
  // Command vessel hull
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(28, -7);
  ctx.lineTo(5, -8);
  ctx.lineTo(-20, -6);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 6);
  ctx.lineTo(5, 8);
  ctx.lineTo(28, 7);
  ctx.closePath();
  ctx.fill();
  
  // Root access indicator
  ctx.fillStyle = `rgba(153, 255, 204, ${access})`;
  ctx.fillRect(10, -3, 10, 6);
  
  // Command wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -8);
  ctx.lineTo(-10, -16);
  ctx.lineTo(-20, -12);
  ctx.lineTo(-15, -6);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 8);
  ctx.lineTo(-10, 16);
  ctx.lineTo(-20, 12);
  ctx.lineTo(-15, 6);
  ctx.closePath();
  ctx.fill();
  
  // Authority stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-15, -5, 20, 2);
  ctx.fillRect(-15, 3, 20, 2);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(26, -3, 8, 6);
  
  drawEngine(ctx, -25, 0, colors, time);
}

// EDGE CASE - Boundary precision duelist
function drawScarlet(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  // Precise angular body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(32, -4);
  ctx.lineTo(5, -5);
  ctx.lineTo(-18, -3);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 3);
  ctx.lineTo(5, 5);
  ctx.lineTo(32, 4);
  ctx.closePath();
  ctx.fill();
  
  // Edge markers
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(38, -3);
  ctx.lineTo(38, 3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, -3);
  ctx.lineTo(-18, 3);
  ctx.stroke();
  
  // Boundary wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -5);
  ctx.lineTo(-5, -14);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-8, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 5);
  ctx.lineTo(-5, 14);
  ctx.lineTo(-15, 10);
  ctx.lineTo(-8, 3);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(34, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// LOAD BALANCE - Distribution transport
function drawGoldenrod(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const balance = Math.sin(time / 100);
  
  // Balanced hull
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(28, -6);
  ctx.lineTo(5, -7);
  ctx.lineTo(-18, -6);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 6);
  ctx.lineTo(5, 7);
  ctx.lineTo(28, 6);
  ctx.closePath();
  ctx.fill();
  
  // Load distribution bars
  ctx.fillStyle = colors.secondary;
  const leftLoad = 4 + balance * 2;
  const rightLoad = 4 - balance * 2;
  ctx.fillRect(-10, -5, 6, leftLoad);
  ctx.fillRect(5, -5, 6, rightLoad);
  ctx.fillRect(-10, 1, 6, rightLoad);
  ctx.fillRect(5, 1, 6, leftLoad);
  
  // Balance indicator
  ctx.fillStyle = colors.accent;
  ctx.fillRect(15, -1, 8, 2);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(26, -2, 8, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// COMPILE TIME - Rapid builder
function drawBluehawk(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const compile = (time / 40) % 30;
  
  // Swift body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(32, -4);
  ctx.lineTo(5, -5);
  ctx.lineTo(-18, -3);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 3);
  ctx.lineTo(5, 5);
  ctx.lineTo(32, 4);
  ctx.closePath();
  ctx.fill();
  
  // Compile progress bar
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-15, -2, 30, 4);
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-15, -2, compile, 4);
  
  // Rapid wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -5);
  ctx.lineTo(-5, -13);
  ctx.lineTo(-15, -9);
  ctx.lineTo(-8, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 5);
  ctx.lineTo(-5, 13);
  ctx.lineTo(-15, 9);
  ctx.lineTo(-8, 3);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(34, -2, 6, 4);
  
  drawEngine(ctx, -22, 0, colors, time);
}

// KERNEL PANIC - Ultra-armored destroyer
function drawTitanium(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const panic = Math.sin(time / 50) * 0.3 + 0.7;
  
  // Massive destroyer hull
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(28, -9);
  ctx.lineTo(0, -11);
  ctx.lineTo(-22, -9);
  ctx.lineTo(-28, 0);
  ctx.lineTo(-22, 9);
  ctx.lineTo(0, 11);
  ctx.lineTo(28, 9);
  ctx.closePath();
  ctx.fill();
  
  // Panic warning (flashing)
  ctx.fillStyle = `rgba(255, 100, 100, ${panic})`;
  ctx.fillRect(10, -4, 8, 8);
  
  // Armor plating
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-20, -10, 35, 3);
  ctx.fillRect(-20, 7, 35, 3);
  ctx.fillRect(-25, -5, 5, 10);
  
  // Heavy weapon pods
  ctx.fillRect(20, -12, 8, 5);
  ctx.fillRect(20, 7, 8, 5);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(25, -3, 8, 6);
  
  drawEngine(ctx, -28, -6, colors, time, 0.7);
  drawEngine(ctx, -28, 6, colors, time, 0.7);
}

// OMEGA PRIME - Legendary Omega Pack Exclusive Ship
function drawOmegaPrime(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number, quality: 'game' | 'preview' = 'preview') {
  // Animated pulse effect - simplified in game mode
  const pulse = quality === 'preview' ? (Math.sin(time * 0.003) * 0.15 + 1) : 1;
  const goldPulse = quality === 'preview' ? (Math.sin(time * 0.005) * 0.1 + 1) : 1;
  const rotateAngle = time * 0.001;
  
  // --- OUTER ENERGY AURA --- (skip in game mode for performance)
  if (quality === 'preview') {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(time * 0.002) * 0.08;
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
    auraGrad.addColorStop(0, '#ffd700');
    auraGrad.addColorStop(0.5, '#00ff88');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 42 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // --- ROTATING HEXAGON RING --- (simplified in game mode)
  ctx.save();
  if (quality === 'preview') {
    ctx.rotate(rotateAngle);
  }
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = quality === 'preview' ? (0.6 + Math.sin(time * 0.004) * 0.2) : 0.7;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * 32;
    const y = Math.sin(angle) * 32;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  
  // --- INNER ROTATING TRIANGLE --- (skip in game mode)
  if (quality === 'preview') {
    ctx.save();
    ctx.rotate(-rotateAngle * 1.5);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * 22;
      const y = Math.sin(angle) * 22;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  
  // --- MAIN BODY - SLEEK ANGULAR DESIGN ---
  // Black core body with gold trim (solid color in game mode for performance)
  if (quality === 'preview') {
    const bodyGrad = ctx.createLinearGradient(-25, 0, 40, 0);
    bodyGrad.addColorStop(0, '#0a0a12');
    bodyGrad.addColorStop(0.3, '#1a1a2e');
    bodyGrad.addColorStop(0.7, '#0f0f1a');
    bodyGrad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = bodyGrad;
  } else {
    ctx.fillStyle = '#1a1a2e';
  }
  
  // Central fuselage - sharp angular shape
  ctx.beginPath();
  ctx.moveTo(42, 0);           // Tip
  ctx.lineTo(28, -5);
  ctx.lineTo(15, -6);
  ctx.lineTo(-5, -5);
  ctx.lineTo(-22, -3);
  ctx.lineTo(-28, 0);          // Rear
  ctx.lineTo(-22, 3);
  ctx.lineTo(-5, 5);
  ctx.lineTo(15, 6);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Gold trim outline
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.9;
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // --- SWEPT WINGS --- (solid color in game mode)
  // Upper wing
  if (quality === 'preview') {
    const wingGrad = ctx.createLinearGradient(-15, -8, -15, -20);
    wingGrad.addColorStop(0, '#1a1a2e');
    wingGrad.addColorStop(0.5, '#0a0a12');
    wingGrad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = wingGrad;
  } else {
    ctx.fillStyle = '#0f0f1a';
  }
  
  ctx.beginPath();
  ctx.moveTo(10, -6);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-25, -18);
  ctx.lineTo(-30, -16);
  ctx.lineTo(-20, -6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Lower wing
  ctx.beginPath();
  ctx.moveTo(10, 6);
  ctx.lineTo(-8, 8);
  ctx.lineTo(-25, 18);
  ctx.lineTo(-30, 16);
  ctx.lineTo(-20, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // --- WING TIP ENERGY NODES --- (simplified in game mode)
  // Upper node
  ctx.fillStyle = colors.accent;
  ctx.globalAlpha = quality === 'preview' ? (0.7 + Math.sin(time * 0.006) * 0.3) : 0.8;
  ctx.beginPath();
  ctx.arc(-27, -17, 3 * goldPulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Lower node
  ctx.beginPath();
  ctx.arc(-27, 17, 3 * goldPulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // --- GOLD ACCENT LINES ---
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;
  
  // Central gold stripe
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(-20, 0);
  ctx.stroke();
  
  // Upper accent
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(25, -3);
  ctx.lineTo(5, -4);
  ctx.lineTo(-10, -3);
  ctx.stroke();
  
  // Lower accent
  ctx.beginPath();
  ctx.moveTo(25, 3);
  ctx.lineTo(5, 4);
  ctx.lineTo(-10, 3);
  ctx.stroke();
  ctx.globalAlpha = 1;
  
  // --- OMEGA SYMBOL COCKPIT --- (simplified gradient in game mode)
  if (quality === 'preview') {
    const cockpitGrad = ctx.createRadialGradient(25, 0, 0, 25, 0, 8);
    cockpitGrad.addColorStop(0, '#ffffff');
    cockpitGrad.addColorStop(0.3, '#ffd700');
    cockpitGrad.addColorStop(0.7, '#ffaa00');
    cockpitGrad.addColorStop(1, '#cc8800');
    ctx.fillStyle = cockpitGrad;
  } else {
    ctx.fillStyle = '#ffd700';
  }
  
  // Hexagonal cockpit shape
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = 25 + Math.cos(angle) * 5;
    const y = Math.sin(angle) * 4;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  
  // Cockpit inner glow (only in preview mode)
  if (quality === 'preview') {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6 + Math.sin(time * 0.008) * 0.3;
    ctx.beginPath();
    ctx.arc(25, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  // --- FORWARD WEAPON PRONGS ---
  ctx.fillStyle = '#1a1a2e';
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  
  // Upper prong
  ctx.beginPath();
  ctx.moveTo(30, -4);
  ctx.lineTo(38, -6);
  ctx.lineTo(44, -4);
  ctx.lineTo(38, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Lower prong
  ctx.beginPath();
  ctx.moveTo(30, 4);
  ctx.lineTo(38, 6);
  ctx.lineTo(44, 4);
  ctx.lineTo(38, 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Prong tips glow (simplified in game mode)
  ctx.fillStyle = colors.accent;
  ctx.globalAlpha = quality === 'preview' ? (0.8 + Math.sin(time * 0.007) * 0.2) : 0.9;
  ctx.beginPath();
  ctx.arc(43, -4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(43, 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // --- DUAL ENGINES --- (use simplified version in game mode)
  drawOmegaEngine(ctx, -26, -8, colors, time, quality);
  drawOmegaEngine(ctx, -26, 8, colors, time, quality);
  
  // --- CENTRAL REAR THRUSTER --- (simplified in game mode)
  if (quality === 'preview') {
    const thrusterGrad = ctx.createLinearGradient(-28, 0, -45, 0);
    thrusterGrad.addColorStop(0, '#ffffff');
    thrusterGrad.addColorStop(0.15, '#ffd700');
    thrusterGrad.addColorStop(0.4, colors.accent);
    thrusterGrad.addColorStop(0.7, '#00aa55');
    thrusterGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = thrusterGrad;
  } else {
    ctx.fillStyle = colors.accent;
  }
  
  const exhaustLen = quality === 'preview' ? (20 + Math.sin(time * 0.01) * 5) : 22;
  ctx.beginPath();
  ctx.moveTo(-28, -2);
  ctx.quadraticCurveTo(-35, -3, -28 - exhaustLen, 0);
  ctx.quadraticCurveTo(-35, 3, -28, 2);
  ctx.closePath();
  ctx.fill();
  
  // --- PARTICLE TRAIL SPARKS --- (only in preview mode)
  if (quality === 'preview') {
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) {
      const sparkX = -30 - i * 6 - Math.random() * 4;
      const sparkY = (Math.random() - 0.5) * 8;
      const sparkSize = 1 + Math.random() * 1.5;
      ctx.fillStyle = i % 2 === 0 ? '#ffd700' : colors.accent;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// Helper: Omega Prime engine exhaust (with quality param)
function drawOmegaEngine(ctx: CanvasRenderingContext2D, x: number, y: number, colors: typeof SHIP_MODELS[0]['colors'], time: number, quality: 'game' | 'preview' = 'preview') {
  const exhaustLen = quality === 'preview' ? (12 + Math.sin(time * 0.012 + y) * 4) : 14;
  
  // Engine housing
  ctx.fillStyle = '#0a0a12';
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x + 2, y, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Exhaust flame (simplified in game mode - no gradient)
  if (quality === 'preview') {
    const flameGrad = ctx.createLinearGradient(x, y, x - exhaustLen, y);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.2, '#ffd700');
    flameGrad.addColorStop(0.5, colors.accent);
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;
  } else {
    ctx.fillStyle = colors.accent;
  }
  
  ctx.beginPath();
  ctx.moveTo(x, y - 2);
  ctx.quadraticCurveTo(x - exhaustLen * 0.5, y - 2.5, x - exhaustLen, y);
  ctx.quadraticCurveTo(x - exhaustLen * 0.5, y + 2.5, x, y + 2);
  ctx.closePath();
  ctx.fill();
  
  // Inner core (only in preview mode)
  if (quality === 'preview') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x, y - 1);
    ctx.lineTo(x - exhaustLen * 0.35, y);
    ctx.lineTo(x, y + 1);
    ctx.closePath();
    ctx.fill();
  }
}

// Helper: Draw engine exhaust
function drawEngine(ctx: CanvasRenderingContext2D, x: number, y: number, colors: typeof SHIP_MODELS[0]['colors'], time: number, scale: number = 1) {
  const exhaustLen = (15 + Math.random() * 10) * scale;
  
  // Engine nozzle
  ctx.fillStyle = '#333344';
  ctx.fillRect(x, y - 3 * scale, 4 * scale, 6 * scale);
  
  // Flame gradient
  const flameGrad = ctx.createLinearGradient(x, y, x - exhaustLen, y);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.1, '#ffff88');
  flameGrad.addColorStop(0.3, colors.glow);
  flameGrad.addColorStop(0.6, colors.accent);
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  
  ctx.beginPath();
  ctx.moveTo(x, y - 2.5 * scale);
  ctx.quadraticCurveTo(x - exhaustLen * 0.6, y - 3 * scale, x - exhaustLen, y);
  ctx.quadraticCurveTo(x - exhaustLen * 0.6, y + 3 * scale, x, y + 2.5 * scale);
  ctx.closePath();
  ctx.fill();
  
  // Inner core
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(x, y - 1 * scale);
  ctx.lineTo(x - exhaustLen * 0.4, y);
  ctx.lineTo(x, y + 1 * scale);
  ctx.closePath();
  ctx.fill();
}

// ============= ARENA EXCLUSIVE SHIPS =============

// HEX PHANTOM - Hexagonal stealth fighter with phase-shift core
function drawHexPhantom(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const pulse = Math.sin(time / 200) * 0.3 + 0.7;
  
  // Hexagonal main body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);           // Front point
  ctx.lineTo(20, -8);
  ctx.lineTo(-5, -10);
  ctx.lineTo(-20, -6);
  ctx.lineTo(-20, 6);
  ctx.lineTo(-5, 10);
  ctx.lineTo(20, 8);
  ctx.closePath();
  ctx.fill();
  
  // Inner hexagonal core (phase-shift)
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(10, -5);
  ctx.lineTo(-5, -6);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-5, 6);
  ctx.lineTo(10, 5);
  ctx.closePath();
  ctx.fill();
  
  // Hexagonal wings
  ctx.fillStyle = colors.accent;
  // Top hex wing
  ctx.beginPath();
  ctx.moveTo(5, -10);
  ctx.lineTo(-10, -18);
  ctx.lineTo(-18, -15);
  ctx.lineTo(-15, -10);
  ctx.closePath();
  ctx.fill();
  
  // Bottom hex wing
  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(-10, 18);
  ctx.lineTo(-18, 15);
  ctx.lineTo(-15, 10);
  ctx.closePath();
  ctx.fill();
  
  // Phase-shift glow core
  ctx.fillStyle = `rgba(0, 255, 170, ${0.5 * pulse})`;
  ctx.beginPath();
  ctx.arc(5, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit
  const cockpitGrad = ctx.createRadialGradient(25, 0, 0, 25, 0, 5);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.5, colors.cockpit);
  cockpitGrad.addColorStop(1, colors.glow);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.arc(25, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine
  drawEngine(ctx, -20, 0, colors, time);
}

// PULSE WRAITH - Spectral attacker with pulsing energy wings
function drawPulseWraith(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const pulse = Math.sin(time / 150) * 0.4 + 0.6;
  const wingFlicker = Math.sin(time / 80) * 0.2 + 0.8;
  
  // Ghostly body (thin, elongated)
  const bodyGrad = ctx.createLinearGradient(-25, 0, 35, 0);
  bodyGrad.addColorStop(0, 'rgba(136, 255, 0, 0.6)');
  bodyGrad.addColorStop(0.5, colors.primary);
  bodyGrad.addColorStop(1, 'rgba(136, 255, 0, 0.8)');
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  ctx.moveTo(40, 0);           // Sharp spectral nose
  ctx.lineTo(25, -3);
  ctx.lineTo(5, -4);
  ctx.lineTo(-20, -3);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 3);
  ctx.lineTo(5, 4);
  ctx.lineTo(25, 3);
  ctx.closePath();
  ctx.fill();
  
  // Energy wings (pulsing)
  ctx.fillStyle = `rgba(136, 255, 0, ${0.6 * wingFlicker})`;
  // Top energy wing
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.quadraticCurveTo(0, -15, -15, -20);
  ctx.lineTo(-20, -15);
  ctx.quadraticCurveTo(-5, -10, 0, -4);
  ctx.closePath();
  ctx.fill();
  
  // Bottom energy wing
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.quadraticCurveTo(0, 15, -15, 20);
  ctx.lineTo(-20, 15);
  ctx.quadraticCurveTo(-5, 10, 0, 4);
  ctx.closePath();
  ctx.fill();
  
  // Wing energy lines
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.lineTo(-12, -16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, 6);
  ctx.lineTo(-12, 16);
  ctx.stroke();
  
  // Central pulse core
  ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse})`;
  ctx.beginPath();
  ctx.arc(10, 0, 5 * pulse, 0, Math.PI * 2);
  ctx.fill();
  
  // Spectral cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(30, 0, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine
  drawEngine(ctx, -25, 0, colors, time);
}

// GRID REAPER - Angular death machine from the data void
function drawGridReaper(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const pulse = Math.sin(time / 100) * 0.2 + 0.8;
  
  // Angular aggressive body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(38, 0);           // Sharp reaper nose
  ctx.lineTo(28, -5);
  ctx.lineTo(15, -7);
  ctx.lineTo(-10, -8);
  ctx.lineTo(-22, -5);
  ctx.lineTo(-22, 5);
  ctx.lineTo(-10, 8);
  ctx.lineTo(15, 7);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Death scythe wings (angular, aggressive)
  ctx.fillStyle = colors.secondary;
  // Top scythe
  ctx.beginPath();
  ctx.moveTo(15, -7);
  ctx.lineTo(5, -12);
  ctx.lineTo(-15, -22);
  ctx.lineTo(-20, -18);
  ctx.lineTo(-8, -10);
  ctx.closePath();
  ctx.fill();
  
  // Bottom scythe
  ctx.beginPath();
  ctx.moveTo(15, 7);
  ctx.lineTo(5, 12);
  ctx.lineTo(-15, 22);
  ctx.lineTo(-20, 18);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();
  
  // Red accent lines (death markers)
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, -3);
  ctx.lineTo(10, -3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(30, 3);
  ctx.lineTo(10, 3);
  ctx.stroke();
  
  // Scythe tips (glowing)
  ctx.fillStyle = `rgba(255, 68, 68, ${pulse})`;
  ctx.beginPath();
  ctx.arc(-17, -20, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-17, 20, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Reaper eye cockpit (red glow)
  const cockpitGrad = ctx.createRadialGradient(28, 0, 0, 28, 0, 5);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.4, '#ff4444');
  cockpitGrad.addColorStop(1, colors.secondary);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.arc(28, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Dual engines
  drawEngine(ctx, -22, -3, colors, time, 0.7);
  drawEngine(ctx, -22, 3, colors, time, 0.7);
}

// NULL STRIKER - Zero-point energy fighter with dual cores
function drawNullStriker(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const pulse1 = Math.sin(time / 120) * 0.3 + 0.7;
  const pulse2 = Math.sin(time / 120 + Math.PI) * 0.3 + 0.7;
  const rotate = time / 500;
  
  // Sleek main body
  const bodyGrad = ctx.createLinearGradient(-20, 0, 35, 0);
  bodyGrad.addColorStop(0, colors.secondary);
  bodyGrad.addColorStop(0.5, colors.primary);
  bodyGrad.addColorStop(1, colors.secondary);
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  ctx.moveTo(36, 0);           // Pointed nose
  ctx.lineTo(25, -4);
  ctx.lineTo(10, -5);
  ctx.lineTo(-15, -4);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 4);
  ctx.lineTo(10, 5);
  ctx.lineTo(25, 4);
  ctx.closePath();
  ctx.fill();
  
  // Split wings (Y-shape)
  ctx.fillStyle = colors.accent;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-5, -8);
  ctx.lineTo(-18, -16);
  ctx.lineTo(-15, -12);
  ctx.lineTo(-8, -5);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(-5, 8);
  ctx.lineTo(-18, 16);
  ctx.lineTo(-15, 12);
  ctx.lineTo(-8, 5);
  ctx.closePath();
  ctx.fill();
  
  // Dual zero-point cores (rotating rings)
  ctx.save();
  ctx.translate(0, -8);
  ctx.rotate(rotate);
  ctx.strokeStyle = `rgba(255, 0, 255, ${pulse1})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(0, 255, 255, ${pulse1})`;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.save();
  ctx.translate(0, 8);
  ctx.rotate(-rotate);
  ctx.strokeStyle = `rgba(0, 255, 255, ${pulse2})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 0, 255, ${pulse2})`;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Cyan cockpit
  const cockpitGrad = ctx.createRadialGradient(28, 0, 0, 28, 0, 4);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.5, '#00ffff');
  cockpitGrad.addColorStop(1, colors.primary);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(28, 0, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine
  drawEngine(ctx, -20, 0, colors, time);
}

// Get model by ID
export function getShipModel(id: string): ShipModel {
  return SHIP_MODELS.find(m => m.id === id) || SHIP_MODELS[0];
}

// Storage key for active ship model
const ACTIVE_MODEL_KEY = 'vector_maniac_ship_model';

export function getActiveShipModelId(): string {
  try {
    return localStorage.getItem(ACTIVE_MODEL_KEY) || 'default';
  } catch {
    return 'default';
  }
}

export function setActiveShipModelId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_MODEL_KEY, id);
  } catch (e) {
    console.error('Failed to save ship model:', e);
  }
}
