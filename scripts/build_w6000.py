#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_w6000.py · 蒸馏《德国 6000 中级词汇》→ assets/js/data/w6000.js

源 PDF（**有完整文本层，无需 OCR**，96 页）：
  /Volumes/jianwu/1_个人_Personal/1_语言学习_Languages/德语_硬盘备份/中级常用德语词汇6000词 PDF版本可打印.pdf

条目格式（异构）：
  名词   ： das Abenteuer, = 冒险 / Abart f 变种 / Aal m -(e)s;-e 鳗
  动词   : eingehen vi 到达 / abbiegen 转向 / kritisieren A 评价
  形容词 : abhängig adj 不独立的 / eingehend adj 详细的
  副词   : anschließend adv 紧接着
  地名   : Armenien 亚美尼亚，Jerewan 埃里温 / Mali 马里，Bamako 巴马科
  短语   : keine Ahnung 不知道 / Lehrer im Hauptberuf 专职教师

产出数据模型（每条）：
  { w: 德文主词(归一化去连字符/小写化判定), t: 词性(noun/verb/adj/adv/place/phrase/mixed),
    inf: 变位/单复数提示, zh: 中文释义 }

⚠️ 课外参考书：meta.extra=true，词汇**不计入** wortliste.js / VOCAB（同 sucheng/english 约束）。
运行：/Users/Jack/opt/anaconda3/bin/python3 scripts/build_w6000.py（pypdf 在 anaconda）
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "js" / "data" / "w6000.js"
PDF = Path("/Volumes/jianwu/1_个人_Personal/1_语言学习_Languages/德语_硬盘备份/中级常用德语词汇6000词 PDF版本可打印.pdf")

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("需要 pypdf：请用 anaconda 解释器运行")

POS = {
    "m": "noun", "f": "noun", "n": "noun", "pl": "noun", "m,f": "noun", "mf": "noun",
    "vi": "verb", "vt": "verb", "v": "verb", "vi/vt": "verb", "vt/vi": "verb",
    "intrans": "verb", "trans": "verb", "refl": "verb", "v sich": "verb",
    "adj": "adj", "adj.": "adj", "adv": "adv", "adv.": "adv",
    "pron": "mixed", "prep": "mixed", "konj": "mixed", "art": "mixed", "part": "mixed",
}
GENDERS = {"m": "der", "f": "die", "n": "das"}
# 常见动词结尾（用于「无 POS 标记的小写词」判定为动词）
VERB_END = re.compile(r"(en|ieren|ern|eln|eln|eln|eln)$")

HDR = re.compile(r"^德国\s*6000\s*中级词汇")
CJK = r"[\u4e00-\u9fff]"


def first_cjk_idx(s: str) -> int:
    m = re.search(CJK, s)
    return m.start() if m else -1


def norm_headword(tok: str) -> str:
    # 去连字符（ab-biegen → abbiegen）、去首尾标点
    return tok.replace("-", "").strip(".,;:()")


def classify(front: str) -> tuple:
    """front = 首个 CJK 之前的德文部分。返回 (headword, type, inf)"""
    toks = front.split()
    if not toks:
        return ("", "mixed", "")
    # 冠词开头：das/der/die Word ...
    if toks[0] in ("das", "der", "die") and len(toks) > 1:
        hw = norm_headword(toks[1])
        rest = toks[2:]
    else:
        hw = norm_headword(toks[0])
        rest = toks[1:]
    if not hw:
        return ("", "mixed", "")

    # POS / 性别标记
    typ = "mixed"
    inf_bits = []
    for r in rest:
        rr = r.strip().lower().rstrip(".,")
        if rr in POS:
            typ = POS[rr]
        elif rr in GENDERS:
            typ = "noun"
        elif re.fullmatch(r"[-:(]=?[a-z;\-()]*", r) and len(r) <= 8:  # 变位片段如 -(e)s ; -en :e
            inf_bits.append(r)
        elif r.strip() in ("A", "a"):  # 常见 OCR 噪声标记，丢弃
            pass
        else:
            # 可能是变位/复数说明（含拉丁字母且短），归入 inf
            if len(r) <= 12 and not re.search(CJK, r):
                inf_bits.append(r)
    # 无标记的小写词 + 动词结尾 → verb
    if typ == "mixed":
        if hw[0].islower():
            # 源书小写无标记多为动词/副词；有动词结尾→verb，否则保守 mixed
            if re.search(r"(en|ieren|ern)$", hw):
                typ = "verb"
        else:
            typ = "noun"  # 大写无标记多为名词
    return (hw, typ, " ".join(inf_bits).strip())


