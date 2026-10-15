#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build_sucheng.py · 从 OCR 全文抽取《零基础德语速成》场景篇句型（三行格式）

产出：assets/js/data/sucheng.js  →  window.SUCHENG
      结构：parts[].scenes[].sentences[] = { de, zh, pron }

数据来源：~/.workbuddy/wiki-knowledge/raw/lingjichu-sucheng-ocr.txt

⚠️ 课外教材：SUCHENG.meta.extra = true
   其词汇**不得**进入 VOCAB / wortliste.js（见项目 MEMORY.md 长期规则）。
   脚本末尾会做一次自检（课外词是否混入 wortliste.js）。
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

RAW = Path.home() / ".workbuddy/wiki-knowledge/raw/lingjichu-sucheng-ocr.txt"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/js/data/sucheng.js"
WORTLISTE = ROOT / "assets/js/data/wortliste.js"

EINHEITEN = ["日常交际", "吃吃喝喝", "交通出行", "课堂内外", "聊天闲谈", "逛街购物",
             "情感世界", "房屋住宿", "生病就医", "公共服务", "德国节日", "休闲娱乐"]

# 官方目录的规范场景标题（OCR 标题噪声大，如「向路」「房肉设施」「背德基麦滥澇」，
# 故按 Einheit + 段序覆盖；与 ~/.workbuddy/wiki-knowledge 的 scenes/ 一致）
SCENE_TITLES: dict[str, list[str]] = {
    "日常交际": ["见面打招呼", "谢谢与道歉", "拜访和做客", "关心朋友", "聊一聊", "电话用语", "讨论天气", "日期和时间"],
    "吃吃喝喝": ["日常饮食", "餐馆就餐", "咖啡时间", "肯德基麦当劳"],
    "交通出行": ["问路", "入境通关", "坐公交车", "坐飞机", "坐出租车", "坐火车出行", "坐地铁", "自驾车"],
    "课堂内外": ["去德国学习", "学校住宿", "在图书馆", "学习计划", "上课期间", "考试", "学期结束"],
    "聊天闲谈": ["聊学习", "聊环境", "聊天气", "聊时间", "聊爱好", "聊工作"],
    "逛街购物": ["百货商店", "逛超市", "逛书店", "买衣服", "买鞋", "买家电家具", "买日常杂货"],
    "情感世界": ["约会", "谈恋爱", "求婚", "分手", "亲属关系"],
    "房屋住宿": ["租房", "宾馆住宿", "房内设施", "房间温度"],
    "生病就医": ["身体不舒服", "医院就医", "健康生活"],
    "公共服务": ["银行", "邮局", "理发店", "警局", "中国大使馆"],
    "德国节日": ["基督降临节", "狂欢节", "慕尼黑啤酒节", "复活节", "万圣节", "圣诞节"],
    "休闲娱乐": ["民谣", "音乐", "电影", "电视剧", "德国文学", "在博物馆", "努力运动"],
}

PAGE_RE = re.compile(r"^=+\s*PAGE\s*\d+\s*/\s*\d+\s*=+$")
NOISE_PREFIX = ("场景篇", "发音篇", "语法篇", "基础篇", "实用会话", "标准德语")
NOISE_EXACT = {"合话", "会话", "小贴士", "单词", "句子", "词汇", "迷你会话加深记忆",
               "熟悉场景必需的单词", "经典德语瞬间就学会", "实用会话实现交流零障碍"}
LATIN_RE = re.compile(r"[A-Za-zÄÖÜäöüß]")
CJK_RE = re.compile(r"[\u4e00-\u9fff]")
# 只由标点/符号/箭头组成 → 噪声
PUNCT_ONLY_RE = re.compile(r"^[^\w\u4e00-\u9fff]*$")

