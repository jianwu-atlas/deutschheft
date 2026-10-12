/* ============================================================
   Mein Deutschheft · 多页交互核心
   与 jianwu-atlas-private 同款静态多页结构：每页静态头尾 + JS 渲染主体
   ============================================================ */

"use strict";

/* ---------------- 本地存储：复习标记 / 测验成绩 ---------------- */
const store = {
  key: "deutschheft_v1",
  read() {
    try { return JSON.parse(localStorage.getItem(this.key)) || { reviewed: [], best: {} }; }
    catch (e) { return { reviewed: [], best: {} }; }
  },
  write(d) { localStorage.setItem(this.key, JSON.stringify(d)); },
  isReviewed(id) { return this.read().reviewed.includes(id); },
  toggleReview(id) {
    const d = this.read();
    const i = d.reviewed.indexOf(id);
    if (i >= 0) d.reviewed.splice(i, 1); else d.reviewed.push(id);
    this.write(d);
    return d.reviewed.includes(id);
  },
  reviewedCount() { return this.read().reviewed.filter(id => LESSONS.some(l => l.id === id)).length; },
  getBest(qid) { return this.read().best[qid]; },
  setBest(qid, score, total) {
    const d = this.read();
    const prev = d.best[qid];
    if (!prev || score > prev.score) { d.best[qid] = { score, total }; this.write(d); }
  }
};

/* ---------------- 主题（暗色模式） ---------------- */
function initTheme() {
  const saved = localStorage.getItem("deutschheft_theme");
  if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  const btn = document.getElementById("themeToggle");
  if (btn) {
    paintThemeBtn();
    btn.addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (dark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("deutschheft_theme", "light"); }
      else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("deutschheft_theme", "dark"); }
      paintThemeBtn();
    });
  }
  function paintThemeBtn() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    btn.textContent = dark ? "☀️" : "🌙";
    btn.title = dark ? "切换到浅色" : "切换到深色";
  }
}

/* ---------------- 移动端导航 ---------------- */
function initBurger() {
  const burger = document.getElementById("navBurger");
  const links = document.getElementById("navLinks");
  if (!burger || !links) return;
  burger.addEventListener("click", () => links.classList.toggle("show"));
  links.addEventListener("click", e => { if (e.target.tagName === "A") links.classList.remove("show"); });
}

/* ---------------- 工具 ---------------- */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const POS_META = {
  der: { label: "der · 阳性", cls: "pos-der" },
  die: { label: "die · 阴性", cls: "pos-die" },
  das: { label: "das · 中性", cls: "pos-das" },
  verb: { label: "动词", cls: "pos-verb" },
  adj: { label: "形容词", cls: "pos-adj" },
  adv: { label: "副词", cls: "pos-adv" },
  phrase: { label: "短语", cls: "pos-phrase" },
  pl: { label: "复数词", cls: "pos-pl" }
};

/* ============================================================
   页面分发
   ============================================================ */
const PAGES = {
  start: renderStart,
  lektionen: renderLessons,
  wortschatz: renderVocab,
  grammatik: renderGrammar,
  texte: renderTexts,
  uebungen: renderQuizHome,
  kursplan: renderKursplan
};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initBurger();
  const page = document.body.dataset.page;
  if (PAGES[page]) PAGES[page]($("#app"));
});

/* ============================================================
   首页 Start
   ============================================================ */
