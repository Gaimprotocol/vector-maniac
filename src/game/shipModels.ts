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

// 20 Unique Ship Models
export const SHIP_MODELS: ShipModel[] = [
  {
    id: 'default',
    name: 'FALCON',
    description: 'Klassiskt stridsskepp med balanserad design',
    colors: { primary: '#ffffff', secondary: '#cccccc', accent: '#ffaa00', glow: '#00ddff', cockpit: '#00ddff' }
  },
  {
    id: 'viper',
    name: 'VIPER',
    description: 'Smal och snabb med dubbla vingar',
    colors: { primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560', glow: '#e94560', cockpit: '#ff4488' }
  },
  {
    id: 'phantom',
    name: 'PHANTOM',
    description: 'Stealth-design med vinklade ytor',
    colors: { primary: '#2d2d44', secondary: '#1a1a2a', accent: '#8844ff', glow: '#aa66ff', cockpit: '#cc88ff' }
  },
  {
    id: 'hammer',
    name: 'HAMMER',
    description: 'Tung attackare med bred front',
    colors: { primary: '#4a3728', secondary: '#2d1f15', accent: '#ff8844', glow: '#ffaa00', cockpit: '#ffdd00' }
  },
  {
    id: 'needle',
    name: 'NEEDLE',
    description: 'Ultratunn interceptor för max hastighet',
    colors: { primary: '#88ddff', secondary: '#44aacc', accent: '#ffffff', glow: '#88ffff', cockpit: '#ffffff' }
  },
  {
    id: 'trident',
    name: 'TRIDENT',
    description: 'Tre-spetsad design med bred eldkraft',
    colors: { primary: '#225522', secondary: '#113311', accent: '#44ff44', glow: '#00ff88', cockpit: '#88ff88' }
  },
  {
    id: 'mantis',
    name: 'MANTIS',
    description: 'Insektliknande med böjda vingar',
    colors: { primary: '#44aa44', secondary: '#226622', accent: '#ccff44', glow: '#88ff00', cockpit: '#ffff00' }
  },
  {
    id: 'scorpion',
    name: 'SCORPION',
    description: 'Krokig design med svanskanon',
    colors: { primary: '#553322', secondary: '#331100', accent: '#ff4400', glow: '#ff6600', cockpit: '#ffaa00' }
  },
  {
    id: 'delta',
    name: 'DELTA',
    description: 'Triangulär stealth-fighter',
    colors: { primary: '#333355', secondary: '#222244', accent: '#6666ff', glow: '#4444ff', cockpit: '#8888ff' }
  },
  {
    id: 'stingray',
    name: 'STINGRAY',
    description: 'Platt undervattensdesign',
    colors: { primary: '#224488', secondary: '#112244', accent: '#44aaff', glow: '#00aaff', cockpit: '#88ddff' }
  },
  {
    id: 'phoenix',
    name: 'PHOENIX',
    description: 'Eldvingar med dramatisk silhuett',
    colors: { primary: '#ff4400', secondary: '#aa2200', accent: '#ffff00', glow: '#ff8800', cockpit: '#ffffff' }
  },
  {
    id: 'shark',
    name: 'SHARK',
    description: 'Aggressiv hajdesign med fenor',
    colors: { primary: '#445566', secondary: '#223344', accent: '#88aacc', glow: '#aaccff', cockpit: '#ffffff' }
  },
  {
    id: 'wasp',
    name: 'WASP',
    description: 'Smal kropp med vassa vingar',
    colors: { primary: '#ffcc00', secondary: '#aa8800', accent: '#222222', glow: '#ffff00', cockpit: '#ff4400' }
  },
  {
    id: 'corsair',
    name: 'CORSAIR',
    description: 'Piratdesign med assymetriska vingar',
    colors: { primary: '#442222', secondary: '#221111', accent: '#cc0000', glow: '#ff4444', cockpit: '#ffaa00' }
  },
  {
    id: 'specter',
    name: 'SPECTER',
    description: 'Spöklik med genomskinliga element',
    colors: { primary: '#aaaacc', secondary: '#888899', accent: '#ffffff', glow: '#ccccff', cockpit: '#eeeeff' }
  },
  {
    id: 'raptor',
    name: 'RAPTOR',
    description: 'Rovfågelsdesign med klor',
    colors: { primary: '#554433', secondary: '#332211', accent: '#ffaa44', glow: '#ffcc00', cockpit: '#ff8800' }
  },
  {
    id: 'aurora',
    name: 'AURORA',
    description: 'Elegant kurvor med norrsken',
    colors: { primary: '#44ddaa', secondary: '#228866', accent: '#ff88ff', glow: '#88ffcc', cockpit: '#ffffff' }
  },
  {
    id: 'gladiator',
    name: 'GLADIATOR',
    description: 'Massiv pansrad stridsvagn',
    colors: { primary: '#666666', secondary: '#444444', accent: '#ffcc00', glow: '#ffffff', cockpit: '#ff4444' }
  },
  {
    id: 'eclipse',
    name: 'ECLIPSE',
    description: 'Cirkulär design med månring',
    colors: { primary: '#111122', secondary: '#000011', accent: '#8888ff', glow: '#aaaaff', cockpit: '#ffffff' }
  },
  {
    id: 'basilisk',
    name: 'BASILISK',
    description: 'Ormliknande med böjd kropp',
    colors: { primary: '#446644', secondary: '#224422', accent: '#88ff88', glow: '#44ff44', cockpit: '#ffff00' }
  },
  // ============= 20 NEW RETRO SCI-FI SHIPS =============
  {
    id: 'interceptor',
    name: 'INTERCEPTOR',
    description: 'Klassisk blå stridsmaskin med röda detaljer',
    colors: { primary: '#2255aa', secondary: '#1a3d7a', accent: '#cc3333', glow: '#4488ff', cockpit: '#88ccff' }
  },
  {
    id: 'valkyrie',
    name: 'VALKYRIE',
    description: 'Silvrig attackare med skarpa vingar',
    colors: { primary: '#aabbcc', secondary: '#778899', accent: '#cc4444', glow: '#ffffff', cockpit: '#44aaff' }
  },
  {
    id: 'crimson',
    name: 'CRIMSON HAWK',
    description: 'Röd jagare med dubbla motorer',
    colors: { primary: '#aa2222', secondary: '#661111', accent: '#ffcc00', glow: '#ff4444', cockpit: '#ffffff' }
  },
  {
    id: 'goldwing',
    name: 'GOLDWING',
    description: 'Gyllene tungt skepp med bred profil',
    colors: { primary: '#cc9933', secondary: '#997722', accent: '#ffffff', glow: '#ffdd44', cockpit: '#88ccff' }
  },
  {
    id: 'cobalt',
    name: 'COBALT STRIKER',
    description: 'Strömlinjeformad blå fighter',
    colors: { primary: '#3366cc', secondary: '#224488', accent: '#ffffff', glow: '#66aaff', cockpit: '#aaddff' }
  },
  {
    id: 'ironclad',
    name: 'IRONCLAD',
    description: 'Pansrad grå fregattskepp',
    colors: { primary: '#667788', secondary: '#445566', accent: '#ffaa33', glow: '#aabbcc', cockpit: '#44aaff' }
  },
  {
    id: 'redtail',
    name: 'REDTAIL',
    description: 'Snabb röd interceptor med gul markering',
    colors: { primary: '#cc4422', secondary: '#882211', accent: '#ffcc22', glow: '#ff6644', cockpit: '#ffffff' }
  },
  {
    id: 'sunburst',
    name: 'SUNBURST',
    description: 'Gul attackare med solmönster',
    colors: { primary: '#ddaa22', secondary: '#aa7711', accent: '#ff4400', glow: '#ffcc44', cockpit: '#ffffff' }
  },
  {
    id: 'steelwolf',
    name: 'STEEL WOLF',
    description: 'Aggressiv grå jaktmaskin',
    colors: { primary: '#889999', secondary: '#556666', accent: '#33aacc', glow: '#aaccdd', cockpit: '#66ddff' }
  },
  {
    id: 'blueshift',
    name: 'BLUESHIFT',
    description: 'Aerodynamisk blå racer',
    colors: { primary: '#4477cc', secondary: '#2255aa', accent: '#ff6633', glow: '#66aaff', cockpit: '#ccddff' }
  },
  {
    id: 'thunderbolt',
    name: 'THUNDERBOLT',
    description: 'Massiv röd-silver stridskryssare',
    colors: { primary: '#bb4433', secondary: '#882222', accent: '#cccccc', glow: '#ff6655', cockpit: '#88ddff' }
  },
  {
    id: 'yellowjacket',
    name: 'YELLOW JACKET',
    description: 'Smidig gul-svart fighter',
    colors: { primary: '#ccaa22', secondary: '#aa8811', accent: '#222222', glow: '#ffdd44', cockpit: '#ffffff' }
  },
  {
    id: 'silverfox',
    name: 'SILVER FOX',
    description: 'Elegant silver-blå spanare',
    colors: { primary: '#99aabc', secondary: '#667788', accent: '#4488cc', glow: '#ccddee', cockpit: '#88ccff' }
  },
  {
    id: 'firebird',
    name: 'FIREBIRD',
    description: 'Eldröd med orange flammor',
    colors: { primary: '#dd3311', secondary: '#aa2211', accent: '#ff8822', glow: '#ff5533', cockpit: '#ffcc44' }
  },
  {
    id: 'arctic',
    name: 'ARCTIC WOLF',
    description: 'Isblå med vita detaljer',
    colors: { primary: '#88bbdd', secondary: '#5588aa', accent: '#ffffff', glow: '#aaddff', cockpit: '#ffffff' }
  },
  {
    id: 'commander',
    name: 'COMMANDER',
    description: 'Stort grått befälsskepp',
    colors: { primary: '#778888', secondary: '#556666', accent: '#cc9933', glow: '#99aabb', cockpit: '#66aadd' }
  },
  {
    id: 'scarlet',
    name: 'SCARLET BLADE',
    description: 'Skarp röd duellant',
    colors: { primary: '#cc2233', secondary: '#991122', accent: '#ff8844', glow: '#ff4455', cockpit: '#ffaa77' }
  },
  {
    id: 'goldenrod',
    name: 'GOLDENROD',
    description: 'Klassisk gul transportjagare',
    colors: { primary: '#bb9922', secondary: '#886611', accent: '#446688', glow: '#ddbb44', cockpit: '#88aacc' }
  },
  {
    id: 'bluehawk',
    name: 'BLUE HAWK',
    description: 'Snabb blå attackfågel',
    colors: { primary: '#3355aa', secondary: '#223377', accent: '#ff4422', glow: '#5577cc', cockpit: '#aaccff' }
  },
  {
    id: 'titanium',
    name: 'TITANIUM',
    description: 'Ultra-pansrad grå destroyer',
    colors: { primary: '#8899aa', secondary: '#667788', accent: '#dd6633', glow: '#aabbcc', cockpit: '#55aadd' }
  }
];

// Draw functions for each ship model
// ctx is already translated to ship center
export function drawShipModel(
  ctx: CanvasRenderingContext2D,
  modelId: string,
  width: number,
  height: number,
  time: number
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
    default:
      drawFalcon(ctx, width, height, colors, time);
  }
}

