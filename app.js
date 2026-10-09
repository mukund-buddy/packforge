/* ============================================================
   PackForge — the forge brain
   1) Strict-parse the manifest (catches trailing commas etc.)
   2) Run each rule from rules.js
   3) Render a readable Forge Report
   ============================================================ */

const $ = (id) => document.getElementById(id);
const input = $("input");
const results = $("results");
const scoreTag = $("scoreTag");
const status = $("status");

const BUFFER_KEY = "packforge-manifest";
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB guard

function storeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}
function storeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    /* ignore */
  }
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function setStatus(message) {
  status.textContent = message || "";
}

function strictParse(text) {
  // Note: a trailing comma makes JSON.parse throw, so it is reported by
  // the "JSON is invalid" path below rather than by a separate rule.
  try {
    return { ok: true, data: JSON.parse(text), error: "" };
  } catch (e) {
    return { ok: false, data: null, error: e.message };
  }
}

function check() {
  const raw = input.value.trim();
  results.innerHTML = "";

  if (!raw) {
    results.innerHTML = '<p class="dim">Paste a manifest.json first.</p>';
    scoreTag.textContent = "—";
    scoreTag.className = "tag";
    setStatus("");
    return;
  }

  const parsed = strictParse(raw);
  if (!parsed.ok) {
    scoreTag.textContent = "BROKEN";
    scoreTag.className = "tag bad";
    results.innerHTML =
      '<div class="line fail"><span class="icon" aria-hidden="true">✗</span><div><b>JSON is invalid.</b>' +
      '<div class="sub">' + esc(parsed.error) + "</div>" +
      '<div class="sub">Trailing commas are the usual suspect — fix the syntax, then re-run the check.</div></div></div>';
    setStatus("Manifest is broken JSON — nothing was checked.");
    return;
  }

  const manifest = parsed.data;
  const rules = window.PACK_RULES || [];
  let passed = 0;
  let criticalFails = 0;
  let warnings = 0;
  let html = "";

  for (const rule of rules) {
    let ok = false;
    try {
      ok = !!rule.check(manifest, raw);
    } catch (e) {
      ok = false;
    }

    if (ok) {
      passed++;
      html +=
        '<div class="line pass"><span class="icon" aria-hidden="true">✓</span><div><b>' +
        esc(rule.label) +
        "</b></div></div>";
    } else {
      const critical = rule.severity === "critical";
      if (critical) criticalFails++;
      else warnings++;
      html +=
        '<div class="line ' + (critical ? "fail" : "warn") + '">' +
        '<span class="icon" aria-hidden="true">' + (critical ? "✗" : "!") + "</span>" +
        "<div><b>" + esc(rule.label) + "</b>" +
        '<div class="sub"><b>Why it matters:</b> ' + esc(rule.hint) + "</div>" +
        '<div class="sub"><b>Fix:</b> ' + esc(rule.fix) + "</div></div></div>";
    }
  }

  results.innerHTML = html;

  const total = rules.length;
  if (criticalFails === 0 && warnings === 0) {
    scoreTag.textContent = "PASS";
    scoreTag.className = "tag good";
    setStatus("All " + total + " rules passed.");
  } else if (criticalFails > 0) {
    scoreTag.textContent = criticalFails + " CRITICAL";
    scoreTag.className = "tag bad";
    setStatus(passed + "/" + total + " passed · " + criticalFails + " critical · " + warnings + " warnings");
  } else {
    scoreTag.textContent = "MINOR ISSUES";
    scoreTag.className = "tag warn-tag";
    setStatus(passed + "/" + total + " passed · " + warnings + " things to fix");
  }
}

async function copyReport() {
  const tag = scoreTag.textContent.trim();
  const lines = [];
  lines.push("PackForge report — " + (tag === "—" ? "not checked" : tag));
  if (status.textContent) lines.push(status.textContent);
  lines.push("");
  results.querySelectorAll(".line").forEach((row) => {
    const icon = row.classList.contains("pass") ? "[x]" : row.classList.contains("fail") ? "[!]" : "[~]";
    const title = row.querySelector("b");
    lines.push(icon + " " + (title ? title.textContent : ""));
    row.querySelectorAll(".sub").forEach((sub) => lines.push("     " + sub.textContent));
  });

  if (!lines.length) {
    setStatus("Nothing to copy — run the check first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    setStatus("Report copied to clipboard.");
  } catch (e) {
    setStatus("Clipboard blocked by the browser — select the report and copy manually.");
  }
}

/* ---------- Wiring ---------- */
$("btnCheck").addEventListener("click", check);
$("btnCopyReport").addEventListener("click", copyReport);

$("btnSample").addEventListener("click", () => {
  input.value = JSON.stringify(
    {
      header: {
        name: "Cool Texture Pack",
        description: "",
        uuid: "this-is-not-a-uuid",
        version: "1.0.0",
        min_engine_version: [1, 20, 0],
      },
      modules: [
        {
          type: "textures",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          version: [1, 0, 0],
        },
        {
          type: "resources",
          uuid: "550e8400-e29b-41d4-a716-446655440000",
          version: [1, 0, 0],
        },
      ],
    },
    null,
    2
  );
  storeSet(BUFFER_KEY, input.value);
  check();
});

$("btnClear").addEventListener("click", () => {
  input.value = "";
  results.innerHTML = '<p class="dim">Results appear here. Click "Check Manifest".</p>';
  scoreTag.textContent = "—";
  scoreTag.className = "tag";
  setStatus("");
  storeSet(BUFFER_KEY, "");
});

/* File upload — input is visually hidden but focusable, label is the button.
   Full error path: unreadable, oversized, and wrong-type files all report. */
$("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > MAX_FILE_BYTES) {
    setStatus("That file is over 2 MB — a manifest.json should be a few KB.");
    e.target.value = "";
    return;
  }
  if (file.type && file.type.indexOf("json") === -1 && !/\.json$/i.test(file.name)) {
    setStatus('"' + file.name + '" doesn\'t look like a JSON file.');
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => setStatus("Could not read that file.");
  reader.onload = () => {
    input.value = String(reader.result || "");
    storeSet(BUFFER_KEY, input.value);
    check();
  };
  reader.readAsText(file);
  e.target.value = "";
});

input.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") check();
});

input.addEventListener("input", () => storeSet(BUFFER_KEY, input.value));

/* restore last manifest */
const saved = storeGet(BUFFER_KEY);
if (saved) input.value = saved;
