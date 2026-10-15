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
| `lehrbuch.html` | 教材库：5 份 PDF（00 零基础德语速成 338 页 + 06/09/10/11 课程课件）在线阅读/下载 + 结构化词汇/句型/语法要点；「零基础德语速成」卡片带 **📖 场景精读** 入口 |
| `sucheng.html` | **教材精读**：《零基础德语速成》场景篇 70 场景 / 606 句型，**三行格式**（德文 / 中文 / 中文近似发音）+ 逐句 🔊 + 隐藏中文自测 + 复制纯德文 |
| `english.html` | **跳转页**：英语单词内容已独立成站 → https://englishheft.pages.dev/ |
| `english.html` | **跳转页**：英语单词内容已独立成站 → https://englishheft.pages.dev/ |
| `sucheng.html` | **教材精读**：《零基础德语速成》场景篇 70 场景 / 606 句型，三行格式（德文/中文/中文谐音）+ 逐句朗读 + 隐藏中文自测；入口在教材页「场景精读」按钮 |
| `scripts/build_sucheng.py` | OCR 全文 → `assets/js/data/sucheng.js`（抽取「德文/中文/谐音」三元组 + OCR 清洗 + 规范标题覆盖） |
| `referenz.html` | 速查表：数字 0–100（含 21–99 组合规则表）/ 口语报时 / 18 色 / 四季·月份·星期·天气（全带 IPA+谐音） |
| `uebungen.html` | 6 组测验（54 题），即时解析 + 成绩页 |
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
| `assets/js/data/sucheng.js` | 脚本生成（`build_sucheng.py`），勿手改；**课外教材，词汇不计入生词表** |
| `scripts/build_sucheng.py` | OCR 全文 → `sucheng.js`（抽「德文/中文/谐音」三元组 + OCR 清洗 + 规范场景标题覆盖 + 词表自检） |
| `scripts/build_sucheng_extras.py` | wiki `concepts/` → `sucheng-extras.js`（发音篇 7 讲 + 语法篇 9 讲，md→HTML） |
| `assets/js/data/sucheng-extras.js` | 脚本生成，勿手改；课外教材 |
| `scripts/_test_sucheng_full.py` | 精读页 Playwright 冒烟测试（页签/会话/发音/语法/隐藏中文/朗读） |
| `docs/` | 方案与设计文档（`pack_site.py` 不打包 → 不公开） |
| `assets/js/data/sucheng.js` | 脚本生成（build_sucheng.py），勿手改；课外教材，词汇不计入生词表 |
| `docs/` | 方案与设计文档（`pack_site.py` 不打包，不公开） |
| `brand/` | **品牌源文件（Gilded Seal 金印，当前主用）**：`design-philosophy.md` + `logo-mark.svg` + `og-image.svg` |
| `assets/img/` | **Logo 源**：`favicon.svg`（**金印 D 版**，512 viewBox：#201B14 墨黑圆角方块 + 金 #C9A227 Georgia D + 细金线 + der/die/das 三点蓝/红/绿 + jwlab 斜体署名）+ `og-image.svg`（纸底金带 + 金印 D 内联 + MEIN DEUTSCHEFT wordmark）；改 logo 要两个 SVG 一起改，再跑 `scripts/gen_logos.py` 栅格化 |
| `scripts/gen_logos.py` | SVG → 9 位图（Playwright Chromium 高保真）：favicon-16/32/48、apple-touch-icon(180)、icon-192/512/maskable、logo-mark-512 全用 `favicon.svg`（金印不透明底版，小尺寸无需加粗），og-image 用 `og-image.svg`；**需 anaconda 解释器**（受管 python 无 playwright） |
| `scripts/_check_logo.py` | logo 本地验证（14 项断言：SVG 金印内容 / 无水墨残留 / favicon-mark 已删 / 引用 ?v=34 / mark 34px / 渲染金+暗像素 / 9 位图齐全）；先 pack 出 dist 再跑 |
| `assets/css/deutsch.css` | 设计系统：浅/深双主题、词性三色（der 蓝/die 红/das 绿/动词紫） |
| `assets/js/deutsch.js` | 页面渲染交互核心（body[data-page] 分发） |
| `assets/js/notion-import.js` | Markdown 渲染器 + 导入 + 搜索 |
| `assets/js/annotate.js` | 全文音标标注 + 朗读；三态开关 `off/smart/all`；`BASIC`（常用挡不标）/ `NAMES`（专名不标）/ `SKIP_SEL`（界面与自带音标区不标）；点击/双击任意单词即朗读 |
| `assets/js/offline.js` | PWA：注册 SW + 「📥 离线缓存」按钮 + iOS「添加到主屏幕」提示 |
| `sw.js` | Service Worker：预缓存外壳、同源缓存优先、导航失败回退 index；`__ALL__` 打包时注入全量清单 |
| `manifest.webmanifest` | PWA 清单（standalone、3 图标、3 shortcuts） |
| `assets/js/offline.js` | PWA：注册 SW + 「离线缓存」按钮 + iOS 添加主屏幕提示 |
| `sw.js` | Service Worker：预缓存外壳、缓存优先、导航回退；`__ALL__` 打包时注入全量清单 |
| `manifest.webmanifest` | PWA 清单（standalone、3 图标、3 shortcuts） |

