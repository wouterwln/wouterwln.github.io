// Behaviour of the agent in episodes 1, 5 and 10 on three problems, drawn from the recorded true states (no predictions).
import { css, fitCanvas } from "./common.js";

const EPS = ["1", "5", "10"];
const STEPS_PER_SEC = 20; // dt = 0.05 s for the pendulum and the cart-pole: 1× is real time

const PROBLEMS = {
  pend_sparse: { name: "Pendulum swing-up", uMax: 2, aspect: 0.8, draw: drawPendulum },
  mc_sparse: { name: "Mountain car", uMax: 1, aspect: 0.62, draw: drawCar },
  cp_sparse: { name: "Cart-pole swing-up", uMax: 1, aspect: 0.6, draw: drawCartpole },
};

function drawPendulum(ctx, w, h, s, u, inGoal) {
  const cx = w / 2, cy = h / 2, R = 0.36 * Math.min(w, h), th = s[0];
  // goal wedge |θ| < 0.2 around upright
  ctx.fillStyle = css("--goal-bg");
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 1.25, -Math.PI / 2 - 0.2, -Math.PI / 2 + 0.2); ctx.fill();
  ctx.strokeStyle = css("--rule"); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
  // torque: arc around the pivot, length ∝ u
  const a = (u / 2) * 1.6, r2 = R * 0.28;
  if (Math.abs(a) > 0.03) {
    ctx.strokeStyle = css("--ink-3"); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, r2, -Math.PI / 2, -Math.PI / 2 + a, a < 0); ctx.stroke();
    const e = -Math.PI / 2 + a, ex = cx + r2 * Math.cos(e), ey = cy + r2 * Math.sin(e), d = Math.sign(a);
    const tx = -Math.sin(e) * d, ty = Math.cos(e) * d;
    ctx.fillStyle = css("--ink-3"); ctx.beginPath();
    ctx.moveTo(ex + tx * 6, ey + ty * 6); ctx.lineTo(ex - ty * 4, ey + tx * 4); ctx.lineTo(ex + ty * 4, ey - tx * 4); ctx.fill();
  }
  const bx = cx + R * Math.sin(th), by = cy - R * Math.cos(th);
  ctx.strokeStyle = css("--ink"); ctx.lineWidth = 4; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
  ctx.fillStyle = inGoal ? css("--goal") : css("--c-pref");
  ctx.beginPath(); ctx.arc(bx, by, Math.max(6, R * 0.1), 0, 7); ctx.fill();
  ctx.fillStyle = css("--ink"); ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
}

function drawCar(ctx, w, h, s, u, inGoal) {
  const X0 = -1.2, X1 = 0.6, hill = (x) => 0.45 * Math.sin(3 * x) + 0.55;
  const ml = 10, mr = Math.max(24, w * 0.08), px = (x) => ml + ((x - X0) / (X1 - X0)) * (w - ml - mr);
  const py = (y) => h - 10 - y * (h - 46) / 1.05;
  // ground
  ctx.fillStyle = css("--paper"); ctx.strokeStyle = css("--ink-2"); ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) { const x = X0 + ((X1 - X0) * i) / 120; ctx.lineTo(px(x), py(hill(x))); }
  ctx.stroke();
  // goal region x ≥ 0.45 and flag
  ctx.strokeStyle = css("--goal"); ctx.lineWidth = 5; ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const x = 0.45 + ((X1 - 0.45) * i) / 20; ctx.lineTo(px(x), py(hill(x))); }
  ctx.stroke(); ctx.globalAlpha = 1;
  const fx = px(0.45), fy = py(hill(0.45));
  ctx.strokeStyle = css("--ink-2"); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 30); ctx.stroke();
  ctx.fillStyle = css("--goal"); ctx.beginPath(); ctx.moveTo(fx, fy - 30); ctx.lineTo(fx + 14, fy - 25); ctx.lineTo(fx, fy - 20); ctx.fill();
  // car, tangent to the hill (angle in pixel space)
  const x = s[0], dx = 0.01;
  const ang = Math.atan2(py(hill(x + dx)) - py(hill(x - dx)), px(x + dx) - px(x - dx));
  const cw = Math.max(26, w * 0.09), ch = cw * 0.45;
  ctx.save(); ctx.translate(px(x), py(hill(x))); ctx.rotate(ang);
  ctx.fillStyle = inGoal ? css("--goal") : css("--c-pref");
  ctx.fillRect(-cw / 2, -ch - 5, cw, ch);
  ctx.fillStyle = css("--ink");
  for (const wx of [-cw * 0.3, cw * 0.3]) { ctx.beginPath(); ctx.arc(wx, -4, 4.5, 0, 7); ctx.fill(); }
  // throttle arrow
  if (Math.abs(u) > 0.05) {
    const L = (u / 1) * cw * 0.6;
    ctx.strokeStyle = css("--ink-3"); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -ch - 12); ctx.lineTo(L, -ch - 12); ctx.stroke();
    ctx.fillStyle = css("--ink-3"); ctx.beginPath();
    ctx.moveTo(L + Math.sign(L) * 5, -ch - 12); ctx.lineTo(L, -ch - 16); ctx.lineTo(L, -ch - 8); ctx.fill();
  }
  ctx.restore();
}

