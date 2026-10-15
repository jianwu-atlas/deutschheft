#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_english.py · 蒸馏《15000英语单词口袋书》→ 站点数据

来源：PDF（有文本层）+ 抽出的全文
      ~/.workbuddy/wiki-knowledge-en/raw/en15000-ocr.txt
产出：assets/js/data/english.js → const ENGLISH

结构：sections[] → parts[] → scenes[] → { words[], sentences[] }
  words     = [{ zh, en, ipa, pos }]        三行格式：英文 / 音标 / 中文+词性
  sentences = [{ en, zh }]                  「你一定要会说的 Top10 场景句」

⚠️ 课外教材：ENGLISH.meta.extra = true；词汇不计入 VOCAB / wortliste.js
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAW = Path.home() / ".workbuddy/wiki-knowledge-en/raw/en15000-ocr.txt"
PDF = Path("/Users/Jack/Library/CloudStorage/OneDrive-Personal/01_个人_Personal/2_书籍_Books/"
           "15000英语单词口袋书-最重要.pdf")
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/js/data/english.js"
WORTLISTE = ROOT / "assets/js/data/wortliste.js"

PAGE_RE = re.compile(r"^=+\s*PAGE\s*\d+\s*/\s*\d+\s*=+$")
CJK = r"\u4e00-\u9fff"
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
WORD_RE = re.compile(
    rf"^[{CIRCLED}]\s*(?P<zh>[{CJK}、，/（）()·]+)\s+"
    r"(?P<en>[A-Za-z][A-Za-z .'\-]*?)\s*"
    r"\[(?P<ipa>[^\]]+)\]\s*"
    r"(?P<pos>[a-z]+\.)"
)
SCENE_RE = re.compile(rf"^(?P<no>\d+\.\d+\.\d+)\s*(?P<zh>[{CJK}][{CJK}（）()、·0-9\s]*)$")
TOPCNT_RE = re.compile(rf"^{CJK}*Top10\s*{CJK}*$|Top10")
SENT_ZH_RE = re.compile(rf"^(?P<n>\d+)\s*[．.]\s*(?P<zh>[{CJK}].*)$")
SEC_RE = re.compile(r"^Section\s*(\d+)\s*(.+)$")
PART_RE = re.compile(r"^Part\s*(\d+)\s*(.+)$")


def unspace(s: str) -> str:
    """去掉 PDF 字距造成的空格：CJK↔CJK、以及全角括号两侧"""
    s = re.sub(r"\s*([（）])\s*", r"\1", s)
    s = re.sub(rf"(?<=[{CJK}])\s+(?=[{CJK}])", "", s)
    s = re.sub(rf"(?<=[{CJK}、，。])\s+(?=[{CJK}])", "", s)
    return re.sub(r"\s{2,}", " ", s).strip()


def load_toc() -> tuple[dict[str, str], dict[str, str]]:
    """从目录页抽 Section / Part 名称"""
    import pypdf
    r = pypdf.PdfReader(str(PDF))
    secs: dict[str, str] = {}
    parts: dict[str, str] = {}
    cur_sec = ""
    for i in range(6, 30):
        if i >= len(r.pages):
            break
        t = r.pages[i].extract_text() or ""
        for line in t.split("\n"):
            s = unspace(line)
            m = SEC_RE.match(s)
            if m:
                cur_sec = m.group(1)
                secs.setdefault(cur_sec, m.group(2).strip())
                continue
            m = PART_RE.match(s)
            if m and cur_sec:
                parts.setdefault(f"{cur_sec}.{m.group(1)}", m.group(2).strip())
    return secs, parts