# ---------- OCR 清洗 ----------
# 常见字符替换（OCR 把 ü/ö/ä/ß 认成 ii/ui/o/a/B 等）——保守的定向替换表
FIX_TABLE = [
    (r"\bmiissten\b", "müssten"), (r"\bmissen\b", "müssen"), (r"\bmussten\b", "mussten"),
    (r"\bKuhlschrank\b", "Kühlschrank"), (r"\bKuhl\b", "kühl"),
    (r"\bweiB\b", "weiß"), (r"\bweiss\b", "weiß"), (r"\bweisst\b", "weißt"),
    (r"\bandern\b", "ändern"), (r"\bandert\b", "ändert"), (r"\bandern\b", "ändern"),
    (r"\bKochnbuch\b", "Kochbuch"), (r"\bfuir\b", "für"), (r"\bFuir\b", "Für"),
    (r"\bWirdest\b", "Würdest"), (r"\bwirdest\b", "würdest"),
    (r"\buberlege\b", "überlege"), (r"\buber\b", "über"), (r"\bUber\b", "Über"),
    (r"\bmochte\b", "möchte"), (r"\bmochten\b", "möchten"), (r"\bMochte\b", "Möchte"),
    (r"\bkonnen\b", "können"), (r"\bKonnen\b", "Können"), (r"\bkonnte\b", "könnte"),
    (r"\bKonnten\b", "Könnten"), (r"\bmoglich\b", "möglich"),
    (r"\bwahlen\b", "wählen"),
    (r"\bLust\b", "Lust"), (r"\bfur\b", "für"), (r"\bFur\b", "Für"),
    (r"\bKise\b", "Käse"), (r"\bSchiiler\b", "Schüler"),
]
FIX_RE = [(re.compile(p), r) for p, r in FIX_TABLE]
# 行首残留的题号 / OCR 杂字（如「2 Wirdest…」「在了tin Dann…」「3 Wer ist…」）
LEAD_NOISE_RE = re.compile(r"^\s*(?:\d{1,2}\s+|[在了]{1,3}\s*\S{0,6}\s+)")


def clean_de(s: str) -> str:
    s = LEAD_NOISE_RE.sub("", s.strip())
    for rx, rep in FIX_RE:
        s = rx.sub(rep, s)
    return re.sub(r"\s{2,}", " ", s).strip()


def split_de_zh(s: str) -> tuple[str, str]:
    """德文行里混进了中文（OCR 合并）→ 拆成 (德文, 中文)"""
    m = re.search(r"[\u4e00-\u9fff]", s)
    if not m or m.start() == 0:
        return s, ""
    return s[:m.start()].strip(), s[m.start():].strip()


# ---------- 会话（两行制：A/B 德文行 + 谐音行；中文翻译另列） ----------
# 说话人标记 OCR 会写成 ⑧ / ④ / a / b / 数字 / & ；统一归一化
SPK_FIX = {"⑧": "B", "④": "A", "&": "B", "b": "B", "a": "A", "®": "B", "©": "A", "®": "B"}
DE_SPK_RE = re.compile(r"^\s*([ABab1-9⑧④&®©])\s+(?=[A-Za-zÄÖÜäöüß])")
ZH_SPK_RE = re.compile(r"^\s*([ABab1-9⑧④&®©])\s*(?=[\u4e00-\u9fff])")
SESS_RE = re.compile(r"^会话\s*([一二三四五六七八九])\s*$")
DIALOG_END = ("词汇", "小贴士", "合话", "会话")


def is_latin_dominant(s: str) -> bool:
    """该行是否为「德语行」：拉丁为主、且不以中文开头"""
    s = s.strip()
    if not s or CJK_RE.match(s[0]):
        return False
    nl = len(LATIN_RE.findall(s))
    nc = len(CJK_RE.findall(s))
    return nl > 0 and nl >= nc


def norm_spk(s: str) -> str:
    s = s.strip()
    return SPK_FIX.get(s, s)


def parse_tips(block: list[str]) -> list[str]:
    """解析场景内的「小贴士」段 → 逐条要点文本（可能有多段）"""
    out: list[str] = []
    i = 0
    while i < len(block):
        if block[i].strip() == "小贴士":
            i += 1
            while i < len(block):
                s = block[i].strip()
                if (not s or s in ("小贴士", "合话", "会话", "迷你会话加深记忆", "词汇")
                        or re.match(r"^会话[一二三四五]", s)
                        or re.match(r"^(场景|Einheit)\s*\d*", s)
                        or PAGE_RE.match(s)
                        or s.startswith(NOISE_PREFIX)):
                    break
                if not PUNCT_ONLY_RE.match(s):
                    out.append(s)
                i += 1
            continue
        i += 1
    return merge_tips(out)