## 常用操作

- 本地预览：`python3 -m http.server 8631 --bind 127.0.0.1`
- 更新 Notion 内容：`.md` 放入 `content-notion/` → `python3 scripts/notion_export_sync.py` → commit & push
- 同步校验：`node --check assets/js/*.js`（CI 有同样检查）
- 本地存储：`deutschheft_v1`（复习标记/测验成绩）、`deutschheft_notion_imports`（导入笔记）、`deutschheft_theme`、`deutschheft_annotate`（全文标注开关）
- **音标体系**：① 词卡正面 IPA+谐音；② 课程 86 句型 / 课文 57 句句子级 IPA（数据内置）；③ annotate.js 全文词级 ruby 标注 + 点击朗读（浏览器 de-DE 语音）；右下角「音标」开关
- 静态资源版本号：HTML 中 `?v=N`，改 JS/CSS 后需同步 +1

## 部署

> ⚠️ **2026-10-15 发现**：`.github/workflows/deploy.yml` 里 Cloudflare 那步因仓库**未配 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` 密钥而被跳过**（日志显示 `- Deploy to Cloudflare Workers`，5 秒跑完）→ **`pages.dev` 不会随 push 自动更新**。手动部署可用（token 在 `~/Library/Preferences/.wrangler`，会自动刷新）：
> ```bash
> export WRANGLER_HOME="$HOME/Library/Preferences/.wrangler"
> <isolated-node>/node_modules/.bin/wrangler pages deploy dist --project-name=deutschheft --branch=main
> ```
> 要恢复自动部署：到仓库 Settings → Secrets 配 `CLOUDFLARE_API_TOKEN`（Pages:Edit 权限）+ `CLOUDFLARE_ACCOUNT_ID`。

- **GitHub Pages**（push 即发布，实测可用）：push main → https://jianwu-atlas.github.io/deutschheft/（`*.github.io` 国内常不可达）
- **Cloudflare Pages**（海外首选）：https://deutschheft.pages.dev/ —— `python3 scripts/pack_site.py` 重建 dist/ → `wrangler pages deploy dist --project-name=deutschheft --branch=main`（见上方 ⚠️）
- **腾讯 EdgeOne Pages**：https://deutschheft.edgeone.cool/（⚠️ `*.edgeone.cool` 被 SNI 丢包，**国内不可达**；要国内需切中国站 + ICP 备案域名）
- **国内方案（推荐）**：腾讯云 COS 静态网站托管（默认域名国内可达、免备案）→ 见 `DEPLOY-CN.md` + `scripts/cos_upload.py`（待开通）
- Cloudflare Workers（可选，需 secrets）：wrangler.toml（name=deutschheft）
- 仓库：https://github.com/jianwu-atlas/deutschheft （描述用中文）

## 更新记录

- 2026-10-15（**logo 回退金印 D 版**，Jian「算了，换回原来的 logo」，英语站不变）：水墨天鹅线稿被判定太细/太小，回退到 Gilded Seal 金印版（`ac3d8e7` 的 favicon.svg/og-image.svg）。① 恢复两 SVG 为金印 D（#201B14 方块 + 金 #C9A227 D + 三点 + jwlab），删除 `favicon-mark.svg`；② `.brand-mark` 46→**34px**（圆角 11→9），指向 `favicon.svg?v=34`；暗色 override 恢复 `background: var(--ink); color: #17140F;`（金印不透明底版，深浅主题均直接可见，无需垫纸底）；③ `gen_logos.py` 9 位图全用 `favicon.svg`；④ `_check_logo.py` 重写为 **14 项金印断言**（全过）；⑤ `deutsch.css` v45→**v46**、logo 组 ?v=33→**?v=34**。注：`brand/` 金印源文件仍是权威源（存档升回为主用）。
- 2026-10-15（水墨 logo 小尺寸修复：mark 加粗版 + 放大，commit `6424185`）：水墨线稿（400 viewBox 上笔画 2-3px）在 34px 导航 mark 上被抗锯齿稀释，几乎只剩一团灰绿（Jian 反馈「太小，快看不到」）。① 新增 `assets/img/favicon-mark.svg`：同构图加粗版（山水线 9、天鹅 6-8、三横 7、圆 r46、删 De Yu 与冠羽），46px 下笔画 ≥1px；② `.brand-mark` 34→46px（圆角 9→11），深浅主题均指向 mark 版；③ favicon-16/32/48 改用 mark 版栅格化（大尺寸位图与 og 仍用主版）；④ `_check_logo.py` 11→17 断言（mark 指向加粗版 / 46px / 墨线像素可见 / 加粗版无冠羽）；⑤ `deutsch.css` v44→v45。
- 2026-10-15（**水墨天鹅 logo，完全参考 Jian 指定图**，替换 Gilded Seal 金印版，commit `d9aaef3`）：
  - 参考图（`~/Documents/5_CPI/0_1-德语/德语logo.png`，500×500 白底）PIL 采样配色：**灰绿 #BEC09D**（水墨圆）/ **墨色 #222222** / De Yu 卡其灰绿 **#A9AA88**（参考图**无红印章**）。
  - 元素（`favicon.svg`，400 viewBox 透明底）：水墨灰绿圆（径向渐变 + 0.6 高斯模糊模拟墨韵）+ 圆内左侧天鹅线稿（圆头/短喙/4 道冠羽/S 颈身/4 道扇形翅）+ 圆内右半「德」+ 山水线（穿过圆下缘、左端下卷云、右端上翘小勾）+ 线下三横小装饰 + 右下「语」+ 左下两行 De Yu。五轮 measure→draw→compare（Playwright 渲染与参考图并排）修正几何。
  - `og-image.svg`：保留纸底 #F6F1E7 + 金带 + MEIN DEUTSCHEHEFT wordmark + jwlab 署名，左侧 logo 内联（`scale(2.4)`）。
  - 流程对齐英语站：新增 `scripts/gen_logos.py`（栅格化 9 位图）+ `scripts/_check_logo.py`（11 项断言全过）。`brand/` 金印源文件降为存档。
  - **暗色主题**：`.brand-mark` 垫纸色底卡（`background: var(--paper) url(...)`）——透明底墨线稿在暗底会消失，不能像英语站那样直接移除 override。
  - 版本号：favicon 组 / `manifest.webmanifest` **?v=33**、`deutsch.css` **?v=44**（13 页）。
