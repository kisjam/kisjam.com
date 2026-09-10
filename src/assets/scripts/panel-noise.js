/**
 * PanelNoise
 * 指定要素の内側に canvas を敷き、流体・デジタル・グラデーションをモチーフにした
 * ノイズアニメーションを描く装飾レイヤー。
 *
 * - 流体: 事前生成した値ノイズのタイル 2 枚を使い、片方でもう片方の座標を歪める
 *   (ドメインワープ) ことで流れる液体のような模様を作る
 * - デジタル: 濃度を数段階に量子化し、粗いセル単位で描く。ときどき矩形ブロックが点灯する
 * - グラデーション: 画面中央に近い辺ほど濃く、縦方向にも濃淡を掛ける
 * - canvas はパネル全体を覆い、毎フレームの再計算は画面内の行(＋余白)だけに絞る
 * - IntersectionObserver で可視のパネルだけ描画し、タブ非表示や
 *   prefers-reduced-motion では停止する
 *
 *   import { PanelNoise } from './panel-noise.js'
 *   new PanelNoise({ selector: '.site-main__side' }).mount()
 */

const DEFAULTS = {
  selector: '[data-noise]',
  cell: 4, // 1 セルの CSS px
  fps: 30,
  color: [20, 102, 255], // RGB
  alphaMax: 0.38, // 最大不透明度
  levels: 5, // 濃度の段階数 (デジタル感)
  threshold: 0.42, // これ未満の濃度は描かない (液体の「地」を作る)
  scale: 0.012, // ノイズの空間周波数 (小さいほど大きな模様)
  warp: 0.35, // ドメインワープの強さ
  speed: 0.18, // 流れの速さ
  gradient: [0.45, 1.0], // 画面上端→下端の濃度倍率
  edgeGradient: 'auto', // 'auto' | 'left' | 'right' | 'none'
  edgeMin: 0.12, // 遠い辺の濃度倍率
  blockRate: 0.04, // フレームあたりのデジタルブロック発生確率
  blockLife: [2, 10],
  respectReducedMotion: true,
};

/** 滑らかな値ノイズを FBM で焼き込んだタイル (0..1) */
function makeTile(size, octaves, seed) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const grid = 16;
  const lattice = new Float32Array(grid * grid);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const fade = (t) => t * t * (3 - 2 * t);
  const sampleLattice = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = fade(x - xi), fy = fade(y - yi);
    const x0 = ((xi % grid) + grid) % grid, x1 = (x0 + 1) % grid;
    const y0 = ((yi % grid) + grid) % grid, y1 = (y0 + 1) % grid;
    const a = lattice[y0 * grid + x0], b = lattice[y0 * grid + x1];
    const c = lattice[y1 * grid + x0], d = lattice[y1 * grid + x1];
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  };
  const tile = new Float32Array(size * size);
  let min = Infinity, max = -Infinity;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0, amp = 1, freq = grid / size, norm = 0;
      for (let o = 0; o < octaves; o++) {
        v += sampleLattice(x * freq, y * freq) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2;
      }
      v /= norm;
      tile[y * size + x] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  for (let i = 0; i < tile.length; i++) tile[i] = (tile[i] - min) / (max - min || 1);
  return tile;
}