def merge_tips(raw: list[str]) -> list[str]:
    """合并 OCR 折行：上一行未以句末标点结尾 → 与当前行接续；
    以「句N:」开头的行一律视为新条目。"""
    out: list[str] = []
    for s in raw:
        if not out or re.match(r"^句\s*\d+\s*[:：]", s):
            out.append(s)
            continue
        if re.search(r"[。！？；]$", out[-1]):
            out.append(s)
        else:
            out[-1] = out[-1] + s          # 中文折行：行内不加空格
    # 去重（OCR 偶有重复）并丢弃超短残片（OCR 折行错位产生的孤字），保留原顺序
    seen, uniq = set(), []
    for s in out:
        if s in seen:
            continue
        if len(s) < 8 and not re.match(r"^句\s*\d+\s*[:：]", s):
            continue
        seen.add(s)
        uniq.append(s)
    return uniq


def parse_dialog(block: list[str]) -> list[dict]:
    """解析一个场景的「迷你会话」段 → [{title, turns:[{spk,de,pron,zh}]}]
    只取从首个「会话一」起的部分，避免把前面的单词表/小贴士误当对话。"""
    first = next((i for i, l in enumerate(block) if SESS_RE.match(l.strip())), None)
    if first is None:
        return []
    block = block[first:]
    # 按 会话一/二/三… 切分
    idx = [(i, SESS_RE.match(l.strip()).group(1)) for i, l in enumerate(block)
           if SESS_RE.match(l.strip())]
    if not idx:
        return []
    idx.append((len(block), ""))
    out = []
    for k in range(len(idx) - 1):
        a, name = idx[k]
        b = idx[k + 1][0]
        turns, zhs = [], []
        i = a + 1
        while i < b:
            s = block[i].strip()
            if is_noise(s):
                i += 1
                continue
            if (s in DIALOG_END or s.startswith(("词汇", "小贴士", "合话"))
                    or "小贴士" in s or "词汇" in s
                    or re.match(r"^(场景|Einheit)\s*\d*", s)):
                break
            # 中文翻译（带说话人标记）
            mz = ZH_SPK_RE.match(s)
            if mz:
                zhs.append({"spk": norm_spk(mz.group(1)), "zh": s[mz.end():].strip()})
                i += 1
                continue
            # 德语轮（拉丁为主）
            if not is_latin_dominant(s):
                i += 1
                continue
            spk, body = "", s
            md = DE_SPK_RE.match(s)
            if md:
                spk = norm_spk(md.group(1))
                body = s[md.end():].strip()
            body, zh_inline = split_de_zh(body)      # 德中混行 → 拆开
            body = clean_de(body)
            if zh_inline:
                zhs.append({"spk": spk, "zh": zh_inline})
            pron = ""
            if i + 1 < b:
                nxt = block[i + 1].strip()
                # 谐音行 = 非拉丁为主的下一行（多以中文开头，如「古藤 塔克」）
                if nxt and not is_noise(nxt) and not is_latin_dominant(nxt) and not ZH_SPK_RE.match(nxt):
                    pron = nxt
                    i += 1
            turns.append({"spk": spk, "de": clean_de(body), "pron": pron})
            i += 1
        # 德语轮与中文翻译按顺序对齐
        for j, t in enumerate(turns):
            t["zh"] = zhs[j]["zh"] if j < len(zhs) else ""
            if not t["spk"] and j < len(zhs):
                t["spk"] = zhs[j]["spk"]
        # 过滤噪声：真实对话轮至少两个词，且有说话人标记 / 中文 / 谐音 之一
        turns = [t for t in turns
                 if len(t["de"].split()) >= 2 and (t["spk"] or t["zh"] or t["pron"])]
        if turns:
            out.append({"title": f"会话{name}", "turns": turns})
    return out