function renderStart(app) {
  const doneTopics = KURSPLAN.flatMap(g => g.items).filter(i => i.status === "done").length;
  const totalTopics = KURSPLAN.flatMap(g => g.items).length;
  const reviewed = store.reviewedCount();
  const pct = Math.round((doneTopics / totalTopics) * 100);

  const modules = [
    { route: "lektionen.html", num: "01", de: "Lektionen", zh: "分级课程", desc: "11 节 A1 主题课 + 2 节 A1.2 实验室课文课，按你的实际上课顺序排列。" },
    { route: "wortschatz.html", num: "02", de: "Wortschatz", zh: "生词表", desc: VOCAB.length + " 张词汇卡：每张含国际音标 + 中文谐音，按主题与词性筛选，点卡片翻面看释义。" },
    { route: "grammatik.html", num: "03", de: "Grammatik", zh: "语法讲解", desc: GRAMMAR.length + " 个语法专题：从动词第二位到现在完成时。" },
    { route: "texte.html", num: "04", de: "Texte", zh: "课文阅读", desc: "两篇实验室课文逐段中德对照，完成时重点动词逐一标注。" },
    { route: "referenz.html", num: "05", de: "Referenz", zh: "速查表", desc: "打开就能查：数字 0–100 全表、口语报时、18 种颜色、四季/月份/星期/天气，全部注有音标与中文谐音。" },
    { route: "uebungen.html", num: "06", de: "Übungen", zh: "互动练习", desc: QUIZZES.length + " 组测验：变位、数字、时间、完成时、词性。" },
    { route: "notion.html", num: "07", de: "Notion 同步", zh: "笔记库", desc: "Notion 全部笔记离线内置，支持导入导出文件、粘贴同步、全文搜索。" },
    { route: "kursplan.html", num: "08", de: "Kursplan", zh: "课程大纲", desc: "15 主题生存德语地图，标注已学 / 待学进度。" }
  ];

  app.innerHTML = `
    <section class="hero">
      <div class="hero-kicker">Deutsch lernen · Stand ${SITE.stand}</div>
      <h1>Mein <em>Deutschheft</em></h1>
      <p>${SITE.subtitle} —— 整合你的 A1 课堂笔记、A1.2 实验室课文与 Notion 笔记库：词汇、语法、句型、课文、练习，一册在手，随时复习。</p>
      <div class="hero-progress">
        <div class="hp-label"><span>大纲进度 · Kursplan</span><span>${doneTopics} / ${totalTopics} 主题 · 当前 ${SITE.level}</span></div>
        <div class="hp-bar"><div class="hp-fill" id="hpFill"></div></div>
      </div>
    </section>

    <div class="stat-grid">
      <div class="card stat"><div class="stat-num">${LESSONS.length}</div><div class="stat-label">已学课程 · Lektionen</div></div>
      <div class="card stat"><div class="stat-num">${VOCAB.length}</div><div class="stat-label">核心生词 · Wörter</div></div>
      <div class="card stat"><div class="stat-num">${GRAMMAR.length}</div><div class="stat-label">语法专题 · Grammatik</div></div>
      <div class="card stat"><div class="stat-num">${TEXTS.length}</div><div class="stat-label">课文 · Texte</div></div>
      <div class="card stat"><div class="stat-num">${NOTION_NOTES.length}</div><div class="stat-label">Notion 笔记 · Notizen</div></div>
      <div class="card stat"><div class="stat-num">${reviewed}<small> / ${LESSONS.length}</small></div><div class="stat-label">已复习标记 · Wiederholt</div></div>
    </div>

    <h2 class="section-title">学习板块 · Module</h2>
    <div class="module-grid">
      ${modules.map(m => `
        <a class="card module" href="${m.route}">
          <div class="module-num">${m.num}</div>
          <div class="module-de">${m.de}</div>
          <div class="module-zh">${m.zh}</div>
          <div class="module-desc">${m.desc}</div>
        </a>`).join("")}
    </div>

    <div class="focus-box">
      <h3>🎯 当前学习重点 · Aktueller Fokus</h3>
      <p>你刚进入 <strong>A1.2</strong> 阶段，最近一课是 <strong>现在完成时（Das Perfekt）</strong>：haben/sein + Partizip II 的框架结构。建议先读课文《Ein besonderer Tag im Labor》，再做「现在完成时」专项测验巩固助动词选择。大纲上 <strong>Bürokratie（办事）</strong>与 <strong>Arztbesuch（看病）</strong>是接下来最值得优先攻克的两个生存主题。</p>
    </div>
  `;
  requestAnimationFrame(() => { const f = $("#hpFill"); if (f) f.style.width = pct + "%"; });
}

/* ============================================================
   课程 Lektionen
   ============================================================ */
function renderLessons(app) {
  const levels = [["A1", "A1 · 基础阶段（11 课，2026-04 → 2026-07）"], ["A1.2", "A1.2 · 进阶阶段（进行中）"]];
  app.innerHTML = `
    ${levels.map(([lv, label]) => `
      <div class="level-head">${label}</div>
      ${LESSONS.filter(l => l.level === lv).map(lessonCardHTML).join("")}
    `).join("")}
  `;

  $$(".lesson-head", app).forEach(head => {
    head.addEventListener("click", e => {
      if (e.target.closest(".review-dot")) return;
      head.parentElement.classList.toggle("open");
    });
  });
  $$(".review-dot", app).forEach(dot => {
    dot.addEventListener("click", e => {
      e.stopPropagation();
      const done = store.toggleReview(dot.dataset.id);
      dot.classList.toggle("done", done);
      dot.textContent = done ? "✓" : "";
    });
  });

  // 支持 lektionen.html#lesson-l7 锚点打开
  const anchor = location.hash.replace("#lesson-", "");
  if (anchor) {
    const el = $("#lesson-" + CSS.escape(anchor), app);
    if (el) { el.classList.add("open"); setTimeout(() => el.scrollIntoView({ block: "start" }), 60); }
  }
}

