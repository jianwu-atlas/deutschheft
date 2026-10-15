#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_test_w6000_ipa.py · 验证 w6000.html 在「音标：全部」下，w6000 词命中 PRON_W6000 → 生成 ruby.dh-ipa
   先 pack_site.py 出 dist；用 anaconda 解释器运行（受管 python 无 playwright）：
     /Users/Jack/opt/anaconda3/bin/python3 scripts/_test_w6000_ipa.py
   回归项：关闭模式应无任何 ruby.dh-ipa（证明是开关控制，而非常显）。
"""
import http.server
import socketserver
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
PORT = 8653
BASE = f"http://127.0.0.1:{PORT}"
errs = []


def main() -> int:
    if not DIST.exists():
        print("[ERROR] dist/ 不存在，请先运行 pack_site.py"); return 2

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

        # ---- A) 全部模式：w6000 词应命中 PRON_W6000 → ruby.dh-ipa ----
        ctx = br.new_context()
        ctx.add_init_script("localStorage.setItem('deutschheft_annotate','all')")
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(BASE + "/w6000.html")
        pg.wait_for_timeout(1500)

        check("无 JS 报错（全部模式）", not errs, "; ".join(errs[:2]))
        rows = pg.locator(".w6-row .w6-w").count()
        rubys = pg.locator(".w6-row .w6-w ruby.dh-ipa").count()
        check(f"全部模式：{rows} 行中 ≥50 个 w6 词带 IPA（ruby.dh-ipa）", rubys >= 50, f"rubys={rubys}")
        if rubys:
            ipa = pg.locator(".w6-row .w6-w ruby.dh-ipa").first.get_attribute("data-ipa")
            check("IPA 形如 [ˈ…]", bool(ipa) and ipa.startswith("[") and ipa.endswith("]"), repr(ipa))
        # 对照：课程词典 pron.js 里已有 IP 的词，之前「全部」就能命中（回归）
        pg.screenshot(path="/tmp/w6000_ipa_all.png", full_page=False)
        ctx.close()

        # ---- B) 关闭模式：不应有任何 ruby.dh-ipa（回归：开关控制） ----
        ctx2 = br.new_context()
        ctx2.add_init_script("localStorage.setItem('deutschheft_annotate','off')")
        pg2 = ctx2.new_page()
        pg2.goto(BASE + "/w6000.html")
        pg2.wait_for_timeout(1200)
        off_rubys = pg2.locator(".w6-row .w6-w ruby.dh-ipa").count()
        check("关闭模式：w6 词无 ruby.dh-ipa", off_rubys == 0, f"off_rubys={off_rubys}")
        ctx2.close()

        br.close()

    httpd.shutdown()
    print(f"w6000 IPA 检查：{ok} 通过 / {fail} 失败（截图 /tmp/w6000_ipa_all.png）")
    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
