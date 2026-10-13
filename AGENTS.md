# AGENTS.md · Mein Deutschheft（德语学习网站）

> Jian 的个人德语学习站（A1 → A1.2）。独立 git 仓库，架构与部署完全参考 jianwu-atlas-private。

## 定位

静态多页学习站：课程 / 生词表 / 语法 / 课文 / 练习 / Notion 同步 / 大纲。内容严格同步 Jian 的实际上课进度与 Notion 笔记（jackng833.notion.site「德语-最重要」）。

## 目录与产物

| 路径 | 用途 |
|---|---|
| `index.html` | 首页（学习地图、统计、当前重点） |
| `lektionen.html` | 13 课（A1 × 11 + A1.2 × 2），手风琴 + 已复习标记 |
| `wortschatz.html` | 256 词卡：主题/词性筛选、搜索、点击翻面 |
| `grammatik.html` | 12 语法专题（手风琴 + 变位表） |
| `texte.html` | 2 篇课文逐段中德对照（可隐藏中文自测） |
| `lehrbuch.html` | 教材库：5 份 PDF（00 零基础德语速成 338 页 + 06/09/10/11 课程课件）在线阅读/下载 + 结构化词汇/句型/语法要点 |
| `referenz.html` | 速查表：数字 0–100（含 21–99 组合规则表）/ 口语报时 / 18 色 / 四季·月份·星期·天气（全带 IPA+谐音） |
| `uebungen.html` | 5 组测验（48 题），即时解析 + 成绩页 |
| `notion.html` | Notion 笔记库：14 篇内置 + 拖拽/粘贴导入 + 全文搜索 |
| `kursplan.html` | 15 主题大纲（9 已学 / 1 部分 / 5 待学） |
| `content-notion/` | **Notion 笔记源（.md）——改内容只动这里** |
| `scripts/notion_export_sync.py` | content-notion/ → assets/js/data/notion-notes.js |
| `assets/js/data/deutsch-data.js` | 课程/词汇/语法/课文/测验数据（手维护） |
| `assets/js/data/pron.js` | 发音库：256 词条 IPA + 中文谐音（key 与 VOCAB.de 一一对应） |
| `assets/js/data/notion-notes.js` | 脚本生成，勿手改 |
| `assets/css/deutsch.css` | 设计系统：浅/深双主题、词性三色（der 蓝/die 红/das 绿/动词紫） |
| `assets/js/deutsch.js` | 页面渲染交互核心（body[data-page] 分发） |
| `assets/js/notion-import.js` | Markdown 渲染器 + 导入 + 搜索 |

## 常用操作

- 本地预览：`python3 -m http.server 8631 --bind 127.0.0.1`
- 更新 Notion 内容：`.md` 放入 `content-notion/` → `python3 scripts/notion_export_sync.py` → commit & push
- 同步校验：`node --check assets/js/*.js`（CI 有同样检查）
- 本地存储：`deutschheft_v1`（复习标记/测验成绩）、`deutschheft_notion_imports`（导入笔记）、`deutschheft_theme`、`deutschheft_annotate`（全文标注开关）
- **音标体系**：① 词卡正面 IPA+谐音；② 课程 86 句型 / 课文 57 句句子级 IPA（数据内置）；③ annotate.js 全文词级 ruby 标注 + 点击朗读（浏览器 de-DE 语音）；右下角「音标」开关
- 静态资源版本号：HTML 中 `?v=N`，改 JS/CSS 后需同步 +1

## 部署

- GitHub Pages：push main 即发布 → https://jianwu-atlas.github.io/deutschheft/
- Cloudflare Workers（可选，需 secrets）：wrangler.toml（name=deutschheft）+ .github/workflows/deploy.yml
- 仓库：https://github.com/jianwu-atlas/deutschheft （描述用中文）

## 更新记录

- 2026-10-13：从 SPA 重构为多页静态站（对齐 jianwu-atlas-private）；新增 notion.html 与导入/同步链路；暗色模式；发布到 GitHub Pages。同日追加：Gießen 全部替换为 XX（隐私）；新增 assets/js/data/pron.js（256 词条 IPA+中文谐音）；新增 referenz.html 速查表（数字/时间/颜色/四季，脚本 /tmp 生成逻辑已固化于本次 commit 说明）。
- 2026-10-12：初版 SPA 上线（hash 路由单页）。