function lessonCardHTML(l) {
  const reviewed = store.isReviewed(l.id);
  return `
    <div class="card lesson" id="lesson-${l.id}">
      <div class="lesson-head">
        <div class="lesson-num">${l.num}</div>
        <div class="lesson-titles">
          <div class="lt-de">${l.de}</div>
          <div class="lt-zh">${l.title}</div>
        </div>
        <div class="lesson-meta">
          <span class="tag ${l.level === "A1" ? "tag-a1" : "tag-a2"}">${l.level}</span>
          <span class="lesson-date">${l.date}</span>
          <span class="review-dot ${reviewed ? "done" : ""}" data-id="${l.id}" title="标记已复习">${reviewed ? "✓" : ""}</span>
          <span class="lesson-caret">▶</span>
        </div>
      </div>
      <div class="lesson-body">
        <p class="lesson-summary">${l.summary}</p>
        <div class="lb-label">语法要点 · Grammatik</div>
        <ul class="grammar-list">${l.grammar.map(g => `<li>${g}</li>`).join("")}</ul>
        <div class="lb-label">核心句型 · Sätze</div>
        <table class="sentence-table">
          ${l.sentences.map(s => `<tr><td class="s-de">${s.de}</td><td class="s-zh">${s.zh}</td></tr>`).join("")}
        </table>
        <div class="focus-inline">💡 <strong>本课焦点：</strong>${l.focus}</div>
        <div class="lesson-vocab-link"><a href="wortschatz.html" data-topic="${l.topic}" class="to-vocab">→ 在生词表中查看「${l.topic}」主题词汇</a></div>
      </div>
    </div>`;
}

/* ============================================================
   生词表 Wortschatz
   ============================================================ */
let vocabState = { q: "", topic: null, pos: null };

function renderVocab(app) {
  app.innerHTML = `
    <div class="vocab-toolbar">
      <input class="vocab-search" id="vSearch" type="search" placeholder="搜索德语或中文… (z.B. Labor / 实验)" value="${esc(vocabState.q)}">
      <button class="chip ${vocabState.pos === "der" ? "on" : ""}" data-pos="der">der</button>
      <button class="chip ${vocabState.pos === "die" ? "on" : ""}" data-pos="die">die</button>
      <button class="chip ${vocabState.pos === "das" ? "on" : ""}" data-pos="das">das</button>
      <button class="chip ${vocabState.pos === "verb" ? "on" : ""}" data-pos="verb">动词</button>
    </div>
    <div class="chip-row" id="topicChips">
      <button class="chip ${!vocabState.topic ? "on" : ""}" data-topic="">全部主题</button>
      ${VOCAB_TOPICS.map(t => `<button class="chip ${vocabState.topic === t ? "on" : ""}" data-topic="${t}">${t}</button>`).join("")}
    </div>
    <div class="vocab-count" id="vCount"></div>
    <div class="vocab-grid" id="vGrid"></div>
  `;

  $("#vSearch").addEventListener("input", e => { vocabState.q = e.target.value; renderVocabGrid(); });
  $$("#topicChips .chip").forEach(c => c.addEventListener("click", () => {
    vocabState.topic = c.dataset.topic || null;
    $$("#topicChips .chip").forEach(x => x.classList.toggle("on", x === c));
    renderVocabGrid();
  }));
  $$(".vocab-toolbar .chip[data-pos]").forEach(c => c.addEventListener("click", () => {
    vocabState.pos = vocabState.pos === c.dataset.pos ? null : c.dataset.pos;
    $$(".vocab-toolbar .chip[data-pos]").forEach(x => x.classList.toggle("on", x.dataset.pos === vocabState.pos));
    renderVocabGrid();
  }));
  renderVocabGrid();
}

