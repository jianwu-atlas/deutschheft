from playwright.sync_api import sync_playwright
import sys

U = "http://127.0.0.1:8631/sucheng.html"
errs, res = [], []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"]); pg = b.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(U, wait_until="networkidle", timeout=60000); pg.wait_for_timeout(600)

    res.append(("顶层页签 3 个", pg.locator(".sc-tabs .chip").count() == 3))
    res.append((f"场景卡片 {pg.locator('.sc-scene').count()} 个", pg.locator(".sc-scene").count() == 8))
    res.append((f"句型块 {pg.locator('.sc-sent').count()} 个", pg.locator(".sc-sent").count() > 50))
    res.append((f"会话轮 {pg.locator('.sc-turn').count()} 个", pg.locator(".sc-turn").count() > 10))
    n_tips = pg.locator(".sc-tips").count()
    res.append((f"小贴士区块 {n_tips} 个", n_tips > 0))
    n_tip_li = pg.locator(".sc-tips li").count()
    res.append((f"小贴士条目 {n_tip_li} 条", n_tip_li > 0))
    res.append(("三行齐全（de/zh/pron）",
                pg.locator(".sc-sent .s-de").count() > 0 and
                pg.locator(".sc-sent .s-zh").count() > 0 and
                pg.locator(".sc-sent .s-pron").count() > 0))

    pg.click("#scHideZh"); pg.wait_for_timeout(400)
    vis = pg.locator(".sc-turn-body .s-zh").first.is_visible() if pg.locator(".sc-turn-body .s-zh").count() else True
    res.append((f"隐藏中文对会话生效（visible={vis}）", not vis))
    pg.click("#scHideZh"); pg.wait_for_timeout(300)

    pg.locator('.sc-tabs .chip[data-tab="pron"]').click(); pg.wait_for_timeout(500)
    n_pron = pg.locator(".sc-extra").count()
    res.append((f"发音篇 {n_pron} 讲", n_pron == 7))
    n_pt = pg.locator(".sc-extra .sc-md-table").count()
    res.append((f"发音篇谐音表 {n_pt} 张", n_pt >= 7))
    hdrs = " ".join(pg.locator(".sc-extra .sc-md-table tr").first.locator("th").all_inner_texts()) if n_pt else ""
    res.append((f"表头含「汉语谐音」：{hdrs[:26]}", "汉语谐音" in hdrs))

    pg.locator('.sc-tabs .chip[data-tab="gram"]').click(); pg.wait_for_timeout(500)
    res.append((f"语法篇 {pg.locator('.sc-extra').count()} 讲", pg.locator(".sc-extra").count() == 9))
    res.append((f"语法篇表格 {pg.locator('.sc-md-table').count()} 张", pg.locator(".sc-md-table").count() > 3))
    res.append(("有课内语法交叉链接", pg.locator('.sc-cross a[href="grammatik.html"]').count() == 1))

    pg.locator('.sc-tabs .chip[data-tab="scene"]').click(); pg.wait_for_timeout(400)
    pg.evaluate("() => { window.__spoken=[]; speechSynthesis.speak = u => window.__spoken.push(u.text); speechSynthesis.cancel=()=>{}; }")
    pg.locator(".sc-turn .s-speak").first.click(); pg.wait_for_timeout(300)
    res.append((f"会话 🔊 触发：{pg.evaluate('() => window.__spoken')[:1]}", len(pg.evaluate("() => window.__spoken")) > 0))
    b.close()

print("\n=== 精读页 P2 验证 ===")
ok = True
for n, v in res:
    print(f"  {'✅' if v else '❌'} {n}"); ok = ok and v
print("\nJS 错误:", errs[:4] if errs else "无 ✅")
sys.exit(0 if ok and not errs else 1)