def looks_like_place(hw: str, zh: str) -> bool:
    # 仅「国名/城市 + 中文，拉丁城市音译」结构判为地名（严格，避免误吞名词）
    if hw[0].isupper() and len(hw.split()) <= 2:
        if re.search(r"[，,]\s*[A-ZÀ-Ö][a-züöäß]+\b", zh) or re.search(r"[，,]\s*[A-ZÀ-Ö]", zh):
            return True
    return False


def main() -> int:
    r = PdfReader(str(PDF))
    all_lines = []
    for pg in r.pages:
        for raw in (pg.extract_text() or "").split("\n"):
            line = raw.strip()
            if not line or HDR.match(line):
                continue
            all_lines.append(line)

    # 分条：拉丁字母开头 = 新条目，否则并入上一条（动词释义折行）
    entries = []
    for line in all_lines:
        h = line[0]
        if ("a" <= h.lower() <= "z") or h in "äöüßÄÖÜ":
            entries.append([line])
        elif entries:
            entries[-1].append(line)
        else:
            entries.append([line])

    words = []
    stats = {"total": 0, "by_type": {}, "no_zh": 0, "no_head": 0}
    for e in entries:
        full = " ".join(e)
        ci = first_cjk_idx(full)
        if ci < 0:
            stats["no_zh"] += 1
            continue
        front = full[:ci].strip()
        zh = full[ci:].strip()
        hw, typ, inf = classify(front)
        if not hw:
            stats["no_head"] += 1
            continue
        if looks_like_place(hw, zh) and typ in ("mixed", "noun"):
            typ = "place"
        # 短语：主词是多词（含空格）且非地名
        if " " in full[:ci] and typ == "mixed" and len(front.split()) >= 3:
            # 前部（去冠词后）≥3 词 → 短语
            typ = "phrase"
        zh = re.sub(r"\s+", " ", zh).strip()
        # 质量过滤：主词≥2 字、zh 必含中文、去单字母折行碎片
        if len(hw) < 2 or not re.search(CJK, zh):
            stats["dropped_junk"] = stats.get("dropped_junk", 0) + 1
            continue
        # 去 zh 尾部黏连的孤立拉丁（OCR 残留），保留含 CJK 主体
        words.append({"w": hw, "t": typ, "inf": inf, "zh": zh})
        stats["total"] += 1
        stats["by_type"][typ] = stats["by_type"].get(typ, 0) + 1

    # 去重（主词小写 + zh 相同）
    seen = set()
    uniq = []
    for w in words:
        k = (w["w"].lower(), w["zh"])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(w)

    data = {
        "meta": {
            "title": "德国 6000 中级词汇",
            "subtitle": "中级常用德语词汇速查（名词 / 动词 / 形容词 / 副词 / 地名 / 短语）",
            "source": "《德国 6000 中级词汇》v1.0（96 页 PDF 文本层蒸馏）",
            "extra": True,          # 课外参考书：不进 wortliste / VOCAB
            "count": len(uniq),
            "types": stats["by_type"],
        },
        "words": uniq,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "// ⚠️ 脚本生成，勿手改：python3 scripts/build_w6000.py\n"
        "// 课外参考书（extra:true）——词汇不计入 wortliste.js / VOCAB\n"
        "window.W6000 = " + json.dumps(data, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"[✓] 写出 {OUT.name}  条目 {len(uniq)}（raw {stats['total']}，no_zh {stats['no_zh']}，no_head {stats['no_head']}）")
    print("    词性分布:", stats["by_type"])
    print(f"    体积: {OUT.stat().st_size/1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
