#!/usr/bin/env python3
"""gen_text_audio.py · 用微软 Edge TTS 预生成课文德语 MP3（speecher 同款神经语音，免费、无 key）

产出（相对站点根）：
  assets/audio/textes/{id}_p{n}.mp3   逐段（n=1 起，对齐课文「逐段中德对照」）
  assets/audio/textes/{id}_full.mp3    整篇
  assets/audio/textes/manifest.json    清单（页面可据此判断哪段有 MP3）

音色：默认 de-DE-KatjaNeural（= speecher 的 Lena，女声）。
改男声：TTS_VOICE=de-DE-KillianNeural（= Tobias）
语速：TTS_RATE="-5%"（默认略放慢，便于学习；0% 正常）

依赖：edge-tts（python）+ node（提取 TEXTS）。
运行：python3 scripts/gen_text_audio.py
"""
import json, os, shutil, subprocess, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # deutschheft/
DATA = ROOT / "assets/js/data/deutsch-data.js"
OUTDIR = ROOT / "assets/audio/textes"
VOICE = os.environ.get("TTS_VOICE", "de-DE-KatjaNeural")
RATE = os.environ.get("TTS_RATE", "-5%")
EDGE = shutil.which("edge-tts") or "/Users/Jack/.workbuddy-ai/binaries/python/envs/deutsch-tts/bin/edge-tts"


def dump_texts() -> list:
    """用 node 加载 deutsch-data.js（纯数据），导出 TEXTS 的德语片段为 JSON。"""
    script = f"""
    const fs=require("fs");
    const code=fs.readFileSync({str(DATA)!r},"utf8");
    eval(code + "\\n;process.stdout.write(JSON.stringify(TEXTS.map(t=>({{id:t.id,title:t.de,paras:t.paragraphs.map(p=>p.de)}}))));");
    """
    r = subprocess.run(["node", "-e", script], capture_output=True, text=True, cwd=str(ROOT))
    if r.returncode != 0:
        print("❌ node 提取 TEXTS 失败：", r.stderr, file=sys.stderr)
        sys.exit(1)
    return json.loads(r.stdout.strip())


def gen(text: str, out: Path) -> bool:
    cmd = [EDGE, f"--voice={VOICE}", f"--rate={RATE}", "--text", text, "--write-media", str(out)]
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0 or not out.exists() or out.stat().st_size < 500:
        print(f"   ⚠️  生成失败 {out.name}: {p.stderr.strip()[:200]}", file=sys.stderr)
        return False
    return True


def main():
    OUTDIR.mkdir(parents=True, exist_ok=True)
    want = [a for a in sys.argv[1:] if not a.startswith("-")]   # 可选：只生成指定课文 id（如 t3），留空则全部
    texts = [t for t in dump_texts() if not want or t["id"] in want]
    mpath = OUTDIR / "manifest.json"
    old = json.loads(mpath.read_text(encoding="utf-8")) if mpath.exists() else []
    manifest = [m for m in old if m.get("id") not in {t["id"] for t in texts}]   # 保留未重生课文的清单
    total = 0
    for t in texts:
        tid = t["id"]
        # 整篇
        full = " ".join(t["paras"])
        fpath = OUTDIR / f"{tid}_full.mp3"
        print(f"[{tid}] 整篇（{len(full)} 字符）…")
        if gen(full, fpath):
            manifest.append({"id": tid, "kind": "full", "file": f"assets/audio/textes/{tid}_full.mp3"})
            total += 1
        time.sleep(0.3)
        # 逐段
        for i, pde in enumerate(t["paras"], 1):
            ppath = OUTDIR / f"{tid}_p{i}.mp3"
            print(f"[{tid}] 段 {i:02d}（{len(pde)} 字符）…")
            if gen(pde, ppath):
                manifest.append({"id": tid, "kind": "para", "n": i, "file": f"assets/audio/textes/{tid}_p{i}.mp3"})
                total += 1
            time.sleep(0.3)
    manifest.sort(key=lambda m: (m["id"], m["kind"], m.get("n", 0)))
    mpath.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ 完成：{total} 个 MP3 → {OUTDIR}")
    print("   manifest:", mpath, f"（共 {len(manifest)} 条）")


if __name__ == "__main__":
    main()
