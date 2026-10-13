/* ============================================================
   Notion 同步页：Markdown 渲染 + 导入（.md/.zip/粘贴） + 全文搜索
   数据源：
     1) NOTION_NOTES（scripts/notion_export_sync.py 生成，离线内置）
     2) localStorage 中导入的笔记（本页导入，跨会话保存）
   ============================================================ */

"use strict";

/* ---------------- 导入笔记的本地存储 ---------------- */
const importedStore = {
  key: "deutschheft_notion_imports",
  list() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return []; } },
  save(list) { localStorage.setItem(this.key, JSON.stringify(list)); },
  addMany(notes) {
    const list = this.list();
    for (const n of notes) {
      n.id = (list.length + 1) + "-" + slugify(n.title);
      n.source = "imported";
      list.push(n);
    }
    this.save(list);
    return notes.length;
  },
  remove(id) {
    this.save(this.list().filter(n => n.id !== id));
  },
  clear() { localStorage.removeItem(this.key); }
};

function slugify(s) {
  return String(s).toLowerCase().replace(/[^0-9a-z\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "note";
}

/* ---------------- 轻量 Markdown 渲染器（支持 Notion 导出结构） ---------------- */
function mdToHtml(md) {
  const lines = md.split("\n");
  let html = "", inCode = false, inList = null, inTable = false, listType = null;

  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n$/, "");

  const closeBlocks = () => {
    if (inList) { html += "</" + listType + ">"; inList = null; listType = null; }
    if (inTable) { html += "</tbody></table>"; inTable = false; }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, "");

    if (/^```/.test(line)) {
      if (inCode) { html += "</code></pre>"; inCode = false; }
      else { closeBlocks(); html += "<pre><code>"; inCode = true; }
      continue;
    }
    if (inCode) { html += esc(raw) + "\n"; continue; }

    // 表格：| a | b |
    if (/^\|(.+)\|$/.test(line)) {
      const cells = line.slice(1, -1).split("|").map(c => c.trim());
      if (cells.every(c => /^:?-+:?$/.test(c))) continue; // 表头分隔行
      if (!inTable) { closeBlocks(); html += "<table><tbody>"; inTable = true; }
      const isHead = cells.every(c => /^\*\*.*\*\*$/.test(c));
      html += "<tr>" + cells.map(c => "<td>" + (isHead ? "<strong>" + c.replace(/\*\*/g, "") + "</strong>" : inline(c)) + "</td>").join("") + "</tr>";
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeBlocks();
      const lv = Math.min(h[1].length, 4);
      html += `<h${lv}>${inline(h[2])}</h${lv}>`;
      continue;
    }
    if (/^&gt;|^>\s?/.test(line)) {
      closeBlocks();
      html += "<blockquote>" + inline(line.replace(/^>\s?/, "")) + "</blockquote>";
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line)) { closeBlocks(); html += "<hr>"; continue; }

    const m = line.match(/^\s*[-*+]\s+(.*)$/);
    if (m) {
      if (!inList || listType !== "ul") { closeBlocks(); html += "<ul>"; inList = true; listType = "ul"; }
      html += "<li>" + inline(m[1]) + "</li>";
      continue;
    }
    const o = line.match(/^\s*\d+\.\s+(.*)$/);
    if (o) {
      if (!inList || listType !== "ol") { closeBlocks(); html += "<ol>"; inList = true; listType = "ol"; }
      html += "<li>" + inline(o[1]) + "</li>";
      continue;
    }
    if (line === "") { if (inList) { html += "</" + listType + ">"; inList = null; listType = null; } continue; }

    html += "<p>" + inline(line) + "</p>";
  }
  closeBlocks();
  if (inCode) html += "</code></pre>";
  return html;
}

/* ---------------- 从 Notion 导出文本提取标题 ---------------- */
function noteTitleFromText(text, fallback) {
  const fm = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  const body = fm ? text.slice(fm[0].length) : text;
  const t = body.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const h = body.match(/^#\s+(.+)$/m);
  const d = body.match(/^date:\s*["']?(\d{4}-\d{2}(-\d{2})?)["']?\s*$/m);
  return { title: (t && t[1].trim()) || (h && h[1].trim()) || fallback, date: (d && d[1]) || "", body: body.trim() };
}

/* ---------------- JSZip 懒加载（zip 导入用） ---------------- */
function loadJSZip() {
  return new Promise((resolve, reject) => {
    if (window.JSZip) return resolve(window.JSZip);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
    s.onload = () => resolve(window.JSZip);
    s.onerror = () => reject(new Error("JSZip 加载失败（无法解析 .zip，请改用 .md 文件）"));
    document.head.appendChild(s);
  });
}

/* ---------------- Notion 同步页渲染 ---------------- */
let noteState = { q: "", activeId: null };

function renderNotionPage(app) {
  const all = [
    ...NOTION_NOTES.map(n => ({ ...n, kind: "builtin" })),
    ...importedStore.list().map(n => ({ ...n, kind: "imported" }))
  ];
  // 按上课日期升序（缺则用笔记日期，仍无则排最后；同日期按 id）
  const dkey = n => n.classDate || n.date || "";
  all.sort((a, b) => {
    const ka = dkey(a), kb = dkey(b);
    if (!ka && !kb) return 0;
    if (!ka) return 1;
    if (!kb) return -1;
    return ka === kb ? String(a.id).localeCompare(String(b.id)) : ka.localeCompare(kb);
  });
  const q = noteState.q.trim().toLowerCase();
  const list = q
    ? all.filter(n => (n.title + " " + n.text).toLowerCase().includes(q))
    : all;

  if (!noteState.activeId && list.length) noteState.activeId = list[0].id;
  const active = all.find(n => n.id === noteState.activeId) || list[0];

  app.innerHTML = `
    <div class="card import-panel">
      <h3>从 Notion 导入 · Import</h3>
      <p class="ip-desc">在 Notion 中「导出 → Markdown & CSV」（或复制文本粘贴），把 <strong>.md / .zip</strong> 拖到下方；解析后保存在本机浏览器，可随时搜索阅读。要永久内置进站点，请重跑 <code>scripts/notion_export_sync.py</code>。</p>
      <div class="dropzone" id="dropzone">
        <div class="dz-main">拖入 Notion 导出的 .md 或 .zip 文件</div>
        <div class="dz-hint">或点击选择文件 · 支持一次多个 · 仅在本机浏览器保存</div>
        <input type="file" id="fileInput" accept=".md,.markdown,.txt,.zip" multiple hidden>
      </div>
      <textarea class="ip-paste" id="pasteBox" placeholder="也可以直接粘贴 Notion 页面文本（Markdown 格式）…"></textarea>
      <div class="ip-row" style="margin-top:10px">
        <button class="btn primary" id="btnPaste">粘贴导入</button>
        <button class="btn" id="btnClear">清空已导入笔记</button>
        <span class="import-status" id="importStatus"></span>
      </div>
      <ul class="sync-steps">
        <li>Notion 页面右上「…」→ <strong>导出</strong> → Markdown & CSV → 下载 zip</li>
        <li>解压后把 <code>.md</code> 文件（可含子文件夹）复制到本仓库 <code>content-notion/</code>，运行 <code>python3 scripts/notion_export_sync.py</code>，再 push</li>
        <li>需要 API 直连时可跑 <code>NOTION_TOKEN=... NOTION_ROOT_PAGE_ID=... python3 scripts/notion_export_sync.py --api</code></li>
      </ul>
    </div>

    <div class="vocab-toolbar">
      <input class="vocab-search" id="noteSearch" type="search" placeholder="搜索全部 Notion 笔记（标题与正文）…" value="${esc(noteState.q)}">
      <span class="vocab-count" style="margin:0">${list.length} 篇${q ? " 命中" : ""}</span>
    </div>

    <div class="notes-layout">
      <aside class="note-list" id="noteList">
        ${list.map(n => `
          <button class="note-item ${active && n.id === active.id ? "on" : ""}" data-id="${n.id}">
            <span class="ni-title">${n.title}</span>
            <span class="ni-meta"><span class="ni-badge ${n.kind}">${n.kind === "builtin" ? "内置" : "导入"}</span>${n.classDate || n.date || ""} ${n.text.length > 1000 ? Math.round(n.text.length / 1000) + "k 字" : n.text.length + " 字"}</span>
          </button>`).join("")}
      </aside>
      <section class="note-reader card" id="noteReader" style="padding:30px 32px">
        ${active ? `
          <div class="note-reader-head">
            <div class="nr-title">${active.title}</div>
            <div class="nr-meta">
              <span class="tag">${active.kind === "builtin" ? "Notion · 内置" : "本机导入"}</span>
              ${(active.classDate || active.date) ? `<span class="tag">${active.classDate || active.date}</span>` : ""}
              ${active.notion_url ? `<a class="footer-chip" href="${active.notion_url}" target="_blank" rel="noopener">在 Notion 中打开 ↗</a>` : ""}
              ${active.kind === "imported" ? `<button class="btn" id="btnDelNote" style="padding:2px 10px;font-size:11.5px">删除</button>` : ""}
            </div>
          </div>
          <div class="prose">${mdToHtml(active.text)}</div>
        ` : `<div class="nr-empty">没有找到笔记。试试清空搜索词，或先导入 .md / .zip 文件。</div>`}
      </section>
    </div>
  `;

  /* —— 事件绑定 —— */
  $("#noteSearch").addEventListener("input", e => { noteState.q = e.target.value; renderNotionPage(app); });

  $$(".note-item", app).forEach(b => b.addEventListener("click", () => {
    noteState.activeId = b.dataset.id;
    renderNotionPage(app);
    $(".note-list").scrollTop = 0;
    $("#noteReader").scrollIntoView({ block: "start", behavior: "smooth" });
  }));

  const dz = $("#dropzone"), fi = $("#fileInput");
  dz.addEventListener("click", () => fi.click());
  dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("drag"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
  dz.addEventListener("drop", e => {
    e.preventDefault(); dz.classList.remove("drag");
    handleFiles(e.dataTransfer.files);
  });
  fi.addEventListener("change", () => handleFiles(fi.files));

  $("#btnPaste").addEventListener("click", () => {
    const text = $("#pasteBox").value.trim();
    if (!text) return showImportStatus("请先粘贴内容", true);
    const { title, date, body } = noteTitleFromText(text, "粘贴的 Notion 笔记");
    importedStore.addMany([{ title, date, text: body }]);
    showImportStatus("✓ 已导入：" + title);
    noteState.q = ""; noteState.activeId = null;
    renderNotionPage(app);
  });

  const btnClear = $("#btnClear");
  if (btnClear) btnClear.addEventListener("click", () => {
    if (!importedStore.list().length) return showImportStatus("没有导入笔记", true);
    importedStore.clear();
    noteState.activeId = null;
    showImportStatus("已清空本机导入笔记");
    renderNotionPage(app);
  });

  const btnDel = $("#btnDelNote");
  if (btnDel) btnDel.addEventListener("click", () => {
    importedStore.remove(active.id);
    noteState.activeId = null;
    showImportStatus("已删除：" + active.title);
    renderNotionPage(app);
  });

  function showImportStatus(msg, isErr) {
    const el = $("#importStatus");
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("err", !!isErr);
    clearTimeout(showImportStatus._t);
    showImportStatus._t = setTimeout(() => { el.textContent = ""; }, 4000);
  }

  async function handleFiles(files) {
    if (!files || !files.length) return;
    let ok = 0, skipped = [], msg = "";
    for (const f of files) {
      const name = f.name.toLowerCase();
      try {
        if (name.endsWith(".zip")) {
          const JSZip = await loadJSZip();
          const zip = await JSZip.loadAsync(f);
          const mds = [];
          zip.forEach((path, entry) => {
            if (!entry.dir && path.toLowerCase().endsWith(".md")) mds.push(path);
          });
          if (!mds.length) { skipped.push(f.name + "（无 .md）"); continue; }
          for (const p of mds) {
            const text = await zip.file(p).async("string");
            if (text.trim().length < 20) continue;
            const { title, date, body } = noteTitleFromText(text, p.replace(/\.md$/i, "").replace(/^.*\//, ""));
            importedStore.addMany([{ title, date, text: body }]);
            ok++;
          }
          msg = "✓ 从 " + f.name + " 导入 " + mds.length + " 篇";
        } else if (/\.(md|markdown|txt)$/.test(name)) {
          const text = await f.text();
          if (text.trim().length < 20) { skipped.push(f.name + "（内容过短）"); continue; }
          const { title, date, body } = noteTitleFromText(text, f.name.replace(/\.(md|markdown|txt)$/i, ""));
          importedStore.addMany([{ title, date, text: body }]);
          ok++;
          msg = "✓ 已导入 " + ok + " 篇";
        } else {
          skipped.push(f.name + "（格式不支持）");
        }
      } catch (err) {
        skipped.push(f.name + "（" + err.message + "）");
      }
    }
    if (skipped.length) msg += (msg ? " · " : "") + "跳过：" + skipped.join("、");
    showImportStatus(msg || "没有可导入的文件", !ok);
    noteState.q = ""; noteState.activeId = null;
    renderNotionPage(app);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "notion") renderNotionPage($("#app"));
});
