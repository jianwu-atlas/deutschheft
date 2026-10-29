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
   词形变化 Formenlehre
   动词变位 / 名词复数 / 形容词比较级 / 冠词·代词变格
   ============================================================ */
const PERSONEN = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
let formenState = { tab: "verben", q: "" };

function umlaut(s) {
  return s.replace(/au/g, "\u0001").replace(/a/g, "ä").replace(/o/g, "ö")
    .replace(/u/g, "ü").replace(/\u0001/g, "äu");
}

/* 规则动词按词干 + 词尾类型生成六人称；强变化动词用显式 formen */
function konjugiere(v) {
  if (v.formen) return v.formen;
  const st = v.stamm, a = v.art;
  const duEnd = a === "s" ? "t" : (a === "t" ? "est" : "st");
  const erEnd = a === "t" ? "et" : "t";
  const wirEnd = a === "er" ? "n" : "en";
  const ihrEnd = a === "t" ? "et" : "t";
  return [st + "e", st + duEnd, st + erEnd, st + wirEnd, st + ihrEnd, st + wirEnd];
}

function pluralForm(de, marker) {
  const base = de.replace(/^(der|die|das)\s+/, "");
  const m = (marker || "").trim();
  if (!m || m === "-") return base;
  if (/[/]/.test(m)) return base + " ‹" + m + "›";
  if (m === "¨-") return umlaut(base);
  if (m.startsWith("¨-")) return umlaut(base) + m.slice(2);
  if (m.startsWith("-")) return base + m.slice(1);
  return base + " ‹" + m + "›";
}

const VERB_TYP_LABEL = {
  reg: "规则", t: "规则（-t/-d 加 -e-）", s: "规则（-s/-ß/-z 只加 -t）",
  er: "规则（-er/-el 加 -n）", stark: "强变化 / 不规则"
};

function renderFormen(app) {
  const tabs = [
    ["verben", "🔁 动词变位", "Konjugation"],
    ["substantive", "📦 名词复数", "Plural"],
    ["adjektive", "⚖️ 形容词比较级", "Komparation"],
    ["deklination", "🧩 冠词·代词变格", "Deklination"],
    ["index", "📖 语料变形索引", "Belegte Formen"]
  ];
  app.innerHTML = `
    <div class="vocab-tabs">
      ${tabs.map(([k, zh, de]) => `<button class="vtab ${formenState.tab === k ? "on" : ""}" data-tab="${k}">${zh} <span style="opacity:.55;font-size:12px">${de}</span></button>`).join("")}
    </div>
    <div id="formenBody"></div>`;
  $$(".vtab", app).forEach(b => b.addEventListener("click", () => {
    formenState.tab = b.dataset.tab; formenState.q = "";
    renderFormen(app);
  }));
  const body = $("#formenBody");
  if (formenState.tab === "verben") renderFormenVerben(body);
  else if (formenState.tab === "substantive") renderFormenSubstantive(body);
  else if (formenState.tab === "adjektive") renderFormenAdjektive(body);
  else if (formenState.tab === "index") renderFormenIndex(body);
  else renderFormenDeklination(body);
}

/* ---------- ⑤ 语料变形索引：网页正文里实际出现过的变形 ---------- */
function corpusMap() {
  const m = Object.create(null);
  if (typeof WORTLISTE === "undefined") return m;
  WORTLISTE.forEach(x => { m[x.w] = x.n; });
  return m;
}

