// Shared helpers: canvas setup, colour maps, theme colours, small maths.

export function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Canvas sized to its CSS box at device pixel ratio; returns ctx with user units = CSS pixels.
export function fitCanvas(canvas, aspect) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth;
  const h = Math.round(w * aspect);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

export function onResize(fn) {
  let t;
  const ro = new ResizeObserver(() => {
    clearTimeout(t);
    t = setTimeout(fn, 60);
  });
  return ro;
}

// Viridis, 9 stops (perceptually uniform, readable in light and dark themes).
const VIRIDIS = [
  [68, 1, 84], [71, 44, 122], [59, 81, 139], [44, 113, 142], [33, 144, 141],
  [39, 173, 129], [92, 200, 99], [170, 220, 50], [253, 231, 37],
];
export function viridis(v) {
  v = Math.min(1, Math.max(0, v));
  const x = v * (VIRIDIS.length - 1);
  const i = Math.min(VIRIDIS.length - 2, Math.floor(x));
  const f = x - i;
  const a = VIRIDIS[i], b = VIRIDIS[i + 1];
  return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1]), a[2] + f * (b[2] - a[2])];
}

export const lerp = (a, b, f) => a + (b - a) * f;
export const ease = (f) => (f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2);
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

export async function loadJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path + ": " + r.status);
  return r.json();
}

// Linear map helper.
export function scale(d0, d1, r0, r1) {
  const f = (x) => r0 + ((x - d0) / (d1 - d0)) * (r1 - r0);
  f.inv = (y) => d0 + ((y - r0) / (r1 - r0)) * (d1 - d0);
  return f;
}

// Axes with ticks and labels.
export function axes(ctx, box, xs, ys, opt = {}) {
  const ink = css("--ink-3");
  ctx.save();
  ctx.strokeStyle = css("--rule");
  ctx.lineWidth = 1;
  ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w, box.h);
  ctx.fillStyle = ink;
  ctx.font = "11px " + css("--font-sans");
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (const t of opt.xt || []) {
    const x = xs(t.v);
    ctx.fillText(t.l, x, box.y + box.h + 4);
    ctx.beginPath();
    ctx.moveTo(x + 0.5, box.y + box.h);
    ctx.lineTo(x + 0.5, box.y + box.h + 3);
    ctx.stroke();
  }
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const t of opt.yt || []) {
    const y = ys(t.v);
    ctx.fillText(t.l, box.x - 5, y);
    ctx.beginPath();
    ctx.moveTo(box.x - 3, y + 0.5);
    ctx.lineTo(box.x, y + 0.5);
    ctx.stroke();
  }
  ctx.fillStyle = css("--ink-2");
  ctx.font = "12px " + css("--font-sans");
  if (opt.xl) {
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(opt.xl, box.x + box.w / 2, box.y + box.h + 19);
  }
  if (opt.yl) {
    ctx.translate(box.x - (opt.ylOff || 34), box.y + box.h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(opt.yl, 0, 0);
  }
  ctx.restore();
}

// Seeded PRNG (mulberry32) and Box-Muller normals.
export function rng(seed) {
  let a = seed >>> 0;
  const u = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  u.normal = () => {
    const r = Math.sqrt(-2 * Math.log(u() + 1e-12));
    return r * Math.cos(2 * Math.PI * u());
  };
  return u;
}