// DEFAULT: FALCON - Classic balanced fighter
function drawFalcon(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const cx = w / 2;
  const cy = h / 2;
  
  // Body gradient
  const bodyGrad = ctx.createLinearGradient(-10, -6, 35, 6);
  bodyGrad.addColorStop(0, colors.primary);
  bodyGrad.addColorStop(0.5, colors.secondary);
  bodyGrad.addColorStop(1, colors.primary);
  ctx.fillStyle = bodyGrad;
  
  // Main fuselage
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -2.5);
  ctx.lineTo(18, -5);
  ctx.lineTo(-18, -4);
  ctx.lineTo(-22, -2.5);
  ctx.lineTo(-22, 2.5);
  ctx.lineTo(-18, 4);
  ctx.lineTo(18, 5);
  ctx.lineTo(28, 2.5);
  ctx.closePath();
  ctx.fill();
  
  // Wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-15, -4);
  ctx.lineTo(-21, -10);
  ctx.lineTo(-6, -6.5);
  ctx.lineTo(0, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-15, 4);
  ctx.lineTo(-21, 10);
  ctx.lineTo(-6, 6.5);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();
  
  // Accent stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-15, -2, 40, 1);
  ctx.fillRect(-15, 1, 40, 1);
  
  // Cockpit
  const cockpitGrad = ctx.createRadialGradient(28, 0, 0, 28, 0, 5);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.5, colors.cockpit);
  cockpitGrad.addColorStop(1, colors.glow);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.arc(28, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine
  drawEngine(ctx, -22, 0, colors, time);
}

