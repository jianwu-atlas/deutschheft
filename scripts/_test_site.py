#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_test_site.py · 全站内容一致性冒烟测试（Playwright，需系统 Chrome）

用法：先 pack 出 dist 并起静态服务器，再
    /opt/anaconda3/bin/python3 scripts/_test_site.py http://127.0.0.1:8631

特点：断言值全部从页面数据层（LESSONS / TEXTS / GRAMMAR / QUIZZES / NOTION_NOTES）
动态读取，新增课程后无需改脚本里的数字。
覆盖：课程、课文、语法、练习、生词、Notion 笔记、首页统计、音频与移动端布局。
"""
import sys
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8631").rstrip("/")
fails, errors = [], []


def check(name, cond, extra=""):
    print(("  ✓ " if cond else "  ✗ ") + name + (f"  [{extra}]" if extra and not cond else ""))
    if not cond:
        fails.append(name)


with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append("console:" + m.text) if m.type == "error" else None)

    # ---- 数据层计数（一次取齐） ----
    pg.goto(BASE + "/index.html", wait_until="networkidle")
    D = pg.evaluate("""() => ({
      lessons: LESSONS.length,
      a12: LESSONS.filter(l => l.level === "A1.2").length,
      texts: TEXTS.length,
      grammar: GRAMMAR.length,
      quizzes: QUIZZES.length,
      questions: QUIZZES.reduce((a, q) => a + q.questions.length, 0),
      vocab: VOCAB.length,
      notes: NOTION_NOTES.length,
      lastLesson: LESSONS[LESSONS.length - 1].id,
      lastText: TEXTS[TEXTS.length - 1].id,
      lastGrammar: GRAMMAR[GRAMMAR.length - 1].id
    })""")
    print("  数据层:", D)

    # ---- 首页统计 ----
    stats = [x.strip() for x in pg.locator(".card.stat").all_inner_texts()]
    check("首页课程数与数据层一致", any(x.startswith(str(D["lessons"])) and "Lektionen" in x for x in stats), stats[:2])
    check("首页语法数与数据层一致", any(x.startswith(str(D["grammar"])) and "语法" in x for x in stats))
    check("首页课文数与数据层一致", any(x.startswith(str(D["texts"])) and "课文" in x for x in stats))
    check("首页笔记数与数据层一致", any(x.startswith(str(D["notes"])) and "Notion" in x for x in stats))
    check("首页重点为最新课", "Ein besonderer Fund im DNA-Labor" in pg.locator(".focus-box").inner_text())

    # ---- 课程页 ----
    pg.goto(BASE + "/lektionen.html", wait_until="networkidle")
    check("课程卡数 = LESSONS", pg.locator(".card.lesson").count() == D["lessons"], pg.locator(".card.lesson").count())
    check("A1.2 课程数一致", pg.locator(".card.lesson[id^=lesson-a2]").count() == D["a12"])
    last = pg.locator("#lesson-" + D["lastLesson"])
    check("最新课存在", last.count() == 1)
    check("最新课标题/日期", "Ein besonderer Fund im DNA-Labor" in last.inner_text() and "2026-11-11" in last.inner_text())
    check("最新课句型 8 条且带 IPA", last.locator("table.sentence-table tr").count() == 8 and last.locator(".s-ipa").count() == 8)

    # ---- 课文页 ----
    pg.goto(BASE + "/texte.html", wait_until="networkidle")
    check("课文页签数 = TEXTS", pg.locator(".text-tab").count() == D["texts"])
    meta = pg.evaluate("""() => {
      const t = TEXTS[TEXTS.length - 1];
      const ex = (window.TEXTE_EXTRA && window.TEXTE_EXTRA[t.id]) || {};
      const split = s => (s.match(/[^.!?]+[.!?]+[""'\\)\\]]*\\s*/g) || [s]).map(x => x.trim()).filter(Boolean);
      return { id: t.id, paras: t.paragraphs.length,
               sents: t.paragraphs.reduce((a, p) => a + split(p.de).length, 0),
               zhs: Object.values(ex).reduce((a, x) => a + (x.zhs || []).length, 0) };
    }""")
    print("  最新课文:", meta)
    check("默认打开最新课文", pg.locator(".text-tab.on").get_attribute("data-id") == meta["id"])
    check("段落数一致", pg.locator(".card.para").count() == meta["paras"])
    check("音标条数与句数一致", pg.locator("#textBody .s-ipa").count() == meta["sents"])
    check("逐句中文与句数一致", pg.locator("#textBody .s-zh").count() == meta["sents"] == meta["zhs"])
    pg.click("#toggleZh"); pg.wait_for_timeout(250)
    check("隐藏中文开关生效", pg.locator("#textBody.hide-zh").count() == 1)

    # ---- 语法页 ----
    pg.goto(BASE + "/grammatik.html", wait_until="networkidle")
    check("语法专题数 = GRAMMAR", pg.locator(".card.grammar-item").count() == D["grammar"])
    pg.locator("#g14 .grammar-head").click(); pg.wait_for_timeout(200)
    g14 = pg.locator("#g14").inner_text()
    check("最新语法专题含 war / hatte", "war" in g14 and "hatte" in g14)

    # ---- 练习页 ----
    pg.goto(BASE + "/uebungen.html", wait_until="networkidle")
    check("测验组数 = QUIZZES", pg.locator(".card.quiz-card").count() == D["quizzes"])
    check("题数合计 = 100", D["questions"] == 100, D["questions"])
    pg.locator('.quiz-card[data-id=q10]').click(); pg.wait_for_timeout(300)
    check("q10 题干与提示语", "Wo arbeitet Karim" in pg.locator(".quiz-qcard").inner_text()
          and "根据课文内容选择正确答案" in pg.locator(".quiz-qcard").inner_text())

    # ---- 生词表 ----
    pg.goto(BASE + "/wortschatz.html", wait_until="networkidle")
    pg.fill("#vSearch", "Gewächshaus"); pg.wait_for_timeout(350)
    check("新词可检索（Gewächshaus）", "Gewächshaus" in pg.locator("#vGrid").inner_text())
    pg.fill("#vSearch", "Arbeitsplan"); pg.wait_for_timeout(350)
    check("10-28 补词可检索（Arbeitsplan）", "Arbeitsplan" in pg.locator("#vGrid").inner_text())
    has_ap = pg.evaluate("() => !!VOCAB.find(v => v.de === 'der Arbeitsplan' && v.ipa)")
    check("Arbeitsplan 词卡带 IPA", has_ap)
    pg.fill("#vSearch", "Arbeitsplan"); pg.wait_for_timeout(350)
    check("10-28 补词可检索（Arbeitsplan）", "Arbeitsplan" in pg.locator("#vGrid").inner_text())
    has_ap = pg.evaluate("() => !!VOCAB.find(v => v.de === 'der Arbeitsplan' && v.ipa)")
    check("Arbeitsplan 词卡带 IPA", has_ap)
    wl = pg.evaluate("""() => ({
      total: WORTLISTE.length,
      ipa: WORTLISTE.filter(x => x.ipa).length,
      zh: WORTLISTE.filter(x => x.zh).length,
      form: WORTLISTE.find(x => x.w === "gewonnen") || null
    })""")
    has_new = pg.evaluate("() => !!WORTLISTE.find(x => x.w === 'gewächshaus')")
    check("全站词表含本课新词与变形", has_new and bool(wl["form"]))
    check("全站词表 IPA 100%", wl["ipa"] == wl["total"], (wl["ipa"], wl["total"]))
    check("全站词表中文 100%", wl["zh"] == wl["total"], (wl["zh"], wl["total"]))
    check("分词变形带音标与释义", bool(wl["form"] and wl["form"]["ipa"] and wl["form"]["zh"]), wl["form"])
    pg.locator('.vtab[data-tab="list"]').click(); pg.wait_for_timeout(400)
    rows = pg.locator("#vocabBody tr").count()
    check("全站词表视图有数据", rows > 50, rows)

    # ---- Notion 笔记 ----
    pg.goto(BASE + "/notion.html", wait_until="networkidle")
    check("笔记数 = NOTION_NOTES", pg.locator(".note-item").count() == D["notes"])
    first = pg.locator(".note-item").first
    check("最新笔记排首位", "Ein besonderer Fund im DNA-Labor" in first.inner_text() and "2026-11-11" in first.inner_text())
    check("默认展开最新笔记", "Ein besonderer Fund im DNA-Labor" in pg.locator("#noteReader .nr-title").inner_text())
    hs = pg.evaluate("() => [...document.querySelectorAll('.note-item')].map(e => Math.round(e.getBoundingClientRect().height))")
    check("笔记卡片等高", len(set(hs)) == 1, set(hs))

    # ---- 音频与移动端 ----
    r = pg.request.get(BASE + "/assets/audio/textes/t4_full.mp3")
    check("最新课文 MP3 可访问", r.status == 200 and len(r.body()) > 5000, (r.status, len(r.body())))
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(300)
    check("移动端无横向溢出", pg.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1"),
          pg.evaluate("() => document.documentElement.scrollWidth + ' / ' + window.innerWidth"))

    b.close()

print("\nJS 错误:", errors if errors else "无")
print("失败项:", fails if fails else "无")
sys.exit(1 if (fails or errors) else 0)
