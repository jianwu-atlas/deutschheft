#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
notion_export_sync.py — 从 Notion 生成网站内置笔记数据（assets/js/data/notion-notes.js）

两种用法：
A. 本地 Notion 导出（推荐，离线可用）：
   1. 在 Notion 中导出目标页面为 Markdown & CSV（得到 export 文件夹）
   2. 把 .md 文件（可含子文件夹 / zip 解压后的内容）放进本仓库的 content-notion/ 目录
   3. python3 scripts/notion_export_sync.py

B. Notion API 模式（需集成 token 与页面 id）：
   NOTION_TOKEN=ntn_xxx NOTION_ROOT_PAGE_ID=xxx python3 scripts/notion_export_sync.py --api
   依赖: pip install requests

脚本会扫描 content-notion/ 下的全部 .md（含一级子目录），解析 frontmatter 与正文，
写成 assets/js/data/notion-notes.js；网站「Notion 同步」页随即更新。
Simple First：只依赖标准库（--api 模式才需要 requests）。
"""
import json
import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
CONTENT_DIR = REPO_ROOT / "content-notion"
OUT_FILE = REPO_ROOT / "assets" / "js" / "data" / "notion-notes.js"

# 文件名前缀 → 规整后的展示标题（Notion 原始 frontmatter 的 title 质量不一）
TITLE_OVERRIDES = {
    "0_": "0 · 德语大纲与字母发音",
    "1_": "1 · 自我介绍（A1 第 1 课）",
    "2_": "2 · 数字（第 2 课）",
    "3_": "3 · 食物与饮料",
    "5_": "5 · 休闲活动",
    "6_": "6 · 生活与家具",
    "7_": "7 · 时间与作息 Uhrzeit",
    "9_": "9 · 服装与颜色",
    "10_": "10 · 四季与天气",
    "11_": "11 · 交通工具与问路",
    "12_": "12 · 全天核心词汇表",
    "13_": "13 · 实验室的一天（A1.2 第 1 次）",
    "14_": "14 · 现在完成时 Das Perfekt（A1.2 第 2 次）",
    "15_": "15 · Ein Problem mit den Laborproben（A1.2 第 3 次）",
    "2026-08-10": "2026-08-10 · 八主题例句 + Malawi 的一天",
}

# 文件名前缀 → 上课日期（YYYY-MM-DD）。缺日期或题注残缺的在此补全；其余从 frontmatter title 自动解析。
CLASSDATE_OVERRIDES = {
    "0_": "2026-04-10",   # 德语大纲（估算，置于课程起点）
    "3_": "2026-04-27",   # 估算
    "5_": "2026-05-04",   # 估算（原题注仅到月 2026-04-XX）
    "6_": "2026-05-11",   # 估算（原题注仅到月 2026-04-XX）
    "7_": "2026-05-18",   # 估算
    "13_": "2026-08-31",  # A1.2 第 1 次
    "15_": "2026-10-28",  # A1.2 第 3 次
}


def class_date(stem: str, raw_title: str) -> str:
    """上课日期：优先前缀映射，否则从 frontmatter title 解析（兼容 2026-06-29 / 20260615）。"""
    for prefix, d in CLASSDATE_OVERRIDES.items():
        if stem.startswith(prefix):
            return d
    m = re.search(r"(20\d{2})[-./]?(\d{2})[-./]?(\d{2})", raw_title or "")
    return f"{m.group(1)}-{m.group(2)}-{m.group(3)}" if m else ""


def nice_title(stem: str, fallback: str) -> str:
    for prefix, t in TITLE_OVERRIDES.items():
        if stem.startswith(prefix):
            return t
    return fallback


def parse_markdown_note(path: Path) -> dict:
    """把一篇 Notion 导出的 md 转成站点笔记对象。"""
    raw = path.read_text(encoding="utf-8")
    meta, body = {}, raw
    if raw.startswith("---"):
        parts = re.split(r"^---\s*$", raw, maxsplit=2, flags=re.M)
        if len(parts) >= 3:
            fm_raw = parts[1]
            body = parts[2].lstrip("\n")
            for line in fm_raw.splitlines():
                m = re.match(r"^([A-Za-z_一-鿿]+):\s*(.+)$", line.strip())
                if m:
                    meta[m.group(1).strip().lower()] = m.group(2).strip().strip('"\'')

    if not meta.get("title"):
        for line in body.splitlines():
            if line.strip().startswith("#"):
                meta["title"] = line.lstrip("#").strip()
                break
    meta.setdefault("title", path.stem)
    meta.setdefault("date", "")
    meta.setdefault("source", "notion")
    meta.setdefault("notion_url", "")

    body = clean_notion_export(body)
    return {
        "id": re.sub(r"[^0-9A-Za-z]+", "-", path.stem).strip("-").lower() or "note",
        "title": nice_title(path.stem, meta["title"]),
        "date": meta.get("date", ""),
        "classDate": class_date(path.stem, meta.get("title", "")),
        "source": meta.get("source", "notion"),
        "notion_url": meta.get("notion_url", ""),
        "file": path.name,
        "text": body,
    }


def clean_notion_export(text: str) -> str:
    """清理 Notion 导出的常见痕迹，尽量保持正文干净。"""
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)          # 图片导出失效链接
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)      # 外部链接降级为文字
    text = re.sub(r"<page url=\"[^\"]*\">", "**", text)       # notion 子页面标记（如残留）
    text = re.sub(r"</page>", "**", text)
    text = re.sub(r"<empty-block/>", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def fetch_from_api() -> list:
    """--api 模式：用 Notion API 拉取页面（可选功能）。"""
    try:
        import requests
    except ImportError:
        sys.exit("[!] --api 模式需要 requests：pip install requests")
    token = os.environ.get("NOTION_TOKEN")
    root_id = os.environ.get("NOTION_ROOT_PAGE_ID")
    if not token or not root_id:
        sys.exit("[!] 请设置 NOTION_TOKEN 与 NOTION_ROOT_PAGE_ID 环境变量")
    headers = {"Authorization": f"Bearer {token}", "Notion-Version": "2022-06-28"}

    def get(url):
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        return r.json()

    def blocks_to_md(bs):
        out = []
        for b in bs:
            t = b.get("type")
            if t == "child_page":
                out.append(f'\n## 🔗 [{b["text"]}]({b["url"]})')
        return "\n".join(out)

    notes = []

    def walk(page_id, depth=0):
        page = get(f"https://api.notion.com/v1/pages/{page_id}")
        title = (page.get("properties", {}).get("title", {}) or [{}],)[0]
        title = page.get("url", "").split("/")[-2] if not title.get("title") else title["title"][0].get("text", {}).get("content", page_id)
        body_md = blocks_to_md(get(f"https://api.notion.com/v1/blocks/{page_id}/children").get("results", []))
        notes.append({"id": page_id.replace("-", "")[:8], "title": title, "date": "", "classDate": "", "source": "notion-api",
                      "notion_url": page.get("url", ""), "file": "", "text": body_md})
        for b in get(f"https://api.notion.com/v1/blocks/{page_id}/children").get("results", []):
            if b.get("type") == "child_page" and depth < 2:
                walk(b["id"], depth + 1)

    walk(root_id)
    return notes


def main():
    notes = []
    if "--api" in sys.argv:
        notes = fetch_from_api()
    else:
        if not CONTENT_DIR.exists():
            sys.exit(f"[!] 目录不存在：{CONTENT_DIR}")
        for md in sorted(CONTENT_DIR.rglob("*.md")):
            if md.name in ("README.md",):
                continue
            try:
                notes.append(parse_markdown_note(md))
                print(f"  ✓ {md.name} → {notes[-1]['title']}")
            except Exception as e:
                print(f"  ✗ {md.name}: {e}")
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    js = "/* eslint-disable */\n// 由 scripts/notion_export_sync.py 自动生成，请勿手改；更新请改 content-notion/ 后重跑脚本\n"
    js += "const NOTION_NOTES = " + json.dumps(notes, ensure_ascii=False, indent=1) + ";\n"
    OUT_FILE.write_text(js, encoding="utf-8")
    print(f"\n[✓] 已生成 {OUT_FILE}（{len(notes)} 篇笔记，{OUT_FILE.stat().st_size // 1024} KB）")


if __name__ == "__main__":
    main()
