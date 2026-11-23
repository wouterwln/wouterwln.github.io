// Information gain over the pendulum's true state space (θ, ω), after 0, 1, 3 and 10 episodes (seed 0).
import { css, fitCanvas, scale, axes, viridis } from "./common.js";

export const MAPS = {
  dyn: { label: "information gain about the dynamics", log: true, lo: -2, hi: 0.6 },
  nov: { label: "information gain about the observation model", log: true, lo: -2, hi: 0.6 },
  pref: { label: "−log p̂(y)", log: false, lo: 0, hi: 6.91 },
};
export const TH = [-Math.PI, Math.PI], W = [-8, 8];

// Offscreen image of one map (rows ω from −8 at the bottom; columns θ).
export function heatImage(H, e, key) {
  const grid = key === "pref" ? H.pref : H.eps[e][key];
  const n0 = grid[0].length, n1 = grid.length, M = MAPS[key];
  const off = document.createElement("canvas");
  off.width = n0; off.height = n1;
  const g = off.getContext("2d"), img = g.createImageData(n0, n1);
  for (let r = 0; r < n1; r++)
    for (let c = 0; c < n0; c++) {
      const v = grid[r][c], lg = H.log10 && key !== "pref";
      const f = M.log ? ((lg ? v : Math.log10(Math.max(v, 1e-6))) - M.lo) / (M.hi - M.lo) : (v - M.lo) / (M.hi - M.lo);
      const [R, G, B] = viridis(f), k = 4 * ((n1 - 1 - r) * n0 + c);
      img.data[k] = R; img.data[k + 1] = G; img.data[k + 2] = B; img.data[k + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  return off;
}

// Polyline in (θ, ω) that breaks where θ wraps around ±π.
export function wrapLine(ctx, xs, ys, th, w) {
  ctx.beginPath();
  for (let i = 0; i < th.length; i++) {
    if (i === 0 || Math.abs(th[i] - th[i - 1]) > Math.PI) ctx.moveTo(xs(th[i]), ys(w[i]));
    else ctx.lineTo(xs(th[i]), ys(w[i]));
  }
  ctx.stroke();
}

export const phaseTicks = {
  xt: [
    { v: -Math.PI, l: "−π" }, { v: -Math.PI / 2, l: "−π/2" }, { v: 0, l: "0 (up)" }, { v: Math.PI / 2, l: "π/2" }, { v: Math.PI, l: "π" },
  ],
  yt: [-8, -4, 0, 4, 8].map((v) => ({ v, l: v })),
  xl: "angle θ (rad)", yl: "angular velocity ω (rad/s)",
};

export function colorbar(el, key) {
  const M = MAPS[key];
  const stops = Array.from({ length: 11 }, (_, i) => { const [r, g, b] = viridis(i / 10); return `rgb(${r},${g},${b}) ${i * 10}%`; });
  const ticks = M.log ? [0.01, 0.1, 1].map((v) => ({ f: (Math.log10(v) - M.lo) / (M.hi - M.lo), l: v })) :
    [0, 3, 6].map((v) => ({ f: (v - M.lo) / (M.hi - M.lo), l: v }));
  el.innerHTML = `<div class="cb-bar" style="background:linear-gradient(to right,${stops.join(",")})"></div>` +
    `<div class="cb-ticks">${ticks.map((t) => `<span style="left:${(100 * t.f).toFixed(1)}%">${t.l}</span>`).join("")}</div>` +
    `<div class="cb-label">${M.label} (nats${M.log ? ", log scale" : ""})</div>`;
}

export function initHeatmap(root, H) {
  const canvas = root.querySelector("canvas");
  const readout = root.querySelector(".hm-readout");
  const mapBtns = root.querySelectorAll("[data-map]");
  const epSlider = root.querySelector(".hm-ep"), epLab = root.querySelector(".hm-eplab");
  const eps = Object.keys(H.eps).map(Number).sort((a, b) => a - b);
  epSlider.min = 0; epSlider.max = eps.length - 1; epSlider.value = eps.indexOf(1);
  let e = "1", key = "dyn", geom = null, img = null;
  const cache = {};

  function draw() {
    img = cache[e + key] ||= heatImage(H, e, key);
    const { ctx, w, h } = fitCanvas(canvas, 0.62);
    const m = { l: 54, r: 10, t: 8, b: 40 };
    const box = { x: m.l, y: m.t, w: w - m.l - m.r, h: h - m.t - m.b };
    const xs = scale(TH[0], TH[1], box.x, box.x + box.w), ys = scale(W[0], W[1], box.y + box.h, box.y);
    geom = { xs, ys, box };
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
    const D = H.eps[e];
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (const [t, v] of D.visited) ctx.fillRect(xs(t) - 1, ys(v) - 1, 2, 2);
    if (D.next.length) {
      ctx.strokeStyle = css("--c-next"); ctx.lineWidth = 2.2;
      wrapLine(ctx, xs, ys, D.next.map((p) => p[0]), D.next.map((p) => p[1]));
      const [t0, v0] = D.next[0];
      ctx.fillStyle = css("--c-next"); ctx.beginPath(); ctx.arc(xs(t0), ys(v0), 4, 0, 7); ctx.fill();
    }
    ctx.restore();
    axes(ctx, box, xs, ys, { ...phaseTicks, ylOff: 40 });
    colorbar(root.querySelector(".hm-colorbar"), key);
    epLab.textContent = e === "0" ? "before any data" : `after ${e} episode${e === "1" ? "" : "s"}`;
    mapBtns.forEach((b) => b.classList.toggle("on", b.dataset.map === key));
  }

  canvas.addEventListener("mousemove", (ev) => {
    if (!geom) return;
    const r = canvas.getBoundingClientRect();
    const th = geom.xs.inv(ev.clientX - r.left), w = geom.ys.inv(ev.clientY - r.top);
    if (th < TH[0] || th > TH[1] || w < W[0] || w > W[1]) { readout.textContent = " "; return; }
    const n = H.g0.length;
    const c = Math.round(((th - TH[0]) / (TH[1] - TH[0])) * (n - 1)), rr = Math.round(((w - W[0]) / (W[1] - W[0])) * (n - 1));
    const v = key === "pref" ? H.pref[rr][c] : H.log10 ? Math.pow(10, H.eps[e][key][rr][c]) : H.eps[e][key][rr][c];
    readout.textContent = `θ = ${th.toFixed(2)}, ω = ${w.toFixed(1)}: ${v.toFixed(3)} nats`;
  });
  canvas.addEventListener("mouseleave", () => (readout.textContent = " "));
  epSlider.addEventListener("input", () => { e = String(eps[+epSlider.value]); draw(); });
  mapBtns.forEach((b) => b.addEventListener("click", () => { key = b.dataset.map; draw(); }));
  draw();
  new ResizeObserver(() => draw()).observe(root);
}