- 2026-10-15（英语单词页：蒸馏《15000英语单词口袋书》+ 整合）：
  - **关键前提**：该 PDF **有完整文本层**（1370 页 / 6.5 MB），**无需 OCR** —— 与德语速成（扫描件需 OCR）不同，抽文本仅 17 秒。
  - **蒸馏**：新增 `scripts/build_english.py` → `assets/js/data/english.js`（887 KB）。三层结构 `sections[] → parts[] → scenes[]`；产出 **17 Section / 61 Part / 493 场景 / 7052 词条 / 4644 场景句**。
    - 词条正则：`^[①-⑳]\s*(中文)\s+(英文)\s*\[(音标)\]\s*(词性)` → `{zh,en,ipa,pos}`
    - 场景标题：`^N.M.K 名称$`（`N.M.K` = Section.Part.场景）；Section/Part 名称从**目录页**（p7–p28）另抽
    - **CJK 空格清洗**（PDF 字距造成）：`数 量 相 关`→`数量相关`，`时间 （ 1 ）`→`时间（1）` —— 规则是「去掉 CJK↔CJK 之间、以及全角括号两侧的空格」
  - **整合**：新增 `english.html` + `renderEnglish()`（注册进 `PAGES`）。**三行格式**：英文（15.5px/600）/ 音标（12.5px 等宽胶囊）/ 中文 + 词性（13px 斜体词性）；词条用 `auto-fill minmax(190px)` 网格排布；每场景附「Top10 场景句」（英文/中文两行 + 🔊）。
    - 三级导航：**Section 页签（17）→ Part 页签 → 场景卡片**；另有「隐藏中文自测」（同时收掉词条中文与句子中文）与「📋 复制本 Part 纯英文」。
    - **入口**：教材页「15000 英语单词口袋书」卡片的 **📖 单词精读** 按钮（导航仍不加项，同 sucheng 做法）。
  - **课外约束**：`ENGLISH.meta.extra = true`；词汇不进 `VOCAB` / `wortliste.js`；脚本末尾自检 `gen_wortliste.js` 的 `!b.extra` 过滤仍在（2 处 ✅）。
  - **验证**：`scripts/_test_english.py`（Playwright）**16 项断言全过**（17 Section / Part 切换 / 三行齐全 / 隐藏中文 / 🔊 真触发 / 教材页入口跳转 / **无 JS 错误**）。
  - 版本号：deutsch.js→v41、deutsch.css→v43、新增 `english.js?v=1`。
