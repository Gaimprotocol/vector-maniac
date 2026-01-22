// Polyfill for CanvasRenderingContext2D.roundRect for older iOS/Safari/WebViews.
// Many of our ship renderers rely on roundRect; when missing it throws and halts drawing.

function normalizeRadii(radii: number | number[] | undefined): [number, number, number, number] {
  if (Array.isArray(radii)) {
    const [tl = 0, tr = tl, br = tl, bl = tr] = radii;
    return [tl, tr, br, bl];
  }
  const r = typeof radii === 'number' ? radii : 0;
  return [r, r, r, r];
}

export function ensureCanvasRoundRectPolyfill() {
  if (typeof window === 'undefined') return;
  const proto = (window as any).CanvasRenderingContext2D?.prototype as CanvasRenderingContext2D | undefined;
  if (!proto) return;
  if (typeof proto.roundRect === 'function') return;

  // Minimal spec-compatible implementation: adds a rounded-rect subpath and returns ctx.
  proto.roundRect = function roundRect(this: CanvasRenderingContext2D, x, y, w, h, radii) {
    const [tl, tr, br, bl] = normalizeRadii(radii);

    const maxR = Math.min(Math.abs(w) / 2, Math.abs(h) / 2);
    const rtl = Math.min(Math.max(tl, 0), maxR);
    const rtr = Math.min(Math.max(tr, 0), maxR);
    const rbr = Math.min(Math.max(br, 0), maxR);
    const rbl = Math.min(Math.max(bl, 0), maxR);

    this.moveTo(x + rtl, y);
    this.lineTo(x + w - rtr, y);
    this.arcTo(x + w, y, x + w, y + rtr, rtr);
    this.lineTo(x + w, y + h - rbr);
    this.arcTo(x + w, y + h, x + w - rbr, y + h, rbr);
    this.lineTo(x + rbl, y + h);
    this.arcTo(x, y + h, x, y + h - rbl, rbl);
    this.lineTo(x, y + rtl);
    this.arcTo(x, y, x + rtl, y, rtl);
    this.closePath();
    return this;
  };
}
