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
| `formen.html` | 词形变化总表（5 页签）：**111 动词**（六人称变位 / 过去时 / 第二分词 / 助动词 / 类型）+ 185 名词复数分组 + 30 形容词比较级 + 冠词·人称代词·物主冠词变格 + **语料变形索引**（网页正文里真实出现过的每个变形） |
| `texte.html` | 2 篇课文逐段中德对照（可隐藏中文自测） |
| `lehrbuch.html` | 教材库：5 份 PDF（00 零基础德语速成 338 页 + 06/09/10/11 课程课件）在线阅读/下载 + 结构化词汇/句型/语法要点 |
| `referenz.html` | 速查表：数字 0–100（含 21–99 组合规则表）/ 口语报时 / 18 色 / 四季·月份·星期·天气（全带 IPA+谐音） |
| `uebungen.html` | 5 组测验（48 题），即时解析 + 成绩页 |
| `notion.html` | Notion 笔记库：14 篇内置 + 拖拽/粘贴导入 + 全文搜索 |
| `kursplan.html` | 15 主题大纲（9 已学 / 1 部分 / 5 待学） |
| `tts.html` | 文本转 MP3 工具页（B：实时，调 edge-fn；未部署函数时显示提示、按钮禁用） |
| `content-notion/` | **Notion 笔记源（.md）——改内容只动这里** |
| `scripts/notion_export_sync.py` | content-notion/ → assets/js/data/notion-notes.js |
| `scripts/gen_wortliste.js` | 全站语料 → assets/js/data/wortliste.js（改词库后重跑） |
| `scripts/pack_site.py` | 打包 `dist/`（站点资源，用于 EdgeOne Pages 等静态托管） |
| `scripts/gen_text_audio.py` | 用微软 Edge TTS 预生成课文德语 MP3（B'）→ `assets/audio/textes/{id}_p{n}.mp3` + `{id}_full.mp3` + `manifest.json`；音色 `TTS_VOICE`（默认 de-DE-KatjaNeural≈Lena）、语速 `TTS_RATE`（默认 -5%） |
| `assets/audio/textes/` | 预生成课文 MP3（2 篇 × 10 段 + 2 全文 = 22 个，共 ~3.7M）；改课文后需重跑 gen_text_audio.py |
| `edge-fn/` | 文本转 MP3 云函数（B）：`server.js`（Node + msedge-tts，POST /tts）+ `package.json` + `README.md`；需部署到 FaaS 后把地址填入 `tts.html` 的 `TTS_ENDPOINT` |
| `assets/js/data/deutsch-data.js` | 课程/词汇/语法/课文/测验数据（手维护） |
| `assets/js/data/pron.js` | 发音库：PRON 282（含中文谐音）+ 变位 94 + 裸词 221 + `PRON_EXTRA` / `PRON_FUNC` / `PRON_MORE`（约 1200 条 IPA）+ `PRON_ZH`（813 条中文释义） |
| `assets/js/data/wortliste.js` | 全站词表（脚本生成，勿手改；zh=中文释义、pron=中文谐音） |
| `assets/js/data/formen.js` | 词形变化数据：`FORMEN_VERBEN`（art: reg/t/s/er/stark）+ `FORMEN_ADJ` + `FORMEN_DEKL` |
| `assets/js/data/notion-notes.js` | 脚本生成，勿手改 |
| `brand/` | **品牌源文件**：`design-philosophy.md`（金印 Gilded Seal 设计哲学）+ `logo-mark.svg`（主标）+ `og-image.svg`（社交分享图） |
| `assets/img/` | 由 brand/ 栅格化（`rsvg-convert`）：`favicon.svg` + `favicon-16/32/48.png` + `apple-touch-icon.png`(180) + `og-image.png`(1200×630) + `logo-mark-512.png`；改 logo 先改 brand/*.svg 再重新栅格化 |
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

- **国内可访问（首选，2026-10-13 起）**：Cloudflare Pages → **https://deutschheft.pages.dev/**；更新：`python3 scripts/pack_site.py` 重建 dist/ → `wrangler pages deploy dist --project-name=deutschheft --branch=main`（凭据在 `~/.wrangler`，OAuth 登录 jian.wu@mpi-bn.mpg.de，**免手机号**；国内可达性待实测确认）
- 腾讯 EdgeOne Pages → **https://deutschheft.edgeone.cool/**（⚠️ 当前登录 Global=新加坡边缘，**国内不可达**；要国内需切中国站 + ICP 备案域名，见 memory 2026-10-13）
- GitHub Pages：push main 即发布 → https://jianwu-atlas.github.io/deutschheft/（`*.github.io` 国内常不可达）
- Cloudflare Workers（可选，需 secrets）：wrangler.toml（name=deutschheft）+ .github/workflows/deploy.yml
- 仓库：https://github.com/jianwu-atlas/deutschheft （描述用中文）

## 更新记录

- 2026-10-13（在线朗读语速调节 + 课文一键复制全文）：
  - **语速**：`annotate.js` 把写死 `u.rate=0.88` 改为 `curSpeed()`，三档 `慢 0.66 / 正常 0.88 / 快 1.10`，localStorage `deutschheft_srate` 记忆；全站在线朗读（逐句🔊 / 整段「朗读全段」/ 点单词）一处生效。新增右下角浮动按钮 `#speedToggle`（`deutsch.css` 复用 `#ipaToggle` 样式、`bottom:74px`，点一下循环切换）。⚠️ 语速**只影响在线朗读**，预生成 MP3 语速固定（edge-tts `-5%`，改它要重跑 `gen_text_audio.py`）。
  - **复制全文**：`deutsch.js` 课文控制区加 `#copyFull`「📋 复制全文」，把 `t.paragraphs.map(p=>p.de).join("\n")`（纯德语、不含 IPA/中文）写入剪贴板（`navigator.clipboard` + `execCommand` 兜底），按钮短暂变「✓ 已复制」，方便整篇贴到「文本转MP3」生成/收听。
  - `i18n-en.js` 加 5 条英文标签（Copy full text / Copied / Speed: slow·normal·fast）。11 页版本号破缓存：annotate.js→v31、deutsch.css→v34、deutsch.js→v32、i18n-en.js→v31（**tts.html 不加载 annotate/deutsch.js**，无此二按钮，符合预期）。
- 2026-10-13（国内免费托管：Cloudflare Pages）：Gitee Pages 卡在需大陆 +86 手机号收短信（Jian 在德国无 +86 号）→ 改走 **Cloudflare Pages**（邮箱登录、免手机号）。流程：隔离 node 装 wrangler → `wrangler login` OAuth（jian.wu@mpi-bn.mpg.de）→ `pages project create deutschheft` → `pages deploy dist/`（62 文件，26s）→ **https://deutschheft.pages.dev/**（curl / headless 全 200，`.html` 自动 308→干净 URL）。**以后更新**：`python3 scripts/pack_site.py` 重建 dist/ → `wrangler pages deploy dist --project-name=deutschheft --branch=main`（URL 不变）。国内可达性待老婆实测。
- 2026-10-13（英文导航重叠修复）：英文模式 12 项导航在窄桌面（~1250px 以下）被 `overflow-x:auto` 硬裁到半截、且深色激活项贴着深色语言按钮造成「重叠」。改法：① `i18n.js` 压缩 4 个最长英文导航词（`Vocabulary→Vocab` / `Word Forms→Forms` / `Exercises→Quiz` / `Text to MP3→TTS`，德语副标签不动）；② 新增 `scrollActiveNav()` 把当前激活导航项自动滚入可见区（resize / 切语言时重算）；③ 12 页 `i18n.js?v=33→v=34` 破缓存；④ `.gitignore` 增补 `.edgeone/`（42M 部署残留）、`.env`。commit `1578708` 已 push 到 github.io，并 `pack_site.py` 重打包同步 EdgeOne（`deutschheft.edgeone.cool`，同名覆盖）。
- 2026-10-13（朗读/文本转 MP3 整合，三档 C+B'+B）：
  - **C 在线整段朗读**：课文页 `renderTexts` 原有「🔊 朗读全段」+ 逐句 🔊（Web Speech，`annotate.js` 的 `__dhSpeak`）保留；新增 `playTextMp3()` 在 MP3 缺失时自动回退 Web Speech。
  - **B' 预生成 MP3**：新增 `scripts/gen_text_audio.py`（微软 Edge TTS），已生成 `assets/audio/textes/` 22 个 MP3（2 课文 × 逐段 10 + 全文）；课文页每段加「🎧」按钮 + 控制区加「🎧 全文 MP3」，点即播放真 MP3（音色=Speecher 的 Lena）。
  - **B 实时粘贴转 MP3**：新增 `edge-fn/`（Node + msedge-tts，`POST /tts`→audio/mpeg，本地实测 200 出真 MP3）+ `tts.html` 工具页（粘贴/选音色/选语速/试听/下载；`TTS_ENDPOINT` 未填时显示提示并禁用）。已接入全站导航「文本转MP3」。**edge-fn 已部署上线**（WorkBuddy 云函数，2026-10-13），`tts.html` 的 `TTS_ENDPOINT` 已填入并线上实测 `POST /tts`→200 出真 MP3。重新部署 edge-fn 后需确认新 URL 并回填 `tts.html`。
  - 版本号：deutsch.css→v33、deutsch.js→v31、i18n.js→v33（12 页统一）；i18n-en/i18n.js 增 `nav.tts` + `head.tts.*`。
- 2026-10-13（品牌 logo · Gilded Seal 金印）：新增 `brand/`（设计哲学 + logo-mark.svg + og-image.svg）与 `assets/img/`（favicon.svg/16/32/48 + apple-touch-icon 180 + og-image 1200×630）。11 页 head 由内联 data-uri 图标改为正式 `<link>` icon + apple-touch-icon + og 元信息（修复 Safari 首字占位符）；导航 `.brand-mark` 由文字 D 改为新 logo 背景图；css `?v=31`。设计沿用 jwtools 的「monogram + 三点」语言：墨黑圆角印底 + 德金 Georgia D + 细金线 + der/die/das 三点（蓝 #2456A6 / 红 #B03048 / 绿 #2E7D5B）。已部署 edgeone + 同步 github.io。
- 2026-10-13：从 SPA 重构为多页静态站（对齐 jianwu-atlas-private）；新增 notion.html 与导入/同步链路；暗色模式；发布到 GitHub Pages。同日追加：Gießen 全部替换为 XX（隐私）；新增 assets/js/data/pron.js（256 词条 IPA+中文谐音）；新增 referenz.html 速查表（数字/时间/颜色/四季）；新增 lehrbuch.html 教材库（5 份 PDF）；目录 website/ → deutschheft/。
- 2026-10-13（语料变形索引 + 国内部署）：formen 页动词补至 **111**、新增「语料变形索引」页签；新增 `scripts/pack_site.py`；部署腾讯 EdgeOne Pages（国内可访问）→ https://deutschheft.edgeone.cool/；修复首页空白（模块卡误引用仅单页加载的 FORMEN_VERBEN）。
- 2026-10-13（词形变化页 + 隐私替换）：新增 `formen.html`（导航第 5 位，11 项）+ `assets/js/data/formen.js`；隐私：Bad Nauheim → Deutschland、Max Planck / 马普所 → MPI（其余个人信息不动），重建词表 1051 词形。
- 2026-10-13（全站词表中文化）：新增 `PRON_ZH` 813 条中文释义；修正释义来源优先级（词卡释义 VOCAB.zh > PRON_ZH，**不再用「谐音」顶替释义**）；词表列改为「德语单词 / 国际音标 / 中文释义（附谐音副行）」；1053 词形 IPA 与中文释义双双 100% 覆盖。
- 2026-10-13（音标策略 + 全站词表）：
  - **标注策略定稿**（Jian 指示）：只标实词，`ich / bin / ein / habe / der / wie / bitte` 等最基础功能词与专名一律不标；`heißen / buchstabieren` 这类实词保留音标。实现在 `annotate.js` 的 `BASIC` / `NAMES` / `SKIP_SEL`。
  - 发音库扩至约 1200 条（新增 `PRON_EXTRA` 301 / `PRON_FUNC` 53 / `PRON_MORE` 241）。
  - 新增 `scripts/gen_wortliste.js` + `assets/js/data/wortliste.js`：全站语料抽词 → 1056 词形，**100% 带 IPA**；生词表页改为「词卡 / 全站词表」双视图。
  - 修复：笔记源 `14_现在完成时` 第 11 行括号笔误（`[ˈleːzn̩:` → `[ˈleːzn̩] · [`）；导航 10 项在 1400px 以下收窄避免溢出；静态资源版本号统一 `?v=6`。
- 2026-10-12：初版 SPA 上线（hash 路由单页）。
