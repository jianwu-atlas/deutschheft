/* ============================================================
   player.js · DhPlayer —— 源无关朗读播放器（Jian 2026-10-29）
   ------------------------------------------------------------
   单一职责：状态机 + 队列 + 高亮调度。两种声源：
     ① TTS  —— Web Speech，按「句队列」逐句朗读（暂停保留句索引，继续从本句重读）
     ② MP3  —— <audio>，原生 pause/play（天然从中断处继续）
   页面侧只需：渲染带 data-para / data-p / data-s 的节点，并订阅 onChange。
   说明：不用 speechSynthesis.pause()——Chrome 桌面与 iOS Safari 不可靠；
        句队列同时规避 iOS 单条 utterance 长度截断（约 200–300 字符）。
   ============================================================ */
(function () {
  "use strict";

  const SPEED_KEY = "deutschheft_srate";          // 与 annotate.js 共用同一语速键
  const MP3_RATE = { 0.66: 0.8, 0.88: 1.0, 1.10: 1.2 };  // MP3 基准不同，做一次映射
  const GAP = 180;                                 // 句间停顿（ms）

  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    voice = (speechSynthesis.getVoices() || []).find(v => /^de(-|_)/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  const st = { mode: "idle", source: null, items: [], i: 0, para: null };
  const subs = [];
  let audio = null;
  let timer = null;

  const emit = () => {
    const s = {
      mode: st.mode, source: st.source, i: st.i, total: st.items.length,
      para: st.para, item: st.items[st.i] || null,
      time: audio ? audio.currentTime : 0, dur: audio && isFinite(audio.duration) ? audio.duration : 0
    };
    subs.forEach(fn => { try { fn(s); } catch (e) { /* 订阅方异常不影响播放 */ } });
  };
  const changed = () => { emit(); };

  /* ---------- 高亮与滚动 ---------- */
  const reduceMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clearHl() {
    document.querySelectorAll(".s-reading").forEach(el => el.classList.remove("s-reading"));
    document.querySelectorAll(".para-reading").forEach(el => el.classList.remove("para-reading"));
  }

  function ensureVisible(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < 72 || r.bottom > vh - 72) {
      el.scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
    }
  }

  function highlight(it, paraOnly) {
    clearHl();
    if (paraOnly != null) {
      const el = document.querySelector('.card.para[data-para="' + paraOnly + '"]');
      if (el) { el.classList.add("para-reading"); ensureVisible(el); }
      return;
    }
    if (!it) return;
    const el = document.querySelector('.s-line[data-p="' + it.p + '"][data-s="' + it.s + '"]');
    if (el) { el.classList.add("s-reading"); ensureVisible(el); }
  }

  /* ---------- 语速 ---------- */
  function rate() {
    const v = parseFloat(localStorage.getItem(SPEED_KEY));
    return (v === 0.66 || v === 0.88 || v === 1.10) ? v : 0.88;
  }

  /* ---------- TTS 句队列 ---------- */
  function stopTTS() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    clearTimeout(timer);
  }

  function speakCurrent() {
    if (st.mode !== "playing" || st.source !== "tts") return;
    const it = st.items[st.i];
    if (!it) { finish(); return; }
    highlight(it);
    changed();
    const u = new SpeechSynthesisUtterance(it.text);
    u.lang = "de-DE";
    u.rate = rate();
    if (voice) u.voice = voice;
    const advance = () => {
      if (st.mode !== "playing" || st.source !== "tts") return;
      st.i += 1;
      if (st.i >= st.items.length) { finish(); return; }
      timer = setTimeout(speakCurrent, GAP);
    };
    u.onend = advance;
    u.onerror = advance;
    speechSynthesis.speak(u);
  }

  function finish() {
    st.mode = "idle"; st.source = null; st.i = 0; st.para = null;
    clearHl();
    changed();
  }

  /* ---------- MP3 ---------- */
  function ensureAudio() {
    if (!audio) {
      audio = new Audio();
      audio.preload = "none";
      audio.addEventListener("timeupdate", changed);
      audio.addEventListener("ended", () => { st.mode = "idle"; st.source = null; clearHl(); changed(); });
    }
    return audio;
  }

  /* ---------- 对外 API ---------- */
  const DhPlayer = {
    state() { return { mode: st.mode, source: st.source, i: st.i, total: st.items.length, para: st.para }; },
    onChange(fn) { subs.push(fn); },
    audioEl() { return audio; },                  // 供调试/测试观察 MP3 进度

    playTTS(items) {
      if (!("speechSynthesis" in window) || !items || !items.length) return;
      if (audio) { audio.pause(); }
      stopTTS();
      st.source = "tts"; st.items = items; st.i = 0; st.para = null; st.mode = "playing";
      speakCurrent();
    },

    playMp3(src, opts) {
      opts = opts || {};
      stopTTS();
      const a = ensureAudio();
      if (a.getAttribute("src") !== src) { a.src = src; a.currentTime = 0; }
      a.playbackRate = MP3_RATE[rate()] || 1;
      st.source = "mp3"; st.items = []; st.i = 0;
      st.para = (opts.para != null ? opts.para : null);
      st.mode = "playing";
      a.onerror = () => {                      // 文件缺失 → 退回在线朗读（进度丢失，明确行为）
        if (opts.fallbackText && "speechSynthesis" in window && window.__dhSpeak) {
          st.source = null; st.mode = "idle"; clearHl(); changed();
          window.__dhSpeak(opts.fallbackText);
        }
      };
      highlight(null, st.para);
      changed();
      a.play().catch(() => { DhPlayer.stop(); });
    },

    pause() {
      if (st.mode !== "playing") return;
      st.mode = "paused";
      if (st.source === "tts") stopTTS();
      else if (audio) audio.pause();
      changed();
    },

    resume() {
      if (st.mode !== "paused") return;
      st.mode = "playing";
      if (st.source === "tts") speakCurrent();     // 从当前句重读（最多回退一句）
      else if (audio) { audio.playbackRate = MP3_RATE[rate()] || 1; audio.play(); }
      changed();
    },

    toggle() { st.mode === "playing" ? DhPlayer.pause() : DhPlayer.resume(); },

    stop() {
      stopTTS();
      if (audio) { audio.pause(); audio.currentTime = 0; }
      st.mode = "idle"; st.source = null; st.items = []; st.i = 0; st.para = null;
      clearHl();
      changed();
    },

    setRate(r) {                                  // 下一句生效（Web Speech 限制）；MP3 立即生效
      localStorage.setItem(SPEED_KEY, String(r));
      if (audio && st.source === "mp3") audio.playbackRate = MP3_RATE[r] || 1;
    },
    rate
  };

  /* ---------- 生命周期：切后台 TTS 暂停、MP3 继续；离开页面全部停止 ---------- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && st.mode === "playing" && st.source === "tts") DhPlayer.pause();
  });
  window.addEventListener("pagehide", () => DhPlayer.stop());

  window.DhPlayer = DhPlayer;
})();
