/**
 * OutlineLayer
 * 任意のDOM要素の矩形アウトラインを固定canvasに描画し、autoGlitch(色収差+スライスずらし)を
 * 適用する装飾レイヤー。canvasは position:fixed / pointer-events:none / aria-hidden。
 *
 *   import { OutlineLayer } from './outline-layer.js'
 *   new OutlineLayer({ selector: '[data-outline]' }).mount()
 *   // 動的にDOMが変わったら refresh() / 破棄は destroy()
 */

const DEFAULTS = {
  selector: '[data-outline]',
  zIndex: 50,
  segments: 1,
  reach: 150,
  force: 0,
  mode: 'repel',
  glitch: 0.1,
  autoGlitch: true,
  speedGlitch: false,
  maxDpr: 2,
  respectReducedMotion: true,
  colors: {
    line: 'rgba(232,230,223,0.22)',
    body: 'rgba(232,230,223,0.6)',
    r: 'rgba(255,40,80,0.75)',
    b: 'rgba(40,180,255,0.75)',
  },
};

export class OutlineLayer {
  constructor(options = {}) {
    this.opt = { ...DEFAULTS, ...options, colors: { ...DEFAULTS.colors, ...(options.colors || {}) } };
    this.canvas = null;
    this.ctx = null;
    this.targets = [];
    this.raf = 0;
    this.dpr = 1;
    this.W = 0;
    this.H = 0;
    this.mouse = { x: -9999, y: -9999, px: -9999, py: -9999, speed: 0 };
    this.burst = 0;
    this.reduced = false;
    this._onMove = this._onMove.bind(this);
    this._onResize = this._onResize.bind(this);
    this._frame = this._frame.bind(this);
  }

  mount() {
    if (this.canvas) return this;
    const c = document.createElement('canvas');
    Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: String(this.opt.zIndex), pointerEvents: 'none' });
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext('2d', { willReadFrequently: true });
    this.refresh();
    this._resizeCanvas();
    if (this.opt.respectReducedMotion && window.matchMedia) {
      this._mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduced = this._mq.matches;
      this._mq.addEventListener?.('change', (e) => { this.reduced = e.matches; });
    }
    window.addEventListener('pointermove', this._onMove, { passive: true });
    window.addEventListener('resize', this._onResize);
    this.raf = requestAnimationFrame(this._frame);
    return this;
  }

  refresh() {
    this.targets = [...document.querySelectorAll(this.opt.selector)];
    return this;
  }

  set(patch = {}) {
    this.opt = { ...this.opt, ...patch, colors: { ...this.opt.colors, ...(patch.colors || {}) } };
    return this;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('resize', this._onResize);
    this.canvas?.remove();
    this.canvas = this.ctx = null;
  }

  _onMove(e) { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }
  _onResize() { this._resizeCanvas(); }

  _resizeCanvas() {
    this.dpr = Math.min(window.devicePixelRatio || 1, this.opt.maxDpr);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  _rectPoints(r, seg) {
    const pts = [];
    const { left: x, top: y, width: w, height: h } = r;
    for (let i = 0; i < seg; i++) pts.push([x + (w * i) / seg, y]);
    for (let i = 0; i < seg; i++) pts.push([x + w, y + (h * i) / seg]);
    for (let i = 0; i < seg; i++) pts.push([x + w - (w * i) / seg, y + h]);
    for (let i = 0; i < seg; i++) pts.push([x, y + h - (h * i) / seg]);
    return pts;
  }

  _displace(x, y) {
    if (this.reduced || this.opt.force <= 0) return [x, y];
    const { reach, force, mode } = this.opt;
    const dx = x - this.mouse.x;
    const dy = y - this.mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < reach) {
      const t = 1 - dist / reach;
      const push = t * t * 30 * force;
      const ux = dx / (dist || 1);
      const uy = dy / (dist || 1);
      if (mode === 'attract') return [x - ux * push, y - uy * push];
      return [x + ux * push, y + uy * push];
    }
    return [x, y];
  }

  _drawOutlines(rects, ox, oy, color) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (const r of rects) {
      if (r.bottom < -50 || r.top > this.H + 50) continue;
      const pts = this._rectPoints(r, this.opt.segments);
      ctx.beginPath();
      pts.forEach((p, idx) => {
        const [x, y] = this._displace(p[0], p[1]);
        idx === 0 ? ctx.moveTo(x + ox, y + oy) : ctx.lineTo(x + ox, y + oy);
      });
      ctx.closePath();
      ctx.stroke();
    }
  }

  _frame() {
    const ctx = this.ctx;
    const { colors } = this.opt;
    ctx.clearRect(0, 0, this.W, this.H);
    const rects = this.targets.map((el) => el.getBoundingClientRect());

    this.mouse.speed = Math.hypot(this.mouse.x - this.mouse.px, this.mouse.y - this.mouse.py);
    this.mouse.px = this.mouse.x;
    this.mouse.py = this.mouse.y;

    let intensity = 0;
    if (!this.reduced) {
      let g = this.opt.glitch;
      if (this.opt.speedGlitch) g *= Math.min(this.mouse.speed / 30, 1.5);
      if (this.opt.autoGlitch && Math.random() < 0.04 * g) this.burst = Math.max(this.burst, 0.8);
      intensity = Math.max(g * 0.5, this.burst);
      this.burst *= 0.82;
    }

    if (intensity > 0.02) {
      const amp = intensity * 8;
      this._drawOutlines(rects, -amp, 0, colors.r);
      this._drawOutlines(rects, amp, 0, colors.b);
      this._drawOutlines(rects, 0, 0, colors.body);
      if (Math.random() < 0.6) {
        const sliceH = 6 + Math.random() * 40;
        const sy = Math.random() * this.H;
        const shift = (Math.random() - 0.5) * intensity * 60;
        const img = ctx.getImageData(0, sy * this.dpr, this.canvas.width, sliceH * this.dpr);
        ctx.putImageData(img, shift * this.dpr, sy * this.dpr);
      }
    } else {
      this._drawOutlines(rects, 0, 0, colors.line);
    }

    this.raf = requestAnimationFrame(this._frame);
  }
}

export default OutlineLayer;
