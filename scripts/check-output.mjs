import fs from "node:fs";
import path from "node:path";
import { parse } from "parse5";
import { origin, production } from "../site.config.mjs";
import { readContent } from "./check-content.mjs";
const root = path.resolve("dist");
const files = fs
  .readdirSync(root, { recursive: true })
  .filter((f) => f.endsWith(".html"));
const errors = [];
const docs = new Map();
function walk(node, fn) {
  fn(node);
  for (const c of node.childNodes || []) walk(c, fn);
}
function attrs(node) {
  return Object.fromEntries((node.attrs || []).map((a) => [a.name, a.value]));
}
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const nodes = [];
  walk(
    parse(text, {
      onParseError: (e) => errors.push(`${file}: HTML parse error ${e.code}`),
    }),
    (n) => {
      if (n.tagName) nodes.push(n);
    },
  );
  const ids = nodes.flatMap((n) => (attrs(n).id ? [attrs(n).id] : []));
  if (new Set(ids).size !== ids.length)
    errors.push(`${file}: duplicate HTML id`);
  docs.set(file, { nodes, ids });
  const meta = Object.fromEntries(
    nodes
      .filter((n) => n.tagName === "meta")
      .map((n) => {
        const a = attrs(n);
        return [a.name || a.property, a.content];
      }),
  );
  for (const key of [
    "description",
    "robots",
    "og:title",
    "og:description",
    "og:url",
    "twitter:card",
    "twitter:title",
    "twitter:description",
  ])
    if (!meta[key]) errors.push(`${file}: missing ${key}`);
  const canonical = nodes.filter(
    (n) => n.tagName === "link" && attrs(n).rel === "canonical",
  );
  if (
    canonical.length !== 1 ||
    !/^https?:\/\//.test(attrs(canonical[0] || {}).href || "")
  )
    errors.push(`${file}: invalid canonical`);
  if (nodes.filter((n) => n.tagName === "h1").length !== 1)
    errors.push(`${file}: expected exactly one H1`);
  if (!nodes.some((n) => n.tagName === "main"))
    errors.push(`${file}: missing main landmark`);
  if (!attrs(nodes.find((n) => n.tagName === "html") || {}).lang)
    errors.push(`${file}: missing language`);
  let level = 0;
  for (const n of nodes) {
    const a = attrs(n);
    if (/^h[1-6]$/.test(n.tagName)) {
      const next = Number(n.tagName[1]);
      if (next > level + 1)
        errors.push(`${file}: heading skips H${level} → H${next}`);
      level = next;
    }
    if (n.tagName === "img" && !("alt" in a))
      errors.push(`${file}: image missing alt`);
    if (n.tagName === "script") {
      if (a.type !== "application/ld+json")
        errors.push(`${file}: unexpected browser JavaScript`);
      else
        try {
          JSON.parse(n.childNodes?.[0]?.value || "");
        } catch {
          errors.push(`${file}: invalid JSON-LD`);
        }
    }
  }
  if (!production && meta.robots !== "noindex, nofollow")
    errors.push(`${file}: preview must be noindex`);
}
for (const [file, { nodes }] of docs) {
  const route = "/" + file.replace(/index\.html$/, "");
  for (const n of nodes) {
    const a = attrs(n);
    for (const raw of [a.href, a.src]) {
      if (!raw || /^(mailto:|tel:|data:)/.test(raw)) continue;
      let u;
      try {
        u = new URL(raw, origin + route);
      } catch {
        errors.push(`${file}: invalid URL ${raw}`);
        continue;
      }
      if (u.origin !== origin) continue;
      let target = decodeURIComponent(u.pathname).replace(/^\//, "");
      if (!target || target.endsWith("/")) target += "index.html";
      if (!fs.existsSync(path.join(root, target))) {
        errors.push(`${file}: broken link ${raw}`);
        continue;
      }
      if (
        u.hash &&
        docs.has(target) &&
        !docs.get(target).ids.includes(decodeURIComponent(u.hash.slice(1)))
      )
        errors.push(`${file}: broken anchor ${raw}`);
    }
  }
}
for (const file of ["sitemap.xml", "rss.xml", "robots.txt", "llms.txt"])
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing ${file}`);
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const [, loc] of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) {
  const u = new URL(loc);
  const target = path.join(root, decodeURIComponent(u.pathname), "index.html");
  if (u.origin !== origin || !fs.existsSync(target))
    errors.push(`bad sitemap URL ${loc}`);
}
const generated =
  files.map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n") +
  ["sitemap.xml", "rss.xml", "llms.txt"]
    .map((f) => fs.readFileSync(path.join(root, f), "utf8"))
    .join("\n");
for (const { data: d } of readContent()) {
  const section =
    d.type === "topic" ? "topics" : d.type === "note" ? "notes" : d.type;
  const route = `/${section}/${d.slug}/`;
  const exists = fs.existsSync(path.join(root, section, d.slug, "index.html"));
  if (d.draft && (exists || generated.includes(route)))
    errors.push(`draft leaked into output: ${route}`);
  if (!d.draft && !exists) errors.push(`missing content page: ${route}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Output checked: ${files.length} pages; internal links, anchors, metadata, JSON-LD, headings, images and zero client JS.`,
);
