#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_check_logo.py · 本地验证金印 D 版 logo：SVG 内容 / 引用版本 / 导航 mark 渲染（13 项断言）

⚠️ 必须用 anaconda 解释器运行（受管 python 无 playwright）：
   先 pack_site.py 出 dist，再 /Users/Jack/opt/anaconda3/bin/python3 scripts/_check_logo.py
"""
import io
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def gold_count(im, target, tol=40):
    px = im.load()
    W, H = im.size
    n = 0
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            r, g, b = px[x, y][:3]
            if abs(r - target[0]) <= tol and abs(g - target[1]) <= tol and abs(b - target[2]) <= tol:
                n += 1
    return n


def main() -> int:
    ok = fail = 0

    def check(name, cond, detail=""):
        nonlocal ok, fail
        if cond:
            ok += 1
            print(f"  [PASS] {name}")
        else:
            fail += 1
            print(f"  [FAIL] {name} {detail}")

    svg_text = (DIST / "assets" / "img" / "favicon.svg").read_text(encoding="utf-8")
    check("favicon.svg 为金印 D 版（#201B14 方块 + 金 #C9A227 D + 三点 + jwlab）",
          "#201B14" in svg_text and "#C9A227" in svg_text and ">D</text>" in svg_text
          and "jwlab" in svg_text and "#2456A6" in svg_text
          and "#B03048" in svg_text and "#2E7D5B" in svg_text, svg_text[:120])
    check("favicon.svg 无水墨天鹅残留（#BEC09D/德/语/De Yu）",
          not any(t in svg_text for t in ("#BEC09D", ">德</text>", ">语</text>", ">De</text>", ">Yu</text>")))
    check("favicon-mark.svg 已删除", not (DIST / "assets" / "img" / "favicon-mark.svg").exists())

    og_text = (DIST / "assets" / "img" / "og-image.svg").read_text(encoding="utf-8")
    check("og-image.svg 金印 D 印章 + 保留 MEIN DEUTSCHEFT wordmark",
          "#C9A227" in og_text and ">D</text>" in og_text and "DEUTSCHHEFT" in og_text)
    check("og-image.svg 无水墨天鹅残留（#BEC09D/德）",
          not any(t in og_text for t in ("#BEC09D", ">德</text>")))

    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": 1280, "height": 360})

        for page in ("index.html", "wortschatz.html"):
            pg.goto((DIST / page).as_uri())
            pg.wait_for_timeout(500)

            fav_href = pg.eval_on_selector(
                "link[rel='icon'][type='image/svg+xml']", "el => el.href")
            check(f"{page}: favicon 引用带 ?v=34", "?v=34" in fav_href, fav_href)

            bg = pg.eval_on_selector(
                ".brand-mark", "el => getComputedStyle(el).backgroundImage")
            check(f"{page}: 导航品牌 mark 指向 favicon.svg?v=34",
                  "favicon.svg?v=34" in bg, bg)
            mw = pg.eval_on_selector(
                ".brand-mark", "el => Math.round(el.getBoundingClientRect().width)")
            check(f"{page}: mark 尺寸回退到 34px", mw == 34, f"{mw}px")

        pg.goto((DIST / "index.html").as_uri())
        pg.wait_for_timeout(500)
        pg.screenshot(path="/tmp/de_logo_header.png",
                     clip={"x": 0, "y": 0, "width": 1280, "height": 70})
        br.close()

    imgs = (ROOT / "assets" / "img")
    mark512 = Image.open(imgs / "logo-mark-512.png").convert("RGB")
    g = gold_count(mark512, (201, 162, 39))
    d = gold_count(mark512, (32, 27, 20), tol=30)
    check("logo-mark-512 含金印 D（金像素充足）", g > 300, f"gold={g}")
    check("logo-mark-512 含墨黑方块底（暗像素充足）", d > 8000, f"dark={d}")
    bitmaps = ["favicon-16.png", "favicon-32.png", "favicon-48.png", "apple-touch-icon.png",
               "icon-192.png", "icon-512.png", "icon-512-maskable.png", "logo-mark-512.png", "og-image.png"]
    missing = [b for b in bitmaps if not (imgs / b).exists()]
    og_size = Image.open(imgs / "og-image.png").size
    check("9 个位图齐全且 og-image.png 为 1200×630", not missing and og_size == (1200, 630),
          f"missing={missing} og={og_size}")

    print(f"logo 检查：{ok} 通过 / {fail} 失败（头部截图 /tmp/de_logo_header.png）")
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
