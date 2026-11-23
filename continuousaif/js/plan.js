// Planning by gradient descent on F_EFE, step by step, from recorded planning calls of the pendulum agent.
// Stages of one Adam iteration: sample ε → shift and scale → squash → roll out → score → differentiate → update; at the end, act.
import { css, fitCanvas, scale, axes, ease, lerp } from "./common.js";
import { heatImage, wrapLine, phaseTicks, TH, W } from "./heatmap.js";

const STAGES = ["sample", "transform", "squash", "rollout", "score", "gradient", "update", "act"];
const DUR = [700, 1400, 900, 1600, 700, 700, 900, 2200];
const YR = 4.6;
const tTicks = (T) => [1, ...Array.from({ length: 4 }, (_, i) => Math.round((T * (i + 1)) / 4))].map((v) => ({ v, l: v }));  // action panel: ε and z on [−YR, YR]; u drawn as u · 4 / u_max

export function initPlan(root, plans, H) {
  const cA = root.querySelector("canvas.pl-action"), cP = root.querySelector("canvas.pl-phase");
  const cB = root.querySelector("canvas.pl-bars"), cF = root.querySelector("canvas.pl-F");
  const slider = root.querySelector(".pl-iter"), iterLab = root.querySelector(".pl-iterlab");
  const captions = root.querySelectorAll("[data-caption]");
  const stageBtns = root.querySelectorAll("[data-stage]");
  const S = { moment: "explore", cand: 0, it: 0, stage: 0, f: 1, t0: 0, playing: false, bg: {} };
  const P = () => plans[S.moment];
  const C = () => P().candidates[S.cand];
  const nIt = () => P().steps;

  function bg() {
    const e = P().checkpoint_episode === 3 ? "3" : "10";
    return (S.bg[e] ||= heatImage(H, e, "dyn"));
  }

  // --------------------------------------------------------------- action panel
  function drawAction() {
    const { ctx, w, h } = fitCanvas(cA, 0.78);
    const p = P(), c = C(), it = Math.min(S.it, nIt() - 1), d = c[it];
    const box = { x: 46, y: 10, w: w - 56, h: h - 52 };
    const xs = scale(0.5, p.T + 0.5, box.x, box.x + box.w), ys = scale(-YR, YR, box.y + box.h, box.y);
    const st = STAGES[S.stage], f = ease(S.f), um = p.u_max, uScale = 4 / um;
    ctx.clearRect(0, 0, w, h);
    const inU = S.stage >= 2 && st !== "act";
    const fU = S.stage === 2 ? f : S.stage > 2 ? 1 : 0;

    if (st === "act") return drawAct(ctx, box, w, h);

    // box bounds in u space
    if (fU > 0) {
      ctx.fillStyle = css("--band");
      ctx.globalAlpha = fU;
      ctx.fillRect(box.x, ys(4), box.w, ys(-4) - ys(4));
      ctx.globalAlpha = 1;
    }
    // standard normal reference in ε stage
    if (S.stage === 0) {
      ctx.fillStyle = css("--band");
      ctx.fillRect(box.x, ys(1), box.w, ys(-1) - ys(1));
    }
    // μ line and ±σ band (z space, then squashed)
    const muLine = (mu, sg, alpha) => {
      const zq = (t, k) => mu[t] + k * sg[t];
      const yv = (zv) => lerp(zv, uScale * um * Math.tanh(zv), fU);
      if (S.stage >= 1) {
        ctx.globalAlpha = alpha * (S.stage === 1 ? f : 1) * 0.5;
        ctx.fillStyle = css("--c-mu-band");
        ctx.beginPath();
        for (let t = 0; t < p.T; t++) ctx.lineTo(xs(t + 1), ys(yv(zq(t, 1))));
        for (let t = p.T - 1; t >= 0; t--) ctx.lineTo(xs(t + 1), ys(yv(zq(t, -1))));
        ctx.fill();
        ctx.globalAlpha = alpha * (S.stage === 1 ? f : 1);
        ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2;
        ctx.beginPath();
        for (let t = 0; t < p.T; t++) ctx.lineTo(xs(t + 1), ys(yv(mu[t])));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };
    let mu = d.mu, sg = d.sigma;
    if (st === "update") {
      const nx = c[it + 1];
      mu = d.mu.map((v, t) => lerp(v, nx.mu[t], f));
      sg = d.sigma.map((v, t) => lerp(v, nx.sigma[t], f));
    }
    muLine(mu, sg, 1);

    // samples
    const pos = (n, t) => {
      const e = d.eps[n][t], ol = d.mu[t] + d.sigma[t] * e, z = d.z[n][t], u = uScale * um * Math.tanh(z);
      if (S.stage === 0) return e * f;
      if (S.stage === 1) return S.f < 0.5 ? lerp(e, ol, ease(S.f * 2)) : lerp(ol, z, ease(S.f * 2 - 1));
      if (S.stage === 2) return lerp(z, u, f);
      return u;
    };
    const dotAlpha = st === "update" ? 1 - f : 1;
    const hl = S.hover;
    if (S.stage >= 3) {
      ctx.lineWidth = 1;
      for (let n = 0; n < p.n_mc; n++) {
        ctx.strokeStyle = n === hl ? css("--c-next") : css("--c-sample");
        ctx.globalAlpha = (n === hl ? 0.9 : 0.25) * dotAlpha;
        ctx.beginPath();
        for (let t = 0; t < p.T; t++) ctx.lineTo(xs(t + 1), ys(pos(n, t)));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = dotAlpha;
    for (let n = 0; n < p.n_mc; n++) {
      ctx.fillStyle = n === hl ? css("--c-next") : css("--c-sample");
      for (let t = 0; t < p.T; t++) {
        const y = pos(n, t);
        if (Math.abs(y) > YR) continue;
        ctx.beginPath(); ctx.arc(xs(t + 1), ys(y), 2.2, 0, 7); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // gradient arrows on μ_t (descent direction −∂F̂/∂μ_t)
    if (st === "gradient" || st === "update") {
      const g = d.grad_mu, gm = Math.max(...g.map(Math.abs), 1e-9);
      ctx.strokeStyle = css("--c-grad"); ctx.fillStyle = css("--c-grad"); ctx.lineWidth = 1.8;
      ctx.globalAlpha = st === "gradient" ? f : 1 - f;
      for (let t = 0; t < p.T; t++) {
        const y0 = ys(uScale * um * Math.tanh(d.mu[t])), L = (-g[t] / gm) * 34 * (st === "gradient" ? f : 1);
        if (Math.abs(L) < 1.5) continue;
        const x = xs(t + 1);
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 - L); ctx.stroke();
        const s = Math.sign(L);
        ctx.beginPath(); ctx.moveTo(x, y0 - L - s * 4); ctx.lineTo(x - 3.5, y0 - L + s * 2); ctx.lineTo(x + 3.5, y0 - L + s * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // axes: ε/z ticks crossfade into u ticks
    const ztk = [-4, -2, 0, 2, 4].map((v) => ({ v, l: v }));
    const utk = [-2, -1, 0, 1, 2].map((v) => ({ v: v * uScale, l: v }));
    const ylab = S.stage === 0 ? "noise ε" : S.stage === 1 ? "z = μ + K(x − x̄) + σε" : "action u = u_max tanh z";
    axes(ctx, box, xs, ys, {
      xt: tTicks(p.T),
      yt: inU && fU > 0.5 ? utk : ztk,
      xl: `planning step t (horizon T = ${p.T})`, yl: ylab, ylOff: 34,
    });
  }

  function drawAct(ctx, box, w, h) {
    // Executed action = mode of q(u₁ | x₀); then the plan shifts one step (receding horizon), a fresh factor is appended.
    const p = P(), cf = C()[nIt()], f = S.f, um = p.u_max, uScale = 4 / um;
    const xs = scale(0.5, p.T + 0.5, box.x, box.x + box.w), ys = scale(-YR, YR, box.y + box.h, box.y);
    const fs = ease(Math.max(0, (f - 0.35) / 0.65));            // shift progress
    const mu = [...cf.mu, 0], sg = [...cf.sigma, 0.5];          // appended initial factor: μ = 0, σ = 0.5
    const X = (t) => xs(t + 1 - fs);                             // index t of the old plan drawn one step to the left
    const Y = (z) => ys(uScale * um * Math.tanh(z));
    ctx.fillStyle = css("--band"); ctx.fillRect(box.x, ys(4), box.w, ys(-4) - ys(4));
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    const last = fs > 0 ? p.T : p.T - 1;
    ctx.fillStyle = css("--c-mu-band"); ctx.beginPath();
    for (let t = 0; t <= last; t++) ctx.lineTo(X(t), Y(mu[t] + sg[t]));
    for (let t = last; t >= 0; t--) ctx.lineTo(X(t), Y(mu[t] - sg[t]));
    ctx.fill();
    ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2; ctx.beginPath();
    for (let t = 0; t <= last; t++) ctx.lineTo(X(t), Y(mu[t]));
    ctx.stroke();
    ctx.restore();
    // executed first action
    const a = 1 - fs, ux = xs(1 - fs), uy = ys(uScale * p.u_act);
    ctx.globalAlpha = Math.max(a, 0.25);
    ctx.fillStyle = css("--c-pref"); ctx.beginPath(); ctx.arc(ux, uy, 7 * Math.min(1, f / 0.2), 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = "12.5px " + css("--font-sans"); ctx.fillStyle = css("--c-pref"); ctx.textAlign = "left";
    ctx.textBaseline = p.u_act < 0 ? "bottom" : "top";
    ctx.fillText(`executed u₁ = ${p.u_act.toFixed(2)}`, xs(1) + 12, uy + (p.u_act < 0 ? -8 : 8));
    if (fs > 0.05) {
      ctx.fillStyle = css("--ink-2"); ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      ctx.globalAlpha = fs; ctx.fillText("appended: μ = 0, σ = 0.5", xs(p.T) - 4, ys(0) - 10); ctx.globalAlpha = 1;
    }
    axes(ctx, box, xs, ys, {
      xt: tTicks(p.T), yt: [-2, -1, 0, 1, 2].map((v) => ({ v: v * uScale, l: v })),
      xl: "planning step t", yl: "mean action u_max tanh μₜ", ylOff: 34,
    });
  }

  // --------------------------------------------------------------- phase panel
  function drawPhase() {
    const { ctx, w, h } = fitCanvas(cP, 0.78);
    const p = P(), c = C(), it = Math.min(S.it, nIt() - 1), d = c[it], st = STAGES[S.stage];
    const box = { x: 54, y: 10, w: w - 64, h: h - 52 };
    const xs = scale(TH[0], TH[1], box.x, box.x + box.w), ys = scale(W[0], W[1], box.y + box.h, box.y);
    ctx.clearRect(0, 0, w, h);
    drawPendulum(p.state[0], p.state[1]);
    ctx.drawImage(bg(), box.x, box.y, box.w, box.h);
    ctx.fillStyle = css("--veil"); ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
    // goal region: −log p̂ below ~1 nat for |θ| < 0.45
    ctx.strokeStyle = css("--c-pref"); ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.strokeRect(xs(-0.45), box.y, xs(0.45) - xs(-0.45), box.h); ctx.setLineDash([]);
    // executed trajectory so far (exploit)
    if (p.trajectory) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 1.5;
      wrapLine(ctx, xs, ys, p.trajectory.map((s) => s[0]), p.trajectory.map((s) => s[1]));
    }
    // rollouts
    const showR = S.stage >= 3 && st !== "act";
    if (showR) {
      const tmax = S.stage === 3 ? Math.max(1, Math.round(ease(S.f) * p.T)) : p.T;
      const tot = d.cost.map((r) => r.reduce((a, b) => a + b, 0));
      const lo = Math.min(...tot), hi = Math.max(...tot);
      const order = [...tot.keys()].sort((a, b) => tot[b] - tot[a]);
      const fade = st === "update" ? 1 - ease(S.f) : 1;
      for (const n of order) {
        const good = hi > lo ? (hi - tot[n]) / (hi - lo) : 0.5;
        const scored = S.stage >= 4;
        ctx.strokeStyle = n === S.hover ? css("--c-next") : "rgba(255,255,255,1)";
        ctx.globalAlpha = fade * (n === S.hover ? 1 : scored ? 0.25 + 0.7 * good : 0.75);
        ctx.lineWidth = n === S.hover ? 2.6 : scored ? 0.8 + 1.8 * good : 1.3;
        const th = [p.state[0], ...d.th[n].slice(0, tmax)], wv = [p.state[1], ...d.w[n].slice(0, tmax)];
        wrapLine(ctx, xs, ys, th, wv);
      }
      ctx.globalAlpha = 1;
    }
    // current state
    ctx.fillStyle = css("--c-pref");
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(xs(p.state[0]), ys(p.state[1]), 5.5, 0, 7); ctx.fill(); ctx.stroke();
    ctx.restore();
    axes(ctx, box, xs, ys, { ...phaseTicks, ylOff: 40 });
  }

  function drawPendulum(th, w) {
    const el = root.querySelector(".pl-pend"); if (!el) return;
    const r = 15, cx = 20, cy = 20, bx = cx + r * Math.sin(th), by = cy - r * Math.cos(th);
    el.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--rule)"/>
      <line x1="${cx}" y1="${cy}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="var(--ink)" stroke-width="2"/>
      <circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="4.5" fill="var(--c-pref)"/><circle cx="${cx}" cy="${cy}" r="1.8" fill="var(--ink)"/></svg>
      <span>true state: θ = ${th.toFixed(2)} rad, ω = ${w.toFixed(2)} rad/s</span>`;
  }

  // --------------------------------------------------------------- bars: per-rollout sums
  function drawBars() {
    const { ctx, w, h } = fitCanvas(cB, 0.5);
    const p = P(), c = C(), it = Math.min(S.it, nIt() - 1), d = c[it], st = STAGES[S.stage];
    ctx.clearRect(0, 0, w, h);
    const show = S.playing ? 1 : S.stage >= 4 && st !== "act" ? (S.stage === 4 ? ease(S.f) : 1) : 0;
    const sum = (a) => a.map((r) => r.reduce((x, y) => x + y, 0));
    const Pn = sum(d.pref), Dn = sum(d.ig_dyn), On = sum(d.ig_obs);
    const box1 = { x: 46, y: 18, w: w - 56, h: (h - 84) * 0.5 }, box2 = { x: 46, y: box1.y + box1.h + 22, w: w - 56, h: (h - 84) * 0.5 };
    const xs = scale(-0.5, p.n_mc - 0.5, box1.x, box1.x + box1.w), bw = (box1.w / p.n_mc) * 0.7;
    const pMax = 6.91 * p.T;
    // fixed axis over all Adam steps of this plan, so the scale does not jump while the steps play
    c._iMax ||= Math.max(0.5, ...c.slice(0, nIt()).map((d) => Math.max(...sum(d.ig_dyn).map((v, i) => v + sum(d.ig_obs)[i]))));
    const iMax = c._iMax;
    const y1 = scale(0, pMax, box1.y + box1.h, box1.y), y2 = scale(0, iMax * 1.1, box2.y + box2.h, box2.y);
    ctx.globalAlpha = show;
    for (let n = 0; n < p.n_mc; n++) {
      const x = xs(n) - bw / 2, hl = n === S.hover;
      ctx.fillStyle = css("--c-pref"); ctx.globalAlpha = show * (hl || S.hover == null ? 1 : 0.4);
      ctx.fillRect(x, y1(Pn[n]), bw, y1(0) - y1(Pn[n]));
      ctx.fillStyle = css("--c-dyn"); ctx.fillRect(x, y2(Dn[n]), bw, y2(0) - y2(Dn[n]));
      ctx.fillStyle = css("--c-obs"); ctx.fillRect(x, y2(Dn[n] + On[n]), bw, y2(Dn[n]) - y2(Dn[n] + On[n]));
    }
    ctx.globalAlpha = 1;
    ctx.font = "11.5px " + css("--font-sans"); ctx.fillStyle = css("--ink-2"); ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText("Σₜ −log p̂(yₜ) per rollout", box1.x, box1.y - 3);
    ctx.fillText("Σₜ information gain per rollout (dynamics + observation model)", box2.x, box2.y - 3);
    axes(ctx, box1, xs, y1, { yt: [0, Math.round(pMax)].map((v) => ({ v, l: v })) });
    axes(ctx, box2, xs, y2, { yt: [0, +(iMax * 1.1).toFixed(1)].map((v) => ({ v, l: v })), xl: "rollout n = 1 … 16" });
    cB._geom = { xs, n: p.n_mc };
    const Fh = d.F;
    root.querySelector(".pl-Fhat").innerHTML = show > 0 ?
      `F̂ = (1/16) Σₙ Σₜ ℓₜ⁽ⁿ⁾ + const = <b>${Fh.toFixed(2)}</b> nats` : "&nbsp;";
  }

  // --------------------------------------------------------------- F over iterations
  function drawF() {
    const { ctx, w, h } = fitCanvas(cF, 0.5);
    const p = P(), c = C(), n = nIt();
    ctx.clearRect(0, 0, w, h);
    const F = c.map((d) => d.F128), Fn = c.slice(0, n).map((d) => d.F);
    const all = [...F, ...Fn], lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.08 + 0.05;
    const box = { x: 52, y: 32, w: w - 84, h: h - 76 };
    const xs = scale(0, n, box.x, box.x + box.w), ys = scale(lo - pad, hi + pad, box.y + box.h, box.y);
    const cur = STAGES[S.stage] === "act" ? n : S.it + (STAGES[S.stage] === "update" ? ease(S.f) : 0);
    ctx.fillStyle = css("--ink-3");
    Fn.forEach((v, i) => { if (i <= cur) { ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.arc(xs(i), ys(v), 1.8, 0, 7); ctx.fill(); } });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = css("--ink"); ctx.lineWidth = 2; ctx.beginPath();
    F.forEach((v, i) => { if (i <= cur) ctx.lineTo(xs(i), ys(v)); }); ctx.stroke();
    // Σₜ −log p̂ averaged over the 16 rollouts, right axis
    const Pm = c.slice(0, n).map((d) => d.pref.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0) / d.pref.length);
    const pTop = 6.91 * p.T, pLo = Math.min(...Pm), yp = scale(Math.min(pLo - 0.08 * (pTop - pLo), pTop - 1), pTop + 0.02 * pTop, box.y + box.h, box.y);
    ctx.strokeStyle = css("--c-pref"); ctx.lineWidth = 2; ctx.setLineDash([5, 3]); ctx.beginPath();
    Pm.forEach((v, i) => { if (i <= cur) ctx.lineTo(xs(i), yp(v)); }); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = css("--c-pref"); ctx.font = "11px " + css("--font-sans"); ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(Math.round(pTop), box.x + box.w + 4, yp(pTop));
    if (pTop - pLo > 1) ctx.fillText(Math.round(pLo), box.x + box.w + 4, yp(pLo));
    ctx.strokeStyle = css("--c-grad"); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xs(cur), box.y); ctx.lineTo(xs(cur), box.y + box.h); ctx.stroke();
    ctx.font = "11.5px " + css("--font-sans"); ctx.fillStyle = css("--ink-2"); ctx.textAlign = "left"; ctx.textBaseline = "bottom";
    ctx.fillText("F_EFE estimate: line 128 rollouts (shared noise), dots the 16 in the gradient", box.x, box.y - 17);
    ctx.fillStyle = css("--c-pref");
    ctx.fillText("dashed: Σₜ −log p̂(yₜ), mean over the 16 rollouts (right axis)", box.x, box.y - 3);
    const tk = n > 20 ? [0, 25, 50, 75, 100] : [0, 2, 4, 6, 8, 10];
    axes(ctx, box, xs, ys, {
      xt: tk.map((v) => ({ v, l: v })), yt: [lo, hi].map((v) => ({ v, l: v.toFixed(1) })),
      xl: "Adam step", ylOff: 40,
    });
  }

  // --------------------------------------------------------------- control
  function render() {
    drawAction(); drawPhase(); drawBars(); drawF();
    stageBtns.forEach((b) => b.classList.toggle("on", !S.playing && +b.dataset.stage === S.stage));
    const cap = S.playing ? "run" : STAGES[S.stage];
    captions.forEach((el) => el.classList.toggle("shown", el.dataset.caption === cap || el.dataset.caption === `${cap}-${S.moment}`));
    slider.max = nIt(); slider.value = STAGES[S.stage] === "act" ? nIt() : S.it;
    iterLab.textContent = STAGES[S.stage] === "act" ? `after ${nIt()} Adam steps` : `Adam step ${S.it + 1} of ${nIt()}`;
  }

  let raf = null;
  function animate(stage, after) {
    S.stage = stage; S.f = 0; S.t0 = performance.now();
    cancelAnimationFrame(raf);
    const dur = DUR[stage] * (S.fast ? S.fast : 1);
    const tick = (now) => {
      S.f = Math.min(1, (now - S.t0) / dur);
      render();
      if (S.f < 1) raf = requestAnimationFrame(tick);
      else if (after) after();
    };
    raf = requestAnimationFrame(tick);
  }

  function next() {
    S.playing = false;
    if (STAGES[S.stage] === "act") return;
    if (STAGES[S.stage] === "update") {
      if (S.it + 1 >= nIt()) return animate(7);
      S.it += 1; return animate(0);
    }
    animate(S.stage + 1);
  }

  function runAll() {
    S.playing = true; S.fast = 0.35;  // same pace for every moment (≈0.9 s per Adam step)
    const loop = () => {
      if (!S.playing) { S.fast = 0; return; }
      if (S.it + 1 >= nIt()) { S.fast = 0; S.playing = false; return animate(7); }
      S.it += 1;
      animate(3, () => animate(6, loop));
    };
    animate(3, () => animate(6, loop));
  }

  root.querySelector(".pl-next").addEventListener("click", next);
  root.querySelector(".pl-run").addEventListener("click", runAll);
  root.querySelector(".pl-restart").addEventListener("click", () => { S.playing = false; S.fast = 0; S.it = 0; animate(0); });
  stageBtns.forEach((b) => b.addEventListener("click", () => {
    S.playing = false; S.fast = 0;
    const s = +b.dataset.stage;
    if (STAGES[s] === "act") { S.it = nIt() - 1; }
    animate(s);
  }));
  slider.addEventListener("input", () => {
    S.playing = false; S.fast = 0;
    const v = +slider.value;
    if (v >= nIt()) { S.it = nIt() - 1; S.stage = 7; } else { S.it = v; S.stage = 4; }
    S.f = 1; render();
  });
  root.querySelectorAll("[data-moment]").forEach((b) => b.addEventListener("click", () => {
    S.playing = false; S.fast = 0; S.moment = b.dataset.moment; S.cand = P().chosen; S.it = 0;
    root.querySelectorAll("[data-moment]").forEach((x) => x.classList.toggle("on", x === b));
    animate(0);
  }));
  cB.addEventListener("mousemove", (ev) => {
    const g = cB._geom; if (!g) return;
    const r = cB.getBoundingClientRect(), n = Math.round(g.xs.inv(ev.clientX - r.left));
    S.hover = n >= 0 && n < g.n && S.stage >= 4 ? n : null; if (S.f >= 1) render();
  });
  cB.addEventListener("mouseleave", () => { S.hover = null; if (S.f >= 1) render(); });
  new ResizeObserver(() => { if (S.f >= 1) render(); }).observe(root);
  S.f = 1; render();
}
