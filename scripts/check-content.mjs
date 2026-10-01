import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { site, origin, production } from "../site.config.mjs";
export function readContent(root = "content") {
  const files = fs
    .readdirSync(root, { recursive: true })
    .filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error(`${file}: missing frontmatter`);
    return { file, data: parse(match[1]), body: text.slice(match[0].length) };
  });
}
export function validate(entries, { checkProduction = production } = {}) {
  const errors = [];
  const slugs = new Set();
  const topics = new Set(
    entries.filter((e) => e.data.type === "topic").map((e) => e.data.slug),
  );
  const dirs = {
    note: "notes",
    research: "research",
    practice: "practice",
    topic: "topics",
  };
  for (const { file, data: d, body } of entries) {
    const fail = (message) => errors.push(`${file}: ${message}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug || ""))
      fail("slug must be lowercase ASCII kebab-case");
    const key = `${d.type === "topic" ? "topic" : "article"}:${d.slug}`;
    if (slugs.has(key)) fail(`duplicate slug: ${d.slug}`);
    slugs.add(key);
    if (file.split(path.sep)[0] !== dirs[d.type])
      fail("type must match directory");
    if (!d.title?.trim() || !d.description?.trim())
      fail("title and description required");
    if (d.type !== "topic") {
      if (!Array.isArray(d.topics) || !d.topics.length)
        fail("at least one topic required");
      for (const t of d.topics || [])
        if (!topics.has(t)) fail(`unknown topic ${t}`);
      if (new Set(d.topics).size !== d.topics.length) fail("duplicate topic");
      if (/^#\s/m.test(body))
        fail("body must start headings at H2; title supplies H1");
      if (!d.draft && !body.trim()) fail("published article body is empty");
      if (
        !d.draft &&
        d.date >
          new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" })
      )
        fail("future article must remain draft (no automatic scheduling)");
      if (checkProduction && !d.draft && d.example)
        fail(
          "production cannot publish examples; delete them or set draft: true",
        );
    }
  }
  if (checkProduction) {
    if (!site.author.trim())
      errors.push("site.config.mjs: author is required for production");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email))
      errors.push(
        "site.config.mjs: valid contact email is required for production",
      );
    const url = new URL(site.url);
    if (
      url.protocol !== "https:" ||
      /(^|\.)(example\.(com|org|net)|localhost|pages\.dev)$/.test(
        url.hostname,
      ) ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      errors.push("site.config.mjs: configure your real HTTPS domain");
    if (origin !== site.url.replace(/\/$/, ""))
      errors.push("production SITE_URL must equal the permanent site.url");
  }
  if (errors.length) throw new Error(errors.join("\n"));
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const entries = readContent();
    validate(entries);
    console.log(`Content checked: ${entries.length} Markdown files`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
