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
      lastLessonDe: LESSONS[LESSONS.length - 1].de,
      lastLessonDate: LESSONS[LESSONS.length - 1].date,
      lastText: TEXTS[TEXTS.length - 1].id,
      lastGrammar: GRAMMAR[GRAMMAR.length - 1].id,
      lastGrammarTitle: GRAMMAR[GRAMMAR.length - 1].title,
      lastQuiz: QUIZZES[QUIZZES.length - 1].id,
      lastQuizQ0: QUIZZES[QUIZZES.length - 1].questions[0].q,
      lastQuizHint: QUIZZES[QUIZZES.length - 1].hint || "选择正确的德语形式",
      noteLatest: (() => {
        const s = NOTION_NOTES.slice().sort((a, b) =>
          String(b.classDate || b.date || "").localeCompare(String(a.classDate || a.date || "")));
        return { title: s[0].title, date: s[0].classDate || s[0].date || "" };
      })()
    })""")
    print("  数据层:", D)

    # ---- 首页统计 ----
    stats = [x.strip() for x in pg.locator(".card.stat").all_inner_texts()]
    check("首页课程数与数据层一致", any(x.startswith(str(D["lessons"])) and "Lektionen" in x for x in stats), stats[:2])
    check("首页语法数与数据层一致", any(x.startswith(str(D["grammar"])) and "语法" in x for x in stats))
    check("首页课文数与数据层一致", any(x.startswith(str(D["texts"])) and "课文" in x for x in stats))
    check("首页笔记数与数据层一致", any(x.startswith(str(D["notes"])) and "Notion" in x for x in stats))
    check("首页重点为最新课", D["lastLessonDe"] in pg.locator(".focus-box").inner_text(), D["lastLessonDe"])

    # ---- 课程页 ----
    pg.goto(BASE + "/lektionen.html", wait_until="networkidle")
    check("课程卡数 = LESSONS", pg.locator(".card.lesson").count() == D["lessons"], pg.locator(".card.lesson").count())
    check("A1.2 课程数一致", pg.locator(".card.lesson[id^=lesson-a2]").count() == D["a12"])
    last = pg.locator("#lesson-" + D["lastLesson"])
    check("最新课存在", last.count() == 1)
    check("最新课标题/日期", D["lastLessonDe"] in last.inner_text() and D["lastLessonDate"] in last.inner_text(),
          [D["lastLessonDe"], D["lastLessonDate"]])
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
    ipa_stat = pg.evaluate("() => window.__dhIpaStats")
    check("词级音标 ≤60% 且仍有标注", 0 < ipa_stat["ratio"] <= 0.6, ipa_stat)
    check("每句都有音标行", ipa_stat["lines"] == ipa_stat["sentences"], ipa_stat)
    check("逐句中文与句数一致", pg.locator("#textBody .s-zh").count() == meta["sents"] == meta["zhs"])
    # 词上方 ruby 音标（Jian 2026-11-12：选中词同时在德语上方标注）
    ruby_n = pg.evaluate("() => document.querySelectorAll('#textBody .s-text ruby.s-ruby').length")
    check("词上方有 ruby 音标标注", ruby_n > 0, ruby_n)
    ruby_ok = pg.evaluate("""() => {
      const lines = [...document.querySelectorAll('#textBody .s-line')];
      if (!lines.length) return false;
      return lines.every(l => {
        const rbs = [...l.querySelectorAll('.s-text ruby.s-ruby')];
        const ln = l.querySelector('.s-ipa');
        const bb = ln ? ln.querySelectorAll('b').length : 0;
        return rbs.length === bb && rbs.every(r => r.dataset.word
          && (r.querySelector('rt') || { textContent: '' }).textContent.trim());
      });
    }""")
    check("ruby 与音标行逐句同词同源", ruby_ok)
    rb_basic = pg.evaluate("""() => [...document.querySelectorAll('#textBody .s-text ruby.s-ruby')]
      .some(r => /^(ich|wir|und|ist|sind|in|im|am|der|die|das|zu|ein|eine|mit|von|haben)$/.test(r.dataset.word.toLowerCase()))""")
    check("ruby 标注不含基础词", not rb_basic)
    ipa_ratios = []
    for tid in pg.locator(".text-tab").evaluate_all("els => els.map(e => e.dataset.id)"):
        pg.locator(f'.text-tab[data-id={tid}]').click(); pg.wait_for_timeout(180)
        st = pg.evaluate("""() => ({ ...window.__dhIpaStats,
          rubies: document.querySelectorAll('#textBody .s-text ruby.s-ruby').length })""")
        ipa_ratios.append((tid, round(st["ratio"], 3), st["marked"], st["words"], st["lines"], st["sentences"], st["rubies"]))
    check("四篇课文词级音标均 ≤60%", all(r[1] <= 0.6 and r[1] > 0 for r in ipa_ratios), ipa_ratios)
    check("四篇课文每句都有音标行", all(r[4] == r[5] for r in ipa_ratios), ipa_ratios)
    check("四篇课文 ruby 数 = 音标行数", all(r[6] == r[2] for r in ipa_ratios), ipa_ratios)
    pg.locator('.text-tab[data-id=t1]').click(); pg.wait_for_timeout(180)
    basic_ok = pg.evaluate("""() => [...document.querySelectorAll('.s-ipa')]
        .every(e => !/(^|·\\s)(ich|wir|und|ist|sind|in|im|der|die|das|zu|am|um|haben|eine|ein)\\s*\\[/i.test(e.textContent.trim()))""")
    check("基础词不出现在音标行", basic_ok)
    pg.click("#toggleZh"); pg.wait_for_timeout(250)
    check("隐藏中文开关生效", pg.locator("#textBody.hide-zh").count() == 1)

    # ---- 语法页 ----
    pg.goto(BASE + "/grammatik.html", wait_until="networkidle")
    check("语法专题数 = GRAMMAR", pg.locator(".card.grammar-item").count() == D["grammar"])
    lg = "#" + D["lastGrammar"]
    pg.locator(lg + " .grammar-head").click(); pg.wait_for_timeout(200)
    check("最新语法专题标题渲染", D["lastGrammarTitle"] in pg.locator(lg).inner_text(), D["lastGrammarTitle"])
    check("最新语法专题正文非空", len(pg.locator(lg + " .grammar-body").inner_text().strip()) > 120,
          len(pg.locator(lg + " .grammar-body").inner_text().strip()))

    # ---- 练习页 ----
    pg.goto(BASE + "/uebungen.html", wait_until="networkidle")
    check("测验组数 = QUIZZES", pg.locator(".card.quiz-card").count() == D["quizzes"])
    qcards = [int(x) for x in pg.evaluate(
        """() => [...document.querySelectorAll('.quiz-card .module-num')]
             .map(e => (e.textContent.match(/(\\d+)\\s*题/) || [])[1]).filter(Boolean)""")]
    check("题数合计 = 各组卡片题数之和", sum(qcards) == D["questions"],
          [sum(qcards), D["questions"], qcards])
    pg.locator('.quiz-card[data-id=%s]' % D["lastQuiz"]).click(); pg.wait_for_timeout(300)
    check("末组测验题干与提示语", D["lastQuizQ0"] in pg.locator(".quiz-qcard").inner_text()
          and D["lastQuizHint"] in pg.locator(".quiz-qcard").inner_text(),
          [D["lastQuizQ0"], D["lastQuizHint"]])
    check("末组测验选项 4 个", pg.locator(".quiz-opts .opt").count() == 4,
          pg.locator(".quiz-opts .opt").count())

    # 纯文本字段（focus / summary / intro / zh）不做 Markdown 解析，残留 ** 会原样显示
    md_leak = pg.evaluate(r"""() => {
      const bad = [];
      LESSONS.forEach(l => ['focus','summary'].forEach(k => { if (/\*\*/.test(l[k] || '')) bad.push(l.id + '.' + k); }));
      TEXTS.forEach(t => { if (/\*\*/.test(t.intro || '')) bad.push(t.id + '.intro'); });
      return bad;
    }""")
    check("纯文本字段无残留 Markdown 星号", len(md_leak) == 0, md_leak)

    # ---- 词形变化页（含通用变位守卫） ----
    pg.goto(BASE + "/formen.html", wait_until="networkidle")
    FVn = pg.evaluate("() => FORMEN_VERBEN.length")
    check("动词表条目数 = 数据层", pg.locator("#formenBody tr").count() >= FVn, [pg.locator("#formenBody tr").count(), FVn])
    # 通用守卫：词干以 -t/-d 结尾须插 -e-（wartest/bildest），以 -s/-ß/-z 结尾 du 只加 -t
    bad_forms = pg.evaluate("""() => {
      const out = [];
      FORMEN_VERBEN.forEach(v => {
        if (v.formen || !v.stamm) return;
        const st = v.stamm;
        const du = konjugiere(v)[1], er = konjugiere(v)[2];
        if (/[td]$/.test(st) && !new RegExp('^' + st + 'est$').test(du)) out.push(v.de + ' → ' + du);
        if (/[szß]$/.test(st) && !new RegExp('^' + st + 't$').test(du)) out.push(v.de + ' → ' + du);
      });
      return out;
    }""")
    check("无「词干 -t/-d/-s/-z 结尾变位未插 -e-」错形", len(bad_forms) == 0, bad_forms)
    pg.locator('[data-tab="index"]').click(); pg.wait_for_timeout(400)
    idx = pg.locator("#formenBody").inner_text()
    check("语料索引收录本课新变形", "gefüllt" in idx and "verglichen" in idx, idx[:60])

    # ---- 生词表 ----
    pg.goto(BASE + "/wortschatz.html", wait_until="networkidle")
    pg.fill("#vSearch", "Gewächshaus"); pg.wait_for_timeout(350)
    check("新词可检索（Gewächshaus）", "Gewächshaus" in pg.locator("#vGrid").inner_text())
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
    check("最新笔记排首位", D["noteLatest"]["title"] in first.inner_text() and D["noteLatest"]["date"] in first.inner_text(),
          [D["noteLatest"], first.inner_text()[:70]])
    check("默认展开最新笔记", D["noteLatest"]["title"] in pg.locator("#noteReader .nr-title").inner_text(),
          pg.locator("#noteReader .nr-title").inner_text())
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
