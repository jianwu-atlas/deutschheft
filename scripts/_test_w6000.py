#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_test_w6000.py · 本地冒烟测试：w6000.html（6000 中级词汇速查）+ lehrbuch 入口
   先 pack_site.py 出 dist；用 anaconda 解释器运行。
   /Users/Jack/opt/anaconda3/bin/python3 scripts/_test_w6000.py
"""
import http.server
import socketserver
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
PORT = 8651
BASE = f"http://127.0.0.1:{PORT}"
errs = []


def main() -> int:
    # 本地静态服务
    handler = lambda *a, **k: http.server.SimpleHTTPRequestHandler(*a, directory=str(DIST), **k)
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    time.sleep(0.4)

    ok = fail = 0
    def check(name, cond, detail=""):
        nonlocal ok, fail
        if cond:
            ok += 1; print(f"  [PASS] {name}")
        else:
            fail += 1; print(f"  [FAIL] {name} {detail}")

    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))

        # ---- w6000.html ----
        pg.goto(BASE + "/w6000.html")
        pg.wait_for_timeout(700)

        check("无 JS 报错（w6000）", not errs, "; ".join(errs[:2]))
        check("总词数统计含 6609", "6609" in pg.inner_text("#w6Count"), pg.inner_text("#w6Count"))
        check("搜索框存在", pg.locator("#w6Search").count() == 1)
        check("词性筛选 chips = 8", pg.locator(".w6-types .chip").count() == 8)
        n_rows = pg.locator(".w6-row").count()
        check(f"初始渲染 {n_rows} 行（应=400）", n_rows == 400, str(n_rows))
        check("显示更多按钮存在", pg.locator("#w6More").count() == 1)
        check("首行含德文词 + 中文释义", pg.locator(".w6-row .w6-w").first.count() >= 1)

        # 搜索德文
        pg.fill("#w6Search", "verlieren")
        pg.wait_for_timeout(400)
        check("搜索 verlieren → 命中若干行", 1 <= pg.locator(".w6-row").count() < 20, str(pg.locator(".w6-row").count()))
        check("verlieren 结果含中文「丢失/输」", any(c in pg.inner_text(".w6-list") for c in ("丢失", "输")))

        # 搜索中文
        pg.fill("#w6Search", "冒险")
        pg.wait_for_timeout(400)
        check("搜索中文「冒险」→ 命中", pg.locator(".w6-row").count() >= 1, str(pg.locator(".w6-row").count()))

        # 清空 + 词性筛选：动词
        pg.fill("#w6Search", "")
        pg.wait_for_timeout(300)
        pg.click(".w6-types .chip[data-t='verb']")
        pg.wait_for_timeout(400)
        verbs = pg.locator(".w6-row").count()
        check("筛选「动词」→ 行数在 400 附近（1202 全量）", 100 <= verbs <= 400, str(verbs))
        check("动词徽章可见", pg.locator(".w6-t.t-verb").count() >= 1)

        # 切回全部
        pg.click(".w6-types .chip[data-t='all']")
        pg.wait_for_timeout(300)

        # 显示更多
        pg.click("#w6More")
        pg.wait_for_timeout(300)
        check("「显示更多」后行数增加", pg.locator(".w6-row").count() == 800, str(pg.locator(".w6-row").count()))

        pg.screenshot(path="/tmp/w6000_shot.png", full_page=False)

        # ---- lehrbuch.html 入口 ----
        pg2 = br.new_page()
        pg2.on("pageerror", lambda e: errs.append("LB:" + str(e)))
        pg2.goto(BASE + "/lehrbuch.html")
        pg2.wait_for_timeout(700)
        btn = pg2.locator("a[href='w6000.html']")
        check("教材页有「词汇速查」入口 → w6000.html", btn.count() == 1, f"count={btn.count()}")
        check("入口文案为 词汇速查", "词汇速查" in btn.first.inner_text())
        check("6000 词条目在课外组（extra）", "德国 6000 中级词汇" in pg2.inner_text("#app"))

        br.close()

    httpd.shutdown()
    print(f"w6000 检查：{ok} 通过 / {fail} 失败（截图 /tmp/w6000_shot.png）")
    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
