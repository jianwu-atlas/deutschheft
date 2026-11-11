#!/usr/bin/env node
/* ============================================================
   gen_text_word_ipa.js · 生成课文「词级 IPA」表（espeak-ng，近似音标）
   ------------------------------------------------------------
   用途：课文页按「单词 ≤60%」展示音标时，对无法与人工整句 IPA
   逐词对齐的句子（含 10:30 Uhr 这类时间读法、E-Mails 等）作兜底。
   对齐成功的句子仍使用 TEXTS[].ips 里的人工校音音段。

   用法：node scripts/gen_text_word_ipa.js
   依赖：espeak-ng（本机 /opt/homebrew/bin/espeak-ng）
   输出：assets/js/data/text-word-ipa.js（window.TEXT_WORD_IPA）
   ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets/js/data/text-word-ipa.js");
const src = fs.readFileSync(path.join(ROOT, "assets/js/data/deutsch-data.js"), "utf8");
const TEXTS = new Function(src + "\nreturn TEXTS;")();

const split = s => (String(s).match(/[^.!?]+[.!?]+[""')\]]*\s*/g) || [s]).map(x => x.trim()).filter(Boolean);
const words = new Set();
TEXTS.forEach(t => t.paragraphs.forEach(p => split(p.de).forEach(s => {
  (s.match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß'’-]*/g) || [])
    .forEach(w => words.add(w.toLowerCase()));
})));

const table = {};
let fail = 0;
for (const w of [...words].sort()) {
  try {
    const out = execFileSync("espeak-ng", ["-v", "de", "--ipa", "-q", w],
      { encoding: "utf8", timeout: 5000 })
      .split("\n")[0]
      .replace(/\([^)]*\)/g, "")
      .replace(/[\[\]]/g, "")
      .trim();
    if (out) table[w] = "[" + out + "]";
    else fail++;
  } catch (e) { fail++; }
}

const head = [
  "/* eslint-disable */",
  "// 由 scripts/gen_text_word_ipa.js 生成，请勿手改。",
  "// 词级 IPA 来自 espeak-ng 德语 G2P，属近似/示意音标；",
  "// 课文页优先使用 TEXTS[].ips 的人工校音音段，本表仅作不对齐句子的兜底。",
  "window.TEXT_WORD_IPA = " + JSON.stringify(table, null, 0) + ";",
  ""
].join("\n");
fs.writeFileSync(OUT, head, "utf8");
console.log(`[✓] text-word-ipa.js: ${Object.keys(table).length} 词 | 失败 ${fail} | ${Math.round(head.length / 1024)} KB`);