function drawCartpole(ctx, w, h, s, u, inGoal) {
  const XL = 2.4, m = 12, sc = (w - 2 * m) / (2 * XL + 0.6);
  const px = (x) => w / 2 + x * sc, ty = h * 0.62;
  ctx.strokeStyle = css("--ink-2"); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px(-XL - 0.3), ty); ctx.lineTo(px(XL + 0.3), ty); ctx.stroke();
  ctx.lineWidth = 3;
  for (const xw of [-XL - 0.25, XL + 0.25]) { ctx.beginPath(); ctx.moveTo(px(xw), ty); ctx.lineTo(px(xw), ty - 22); ctx.stroke(); }
  const x = s[0], th = s[2], cw = 0.5 * sc, chh = 0.25 * sc, L = 1.0 * sc;
  // goal: pole within 0.2 rad of upright
  const cx = px(x), cy = ty - chh;
  ctx.fillStyle = css("--goal-bg");
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, L * 1.15, -Math.PI / 2 - 0.2, -Math.PI / 2 + 0.2); ctx.fill();
  ctx.fillStyle = css("--ink-2"); ctx.fillRect(cx - cw / 2, cy, cw, chh);
  // force arrow
  if (Math.abs(u) > 0.05) {
    const Lf = u * cw * 0.9, yy = cy + chh / 2;
    ctx.strokeStyle = css("--paper"); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, yy); ctx.lineTo(cx + Lf, yy); ctx.stroke();
  }
  ctx.strokeStyle = inGoal ? css("--goal") : css("--c-pref"); ctx.lineWidth = Math.max(4, sc * 0.08); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + L * Math.sin(th), cy - L * Math.cos(th)); ctx.stroke();
  ctx.fillStyle = css("--ink"); ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill();
}

