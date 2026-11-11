#!/usr/bin/env node
/* ============================================================
   gen_wortliste.js · 生成「全站词表」assets/js/data/wortliste.js
   ------------------------------------------------------------
   扫描站点全部德语语料（课程 / 词卡 / 语法 / 课文 / 练习 / 教材 / Notion 笔记），
   抽词 → 归一复数记号 → 去碎片噪音 → 推导原形 → 补音标与中文释义 → 输出。

   用法：node scripts/gen_wortliste.js
   依赖：assets/js/data/{deutsch-data,pron,lehrbuch,notion-notes}.js
   说明：词典来源 PRON / PRON_FORMS / PRON_BARE / PRON_EXTRA / PRON_FUNC + VOCAB。
         新增词条后重跑本脚本即可刷新词表。
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "assets/js/data");
const OUT = path.join(DATA, "wortliste.js");

/* ---------- 载入数据与词典 ---------- */
const src = ["deutsch-data.js", "pron.js", "lehrbuch.js", "notion-notes.js"]
  .map(f => fs.readFileSync(path.join(DATA, f), "utf8")).join("\n");

eval(src + "\n" + `
const LEXIPA = {};   // 裸词 → IPA
const LEX = new Set();
function addLex(k, ipa) {
  if (!k || !ipa) return;
  const key = String(k).toLowerCase().replace(/^(der|die|das)\\s+/, "");
  if (!key) return;
  if (!LEXIPA[key]) LEXIPA[key] = ipa;
  LEX.add(key);
}
Object.entries(PRON).forEach(([k, v]) => addLex(k, v.ipa));
Object.entries(PRON_FORMS).forEach(([k, v]) => addLex(k, v));
Object.entries(PRON_BARE).forEach(([k, v]) => addLex(k, v));
if (typeof PRON_EXTRA !== "undefined") Object.entries(PRON_EXTRA).forEach(([k, v]) => addLex(k, v));
if (typeof PRON_FUNC !== "undefined") Object.entries(PRON_FUNC).forEach(([k, v]) => addLex(k, v));
if (typeof PRON_MORE !== "undefined") Object.entries(PRON_MORE).forEach(([k, v]) => addLex(k, v));

/* 中文释义来源优先级：词卡释义（VOCAB.zh，真义）> 全站释义（PRON_ZH）
   注意：PRON[key].zh 是「中文谐音」发音提示，单独放在 pron 字段，不能当释义用。 */
const ZH = {};
const PRONAID = {};
Object.entries(PRON).forEach(([k, v]) => {
  const key = k.toLowerCase().replace(/^(der|die|das)\\s+/, "");
  if (v.zh && !PRONAID[key]) PRONAID[key] = v.zh;
});
VOCAB.forEach(v => {
  const key = v.de.toLowerCase().replace(/^(der|die|das)\\s+/, "");
  if (!ZH[key]) ZH[key] = v.zh;
  if (v.ipa && !LEXIPA[key]) LEXIPA[key] = v.ipa;   // 词卡自带 IPA 也作为全站词表音标来源（Jian 2026-11-11）
  LEX.add(key);
});
LEHRBUECHER.filter(b => !b.extra).forEach(b => b.words.forEach(w => LEX.add(w[0].toLowerCase().replace(/^(der|die|das)\\s+/, ""))));
// 全站词表中文释义（覆盖词卡之外的词形）
if (typeof PRON_ZH !== "undefined") {
  Object.entries(PRON_ZH).forEach(([k, v]) => {
    const key = k.toLowerCase().replace(/^(der|die|das)\\s+/, "");
    if (!ZH[key]) ZH[key] = v;
  });
}

/* ---------- 语料抽取 ---------- */
const WORDS = new Map();
function addText(text, source) {
  if (!text) return;
  // 去掉方括号内容：笔记里 [ˈvaɪ̯naxts] 这类音标标注会被误当作单词
  const body = String(text).replace(/\\[[^\\]]*\\]/g, " ");
  const toks = body.match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß'’-]*/g) || [];
  for (const raw of toks) {
    const w = raw.replace(/['’-]+$/, "").toLowerCase();
    if (!w) continue;
    if (!WORDS.has(w)) WORDS.set(w, { n: 0, src: new Set() });
    const e = WORDS.get(w);
    e.n++; e.src.add(source);
  }
}
VOCAB.forEach(v => addText(v.de, "Wortschatz"));
LESSONS.forEach(l => {
  l.sentences.forEach(s => addText(s.de, "Lektionen"));
  l.grammar.forEach(g => addText(g, "Lektionen"));
  addText(l.de + " " + l.title, "Lektionen");
});
GRAMMAR.forEach(g => addText(String(g.body).replace(/<[^>]+>/g, " "), "Grammatik"));
TEXTS.forEach(t => t.paragraphs.forEach(p => {
  addText(p.de, "Texte");
  (p.verbs || []).forEach(v => addText(v, "Texte"));
}));
QUIZZES.forEach(q => {
  addText(q.de + " " + q.title + " " + q.desc, "Übungen");
  q.questions.forEach(qq => { addText(qq.q, "Übungen"); addText(qq.explain, "Übungen"); });
});
LEHRBUECHER.filter(b => !b.extra).forEach(b => {
  b.words.forEach(w => addText(w[0] + " " + w[1], "Lehrbuch"));
  b.sentences.forEach(s => addText(s[0], "Lehrbuch"));
  b.points.forEach(p => addText(p, "Lehrbuch"));
  // 注：b.text 是扫描版 PDF 的原始文本 dump，含大量断词/注音噪音，故意不纳入抽词。
});
NOTION_NOTES.forEach(n => addText(n.text, "Notiz"));

/* ---------- 清洗 ---------- */
const JUNK = new Set([
  // 词缀/音节碎片（教材形态学框里出现）
  "chen","ent","ieren","ie","imm","ver","zig","heit","ung","schaft","eu","äu","yot","größe-n",
  // 界面 / 元数据 / 英文残留
  "xx","xs","xl","xxl","h&m","bonus","grammatik-kasten","fourth-look","kaufhaus-spiel","kleidungs-bingo",
  "weg-diktat","wetter-bingo","wetter-mime","satzpuzzle","klassenspiel","lesetext","wortliste","wettermoderator",
  "dpi","mb","something","there","exists","memory","lesson","post","cover","title","tags","type","source","pvs",
  "url","icon","notion","pdf","ppt","summary","version","status","todo","done","part","block","empty","level",
  "alias","date","site","card","chat","psil","look","fourth","greetings","akk","e-st-t-en-t",
  // 逐字拼读串
  "drei-fünf-drei-neun-null","null-eins-sieben-sechs",
  // 断词/注音碎片（PDF 与笔记里被拆开的音节）
  "aa","alphab","lphabet","uchstabe","uchstabieren","caf","ddot","ei","fau","gg","güne","half","ier","ing",
  "oo","rei","sech","sieb","ßig","tan","tos","uu","wom","zer","zet",
  // 英文残留
  "beanie","boots","rubber","scarf","sweater","tips","train","etc","mpi",
  // 变位切分残留
  "arbeitst","arbeitt","keit",
  // 人名（非词汇）
  "max","planck"
]);
/* 连字符残留（如 a-z / dialog-modell / fünf-zich）——仅保留真正的复合词 */
const HYPHEN_OK = new Set(["e-mails","t-shirts"]);
const SHORT_OK = new Set(["ja","so","du","er","es","in","im","am","um","an","ob","wo","zu","eu","äu","ie","ei",
  "aa","oo","uu","hm","äh","öh","üh","gg","ggf","cd","tv","pc"]);
const VOWELS = new Set("aeiouäöü");

/* 英文 / 标记语言 / 界面残留（非德语词） */
const EN_STOP = new Set([
  "administration","adv","adj","air","airplane","all","basic","basis","brainstorming","cafeteria","capitalization",
  "cash","coat","collective","context","cream","daily","desert","dots","eight","else","expression","eyes","fluency",
  "fog","gender","gloves","have","ice","image","institute","institution","ipa","jak","jay","learning","life","like",
  "logistics","main","mathbf","mba","names","noun","navigation","neq","past","placement","position","python","rain",
  "rightarrow","running","shell","socializing","society","strawberry","sun","sunburn","task-based","towel","transport",
  "travel","umbrella","usa","yes","markdown","manuskript","originaltext","folks-vagen","context","fluency","grammatik-check",
  "lernhinweise","übersicht","buchstabennamen","deutschlernen"
]);

function norm(w) {                      // 教材复数记号：Fahrkarte-n → Fahrkarte
  if (w.includes("-")) {
    const m = /^(.*?)-(n|e|en|er|s)$/.exec(w);
    if (m && m[1].length >= 3) return m[1];
  }
  return w;
}

function deriveBase(w) {                // 变位/分词 → 原形（继承原形音标）
  const cands = new Set();
  const put = s => { if (s && s.length >= 3) cands.add(s); };
  for (const suf of ["en","est","et","st","t","te","test","tet","ten","e","end"]) {
    if (w.endsWith(suf) && w.length - suf.length >= 3) {
      const s = w.slice(0, -suf.length);
      put(s); put(s + "en"); put(s + "n"); put(s + "e");
    }
  }
  if (w.startsWith("ge")) { const s = w.slice(2); put(s + "en"); put(s + "e"); put(s + "t"); }
  for (const c of [...cands]) {
    if (c.includes("ä")) put(c.replace(/ä/g, "a"));
    if (c.includes("ö")) put(c.replace(/ö/g, "o"));
    if (c.includes("ü")) put(c.replace(/ü/g, "u"));
    if (c.includes("ie")) put(c.replace(/ie/g, "e"));
    if (c.includes("i")) put(c.replace(/i/g, "e"));
  }
  for (const c of cands) if (LEX.has(c)) return c;
  return "";
}

const merged = new Map();
for (const [raw, v] of WORDS) {
  const w = norm(raw);
  if (JUNK.has(w) || JUNK.has(raw)) continue;
  if (EN_STOP.has(w)) continue;
  if (w.includes("-") && !HYPHEN_OK.has(w)) continue;
  if (!SHORT_OK.has(w)) {
    if (w.length < 3) continue;
    if (![...w].some(ch => VOWELS.has(ch))) continue;
    if (!/^[a-zäöüß][a-zäöüß'’-]*$/.test(w)) continue;
  }
  if (merged.has(w)) {
    const y = merged.get(w);
    y.n += v.n;
    v.src.forEach(s => y.src.add(s));
  } else {
    merged.set(w, { w: w, n: v.n, src: new Set(v.src) });
  }
}

/* 强变化 / 可分动词的「分词 → 原形」映射：deriveBase 无法处理换音（gewinnen→gewonnen） */
const FORM_BASE = {
  gewonnen:"gewinnen", verglichen:"vergleichen", beschriftet:"beschriften", gebracht:"bringen",
  gesehen:"sehen", gelobt:"loben", gezeigt:"zeigen", gestartet:"starten", gesucht:"suchen",
  gesprochen:"sprechen", gegessen:"essen", getrunken:"trinken", gemacht:"machen", gewesen:"sein",
  begonnen:"beginnen", angerufen:"anrufen", ausgezogen:"ausziehen", angezogen:"anziehen",
  aufgeräumt:"aufräumen", aufgestanden:"aufstehen", entschuldigt:"entschuldigen",
  gefunden:"finden", gekommen:"kommen", gegangen:"gehen", gefahren:"fahren",
  geschrieben:"schreiben", getragen:"tragen", geholfen:"helfen", gewaschen:"waschen",
  gereinigt:"reinigen", erzählt:"erzählen", wiederholt:"wiederholen", benutzt:"benutzen",
  vorbereitet:"vorbereiten", kontrolliert:"kontrollieren", notiert:"notieren",
  gefehlt:"fehlen", gelacht:"lachen", gelöst:"lösen", geschafft:"schaffen",
  gekocht:"kochen", gerufen:"rufen", eingetragen:"eintragen", eingeschaltet:"einschalten",
  untersucht:"untersuchen", entschieden:"entscheiden", telefoniert:"telefonieren",
  fehlenden:"fehlen", sorgfältige:"sorgfältig", blättern:"blatt", kolleginnen:"kollegin",
  untersuchungen:"untersuchung", pflanzen:"pflanze", proben:"probe", ergebnisse:"ergebnis",
  geräte:"gerät", interessanter:"interessant", gerufen:"rufen", glück:"glück"
};
/* 词典未收的常用词形 / 语法术语 / 专名：补中文释义，保持全站词表 100% 可查 */
const FILL_ZH = {
  anders:"不同的；否则", arbeitsblatt:"练习页；工作单", arbeitsplan:"工作计划", ben:"人名 Ben",
  bewegung:"运动；移动", bilde:"形成（bilden 的变形）", bilden:"形成；构成", blätt:"叶片（Blatt 词干）",
  comput:"电脑（Computer 词干）", dafür:"为此；对此", dein:"你的", deiner:"你的（变格）",
  dritte:"第三", dritten:"第三（变格）", emp:"不可分前缀 emp-", endlich:"终于",
  entschuldigen:"道歉", entschuldigt:"道歉（过去分词）", etw:"etwas 的缩写（某事/某物）",
  eva:"人名 Eva", falsche:"错误的", falschen:"错误的（变格）", fund:"发现；特别发现",
  gemeinsam:"一起；共同", gerufen:"叫；打电话（rufen 过去分词）", gesicht:"脸",
  gestartet:"启动（过去分词）", glück:"幸福；运气", ige:"形容词词尾 -ige",
  interessanter:"有趣的（变格）", karim:"人名 Karim", korrigiert:"批改；更正（过去分词）",
  lab:"Labor 的简称（实验室）", leseverstehen:"阅读理解", letzten:"上一个；最近的",
  meisten:"大多；通常", mias:"人名 Mia", miss:"不可分前缀 miss-", montag:"星期一",
  nina:"人名 Nina", nur:"只；仅仅", ortswechsel:"位置改变", pflanz:"植物（Pflanze 词干）",
  problem:"问题", produktiv:"高效的", projekt:"项目", raum:"房间；空间", rufen:"叫；打电话",
  satz:"句子", schnell:"快的；迅速地", schreibaufgabe:"写作任务", skript:"讲义；脚本",
  sofort:"立刻", sorgfält:"细致的（sorgfältig 词干）", starten:"启动",
  ungewöhnliches:"不寻常的事物", uns:"我们（第三/四格）", vorgebereitet:"准备（vorbereitet 的拼写变体）",
  warum:"为什么", wechselpräpositionen:"可换格介词（静三动四）", welchem:"哪个（第三格）",
  welches:"哪个（中性）", wem:"谁（第三格）", wen:"谁（第四格）", wiederholung:"重复；复习",
  wissen:"知道", woher:"从哪里", wohin:"去哪里"
};
/* 词典未收的词形：用 espeak-ng 生成示意 IPA（近似，非人工校音；CLI 不可用则跳过） */
let g2pOK = true, approx = 0;
function g2p(w) {
  if (!g2pOK) return "";
  try {
    const out = require("child_process").execFileSync("espeak-ng", ["-v", "de", "--ipa", "-q", w],
      { encoding: "utf8", timeout: 3000 }).trim();
    if (!out) return "";
    approx++;
    return "[" + out.replace(/\[|\]/g, "") + "]";
  } catch (e) { g2pOK = false; return ""; }
}

const list = [];
let derived = 0;
for (const y of merged.values()) {
  let ipa = LEXIPA[y.w] || "";
  let zh = ZH[y.w] || "";
  let base = "";
  if (!ipa || !zh) {
    base = FORM_BASE[y.w] || deriveBase(y.w);
    if (base) {
      if (!ipa) ipa = LEXIPA[base] || "";
      if (!zh && ZH[base]) zh = ZH[base];
      derived++;
    }
  }
  if (!zh) zh = FILL_ZH[y.w] || "";
  if (!ipa) ipa = g2p(y.w);
  list.push({ w: y.w, n: y.n, ipa: ipa, zh: zh, pron: PRONAID[y.w] || "", base: base, src: [...y.src].sort() });
}
list.sort((a, b) => a.w.localeCompare(b.w, "de"));
list.forEach(x => { if (!x.base) delete x.base; if (!x.pron) delete x.pron; });

/* ---------- 输出 ---------- */
const head = [
  "/* ============================================================",
  "   全站词表 · Gesamtliste（脚本生成，勿手改；见 scripts/gen_wortliste.js）",
  "   来源：LESSONS / VOCAB / GRAMMAR / TEXTS / QUIZZES / LEHRBUECHER / NOTION_NOTES",
  "   字段：w 词形 · n 出现次数 · ipa 国际音标 · zh 中文释义 · pron 中文谐音 · base 推导原形 · src 来源",
  "   ============================================================ */",
  "const WORTLISTE = " + JSON.stringify(list) + ";",
  ""
].join("\\n");
fs.writeFileSync(OUT, head, "utf8");

const noipa = list.filter(x => !x.ipa).map(x => x.w);
console.log("[✓] wortliste.js:", list.length, "词形 | 有音标", list.filter(x => x.ipa).length,
  "| 有中文", list.filter(x => x.zh).length, "| 推导原形", derived, "| espeak 近似音标", approx,
  "|", Math.round(head.length / 1024), "KB");
if (noipa.length) console.log("仍无音标(" + noipa.length + "):", noipa.join(" "));
`);
