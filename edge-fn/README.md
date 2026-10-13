# edge-fn · 文本转 MP3 云函数

Mein Deutschheft 的「实时粘贴任意德文 → 真 MP3」后端（B 方案）。引擎 = **微软 Edge TTS**
（`msedge-tts`，免费、无需 API key；音色与 speecher.org 的 Lena/Tobias 同源）。

## 本地跑

```bash
cd edge-fn
npm install
node server.js            # 默认 http://127.0.0.1:8787
```

自测：

```bash
curl -X POST http://127.0.0.1:8787/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Mein Name ist Daniel.","voice":"katja"}' \
  --output test.mp3
```

## 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/` 或 `/health` | `{ ok:true }` |
| GET | `/voices` | 德语音色映射 |
| POST | `/tts` | body `{ text, voice?, rate? }` → `audio/mpeg`（附件下载） |

`voice`：`katja`(默认,女≈Lena) / `tobias`(男) / `seraphina` / `conrad` / 或任意 Edge ShortName（如 `de-DE-KatjaNeural`）。
`rate`：`"-10%"` / `"+5%"` 等，可选。

## 部署（选一）

- **WorkBuddy 云函数 / 发布为应用**：把本目录作为一个 Node HTTP 服务部署，得到公网 URL。
- **腾讯 EdgeOne Cloud Function**：Node 运行时，`server.js` 需改成 EdgeOne 的 handler 导出（`exports.handler`），逻辑不变。
- **Vercel / Render / Railway**：`npm start`，`PORT` 由平台注入。

> Cloudflare Worker 运行时不含 Node 的 `ws` 依赖，需改用 Worker 版 TTS 封装；本函数按标准 Node HTTP 写。

## 部署后：接入站点

拿到函数公网地址（如 `https://deutschheft-tts.xxx.workbuddy.cn`）后：

1. 打开 `../tts.html`，把顶部 `const TTS_ENDPOINT = ""` 填成你的地址（**不带**末尾 `/tts`）。
2. 部署后「文本转 MP3」页即可在线合成 + 下载。