- 2026-10-15（P2 教材精读：发音篇谐音列 + 小贴士 + 与课内语法的关系）：
  - **发音篇补中文谐音列**：`build_sucheng_extras.py` 新增 `parse_pron_tables()`——OCR 发音篇与场景篇同为**四列制**（`字母及字母组合` / `单词` / `中文意思` / `汉语谐音`），但**按列分离**存储，故按列采集后**按索引 zip**；含 IPA 括号行、页眉页脚、纯数字的过滤。产出 **7 讲 81 行**谐音表（单元音1/2、辅音1/2/3、辅音组合、双元音），插在每讲最前。
  - **小贴士接入**：`build_sucheng.py` 新增 `parse_tips()` + `merge_tips()`。OCR 折行会把一条贴士拆成多行（如「…小写有可」+「能是…」），故**上一行未以句末标点结尾则接续**；`句N:` 开头一律视为新条目；去重并丢弃 < 8 字的残片（OCR 折行错位产生的孤字）。产出 **65 条**，覆盖 36 个场景，渲染为场景卡片内的金色贴士块。
  - **与 `grammatik.html` 的关系（不合并，改为交叉标注）**：两者是**两条独立脉络**——`grammatik.html` 12 专题源自**课内**笔记、按上课进度编排；精读页语法篇 9 讲（覆盖教材 13 章）源自**课外教材**、按书章系统铺开。合并会破坏「课外教材」边界（课外内容会渗进课内页），故采取：① 精读页语法篇顶部加**说明条 + 「↗ 对照课内语法专题」链接**；② 明确「若两边表述有差异，以课内为准」。**如需真正合并，应另立决策**（涉及课外/课内边界，见项目 MEMORY.md 长期规则）。
  - **验证**：`scripts/_test_sucheng_full.py` 扩到 **16 项断言全过**（新增：小贴士区块/条目、发音篇谐音表张数、表头含「汉语谐音」、语法交叉链接），无 JS 错误。
  - 版本号：deutsch.js→v40、deutsch.css→v42、sucheng.js→v3、sucheng-extras.js→v2。
