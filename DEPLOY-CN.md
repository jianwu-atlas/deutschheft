# 国内访问部署 Runbook · Mein Deutschheft

> 记录时间：2026-10-14（最后更新 12:10）　|　站点：`~/Documents/5_CPI/0_1-德语/deutschheft`

## TL;DR
**国内用「腾讯云 COS 静态网站托管」**（免备案、国内节点、免费额度内）。
一次性：建桶 → 开静态托管 → 配凭证 → 上传。
以后每次改站点：重新构建 `dist/` → `./scripts/cos_upload.py`。

---

## 一、为什么前面三条路全断了（都是硬伤，非配置问题）

| 方案 | 结论 | 证据 |
|---|---|---|
| `deutschheft.pages.dev`（Cloudflare） | ❌ | `*.pages.dev` 在国内被 DNS 污染 |
| `deutschheft.edgeone.cool`（EdgeOne 国际站） | ❌ | `*.edgeone.cool` **整域被按 SNI 丢包**（直连 IP 返回 200、带正确 SNI 超时 18s，连不存在的子域也超时）；且 EdgeOne 要国内可访问必须选「全球可用区（含中国大陆）」+ **已 ICP 备案的自有域名** |
| `*.gitee.io`（Gitee Pages） | ❌ | **Gitee 官方确认已停服**：issue #ICWQ7X 人员回复「因业务调整，Pages 已于去年下线」；#IHMP10（2026-03）「个人账号 Pages 入口缺失」至今无人回复。我们仓库 `/pages`、`/settings/pages` 全 404 |

> 注：Cloudflare Pages + 自有域名是「能用但慢」，不是不能用；见文末备选。

## 二、诊断命令（可复现）

```bash
# EdgeOne：站点活着但域名被墙
curl -k -H "Host: deutschheft.edgeone.cool" https://43.174.247.29/          # → 200
curl --resolve deutschheft.edgeone.cool:443:43.174.247.29 \
     https://deutschheft.edgeone.cool/                                       # → 000 超时
```

## 三、COS 开通步骤（一次性，约 5 分钟）

### 1. 建存储桶
控制台 → https://console.cloud.tencent.com/cos/bucket → **创建存储桶**
- **名称**：全球唯一，建议 `deutschheft-<你的APPID>`（如 `deutschheft-1473106780`）
- **地域**：选**国内**（`ap-chengdu` 成都 / `ap-shanghai` 上海 / `ap-guangzhou` 广州）
- 访问权限：**公有读私有写**
- 其他默认

### 2. 开启静态网站托管
桶 → **基础配置 → 静态网站托管**
- **索引文档**：`index.html`
- **错误文档**：`404.html`（没有这个文件，填 `index.html` 也行）
- 保存后，**根域名**即可直接访问：
  `https://<桶名>.cos.<地域>.myqcloud.com/`

### 3. 配凭证（本地输入，不进仓库、不进聊天）
创建 API 密钥：https://console.cloud.tencent.com/cam/capi （建议只授 COS 相关权限）

```bash
cd ~/Documents/5_CPI/0_1-德语/deutschheft
./scripts/cos-setup.sh          # 交互式输入 SecretId/SecretKey/桶名/地域
```
写入 `~/.deutschheft-cos.json`（权限 600，放在家目录，不会进仓库）。

### 4. 上传
```bash
./scripts/cos_upload.py
```
逐个文件打印状态，最后输出国内访问地址。

> `scripts/cos_upload.py` 只用 Python 标准库（不依赖 pip），已验证可连通 COS 并能正确上报错误。

## 四、以后「同步国内」

```bash
cd ~/Documents/5_CPI/0_1-德语/deutschheft
# 1) 重新构建 dist/（按你现有构建流程）
# 2) 上传：
./scripts/cos_upload.py
```

海外那份照旧：`git push` → Cloudflare Pages 自动部署。

## 五、地址速查

| 用途 | 地址 | 状态 |
|---|---|---|
| 🇨🇳 国内主用 | `https://<桶名>.cos.<地域>.myqcloud.com/` | 待开通 |
| 🌍 海外 | `deutschheft.pages.dev` | ✅ 在用 |
| 备用 | `jianwu-atlas.github.io/deutschheft` | ⚠️ 国内不稳 |
| （已废） | `deutschheft.edgeone.cool` / `*.gitee.io` | ❌ 域名被墙 / 官方停服 |

## 六、备选与长期方案

| 方案 | 成本 | 周期 | 评价 |
|---|---|---|---|
| **COS 静态托管**（当前） | 免费额度内 | 5 分钟 | ✅ 唯一「免费 + 国内可用 + 免备案」 |
| 买域名 + Cloudflare Pages | ~¥70/年 | 5 分钟 | 域名即绕开 `pages.dev` 封锁，但 Cloudflare 免费节点国内时快时慢 |
| 域名 + ICP 备案 + EdgeOne 国内站 | ~¥70/年 | **1–2 周** | 最稳，适合长期正式对外 |
| CloudBase 静态托管 | 有免费额度 | — | 默认域名带「访客中间页」拦截，体验差 |

## 七、踩坑记录

| 现象 | 原因 | 处理 |
|---|---|---|
| `error: No such remote 'origin'` | `/tmp/dh_gitee` 是 `git init` 独立包，没有远端 | 已补 `origin` |
| `ssh-keygen` 弹 `Overwrite (y/n)?` | 会覆盖连 sonilab 的 `id_ed25519` | 按 `n`，钥匙完好 |
| 前台 push 27M 被杀 | 2 分钟超时 | 改后台跑 |
| 浏览器 `gitee.com` NXDOMAIN | MPI 解析器 `134.176.2.5` 对 Gitee 的百度链路 CNAME 间歇 SERVFAIL | 用 `www.gitee.com`，或 `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder` |
| `pip install coscmd` 报 EEXIST | 沙箱瞬时故障 | 改为标准库实现的 `cos_upload.py` |
