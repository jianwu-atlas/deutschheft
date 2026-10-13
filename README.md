# Mein Deutschheft · Jian 的德语学习网站

基于 Jian 的 A1–A1.2 课堂笔记与 Notion 笔记库构建的个人德语学习站：**分级课程、生词表、语法讲解、课文精读、互动练习、Notion 同步、课程大纲**。

架构与部署方式完全参考 [`jianwu-atlas-private`](https://github.com/jianwu-atlas)（静态多页站点 + Cloudflare Workers）。

## 目录结构

```
├── index.html            首页（学习地图 + 进度）
├── lektionen.html        分级课程（13 课）
├── wortschatz.html       生词表（双视图：272 词卡 + 全站词表 1053 词形，均带 IPA 与中文释义）
├── grammatik.html        语法十二讲
├── texte.html            课文精读（2 篇，逐段中德对照）
├── lehrbuch.html         教材：5 份 PDF（零基础速成 338 页 + 4 份课程课件）在线阅读/下载 + 结构化词汇/句型/语法
├── referenz.html         速查表：数字 0–100 / 口语报时 / 18 色 / 四季·月份·星期·天气（全带 IPA+谐音）
├── uebungen.html         互动练习（5 组测验）
├── notion.html           Notion 笔记库 + 导入/同步
├── kursplan.html         课程大纲（15 主题进度）
├── assets/
│   ├── css/deutsch.css   设计系统（浅色/深色双主题）
│   └── js/
│       ├── data/deutsch-data.js    课程/词汇/语法/课文/测验数据
│       ├── data/pron.js            发音库：PRON 282 + 变位 94 + 裸词 221 + EXTRA/FUNC/MORE 补充 + PRON_ZH 中文释义
│       ├── data/wortliste.js       全站词表（脚本生成，1053 词形：IPA + 中文释义 100% 覆盖）
│       ├── data/notion-notes.js    Notion 笔记（脚本生成，请勿手改）
│       ├── deutsch.js              页面渲染与交互核心
│       ├── notion-import.js        Markdown 渲染 + 导入 + 搜索
│       └── annotate.js             全文音标标注（ruby）+ 点击朗读
├── content-notion/        Notion 笔记源文件（.md，改这里 → 重跑脚本）
├── assets/lehrbuch/       教材 PDF 原件（5 份，改内容先替换这里）
└── scripts/
    ├── notion_export_sync.py        Notion → 网站 同步脚本
    └── gen_wortliste.js             全站词表生成脚本（改词库后重跑）
```

## 音标标注规则（annotate.js）

右下角「🔊 音标」开关，打开后正文德语单词上方显示国际音标，点击单词即朗读（浏览器 de-DE 语音）。

- **标注**：值得学的实词 —— 名词、动词（含变位/分词）、形容词、副词、数词（如 `heißen` [ˈhaɪ̯sn̩]、`buchstabieren` [ˈbuːxʃtabiːʁən]）
- **不标注**：
  - 最基础功能词（`ich / der / ist / kann / wie / bitte` … 见 `BASIC`）—— 纯语法脚手架
  - 专有名词（`Mia / Elena / Frankfurt` … 见 `NAMES`）
  - 已自带音标的位置：词卡、速查表、全站词表、句子级音标行、教材 PDF 原文
  - 界面框架：页头、页脚、标签、工具栏

## 本地预览

```bash
cd deutschheft && python3 -m http.server 8631 --bind 127.0.0.1
# http://127.0.0.1:8631
```

## 更新 Notion 内容

**方式 A（推荐）：Notion 导出 → 本地同步**

1. Notion 页面「···」→ 导出 → Markdown & CSV
2. 解压，把 `.md` 放进 `content-notion/`（可含子文件夹）
3. `python3 scripts/notion_export_sync.py`
4. commit & push → 自动部署

**方式 B：Notion API 直连**

```bash
NOTION_TOKEN=ntn_xxx NOTION_ROOT_PAGE_ID=xxx python3 scripts/notion_export_sync.py --api
```

**方式 C：网站端导入（不重跑脚本）**

打开 `/notion.html`，把导出的 `.md` / `.zip` 拖进导入面板（或直接粘贴 Markdown）。导入的笔记保存在本机浏览器 localStorage，可全文搜索阅读。

## 部署

| 通道 | 地址 | 说明 |
|---|---|---|
| GitHub Pages | `https://jianwu-atlas.github.io/deutschheft/` | push 即自动发布 |
| Cloudflare Workers | `https://deutschheft.<subdomain>.workers.dev` | 需在仓库 Secrets 配置 `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`，push 后由 `.github/workflows/deploy.yml` 自动执行 |

本地手动部署 Workers：`npx wrangler deploy`（需先 `npx wrangler login`）。

## 约定

- 视觉：暖纸底 + Fraunces 衬线 + 德金/焦橙；词性配色 `der 蓝 / die 红 / das 绿 / 动词紫`；深色模式可切换（localStorage 记忆）。
- 复习/测验进度存 localStorage（key：`deutschheft_v1`）。
- 改**内容**只动 `content-notion/` 与 `assets/js/data/deutsch-data.js`；**看完整约定见仓库 `AGENTS.md`**。
