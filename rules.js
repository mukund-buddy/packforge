/* ============================================================
   PackForge — RULES FILE
   Every rule is a plain object. Adding one = copy an object and edit.
   No JS knowledge needed.

   check(manifest, raw) may return true (pass) or false (fail).
   severity: "critical" (fails the pack) | "major" (should fix)
   ============================================================ */

window.PACK_RULES = [
  {
    id: "header-exists",
    label: "header section exists",
    severity: "critical",
    hint: 'Every pack needs a "header" object at the top: name, description, uuid, version and min_engine_version.',
    check: (m) => !!m.header,
    fix: 'Add a "header" object: { "name": "My Pack", "description": "...", "uuid": "<uuid>", "version": [1,0,0], "min_engine_version": [1,20,0] }',
  },
  {
    id: "modules-exists",
    label: "modules array exists with at least 1 module",
    severity: "critical",
    hint: 'A pack with no "modules" array does literally nothing — Minecraft has nothing to load.',
    check: (m) => Array.isArray(m.modules) && m.modules.length > 0,
    fix: 'Add: "modules": [ { "type": "<see hint>", "uuid": "<uuid>", "version": [1,0,0] } ]',
  },
  {
    id: "header-uuid-format",
    label: "header.uuid looks like a UUID",
    severity: "critical",
    hint: "UUID format: 8-4-4-4-12 hex characters, e.g. 550e8400-e29b-41d4-a716-446655440000.",
    check: (m) =>
      typeof m.header?.uuid === "string" &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(m.header.uuid),
    fix: "Generate a fresh UUID (uuidgenerator.net or `uuidgen` in a terminal) and paste it into header.uuid.",
  },
  {
    id: "module-uuids-valid",
    label: "all module UUIDs look valid",
    severity: "critical",
    hint: "Same UUID format as header — and every module must use a DIFFERENT uuid than the header and each other.",
    check: (m) =>
      Array.isArray(m.modules) &&
      m.modules.length > 0 &&
      m.modules.every(
        (mod) =>
          typeof mod.uuid === "string" &&
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(mod.uuid)
      ),
    fix: "Give each module its own fresh UUID (never reuse the header's).",
  },
  {
    id: "module-uuids-unique",
    label: "all UUIDs are unique (header + modules)",
    severity: "critical",
    hint: "Duplicate UUIDs make packs behave unpredictably or refuse to load.",
    check: (m) => {
      const all = [];
      if (m.header?.uuid) all.push(m.header.uuid);
      (m.modules || []).forEach((mod) => mod.uuid && all.push(mod.uuid));
      return all.length > 0 && new Set(all).size === all.length;
    },
    fix: "Replace duplicated UUIDs with freshly generated ones.",
  },
  {
    id: "module-type-valid",
    label: "each module.type is a real type",
    severity: "critical",
    hint: "Valid types: data (behavior pack code), resources (textures/UI for resource packs), skin_pack, world_template.",
    check: (m) =>
      Array.isArray(m.modules) &&
      m.modules.length > 0 &&
      m.modules.every((mod) =>
        ["data", "resources", "skin_pack", "world_template"].includes(mod.type)
      ),
    fix: 'Set "type" to one of: data, resources, skin_pack, world_template.',
  },
  {
    id: "format-version",
    label: "format_version declared at the top",
    severity: "major",
    hint: "manifest.json should open with a format_version string (e.g. \"1.20.0\"). Without it newer Minecraft may fall back to legacy parsing.",
    check: (m) => typeof m.format_version === "string" && /^\d+\.\d+(\.\d+)?$/.test(m.format_version),
    fix: 'Add as the first line: "format_version": "1.20.0"',
  },
  {
    id: "version-format",
    label: "header.version is [major, minor, patch]",
    severity: "major",
    hint: 'Minecraft expects an array like [1, 0, 0] — not a string like "1.0.0".',
    check: (m) =>
      Array.isArray(m.header?.version) &&
      m.header.version.length === 3 &&
      m.header.version.every((n) => typeof n === "number"),
    fix: 'Use "version": [1, 0, 0] (three numbers, no quotes).',
  },
  {
    id: "min-engine-format",
    label: "min_engine_version is a proper array",
    severity: "major",
    hint: "Example: [1, 20, 0]. Wrong format = pack shows as incompatible in-game.",
    check: (m) =>
      Array.isArray(m.header?.min_engine_version) &&
      m.header.min_engine_version.length === 3 &&
      m.header.min_engine_version.every((n) => typeof n === "number"),
    fix: 'Use "min_engine_version": [1, 20, 0].',
  },
  {
    id: "dependencies-valid",
    label: "dependencies (if any) are well-formed",
    severity: "major",
    hint: "A dependencies array usually points at the companion pack: each entry needs a uuid (or module_name) plus a version array. Malformed entries are silently ignored.",
    check: (m) => {
      if (m.dependencies === undefined) return true;
      if (!Array.isArray(m.dependencies)) return false;
      return m.dependencies.every(
        (d) =>
          d &&
          typeof d === "object" &&
          (typeof d.uuid === "string" || typeof d.module_name === "string") &&
          Array.isArray(d.version)
      );
    },
    fix: 'Each dependency: { "uuid": "<other pack uuid>", "version": [1,0,0] } — or use { "module_name": "minecraft", "version": [...] } for the base game.',
  },
  {
    id: "header-name-set",
    label: "header.name and header.description are filled",
    severity: "major",
    hint: 'An empty name or description shows as "Unnamed pack" in Minecraft — looks broken to users.',
    check: (m) =>
      typeof m.header?.name === "string" && m.header.name.trim().length > 0 &&
      typeof m.header?.description === "string" && m.header.description.trim().length > 0,
    fix: "Add a clear name AND a one-line description to the header.",
  },
];
