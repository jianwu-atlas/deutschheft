# AGENTS.md · Mein Deutschheft（德语学习网站）

> Jian 的个人德语学习站（A1 → A1.2）。独立 git 仓库，架构与部署完全参考 jianwu-atlas-private。

## 定位

静态多页学习站：课程 / 生词表 / 语法 / 课文 / 练习 / Notion 同步 / 大纲。内容严格同步 Jian 的实际上课进度与 Notion 笔记（jackng833.notion.site「德语-最重要」）。

## 目录与产物

| 路径 | 用途 |
|---|---|
| `index.html` | 首页（学习地图、统计、当前重点） |
| `lektionen.html` | 13 课（A1 × 11 + A1.2 × 2），手风琴 + 已复习标记 |
| `wortschatz.html` | 双视图：272 词卡（筛选/搜索/翻面）+ **全站词表 1053 词形**（德语单词 / IPA / **中文释义** / 来源 / 次数，IPA 与释义 100% 覆盖，支持中文搜索） |
| `grammatik.html` | 12 语法专题（手风琴 + 变位表） |
| `formen.html` | 词形变化总表：76 动词（六人称变位 / 过去时 / 第二分词 / 助动词 / 类型）+ 185 名词复数分组 + 30 形容词比较级 + 冠词·人称代词·物主冠词变格 |
| `texte.html` | 2 篇课文逐段中德对照（可隐藏中文自测） |
| `lehrbuch.html` | 教材库：5 份 PDF（00 零基础德语速成 338 页 + 06/09/10/11 课程课件）在线阅读/下载 + 结构化词汇/句型/语法要点 |
| `referenz.html` | 速查表：数字 0–100（含 21–99 组合规则表）/ 口语报时 / 18 色 / 四季·月份·星期·天气（全带 IPA+谐音） |
| `uebungen.html` | 5 组测验（48 题），即时解析 + 成绩页 |
| `notion.html` | Notion 笔记库：14 篇内置 + 拖拽/粘贴导入 + 全文搜索 |
| `kursplan.html` | 15 主题大纲（9 已学 / 1 部分 / 5 待学） |
| `content-notion/` | **Notion 笔记源（.md）——改内容只动这里** |
| `scripts/notion_export_sync.py` | content-notion/ → assets/js/data/notion-notes.js |
| `scripts/gen_wortliste.js` | 全站语料 → assets/js/data/wortliste.js（改词库后重跑） |
| `assets/js/data/deutsch-data.js` | 课程/词汇/语法/课文/测验数据（手维护） |
| `assets/js/data/pron.js` | 发音库：PRON 282（含中文谐音）+ 变位 94 + 裸词 221 + `PRON_EXTRA` / `PRON_FUNC` / `PRON_MORE`（约 1200 条 IPA）+ `PRON_ZH`（813 条中文释义） |
| `assets/js/data/wortliste.js` | 全站词表（脚本生成，勿手改；zh=中文释义、pron=中文谐音） |
| `assets/js/data/formen.js` | 词形变化数据：`FORMEN_VERBEN`（art: reg/t/s/er/stark）+ `FORMEN_ADJ` + `FORMEN_DEKL` |
| `assets/js/data/notion-notes.js` | 脚本生成，勿手改 |
| `assets/css/deutsch.css` | 设计系统：浅/深双主题、词性三色（der 蓝/die 红/das 绿/动词紫） |
| `assets/js/deutsch.js` | 页面渲染交互核心（body[data-page] 分发） |
| `assets/js/notion-import.js` | Markdown 渲染器 + 导入 + 搜索 |
| `assets/js/annotate.js` | 全文音标标注 + 朗读；`BASIC`（基础功能词不标）/ `NAMES`（专名不标）/ `SKIP_SEL`（界面与自带音标区不标） |

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

- 2026-10-13：从 SPA 重构为多页静态站（对齐 jianwu-atlas-private）；新增 notion.html 与导入/同步链路；暗色模式；发布到 GitHub Pages。同日追加：Gießen 全部替换为 XX（隐私）；新增 assets/js/data/pron.js（256 词条 IPA+中文谐音）；新增 referenz.html 速查表（数字/时间/颜色/四季）；新增 lehrbuch.html 教材库（5 份 PDF）；目录 website/ → deutschheft/。
- 2026-10-13（词形变化页 + 隐私替换）：新增 `formen.html`（导航第 5 位，11 项）+ `assets/js/data/formen.js`；隐私：Bad Nauheim → Deutschland、Max Planck / 马普所 → MPI（其余个人信息不动），重建词表 1051 词形。
- 2026-10-13（全站词表中文化）：新增 `PRON_ZH` 813 条中文释义；修正释义来源优先级（词卡释义 VOCAB.zh > PRON_ZH，**不再用「谐音」顶替释义**）；词表列改为「德语单词 / 国际音标 / 中文释义（附谐音副行）」；1053 词形 IPA 与中文释义双双 100% 覆盖。
- 2026-10-13（音标策略 + 全站词表）：
  - **标注策略定稿**（Jian 指示）：只标实词，`ich / bin / ein / habe / der / wie / bitte` 等最基础功能词与专名一律不标；`heißen / buchstabieren` 这类实词保留音标。实现在 `annotate.js` 的 `BASIC` / `NAMES` / `SKIP_SEL`。
  - 发音库扩至约 1200 条（新增 `PRON_EXTRA` 301 / `PRON_FUNC` 53 / `PRON_MORE` 241）。
  - 新增 `scripts/gen_wortliste.js` + `assets/js/data/wortliste.js`：全站语料抽词 → 1056 词形，**100% 带 IPA**；生词表页改为「词卡 / 全站词表」双视图。
  - 修复：笔记源 `14_现在完成时` 第 11 行括号笔误（`[ˈleːzn̩:` → `[ˈleːzn̩] · [`）；导航 10 项在 1400px 以下收窄避免溢出；静态资源版本号统一 `?v=6`。
- 2026-10-12：初版 SPA 上线（hash 路由单页）。
