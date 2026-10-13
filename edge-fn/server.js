/* ============================================================
   Mein Deutschheft · 文本转 MP3 云函数（B：实时粘贴任意德文 → 真 MP3）
   引擎：微软 Edge TTS（msedge-tts，免费无 key；音色同 Speecher 的 Lena/Tobias）

   接口：
     GET  /        健康检查 → { ok:true }
     GET  /voices  返回德语音色映射
     POST /tts     body: { text, voice?, rate? } → 音频流 audio/mpeg
                   voice: katja(默认,女) | tobias(男) | seraphina | conrad | 任意 ShortName
                   rate : 如 "-10%" / "+5%"（可选）

   部署：任意 Node 18+ 的 FaaS / HTTP 服务（EdgeOne Cloud Function、
        WorkBuddy 云函数、Cloudflare Worker 需把 ws 换成对应运行时）。
   启动：npm i && node server.js   （监听 PORT，默认 8787）
   ============================================================ */
const http = require("http");
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const PORT = Number(process.env.PORT || 8787);
const ALLOW_ORIGIN = process.env.TTS_ORIGIN || "*";   // 生产可设为站点域名收紧
const VOICES = {
  katja: "de-DE-KatjaNeural",                         // ≈ Speecher 的 Lena（女，默认）
  tobias: "de-DE-KillianNeural",                      // ≈ Speecher 的 Tobias（男）
  seraphina: "de-DE-SeraphinaMultilingualNeural",
  conrad: "de-DE-ConradNeural",
};
const MAX_TEXT = 5000;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOW_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "";
    req.on("data", c => { b += c; if (b.length > MAX_TEXT * 2) { reject(new Error("文本过长")); req.destroy(); } });
    req.on("end", () => resolve(b));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  let pathname = req.url.split("?")[0];

  if (req.method === "GET" && (pathname === "/" || pathname === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, service: "deutschheft-tts" }));
    return;
  }
  if (req.method === "GET" && pathname === "/voices") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(VOICES));
    return;
  }

  if (req.method === "POST" && pathname === "/tts") {
    let body;
    try { body = JSON.parse((await readBody(req)) || "{}"); }
    catch (e) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "JSON 解析失败" })); return; }

    const text = String(body.text || "").trim();
    if (!text) { res.writeHead(400, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "text 不能为空" })); return; }
    if (text.length > MAX_TEXT) { res.writeHead(413, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: "文本超过 " + MAX_TEXT + " 字符" })); return; }

    const vKey = String(body.voice || "katja").toLowerCase();
    const vName = VOICES[vKey] || String(body.voice) || VOICES.katja;
    const prosody = body.rate ? { rate: String(body.rate) } : undefined;

    let tts = null;
    try {
      tts = new MsEdgeTTS();
      await tts.setMetadata(vName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = await tts.toStream(text, prosody);
      const slug = text.slice(0, 24).replace(/[^\w\u00C0-\u024F-]+/g, "_");
      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="deutschheft_' + slug + '.mp3"',
      });
      audioStream.pipe(res);
      audioStream.on("end", () => { if (tts) tts.close(); });
      audioStream.on("error", () => { if (tts) tts.close(); });
      res.on("close", () => { if (tts) tts.close(); });
    } catch (e) {
      if (tts) { try { tts.close(); } catch (_) {} }
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message || "TTS 合成失败" }));
      }
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => console.log("deutschheft-tts listening on :" + PORT));