function renderVocabGrid() {
  const q = vocabState.q.trim().toLowerCase();
  const list = VOCAB.filter(v =>
    (!vocabState.topic || v.topic === vocabState.topic) &&
    (!vocabState.pos || v.pos === vocabState.pos) &&
    (!q || v.de.toLowerCase().includes(q) || v.zh.toLowerCase().includes(q))
  );
  $("#vCount").textContent = list.length + " 个词条" + (vocabState.topic ? " · " + vocabState.topic : "");
  $("#vGrid").innerHTML = list.map(v => {
    const meta = POS_META[v.pos] || POS_META.phrase;
    const p = (typeof PRON !== "undefined" && PRON[v.de]) || {};
    return `
      <div class="vcard" tabindex="0">
        <div class="vcard-inner">
          <div class="vface front">
            <span class="v-hint">↻</span>
            <div class="v-de ${meta.cls}">${v.de}</div>
            <div class="v-ipa">${p.ipa || v.ipa || meta.label}</div>
            <div class="v-pron">${p.zh ? "≈ " + p.zh : ""}</div>
          </div>
          <div class="vface back">
            <div class="v-zh">${v.zh}</div>
            ${p.zh ? `<div class="v-back-pron">≈ ${p.zh}</div>` : ""}
            <div class="v-back-meta">${v.plural ? "Pl. " + v.plural + " · " : ""}${v.topic}</div>
          </div>
        </div>
      </div>`;
  }).join("");

  $$(".vcard").forEach(c => {
    const flip = () => c.classList.toggle("flip");
    c.addEventListener("click", flip);
    c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });
}

/* ============================================================
   语法 Grammatik
   ============================================================ */
