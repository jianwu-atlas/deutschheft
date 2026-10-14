/* ============================================================
   annotate.js · 全文音标标注 + 朗读（SpeechSynthesis）
   词典：PRON（带冠词）→ 裸词化 + PRON_FORMS（变位）+ PRON_BARE（功能词/颜色/月份…）
   音标开关：右下角浮动按钮「音标」，**三态循环**，状态存 localStorage（deutschheft_annotate）
      关   → 不标注
      常用 → 只标「值得学的实词」（默认，原策略）
      全部 → 词典命中的词**全部标注**（含 ich / der / ist / und 等简单词）

   朗读：
      ① 点击 / 双击**任意德语单词**即朗读（不必先开音标开关）
      ② 点击 ruby 标注词朗读（同上，单词级）
      ③ 快捷键 Ctrl+Space 朗读选中文本 / Esc 停止
      ④ 右下角「语速」按钮三档（慢 / 正常 / 快），全局生效

   标注策略（Jian 2026-10-13，2026-10-15 增「全部」挡）：
   常用挡只标实词；最基础功能词一律不标——冠词、人称/物主代词、sein·haben·werden
   及情态动词、连词、否定词、疑问词、基础介词、纯语气小品词（见 BASIC）。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 最基础功能词：「常用」挡不标注，「全部」挡标注 ---------- */
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
  const WORD_CHAR = /[A-Za-zÄÖÜäöüß'-]/;
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
    const t = String(text || "").trim();
    if (!t) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "de-DE";
    u.rate = curSpeed().r;
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }
  window.__dhSpeak = speak;

  /* ---------- 快捷键：Ctrl+Space 朗读选中文本 / Esc 停止（Jian 2026-10-14） ----------
     前提：需先在「系统设置 → 键盘 → 键盘快捷键 → 输入法」取消「选择上一个输入法」，
     否则 Ctrl+Space 会被系统输入法切换占用，浏览器收不到该按键。
     输入框（INPUT/TEXTAREA/contenteditable）内不触发，避免与输入法冲突。 */
  document.addEventListener("keydown", e => {
    const t = e.target;
    if (t && (t.nodeName === "INPUT" || t.nodeName === "TEXTAREA" || t.isContentEditable)) return;
    if (e.key === "Escape") { speechSynthesis.cancel(); return; }
    if (e.ctrlKey && e.code === "Space") {
      e.preventDefault();
      const sel = String(window.getSelection()).trim();
      if (sel) speak(sel);
    }
  });

  /* ---------- 音标三态 ---------- */
  const KEY = "deutschheft_annotate";
  const MODES = ["off", "smart", "all"];
  const MODE_META = {
    off:   { icon: "🔈", label: "关" },
    smart: { icon: "🔊", label: "常用" },
    all:   { icon: "🔉", label: "全部" },
  };
  function mode() {
    const v = localStorage.getItem(KEY);
    if (v === "1" || v === "smart") return "smart";   // 兼容旧版「开」
    return MODES.includes(v) ? v : "off";
  }
  function setMode(m) { localStorage.setItem(KEY, m); }
  function annotateAll() {
    const m = mode();
    if (m === "off") return;
    const skipBasic = m === "smart";
    document.querySelectorAll("#app, .page-wrap, .page-desc, .para-title, .text-intro").forEach(n => annotateNode(n, skipBasic));
  }
  window.__dhAnnotate = annotateAll;

  function refreshButton() {
    const btn = document.getElementById("ipaToggle");
    if (!btn) return;
    const m = mode();
    btn.classList.toggle("on", m !== "off");
    btn.classList.toggle("all", m === "all");
    btn.textContent = `音标：${MODE_META[m].label}`;
    btn.title = m === "all"
      ? "德语音标标注 · 当前「全部」：词典命中的词都标（含 ich / der / ist 等简单词）。点一下→关，再点→常用"
      : m === "smart"
        ? "德语音标标注 · 当前「常用」：只标实词（heißen / Küche 等），简单功能词不标。点一下→全部，再点→关"
        : "德语音标标注（点一下→常用 / 再点→全部 / 再点→关）；无论开关，点击或双击单词均可朗读";
  }

  function buildButton() {
    if (document.getElementById("ipaToggle")) return refreshButton();
    const b = document.createElement("button");
    b.id = "ipaToggle";
    b.addEventListener("click", () => {
      const i = MODES.indexOf(mode());
      setMode(MODES[(i + 1) % MODES.length]);
      // 记住滚动位置，避免重载后跳回顶部
      try { sessionStorage.setItem("dh_scroll", String(window.scrollY)); } catch (e) { /* ignore */ }
      location.reload();
    });
    document.body.appendChild(b);
    refreshButton();
  }

  /* ---------- 标注 ---------- */
  function annotateNode(node, skipBasic) {
    if (SKIP.has(node.nodeName)) return;
    if (node.nodeType === 3) {
      const text = node.nodeValue;
      if (!text || !WORD_RE.test(text)) return;
      WORD_RE.lastIndex = 0;
      let m, last = 0, frag = null;
      while ((m = WORD_RE.exec(text)) !== null) {
        const w = m[0];
        const low = w.toLowerCase();
        if (NAMES.has(low)) continue;                      // 专名：任何挡都不标
        if (skipBasic && BASIC.has(low)) continue;         // 「常用」挡跳过简单词
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
    Array.from(node.childNodes).forEach(n => annotateNode(n, skipBasic));
  }

  /* ---------- 点击 / 双击任意单词即朗读（Jian 2026-10-15） ----------
     不依赖音标开关；只在「正文文本」上生效。
     链接 / 按钮 / 输入框 / 已标注词（ruby 自带 click）不干预。 */
  function wordAtPoint(x, y) {
    let node = null, off = 0;
    if (document.caretPositionFromPoint) {
      const p = document.caretPositionFromPoint(x, y);
      if (p) { node = p.offsetNode; off = p.offset; }
    } else if (document.caretRangeFromPoint) {
      const r = document.caretRangeFromPoint(x, y);
      if (r) { node = r.startContainer; off = r.startOffset; }
    }
    if (!node || node.nodeType !== 3) return "";
    const t = node.nodeValue || "";
    if (off >= t.length || !WORD_CHAR.test(t[off] || "")) {
      // 点到词边界/空白：向两侧各探一位，允许点在字符之间的缝隙
      if (off > 0 && WORD_CHAR.test(t[off - 1])) off -= 1;
      else return "";
    }
    let s = off, e = off;
    while (s > 0 && WORD_CHAR.test(t[s - 1])) s--;
    while (e < t.length && WORD_CHAR.test(t[e])) e++;
    const w = t.slice(s, e);
    return WORD_CHAR.test(w[0] || "") ? w : "";
  }

  /* 可朗读的最小单位：至少 1 个字母的德语词（单字母如 a / A 也允许，读出来无妨） */
  function isSpeakable(w) {
    return !!w && /[A-Za-zÄÖÜäöüß]/.test(w);
  }

  document.addEventListener("click", e => {
    const t = e.target;
    if (!t || t.nodeType !== 1) return;
    if (t.closest("a, button, input, textarea, select, label, [contenteditable], ruby")) return;
    if (String(window.getSelection()).trim()) return;        // 正在划词：不打扰
    const w = wordAtPoint(e.clientX, e.clientY);
    if (isSpeakable(w)) speak(w);
  });

  document.addEventListener("dblclick", e => {
    const t = e.target;
    if (!t || t.nodeType !== 1) return;
    if (t.closest("a, button, input, textarea, select, label, [contenteditable]")) return;
    const sel = String(window.getSelection()).trim();       // 双击已选中该词
    if (sel && isSpeakable(sel) && sel.indexOf(" ") === -1) { speak(sel); return; }
    const w = wordAtPoint(e.clientX, e.clientY);
    if (isSpeakable(w)) speak(w);
  });

  /* 悬停在德语单词上时给指针反馈（节流，避免每像素都算） */
  let hoverT = 0;
  document.addEventListener("mousemove", e => {
    const now = Date.now();
    if (now - hoverT < 90) return;
    hoverT = now;
    const t = e.target;
    if (t && t.nodeType === 1 &&
        t.closest("a, button, input, textarea, select, label, [contenteditable], ruby")) {
      document.body.style.cursor = "";
      return;
    }
    const w = wordAtPoint(e.clientX, e.clientY);
    document.body.style.cursor = isSpeakable(w) ? "pointer" : "";
  }, { passive: true });

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
    if (mode() !== "off") setTimeout(annotateAll, 120);
    try {
      const y = parseInt(sessionStorage.getItem("dh_scroll") || "0", 10);
      if (y) { sessionStorage.removeItem("dh_scroll"); window.scrollTo(0, y); }
    } catch (e) { /* ignore */ }
    // 动态内容后若开着标注，重新扫一遍
    const mo = new MutationObserver(() => { if (mode() !== "off") annotateAll(); });
    mo.observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
  });
})();
