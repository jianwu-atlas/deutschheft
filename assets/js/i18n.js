/* ============================================================
   i18n.js · 中 / 英 双语切换
   ------------------------------------------------------------
   · 语言状态：localStorage `deutschheft_lang`，可用 ?lang=en 直接指定
   · 静态文案：HTML 元素加 data-i18n="key"，加载时快照中文原文，
     切到英文时用 EN[key] 替换，切回中文时还原快照
   · 渲染文案：deutsch.js 用 L(zh, en) / pick(obj) 取当前语言
   · 切换按钮：#langToggle（导航右上角）
   ============================================================ */
(function () {
  "use strict";

  /* 英文内容库（可能只加载了部分 Part，缺的用空对象兜底） */
  const EN_UI = window.EN_UI || {};
  const EN_UI_RULES = window.EN_UI_RULES || [];
  const EN_SRC = window.EN_SRC || {};
  const EN_WORDS = window.EN_WORDS || {};
  const EN_SENT = window.EN_SENT || {};
  const EN_LESSON = window.EN_LESSON || {};
  const EN_POINT = window.EN_POINT || {};
  const EN_GRAMMAR = window.EN_GRAMMAR || {};
  const EN_TEXT = window.EN_TEXT || {};
  const EN_PARA = window.EN_PARA || {};
  const EN_PARA_TITLE = window.EN_PARA_TITLE || {};
  const EN_QUIZ = window.EN_QUIZ || {};
  const EN_OPT = window.EN_OPT || {};
  const EN_BOOK = window.EN_BOOK || {};
  const EN_BOOKWORD = window.EN_BOOKWORD || {};
  const EN_FORM = window.EN_FORM || {};
  const EN_NOTE = window.EN_NOTE || {};
  const EN_KURS = window.EN_KURS || {};
  const EN_KURS_G = window.EN_KURS_G || {};

  const KEY = "deutschheft_lang";
  const SUPPORTED = ["zh", "en"];

  function detect() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q && SUPPORTED.includes(q)) return q;
    const saved = localStorage.getItem(KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    return "zh";
  }

  let LANG = detect();

  /* ---------- 静态文案英文对照（中文原文在 HTML 里，无需重复） ---------- */
  const EN = {
    /* 导航 */
    "nav.start": 'Home <span style="opacity:.55;font-size:12px">Start</span>',
    "nav.lektionen": 'Lessons <span style="opacity:.55;font-size:12px">Lektionen</span>',
    "nav.wortschatz": 'Vocabulary <span style="opacity:.55;font-size:12px">Wortschatz</span>',
    "nav.grammatik": 'Grammar <span style="opacity:.55;font-size:12px">Grammatik</span>',
    "nav.formen": 'Word Forms <span style="opacity:.55;font-size:12px">Formen</span>',
    "nav.texte": 'Texts <span style="opacity:.55;font-size:12px">Texte</span>',
    "nav.lehrbuch": 'Textbook <span style="opacity:.55;font-size:12px">Lehrbuch</span>',
    "nav.referenz": 'Reference <span style="opacity:.55;font-size:12px">Referenz</span>',
    "nav.uebungen": 'Exercises <span style="opacity:.55;font-size:12px">Übungen</span>',
    "nav.notion": 'Notes <span style="opacity:.55;font-size:12px">Notizen</span>',
    "nav.kursplan": 'Syllabus <span style="opacity:.55;font-size:12px">Kursplan</span>',
    "brand.sub": "JIAN · GERMAN A1–A1.2",
    /* 页头 */
    "head.lektionen.kicker": "01 · Lessons",
    "head.lektionen.title": "Lessons <em>Overview</em>",
    "head.lektionen.desc": "Ordered by your actual class dates (A1 × 11 → A1.2 × 2). Click a lesson to unfold vocabulary, grammar points and core sentences; the dot on the right marks it as reviewed (stored locally).",
    "head.wortschatz.kicker": "02 · Vocabulary",
    "head.wortschatz.title": "Vocabulary <em>Cards</em>",
    "head.wortschatz.desc": "Everything comes from your class notes. <em>der</em> blue / <em>die</em> red / <em>das</em> green / verbs purple. Each card shows <strong>IPA</strong>; filter by topic or part of speech, search in German or English, click a card to flip it for the meaning.",
    "head.grammatik.kicker": "03 · Grammar",
    "head.grammatik.title": "Grammar <em>in 12 chapters</em>",
    "head.grammatik.desc": "From “verb in second position” to the perfect tense — every grammar point distilled from your class notes, in learning order, with conjugation tables and example sentences.",
    "head.formen.kicker": "Word Forms · Overview",
    "head.formen.title": "Word Forms <em>Formen</em>",
    "head.formen.desc": "Every <b>inflected word</b> on the site gathered in one place: verb conjugation in six persons plus perfect tense, noun plurals, adjective comparison, article and pronoun declension — plus a corpus index of every form that actually appears on the site. Five tabs, one lookup.",
    "head.texte.kicker": "04 · Texts",
    "head.texte.title": "Reading <em>Texts</em>",
    "head.texte.desc": "Two lab texts closely tied to your research routine (one present tense, one perfect tense). Each paragraph comes with an English translation and highlighted key verbs; the translation can be hidden for self-testing.",
    "head.lehrbuch.kicker": "Textbook · Course Books",
    "head.lehrbuch.title": "Textbook <em>Reader + Notes</em>",
    "head.lehrbuch.desc": "Your five textbooks: four course handouts plus <em>German for Absolute Beginners</em> (338 pages). Each can be read online or downloaded, with a structured vocabulary list, core sentences (IPA + audio) and grammar notes; the raw PDF text is extracted automatically for reference.",
    "head.referenz.kicker": "Reference · Quick Lookup",
    "head.referenz.title": "Reference <em>Numbers · Time · Colours · Seasons</em>",
    "head.referenz.desc": "Four “open-and-check” tables: numbers 0–100, telling the time, 18 colours, and seasons / months / weekdays / weather — all with IPA.",
    "head.uebungen.kicker": "05 · Exercises",
    "head.uebungen.title": "Interactive <em>Exercises</em>",
    "head.uebungen.desc": "Five quiz sets covering the core points you have learned: verb conjugation, number traps, the <em>halb</em> time trap, the perfect tense, and word gender. Instant explanations after answering; best score stored locally.",
    "head.notion.kicker": "06 · Notion Sync",
    "head.notion.title": "Notes <em>&amp; Sync</em>",
    "head.notion.desc": "Your Notion German notes (14 entries, generated by scripts/notion_export_sync.py, bundled offline). Drag in exported .md/.zip files, paste text, and search across all notes. The note texts themselves are kept in Chinese.",
    "head.kursplan.kicker": "07 · Syllabus",
    "head.kursplan.title": "Syllabus <em>Map</em>",
    "head.kursplan.desc": "Your A1–A2 course has 15 survival-oriented topics in four blocks. Green = already learned, click to jump to the lesson; grey = still to come. The notes suggest tackling 13 Bürokratie (paperwork) and 2 Arztbesuch (seeing a doctor) first.",
    /* 首页 */
    "home.hero.kicker": "A1 → A1.2 · Personal Study Site",
    "home.hero.title": "My German <em>Notebook</em>",
    "home.hero.desc": "Everything from your class notes and Notion, organised into a study site: lessons, vocabulary with IPA, grammar, word forms, reading texts, exercises and a syllabus map.",
    "home.modules": "Modules",
    "home.quick": "Quick links",
    "home.stats.lessons": "lessons",
    "home.stats.vocab": "vocabulary entries",
    "home.stats.grammar": "grammar topics",
    "home.stats.verbs": "verbs with full conjugation",
    /* 页脚 */
    "foot.copyright": '© 2026 Jian Wu · Mein Deutschheft (A1 → A1.2) · Updated 2026-10-13 · <a href="https://github.com/jianwu-atlas" target="_blank" rel="noopener">GitHub</a> · <a href="https://jackng833.notion.site/38e20c5c739a80cb9445c9f080fc19d5" target="_blank" rel="noopener">Notion source</a>',
    /* 按钮 */
    "btn.theme": "Switch to dark mode",
    "btn.burger": "Menu",
    "btn.lang": "Switch language",
    "btn.speak": "Read aloud",
    "btn.speakSentence": "Read this sentence aloud",
    "btn.ipaToggle": "Show IPA above German words (function words such as ich / der / ist are left unmarked; click a word to hear it)"
  };

  /* ---------- 当前语言下取值 ---------- */
  function L(zh, en) {
    if (LANG === "en" && en != null && en !== "") return en;
    return zh;
  }
  /* 数据对象式取值：{ zh, en } 或直接 zh 字符串 */
  function pick(zhVal, enVal) { return L(zhVal, enVal); }
  function isEn() { return LANG === "en"; }
  function lang() { return LANG; }

  /* ---------- 静态文案替换 ---------- */
  const snapshots = new Map();

  function snapshot() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      if (!snapshots.has(el)) snapshots.set(el, el.innerHTML);
    });
  }

  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const zh = snapshots.get(el);
      if (LANG === "en" && EN[key]) el.innerHTML = EN[key];
      else if (zh != null) el.innerHTML = zh;
    });
    document.documentElement.setAttribute("lang", LANG === "en" ? "en" : "zh-CN");
    document.body.setAttribute("data-lang", LANG);
    const btn = document.getElementById("langToggle");
    if (btn) {
      btn.textContent = LANG === "en" ? "中" : "EN";
      btn.title = LANG === "en" ? "切换到中文" : "Switch to English";
      btn.setAttribute("aria-label", btn.title);
    }
  }

  /* ---------- 切换 ---------- */
  function setLang(next) {
    if (!SUPPORTED.includes(next) || next === LANG) return;
    LANG = next;
    localStorage.setItem(KEY, next);
    const url = new URL(location.href);
    url.searchParams.set("lang", next);
    history.replaceState(null, "", url.toString());
    applyStatic();
    // 让渲染层重新绘制当前页
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: next } }));
  }

  function buildToggle() {
    const tools = document.querySelector(".nav-tools");
    if (!tools || document.getElementById("langToggle")) return;
    const b = document.createElement("button");
    b.id = "langToggle";
    b.addEventListener("click", () => setLang(LANG === "en" ? "zh" : "en"));
    tools.insertBefore(b, tools.firstChild);
  }

  /* ============================================================
     数据层双语切换：把各数据对象的 zh 字段换成英文（可逆）
     ============================================================ */
  const bare = s => String(s).toLowerCase().replace(/^(der|die|das)\s+/, "");
  const hit = (map, k) => (map && k != null && map[k] != null) ? map[k] : null;

  function applyData() {
    if (typeof VOCAB === "undefined") return;   // 非数据页
    const en = LANG === "en";

    /* 词卡 */
    VOCAB.forEach(v => {
      if (v._zh === undefined) v._zh = v.zh;
      v.zh = en ? (hit(EN_WORDS, bare(v.de)) || v._zh) : v._zh;
    });

    /* 全站词表 */
    if (typeof WORTLISTE !== "undefined") {
      WORTLISTE.forEach(x => {
        if (x._zh === undefined) x._zh = x.zh;
        if (x._src === undefined) x._src = x.src;
        x.zh = en ? (hit(EN_WORDS, x.w) || x._zh) : x._zh;
        x.src = en ? x._src.map(s => EN_SRC[s] || s) : x._src;
      });
    }

    /* 课程 */
    LESSONS.forEach(l => {
      if (l._zh === undefined) { l._zh = l.zh; l._summary = l.summary; l._focus = l.focus; l._grammar = l.grammar.slice(); }
      const e = hit(EN_LESSON, l.id) || {};
      l.zh = en ? (e.title || l._zh) : l._zh;
      l.summary = en ? (e.summary || l._summary) : l._summary;
      l.focus = en ? (e.focus || l._focus) : l._focus;
      l.grammar = en ? l._grammar.map(g => hit(EN_POINT, g) || g) : l._grammar;
      l.sentences.forEach(s => {
        if (s._zh === undefined) s._zh = s.zh;
        s.zh = en ? (hit(EN_SENT, s.de) || s._zh) : s._zh;
      });
    });

    /* 语法 */
    if (typeof GRAMMAR !== "undefined") {
      GRAMMAR.forEach(g => {
        if (g._body === undefined) { g._body = g.body; g._zh = g.zh; g._title = g.title; }
        const e = hit(EN_GRAMMAR, g.id) || {};
        g.body = en ? (e.body || g._body) : g._body;
        g.zh = en ? (e.tag || g._zh) : g._zh;
        g.title = en ? (e.title || g._title) : g._title;
      });
    }

    /* 课文 */
    if (typeof TEXTS !== "undefined") {
      TEXTS.forEach(t => {
        if (t._zh === undefined) { t._zh = t.zh; t._title = t.title; t._intro = t.intro; }
        const e = hit(EN_TEXT, t.id) || {};
        t.zh = en ? (e.title || t._zh) : t._zh;
        t.title = en ? (e.title || t._title) : t._title;
        t.intro = en ? (e.intro || t._intro) : t._intro;
        t.paragraphs.forEach(p => {
          if (p._zh === undefined) { p._zh = p.zh; p._title = p.title; p._verbs = p.verbs; }
          p.zh = en ? (hit(EN_PARA, p.de) || p._zh) : p._zh;
          p.title = en ? (hit(EN_PARA_TITLE, p.title) || p._title) : p._title;
        });
      });
    }

    /* 练习 */
    if (typeof QUIZZES !== "undefined") {
      QUIZZES.forEach(q => {
        if (q._zh === undefined) { q._zh = q.zh; q._title = q.title; q._desc = q.desc; q._de = q.de; }
        const e = hit(EN_QUIZ, q.id) || {};
        q.zh = en ? (e.title || q._zh) : q._zh;
        q.title = en ? (e.title || q._title) : q._title;
        q.desc = en ? (e.desc || q._desc) : q._desc;
        q.de = en ? (e.de || q._de) : q._de;
        q.questions.forEach((qq, i) => {
          if (qq._zh === undefined) { qq._zh = qq.q; qq._explain = qq.explain; qq._opts = qq.options.slice(); }
          const ee = (e.questions || [])[i] || {};
          qq.q = en ? (ee.q || qq._zh) : qq._zh;
          qq.explain = en ? (ee.explain || qq._explain) : qq._explain;
          qq.options = en ? qq._opts.map(o => hit(EN_OPT, o) || o) : qq._opts;
        });
      });
    }

    /* 教材 */
    if (typeof LEHRBUECHER !== "undefined") {
      LEHRBUECHER.forEach(b => {
        if (b._zh === undefined) { b._zh = b.zh; b._de = b.de; b._lesson = b.lesson; b._points = b.points.slice(); }
        const e = hit(EN_BOOK, b.id) || {};
        b.zh = en ? (e.zh || b._zh) : b._zh;
        b.de = en ? (e.de || b._de) : b._de;
        b.lesson = en ? (e.lesson || b._lesson) : b._lesson;
        b.points = en ? b._points.map(p => hit(EN_POINT, p) || p) : b._points;
        b.words.forEach(w => {
          if (w._zh === undefined) w._zh = w[1];
          w[1] = en ? (hit(EN_WORDS, bare(w[0])) || hit(EN_BOOKWORD, w[1]) || w._zh) : w._zh;
        });
        b.sentences.forEach(s => {
          if (s._zh === undefined) s._zh = s[1];
          s[1] = en ? (hit(EN_SENT, s[0]) || s._zh) : s._zh;
        });
      });
    }

    /* 词形变化 */
    if (typeof FORMEN_VERBEN !== "undefined") {
      FORMEN_VERBEN.forEach(v => {
        if (v._zh === undefined) { v._zh = v.zh; v._note = v.note; }
        v.zh = en ? (hit(EN_WORDS, bare(v.de)) || hit(EN_FORM, v.de) || v._zh) : v._zh;
        v.note = en ? (hit(EN_NOTE, v._note) || v._note) : v._note;
      });
    }
    if (typeof FORMEN_ADJ !== "undefined") {
      FORMEN_ADJ.forEach(a => {
        if (a._zh === undefined) { a._zh = a[1]; a._note = a[4]; }
        a[1] = en ? (hit(EN_WORDS, a[0]) || a._zh) : a._zh;
        a[4] = en ? (hit(EN_NOTE, a._note) || a._note) : a._note;
      });
    }
    if (typeof FORMEN_DEKL !== "undefined") {
      const D = FORMEN_DEKL;
      if (!D._zh) D._zh = JSON.parse(JSON.stringify(D));
      const swapArr = (key) => {
        if (!D[key]) return;
        D[key].forEach((row, i) => row.forEach((c, j) => {
          const orig = D._zh[key][i][j];
          D[key][i][j] = en ? (hit(EN_UI, orig) || orig) : orig;
        }));
      };
      ["artikelBest", "artikelUnbest", "pronomen", "possessiv", "pluralRegeln"].forEach(swapArr);
    }

    /* 大纲 */
    if (typeof KURSPLAN !== "undefined") {
      KURSPLAN.forEach(g => {
        if (g._group === undefined) { g._group = g.group; }
        g.group = en ? (hit(EN_KURS_G, g._group) || g._group) : g._group;
        g.items.forEach(it => {
          if (it._zh === undefined) it._zh = it.zh;
          it.zh = en ? (hit(EN_KURS, it.de) || it._zh) : it._zh;
        });
      });
    }
  }

  /* ============================================================
     界面文案：渲染后按文本节点替换（中文 → 英文）
     字典 EN_UI 按中文原串索引；动态串用 EN_UI_RULES 正则
     ============================================================ */
  let scanning = false;
  function translateDom(root) {
    if (LANG !== "en") return;
    if (scanning) return;
    scanning = true;
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const raw = n.nodeValue;
      if (!raw || !/[\u4e00-\u9fff]/.test(raw)) return;
      const key = raw.trim();
      if (EN_UI[key]) { n.nodeValue = raw.replace(key, EN_UI[key]); return; }
      // 「… · 主题名」形式：只翻尾部主题
      const mt = /^(.* · )([^ ·]+)$/.exec(key);
      if (mt && EN_UI[mt[2]]) { n.nodeValue = raw.replace(key, mt[1] + EN_UI[mt[2]]); return; }
      // 生词表主题链接
      const ml = /^→ 在生词表中查看「(.+)」主题词汇$/.exec(key);
      if (ml) { n.nodeValue = raw.replace(key, "→ See the \u201c" + (EN_UI[ml[1]] || ml[1]) + "\u201d topic in the vocabulary list"); return; }
      if (EN_UI_RULES.length) {
        for (let i = 0; i < EN_UI_RULES.length; i++) {
          const re = EN_UI_RULES[i][0];
          if (re.test(raw)) { n.nodeValue = raw.replace(re, EN_UI_RULES[i][1]); return; }
        }
      }
    });
    scanning = false;
  }

  /* 供渲染层调用：切换语言后重新绘制 */
  function reRender() {
    applyData();
    if (typeof PAGES !== "undefined" && PAGES[document.body.dataset.page]) {
      const app = document.getElementById("app");
      if (app) PAGES[document.body.dataset.page](app);
    }
    setTimeout(() => translateDom(document.body), 0);
  }

  document.addEventListener("langchange", reRender);
  document.addEventListener("DOMContentLoaded", () => {
    snapshot();
    buildToggle();
    applyData();
    applyStatic();
    if (LANG === "en") setTimeout(() => translateDom(document.body), 60);
  });
  /* 渲染后自动补翻（含动态内容：搜索、翻页、切页签） */
  document.addEventListener("DOMContentLoaded", () => {
    if (LANG !== "en") return;
    const mo = new MutationObserver(() => translateDom(document.body));
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
  });

  window.DH = window.DH || {};
  Object.assign(window.DH, {
    L: L, pick: pick, isEn: isEn, lang: lang, setLang: setLang, applyStatic: applyStatic,
    EN: EN
  });
})();
