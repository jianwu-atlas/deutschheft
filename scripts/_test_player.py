#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""_test_player.py · 课文朗读播放器冒烟测试（Playwright，需 anaconda 解释器 + 系统 Chrome）

用法：先 pack 出 dist（或起源码服务器），再
    /opt/anaconda3/bin/python3 scripts/_test_player.py http://127.0.0.1:8633/texte.html

覆盖：TTS 句队列的播放/暂停/继续/停止、句级高亮与自动滚动、
      MP3 的进度与断点续听、段落高亮、切换页签与重渲染停止、Esc、移动端布局。
注：headless 无德语语音，脚本注入 TTS stub（每句 700ms）以便断言推进。
"""
import sys
from playwright.sync_api import sync_playwright

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8631/texte.html").rstrip("/")
if not BASE.endswith("texte.html"):
    BASE = BASE.rstrip("/") + "/texte.html"
fails, errors = [], []

def check(name, cond, extra=""):
    print(("  ✓ " if cond else "  ✗ ") + name + (f"  [{extra}]" if extra and not cond else ""))
    if not cond:
        fails.append(name)

# 让每句朗读耗时 700ms，便于断言（headless 无德语语音时会瞬间结束）
STUB = """
window.__stubTTS = true;
const wait = ms => new Promise(r => setTimeout(r, ms));
(function () {
  const install = () => {
    if (!("speechSynthesis" in window) || window.__ttsStubbed) return;
    window.__ttsStubbed = true;
    speechSynthesis.speak = function (u) { setTimeout(() => { try { u.onend && u.onend(); } catch (e) {} }, 700); };
    speechSynthesis.cancel = function () {};
  };
  install();
})();
"""

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")          # 用系统 Chrome，含 MP3 编解码器
    pg = b.new_page(viewport={"width": 1280, "height": 900})
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append("console:" + m.text) if m.type == "error" else None)
    pg.add_init_script(STUB)
    pg.goto(BASE, wait_until="networkidle")

    st = lambda: pg.evaluate("() => window.DhPlayer.state()")

    # 1–3 初始与播放
    check("播放器 API 存在", pg.evaluate("() => typeof window.DhPlayer === 'object'"))
    check("默认课文为 t3", pg.locator(".text-tab.on .tt-de").inner_text().startswith("Ein Problem"))
    check("初始无高亮", pg.locator(".s-reading").count() == 0)
    check("t3 段落 9 段", pg.locator(".card.para").count() == 9, pg.locator(".card.para").count())
    check("t3 音标 29 条", pg.locator("#textBody .s-ipa").count() == 29, pg.locator("#textBody .s-ipa").count())
    check("t3 逐句中文 29 条", pg.locator("#textBody .s-zh").count() == 29, pg.locator("#textBody .s-zh").count())
    check("初始停止按钮禁用", pg.locator("#btnStop").is_disabled())

    pg.click("#btnPlay")
    pg.wait_for_timeout(400)
    check("TTS 播放中", st()["mode"] == "playing" and st()["source"] == "tts", st())
    check("出现句高亮且唯一", pg.locator(".s-reading").count() == 1, pg.locator(".s-reading").count())
    check("停止按钮可用", not pg.locator("#btnStop").is_disabled())
    check("进度条可见", pg.locator("#pBar").is_visible())
    check("状态文字含句序", "句" in pg.locator("#pStatus").inner_text(), pg.locator("#pStatus").inner_text())

    # 4–5 暂停 / 继续（不回到首句）
    pg.wait_for_timeout(1500)            # 让它推进到第 2~3 句
    before = st()
    pg.click("#btnPlay")                 # → 暂停
    pg.wait_for_timeout(300)
    paused = st()
    check("暂停生效", paused["mode"] == "paused", paused)
    check("暂停后高亮保留", pg.locator(".s-reading").count() == 1)
    check("暂停按钮文案为继续", "继续" in pg.locator("#btnPlay").inner_text(), pg.locator("#btnPlay").inner_text())
    pg.click("#btnPlay")                 # → 继续
    pg.wait_for_timeout(250)
    after = st()
    check("继续后仍在播放", after["mode"] == "playing", after)
    check("继续不回到首句", after["i"] >= max(1, paused["i"]), {"paused_i": paused["i"], "after_i": after["i"]})

    # 6 停止
    pg.click("#btnStop")
    pg.wait_for_timeout(250)
    check("停止后状态归零", st()["mode"] == "idle" and st()["source"] is None, st())
    check("停止后高亮清除", pg.locator(".s-reading").count() == 0)
    check("停止后按钮禁用", pg.locator("#btnStop").is_disabled())

    # 7 MP3 全文：进度 + 暂停/继续不重置
    pg.click("#btnMp3")
    pg.wait_for_timeout(1800)
    m1 = st()
    t1 = pg.evaluate("() => { const a = window.DhPlayer.audioEl(); return a ? a.currentTime : -1; }")
    check("MP3 播放中", m1["source"] == "mp3" and m1["mode"] == "playing", m1)
    check("MP3 有进度", t1 > 0.3, t1)
    check("进度条有宽度", pg.evaluate("() => document.getElementById('pFill').style.width") not in ("", "0%"),
          pg.evaluate("() => document.getElementById('pFill').style.width"))
    pg.click("#btnMp3")                  # 暂停 MP3
    pg.wait_for_timeout(600)
    t_pause = pg.evaluate("() => window.DhPlayer.audioEl().currentTime")
    check("MP3 暂停生效", st()["mode"] == "paused", st())
    pg.wait_for_timeout(500)
    check("暂停期间时间不推进", abs(pg.evaluate("() => window.DhPlayer.audioEl().currentTime") - t_pause) < 0.1)
    pg.click("#btnMp3")                  # 继续
    pg.wait_for_timeout(700)
    t2 = pg.evaluate("() => window.DhPlayer.audioEl().currentTime")
    check("MP3 从中断处继续", t2 > t_pause, {"pause": t_pause, "resume": t2})
    pg.click("#btnStop")
    pg.wait_for_timeout(300)
    check("MP3 停止后归零", pg.evaluate("() => window.DhPlayer.audioEl().currentTime") == 0)

    # 8 段落 MP3 → 段落级高亮
    pg.locator(".para-mp3").first.click()
    pg.wait_for_timeout(900)
    check("段落 MP3 高亮整段", pg.locator(".para-reading").count() == 1, pg.locator(".para-reading").count())
    pg.click("#btnStop")

    # 9 切换课文页签 → 停止且无残留
    pg.click("#btnPlay")
    pg.wait_for_timeout(500)
    pg.locator(".text-tab[data-id=t1]").click()
    pg.wait_for_timeout(400)
    check("切页签后停止", st()["mode"] == "idle", st())
    check("切页签后无高亮", pg.locator(".s-reading").count() == 0)

    # 10 隐藏中文重渲染 → 停止
    pg.click("#btnPlay")
    pg.wait_for_timeout(400)
    pg.click("#toggleZh")
    pg.wait_for_timeout(400)
    check("隐藏中文后停止", st()["mode"] == "idle", st())
    pg.click("#toggleZh")

    # 11 句🔊 连读：从该句开始
    pg.locator(".text-tab[data-id=t3]").click()
    pg.wait_for_timeout(300)
    pg.locator('.s-line[data-p="2"][data-s="1"] .s-sp').click()
    pg.wait_for_timeout(400)
    hl = pg.locator(".s-reading").first
    dp, ds = hl.get_attribute("data-p"), hl.get_attribute("data-s")
    check("句🔊 从该句开始", dp == "2" and ds == "1", {"dp": dp, "ds": ds})
    pg.click("#btnStop")

    # 12 Esc 停止
    pg.click("#btnPlay")
    pg.wait_for_timeout(400)
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(300)
    check("Esc 停止", st()["mode"] == "idle", st())

    # 12b 自动滚动：播放推进过程中高亮句始终在视口内
    pg.set_viewport_size({"width": 1280, "height": 700})
    pg.click("#btnPlay")
    pg.wait_for_timeout(2400)
    pg.wait_for_timeout(900)
    bx = pg.locator(".s-reading").first.bounding_box()
    vh = 700
    check("高亮句自动滚动到视口内", bool(bx) and bx["y"] >= -2 and bx["y"] + bx["height"] <= vh + 2,
          {"box": bx, "vh": vh})
    pg.locator("#btnStop").click(force=True)
    pg.wait_for_timeout(300)

    # 13 移动端视口
    pg.set_viewport_size({"width": 390, "height": 844})
    pg.wait_for_timeout(300)
    box = pg.locator("#btnStop").bounding_box()
    check("移动端控件在视口内", box and 0 <= box["x"] <= 390 and box["width"] > 0, box)
    check("移动端无横向溢出", pg.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1"),
          pg.evaluate("() => document.documentElement.scrollWidth + ' / ' + window.innerWidth"))

    b.close()

print("\nJS 错误:", errors if errors else "无")
print("失败项:", fails if fails else "无")
sys.exit(1 if (fails or errors) else 0)