def main() -> int:
    if not RAW.exists():
        sys.exit(f"❌ 缺少全文 {RAW}（先跑 PDF 抽文本）")
    lines = RAW.read_text(encoding="utf-8", errors="ignore").split("\n")
    toc_secs, toc_parts = load_toc()
    print(f"    目录：Section {len(toc_secs)} 个 · Part {len(toc_parts)} 个")

    # 定位场景起点
    marks: list[tuple[int, str, str]] = []      # (行号, 编号, 名称)
    for i, l in enumerate(lines):
        s = unspace(l)
        m = SCENE_RE.match(s)
        if m and "场景" not in s:
            marks.append((i, m.group("no"), m.group("zh").strip()))
    marks.append((len(lines), "", ""))

    scenes = []
    total_w = total_s = 0
    for k in range(len(marks) - 1):
        a, no, zh = marks[k]
        b = marks[k + 1][0]
        blk = lines[a + 1:b]
        words, sentences = [], []
        # 词条
        for l in blk:
            if PAGE_RE.match(l.strip()):
                continue
            m = WORD_RE.match(l.strip())
            if m:
                words.append({"zh": unspace(m.group("zh")),
                              "en": m.group("en").strip(),
                              "ipa": m.group("ipa").strip(),
                              "pos": m.group("pos")})
        # 场景句
        ti = next((i for i, l in enumerate(blk) if TOPCNT_RE.search(l)), None)
        if ti is not None:
            i = ti + 1
            while i < len(blk):
                s = blk[i].strip()
                mz = SENT_ZH_RE.match(unspace(s))
                if mz:
                    zh_s = mz.group("zh").strip()
                    en_s = ""
                    j = i + 1
                    while j < len(blk) and len(en_s) < 240:
                        t = blk[j].strip()
                        if not t or PAGE_RE.match(t) or SENT_ZH_RE.match(unspace(t)):
                            break
                        if re.match(r"^[A-Za-z]", t):
                            en_s = (en_s + " " + t).strip()
                        elif en_s:
                            break
                        j += 1
                    if en_s:
                        sentences.append({"en": en_s, "zh": zh_s})
                        i = j
                        continue
                i += 1
        if words or sentences:
            scenes.append({"no": no, "zh": zh, "words": words, "sentences": sentences})
            total_w += len(words)
            total_s += len(sentences)

    # 组装三层：Section → Part → 场景
    sec_map: dict[str, dict] = {}
    for sc in scenes:
        p3 = sc["no"].split(".")
        sno = p3[0]
        pno = f"{p3[0]}.{p3[1]}"
        sec = sec_map.setdefault(sno, {"no": sno, "zh": toc_secs.get(sno, f"Section {sno}"), "parts": {}})
        part = sec["parts"].setdefault(pno, {"no": pno, "zh": toc_parts.get(pno, f"Part {p3[1]}"), "scenes": []})
        part["scenes"].append(sc)

    sections = []
    for sno in sorted(sec_map, key=int):
        sec = sec_map[sno]
        parts = [sec["parts"][p] for p in sorted(sec["parts"], key=lambda x: int(x.split(".")[1]))]
        sections.append({"no": sno, "zh": sec["zh"], "parts": parts})

    payload = {
        "meta": {"id": "en15000", "zh": "15000英语单词口袋书",
                 "en": "15000 English Words Pocket Book", "extra": True,
                 "note": "课外教材；词汇不计入生词表"},
        "sections": sections,
    }
    OUT.write_text(
        "/* eslint-disable */\n"
        "// 由 scripts/build_english.py 自动生成，请勿手改\n"
        "// 数据源：《15000英语单词口袋书》（课外教材，词汇不计入生词表）\n"
        "const ENGLISH = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")

    n_sc = sum(len(p["scenes"]) for s in sections for p in s["parts"])
    print(f"[✓] 已生成 {OUT.relative_to(ROOT)}（{OUT.stat().st_size // 1024} KB）")
    print(f"    Section {len(sections)} | Part {sum(len(s['parts']) for s in sections)} | "
          f"场景 {n_sc} | 词条 {total_w} | 场景句 {total_s}")
    for s in sections:
        print(f"      {s['no']}. {s['zh']}: {len(s['parts'])} Part / "
              f"{sum(len(p['scenes']) for p in s['parts'])} 场景 / "
              f"{sum(len(sc['words']) for p in s['parts'] for sc in p['scenes'])} 词")

    # 自检：课外教材不得作为词表来源
    gen = ROOT / "scripts/gen_wortliste.js"
    if gen.exists():
        src = gen.read_text(encoding="utf-8")
        n = src.count("filter(b => !b.extra)") + src.count("filter(b=>!b.extra)")
        print(f"    自检 gen_wortliste.js 的 `!b.extra` 过滤：{n} 处 {'✅' if n >= 2 else '❌'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
