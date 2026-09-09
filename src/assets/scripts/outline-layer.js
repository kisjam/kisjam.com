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
  lineWidth: 1,
  reach: 150,
  force: 0,
  mode: 'repel',
  glitch: 0.1,
  autoGlitch: true,
  scrollGlitch: false,
  scrollGain: 0.005,
  scrollMax: 0.8,
  // 静止中にたまにスライスずれだけを一瞬入れる（色収差なし）
  idleSlice: false,
  idleSliceInterval: [3000, 9000],
  idleSliceCount: 3,
  idleSliceStrength: 0.8,
  idleSliceHold: [80, 420],
  idle: 0,
  burstRate: 0.04,
  burstDecay: 0.82,
  amp: 8,
  sliceShift: 60,
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
    this.dir = { x: 1, y: 0 };
    this.reduced = false;
    this.running = false;
    this.lastScroll = 0;
    this._sliceTimer = 0;
    this._holdTimer = 0;
    this._onMove = this._onMove.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onScroll = this._onScroll.bind(this);
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
    this.lastScroll = window.scrollY;
    window.addEventListener('pointermove', this._onMove, { passive: true });
    window.addEventListener('resize', this._onResize);
    window.addEventListener('scroll', this._onScroll, { passive: true });
    // ループ停止中にレイアウトが動いた場合（画像読込・フォント適用など）に再描画する
    if (typeof ResizeObserver !== 'undefined') {
      this._ro = new ResizeObserver(() => this._wake());
      this._ro.observe(document.documentElement);
    }
    this._wake();
    this._scheduleIdleSlice();
    return this;
  }

  refresh() {
    this.targets = [...document.querySelectorAll(this.opt.selector)];
    this._wake();
    return this;
  }

  /** ループが止まっていれば再開する。静止時はフレーム側で自動停止する */
  _wake() {
    if (this.running || !this.canvas) return;
    this.running = true;
    this.raf = requestAnimationFrame(this._frame);
  }

  /** 常時ループが必要か（autoGlitch か pointer 反応が有効なとき） */
  _needsLoop() {
    return !this.reduced && (this.opt.autoGlitch || this.opt.force > 0);
  }

  set(patch = {}) {
    this.opt = { ...this.opt, ...patch, colors: { ...this.opt.colors, ...(patch.colors || {}) } };
    return this;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this._sliceTimer);
    clearTimeout(this._holdTimer);
    this.running = false;
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onScroll);
    this._ro?.disconnect();
    this.canvas?.remove();
    this.canvas = this.ctx = null;
  }

  _onMove(e) { this.mouse.x = e.clientX; this.mouse.y = e.clientY; if (this.opt.force > 0) this._wake(); }
  _onResize() { this._resizeCanvas(); this._wake(); }
  _onScroll() {
    const y = window.scrollY;
    const delta = Math.abs(y - this.lastScroll);
    this.lastScroll = y;
    if (this.opt.scrollGlitch && !this.reduced && delta > 0) {
      const b = Math.min(this.opt.scrollMax, delta * this.opt.scrollGain);
      if (b > this.burst) {
        this.burst = b;
        // スクロール方向(縦)を基調に少しだけ傾ける
        const a = Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 3);
        this.dir = { x: Math.cos(a), y: Math.sin(a) };
      }
    }
    this._wake();
  }

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
    ctx.lineWidth = this.opt.lineWidth;
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

  /** 画面の横帯か縦帯をランダムにずらす */
  _applySlice(strength) {
    const ctx = this.ctx;
    // 帯幅は細いものが多く、たまに太い（2乗で偏らせる）
    const size = 3 + Math.random() ** 2 * 120;
    // ずれ量も小さいものが多く、たまに大きい。向きは乱数
    const sign = Math.random() < 0.5 ? -1 : 1;
    const shift = sign * (0.15 + Math.random() ** 2) * strength * this.opt.sliceShift;
    if (Math.random() < 0.5) {
      const sy = Math.random() * this.H;
      const img = ctx.getImageData(0, sy * this.dpr, this.canvas.width, size * this.dpr);
      ctx.putImageData(img, shift * this.dpr, sy * this.dpr);
    } else {
      const sx = Math.random() * this.W;
      const img = ctx.getImageData(sx * this.dpr, 0, size * this.dpr, this.canvas.height);
      ctx.putImageData(img, sx * this.dpr, shift * this.dpr);
    }
  }

  _scheduleIdleSlice() {
    if (!this.opt.idleSlice || !this.canvas) return;
    const [min, max] = this.opt.idleSliceInterval;
    clearTimeout(this._sliceTimer);
    this._sliceTimer = setTimeout(() => this._idleSliceTick(), min + Math.random() * (max - min));
  }

  /** 静止中なら素の線を描いた上にスライスを乗せ、hold 後に描き直して戻す */
  _idleSliceTick() {
    this._sliceTimer = 0;
    if (this.canvas && !this.reduced && !this.running) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.W, this.H);
      const rects = this.targets.map((el) => el.getBoundingClientRect());
      this._drawOutlines(rects, 0, 0, this.opt.colors.line);
      // 本数は 1 本が最多で、まれに最大本数まで
      const n = 1 + Math.floor(Math.random() ** 2 * this.opt.idleSliceCount);
      for (let i = 0; i < n; i++) this._applySlice(this.opt.idleSliceStrength);
      const [hMin, hMax] = this.opt.idleSliceHold;
      clearTimeout(this._holdTimer);
      this._holdTimer = setTimeout(() => this._wake(), hMin + Math.random() * (hMax - hMin));
    }
    this._scheduleIdleSlice();
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
      if (this.opt.autoGlitch && Math.random() < this.opt.burstRate * g) {
        this.burst = Math.max(this.burst, 0.8);
        const a = Math.random() * Math.PI * 2;
        this.dir = { x: Math.cos(a), y: Math.sin(a) };
      }
      intensity = Math.max(g * this.opt.idle, this.burst);
      this.burst *= this.opt.burstDecay;
    }

    if (intensity > 0.02) {
      const amp = intensity * this.opt.amp;
      const ox = this.dir.x * amp;
      const oy = this.dir.y * amp;
      this._drawOutlines(rects, -ox, -oy, colors.r);
      this._drawOutlines(rects, ox, oy, colors.b);
      this._drawOutlines(rects, 0, 0, colors.body);
      if (Math.random() < 0.6) this._applySlice(intensity);
    } else {
      this._drawOutlines(rects, 0, 0, colors.line);
      this.burst = 0;
      if (!this._needsLoop()) {
        this.running = false;
        this.raf = 0;
        return;
      }
    }

    this.raf = requestAnimationFrame(this._frame);
  }
}

export default OutlineLayer;
