// Bayesian last layer, 1-D toy: fixed features φ(x), conjugate Gaussian weights, closed-form information gain.
// Same algebra as the agent: S = (αI + ΦᵀΦ)⁻¹, predictive variance (1 + φᵀSφ)σ², information gain ½ log(1 + φᵀSφ).
import { css, fitCanvas, scale, axes, rng } from "./common.js";

const K = 40, ALPHA = 1.0, SIGMA = 0.15, X0 = -3, X1 = 3, NG = 241, NSAMP = 6;
const truth = (x) => Math.sin(1.6 * x) + 0.25 * x;

// Fixed random features tanh(a (x − c)): the agent learns its features; here they are frozen so only the last layer learns.
const R = rng(7);
const FEAT = Array.from({ length: K }, () => ({ a: 0.8 + 2.2 * R(), c: -3.6 + 7.2 * R(), s: R() < 0.5 ? -1 : 1 }));
const phi = (x) => FEAT.map((f) => f.s * Math.tanh(f.a * (x - f.c)));

function cholesky(A) {
  const n = A.length, L = A.map(() => new Float64Array(n));
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      L[i][j] = i === j ? Math.sqrt(Math.max(s, 1e-12)) : s / L[j][j];
    }
  return L;
}
const fwd = (L, b) => { // L v = b
  const n = b.length, v = new Float64Array(n);
  for (let i = 0; i < n; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= L[i][k] * v[k]; v[i] = s / L[i][i]; }
  return v;
};
const bwd = (L, b) => { // Lᵀ v = b
  const n = b.length, v = new Float64Array(n);
  for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * v[k]; v[i] = s / L[i][i]; }
  return v;
};

