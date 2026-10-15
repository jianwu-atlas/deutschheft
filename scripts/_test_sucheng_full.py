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
    res.append(("场景页签默认激活", "on" in (pg.locator(".sc-tabs .chip").first.get_attribute("class") or "")))
    res.append((f"场景卡片 {pg.locator('.sc-scene').count()} 个", pg.locator(".sc-scene").count() == 8))
    res.append((f"会话区块 {pg.locator('.sc-dialog').count()} 个", pg.locator(".sc-dialog").count() > 0))
    res.append((f"会话轮 {pg.locator('.sc-turn').count()} 个", pg.locator(".sc-turn").count() > 10))
    res.append((f"说话人徽章 {pg.locator('.sc-spk').count()} 个", pg.locator(".sc-spk").count() > 5))

    # 发音篇
    pg.locator('.sc-tabs .chip[data-tab="pron"]').click(); pg.wait_for_timeout(500)
    n_pron = pg.locator(".sc-extra").count()
    res.append((f"发音篇 {n_pron} 讲", n_pron == 7))
    res.append(("发音篇有表格或正文", pg.locator(".sc-extra .sc-md").first.inner_text().strip() != ""))

    # 语法篇
    pg.locator('.sc-tabs .chip[data-tab="gram"]').click(); pg.wait_for_timeout(500)
    n_gram = pg.locator(".sc-extra").count()
    res.append((f"语法篇 {n_gram} 讲", n_gram == 9))
    res.append((f"语法篇表格 {pg.locator('.sc-md-table').count()} 个", pg.locator(".sc-md-table").count() > 3))

    # 回场景页签 + 隐藏中文
    pg.locator('.sc-tabs .chip[data-tab="scene"]').click(); pg.wait_for_timeout(400)
    pg.click("#scHideZh"); pg.wait_for_timeout(400)
    vis = pg.locator(".sc-turn-body .s-zh").first.is_visible() if pg.locator(".sc-turn-body .s-zh").count() else True
    res.append((f"隐藏中文对会话也生效（visible={vis}）", not vis))

    # 朗读
    pg.evaluate("() => { window.__spoken=[]; speechSynthesis.speak = u => window.__spoken.push(u.text); speechSynthesis.cancel=()=>{}; }")
    pg.locator(".sc-turn .s-speak").first.click(); pg.wait_for_timeout(300)
    res.append((f"会话 🔊 触发：{pg.evaluate('() => window.__spoken')[:1]}", len(pg.evaluate("() => window.__spoken")) > 0))
    b.close()

print("\n=== 精读页（含会话/发音/语法）验证 ===")
ok = True
for n, v in res:
    print(f"  {'✅' if v else '❌'} {n}"); ok = ok and v
print("\nJS 错误:", errs[:4] if errs else "无 ✅")
sys.exit(0 if ok and not errs else 1)