- 2026-10-15（P1 教材精读：会话段 + 发音篇 + 语法篇）：
  - **会话段（423 轮次）**：新增 `parse_dialog()`。OCR 是「A/B 德文行 + 谐音行」**两行制**，中文翻译另列且带说话人标记（`1`/`2`/`A`/`B` 混用）。关键处理：① 说话人标记归一化（`⑧`/`®`→B、`④`→A）；② **谐音行 = 非拉丁为主的下一行**（谐音多以中文开头，故不能要求「不以中文开头」）；③ 中文翻译用 `^标记+中文` 识别，德语轮用 `^标记+空格+拉丁`；④ 德语轮与中文按**顺序 zip 对齐**；⑤ 只取从首个「会话一」起、到 `小贴士`/`词汇`/`场景N` 止的片段（否则会把**单词表**当对话——第一版误得 2231 轮）；⑥ 噪声过滤：至少两个词且有「标记/中文/谐音」之一。
  - **发音篇 7 讲 + 语法篇 9 讲**：新增 `scripts/build_sucheng_extras.py`，把知识库 `~/.workbuddy/wiki-knowledge/wiki/concepts/*.md` 转成 HTML（自带极简 md→HTML：标题/表格/列表/引用/加粗/代码）→ `assets/js/data/sucheng-extras.js`（33 KB）。精读页加**顶层三页签**：🗣 场景精读 / 🔤 发音篇 / 📐 语法篇。
  - **数据**：`sucheng.js` 加 `dialog` 字段；页面加会话渲染（`.sc-turn` + 圆形说话人徽章 A/B 交替配色）、会话 🔊、会话也受「隐藏中文自测」控制。
  - **验证**：`scripts/_test_sucheng_full.py`（Playwright）12 项断言全过：3 页签 / 8 场景 / 8 会话块 / 32 轮 / 32 徽章 / 发音篇 7 讲 / 语法篇 9 讲 14 表 / 隐藏中文对会话生效 / 会话 🔊 真触发 / **无 JS 错误**。
  - 版本号：deutsch.js→v39、deutsch.css→v41、sucheng.js→v2、新增 `sucheng-extras.js?v=1`。
- 2026-10-15（P0 教材精读：方案 C 落地 · 三行格式）：
  - **新增 `sucheng.html`**（导航不新增项，入口＝教材页「零基础德语速成」卡片的 **📖 场景精读** 按钮）：12 个 Einheit 切换 chip + 场景卡片 + **三行格式**（`.s-de` 德文 16px / `.s-zh` 中文 13.5px 金色左条 / `.s-pron` 中文谐音 12.5px 浅胶囊块）+ 逐句 🔊（`__dhSpeak`）+ **隐藏中文自测**（`#app.hide-zh` 同时收掉中文与谐音）+ 📋 复制本单元纯德文。
  - **新增 `scripts/build_sucheng.py`**：从 `~/.workbuddy/wiki-knowledge/raw/lingjichu-sucheng-ocr.txt` 抽「德文/中文/谐音」三元组 → `assets/js/data/sucheng.js`（115 KB）。关键实现：① 以「经典德语瞬间就学会」段为切分依据（不依赖标题行，规避 OCR 写坏 `场罻S`/`场景萹`）；② `classify()` 按「首字符是否中文」判行类型，德文折行/德中混行分别处理；③ OCR 清洗表（`ii→ü`、`B→ß`、行首残留题号、`在了tin` 类杂字）；④ **规范场景标题表** `SCENE_TITLES` 覆盖 OCR 噪声标题（如 `向路`→问路）；⑤ 末尾自检 `gen_wortliste.js` 的 `!b.extra` 过滤仍在（2 处 ✅）。
  - **产出规模**：**70/70 场景 · 606 句型**，缺谐音仅 1 句、德文含中文残留 0。
  - **课外约束**：`SUCHENG.meta.extra = true`；教材词不进 `VOCAB` / `wortliste.js`，页内不提供「加入生词表」入口。
  - **验证**：Playwright 12 项断言全过（12 chips / 8 场景 / 72 句块 / 三行齐全 / 切单元 / 隐藏中文 / 🔊 真触发 `speechSynthesis.speak` / 音标开关共存 / **无 JS 错误**）。
  - 版本号：deutsch.js→v37、deutsch.css→v39、新增 `sucheng.js?v=1`。方案文档见 `docs/整合方案-零基础德语速成.md`。