export function initBLL(root) {
  const cTop = root.querySelector("canvas.bll-fit");
  const cIG = root.querySelector("canvas.bll-ig");
  const readout = root.querySelector(".bll-readout");
  const noise = rng(11);
  let data = [];
  const grid = Array.from({ length: NG }, (_, i) => X0 + ((X1 - X0) * i) / (NG - 1));
  const PG = grid.map(phi);
  let post, geom;

  function fit() {
    const A = Array.from({ length: K }, (_, i) => { const r = new Float64Array(K); r[i] = ALPHA; return r; });
    const b = new Float64Array(K);
    for (const d of data) {
      const p = d.phi;
      for (let i = 0; i < K; i++) { b[i] += p[i] * d.y; for (let j = 0; j <= i; j++) A[i][j] += p[i] * p[j]; }
    }
    for (let i = 0; i < K; i++) for (let j = 0; j < i; j++) A[j][i] = A[i][j];
    const L = cholesky(A);
    const M = bwd(L, fwd(L, b));
    const mean = [], q = [], ig = [];
    for (const p of PG) {
      let m = 0; for (let i = 0; i < K; i++) m += M[i] * p[i];
      const v = fwd(L, p); let s = 0; for (let i = 0; i < K; i++) s += v[i] * v[i];
      mean.push(m); q.push(s); ig.push(0.5 * Math.log(1 + s));
    }
    const sr = rng(3), samples = [];
    for (let n = 0; n < NSAMP; n++) {
      const e = Float64Array.from({ length: K }, () => sr.normal());
      const d = bwd(L, e), w = M.map((m, i) => m + SIGMA * d[i]);
      samples.push(PG.map((p) => p.reduce((s, pi, i) => s + pi * w[i], 0)));
    }
    post = { mean, q, ig, samples };
  }

  function addAt(x) {
    data.push({ x, y: truth(x) + SIGMA * noise.normal(), phi: phi(x) });
    fit(); draw();
  }

  function draw() {
    const blue = css("--c-dyn"), ink = css("--ink"), ink3 = css("--ink-3");
    // top: fit
    let { ctx, w, h } = fitCanvas(cTop, 0.42);
    const m = { l: 44, r: 12, t: 10, b: 36 };
    const box = { x: m.l, y: m.t, w: w - m.l - m.r, h: h - m.t - m.b };
    const xs = scale(X0, X1, box.x, box.x + box.w), ys = scale(-3, 3, box.y + box.h, box.y);
    geom = { xs, box };
    ctx.clearRect(0, 0, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    // ±2 sd predictive band
    ctx.fillStyle = css("--band");
    ctx.beginPath();
    grid.forEach((x, i) => { const sd = SIGMA * Math.sqrt(1 + post.q[i]); ctx.lineTo(xs(x), ys(post.mean[i] + 2 * sd)); });
    for (let i = NG - 1; i >= 0; i--) { const sd = SIGMA * Math.sqrt(1 + post.q[i]); ctx.lineTo(xs(grid[i]), ys(post.mean[i] - 2 * sd)); }
    ctx.fill();
    // posterior samples of the last-layer weights
    ctx.strokeStyle = blue; ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
    for (const s of post.samples) { ctx.beginPath(); grid.forEach((x, i) => ctx.lineTo(xs(x), ys(s[i]))); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // truth
    ctx.setLineDash([4, 4]); ctx.strokeStyle = ink3; ctx.lineWidth = 1;
    ctx.beginPath(); grid.forEach((x) => ctx.lineTo(xs(x), ys(truth(x)))); ctx.stroke(); ctx.setLineDash([]);
    // mean
    ctx.strokeStyle = ink; ctx.lineWidth = 2;
    ctx.beginPath(); grid.forEach((x, i) => ctx.lineTo(xs(x), ys(post.mean[i]))); ctx.stroke();
    // data
    ctx.fillStyle = css("--c-pref");
    for (const d of data) { ctx.beginPath(); ctx.arc(xs(d.x), ys(d.y), 4, 0, 7); ctx.fill(); }
    ctx.restore();
    axes(ctx, box, xs, ys, {
      xt: [-3, -2, -1, 0, 1, 2, 3].map((v) => ({ v, l: v })),
      yt: [-2, 0, 2].map((v) => ({ v, l: v })),
      yl: "output", ylOff: 30,
    });

    // bottom: information gain
    ({ ctx, w, h } = fitCanvas(cIG, 0.2));
    const box2 = { x: m.l, y: 8, w: w - m.l - m.r, h: h - 8 - 36 };
    const igMax = Math.max(1.5, ...post.ig);
    const ys2 = scale(0, igMax, box2.y + box2.h, box2.y);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = blue; ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.moveTo(xs(X0), ys2(0));
    grid.forEach((x, i) => ctx.lineTo(xs(x), ys2(post.ig[i])));
    ctx.lineTo(xs(X1), ys2(0)); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = blue; ctx.lineWidth = 2;
    ctx.beginPath(); grid.forEach((x, i) => ctx.lineTo(xs(x), ys2(post.ig[i]))); ctx.stroke();
    const iMax = post.ig.indexOf(Math.max(...post.ig));
    ctx.fillStyle = blue; ctx.beginPath(); ctx.arc(xs(grid[iMax]), ys2(post.ig[iMax]), 4, 0, 7); ctx.fill();
    axes(ctx, box2, xs, ys2, {
      xt: [-3, -2, -1, 0, 1, 2, 3].map((v) => ({ v, l: v })),
      yt: [0, 0.5, 1, 1.5].filter((v) => v <= igMax).map((v) => ({ v, l: v })),
      xl: "input", yl: "nats", ylOff: 30,
    });
    readout.textContent =
      `${data.length} observation${data.length === 1 ? "" : "s"} · largest information gain ${post.ig[iMax].toFixed(2)} nats at input ${grid[iMax].toFixed(2)}`;
  }

  cTop.addEventListener("click", (ev) => {
    const r = cTop.getBoundingClientRect(), x = geom.xs.inv(ev.clientX - r.left);
    if (x >= X0 && x <= X1) addAt(x);
  });
  root.querySelector(".bll-max").addEventListener("click", () => addAt(grid[post.ig.indexOf(Math.max(...post.ig))]));
  root.querySelector(".bll-rand").addEventListener("click", () => addAt(-1.2 + 1.4 * noise()));
  root.querySelector(".bll-reset").addEventListener("click", () => { data = []; fit(); draw(); });
  fit(); draw();
  new ResizeObserver(() => draw()).observe(root);
}