/** タイルをバイリニア補間でサンプリング (座標はタイル単位で無限に繰り返す) */
function sampleTile(tile, size, x, y) {
  x = ((x % size) + size) % size;
  y = ((y % size) + size) % size;
  const xi = x | 0, yi = y | 0;
  const fx = x - xi, fy = y - yi;
  const x1 = (xi + 1) % size, y1 = (yi + 1) % size;
  const a = tile[yi * size + xi], b = tile[yi * size + x1];
  const c = tile[y1 * size + xi], d = tile[y1 * size + x1];
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

const TILE = 256;
let tiles = null;
function getTiles() {
  if (!tiles) tiles = { a: makeTile(TILE, 4, 0x9e3779b9), b: makeTile(TILE, 3, 0x85ebca6b) };
  return tiles;
}

class Panel {
  constructor(el, opt) {
    this.el = el;
    this.opt = opt;
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, {
      position: 'absolute',
      inset: '0',
      display: 'block',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      imageRendering: 'pixelated',
    });
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d');
    this.buf = document.createElement('canvas');
    this.bctx = this.buf.getContext('2d');
    this.visible = false;
    this.cols = 0;
    this.rows = 0;
    this.blocks = [];
    this.edge = 'none';
    this.colGain = null;
    el.appendChild(this.canvas);
    this.resize();
  }

  resize() {
    const { cell } = this.opt;
    const r = this.el.getBoundingClientRect();
    // セル描画なので dpr は 1 で十分 (縦長パネルのメモリを抑える)
    const w = r.width;
    const h = r.height;
    this.canvas.width = Math.max(1, Math.round(w));
    this.canvas.height = Math.max(1, Math.round(h));
    if (this.opt.edgeGradient === 'auto') {
      this.edge = r.left + w / 2 < window.innerWidth / 2 ? 'right' : 'left';
    } else {
      this.edge = this.opt.edgeGradient;
    }
    const cols = Math.max(1, Math.ceil(w / cell));
    const rows = Math.max(1, Math.ceil(h / cell));
    if (cols !== this.cols || rows !== this.rows) {
      this.cols = cols;
      this.rows = rows;
      this.buf.width = cols;
      this.buf.height = rows;
      this.img = this.bctx.createImageData(cols, rows);
      this.blocks = [];
      this.dirtyAll = true; // 次の draw で全行を描く
    }
    const { edgeMin } = this.opt;
    this.colGain = new Float32Array(cols);
    for (let x = 0; x < cols; x++) {
      let t = 1;
      if (this.edge === 'right') t = x / (cols - 1 || 1);
      else if (this.edge === 'left') t = 1 - x / (cols - 1 || 1);
      this.colGain[x] = edgeMin + (1 - edgeMin) * t * t;
    }
    this.ctx.imageSmoothingEnabled = false;
  }

  step() {
    const o = this.opt;
    if (Math.random() < o.blockRate) {
      const w = 2 + Math.floor(Math.random() * 12);
      const h = 1 + Math.floor(Math.random() * 3);
      const rect = this.el.getBoundingClientRect();
      const vy0 = Math.max(0, Math.floor(-rect.top / o.cell));
      const vy1 = Math.min(this.rows, Math.ceil((window.innerHeight - rect.top) / o.cell));
      if (vy1 - vy0 <= h) return;
      this.blocks.push({
        x: Math.floor(Math.random() * Math.max(1, this.cols - w)),
        y: vy0 + Math.floor(Math.random() * (vy1 - vy0 - h)),
        w,
        h,
        life: o.blockLife[0] + Math.floor(Math.random() * (o.blockLife[1] - o.blockLife[0])),
        v: 0.5 + Math.random() * 0.5,
      });
    }
    this.blocks = this.blocks.filter((b) => --b.life > 0);
  }

  draw(time) {
    const { cols, rows, img, colGain } = this;
    const o = this.opt;
    const { a, b } = getTiles();
    const d = img.data;
    const [cr, cg, cb] = o.color;
    const [g0, g1] = o.gradient;
    const t = time * o.speed;
    // 模様はページ座標に固定する (スクロールしても模様が一緒に動かず、左右のパネルで模様が異なる)
    const rect = this.canvas.getBoundingClientRect();
    const offY = (rect.top + window.scrollY) / o.cell;
    const offX = (rect.left + window.scrollX) / o.cell;
    const sx = o.scale * o.cell * TILE * 0.08;
    const warp = o.warp * TILE * 0.25;
    const levels = o.levels;
    // 更新する行の範囲: 画面内 ± 余白 (初回とリサイズ時は全行)
    let y0 = 0;
    let y1 = rows;
    if (!this.dirtyAll) {
      const margin = 40;
      y0 = Math.max(0, Math.floor(-rect.top / o.cell) - margin);
      y1 = Math.min(rows, Math.ceil((window.innerHeight - rect.top) / o.cell) + margin);
      if (y1 <= y0) return;
    }
    this.dirtyAll = false;
    // 縦グラデーションは画面内の位置で決める (パネル全体ではなく見えている範囲で上→下)
    const vh = Math.max(1, window.innerHeight / o.cell);
    for (let y = y0; y < y1; y++) {
      const py = (y + offY) * sx;
      const vy = Math.min(1, Math.max(0, (y + rect.top / o.cell) / vh));
      const rowGain = g0 + (g1 - g0) * vy;
      for (let x = 0; x < cols; x++) {
        const px = (x + offX) * sx;
        // 歪み場 (ゆっくり回るように動く)
        const w = sampleTile(b, TILE, px * 0.6 + t * 7, py * 0.6 - t * 5) - 0.5;
        // 本体 (歪み場で座標をずらしつつ、重力の無い緩い斜めドリフト)
        let n = sampleTile(a, TILE, px + w * warp + t * 6, py + w * warp * 0.8 - t * 4);
        // 量子化 (デジタル)
        n = n < o.threshold ? 0 : (n - o.threshold) / (1 - o.threshold);
        const level = Math.round(n * levels) / levels;
        const p = (y * cols + x) * 4;
        d[p] = cr;
        d[p + 1] = cg;
        d[p + 2] = cb;
        d[p + 3] = level ? Math.round(level * o.alphaMax * rowGain * colGain[x] * 255) : 0;
      }
    }
    for (const bl of this.blocks) {
      if (bl.y + bl.h <= y0 || bl.y >= y1) continue;
      for (let y = Math.max(bl.y, y0); y < bl.y + bl.h && y < y1; y++) {
        for (let x = bl.x; x < bl.x + bl.w && x < cols; x++) {
          const p = (y * cols + x) * 4;
          d[p] = cr;
          d[p + 1] = cg;
          d[p + 2] = cb;
          d[p + 3] = Math.round(bl.v * o.alphaMax * 255);
        }
      }
    }
    // 更新した行だけ転送して拡大描画する
    const h = y1 - y0;
    this.bctx.putImageData(img, 0, 0, 0, y0, cols, h);
    const ctx = this.ctx;
    const cell = o.cell;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, y0 * cell, this.canvas.width, h * cell);
    ctx.drawImage(this.buf, 0, y0, cols, h, 0, y0 * cell, cols * cell, h * cell);
  }
}

