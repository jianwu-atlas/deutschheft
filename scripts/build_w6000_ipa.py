#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_w6000_ipa.py — 用 espeak-ng 为《德国 6000 中级词汇》(w6000) 批量生成德语 IPA（可断点续跑）。

背景：w6000 的 6609 词自身没有 IPA；全站「音标：全部」浮动开关(annotate.js)只标注能命中
课程词典 (pron.js, 仅 A1/A1.2) 的词，实测只覆盖 6%。本脚本用 espeak-ng (德语 G2P) 给
全部 w6000 词生成 IPA，产出独立词典 PRON_W6000，供 annotate.js 并入标注。

⚠️ 本环境 espeak-ng 每次调用约 1s，且外部看门狗会在 ~100s SIGKILL 掉命令。
因此脚本设计为**可断点续跑**：每次运行只处理 CHUNK 个未完成词，进度存
data/w6000_ipa_progress.json，反复运行直至全部完成，最后写出 w6000-ipa.js。

用法：
  python3 scripts/build_w6000_ipa.py            # 默认 CHUNK=350, WORKERS=8
  CHUNK=450 WORKERS=8 python3 scripts/build_w6000_ipa.py

输入：  assets/js/data/w6000.js   (window.W6000.words[].w)
输出：  assets/js/data/w6000-ipa.js   const PRON_W6000 = { "<原词>": "[ipa]", ... }
"""
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "assets", "js", "data", "w6000.js")
OUT = os.path.join(ROOT, "assets", "js", "data", "w6000-ipa.js")
PROG = os.path.join(ROOT, "data", "w6000_ipa_progress.json")
ESPEAK = "/opt/homebrew/bin/espeak-ng"
CHUNK = int(os.environ.get("CHUNK", "350"))
WORKERS = int(os.environ.get("WORKERS", "8"))


def load_unique_words():
    with open(SRC, encoding="utf-8") as f:
        txt = f.read()
    i = txt.find('"words"'); j = txt.find('[', i); k = txt.rfind(']')
    words = [w.get("w", "") for w in json.loads(txt[j:k + 1]) if w.get("w")]
    return list(dict.fromkeys(words))  # 去重保序


def gen_ipa(word):
    if not word:
        return (word, "")
    try:
        r = subprocess.run([ESPEAK, "-v", "de", "--ipa", word],
                           capture_output=True, text=True, timeout=10)
        out = re.sub(r"\([^)]*\)", "", (r.stdout or ""))   # 去 (en)/(de) 语音标签
        out = re.sub(r"\s+", " ", out).strip()
        return (word, ("[" + out + "]" if out else ""))
    except Exception:
        return (word, "")


def main():
    if not os.path.exists(ESPEAK):
        print(f"ESPEAK not found: {ESPEAK}", file=sys.stderr); sys.exit(1)
    uniq = load_unique_words()
    os.makedirs(os.path.dirname(PROG), exist_ok=True)
    prog = {}
    if os.path.exists(PROG):
        prog = json.load(open(PROG, encoding="utf-8"))

    todo = [w for w in uniq if w not in prog][:CHUNK]
    print(f"unique={len(uniq)}  done={len([w for w in uniq if w in prog])}/{len(uniq)}  "
          f"this_chunk={len(todo)}  workers={WORKERS}")
    if not todo:
        finalize(uniq, prog)
        return

    for i, (w, ipa) in enumerate(ThreadPoolExecutor(max_workers=WORKERS).map(gen_ipa, todo), 1):
        prog[w] = ipa  # 即使为空也标记完成，避免 espeak 失败词被无限重试（annotate.js put() 会跳过空值）
        if i % 50 == 0:
            json.dump(prog, open(PROG, "w", encoding="utf-8"), ensure_ascii=False)
            print(f"  {i}/{len(todo)} (saved)")
    json.dump(prog, open(PROG, "w", encoding="utf-8"), ensure_ascii=False)
    done = sum(1 for w in uniq if w in prog)
    print(f"  chunk done. progress {done}/{len(uniq)}  "
          + ("→ ALL COMPLETE, writing final file." if done == len(uniq) else f"→ run again ({len(uniq) - done} left)."))
    if done == len(uniq):
        finalize(uniq, prog)


def finalize(uniq, prog):
    ordered = {w: prog[w] for w in uniq if w in prog}
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// ⚠️ 脚本生成，勿手改：python3 scripts/build_w6000_ipa.py（可断点续跑）\n")
        f.write("// 《德国 6000 中级词汇》IPA（espeak-ng 德语 G2P，近似/示意音标）。\n")
        f.write("// 键=原词（annotate.js put() 会 toLowerCase，ß 保留）；供全站「音标」开关标注 w6000 词。\n")
        f.write("const PRON_W6000 = " + json.dumps(ordered, ensure_ascii=False) + ";\n")
    print(f"WROTE {os.path.relpath(OUT, ROOT)}  entries={len(ordered)}")
    for w in uniq[:200]:
        if w in ordered:
            print(f"  {w} → {ordered[w]}")


if __name__ == "__main__":
    main()
