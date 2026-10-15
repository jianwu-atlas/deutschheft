#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_sucheng_extras.py · 生成教材精读的「发音篇 / 语法篇」数据

来源：已蒸馏的知识库 `~/.workbuddy/wiki-knowledge/wiki/concepts/*.md`
产出：assets/js/data/sucheng-extras.js → const SUCHENG_EXTRAS = { pronunciation, grammar }

⚠️ 课外教材：SUCHENG_EXTRAS.meta.extra = true；词汇不计入 VOCAB / wortliste.js
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

WIKI = Path.home() / ".workbuddy/wiki-knowledge/wiki/concepts"
RAW = Path.home() / ".workbuddy/wiki-knowledge/raw/lingjichu-sucheng-ocr.txt"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/js/data/sucheng-extras.js"

# 发音篇 7 讲（顺序即书序）
PRON_PAGES = [
    ("单元音1", "Einheit 1 · 单元音 1", "A / E / I / O 的长短音"),
    ("单元音2", "Einheit 2 · 单元音 2", "U / Ä / Ö / Ü（变元音）"),
    ("辅音1", "Einheit 3 · 辅音 1", "P B T D K G 与词尾清化"),
    ("辅音2", "Einheit 4 · 辅音 2", "C Z S H V J"),
    ("辅音3", "Einheit 5 · 辅音 3", "F W L M N X R"),
    ("辅音组合", "Einheit 6 · 辅音组合", "ch / sch / tsch / pf"),
    ("双元音", "Einheit 7 · 双元音", "au / ei / eu"),
]
# 语法篇 13 讲（wiki 概念页覆盖）
GRAM_PAGES = [
    ("名词与冠词", "一～三 · 名词的变格 I / II 与冠词用法"),
    ("人称代词变格", "四～五 · 人称代词与物主代词"),
    ("动词变位", "六～八 · 动词变位 / 可分动词 / 不可分动词"),
    ("反身动词", "九 · 反身动词"),
    ("祈使句", "十 · 祈使句"),
    ("现在完成时助动词", "十一 · 现在完成时：haben 还是 sein"),
    ("及物与不及物动词", "十二 · 及物与不及物动词"),
    ("动词所要求的格", "十三 · 动词所要求的格"),
    ("语序与句子", "附 · 语序与句子（动词第二位）"),
]