export class PanelNoise {
  constructor(options = {}) {
    this.opt = { ...DEFAULTS, ...options };
    this.panels = [];
    this.raf = 0;
    this.last = 0;
    this.time = 0;
    this.reduced = false;
    this.hidden = document.visibilityState === 'hidden';
    this._frame = this._frame.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
  }

  mount() {
    const els = [...document.querySelectorAll(this.opt.selector)];
    if (!els.length) return this;
    if (this.opt.respectReducedMotion && window.matchMedia) {
      this._mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduced = this._mq.matches;
      this._mq.addEventListener?.('change', (e) => {
        this.reduced = e.matches;
        this._sync();
      });
    }
    this.panels = els.map((el) => new Panel(el, this.opt));
    this._io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const p = this.panels.find((x) => x.el === e.target);
          if (p) p.visible = e.isIntersecting;
        }
        this._sync();
      },
      { threshold: 0 },
    );
    this._ro = new ResizeObserver(() => {
      for (const p of this.panels) {
        p.resize();
        p.draw(this.time);
      }
    });
    for (const p of this.panels) {
      this._io.observe(p.el);
      this._ro.observe(p.el);
      p.draw(0);
    }
    document.addEventListener('visibilitychange', this._onVisibility);
    this._sync();
    return this;
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this._io?.disconnect();
    this._ro?.disconnect();
    document.removeEventListener('visibilitychange', this._onVisibility);
    for (const p of this.panels) p.canvas.remove();
    this.panels = [];
  }

  _onVisibility() {
    this.hidden = document.visibilityState === 'hidden';
    this._sync();
  }

  _active() {
    return !this.hidden && !this.reduced && this.panels.some((p) => p.visible);
  }

  _sync() {
    if (this._active()) {
      if (!this.raf) this.raf = requestAnimationFrame(this._frame);
    } else if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  _frame(now) {
    this.raf = 0;
    if (!this._active()) return;
    const interval = 1000 / this.opt.fps;
    if (now - this.last >= interval) {
      this.time += Math.min(now - this.last, 100) / 1000;
      this.last = now;
      for (const p of this.panels) {
        if (!p.visible) continue;
        p.step();
        p.draw(this.time);
      }
    }
    this.raf = requestAnimationFrame(this._frame);
  }
}

export default PanelNoise;
