/* ============================================================
   annotate.js · 全文音标标注 + 朗读（SpeechSynthesis）
   词典：PRON（带冠词）→ 裸词化 + PRON_FORMS（变位）+ PRON_BARE（功能词/颜色/月份…）
   开关：右下角浮动按钮「音标」，状态存 localStorage（deutschheft_annotate）

   标注策略（Jian 2026-10-13）：
   只标注「值得学的实词」（heißen / buchstabieren / Küche …）。
   最基础的功能词一律不标注——冠词、人称/物主代词、sein·haben·werden 及情态动词、
   连词、否定词、疑问词、基础介词、纯语气小品词（见 BASIC）。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 最基础功能词：不标注 ---------- */
  const BASIC = new Set([
    /* 冠词 / 物主冠词 */
    "der", "die", "das", "den", "dem", "des",
    "ein", "eine", "einen", "einem", "einer", "eines",
    "mein", "meine", "meinen", "meinem", "meiner",
    "dein", "deine", "deinen", "deinem",
    "sein", "seine", "seinen", "seinem",
    "ihr", "ihre", "ihren", "ihrem",
    "unser", "unsere", "unseren", "euer", "eure",
    /* 人称 / 反身代词 */
    "ich", "du", "er", "sie", "es", "wir", "ihr",
    "mich", "dich", "sich", "uns", "euch", "mir", "dir", "ihn", "ihm", "ihnen",
    /* sein / haben / werden */
    "bin", "bist", "ist", "sind", "seid", "war", "waren", "gewesen",
    "habe", "hast", "hat", "haben", "habt", "hatte", "hatten", "gehabt",
    "werde", "wirst", "wird", "werden", "werdet", "wurde", "wurden", "geworden",
    /* 情态动词（含虚拟式） */
    "kann", "kannst", "können", "könnt", "könnte", "könnten",
    "muss", "musst", "müssen", "müsst", "musste", "müsste", "müssten",
    "will", "willst", "wollen", "wollt", "wollte", "wollten",
    "soll", "sollst", "sollen", "sollt", "sollte", "sollten",
    "darf", "darfst", "dürfen", "dürft", "dürfte",
    "mag", "magst", "mögen", "mögt", "möchte", "möchtest", "möchten",
    "würde", "würdest", "würden", "würdet",
    "hätte", "hättest", "hätten", "hättet",
    /* 连词 / 从句引导词 */
    "und", "oder", "aber", "denn", "sondern", "weil", "wenn", "dass", "ob", "als", "wie",
    /* 否定词与语气小品词 */
    "nicht", "kein", "keine", "keinen", "keinem", "keiner", "keines",
    "ja", "nein", "bitte", "danke", "auch", "sehr", "so", "nur", "noch", "schon", "doch", "mal",
    /* 疑问词 */
    "was", "wer", "wo", "wann", "warum", "wieso", "wohin", "woher",
    "welche", "welcher", "welches", "welchen", "welchem",
    /* 基础介词 */
    "in", "im", "am", "an", "auf", "mit", "zu", "zum", "zur", "von", "vor", "nach", "bei",
    "aus", "für", "über", "unter", "um", "durch", "gegen", "seit", "ohne", "bis",
    "neben", "zwischen", "gegenüber"
  ]);

  /* 不标注的容器：
     ① 已自带音标列 / 词卡 —— 重复标注纯属噪音
     ② 界面框架（页头、页脚、标签、工具栏）—— 不是学习内容 */
  const SKIP_SEL = [
    ".no-ipa", ".dh-ipa", ".s-ipa",            // 已标注 / 句子级音标行
    ".vcard", ".ref-table", ".ref-numgrid",    // 词卡、速查表（自带音标列）
    ".wl-table", ".lbk-raw",                   // 全站词表、教材原文 dump
    ".page-head", ".site-footer",              // 页面标题区、页脚
    ".text-tabs", ".vocab-tabs", ".vocab-toolbar", ".chip-row"
  ].join(", ");

  /* ---------- 词典构建 ---------- */
  const DICT = {};
  function put(key, ipa) {
    if (!key || !ipa) return;
    const k = key.toLowerCase().replace(/^(der|die|das)\s+/, "");
    if (!DICT[k]) DICT[k] = ipa;
  }
  if (typeof PRON !== "undefined") Object.entries(PRON).forEach(([k, v]) => put(k, v.ipa));
  if (typeof PRON_FORMS !== "undefined") Object.entries(PRON_FORMS).forEach(([k, v]) => put(k, v));
  if (typeof PRON_BARE !== "undefined") Object.entries(PRON_BARE).forEach(([k, v]) => put(k, v));
  if (typeof PRON_EXTRA !== "undefined") Object.entries(PRON_EXTRA).forEach(([k, v]) => put(k, v));
  if (typeof PRON_FUNC !== "undefined") Object.entries(PRON_FUNC).forEach(([k, v]) => put(k, v));
  if (typeof PRON_MORE !== "undefined") Object.entries(PRON_MORE).forEach(([k, v]) => put(k, v));

  /* 专有名词（人名/地名/品牌）不标注：Mia / Elena / Frankfurt … 会满屏出现 */
  const NAMES = new Set([
    "daniel", "elena", "mia", "maria", "marias", "jian", "malawi", "malawas",
    "amerika", "frankfurt", "volkswagen", "h&m"
  ]);

  const WORD_RE = /[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß'-]*/g;
  const SKIP = new Set(["SCRIPT", "STYLE", "INPUT", "TEXTAREA", "RT", "OPTION"]);

  /* ---------- 朗读 ---------- */
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /^de(-|_)/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  /* ---------- 语速（三档，localStorage 记忆；一处改全站在线朗读生效） ---------- */
  const SRATE_KEY = "deutschheft_srate";
  const SPEEDS = [
    { r: 0.66, label: "语速：慢" },
    { r: 0.88, label: "语速：正常" },
    { r: 1.10, label: "语速：快" },
  ];
  function curSpeed() {
    const v = parseFloat(localStorage.getItem(SRATE_KEY));
    return SPEEDS.find(s => s.r === v) || SPEEDS[1];
  }
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = curSpeed().r;
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }
  window.__dhSpeak = speak;

  /* ---------- 标注 ---------- */
  function annotateNode(node) {
    if (SKIP.has(node.nodeName)) return;
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      if (!text || !WORD_RE.test(text)) return;
      WORD_RE.lastIndex = 0;
      let m, last = 0, frag = null;
      while ((m = WORD_RE.exec(text)) !== null) {
        const w = m[0];
        const low = w.toLowerCase();
        if (BASIC.has(low) || NAMES.has(low)) continue;   // 基础功能词 / 专名：不标注
        const ipa = DICT[low];
        if (!ipa) continue;
        if (!frag) frag = document.createDocumentFragment();
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const ruby = document.createElement("ruby");
        ruby.className = "dh-ipa";
        ruby.dataset.ipa = ipa;
        ruby.appendChild(document.createTextNode(w));
        const rt = document.createElement("rt");
        rt.textContent = ipa;
        ruby.appendChild(rt);
        ruby.title = w + " " + ipa + "（点击朗读）";
        ruby.addEventListener("click", e => { e.stopPropagation(); speak(w); });
        frag.appendChild(ruby);
        last = m.index + w.length;
      }
      if (frag) {
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      }
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.matches && node.matches(SKIP_SEL)) return;
    Array.from(node.childNodes).forEach(annotateNode);
  }

  function annotateAll() {
    document.querySelectorAll("#app, .page-wrap, .page-desc, .para-title, .text-intro").forEach(annotateNode);
  }
  window.__dhAnnotate = annotateAll;

  /* ---------- 开关按钮 ---------- */
  const KEY = "deutschheft_annotate";
  function isOn() { return localStorage.getItem(KEY) === "1"; }
  function refreshButton() {
    const btn = document.getElementById("ipaToggle");
    if (!btn) return;
    btn.classList.toggle("on", isOn());
    btn.textContent = isOn() ? "🔊 音标：开" : "🔈 音标：关";
  }
  function apply() {
    if (isOn()) annotateAll();
    refreshButton();
  }

  function buildButton() {
    if (document.getElementById("ipaToggle")) return refreshButton();
    const b = document.createElement("button");
    b.id = "ipaToggle";
    b.title = "为德语生词标注国际音标（ich / der / ist 等基础功能词不标注；点击单词可朗读）";
    b.addEventListener("click", () => {
      localStorage.setItem(KEY, isOn() ? "0" : "1");
      if (isOn()) annotateAll();
      else location.reload();
      refreshButton();
    });
    document.body.appendChild(b);
    refreshButton();
  }

  /* ---------- 语速按钮（右下角 #ipaToggle 上方，点一下循环 慢/正常/快） ---------- */
  function buildSpeedButton() {
    if (document.getElementById("speedToggle")) return;
    const b = document.createElement("button");
    b.id = "speedToggle";
    b.title = "调节在线朗读语速（点一下切换 慢 / 正常 / 快）";
    b.textContent = curSpeed().label;
    b.addEventListener("click", () => {
      const idx = SPEEDS.findIndex(s => s.r === curSpeed().r);
      const next = SPEEDS[(idx + 1) % SPEEDS.length];
      localStorage.setItem(SRATE_KEY, String(next.r));
      b.textContent = next.label;
    });
    document.body.appendChild(b);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildButton();
    buildSpeedButton();
    if (isOn()) setTimeout(annotateAll, 120);
    // 动态内容后若开着标注，重新扫一遍
    const mo = new MutationObserver(() => { if (isOn()) annotateAll(); });
    mo.observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
  });
})();