// VIPER - Sleek dual-wing fighter
function drawViper(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  // Long thin body
  const bodyGrad = ctx.createLinearGradient(-20, 0, 35, 0);
  bodyGrad.addColorStop(0, colors.secondary);
  bodyGrad.addColorStop(0.5, colors.primary);
  bodyGrad.addColorStop(1, colors.secondary);
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(30, -2);
  ctx.lineTo(10, -3);
  ctx.lineTo(-20, -2);
  ctx.lineTo(-24, 0);
  ctx.lineTo(-20, 2);
  ctx.lineTo(10, 3);
  ctx.lineTo(30, 2);
  ctx.closePath();
  ctx.fill();
  
  // Dual swept wings
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(5, -3);
  ctx.lineTo(-15, -14);
  ctx.lineTo(-20, -12);
  ctx.lineTo(-5, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 3);
  ctx.lineTo(-15, 14);
  ctx.lineTo(-20, 12);
  ctx.lineTo(-5, 3);
  ctx.closePath();
  ctx.fill();
  
  // Wing tips glow
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 8;
  ctx.fillStyle = colors.glow;
  ctx.beginPath();
  ctx.arc(-17, -13, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-17, 13, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(30, 0, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -24, 0, colors, time);
}

// PHANTOM - Stealth angular design
function drawPhantom(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Angular body
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(20, -5);
  ctx.lineTo(-5, -6);
  ctx.lineTo(-25, -3);
  ctx.lineTo(-25, 3);
  ctx.lineTo(-5, 6);
  ctx.lineTo(20, 5);
  ctx.closePath();
  ctx.fill();
  
  // Stealth wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-5, -6);
  ctx.lineTo(-25, -15);
  ctx.lineTo(-30, -10);
  ctx.lineTo(-25, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-5, 6);
  ctx.lineTo(-25, 15);
  ctx.lineTo(-30, 10);
  ctx.lineTo(-25, 3);
  ctx.closePath();
  ctx.fill();
  
  // Subtle edge glow
  ctx.strokeStyle = colors.glow + '44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(20, -5);
  ctx.lineTo(-30, -10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(20, 5);
  ctx.lineTo(-30, 10);
  ctx.stroke();
  
  // Cockpit slit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(22, -1, 10, 2);
  
  drawEngine(ctx, -25, 0, colors, time);
}

// HAMMER - Heavy attack ship with broad front
function drawHammer(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Broad hammerhead
  ctx.beginPath();
  ctx.moveTo(25, -8);
  ctx.lineTo(30, -8);
  ctx.lineTo(32, 0);
  ctx.lineTo(30, 8);
  ctx.lineTo(25, 8);
  ctx.lineTo(20, 5);
  ctx.lineTo(20, -5);
  ctx.closePath();
  ctx.fill();
  
  // Body
  ctx.beginPath();
  ctx.moveTo(20, -5);
  ctx.lineTo(20, 5);
  ctx.lineTo(-20, 4);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, -4);
  ctx.closePath();
  ctx.fill();
  
  // Heavy armor plates
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(22, -7, 6, 3);
  ctx.fillRect(22, 4, 6, 3);
  ctx.fillRect(-15, -5, 25, 2);
  ctx.fillRect(-15, 3, 25, 2);
  
  // Weapons
  ctx.fillStyle = colors.accent;
  ctx.fillRect(28, -10, 4, 4);
  ctx.fillRect(28, 6, 4, 4);
  
  // Cockpit
  const cockpitGrad = ctx.createRadialGradient(15, 0, 0, 15, 0, 4);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(1, colors.cockpit);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.arc(15, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time);
}

// NEEDLE - Ultra-thin interceptor
function drawNeedle(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Super thin needle body
  ctx.beginPath();
  ctx.moveTo(45, 0);
  ctx.lineTo(35, -1);
  ctx.lineTo(-20, -1.5);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 1.5);
  ctx.lineTo(35, 1);
  ctx.closePath();
  ctx.fill();
  
  // Tiny stabilizers
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-10, -1.5);
  ctx.lineTo(-18, -6);
  ctx.lineTo(-20, -5);
  ctx.lineTo(-15, -1.5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-10, 1.5);
  ctx.lineTo(-18, 6);
  ctx.lineTo(-20, 5);
  ctx.lineTo(-15, 1.5);
  ctx.closePath();
  ctx.fill();
  
  // Speed lines
  ctx.strokeStyle = colors.glow;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-45, 0);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(38, 0, 4, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time, 0.6);
}