def inline(s: str) -> str:
    s = (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
    s = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
    s = re.sub(r"\[(.+?)\]\((.+?)\)", r"<a href='\2'>\1</a>", s)
    return s


# ---------- 发音篇：从 OCR 抽「字母及字母组合 / 单词 / 中文意思 / 汉语谐音」四列 ----------
PRON_SECS = [
    ("单元音1", ["单元音1", "单元音 1"]),
    ("单元音2", ["单元音2", "单元音 2"]),
    ("辅音1", ["辅音1", "辅音 1"]),
    ("辅音2", ["辅音2", "辅音 2"]),
    ("辅音3", ["辅音3", "辅音 3"]),
    ("辅音组合", ["辅音组合发音", "辅音组合"]),
    ("双元音", ["双元音"]),
]
P_COLS = ["字母及字母组合", "单词", "中文意思", "汉语谐音"]
P_PAGE = re.compile(r"^=+\s*PAGE\s*\d+\s*/\s*\d+\s*=+$")
P_NOISE = ("发音篇", "友音篇", "音标", "字母", "单词", "中文意思", "汉语谐音", "发音方法", "标准德语")
P_IPA = re.compile(r"^[［\[(（][^］\])）]{1,12}[］\])）]?$")


def _clean_cell(s: str) -> bool:
    s = s.strip()
    if not s or P_PAGE.match(s) or P_IPA.match(s):
        return False
    if s.startswith(P_NOISE) or re.match(r"^\d{1,3}$", s):
        return False
    if re.match(r"^[^\w\u4e00-\u9fff]*$", s):
        return False
    return True


def parse_pron_tables() -> dict[str, list[list[str]]]:
    """→ {section: [[字母组合, 单词, 中文意思, 汉语谐音], ...]}"""
    lines = RAW.read_text(encoding="utf-8", errors="ignore").split("\n")
    starts = {}
    for key, names in PRON_SECS:
        hits = [i for i, l in enumerate(lines) if i > 700 and l.strip() in names]
        if hits:
            starts[key] = hits[0]
    order = sorted(starts, key=lambda k: starts[k])
    tables: dict[str, list[list[str]]] = {}
    for n, key in enumerate(order):
        a = starts[key]
        b = starts[order[n + 1]] if n + 1 < len(order) else len(lines)
        seg = lines[a:b]
        cols: dict[str, list[str]] = {}
        cur = None
        for l in seg:
            s = l.strip()
            if s in P_COLS:
                cur = s
                cols.setdefault(cur, [])
                continue
            if cur and _clean_cell(s):
                cols[cur].append(s)
        combo, words = cols.get("字母及字母组合", []), cols.get("单词", [])
        zh, pron = cols.get("中文意思", []), cols.get("汉语谐音", [])
        nrow = min(len(combo), len(words), len(zh), len(pron))
        tables[key] = [[combo[i], words[i], zh[i], pron[i]] for i in range(nrow)]
    return tables


def pron_table_html(rows: list[list[str]]) -> str:
    if not rows:
        return ""
    body = "".join(
        "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows)
    return ("<table class='sc-md-table'><thead><tr>"
            + "".join(f"<th>{c}</th>" for c in P_COLS)
            + f"</tr></thead><tbody>{body}</tbody></table>")
    s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
    s = re.sub(r"\[(.+?)\]\((.+?)\)", r"<a href='\2'>\1</a>", s)
    return s


def md_to_html(md: str) -> str:
    lines = md.split("\n")
    out, i = [], 0
    # 跳过 front-matter
    if lines and lines[0].strip() == "---":
        for j in range(1, len(lines)):
            if lines[j].strip() == "---":
                i = j + 1
                break
    while i < len(lines):
        ln = lines[i].rstrip()
        s = ln.strip()
        if not s:
            i += 1
            continue
        # 表格
        if s.startswith("|") and i + 1 < len(lines) and re.match(r"^\|[\s:|-]+\|$", lines[i + 1].strip()):
            head = [c.strip() for c in s.strip("|").split("|")]
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            out.append("<table class='sc-md-table'><thead><tr>"
                       + "".join(f"<th>{inline(c)}</th>" for c in head)
                       + "</tr></thead><tbody>"
                       + "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows)
                       + "</tbody></table>")
            continue
        # 标题
        m = re.match(r"^(#{1,4})\s+(.*)$", s)
        if m:
            lv = min(len(m.group(1)) + 1, 5)      # h1 → h2
            out.append(f"<h{lv}>{inline(m.group(2))}</h{lv}>")
            i += 1
            continue
        # 引用
        if s.startswith(">"):
            buf = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append("<blockquote>" + "<br>".join(inline(x) for x in buf if x) + "</blockquote>")
            continue
        # 列表
        if re.match(r"^[-*]\s+", s):
            buf = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                buf.append(re.sub(r"^\s*[-*]\s+", "", lines[i]))
                i += 1
            out.append("<ul>" + "".join(f"<li>{inline(x)}</li>" for x in buf) + "</ul>")
            continue
        out.append(f"<p>{inline(s)}</p>")
        i += 1
    return "\n".join(out)


def collect(pages, kind: str) -> list[dict]:
    items = []
    for entry in pages:
        name = entry[0]
        f = WIKI / f"{name}.md"
        if not f.exists():
            print(f"  ⚠️ 缺少 {f.name}，跳过")
            continue
        md = f.read_text(encoding="utf-8")
        if kind == "pron":
            subtitle = entry[2]
        else:
            subtitle = entry[1]
        items.append({"id": name, "zh": entry[1], "sub": subtitle, "html": md_to_html(md)})
    return items


def main() -> int:
    pron = collect(PRON_PAGES, "pron")
    gram = collect(GRAM_PAGES, "gram")
    # 发音篇：把 OCR 抽出的「字母组合 / 单词 / 中文意思 / 汉语谐音」四列表插到每讲最前
    tables = parse_pron_tables()
    hit = 0
    for item in pron:
        rows = tables.get(item["id"], [])
        tbl = pron_table_html(rows)
        if tbl:
            item["html"] = tbl + item["html"]
            item["rows"] = len(rows)
            hit += 1
    payload = {
        "meta": {"extra": True, "note": "课外教材；词汇不计入生词表",
                 "source": "~/.workbuddy/wiki-knowledge/wiki/concepts + OCR 发音篇"},
        "pronunciation": pron,
        "grammar": gram,
    }
    OUT.write_text(
        "/* eslint-disable */\n"
        "// 由 scripts/build_sucheng_extras.py 自动生成，请勿手改\n"
        "const SUCHENG_EXTRAS = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8")
    print(f"[✓] 已生成 {OUT.relative_to(ROOT)}")
    print(f"    发音篇 {len(pron)} 讲（{hit} 讲含谐音表）| 语法篇 {len(gram)} 讲 | 共 {OUT.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
