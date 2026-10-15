#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_check_logo.py · 本地验证水墨天鹅 logo：SVG 内容 / 引用版本 / 导航 mark 渲染（11 项断言）

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
    check("favicon.svg 为水墨天鹅版（灰绿 #BEC09D + 墨色 #222222 + 德/语 + De Yu）",
          "#BEC09D" in svg_text and "#222222" in svg_text
          and ">德</text>" in svg_text and ">语</text>" in svg_text
          and ">De</text>" in svg_text and ">Yu</text>" in svg_text, svg_text[:120])
    check("favicon.svg 无旧 D 印章残留（#201B14/#C9A227 印章 rect/jwlab）",
          not any(t in svg_text for t in ("#201B14", "rx=\"118\"", "jwlab")))

    og_text = (DIST / "assets" / "img" / "og-image.svg").read_text(encoding="utf-8")
    check("og-image.svg 换成水墨天鹅 + 保留 MEIN DEUTSCHEHEFT wordmark",
          "ogink" in og_text and ">德</text>" in og_text and "DEUTSCHHEFT" in og_text)

    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": 1280, "height": 360})

        for page in ("index.html", "wortschatz.html"):
            pg.goto((DIST / page).as_uri())
            pg.wait_for_timeout(500)

            fav_href = pg.eval_on_selector(
                "link[rel='icon'][type='image/svg+xml']", "el => el.href")
            check(f"{page}: favicon 引用带 ?v=33", "?v=33" in fav_href, fav_href)

            bg = pg.eval_on_selector(
                ".brand-mark", "el => getComputedStyle(el).backgroundImage")
            check(f"{page}: 导航品牌 mark 指向新 svg（?v=33）", "favicon.svg?v=33" in bg, bg)

            box = pg.eval_on_selector(
                ".brand-mark",
                "el => { const r = el.getBoundingClientRect();"
                " return {x: r.x, y: r.y, width: r.width, height: r.height}; }")
            shot = pg.screenshot(clip=box)
            im = Image.open(io.BytesIO(shot)).convert("RGBA")
            W, H = im.size
            # mark 34px ≈ svg 400 → px = svg/400*W
            def px_at(sx, sy):
                return im.getpixel((int(sx / 400 * W), int(sy / 400 * H)))
            sage = px_at(184, 140)   # 灰绿圆内
            check(f"{page}: mark 内灰绿圆像素正确",
                  140 < sage[0] < 230 and abs(sage[0] - sage[1]) < 25 and sage[2] < sage[1] - 15, str(sage))

        pg.goto((DIST / "index.html").as_uri())
        pg.wait_for_timeout(500)
        pg.screenshot(path="/tmp/de_logo_header.png",
                     clip={"x": 0, "y": 0, "width": 1280, "height": 70})
        br.close()

    imgs = (ROOT / "assets" / "img")
    # 512 渲染图：山水线墨色（34px mark 下线宽 <1px 被抗锯齿稀释，不在浏览器断言）
    mark512 = Image.open(imgs / "logo-mark-512.png").convert("RGBA")
    ink = mark512.getpixel((int(260 / 400 * 512), int(197 / 400 * 512)))
    check("logo-mark-512 山水线墨色像素正确",
          ink[0] < 110 and ink[1] < 110 and ink[2] < 110, str(ink))
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