// TRIDENT - Three-pronged design
function drawTrident(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Central prong
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(25, -2);
  ctx.lineTo(-10, -2);
  ctx.lineTo(-15, 0);
  ctx.lineTo(-10, 2);
  ctx.lineTo(25, 2);
  ctx.closePath();
  ctx.fill();
  
  // Upper prong
  ctx.beginPath();
  ctx.moveTo(30, -4);
  ctx.lineTo(20, -5);
  ctx.lineTo(-5, -8);
  ctx.lineTo(-15, -5);
  ctx.lineTo(-10, -4);
  ctx.closePath();
  ctx.fill();
  
  // Lower prong
  ctx.beginPath();
  ctx.moveTo(30, 4);
  ctx.lineTo(20, 5);
  ctx.lineTo(-5, 8);
  ctx.lineTo(-15, 5);
  ctx.lineTo(-10, 4);
  ctx.closePath();
  ctx.fill();
  
  // Prong tips glow
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 6;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(40, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, -4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(20, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -15, -6, colors, time, 0.5);
  drawEngine(ctx, -15, 0, colors, time, 0.7);
  drawEngine(ctx, -15, 6, colors, time, 0.5);
}

// MANTIS - Insect-like with curved wings
function drawMantis(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Segmented body
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.quadraticCurveTo(25, -3, 10, -2);
  ctx.lineTo(-15, -2);
  ctx.quadraticCurveTo(-22, 0, -15, 2);
  ctx.lineTo(10, 2);
  ctx.quadraticCurveTo(25, 3, 35, 0);
  ctx.closePath();
  ctx.fill();
  
  // Curved mantis wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -2);
  ctx.quadraticCurveTo(-10, -15, -25, -12);
  ctx.quadraticCurveTo(-20, -8, -15, -2);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 2);
  ctx.quadraticCurveTo(-10, 15, -25, 12);
  ctx.quadraticCurveTo(-20, 8, -15, 2);
  ctx.closePath();
  ctx.fill();
  
  // Antenna
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(32, -1);
  ctx.quadraticCurveTo(40, -5, 38, -8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(32, 1);
  ctx.quadraticCurveTo(40, 5, 38, 8);
  ctx.stroke();
  
  // Eyes
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(30, -2, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(30, 2, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// SCORPION - Curved design with tail cannon
function drawScorpion(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Body
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(15, -4);
  ctx.lineTo(-10, -5);
  ctx.lineTo(-20, -3);
  ctx.lineTo(-20, 3);
  ctx.lineTo(-10, 5);
  ctx.lineTo(15, 4);
  ctx.closePath();
  ctx.fill();
  
  // Tail curving up
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.quadraticCurveTo(30, -2, 35, -8);
  ctx.quadraticCurveTo(38, -12, 40, -10);
  ctx.quadraticCurveTo(38, -6, 32, 0);
  ctx.lineTo(25, 0);
  ctx.closePath();
  ctx.fill();
  
  // Stinger
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 8;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(40, -10);
  ctx.lineTo(45, -8);
  ctx.lineTo(40, -6);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Claws
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-10, -5);
  ctx.lineTo(-18, -12);
  ctx.lineTo(-22, -8);
  ctx.lineTo(-15, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-10, 5);
  ctx.lineTo(-18, 12);
  ctx.lineTo(-22, 8);
  ctx.lineTo(-15, 5);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(10, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// DELTA - Triangular stealth fighter
function drawDelta(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Perfect triangle
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(-25, -15);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-25, 15);
  ctx.closePath();
  ctx.fill();
  
  // Inner detail
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(25, 0);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-12, 0);
  ctx.lineTo(-15, 10);
  ctx.closePath();
  ctx.fill();
  
  // Edge lights
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 5;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-23, -14, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-23, 14, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(15, 0, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// STINGRAY - Flat underwater design
function drawStingray(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Wide flat body
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.quadraticCurveTo(20, -3, 5, -5);
  ctx.quadraticCurveTo(-15, -12, -28, -8);
  ctx.lineTo(-30, 0);
  ctx.lineTo(-28, 8);
  ctx.quadraticCurveTo(-15, 12, 5, 5);
  ctx.quadraticCurveTo(20, 3, 30, 0);
  ctx.closePath();
  ctx.fill();
  
  // Wing patterns
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(-12, -10, -25, -7);
  ctx.quadraticCurveTo(-15, -8, 0, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.quadraticCurveTo(-12, 10, -25, 7);
  ctx.quadraticCurveTo(-15, 8, 0, 3);
  ctx.closePath();
  ctx.fill();
  
  // Tail
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-45, 0);
  ctx.stroke();
  
  // Eyes
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(15, -2, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(15, 2, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // No visible engine for underwater look
}

// PHOENIX - Fire wings with dramatic silhouette
function drawPhoenix(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  // Flame wings
  ctx.fillStyle = colors.primary;
  const wingFlicker = Math.sin(time * 0.01) * 2;
  
  // Top flame wing
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.quadraticCurveTo(-10, -8 - wingFlicker, -25, -18 - wingFlicker);
  ctx.quadraticCurveTo(-20, -12, -15, -8);
  ctx.quadraticCurveTo(-8, -5, 0, -3);
  ctx.closePath();
  ctx.fill();
  
  // Bottom flame wing
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.quadraticCurveTo(-10, 8 + wingFlicker, -25, 18 + wingFlicker);
  ctx.quadraticCurveTo(-20, 12, -15, 8);
  ctx.quadraticCurveTo(-8, 5, 0, 3);
  ctx.closePath();
  ctx.fill();
  
  // Body
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(25, -3);
  ctx.lineTo(-5, -3);
  ctx.lineTo(-15, 0);
  ctx.lineTo(-5, 3);
  ctx.lineTo(25, 3);
  ctx.closePath();
  ctx.fill();
  
  // Wing tips fire
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 12;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-25, -18 - wingFlicker, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-25, 18 + wingFlicker, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(30, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -15, 0, colors, time);
}

// SHARK - Aggressive shark design with fins
function drawShark(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Streamlined body
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.quadraticCurveTo(30, -4, 15, -5);
  ctx.lineTo(-15, -4);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-15, 4);
  ctx.lineTo(15, 5);
  ctx.quadraticCurveTo(30, 4, 40, 0);
  ctx.closePath();
  ctx.fill();
  
  // Dorsal fin
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-5, -15);
  ctx.lineTo(-10, -12);
  ctx.lineTo(-5, -5);
  ctx.closePath();
  ctx.fill();
  
  // Side fins
  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-18, -6);
  ctx.lineTo(-10, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-5, 4);
  ctx.lineTo(-15, 10);
  ctx.lineTo(-18, 6);
  ctx.lineTo(-10, 4);
  ctx.closePath();
  ctx.fill();
  
  // Tail fin
  ctx.beginPath();
  ctx.moveTo(-18, -3);
  ctx.lineTo(-28, -8);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-28, 8);
  ctx.lineTo(-18, 3);
  ctx.closePath();
  ctx.fill();
  
  // Eye
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(30, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Gills
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(10 - i * 5, -3);
    ctx.lineTo(8 - i * 5, -5);
    ctx.stroke();
  }
  
  drawEngine(ctx, -25, 0, colors, time);
}

// WASP - Thin body with sharp wings
function drawWasp(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  // Striped body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(25, -2);
  ctx.lineTo(-15, -2);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 2);
  ctx.lineTo(25, 2);
  ctx.closePath();
  ctx.fill();
  
  // Stripes
  ctx.fillStyle = colors.accent;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(15 - i * 10, -2, 3, 4);
  }
  
  // Sharp wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -2);
  ctx.lineTo(-5, -12);
  ctx.lineTo(-15, -10);
  ctx.lineTo(0, -2);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 2);
  ctx.lineTo(-5, 12);
  ctx.lineTo(-15, 10);
  ctx.lineTo(0, 2);
  ctx.closePath();
  ctx.fill();
  
  // Stinger
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(42, 0);
  ctx.lineTo(35, -1);
  ctx.closePath();
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// CORSAIR - Pirate design with asymmetric wings
function drawCorsair(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Rugged body
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(25, -4);
  ctx.lineTo(-10, -5);
  ctx.lineTo(-20, -2);
  ctx.lineTo(-22, 3);
  ctx.lineTo(-10, 6);
  ctx.lineTo(25, 4);
  ctx.closePath();
  ctx.fill();
  
  // Asymmetric wings
  ctx.fillStyle = colors.secondary;
  // Top wing - larger
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-10, -16);
  ctx.lineTo(-20, -12);
  ctx.lineTo(-10, -5);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing - smaller, damaged look
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(-8, 10);
  ctx.lineTo(-15, 8);
  ctx.lineTo(-5, 6);
  ctx.closePath();
  ctx.fill();
  
  // Skull emblem
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(15, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(14, -1, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(17, -1, 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(25, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// SPECTER - Ghost-like with translucent elements
function drawSpecter(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const ghostPulse = Math.sin(time * 0.005) * 0.2 + 0.8;
  
  // Ethereal body
  ctx.globalAlpha = 0.7 * ghostPulse;
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.quadraticCurveTo(25, -5, 10, -4);
  ctx.quadraticCurveTo(-10, -6, -20, -3);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 3);
  ctx.quadraticCurveTo(-10, 6, 10, 4);
  ctx.quadraticCurveTo(25, 5, 35, 0);
  ctx.closePath();
  ctx.fill();
  
  // Wispy trails
  ctx.globalAlpha = 0.4 * ghostPulse;
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-20, -3);
  ctx.quadraticCurveTo(-30, -8, -40, -5);
  ctx.quadraticCurveTo(-35, 0, -40, 5);
  ctx.quadraticCurveTo(-30, 8, -20, 3);
  ctx.closePath();
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Glowing core
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(20, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Eyes
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.ellipse(28, -2, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(28, 2, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

// RAPTOR - Bird of prey design with claws
function drawRaptor(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Streamlined body
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -3);
  ctx.lineTo(5, -4);
  ctx.lineTo(-15, -3);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 3);
  ctx.lineTo(5, 4);
  ctx.lineTo(28, 3);
  ctx.closePath();
  ctx.fill();
  
  // Swept wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.lineTo(-5, -6);
  ctx.lineTo(-20, -14);
  ctx.lineTo(-15, -8);
  ctx.lineTo(0, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.lineTo(-5, 6);
  ctx.lineTo(-20, 14);
  ctx.lineTo(-15, 8);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();
  
  // Talons
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(44, -3);
  ctx.lineTo(42, 0);
  ctx.lineTo(44, 3);
  ctx.closePath();
  ctx.fill();
  
  // Beak cockpit
  const cockpitGrad = ctx.createRadialGradient(32, 0, 0, 32, 0, 4);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(1, colors.cockpit);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(32, 0, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// AURORA - Elegant curves with northern lights effect
function drawAurora(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const shimmer = time * 0.005;
  
  // Curved elegant body
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.bezierCurveTo(30, -4, 15, -6, 0, -5);
  ctx.bezierCurveTo(-15, -4, -25, -2, -28, 0);
  ctx.bezierCurveTo(-25, 2, -15, 4, 0, 5);
  ctx.bezierCurveTo(15, 6, 30, 4, 35, 0);
  ctx.closePath();
  ctx.fill();
  
  // Aurora effect wings
  const auroraGrad = ctx.createLinearGradient(-20, -15, -20, 15);
  auroraGrad.addColorStop(0, colors.accent + '88');
  auroraGrad.addColorStop(0.5, colors.primary);
  auroraGrad.addColorStop(1, colors.accent + '88');
  ctx.fillStyle = auroraGrad;
  
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.bezierCurveTo(-5, -8, -15, -15, -25, -12);
  ctx.bezierCurveTo(-20, -8, -10, -5, 5, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.bezierCurveTo(-5, 8, -15, 15, -25, 12);
  ctx.bezierCurveTo(-20, 8, -10, 5, 5, 5);
  ctx.closePath();
  ctx.fill();
  
  // Shimmer effect
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 10 + Math.sin(shimmer) * 5;
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(28, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  drawEngine(ctx, -28, 0, colors, time);
}

// GLADIATOR - Massive armored battleship
function drawGladiator(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Heavy armored body
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(25, -6);
  ctx.lineTo(10, -8);
  ctx.lineTo(-15, -7);
  ctx.lineTo(-22, -4);
  ctx.lineTo(-22, 4);
  ctx.lineTo(-15, 7);
  ctx.lineTo(10, 8);
  ctx.lineTo(25, 6);
  ctx.closePath();
  ctx.fill();
  
  // Armor plates
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-18, -6, 35, 3);
  ctx.fillRect(-18, 3, 35, 3);
  
  // Shield generators
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-20, -8, 6, 3);
  ctx.fillRect(-20, 5, 6, 3);
  ctx.fillRect(15, -9, 6, 3);
  ctx.fillRect(15, 6, 6, 3);
  
  // Heavy weapons
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(20, -10, 8, 4);
  ctx.fillRect(20, 6, 8, 4);
  
  // Cockpit slit
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(18, -2, 8, 4);
  
  drawEngine(ctx, -22, -4, colors, time, 0.6);
  drawEngine(ctx, -22, 4, colors, time, 0.6);
}

// ECLIPSE - Circular design with moon ring
function drawEclipse(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  // Outer ring
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(5, 0, 18, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner dark core
  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  ctx.arc(5, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  
  // Eclipse effect - bright edge
  const eclipseGrad = ctx.createRadialGradient(5, 0, 10, 5, 0, 16);
  eclipseGrad.addColorStop(0, 'transparent');
  eclipseGrad.addColorStop(0.7, 'transparent');
  eclipseGrad.addColorStop(1, colors.glow);
  ctx.fillStyle = eclipseGrad;
  ctx.beginPath();
  ctx.arc(5, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose extension
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(23, 0);
  ctx.lineTo(35, 0);
  ctx.lineTo(23, -3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(23, 0);
  ctx.lineTo(35, 0);
  ctx.lineTo(23, 3);
  ctx.closePath();
  ctx.fill();
  
  // Central cockpit glow
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 15;
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(5, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine in ring
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-13, 0, 3, 0, Math.PI * 2);
  ctx.fill();
}

// BASILISK - Snake-like with curved body
function drawBasilisk(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  const slither = Math.sin(time * 0.008) * 2;
  
  ctx.fillStyle = colors.primary;
  
  // Serpentine body
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.quadraticCurveTo(30, -3 + slither, 20, -2 + slither);
  ctx.quadraticCurveTo(10, -1 + slither * 0.5, 0, 1 - slither * 0.5);
  ctx.quadraticCurveTo(-10, 3 - slither, -20, 2 - slither);
  ctx.lineTo(-25, 0);
  ctx.quadraticCurveTo(-20, -2 + slither, -10, -1 + slither);
  ctx.quadraticCurveTo(0, -3 + slither * 0.5, 10, -4 + slither * 0.5);
  ctx.quadraticCurveTo(20, -5 - slither, 30, -4 - slither);
  ctx.closePath();
  ctx.fill();
  
  // Scales pattern
  ctx.fillStyle = colors.secondary;
  for (let i = 0; i < 5; i++) {
    const sx = 25 - i * 10;
    const sOffset = Math.sin(time * 0.008 + i * 0.5) * 1;
    ctx.beginPath();
    ctx.ellipse(sx, sOffset, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Hood/Crest
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(30, -4 - slither);
  ctx.quadraticCurveTo(28, -10, 22, -8);
  ctx.lineTo(25, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(30, 4 + slither);
  ctx.quadraticCurveTo(28, 10, 22, 8);
  ctx.lineTo(25, 4);
  ctx.closePath();
  ctx.fill();
  
  // Eyes
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 8;
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(35, -2, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(35, 2, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  drawEngine(ctx, -25, 0, colors, time, 0.7);
}

// ============= 20 NEW RETRO SCI-FI SHIPS DRAW FUNCTIONS =============

// INTERCEPTOR - Classic blue fighter with red details
function drawInterceptor(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Main body - elongated cockpit section
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(32, -4);
  ctx.lineTo(15, -5);
  ctx.lineTo(-15, -4);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 4);
  ctx.lineTo(15, 5);
  ctx.lineTo(32, 4);
  ctx.closePath();
  ctx.fill();
  
  // Angular wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-10, -14);
  ctx.lineTo(-18, -12);
  ctx.lineTo(-15, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(-10, 14);
  ctx.lineTo(-18, 12);
  ctx.lineTo(-15, 4);
  ctx.closePath();
  ctx.fill();
  
  // Red accent stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(20, -3, 15, 2);
  ctx.fillRect(20, 1, 15, 2);
  ctx.fillRect(-12, -13, 4, 10);
  ctx.fillRect(-12, 3, 4, 10);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(30, 0, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// VALKYRIE - Silver attacker with sharp wings
function drawValkyrie(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Sleek main body
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(35, -3);
  ctx.lineTo(20, -4);
  ctx.lineTo(-10, -3);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-10, 3);
  ctx.lineTo(20, 4);
  ctx.lineTo(35, 3);
  ctx.closePath();
  ctx.fill();
  
  // Sharp swept wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.lineTo(-5, -16);
  ctx.lineTo(-15, -14);
  ctx.lineTo(-10, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.lineTo(-5, 16);
  ctx.lineTo(-15, 14);
  ctx.lineTo(-10, 3);
  ctx.closePath();
  ctx.fill();
  
  // Red wing tips
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-7, -15, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-7, 15, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit glass
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(32, 0, 8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -18, 0, colors, time);
}

// CRIMSON HAWK - Red hunter with dual engines
function drawCrimson(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Bulky main body
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(28, -5);
  ctx.lineTo(10, -6);
  ctx.lineTo(-15, -5);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 5);
  ctx.lineTo(10, 6);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Twin engine nacelles
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.roundRect(-18, -10, 20, 5, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-18, 5, 20, 5, 2);
  ctx.fill();
  
  // Yellow accent
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-15, -9, 15, 1);
  ctx.fillRect(-15, 8, 15, 1);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(25, 0, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -18, -7.5, colors, time, 0.6);
  drawEngine(ctx, -18, 7.5, colors, time, 0.6);
}

// GOLDWING - Heavy golden ship with broad profile
function drawGoldwing(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Wide heavy body
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(25, -7);
  ctx.lineTo(10, -9);
  ctx.lineTo(-15, -8);
  ctx.lineTo(-22, -5);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-22, 5);
  ctx.lineTo(-15, 8);
  ctx.lineTo(10, 9);
  ctx.lineTo(25, 7);
  ctx.closePath();
  ctx.fill();
  
  // Panel lines
  ctx.strokeStyle = colors.secondary;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, -6);
  ctx.lineTo(-10, -7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, 6);
  ctx.lineTo(-10, 7);
  ctx.stroke();
  
  // White accent details
  ctx.fillStyle = colors.accent;
  ctx.fillRect(15, -4, 8, 2);
  ctx.fillRect(15, 2, 8, 2);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(22, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time, 1.2);
}

// COBALT STRIKER - Streamlined blue fighter
function drawCobalt(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Aerodynamic body
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.quadraticCurveTo(35, -4, 20, -4);
  ctx.lineTo(-15, -3);
  ctx.quadraticCurveTo(-22, 0, -15, 3);
  ctx.lineTo(20, 4);
  ctx.quadraticCurveTo(35, 4, 42, 0);
  ctx.closePath();
  ctx.fill();
  
  // Dorsal fin
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.lineTo(-5, -12);
  ctx.lineTo(-15, -8);
  ctx.lineTo(-10, -3);
  ctx.closePath();
  ctx.fill();
  
  // Ventral stabilizer
  ctx.beginPath();
  ctx.moveTo(5, 4);
  ctx.lineTo(-5, 10);
  ctx.lineTo(-12, 7);
  ctx.lineTo(-10, 3);
  ctx.closePath();
  ctx.fill();
  
  // White stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(10, -2, 25, 1);
  ctx.fillRect(10, 1, 25, 1);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(32, 0, 6, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// IRONCLAD - Armored gray frigate
function drawIronclad(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Boxy armored hull
  ctx.beginPath();
  ctx.moveTo(32, -3);
  ctx.lineTo(35, 0);
  ctx.lineTo(32, 3);
  ctx.lineTo(-20, 6);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, -6);
  ctx.closePath();
  ctx.fill();
  
  // Armor plates
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-15, -7, 35, 2);
  ctx.fillRect(-15, 5, 35, 2);
  ctx.fillRect(-18, -4, 5, 8);
  
  // Orange accent lights
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(25, -2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(25, 2, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Cockpit viewport
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(28, -2, 5, 4);
  
  drawEngine(ctx, -25, 0, colors, time);
}

// REDTAIL - Fast red interceptor with yellow marking
function drawRedtail(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Slim fast body
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(30, -3);
  ctx.lineTo(10, -4);
  ctx.lineTo(-15, -3);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-15, 3);
  ctx.lineTo(10, 4);
  ctx.lineTo(30, 3);
  ctx.closePath();
  ctx.fill();
  
  // Tail fins
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(-10, -3);
  ctx.lineTo(-18, -10);
  ctx.lineTo(-22, -8);
  ctx.lineTo(-15, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-10, 3);
  ctx.lineTo(-18, 10);
  ctx.lineTo(-22, 8);
  ctx.lineTo(-15, 3);
  ctx.closePath();
  ctx.fill();
  
  // Yellow tail stripe
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-20, -2, 8, 4);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(32, 0, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// SUNBURST - Yellow attacker with sun pattern
function drawSunburst(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Radial body
  ctx.beginPath();
  ctx.moveTo(35, 0);
  ctx.lineTo(25, -6);
  ctx.lineTo(5, -8);
  ctx.lineTo(-15, -6);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-15, 6);
  ctx.lineTo(5, 8);
  ctx.lineTo(25, 6);
  ctx.closePath();
  ctx.fill();
  
  // Sunburst rays (wings)
  ctx.fillStyle = colors.secondary;
  const rayCount = 4;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i - 1.5) * 0.4 - Math.PI / 2;
    const x1 = Math.cos(angle) * 8;
    const y1 = Math.sin(angle) * 8 - 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 12, y1 - 8);
    ctx.lineTo(x1 - 8, y1);
    ctx.closePath();
    ctx.fill();
  }
  for (let i = 0; i < rayCount; i++) {
    const angle = (i - 1.5) * 0.4 + Math.PI / 2;
    const x1 = Math.cos(angle) * 8;
    const y1 = Math.sin(angle) * 8 + 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - 12, y1 + 8);
    ctx.lineTo(x1 - 8, y1);
    ctx.closePath();
    ctx.fill();
  }
  
  // Orange core glow
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 10;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(10, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(28, 0, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// STEEL WOLF - Aggressive gray hunter
function drawSteelwolf(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Wolf-like angular body
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -4);
  ctx.lineTo(10, -5);
  ctx.lineTo(-5, -6);
  ctx.lineTo(-20, -4);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 4);
  ctx.lineTo(-5, 6);
  ctx.lineTo(10, 5);
  ctx.lineTo(28, 4);
  ctx.closePath();
  ctx.fill();
  
  // Ear-like fins
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(15, -5);
  ctx.lineTo(5, -14);
  ctx.lineTo(-5, -10);
  ctx.lineTo(0, -5);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(15, 5);
  ctx.lineTo(5, 14);
  ctx.lineTo(-5, 10);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();
  
  // Cyan accent lights
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 6;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.ellipse(3, -12, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(3, 12, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(30, 0, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time);
}

// BLUESHIFT - Aerodynamic blue racer
function drawBlueshift(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Ultra aerodynamic body
  ctx.beginPath();
  ctx.moveTo(45, 0);
  ctx.quadraticCurveTo(40, -3, 30, -3);
  ctx.lineTo(0, -4);
  ctx.lineTo(-20, -2);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-20, 2);
  ctx.lineTo(0, 4);
  ctx.lineTo(30, 3);
  ctx.quadraticCurveTo(40, 3, 45, 0);
  ctx.closePath();
  ctx.fill();
  
  // Speed wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -4);
  ctx.lineTo(-8, -12);
  ctx.lineTo(-15, -10);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 4);
  ctx.lineTo(-8, 12);
  ctx.lineTo(-15, 10);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  
  // Orange racing stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(0, -2, 35, 1);
  ctx.fillRect(0, 1, 35, 1);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(35, 0, 6, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time);
}

// THUNDERBOLT - Massive red-silver battlecruiser
function drawThunderbolt(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Massive hull
  ctx.beginPath();
  ctx.moveTo(32, 0);
  ctx.lineTo(25, -8);
  ctx.lineTo(5, -10);
  ctx.lineTo(-20, -8);
  ctx.lineTo(-28, 0);
  ctx.lineTo(-20, 8);
  ctx.lineTo(5, 10);
  ctx.lineTo(25, 8);
  ctx.closePath();
  ctx.fill();
  
  // Silver armor panels
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-15, -9, 30, 2);
  ctx.fillRect(-15, 7, 30, 2);
  ctx.fillRect(18, -5, 4, 10);
  
  // Weapon pods
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.roundRect(-10, -14, 15, 5, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-10, 9, 15, 5, 2);
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(22, 0, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -28, 0, colors, time, 1.3);
}

// YELLOW JACKET - Sleek yellow-black fighter
function drawYellowjacket(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Wasp-like body
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(30, -4);
  ctx.lineTo(15, -5);
  ctx.lineTo(-5, -4);
  ctx.lineTo(-15, -3);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-15, 3);
  ctx.lineTo(-5, 4);
  ctx.lineTo(15, 5);
  ctx.lineTo(30, 4);
  ctx.closePath();
  ctx.fill();
  
  // Black stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(10, -4.5, 6, 9);
  ctx.fillRect(-5, -4, 5, 8);
  
  // Stinger wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(-5, -13);
  ctx.lineTo(-12, -10);
  ctx.lineTo(-5, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 5);
  ctx.lineTo(-5, 13);
  ctx.lineTo(-12, 10);
  ctx.lineTo(-5, 4);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(32, 0, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// SILVER FOX - Elegant silver-blue scout
function drawSilverfox(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Elegant curved body
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.quadraticCurveTo(38, -3, 28, -3);
  ctx.lineTo(5, -4);
  ctx.quadraticCurveTo(-10, -4, -18, -2);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-18, 2);
  ctx.quadraticCurveTo(-10, 4, 5, 4);
  ctx.lineTo(28, 3);
  ctx.quadraticCurveTo(38, 3, 42, 0);
  ctx.closePath();
  ctx.fill();
  
  // Fox ear stabilizers
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -4);
  ctx.lineTo(0, -12);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-2, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, 4);
  ctx.lineTo(0, 12);
  ctx.lineTo(-8, 8);
  ctx.lineTo(-2, 4);
  ctx.closePath();
  ctx.fill();
  
  // Blue accent lights
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 8;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-2, -10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-2, 10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(34, 0, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// FIREBIRD - Fire red with orange flames
function drawFirebird(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Phoenix body
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(28, -5);
  ctx.lineTo(10, -6);
  ctx.lineTo(-10, -5);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-10, 5);
  ctx.lineTo(10, 6);
  ctx.lineTo(28, 5);
  ctx.closePath();
  ctx.fill();
  
  // Flame wings
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.moveTo(5, -6);
  ctx.quadraticCurveTo(-5, -15, -18, -14);
  ctx.quadraticCurveTo(-12, -10, -8, -6);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(5, 6);
  ctx.quadraticCurveTo(-5, 15, -18, 14);
  ctx.quadraticCurveTo(-12, 10, -8, 6);
  ctx.closePath();
  ctx.fill();
  
  // Inner flame glow
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 10;
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.arc(-10, -12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(28, 0, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// ARCTIC WOLF - Ice blue with white details
function drawArctic(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Sleek icy body
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(32, -4);
  ctx.lineTo(15, -5);
  ctx.lineTo(-10, -4);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-10, 4);
  ctx.lineTo(15, 5);
  ctx.lineTo(32, 4);
  ctx.closePath();
  ctx.fill();
  
  // Crystal wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(8, -5);
  ctx.lineTo(-2, -14);
  ctx.lineTo(-12, -12);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(8, 5);
  ctx.lineTo(-2, 14);
  ctx.lineTo(-12, 12);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  
  // White frost accents
  ctx.fillStyle = colors.accent;
  ctx.fillRect(5, -3, 20, 1.5);
  ctx.fillRect(5, 1.5, 20, 1.5);
  ctx.fillRect(-5, -13, 5, 2);
  ctx.fillRect(-5, 11, 5, 2);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(32, 0, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -20, 0, colors, time);
}

// COMMANDER - Large gray command ship
function drawCommander(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Large command hull
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(22, -7);
  ctx.lineTo(5, -9);
  ctx.lineTo(-18, -7);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-18, 7);
  ctx.lineTo(5, 9);
  ctx.lineTo(22, 7);
  ctx.closePath();
  ctx.fill();
  
  // Command tower
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(10, -9);
  ctx.lineTo(5, -14);
  ctx.lineTo(-5, -14);
  ctx.lineTo(-10, -9);
  ctx.closePath();
  ctx.fill();
  
  // Gold command stripes
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-5, -13, 10, 2);
  ctx.fillRect(10, -4, 12, 2);
  ctx.fillRect(10, 2, 12, 2);
  
  // Bridge windows
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(0, -12, 4, 3);
  ctx.beginPath();
  ctx.ellipse(20, 0, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time, 1.2);
}

// SCARLET BLADE - Sharp red duelist
function drawScarlet(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Blade-like body
  ctx.beginPath();
  ctx.moveTo(27, 0);
  ctx.lineTo(21, -3);
  ctx.lineTo(9, -4);
  ctx.lineTo(-6, -3);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-6, 3);
  ctx.lineTo(9, 4);
  ctx.lineTo(21, 3);
  ctx.closePath();
  ctx.fill();
  
  // Blade wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(6, -4);
  ctx.lineTo(-3, -12);
  ctx.lineTo(-9, -10);
  ctx.lineTo(-4, -3);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(-3, 12);
  ctx.lineTo(-9, 10);
  ctx.lineTo(-4, 3);
  ctx.closePath();
  ctx.fill();
  
  // Orange edge glow
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(27, 0);
  ctx.lineTo(21, -3);
  ctx.lineTo(9, -4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(27, 0);
  ctx.lineTo(21, 3);
  ctx.lineTo(9, 4);
  ctx.stroke();
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(21, 0, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -10, 0, colors, time);
}

// GOLDENROD - Classic yellow transport hunter
function drawGoldenrod(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Robust transport body
  ctx.beginPath();
  ctx.moveTo(32, 0);
  ctx.lineTo(25, -6);
  ctx.lineTo(5, -7);
  ctx.lineTo(-15, -6);
  ctx.lineTo(-22, 0);
  ctx.lineTo(-15, 6);
  ctx.lineTo(5, 7);
  ctx.lineTo(25, 6);
  ctx.closePath();
  ctx.fill();
  
  // Cargo pods
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.roundRect(-10, -11, 18, 5, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-10, 6, 18, 5, 2);
  ctx.fill();
  
  // Blue accent details
  ctx.fillStyle = colors.accent;
  ctx.fillRect(-5, -10, 10, 1);
  ctx.fillRect(-5, 9, 10, 1);
  ctx.fillRect(18, -3, 5, 6);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(25, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -22, 0, colors, time);
}

// BLUE HAWK - Fast blue attack bird
function drawBluehawk(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Hawk-like sleek body
  ctx.beginPath();
  ctx.moveTo(42, 0);
  ctx.lineTo(32, -4);
  ctx.lineTo(12, -5);
  ctx.lineTo(-8, -4);
  ctx.lineTo(-18, 0);
  ctx.lineTo(-8, 4);
  ctx.lineTo(12, 5);
  ctx.lineTo(32, 4);
  ctx.closePath();
  ctx.fill();
  
  // Hawk wings
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.moveTo(8, -5);
  ctx.lineTo(-8, -15);
  ctx.lineTo(-18, -12);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(8, 5);
  ctx.lineTo(-8, 15);
  ctx.lineTo(-18, 12);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  
  // Red accent markings
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-10, -13, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-10, 13, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(15, -2, 15, 1);
  ctx.fillRect(15, 1, 15, 1);
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(34, 0, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -18, 0, colors, time);
}

// TITANIUM - Ultra-armored gray destroyer
function drawTitanium(ctx: CanvasRenderingContext2D, w: number, h: number, colors: typeof SHIP_MODELS[0]['colors'], time: number) {
  ctx.fillStyle = colors.primary;
  
  // Heavy armored hull
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(22, -8);
  ctx.lineTo(0, -10);
  ctx.lineTo(-18, -8);
  ctx.lineTo(-25, 0);
  ctx.lineTo(-18, 8);
  ctx.lineTo(0, 10);
  ctx.lineTo(22, 8);
  ctx.closePath();
  ctx.fill();
  
  // Heavy armor plates
  ctx.fillStyle = colors.secondary;
  ctx.fillRect(-12, -11, 22, 3);
  ctx.fillRect(-12, 8, 22, 3);
  ctx.fillRect(-20, -5, 6, 10);
  
  // Orange weapon ports
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 5;
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(-2, -10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-2, 10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, 8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Cockpit
  ctx.fillStyle = colors.cockpit;
  ctx.beginPath();
  ctx.ellipse(18, 0, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  drawEngine(ctx, -25, 0, colors, time, 1.3);
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

// Get model by ID
export function getShipModel(id: string): ShipModel {
  return SHIP_MODELS.find(m => m.id === id) || SHIP_MODELS[0];
}

// Storage key for active ship model
const ACTIVE_MODEL_KEY = 'galactic_overdrive_ship_model';

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