def is_noise(line: str) -> bool:
    s = line.strip()
    if not s:
        return True
    if PAGE_RE.match(s):
        return True
    if s.startswith(NOISE_PREFIX):
        return True
    if re.match(r"^Einheit\b", s) or re.match(r"^Einheit\s*\d+", s):
        return True
    if s in NOISE_EXACT:
        return True
    if re.match(r"^\d{1,3}$", s):          # 页码 / 句号列
        return True
    if PUNCT_ONLY_RE.match(s):             # >>、〈<、≥ 177 之类
        return True
    if len(s) == 1 and not CJK_RE.match(s):
        return True
    return False


def classify(line: str) -> str:
    """de=以拉丁字母为主；zh=纯中文；pron=中文夹拉丁（或纯中文但上下文判为谐音）"""
    s = line.strip()
    if s and CJK_RE.match(s[0]):        # 以中文开头 → 中文行（zh 或 pron）
        return "zh"
    latin = len(LATIN_RE.findall(s))
    cjk = len(CJK_RE.findall(s))
    if latin and latin >= cjk:
        return "de"
    return "zh"          # 纯中文 或 中文为主 —— 具体是 zh 还是 pron 由上下文定


def parse_sentences(lines: list[str]) -> list[dict]:
    """按「德文 → 中文 → 谐音」三元组解析（句型段用）"""
    out: list[dict] = []
    cur: dict | None = None
    last_kind = None
    for raw in lines:
        if is_noise(raw):
            continue
        s = raw.strip()
        kind = classify(s)
        if kind == "de":
            de_part, zh_part = split_de_zh(s)      # 德中混行 → 拆开
            de_part = clean_de(de_part)
            if not de_part:
                continue
            if cur and cur.get("de") and not cur.get("zh") and last_kind == "de":
                cur["de"] = clean_de(cur["de"] + " " + de_part)   # 德文折行
            else:
                if cur and cur.get("de") and cur.get("zh"):
                    out.append(cur)
                cur = {"de": de_part, "zh": "", "pron": ""}
            last_kind = "de"
            if zh_part:                            # 同行还带中文
                cur["zh"] = zh_part
                last_kind = "zh"
        else:
            if cur is None:
                continue
            if last_kind == "de" and not cur["zh"]:
                cur["zh"] = s
                last_kind = "zh"
            elif last_kind == "zh" and not cur["pron"]:
                cur["pron"] = s
                last_kind = "pron"
            else:
                continue
    if cur and cur.get("de") and cur.get("zh"):
        out.append(cur)
    return [x for x in out if x["de"] and x["zh"]]


