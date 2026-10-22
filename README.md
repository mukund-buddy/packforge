# ⛏️ PackForge

![vanilla JS](https://img.shields.io/badge/vanilla-JS-f7df1e?logo=javascript&logoColor=black)
![client-side](https://img.shields.io/badge/client--side-100%25-3dff9e)
![license](https://img.shields.io/badge/license-MIT-4dd0e1)

**The missing sanity-check tool for Minecraft Bedrock packs. Paste or upload your `manifest.json` — get instant, human-readable answers.**

> Part of [The Antigle](https://github.com/mukund-buddy) 🔥 — AI-assisted build, hand-tested by a real MCPE pack user.

**Live demo:** _coming soon_ · [Repository]([https://github.com/mukund-buddy/packforge](https://mukund-buddy.github.io/packforge/))

---

## 🎯 Why This Exists

Every day someone's Bedrock pack "doesn't work" — and 90% of the time
it's a broken `manifest.json`: wrong module type, bad UUID formatting,
mismatched dependencies, or a missing header.

Existing answers are forum posts. PackForge is:

1. **Instant** — paste JSON, click check, read results
2. **Human-readable** — "❌ `modules[0].type` must be `resources` or `data` for texture packs" not "schema error at $.modules"
3. **Beginner-aware** — explains *why* each rule matters and how to fix it
4. **Offline** — your pack files never leave the browser

## ✨ What It Checks (11 rules)

- Header & module blocks exist, `name` and `min_engine_version` are set
- Module type is one of `data`, `resources`, `skin_pack`, `world_template`
- UUID format for header and every module (real `8-4-4-4-12` shape)
- Duplicate module UUIDs (the classic copy-paste crime)
- Dependency `uuid` format + `version` triples
- `format_version`, module `version` and `min_engine_version` number triples

## 🚀 How It Works

```
index.html   →  paste/upload UI with results panel
style.css    →  Bedrock-y dark theme
rules.js     →  THE 11 RULES LIVE HERE (plain data, edit freely)
app.js       →  validates manifest against rules.js, renders fixes
```

Every failure explains **what** broke, **why Minecraft cares**, and **the fix** —
not "schema error at $.modules".

Perfect combo project: **JSON understanding** + **Minecraft knowledge** —
exactly the two things I actually have.

## 🗺️ Roadmap

- [x] Manifest validator (v1)
- [ ] Drag & drop `.mcpack` inspection (unzip in-browser)
- [ ] One-click "fixed JSON" export
- [ ] Behavior pack + addon support
- [ ] Checklists for pack publishing (like Adventigle's install standards)

## 🧑‍💻 Honest Note

AI-assisted, human-tested. Every rule was verified against real packs from
[Adventigle](https://mukund-buddy.github.io/Adventigle/index.html) before shipping here.

## 🏷️ Suggested GitHub Topics

`minecraft` `bedrock` `manifest` `validator` `minecraft-addon` `developer-tools` `vanilla-js` `static-site` `client-side` `the-antigle`

Add them under **Settings → General → Topics** so the pack community can find this.

## 📄 License

MIT
