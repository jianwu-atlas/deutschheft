from playwright.sync_api import sync_playwright
import sys

U = "http://127.0.0.1:8633/english.html"
errs, res = [], []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"]); pg = b.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(U, wait_until="networkidle", timeout=90000); pg.wait_for_timeout(800)

    res.append(("页面标题含「英语单词」", "英语单词" in pg.title()))
    n_sec = pg.locator(".en-sections .chip").count()
    res.append((f"Section 页签 {n_sec} 个", n_sec == 17))
    res.append((f"Part 页签 {pg.locator('.sc-einheiten .chip').count()} 个", pg.locator(".sc-einheiten .chip").count() >= 5))
    res.append((f"场景卡片 {pg.locator('.sc-scene').count()} 个", pg.locator(".sc-scene").count() > 0))
    nw = pg.locator(".en-word").count()
    res.append((f"词条 {nw} 个", nw > 50))
    res.append(("三行齐全（en / ipa / zh）",
                pg.locator(".en-word .en-en").count() > 0 and
                pg.locator(".en-word .s-pron").count() > 0 and
                pg.locator(".en-word .en-zh").count() > 0))
    first = pg.locator(".en-word").first
    res.append((f"首词英文：{first.locator('.en-en').inner_text().strip()[:20]}",
                len(first.locator(".en-en").inner_text().strip()) > 1))
    res.append((f"首词音标非空", len(first.locator(".s-pron").inner_text().strip()) > 1))
    res.append((f"首词中文非空", len(first.locator(".en-zh").inner_text().strip()) > 0))
    res.append((f"场景句 {pg.locator('.sc-turn').count()} 条", pg.locator(".sc-turn").count() > 5))

    # 切 Section / Part
    pg.locator(".en-sections .chip").nth(2).click(); pg.wait_for_timeout(700)
    res.append((f"切到「日常生活」得 {pg.locator('.sc-scene').count()} 场景", pg.locator(".sc-scene").count() > 5))
    pg.locator(".sc-einheiten .chip").nth(2).click(); pg.wait_for_timeout(700)
    res.append((f"切 Part 后 {pg.locator('.sc-scene').count()} 场景", pg.locator(".sc-scene").count() > 0))

    # 隐藏中文
    pg.click("#enHideZh"); pg.wait_for_timeout(500)
    vis = pg.locator(".en-word .en-zh").first.is_visible()
    res.append((f"隐藏中文自测生效（visible={vis}）", not vis))
    pg.click("#enHideZh"); pg.wait_for_timeout(300)

    # 朗读
    pg.evaluate("() => { window.__spoken=[]; speechSynthesis.speak = u => window.__spoken.push(u.text); speechSynthesis.cancel=()=>{}; }")
    pg.locator(".en-word .s-speak").first.click(); pg.wait_for_timeout(300)
    sp = pg.evaluate("() => window.__spoken")
    res.append((f"词条 🔊 触发：{sp[:1]}", len(sp) > 0))

    # 教材页入口
    pg.goto("http://127.0.0.1:8633/lehrbuch.html", wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(600)
    lnk = pg.locator('a[href="english.html"]')
    res.append((f"教材页「单词精读」入口 {lnk.count()} 个", lnk.count() == 1))
    if lnk.count():
        lnk.first.click(); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(700)
        res.append((f"点击后进入 english.html（场景 {pg.locator('.sc-scene').count()} 个）",
                    "english.html" in pg.url and pg.locator(".sc-scene").count() > 0))
    b.close()

print("\n=== 英语单词页验证 ===")
ok = True
for n, v in res:
    print(f"  {'✅' if v else '❌'} {n}"); ok = ok and v
print("\nJS 错误:", errs[:4] if errs else "无 ✅")
sys.exit(0 if ok and not errs else 1)
