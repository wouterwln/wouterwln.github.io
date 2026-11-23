import { loadJSON } from "./common.js";
import { initBLL } from "./bll.js";
import { initHeatmap } from "./heatmap.js";
import { initPlan } from "./plan.js";
import { initBehavior } from "./behavior.js";

function renderMath() {
  if (!window.renderMathInElement) return setTimeout(renderMath, 50);
  window.renderMathInElement(document.body, {
    delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
    trust: (ctx) => ctx.command === "\\htmlClass",
    strict: false,
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  renderMath();
  initBLL(document.getElementById("bll-widget"));
  const [B, H, explore, exploit, reach] = await Promise.all([
    loadJSON("data/behavior.json"), loadJSON("data/heatmap_pend.json"), loadJSON("data/plan_explore.json"), loadJSON("data/plan_exploit.json"), loadJSON("data/plan_reach.json"),
  ]);
  initBehavior(document.getElementById("bh-widget"), B);
  initHeatmap(document.getElementById("hm-widget"), H);
  initPlan(document.getElementById("pl-widget"), { explore, exploit, reach }, H);
});
