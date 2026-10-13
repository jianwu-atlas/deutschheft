/* ============================================================
   annotate.js · 全文音标标注 + 朗读（SpeechSynthesis）
   词典：PRON（带冠词）→ 裸词化 + PRON_FORMS（变位）+ PRON_BARE（功能词/颜色/月份…）
   开关：右下角浮动按钮「音标」，状态存 localStorage（deutschheft_annotate）
   ============================================================ */
(function () {
  "use strict";

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
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.88;
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
        const ipa = DICT[w.toLowerCase()];
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
    if (node.classList && (node.classList.contains("no-ipa") || node.classList.contains("dh-ipa") || node.classList.contains("s-ipa"))) return;
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
    b.title = "为全文德语单词标注国际音标（点击单词可朗读）";
    b.addEventListener("click", () => {
      localStorage.setItem(KEY, isOn() ? "0" : "1");
      if (isOn()) annotateAll();
      else location.reload();
      refreshButton();
    });
    document.body.appendChild(b);
    refreshButton();
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildButton();
    if (isOn()) setTimeout(annotateAll, 120);
    // 动态内容后若开着标注，重新扫一遍
    const mo = new MutationObserver(() => { if (isOn()) annotateAll(); });
    mo.observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
  });
})();