- 2026-10-15（音标三态 + 点词发音 + PWA 离线 + 第2次课笔记扩充 + 第6组测验）：
  - **音标开关改三态**：`annotate.js` 的 localStorage `deutschheft_annotate` 由 `1/0` 改为 `off / smart / all`；循环顺序 **关 → 常用 → 全部 → 关**。「常用」= 原策略（`BASIC` 功能词不标）；「全部」= 词典命中的词全标（含 ich / der / ist 等简单词）。按钮文案 `音标：关/常用/全部`，`全部` 挡用金色 `#ipaToggle.on.all` 区分；切换后 `location.reload()` 并用 `sessionStorage.dh_scroll` 记住滚动位置。旧值 `"1"` 自动映射为 `smart`（向后兼容）。
  - **点击 / 双击任意单词即朗读**（Jian 2026-10-15）：新增 `wordAtPoint()`（`caretPositionFromPoint` + 边界扩展），`click` / `dblclick` 监听 + 节流 `mousemove`（悬停德语单词时 `cursor:pointer` 反馈）。**不依赖音标开关**；链接 / 按钮 / 输入框 / `<ruby>` 不干预；划词时 click 不触发（避免冲突）；`Ctrl+Space` 朗读选中、`Esc` 停止保留。
  - **PWA / 离线版**（iPad 可用）：新增 `manifest.webmanifest`（`display:standalone`、3 图标、3 个 shortcuts）+ `sw.js`（预缓存应用外壳、同源 GET 缓存优先、导航失败回退 index）+ `assets/js/offline.js`（注册 SW、左下角「📥 离线缓存」按钮一次性下载全站、iOS「添加到主屏幕」提示）。`pack_site.py` 打包时把**全量文件清单**注入 `sw.js` 的 `ALL_FILES` 与 `offline.js` 的 `window.__DH_SW_FILES`；打包清单新增 `sw.js` / `manifest.webmanifest`；12 页 head 加 `<link rel="manifest">`、body 加 `offline.js`（`tts.html` 也加）。本地已用 Playwright 实测：SW `activated`、三态循环、点/双击发音均生效、无 JS 错误。**iPad 用法**：Safari 打开 → 点「📥 离线缓存」→ 分享 → 添加到主屏幕 → 之后离线可看。
  - **第 2 次课笔记扩充**：`content-notion/14_现在完成时DasPerfekt（A1.2-第2次）.md` 由 6.5K → 约 24K，按 2026-10-07&10-14 的 update 版 Notion 导出补齐「四、逐段解析 / 五、新增动词分词表 / 六、阅读理解 22 题（含答案）/ 七、人称代词与全人称变位 / 八～十一、四组练习 / 十二、写作任务与范文」；重跑 `notion_export_sync.py`（14 篇，182 KB）。
  - **新增第 6 组测验**：`QUIZZES` 加 `q6 完成时句子改写`（8 题，把现在时句改写为完成时，句位+助动词+Partizip II）→ **6 组 54 题**。同步更新 `deutsch.js` PAGES 描述、`i18n-en.js`（key 与正则两处）、`uebungen.html` meta、AGENTS.md。
  - 版本号：annotate.js→v32、deutsch.css→v38、deutsch.js→v36、deutsch-data.js→v33、i18n-en.js→v36、notion-notes.js→v31；新增 `offline.js?v=1`。
  - ⚠️ 注：原书笔误 `Klavier`（钢琴）在课件里被译作「小提琴」，站点 `concepts/` 与笔记均已按「钢琴」呈现。