function renderFormenIndex(body) {
  const C = corpusMap();
  const hasCorpus = Object.keys(C).length > 0;

  /* 非可分动词的全部单形 —— 用于把可分动词里「裸动词」的重复计数剔除 */
  const baseForms = new Set();
  FORMEN_VERBEN.filter(v => !v.trenn).forEach(v => {
    konjugiere(v).concat([v.praet || "", v.part || "", v.de])
      .forEach(f => String(f).split(/\s+/).forEach(t => baseForms.add(t.toLowerCase())));
  });

  /* 动词：把六人称 + 过去时 + 第二分词拆成单词，取语料中真实出现过的 */
  const verbRows = FORMEN_VERBEN.map(v => {
    const forms = konjugiere(v).concat([v.praet || "", v.part || "", v.de]);
    const seen = new Set(), hits = [];
    const skip = v.trenn ? v.trenn.toLowerCase() : null;   // 可分前缀本身（如 ein / auf）不计入
    forms.forEach(f => String(f).split(/\s+/).forEach(t => {
      const w = t.toLowerCase().replace(/[.,!?]$/, "");
      if (!w || seen.has(w) || w === skip) return;
      if (v.trenn && baseForms.has(w)) return;             // 可分动词的裸动词形归入其原动词
      seen.add(w);
      if (C[w]) hits.push({ w: w, n: C[w] });
    }));
    hits.sort((a, b) => b.n - a.n);
    return { de: v.de, zh: v.zh, typ: VERB_TYP_LABEL[v.art], hits: hits, total: hits.reduce((a, b) => a + b.n, 0) };
  }).filter(r => r.hits.length).sort((a, b) => b.total - a.total);

  /* 名词：单数 / 复数在语料中的出现 */
  const nounRows = VOCAB.filter(v => ["der", "die", "das"].includes(v.pos)).map(v => {
    const sg = v.de.replace(/^(der|die|das)\s+/, "");
    const pl = pluralForm(v.de, v.plural);
    const hits = [];
    [[sg, "单数"], [pl, "复数"]].forEach(([w, tag]) => {
      const k = String(w).toLowerCase();
      if (C[k]) hits.push({ w: w, tag: tag, n: C[k] });
    });
    return { de: v.de, zh: v.zh, hits: hits, total: hits.reduce((a, b) => a + b.n, 0) };
  }).filter(r => r.hits.length).sort((a, b) => b.total - a.total);

  const verbFormCount = verbRows.reduce((a, r) => a + r.hits.length, 0);
  const nounFormCount = nounRows.reduce((a, r) => a + r.hits.length, 0);

  body.innerHTML = `
    <div class="fo-rules card">
      <div class="fo-rules-title">语料变形索引 · 网页正文里真正出现过的变形</div>
      <div class="fo-rule-grid">
        <div><b>动词</b>${verbRows.length} 个原形 · ${verbFormCount} 个变形词形在语料中出现</div>
        <div><b>名词</b>${nounRows.length} 个原形 · ${nounFormCount} 个单/复数形式在语料中出现</div>
        <div><b>数据来源</b>全站词表（${hasCorpus ? WORTLISTE.length : "—"} 词形，扫描课程 / 词卡 / 语法 / 课文 / 练习 / 教材 / 笔记）</div>
        <div><b>读法</b>「语料中出现的词形」= 你在网页正文里实际读到过的形式，后括号为出现次数</div>
      </div>
      <p class="fo-tip">💡 这张表回答的是：<b>某个动词/名词，我在网页里到底见过它的哪几个形式？</b> 空白的形式说明网页正文里还没出现（可在「动词变位」页补全整张变位表）。</p>
    </div>

    <h3 class="fo-h3">动词 · 语料中出现的词形（按出现次数排序）</h3>
    <div class="fo-table-wrap">
      <table class="fo-table fo-table-idx">
        <thead><tr><th>原形</th><th>中文</th><th>语料中出现的词形</th><th>合计</th><th>变位类型</th></tr></thead>
        <tbody>
          ${verbRows.map(r => `<tr>
            <td class="fo-de">${esc(r.de)}</td>
            <td class="fo-zh2">${esc(r.zh)}</td>
            <td class="fo-forms">${r.hits.map(h => `<span class="fo-chip">${esc(h.w)}<i>${h.n}</i></span>`).join("")}</td>
            <td class="fo-num">${r.total}</td>
            <td class="fo-typ">${esc(r.typ)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>

    <h3 class="fo-h3">名词 · 语料中出现的单数 / 复数</h3>
    <div class="fo-table-wrap">
      <table class="fo-table fo-table-idx">
        <thead><tr><th>单数（含冠词）</th><th>中文</th><th>语料中出现的词形</th><th>合计</th></tr></thead>
        <tbody>
          ${nounRows.map(r => `<tr>
            <td class="fo-de">${esc(r.de)}</td>
            <td class="fo-zh2">${esc(r.zh)}</td>
            <td class="fo-forms">${r.hits.map(h => `<span class="fo-chip">${esc(h.w)}<i>${esc(h.tag)} · ${h.n}</i></span>`).join("")}</td>
            <td class="fo-num">${r.total}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---------- ① 动词变位 ---------- */
function renderFormenVerben(body) {
  const BASE = ["sein", "haben", "werden"];
  const MODAL = ["können", "müssen", "wollen", "sollen", "dürfen", "mögen", "möchten"];
  const groups = [
    ["基础动词", BASE],
    ["情态动词", MODAL],
    ["强变化动词", FORMEN_VERBEN.filter(v => v.art === "stark" && !v.trenn && !BASE.includes(v.de) && !MODAL.includes(v.de)).map(v => v.de)],
    ["可分动词", FORMEN_VERBEN.filter(v => v.trenn).map(v => v.de)],
    ["规则动词", FORMEN_VERBEN.filter(v => ["reg", "t", "s", "er"].includes(v.art) && !v.trenn).map(v => v.de)]
  ];
  const q = formenState.q.trim().toLowerCase();
  const row = v => {
    const f = konjugiere(v);
    return `<tr>
      <td class="fo-de">${esc(v.de)}<span class="fo-zh">${esc(v.zh)}</span></td>
      ${f.map((x, i) => `<td class="fo-form${i === 1 || i === 2 ? " hot" : ""}">${esc(x)}</td>`).join("")}
      <td class="fo-part">${esc(v.part || "—")}</td>
      <td class="fo-praet">${esc(v.praet || "—")}</td>
      <td class="fo-hilf">${esc(v.hilf || "—")}</td>
      <td class="fo-typ">${esc(VERB_TYP_LABEL[v.art] || v.art)}${v.trenn ? ` · 可分（${esc(v.trenn)}-）` : ""}</td>
    </tr>`;
  };
  body.innerHTML = `
    <div class="fo-rules card">
      <div class="fo-rules-title">变位规则速览</div>
      <div class="fo-rule-grid">
        <div><b>规则动词</b>词干 + <code>e / st / t / en / t / en</code><br><i>wohnen → wohne, wohnst, wohnt …</i></div>
        <div><b>词干以 -t / -d 结尾</b>插 <code>-e-</code><br><i>arbeiten → arbeit<u>e</u>st, arbeit<u>e</u>t</i></div>
        <div><b>词干以 -s / -ß / -z 结尾</b>du/er 只加 <code>-t</code><br><i>reisen → du reist（不是 reisst）</i></div>
        <div><b>词干以 -er / -el 结尾</b>wir/sie 只加 <code>-n</code><br><i>wandern → wir wander<u>n</u></i></div>
        <div><b>强变化</b>du / er 换音或变音<br><i>essen → du <u>isst</u> · fahren → du <u>fährst</u></i></div>
        <div><b>可分动词</b>前缀甩到句尾<br><i>aufstehen → ich <u>stehe</u> um 7 <u>auf</u></i></div>
        <div><b>情态动词</b>ich / er 无词尾<br><i>können → ich <u>kann</u> · er <u>kann</u></i></div>
        <div><b>-ieren 动词</b>第二分词不带 ge-<br><i>studieren → <u>studiert</u></i></div>
      </div>
      <p class="fo-tip">💡 完成时 = <b>haben / sein</b>（第二位）+ <b>第二分词</b>（句尾）。表示移动或状态变化的动词用 <b>ist</b>（gehen / kommen / fahren / aufstehen …），其余用 <b>hat</b>。</p>
    </div>
    <div class="vocab-toolbar">
      <input class="vocab-search" id="foSearch" type="search" placeholder="搜索动词（德语 / 中文）…" value="${esc(formenState.q)}">
      <span class="fo-count" id="foCount"></span>
    </div>
    <div class="fo-table-wrap">
      <table class="fo-table">
        <thead><tr>
          <th>原形</th>${PERSONEN.map(p => `<th>${p}</th>`).join("")}
          <th>第二分词</th><th>过去时</th><th>助动词</th><th>变位类型</th>
        </tr></thead>
        <tbody id="foBody"></tbody>
      </table>
    </div>`;
  function paint() {
    const kw = formenState.q.trim().toLowerCase();
    const hit = v => !kw || v.de.toLowerCase().includes(kw) || v.zh.includes(kw) ||
      konjugiere(v).some(f => f.toLowerCase().includes(kw));
    let html = "", n = 0;
    groups.forEach(([title, names]) => {
      const list = FORMEN_VERBEN.filter(v => names.includes(v.de) && hit(v));
      if (!list.length) return;
      n += list.length;
      html += `<tr class="fo-group"><td colspan="11">${title} · ${list.length}</td></tr>` + list.map(row).join("");
    });
    $("#foBody").innerHTML = html || `<tr><td colspan="11" class="fo-empty">没有匹配的动词</td></tr>`;
    $("#foCount").textContent = `${n} / ${FORMEN_VERBEN.length} 个动词`;
  }
  $("#foSearch").addEventListener("input", e => { formenState.q = e.target.value; paint(); });
  paint();
}

/* ---------- ② 名词复数 ---------- */
function renderFormenSubstantive(body) {
  const nouns = VOCAB.filter(v => ["der", "die", "das"].includes(v.pos));
  const ORDER = ["-e", "¨-e", "-en", "-n", "-er", "¨-er", "-s", "¨-", "-", "其他"];
  const bucket = m => {
    if (m === "-e") return "-e";
    if (m === "¨-e") return "¨-e";
    if (m === "-en") return "-en";
    if (m === "-n") return "-n";
    if (m === "-er") return "-er";
    if (m === "¨-er") return "¨-er";
    if (m === "-s") return "-s";
    if (m === "¨-") return "¨-";
    if (!m || m === "-") return "-";
    return "其他";
  };
  const LABEL = {
    "-e": "加 -e（常配变音）", "¨-e": "变音 + -e", "-en": "加 -en（多阴性）", "-n": "加 -n（多阴性）",
    "-er": "加 -er（多中性）", "¨-er": "变音 + -er", "-s": "加 -s（外来词）",
    "¨-": "只变音", "-": "复数同形", "其他": "特殊复数"
  };
  const map = {};
  nouns.forEach(v => {
    const b = bucket((v.plural || "").trim());
    (map[b] = map[b] || []).push(v);
  });
  body.innerHTML = `
    <div class="fo-rules card">
      <div class="fo-rules-title">复数规则速览</div>
      <div class="fo-rule-grid">
        <div><b>加 -e</b>der Tisch → die Tisch<u>e</u>（常变音：der Stuhl → die St<u>ü</u>hle）</div>
        <div><b>加 -en / -n</b>die Frau → die Frau<u>en</u> · die Küche → die Küche<u>n</u>（阴性最多）</div>
        <div><b>加 -er</b>das Kind → die Kind<u>er</u>（常变音：das Haus → die H<u>äu</u>ser）</div>
        <div><b>加 -s</b>das Auto → die Auto<u>s</u>（外来词）</div>
        <div><b>不变</b>das Mädchen → die Mädchen（-chen/-er/-el/-en 结尾）</div>
        <div><b>只变音</b>der Apfel → die <u>Ä</u>pfel</div>
      </div>
      <p class="fo-tip">💡 定冠词复数一律 <b>die</b>；复数第三格要再加 <b>-n</b>（mit den Kinder<u>n</u>）。</p>
    </div>
    <div class="fo-table-wrap">
      <table class="fo-table fo-table-noun">
        <thead><tr><th>单数（含冠词）</th><th>复数</th><th>中文</th><th>复数类型</th></tr></thead>
        <tbody>
          ${ORDER.filter(k => map[k] && map[k].length).map(k => `
            <tr class="fo-group"><td colspan="4">${LABEL[k]} · ${map[k].length}</td></tr>
            ${map[k].sort((a, b) => a.de.localeCompare(b.de, "de")).map(v => `
              <tr>
                <td class="fo-de">${esc(v.de)}</td>
                <td class="fo-pl">${esc(pluralForm(v.de, v.plural))}</td>
                <td class="fo-zh2">${esc(v.zh)}</td>
                <td class="fo-typ">${esc(v.plural || "—")}</td>
              </tr>`).join("")}`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---------- ③ 形容词比较级 ---------- */
function renderFormenAdjektive(body) {
  body.innerHTML = `
    <div class="fo-rules card">
      <div class="fo-rules-title">比较级 / 最高级规则</div>
      <div class="fo-rule-grid">
        <div><b>比较级</b>原级 + <code>-er</code><br><i>kalt → kält<u>er</u></i></div>
        <div><b>最高级</b><code>am</code> + 原级 + <code>-sten</code><br><i>am kält<u>esten</u></i></div>
        <div><b>变音</b>a/o/u → ä/ö/ü<br><i>krank → kränker · rot → röter</i></div>
        <div><b>-t / -s / -ß 结尾</b>最高级加 <code>-esten</code><br><i>heiß → am heiß<u>esten</u></i></div>
        <div><b>比较用 als</b>Ich bin jünger <u>als</u> du.</div>
        <div><b>同级用 so … wie</b>Ich bin <u>so</u> groß <u>wie</u> du.</div>
      </div>
      <p class="fo-tip">💡 表语形容词不变格：Das Wetter ist <b>gut</b>. / Heute ist es <b>besser</b>. 作定语才加词尾。</p>
    </div>
    <div class="fo-table-wrap">
      <table class="fo-table fo-table-adj">
        <thead><tr><th>原级</th><th>中文</th><th>比较级</th><th>最高级</th><th>说明</th></tr></thead>
        <tbody>
          ${FORMEN_ADJ.map(([de, zh, komp, sup, note]) => `
            <tr>
              <td class="fo-de">${esc(de)}</td>
              <td class="fo-zh2">${esc(zh)}</td>
              <td class="fo-form">${esc(komp)}</td>
              <td class="fo-form">${esc(sup)}</td>
              <td class="fo-typ">${esc(note || "—")}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

/* ---------- ④ 冠词 / 代词变格 ---------- */
function renderFormenDeklination(body) {
  const D = FORMEN_DEKL;
  const tbl = (head, rows) => `
    <div class="fo-table-wrap">
      <table class="fo-table fo-table-dekl">
        <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td class="${i === 0 ? "fo-de" : "fo-form"}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`;
  body.innerHTML = `
    <div class="fo-rules card">
      <div class="fo-rules-title">格（Kasus）速览</div>
      <div class="fo-rule-grid">
        <div><b>第一格 N</b>主语：<i><u>Der</u> Tisch ist neu.</i></div>
        <div><b>第四格 A</b>直接宾语：<i>Ich habe <u>einen</u> Tisch.</i></div>
        <div><b>第三格 D</b>间接宾语：<i>Ich helfe <u>dem</u> Mann.</i></div>
        <div><b>第二格 G</b>所属：<i>das Auto <u>des</u> Mannes</i></div>
      </div>
      <p class="fo-tip">💡 只有<b>阳性</b>在第一格/第四格会变（der → den / ein → einen），阴性与中性几乎不变。</p>
    </div>
    <h3 class="fo-h3">定冠词 der / die / das</h3>
    ${tbl(["格", "阳性", "阴性", "中性", "复数"], D.artikelBest)}
    <h3 class="fo-h3">不定冠词 ein / eine / ein</h3>
    ${tbl(["格", "阳性", "阴性", "中性", "复数"], D.artikelUnbest)}
    <h3 class="fo-h3">人称代词（第一 / 第四 / 第三格）</h3>
    ${tbl(["第一格 N", "第四格 A", "第三格 D"], D.pronomen)}
    <h3 class="fo-h3">物主冠词</h3>
    ${tbl(["人称", "阳性 / 中性", "阴性 / 复数"], D.possessiv)}
    <h3 class="fo-h3">复数类型对照</h3>
    ${tbl(["复数方式", "例", "说明"], D.pluralRegeln)}`;
}

/* ============================================================
   页面分发
   ============================================================ */
const PAGES = {
  start: renderStart,
  lektionen: renderLessons,
  wortschatz: renderVocab,
  grammatik: renderGrammar,
  texte: renderTexts,
  lehrbuch: renderLehrbuch,
  formen: renderFormen,
  uebungen: renderQuizHome,
  kursplan: renderKursplan,
  sucheng: renderSucheng,
  english: renderEnglish,
  w6000: renderW6000
};

/* ============================================================
   教材 Lehrbuch（PDF 在线阅读 + 结构化词汇/句型/语法）
   ============================================================ */
const LHRB_SIZE = {
  "00_lingjichu-sucheng.pdf": "14 MB",
  "06_wohnen-moebel.pdf": "394 KB",
  "09_kleidung-farben.pdf": "538 KB",
  "10_wetter-jahreszeiten.pdf": "413 KB",
  "11_verkehrsmittel.pdf": "1.0 MB"
};

function renderLehrbuch(app) {
  const lbkCard = b => `
    <div class="lbk-card card" id="lbk-${b.id}">
      <div class="lbk-head">
        <span class="lbk-num">${b.num}</span>
        <div class="lbk-title">
          <div class="lbk-zh">${b.extra ? '<span class="lbk-extra" title="课外教材资料">课外</span> ' : ""}${b.zh} <span class="lbk-de">${b.de}</span></div>
          <div class="lbk-meta">${b.lesson} · ${b.pages} 页 · PDF ${LHRB_SIZE[b.file] || ""}</div>
        </div>
        <div class="lbk-actions">
          ${b.id === "sucheng" ? `<a class="btn primary" href="sucheng.html">📖 场景精读</a>` : ""}
          ${b.id === "enwords" ? `<a class="btn primary" href="https://jianwu-atlas.github.io/englishheft/" target="_blank" rel="noopener">📖 单词精读 ↗</a>` : ""}
          ${b.id === "w6000" ? `<a class="btn primary" href="w6000.html">📖 词汇速查</a>` : ""}
          <button class="btn ${(b.id === "sucheng" || b.id === "enwords" || b.id === "w6000") ? "" : "primary"} lbk-view" data-id="${b.id}">📖 在线阅读</button>
          <a class="btn" href="assets/lehrbuch/${b.file}" download>⬇ 下载 PDF</a>
        </div>
      </div>
      <div class="lbk-viewer" id="viewer-${b.id}" hidden>
        <iframe src="assets/lehrbuch/${b.file}" title="${b.zh}（教材 PDF）" loading="lazy"></iframe>
      </div>
      ${(b.words && b.words.length) || (b.sentences && b.sentences.length) ? `<div class="lbk-cols">
        ${b.words && b.words.length ? `<div class="lbk-col">
          <h4 class="lbk-h4">📚 词汇 Wortschatz · ${b.words.length}</h4>
          <div class="lbk-words">${b.words.map(w => `<span class="lbk-word"><b>${w[0]}</b><i>${w[1]}</i></span>`).join("")}</div>
        </div>` : ""}
        ${b.sentences && b.sentences.length ? `<div class="lbk-col">
          <h4 class="lbk-h4">💬 核心句型 Sätze · ${b.sentences.length}</h4>
          ${b.sentences.map(s => `<div class="s-line"><button class="s-sp" data-de="${esc(s[0])}" title="朗读">🔊</button><div class="s-main"><span class="s-text">${s[0]}</span><span class="s-zh-inline">${s[1]}</span><span class="s-ipa">${s[2]}</span></div></div>`).join("")}
        </div>` : ""}
      </div>` : ""}
      ${b.points && b.points.length ? `<h4 class="lbk-h4">🧩 语法要点 Grammatik</h4>
      <ul class="grammar-list">${b.points.map(p => `<li>${p}</li>`).join("")}</ul>` : ""}
      ${b.text ? `<details class="lbk-raw">
        <summary>📄 课件原文（自动提取自 PDF）</summary>
        <pre>${esc(b.text)}</pre>
      </details>` : ""}
    </div>`;
  const lbkIn = LEHRBUECHER.filter(b => !b.extra);
  const lbkExtra = LEHRBUECHER.filter(b => b.extra);
  app.innerHTML = `
    <h2 class="lbk-group">📘 课内教材 · Kursbuch</h2>
    ${lbkIn.map(lbkCard).join("")}
    ${lbkExtra.length ? `<h2 class="lbk-group lbk-group-extra">📗 课外教材资料 · Extra</h2>${lbkExtra.map(lbkCard).join("")}` : ""}`;

  $$(".lbk-view", app).forEach(btn => btn.addEventListener("click", () => {
    const v = $("#viewer-" + btn.dataset.id);
    if (!v) return;
    v.hidden = !v.hidden;
    btn.textContent = v.hidden ? "📖 在线阅读" : "✕ 收起阅读器";
    if (!v.hidden) v.scrollIntoView({ block: "start", behavior: "smooth" });
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initBurger();
  // 朗读按钮（句型表 / 课文逐句）
  document.addEventListener("click", e => {
    const sp = e.target.closest(".s-sp");
    if (sp && window.__dhSpeak) window.__dhSpeak(sp.dataset.de);
  });
  const page = document.body.dataset.page;
  if (PAGES[page]) PAGES[page]($("#app"));
});

/* ============================================================
   全站词表 Gesamtliste（wortliste.js 数据驱动）
   ============================================================ */
const WL_STATE = { q: "", src: null, onlyIpa: false };

function renderWortliste(app) {
  const all = WORTLISTE;
  const withIpa = all.filter(x => x.ipa).length;
  const srcs = ["词卡", "课程", "语法", "课文", "练习", "教材", "笔记"];
  const body = $("#vocabBody");
  body.innerHTML = `
    <div class="wl-stats">
      <span class="wl-stat"><b>${all.length}</b> 个德语词形</span>
      <span class="wl-stat"><b>${withIpa}</b> 个有音标</span>
      <span class="wl-stat"><b>${all.filter(x => x.zh).length}</b> 个有中文释义</span>
      <span class="wl-stat"><b>${all.filter(x => x.pron).length}</b> 个有中文谐音</span>
      <span class="wl-stat dim">词形含动词变位/分词（可通过「原形」回溯）</span>
    </div>
    <div class="vocab-toolbar">
      <input class="vocab-search" id="wlSearch" type="search" placeholder="搜索全站词表（德语/音标/中文）…" value="${esc(WL_STATE.q)}">
      <button class="chip ${WL_STATE.onlyIpa ? "on" : ""}" id="wlOnlyIpa">仅看有音标</button>
    </div>
    <div class="chip-row" id="wlSrcChips">
      <button class="chip ${!WL_STATE.src ? "on" : ""}" data-src="">全部来源</button>
      ${srcs.map(s => `<button class="chip ${WL_STATE.src === s ? "on" : ""}" data-src="${s}">${s}</button>`).join("")}
    </div>
    <div class="vocab-count" id="wlCount"></div>
    <div class="wl-table-wrap">
      <table class="wl-table">
        <thead><tr><th>德语单词</th><th>国际音标 IPA</th><th>中文释义</th><th>中文谐音</th><th>来源</th><th>次数</th></tr></thead>
        <tbody id="wlBody"></tbody>
      </table>
    </div>
  `;
  $("#wlSearch").addEventListener("input", e => { WL_STATE.q = e.target.value; renderWLRows(); });
  $("#wlOnlyIpa").addEventListener("click", () => {
    WL_STATE.onlyIpa = !WL_STATE.onlyIpa;
    $("#wlOnlyIpa").classList.toggle("on", WL_STATE.onlyIpa);
    renderWLRows();
  });
  $$("#wlSrcChips .chip").forEach(c => c.addEventListener("click", () => {
    WL_STATE.src = c.dataset.src || null;
    $$("#wlSrcChips .chip").forEach(x => x.classList.toggle("on", x === c));
    renderWLRows();
  }));
  renderWLRows();

  function renderWLRows() {
    const q = WL_STATE.q.trim().toLowerCase();
    const list = all.filter(x =>
      (!WL_STATE.src || x.src.includes(WL_STATE.src)) &&
      (!WL_STATE.onlyIpa || x.ipa) &&
      (!q || x.w.toLowerCase().includes(q) || (x.ipa || "").toLowerCase().includes(q)
        || (x.zh || "").toLowerCase().includes(q) || (x.pron || "").toLowerCase().includes(q))
    );
    $("#wlCount").textContent = `${list.length} / ${all.length} 词形`;
    $("#wlBody").innerHTML = list.map(x => `
      <tr>
        <td class="wl-w"><button class="s-sp" data-de="${esc(x.w)}" title="朗读">🔊</button>${x.w}${x.base ? `<span class="wl-base">← ${x.base}</span>` : ""}</td>
        <td class="wl-ipa">${x.ipa || "—"}</td>
        <td class="wl-zh">${x.zh ? esc(x.zh) : "—"}</td>
        <td class="wl-pron">${x.pron ? "≈ " + esc(x.pron) : "—"}</td>
        <td class="wl-src">${x.src.map(s => `<span class="wl-src-chip">${s}</span>`).join("")}</td>
        <td class="wl-n">${x.n}</td>
      </tr>`).join("");
  }
}

/* ============================================================
   首页 Start
   ============================================================ */
function renderStart(app) {
  const doneTopics = KURSPLAN.flatMap(g => g.items).filter(i => i.status === "done").length;
  const totalTopics = KURSPLAN.flatMap(g => g.items).length;
  const reviewed = store.reviewedCount();
  const pct = Math.round((doneTopics / totalTopics) * 100);

  const modules = [
    { route: "lektionen.html", num: "01", de: "Lektionen", zh: "分级课程", desc: "11 节 A1 主题课 + 3 节 A1.2 实验室课文课，按你的实际上课顺序排列。" },
    { route: "wortschatz.html", num: "02", de: "Wortschatz", zh: "生词表", desc: VOCAB.length + " 张词汇卡：每张含国际音标 + 中文谐音，按主题与词性筛选，点卡片翻面看释义。" },
    { route: "grammatik.html", num: "03", de: "Grammatik", zh: "语法讲解", desc: GRAMMAR.length + " 个语法专题：从动词第二位到现在完成时。" },
    { route: "formen.html", num: "04", de: "Formen", zh: "词形变化", desc: "112 个动词的六人称变位 + 过去时 + 第二分词，另有名词复数、形容词比较级、冠词代词变格，以及「语料变形索引」。" },
    { route: "texte.html", num: "05", de: "Texte", zh: "课文阅读", desc: "三篇实验室课文逐段中德对照，完成时重点动词逐一标注。" },
    { route: "lehrbuch.html", num: "06", de: "Lehrbuch", zh: "教材", desc: "6 份教材 PDF 原件在线阅读/下载，附结构化词汇、核心句型（含音标）与语法要点。" },
    { route: "referenz.html", num: "07", de: "Referenz", zh: "速查表", desc: "打开就能查：数字 0–100 全表、口语报时、18 种颜色、四季/月份/星期/天气，全部注有音标与中文谐音。" },
    { route: "uebungen.html", num: "08", de: "Übungen", zh: "互动练习", desc: QUIZZES.length + " 组测验：变位、数字、时间、完成时、词性、句子改写、haben/sein 与课文理解。" },
    { route: "notion.html", num: "09", de: "Notion 同步", zh: "笔记库", desc: "Notion 全部笔记离线内置，支持导入导出文件、粘贴同步、全文搜索。" },
    { route: "kursplan.html", num: "10", de: "Kursplan", zh: "课程大纲", desc: "15 主题生存德语地图，标注已学 / 待学进度。" }
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
      <p>你正在 <strong>A1.2</strong> 阶段，最近一课是 <strong>Ein Problem mit den Laborproben</strong>（2026-10-28）：一篇全用现在完成时写成的实验室叙事课文——12 份样本只到了 9 份。建议先读课文《Ein Problem mit den Laborproben》并隐藏中文自测，再做「haben 还是 sein？」与「课文理解」两组测验，最后用语法专题《可分动词的完成时》收口。大纲上 <strong>Bürokratie（办事）</strong>与 <strong>Arztbesuch（看病）</strong>仍是接下来最值得优先攻克的两个生存主题。</p>
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
          ${l.sentences.map(s => `<tr><td class="s-de"><button class="s-sp" data-de="${esc(s.de)}" title="朗读">🔊</button><span class="s-text">${s.de}</span>${s.ipa ? `<span class="s-ipa">${s.ipa}</span>` : ""}</td><td class="s-zh">${s.zh}</td></tr>`).join("")}
        </table>
        <div class="focus-inline">💡 <strong>本课焦点：</strong>${l.focus}</div>
        <div class="lesson-vocab-link"><a href="wortschatz.html" data-topic="${l.topic}" class="to-vocab">→ 在生词表中查看「${l.topic}」主题词汇</a></div>
      </div>
    </div>`;
}

/* ============================================================
   生词表 Wortschatz（词卡 + 全站词表双视图）
   ============================================================ */
let vocabState = { q: "", topic: null, pos: null, tab: "cards" };

function renderVocab(app) {
  const tabBar = `
    <div class="vocab-tabs">
      <button class="vtab ${vocabState.tab === "cards" ? "on" : ""}" data-tab="cards">🃏 词卡 Wortkarten</button>
      <button class="vtab ${vocabState.tab === "list" ? "on" : ""}" data-tab="list">📋 全站词表 Gesamtliste${typeof WORTLISTE !== "undefined" ? " · " + WORTLISTE.length : ""}</button>
    </div>`;
  app.innerHTML = tabBar + `<div id="vocabBody">${vocabState.tab === "cards" ? vocabCardsHTML() : ""}</div>`;

  $$(".vtab", app).forEach(b => b.addEventListener("click", () => {
    vocabState.tab = b.dataset.tab;
    renderVocab(app);
  }));

  if (vocabState.tab === "cards") bindVocabCards(app);
  else renderWortliste(app);
}

function vocabCardsHTML() {
  return `
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
}

function bindVocabCards(app) {
  $("#vSearch").addEventListener("input", e => { vocabState.q = e.target.value; renderVocabGrid(); });
  $$("#topicChips .chip", app).forEach(c => c.addEventListener("click", () => {
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

/* ---- 课文 MP3 播放（B' 预生成·微软神经语音）；文件缺失 → 回退在线 Web Speech（C）---- */
let __mp3 = null;
function playTextMp3(src, fallbackText) {
  if (!__mp3) { __mp3 = new Audio(); __mp3.preload = "none"; }
  const fallback = () => { if (window.__dhSpeak && fallbackText) window.__dhSpeak(fallbackText); };
  __mp3.onerror = fallback;
  __mp3.src = src;
  __mp3.play().catch(fallback);
}
/* 复制文本到剪贴板（navigator.clipboard 优先，execCommand 兜底） */
async function copyToClipboard(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; } } catch (e) {}
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}

function renderTexts(app) {
  const t = TEXTS.find(x => x.id === textState.id) || TEXTS[0];
  const splitSentences = str => (str.match(/[^.!?]+[.!?]+[""'\)\]]*\s*/g) || [str]).map(s => s.trim()).filter(Boolean);
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
      <button class="btn" id="speakAll" title="在线朗读（浏览器语音，无需文件）">🔊 朗读全段</button>
      <button class="btn" id="mp3All" title="听整篇 MP3（微软神经语音，同 Speecher）">🎧 全文 MP3</button>
      <button class="btn" id="copyFull" title="复制整篇课文德语全文（可直接粘贴到「文本转MP3」生成/收听）">📋 复制全文</button>
    </div>
    <div id="textBody" class="${textState.hideZh ? "hide-zh" : ""}">
      ${t.paragraphs.map((p, i) => {
        const sents = splitSentences(p.de);
        const ex = (window.TEXTE_EXTRA && window.TEXTE_EXTRA[t.id] && window.TEXTE_EXTRA[t.id][i + 1]) || {};
        return `
        <div class="card para">
          <div class="para-head"><span class="para-no">${String(i + 1).padStart(2, "0")}</span><span class="para-title">${p.title || ""}</span><button class="para-mp3" data-i="${i}" title="听本段 MP3（微软神经语音；点击朗读）">🎧</button></div>
          <div class="para-body no-ipa">
            ${sents.map((s, si) => `
              <div class="s-line">
                <button class="s-sp" data-de="${esc(s)}" title="朗读此句">🔊</button>
                <div class="s-main">
                  <span class="s-text">${s}</span>
                  ${p.ips && p.ips[si] ? `<span class="s-ipa">${p.ips[si]}</span>` : ""}
                  ${ex.zhs && ex.zhs[si] ? `<span class="s-zh">${esc(ex.zhs[si])}</span>` : ""}
                </div>
              </div>`).join("")}
          </div>
          ${ex.notes && ex.notes.length ? `<div class="para-notes"><span class="pn-title">💡 知识点</span><ul>${ex.notes.map(n => `<li><b>${esc(n.k)}</b>：${esc(n.v)}</li>`).join("")}</ul></div>` : ""}
          ${p.verbs ? `<div class="para-verbs">${p.verbs.map(v => `<span class="verb-chip">${v}</span>`).join("")}</div>` : ""}
        </div>`;
      }).join("")}
    </div>
  `;
  $$(".text-tab", app).forEach(b => b.addEventListener("click", () => { textState.id = b.dataset.id; renderTexts(app); }));
  $("#toggleZh").addEventListener("click", () => { textState.hideZh = !textState.hideZh; renderTexts(app); });
  $("#speakAll").addEventListener("click", () => {
    if (window.__dhSpeak) window.__dhSpeak(t.paragraphs.map(p => p.de).join(" "));
  });
  $("#mp3All").addEventListener("click", () => playTextMp3("assets/audio/textes/" + t.id + "_full.mp3", t.paragraphs.map(p => p.de).join(" ")));
  $("#copyFull").addEventListener("click", async () => {
    const full = t.paragraphs.map(p => p.de).join("\n");
    await copyToClipboard(full);
    const btn = $("#copyFull");
    const old = btn.textContent;
    btn.textContent = "✓ 已复制";
    setTimeout(() => { btn.textContent = old; }, 1500);
  });
  $$(".para-mp3", app).forEach(b => b.addEventListener("click", e => {
    e.stopPropagation();
    const i = +b.dataset.i;
    playTextMp3("assets/audio/textes/" + t.id + "_p" + (i + 1) + ".mp3", t.paragraphs[i].de);
  }));
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
        <div class="quiz-q">${q.q}<small>${set.hint || "选择正确的德语形式"}</small></div>
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

/* ============================================================
   教材精读 · 零基础德语速成（三行格式：德文 / 中文 / 中文谐音）
   数据：assets/js/data/sucheng.js（脚本生成，勿手改）
   ⚠️ 课外教材：词汇不计入 VOCAB / wortliste.js（见项目 MEMORY.md）
   ============================================================ */
const SC_STATE = { tab: "scene", einheit: 0, hideZh: false };

function renderSucheng(app) {
  if (typeof SUCHENG === "undefined" || !SUCHENG.parts) {
    app.innerHTML = `<div class="card"><p>教材精读数据未加载（assets/js/data/sucheng.js）。</p></div>`;
    return;
  }
  const parts = SUCHENG.parts;
  const nScenes = parts.reduce((a, x) => a + x.scenes.length, 0);
  const nSent = parts.reduce((a, x) => a + x.scenes.reduce((b, s) => b + s.sentences.length, 0), 0);
  const nTurns = parts.reduce((a, x) => a + x.scenes.reduce((b, s) =>
    b + (s.dialog || []).reduce((c, d) => c + d.turns.length, 0), 0), 0);
  const ex = (typeof SUCHENG_EXTRAS !== "undefined") ? SUCHENG_EXTRAS : null;
  const tabs = [
    ["scene", "🗣 场景精读", `${nScenes} 场景 · ${nSent} 句 · ${nTurns} 会话轮`],
    ["pron", "🔤 发音篇", ex ? `${ex.pronunciation.length} 讲` : "—"],
    ["gram", "📐 语法篇", ex ? `${ex.grammar.length} 讲` : "—"]
  ];
  const tabBar = `<div class="chip-row sc-tabs">
    ${tabs.map(([k, label, cnt]) => `<button class="chip ${SC_STATE.tab === k ? "on" : ""}" data-tab="${k}">${label}<span class="sc-cnt">${cnt}</span></button>`).join("")}
  </div>`;

  if (SC_STATE.tab !== "scene" && ex) {
    const list = SC_STATE.tab === "pron" ? ex.pronunciation : ex.grammar;
    app.innerHTML = tabBar + `
      <div class="sc-bar"><div class="sc-tools">
        <button class="chip ${SC_STATE.hideZh ? "on" : ""}" id="scHideZh">${SC_STATE.hideZh ? "👁 显示中文" : "🙈 隐藏中文自测"}</button>
        <span class="sc-stat">${SC_STATE.tab === "pron" ? "发音篇 · 字母/组合 → 单词 → 中文意思 → 汉语谐音" : "语法篇 · 教材语法专题（含变格与变位表）"}</span>
        ${SC_STATE.tab === "gram" ? `<a class="chip" href="grammatik.html">↗ 对照课内语法专题</a>` : ""}
      </div></div>
      ${SC_STATE.tab === "gram" ? `<p class="sc-cross">📌 本页语法篇来自<b>课外教材</b>《零基础德语速成》，与课内 <a href="grammatik.html">语法专题</a> 是两条独立脉络：课内按你的上课进度编排，这里按教材章节系统铺开，<b>互为补充</b>；若两边表述有差异，以课内为准。</p>` : ""}
      ${list.map((t, i) => `
        <section class="sc-scene card sc-extra">
          <h2 class="sc-title"><span class="sc-num">${i + 1}</span>${esc(t.zh)}</h2>
          <div class="sc-md">${t.html}</div>
        </section>`).join("")}`;
    bindSuchengCommon(app);
    return;
  }

  const p = parts[SC_STATE.einheit] || parts[0];
  app.innerHTML = tabBar + `
    <div class="sc-bar">
      <div class="chip-row sc-einheiten">
        ${parts.map((x, i) => `<button class="chip ${i === SC_STATE.einheit ? "on" : ""}" data-i="${i}">${x.einheit}<span class="sc-cnt">${x.scenes.length}</span></button>`).join("")}
      </div>
      <div class="sc-tools">
        <button class="chip ${SC_STATE.hideZh ? "on" : ""}" id="scHideZh">${SC_STATE.hideZh ? "👁 显示中文" : "🙈 隐藏中文自测"}</button>
        <button class="chip" id="scCopy">📋 复制本单元纯德文</button>
        <span class="sc-stat">全库 ${nScenes} 场景 · ${nSent} 句 · ${nTurns} 会话轮</span>
      </div>
    </div>
    ${p.scenes.map(s => `
      <section class="sc-scene card">
        <h2 class="sc-title"><span class="sc-num">${s.scene}</span>${esc(s.zh || "场景 " + s.scene)}
          <span class="sc-badge">${s.sentences.length} 句</span></h2>
        <div class="sc-sents">
          ${s.sentences.map(x => `
            <div class="sc-sent">
              <p class="s-de">${esc(x.de)}<button class="s-speak" data-t="${esc(x.de)}" title="朗读这句德语">🔊</button></p>
              <p class="s-zh">${esc(x.zh)}</p>
              ${x.pron ? `<p class="s-pron">${esc(x.pron)}</p>` : ""}
            </div>`).join("")}
        </div>
        ${(s.dialog && s.dialog.length) ? `
        <div class="sc-dialog">
          <h3 class="sc-dialog-h">💬 迷你会话 <em>Mini-Dialoge</em></h3>
          ${s.dialog.map(dg => `
            <div class="sc-dg">
              <div class="sc-dg-title">${esc(dg.title)}</div>
              ${dg.turns.map(t => `
                <div class="sc-turn">
                  <span class="sc-spk">${esc(t.spk || "·")}</span>
                  <div class="sc-turn-body">
                    <p class="s-de">${esc(t.de)}<button class="s-speak" data-t="${esc(t.de)}" title="朗读">🔊</button></p>
                    ${t.zh ? `<p class="s-zh">${esc(t.zh)}</p>` : ""}
                    ${t.pron ? `<p class="s-pron">${esc(t.pron)}</p>` : ""}
                  </div>
                </div>`).join("")}
            </div>`).join("")}
        </div>` : ""}
        ${(s.tips && s.tips.length) ? `
        <div class="sc-tips">
          <h3 class="sc-tips-h">💡 小贴士 <em>Tipps</em></h3>
          <ul>${s.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        </div>` : ""}
      </section>`).join("")}
  `;

  bindSuchengCommon(app);
  $$(".sc-einheiten .chip", app).forEach(b => b.addEventListener("click", () => {
    SC_STATE.einheit = +b.dataset.i;
    renderSucheng(app);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  const copyBtn = $("#scCopy", app);
  if (copyBtn) copyBtn.addEventListener("click", e => {
    const txt = p.scenes.map(s =>
      `【${s.zh}】\n` + s.sentences.map(x => x.de).join("\n")).join("\n\n");
    const btn = e.currentTarget;
    const done = () => { const o = btn.textContent; btn.textContent = "✓ 已复制"; setTimeout(() => { btn.textContent = o; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done).catch(done);
    else {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (err) { /* ignore */ }
      ta.remove(); done();
    }
  });
}

/* 精读页各页签共用的绑定：页签切换 / 隐藏中文 / 逐句朗读 */
function bindSuchengCommon(app) {
  app.classList.toggle("hide-zh", SC_STATE.hideZh);
  $$(".sc-tabs .chip", app).forEach(b => b.addEventListener("click", () => {
    SC_STATE.tab = b.dataset.tab;
    renderSucheng(app);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  const hz = $("#scHideZh", app);
  if (hz) hz.addEventListener("click", () => {
    SC_STATE.hideZh = !SC_STATE.hideZh;
    renderSucheng(app);
  });
  $$(".s-speak", app).forEach(b => b.addEventListener("click", ev => {
    ev.stopPropagation();
    if (window.__dhSpeak) window.__dhSpeak(b.dataset.t);
  }));
}

/* ============================================================
   英语单词 · 15000 英语单词口袋书（三行：英文 / 音标 / 中文+词性）
   数据：assets/js/data/english.js（脚本生成，勿手改）
   ⚠️ 课外教材：词汇不计入 VOCAB / wortliste.js（见项目 MEMORY.md）
   ============================================================ */
const EN_STATE = { section: 0, part: 0, hideZh: false };

function renderEnglish(app) {
  if (typeof ENGLISH === "undefined" || !ENGLISH.sections) {
    app.innerHTML = `<div class="card"><p>英语单词数据未加载（assets/js/data/english.js）。</p></div>`;
    return;
  }
  const A = s => esc(s).replace(/"/g, "&quot;");       // 属性转义（英文含引号）
  const secs = ENGLISH.sections;
  if (EN_STATE.section >= secs.length) EN_STATE.section = 0;
  const sec = secs[EN_STATE.section];
  if (EN_STATE.part >= sec.parts.length) EN_STATE.part = 0;
  const part = sec.parts[EN_STATE.part];
  const nScenes = secs.reduce((a, s) => a + s.parts.reduce((b, p) => b + p.scenes.length, 0), 0);
  const nWords = secs.reduce((a, s) => a + s.parts.reduce((b, p) =>
    b + p.scenes.reduce((c, sc) => c + sc.words.length, 0), 0), 0);
  const nSent = secs.reduce((a, s) => a + s.parts.reduce((b, p) =>
    b + p.scenes.reduce((c, sc) => c + sc.sentences.length, 0), 0), 0);

  app.innerHTML = `
    <div class="chip-row sc-tabs en-sections">
      ${secs.map((s, i) => `<button class="chip ${i === EN_STATE.section ? "on" : ""}" data-s="${i}">${s.no}. ${esc(s.zh)}<span class="sc-cnt">${s.parts.reduce((a, p) => a + p.scenes.length, 0)}</span></button>`).join("")}
    </div>
    <div class="sc-bar">
      <div class="chip-row sc-einheiten">
        ${sec.parts.map((p, i) => `<button class="chip ${i === EN_STATE.part ? "on" : ""}" data-p="${i}">${esc(p.zh)}<span class="sc-cnt">${p.scenes.length}</span></button>`).join("")}
      </div>
      <div class="sc-tools">
        <button class="chip ${EN_STATE.hideZh ? "on" : ""}" id="enHideZh">${EN_STATE.hideZh ? "👁 显示中文" : "🙈 隐藏中文自测"}</button>
        <button class="chip" id="enCopy">📋 复制本 Part 纯英文</button>
        <span class="sc-stat">全书 ${nScenes} 场景 · ${nWords} 词 · ${nSent} 句</span>
      </div>
    </div>
    ${part.scenes.map(sc => `
      <section class="sc-scene card">
        <h2 class="sc-title"><span class="sc-num">${esc(sc.no.split(".").pop())}</span>${esc(sc.zh)}
          <span class="sc-badge">${sc.words.length} 词 · ${sc.sentences.length} 句</span></h2>
        <div class="en-words">
          ${sc.words.map(w => `
            <div class="en-word">
              <p class="en-en">${esc(w.en)}<button class="s-speak" data-t="${A(w.en)}" title="朗读">🔊</button></p>
              <p class="s-pron">${esc(w.ipa)}</p>
              <p class="en-zh">${esc(w.zh)}<span class="en-pos">${esc(w.pos)}</span></p>
            </div>`).join("")}
        </div>
        ${sc.sentences.length ? `
        <div class="sc-dialog">
          <h3 class="sc-dialog-h">💬 Top10 场景句 <em>Key Sentences</em></h3>
          ${sc.sentences.map((s, i) => `
            <div class="sc-turn">
              <span class="sc-spk">${i + 1}</span>
              <div class="sc-turn-body">
                <p class="s-de">${esc(s.en)}<button class="s-speak" data-t="${A(s.en)}" title="朗读">🔊</button></p>
                <p class="s-zh">${esc(s.zh)}</p>
              </div>
            </div>`).join("")}
        </div>` : ""}
      </section>`).join("")}
  `;

  app.classList.toggle("hide-zh", EN_STATE.hideZh);
  $$(".en-sections .chip", app).forEach(b => b.addEventListener("click", () => {
    EN_STATE.section = +b.dataset.s; EN_STATE.part = 0;
    renderEnglish(app); window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  $$(".sc-einheiten .chip", app).forEach(b => b.addEventListener("click", () => {
    EN_STATE.part = +b.dataset.p;
    renderEnglish(app); window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  const hz = $("#enHideZh", app);
  if (hz) hz.addEventListener("click", () => { EN_STATE.hideZh = !EN_STATE.hideZh; renderEnglish(app); });
  const cp = $("#enCopy", app);
  if (cp) cp.addEventListener("click", e => {
    const txt = part.scenes.map(sc =>
      `【${sc.zh}】\n` + sc.words.map(w => w.en).join("\n") +
      (sc.sentences.length ? "\n\n" + sc.sentences.map(s => s.en).join("\n") : "")).join("\n\n");
    const btn = e.currentTarget;
    const done = () => { const o = btn.textContent; btn.textContent = "✓ 已复制"; setTimeout(() => { btn.textContent = o; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done).catch(done);
    else {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (err) { /* ignore */ }
      ta.remove(); done();
    }
  });
  $$(".s-speak", app).forEach(b => b.addEventListener("click", ev => {
    ev.stopPropagation();
    if (window.__dhSpeak) window.__dhSpeak(b.dataset.t);
  }));
}

/* ============================================================
   德国 6000 中级词汇（课外参考书 · extra:true，不进生词表）
   ============================================================ */
const W6_STATE = { q: "", t: "all", limit: 400 };
const W6_TYPES = [
  ["all", "全部"], ["noun", "名词"], ["verb", "动词"], ["adj", "形容词"],
  ["adv", "副词"], ["place", "地名"], ["phrase", "短语"], ["mixed", "其他"]
];
const W6_TLABEL = { noun: "名", verb: "动", adj: "形", adv: "副", place: "地名", phrase: "短语", mixed: "其他" };

function w6Filter() {
  if (!window.W6000 || !window.W6000.words) return [];
  const q = W6_STATE.q.trim().toLowerCase();
  const t = W6_STATE.t;
  return window.W6000.words.filter(w => {
    if (t !== "all" && w.t !== t) return false;
    if (q && !w.w.toLowerCase().includes(q) && !w.zh.toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderW6000(app) {
  if (typeof W6000 === "undefined" || !W6000.words) {
    app.innerHTML = `<div class="card"><p>6000 词数据未加载（assets/js/data/w6000.js）。</p></div>`;
    return;
  }
  const meta = W6000.meta;
  const list = w6Filter();
  const show = list.slice(0, W6_STATE.limit);
  const total = W6000.words.length;

  app.innerHTML = `
    <div class="w6-note">
      <span class="lbk-extra">课外参考 · Extra</span>
      <span class="sc-note">词汇不计入生词表 · 全文检索（德文 / 中文）</span>
    </div>
    <div class="vocab-toolbar w6-toolbar">
      <input class="vocab-search" id="w6Search" type="search" placeholder="搜索德文或中文，如：Abenteuer / 冒险 / verlieren …" value="${esc(W6_STATE.q)}">
      <span class="vocab-count" id="w6Count">共 ${total} 词 · 当前 ${list.length}</span>
    </div>
    <div class="chip-row w6-types">
      ${W6_TYPES.map(([k, lbl]) => `<button class="chip ${W6_STATE.t === k ? "on" : ""}" data-t="${k}">${lbl}<span class="w6-cnt">${k === "all" ? total : (meta.types[k] || 0)}</span></button>`).join("")}
    </div>
    <div class="w6-list">
      ${show.map(w => `
        <div class="w6-row">
          <span class="w6-w">${esc(w.w)}<button class="s-speak w6-speak" data-t="${esc(w.w).replace(/"/g, "&quot;")}" title="朗读">🔊</button></span>
          <span class="w6-t t-${w.t}">${W6_TLABEL[w.t] || "其他"}</span>
          ${w.inf ? `<span class="w6-inf">${esc(w.inf)}</span>` : ""}
          <span class="w6-zh">${esc(w.zh)}</span>
        </div>`).join("") || `<div class="w6-empty">没有匹配的词。换个关键词试试。</div>`}
    </div>
    ${list.length > W6_STATE.limit ? `<button class="chip w6-more" id="w6More">显示更多（还剩 ${list.length - W6_STATE.limit} 条）</button>` : ""}
  `;

  const search = $("#w6Search", app);
  let deb;
  search.addEventListener("input", e => {
    clearTimeout(deb);
    deb = setTimeout(() => {
      W6_STATE.q = e.target.value; W6_STATE.limit = 400;
      renderW6000(app);
      const el = $("#w6Search", app);
      el.focus(); el.setSelectionRange(el.value.length, el.value.length);
    }, 160);
  });
  $$(".w6-types .chip", app).forEach(b => b.addEventListener("click", () => {
    W6_STATE.t = b.dataset.t; W6_STATE.limit = 400;
    renderW6000(app); window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  const more = $("#w6More", app);
  if (more) more.addEventListener("click", () => { W6_STATE.limit += 400; renderW6000(app); });
  $$(".w6-speak", app).forEach(b => b.addEventListener("click", ev => {
    ev.stopPropagation();
    if (window.__dhSpeak) window.__dhSpeak(b.dataset.t);
  }));
}