function renderGrammar(app, openId) {
  app.innerHTML = GRAMMAR.map((g, i) => `
    <div class="card grammar-item" id="${g.id}">
      <div class="grammar-head">
        <span class="g-tag">${g.tag}</span>
        <span class="g-title">${String(i + 1).padStart(2, "0")} · ${g.title}</span>
        <span class="g-de">${g.de}</span>
        <span class="g-caret">▶</span>
      </div>
      <div class="grammar-body">${g.body}</div>
    </div>`).join("");
  $$(".grammar-head", app).forEach(h => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
  if (openId) {
    const el = $("#" + CSS.escape(openId), app);
    if (el) { el.classList.add("open"); el.scrollIntoView({ block: "start" }); }
  }
}

/* ============================================================
   课文 Texte
   ============================================================ */
let textState = { id: "t2", hideZh: false };

function renderTexts(app) {
  const t = TEXTS.find(x => x.id === textState.id) || TEXTS[0];
  app.innerHTML = `
    <div class="text-tabs">
      ${TEXTS.map(x => `
        <button class="text-tab ${x.id === t.id ? "on" : ""}" data-id="${x.id}">
          <span class="tt-de">${x.de}</span>
          <span class="tt-meta">${x.title} · ${x.level} · ${x.date}</span>
        </button>`).join("")}
    </div>
    <p class="text-intro">${t.intro}</p>
    <div class="text-controls">
      <button class="btn primary" id="toggleZh">${textState.hideZh ? "显示中文翻译" : "隐藏中文翻译（自测）"}</button>
    </div>
    <div id="textBody" class="${textState.hideZh ? "hide-zh" : ""}">
      ${t.paragraphs.map((p, i) => `
        <div class="card para">
          <div class="para-head"><span class="para-no">${String(i + 1).padStart(2, "0")}</span><span class="para-title">${p.title || ""}</span></div>
          <div class="para-de">${p.de}</div>
          <div class="para-zh">${p.zh}</div>
          ${p.verbs ? `<div class="para-verbs">${p.verbs.map(v => `<span class="verb-chip">${v}</span>`).join("")}</div>` : ""}
        </div>`).join("")}
    </div>
  `;
  $$(".text-tab", app).forEach(b => b.addEventListener("click", () => { textState.id = b.dataset.id; renderTexts(app); }));
  $("#toggleZh").addEventListener("click", () => { textState.hideZh = !textState.hideZh; renderTexts(app); });
}

/* ============================================================
   练习 Übungen
   ============================================================ */
let quizState = null;

function renderQuizHome(app) {
  app.innerHTML = `
    <div class="quiz-grid">
      ${QUIZZES.map((q, i) => {
        const best = store.getBest(q.id);
        return `
        <div class="card quiz-card" data-id="${q.id}">
          <div class="module-num">SET ${i + 1} · ${q.questions.length} 题</div>
          <div class="qc-de">${q.de}</div>
          <div class="qc-title">${q.title}</div>
          <div class="qc-desc">${q.desc}</div>
          <div class="qc-best">${best ? "★ 最好成绩 " + best.score + "/" + best.total : "尚未挑战"}</div>
        </div>`;
      }).join("")}
    </div>
  `;
  $$(".quiz-card", app).forEach(c => c.addEventListener("click", () => startQuiz(c.dataset.id, app)));
}

function startQuiz(id, app) {
  const set = QUIZZES.find(q => q.id === id);
  quizState = { set, idx: 0, score: 0, results: [] };
  renderQuizQuestion(app);
}

function renderQuizQuestion(app) {
  const { set, idx } = quizState;
  const q = set.questions[idx];
  const dots = set.questions.map((_, i) => {
    let cls = "qdot";
    if (quizState.results[i] === true) cls += " ok";
    else if (quizState.results[i] === false) cls += " bad";
    if (i === idx) cls += " cur";
    return `<span class="${cls}"></span>`;
  }).join("");

  app.innerHTML = `
    <div class="quiz-stage">
      <div class="quiz-topbar">
        <a class="btn" href="uebungen.html">← 返回</a>
        <div class="quiz-dots">${dots}</div>
        <span class="quiz-score-label">${set.de} · ${idx + 1}/${set.questions.length}</span>
      </div>
      <div class="card quiz-qcard">
        <div class="quiz-q">${q.q}<small>选择正确的德语形式</small></div>
        <div class="quiz-opts">
          ${q.options.map((o, i) => `
            <button class="opt" data-i="${i}"><span class="opt-key">${"ABCD"[i]}</span><span>${o}</span></button>`).join("")}
        </div>
        <div class="quiz-explain" id="qExplain"></div>
        <div class="quiz-next-row">
          <span class="quiz-score-label">得分 ${quizState.score}</span>
          <button class="btn primary" id="qNext" style="visibility:hidden">${idx + 1 === set.questions.length ? "查看成绩 →" : "下一题 →"}</button>
        </div>
      </div>
    </div>
  `;

  $$(".opt", app).forEach(btn => btn.addEventListener("click", () => {
    const pick = Number(btn.dataset.i);
    const right = pick === q.answer;
    quizState.results[idx] = right;
    if (right) quizState.score++;
    $$(".opt", app).forEach(b => {
      b.disabled = true;
      const bi = Number(b.dataset.i);
      if (bi === q.answer) b.classList.add("right");
      else if (bi === pick) b.classList.add("wrong");
      else b.classList.add("dim");
    });
    const ex = $("#qExplain");
    ex.innerHTML = (right ? "✅ <strong>Richtig!</strong> " : "❌ <strong>Nicht ganz.</strong> ") + q.explain;
    ex.classList.add("show");
    $("#qNext").style.visibility = "visible";
    const dot = $$(".qdot", app)[idx];
    if (dot) dot.classList.add(right ? "ok" : "bad");
  }));

  $("#qNext").addEventListener("click", () => {
    if (quizState.idx + 1 >= set.questions.length) renderQuizResult(app);
    else { quizState.idx++; renderQuizQuestion(app); }
  });
}

function renderQuizResult(app) {
  const { set, score } = quizState;
  const total = set.questions.length;
  store.setBest(set.id, score, total);
  const pct = score / total;
  const verdict = pct === 1 ? "Perfekt! 满分，非常出色。" : pct >= 0.8 ? "Sehr gut! 掌握得很扎实。" : pct >= 0.6 ? "Gut! 再复习一下错题对应的知识点。" : "Weiter üben! 建议回到课程与语法板块查漏补缺。";
  app.innerHTML = `
    <div class="quiz-stage">
      <div class="card quiz-result">
        <div class="qr-num">${score}<small> / ${total}</small></div>
        <div class="qr-label">${set.de} · ${set.title}</div>
        <div class="qr-verdict">${verdict}</div>
        <div class="qr-actions">
          <button class="btn primary" id="qrRetry">再做一次 ↻</button>
          <a class="btn" href="uebungen.html">返回练习列表</a>
        </div>
      </div>
    </div>
  `;
  $("#qrRetry").addEventListener("click", () => startQuiz(set.id, app));
}

/* ============================================================
   大纲 Kursplan
   ============================================================ */
function renderKursplan(app) {
  app.innerHTML = KURSPLAN.map(g => `
    <div class="kp-group">
      <div class="kp-group-title">${g.group}<span class="kp-count">${g.items.filter(i => i.status === "done").length}/${g.items.length} 已学</span></div>
      <div class="kp-list">
        ${g.items.map(i => `
          <div class="card kp-item" data-status="${i.status}" ${i.lesson ? `data-lesson="${i.lesson}" style="cursor:pointer"` : ""}>
            <span class="kp-num">${String(i.num).padStart(2, "0")}</span>
            <div class="kp-body">
              <div class="kp-de">${i.de}</div>
              <div class="kp-zh">${i.zh}</div>
            </div>
            <span class="kp-status ${i.status}">${STATUS_LABEL[i.status]}</span>
          </div>`).join("")}
      </div>
    </div>`).join("");
  $$(".kp-item[data-lesson]", app).forEach(el => el.addEventListener("click", () => {
    location.href = "lektionen.html#" + el.dataset.lesson;
  }));
}