export function initBehavior(root, B) {
  const body = root.querySelector(".bh-grid");
  const slider = root.querySelector(".bh-t"), lab = root.querySelector(".bh-tlab");
  const playBtn = root.querySelector(".bh-play");
  const S = { t: 0, playing: false, speed: 2, cond: "all", last: 0 };
  const maxT = Math.max(...Object.values(B).map((p) => Object.values(p)[0].eps["1"].s.length));
  slider.max = maxT - 1;
  const cells = [];

  for (const [key, P] of Object.entries(PROBLEMS)) {
    if (!B[key]) continue;
    const row = document.createElement("div");
    row.className = "bh-row";
    row.innerHTML = `<div class="bh-head"><span class="bh-name">${P.name}</span>
      <span class="bh-spark" title="fraction of steps in the goal region, episodes 1 to 10"></span></div>
      <div class="bh-cells">${EPS.map((e) => `<div class="bh-cell"><div class="cv"><canvas></canvas></div><canvas class="bh-bar"></canvas><div class="bh-lab"></div></div>`).join("")}</div>`;
    body.appendChild(row);
    row.querySelectorAll(".bh-cell").forEach((el, i) => cells.push({ key, ep: EPS[i], el, cv: el.querySelector(".cv canvas"), bar: el.querySelector(".bh-bar") }));
    row._key = key;
  }

  function spark(el, frac) {
    const W = 74, H = 18, bw = W / frac.length;
    el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${frac.map((f, i) =>
      `<rect x="${(i * bw + 1).toFixed(1)}" y="${(H - Math.max(1, f * H)).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${Math.max(1, f * H).toFixed(1)}" fill="${[0, 4, 9].includes(i) ? "var(--goal)" : "var(--ink-3)"}"/>`).join("")}</svg>
      <span class="lab">time in goal, episodes 1 to 10</span>`;
  }

  function draw(full) {
    for (const c of cells) {
      const run = B[c.key][S.cond], E = run.eps[c.ep], n = E.s.length, t = Math.min(S.t, n - 1);
      const P = PROBLEMS[c.key];
      const { ctx, w, h } = fitCanvas(c.cv, P.aspect);
      ctx.clearRect(0, 0, w, h);
      P.draw(ctx, w, h, E.s[t], E.u[t], E.goal[t] === 1);
      // goal timeline with playhead
      const bw = c.bar.parentElement.clientWidth, dpr = window.devicePixelRatio || 1;
      c.bar.style.width = bw + "px"; c.bar.style.height = "8px"; c.bar.width = bw * dpr; c.bar.height = 8 * dpr;
      const g = c.bar.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = css("--band"); g.fillRect(0, 0, bw, 8);
      g.fillStyle = css("--goal");
      for (let i = 0; i < n; i++) if (E.goal[i]) g.fillRect((i / n) * bw, 0, Math.max(1, bw / n), 8);
      g.fillStyle = css("--ink"); g.fillRect((t / n) * bw - 1, 0, 2, 8);
      {
        const sofar = E.goal.slice(0, t + 1).reduce((a, b) => a + b, 0) / n;
        c.el.querySelector(".bh-lab").innerHTML =
          `<b>Episode ${c.ep}</b> · in goal ${Math.round(100 * sofar)}% <span class="lab">(episode total ${Math.round(100 * run.frac[+c.ep - 1])}%)</span>`;
      }
    }
    if (full) {
      root.querySelectorAll(".bh-row").forEach((r) => spark(r.querySelector(".bh-spark"), B[r._key][S.cond].frac));
      root.querySelectorAll("[data-cond]").forEach((b) => b.classList.toggle("on", b.dataset.cond === S.cond));
    }
    slider.value = S.t;
    lab.textContent = `step ${S.t + 1}`;
  }

  let raf;
  function tick(now) {
    if (!S.playing) return;
    const dt = (now - S.last) / 1000; S.last = now;
    S.acc = (S.acc || 0) + dt * STEPS_PER_SEC * S.speed;
    const k = Math.floor(S.acc); S.acc -= k;
    if (k > 0) { S.t = Math.min(maxT - 1, S.t + k); draw(false); }
    if (S.t >= maxT - 1) { S.playing = false; playBtn.textContent = "Play"; return; }
    raf = requestAnimationFrame(tick);
  }
  function play() {
    if (S.t >= maxT - 1) S.t = 0;
    S.playing = true; S.last = performance.now(); S.acc = 0; playBtn.textContent = "Pause";
    raf = requestAnimationFrame(tick);
  }
  playBtn.addEventListener("click", () => { if (S.playing) { S.playing = false; playBtn.textContent = "Play"; } else play(); });
  root.querySelector(".bh-restart").addEventListener("click", () => { S.t = 0; draw(false); if (!S.playing) play(); });
  slider.addEventListener("input", () => { S.t = +slider.value; draw(false); });
  root.querySelectorAll("[data-cond]").forEach((b) => b.addEventListener("click", () => { S.cond = b.dataset.cond; draw(true); }));
  root.querySelectorAll("[data-speed]").forEach((b) => b.addEventListener("click", () => {
    S.speed = +b.dataset.speed; root.querySelectorAll("[data-speed]").forEach((x) => x.classList.toggle("on", x === b));
  }));
  draw(true);
  new ResizeObserver(() => draw(true)).observe(root);
  // start when scrolled into view
  new IntersectionObserver((es, ob) => { if (es[0].isIntersecting) { play(); ob.disconnect(); } }, { threshold: 0.3 }).observe(root);
}