def main() -> int:
    text = RAW.read_text(encoding="utf-8", errors="ignore")
    lines = text.split("\n")

    # 只取「场景篇」正文（第二次出现 12 个 Einheit 标题起）
    starts = [i for i, l in enumerate(lines) if l.strip() == EINHEITEN[0]]
    body_start = starts[-1] if len(starts) > 1 else 0
    body = lines[body_start:]

    # 定位每个 Einheit 的起止
    marks: list[tuple[int, str]] = []
    for i, l in enumerate(body):
        t = l.strip()
        if t in EINHEITEN:
            marks.append((i, t))
    marks.append((len(body), "END"))

    parts = []
    total = 0
    total_dlg = 0
    total_tip = 0
    for k in range(len(marks) - 1):
        i0, name = marks[k]
        i1 = marks[k + 1][0]
        seg = body[i0:i1]

        # 以「经典德语瞬间就学会」段为切分依据（每个场景必有一段；标题可能被 OCR 写坏，
        # 如 `场罻S` / `场景萹`，故不依赖标题行）。场景序号 = 段序。
        SCEN_RE = re.compile(r"^场[景罻萹篇]\s*([0-9S])\s*(.*)$")
        markers = [i for i, l in enumerate(seg) if "经典德语瞬间就学会" in l]
        markers.append(len(seg))
        scenes = []
        for k in range(len(markers) - 1):
            mi = markers[k]
            blk_end = markers[k + 1]
            blk = seg[mi:blk_end]
            # 句子：块首之后直到终止标记
            sents: list[str] = []
            for m2 in blk[1:]:
                ms = m2.strip()
                if (ms in ("小贴士", "合话", "会话", "迷你会话加深记忆", "词汇")
                        or "迷你会话加深记忆" in ms
                        or re.match(r"^会话[一二三四五]", ms)
                        or re.match(r"^小贴士", ms)):
                    break
                sents.append(m2)
            parsed = parse_sentences(sents)
            dialog = parse_dialog(blk)
            tips = parse_tips(blk)
            if not parsed and not dialog:
                continue
            # 标题：优先用规范表（按段序），OCR 标题仅作兜底
            canon = SCENE_TITLES.get(name, [])
            title = canon[k] if k < len(canon) else ""
            ocr_title = ""
            for back in range(mi - 1, max(0, mi - 90), -1):
                m = SCEN_RE.match(seg[back].strip())
                if m:
                    num = "5" if m.group(1) == "S" else m.group(1)
                    if m.group(2).strip():
                        ocr_title = m.group(2).strip()
                    else:
                        for t in seg[back + 1:back + 5]:
                            tt = t.strip()
                            if (tt and not SCEN_RE.match(tt) and tt not in NOISE_EXACT
                                    and not tt.startswith("熟悉场景") and len(tt) < 20):
                                ocr_title = tt
                                break
                    break
            scenes.append({"scene": num, "zh": title or ocr_title,
                           "zhOcr": ocr_title if ocr_title != title else "",
                           "sentences": parsed,
                           "dialog": dialog,
                           "tips": tips})
            total += len(parsed)
            total_dlg += sum(len(d["turns"]) for d in dialog)
            total_tip += len(tips)
        if scenes:
            parts.append({"einheit": name, "scenes": scenes})

    # 生成 JS
    payload = {"meta": {"id": "sucheng", "zh": "零基础德语速成",
                        "de": "Deutsch-Schnellkurs für Anfänger",
                        "extra": True, "note": "课外教材；词汇不计入生词表"},
               "parts": parts}
    js = ("/* eslint-disable */\n"
          "// 由 scripts/build_sucheng.py 自动生成，请勿手改\n"
          "// 数据源：OCR 全文 + 原书「汉语谐音」列；课外教材，词汇不计入生词表\n"
          "const SUCHENG = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n")
    OUT.write_text(js, encoding="utf-8")

    print(f"[✓] 已生成 {OUT.relative_to(ROOT)}")
    print(f"    Einheit {len(parts)} 个 | 场景 {sum(len(p['scenes']) for p in parts)} 个 | 句型 {total} 句")
    print(f"    会话轮次合计：{total_dlg}")
    print(f"    小贴士合计：{total_tip} 条")
    for p in parts:
        print(f"      {p['einheit']}: {len(p['scenes'])} 场景 / "
              f"{sum(len(s['sentences']) for s in p['scenes'])} 句")

    # 自检：① 词表生成脚本仍按 extra 过滤课外教材；② 教材词未"新增"进词表
    gen = (ROOT / "scripts/gen_wortliste.js")
    if gen.exists():
        src = gen.read_text(encoding="utf-8")
        n = src.count("filter(b => !b.extra)") + src.count("filter(b=>!b.extra)")
        print(f"    自检① gen_wortliste.js 的 `!b.extra` 过滤：{n} 处 "
              f"{'✅' if n >= 2 else '❌ 缺失！课外词会污染词表'}")
    if WORTLISTE.exists():
        wl = WORTLISTE.read_text(encoding="utf-8", errors="ignore").lower()
        words = set()
        for p in parts:
            for s in p["scenes"]:
                for sent in s["sentences"]:
                    for w in re.findall(r"[A-Za-zÄÖÜäöüß]{4,}", sent["de"]):
                        words.add(w.lower())
        shared = sorted(w for w in words if f'"{w}"' in wl)
        # 与词表重合是正常的（aber / auch 等也来自课内语料）；
        # 关键约束是「教材不作为词表来源」，由自检①保证。
        print(f"    自检② 教材词 {len(words)} 个，其中 {len(shared)} 个也出现在词表"
              f"（来自课内语料，属正常）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
