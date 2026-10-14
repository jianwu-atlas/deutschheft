#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""pack_site.py · 打包可部署的静态站点

把「真正要发布的文件」复制到 dist/，用于：
  · 腾讯 EdgeOne Pages（国内可访问，免备案）
  · 任何静态托管（Cloudflare Pages / Vercel / 对象存储 …）

用法：python3 scripts/pack_site.py
产出：dist/    ← 把这个目录发布出去即可

只打包站点资源（*.html + assets/ + robots.txt + sitemap.xml），
不含 .git / content-notion / scripts / AGENTS.md 等开发文件。
"""
from pathlib import Path
import json
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def main() -> int:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    pages = sorted(ROOT.glob("*.html"))
    for p in pages:
        shutil.copy2(p, DIST / p.name)
    for name in ("robots.txt", "sitemap.xml", "sw.js", "manifest.webmanifest"):
        f = ROOT / name
        if f.exists():
            shutil.copy2(f, DIST / name)
    shutil.copytree(ROOT / "assets", DIST / "assets")

    # 清理系统垃圾文件
    for junk in DIST.rglob(".DS_Store"):
        junk.unlink()

    # PWA：把全量文件清单注入 sw.js / offline.js，供「离线缓存」按钮一次性下载全站
    all_files = sorted(
        "./" + str(p.relative_to(DIST)).replace("\\", "/")
        for p in DIST.rglob("*") if p.is_file()
    )
    sw = DIST / "sw.js"
    if sw.exists():
        txt = sw.read_text(encoding="utf-8").replace('"__ALL__"', json.dumps(all_files, ensure_ascii=False))
        sw.write_text(txt, encoding="utf-8")
    oj = DIST / "assets" / "js" / "offline.js"
    if oj.exists():
        txt = oj.read_text(encoding="utf-8")
        txt = txt.replace(
            "(function () {",
            "(function () {\n  window.__DH_SW_FILES = " + json.dumps(all_files, ensure_ascii=False) + ";",
            1)
        oj.write_text(txt, encoding="utf-8")

    size = sum(f.stat().st_size for f in DIST.rglob("*") if f.is_file())
    print(f"[✓] 已打包到 {DIST}")
    print(f"    页面：{len(pages)} 个")
    print(f"    体积：{size / 1024 / 1024:.1f} MB")
    print()
    print("发布方式：")
    print("  · EdgeOne Pages —— 把 dist/ 交给部署工具（同名项目覆盖发布，网址不变）")
    print("  · 本地预览     —— cd dist && python3 -m http.server 8631 --bind 127.0.0.1")
    return 0


if __name__ == "__main__":
    sys.exit(main())