- 2026-10-13（课外教材分类 + 零基础标课外 + 课外词汇不计入词表）：
  - **教材库分组**：`deutsch.js` 的 `renderLehrbuch` 重构为两组——「📘 课内教材 · Kursbuch」（4 份 Lektion 课件）+「📗 课外教材资料 · Extra」；课外书加「课外」徽章（`.lbk-extra`，替换原 ★）。空 `words/sentences/points/text` 段落自动隐藏。
  - **零基础德语速成标为课外**：`lehrbuch.js` 的 `sucheng` 由 `star:true` 改 `extra:true`。
  - **新增英语教材**：`15000 英语单词口袋书`（1370 页，6.8MB）→ `assets/lehrbuch/E1_15000-en-words.pdf`，加入 `LEHRBUECHER`（`id:"enwords"`、`extra:true`、无结构化词句）。
  - **课外词汇不计入词表**：`gen_wortliste.js` 两处 `LEHRBUECHER.forEach` 改 `filter(b=>!b.extra)`；`deutsch-data.js` 的 10 条「零基础新增词汇」整段注释（保留可恢复）。重跑词表：**1053 → 1022 词形**；VOCAB **282 → 272**。
  - 页面描述「5 份教材」→「6 份」（lehrbuch.html 页描述 + title、deutsch.js PAGES、i18n.js `head.lehrbuch.desc`、i18n-en.js）。
  - 版本号：lehrbuch.js v31、wortliste.js v31、deutsch-data.js v32、deutsch.js v35、deutsch.css v36、i18n-en.js v35、i18n.js v36。
- 2026-10-13（课文精读版式重构：三行堆叠 + 逐句中文 + 段末知识点）：
  - **版式**：每句改「三行堆叠」——德文行 / **音标行**（`s-ipa` 由小字改**浅色胶囊块**：`--accent-soft` 底 + `--accent` 字，与德文明确区分）/ **中文行**（`s-zh`，金色左条）。段末新增 **「💡 知识点」框**（`para-notes`：accent 左边条 + 圆角 + `{k,v}` 要点列表）。「隐藏中文翻译（自测）」由隐藏 `para-zh` 改为隐藏 `s-zh`；暗色主题已适配。
  - **数据**：新建 `assets/js/data/texte-extra.js`（`window.TEXTE_EXTRA[textId][段号] = { zhs:[逐句中文], notes:[{k,v}] }`）——**不动大文件 `deutsch-data.js`**。2 篇 × 10 段；逐句中文与 `splitSentences(p.de)` 一一对齐（5 段原文中文与德文句数不一致，按语义手工对齐）。
  - **渲染**：`deutsch.js` 的 `renderTexts` 读取 `TEXTE_EXTRA`，每句加 `s-zh`、段末加 `para-notes`；移除原整段 `para-zh`。
  - `i18n-en.js` 加「💡 知识点 → 💡 Key points」。**EN 模式下逐句中文/知识点保留中文**（与 Notion 笔记行为一致）。
  - 版本号：deutsch.css→v35、deutsch.js→v33、i18n-en.js→v33；`texte.html` 新增 `texte-extra.js?v=1`。
- 2026-10-13（Notion 按上课日期排序 + 站点改名 Jian (Jack) Wu）：
  - **Notion 排序**：`notion_export_sync.py` 新增 `CLASSDATE_OVERRIDES`（前缀映射，仿 `TITLE_OVERRIDES`）+ `class_date()`（优先映射，否则从 front-matter title 解析 `YYYYMMDD`/`YYYY-MM-DD`），输出对象加 `classDate` 字段；`notion-import.js` 的 `renderNotionPage` 对 `all` 按 `(classDate||date)` 升序（无日期排最后、同日期按 id），列表 meta 与阅读器头部改显示上课日期。重跑后 14 篇按上课顺序 `0→1→2→3→5→6→7→9→10→11→12→08-10→13→14`。
  - 注：`date` 字段是「笔记导出日」（14 条里 11 条都是 2026-08-06），无区分度；真·上课时间散在正文/题注且格式乱（`2026-04-10`/`20260615`/`2026-04-XX`），故用映射补全 0/3/5/6/7/13（**估算**，见脚本注释）。
  - **改名**：站点展示位「Jian」→「Jian (Jack) Wu」——12 页导航副标 + 页脚、index meta/og description、`i18n.js` 的 `brand.sub`/`foot.copyright`(EN)、`deutsch-data.js` subtitle、`i18n-en.js` 首页长句（EN_UI key 同步改，否则英文失效）、`brand/og-image.svg`（+ 重栅格化 `assets/img/og-image.png`，字号 30→28、字距 4→2 防超版面）。**未动**课程/笔记正文（正文里的 Jian 是「用音名拼读名字」教学内容）。
  - 版本号：i18n.js→v35、i18n-en.js→v32、deutsch-data.js→v31、notion-notes.js→v32、notion-import.js 首次加 `?v=31`。
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
