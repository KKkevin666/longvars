import { pages, xml, articles, topics, dateOf } from "../lib/content";
import { absolute } from "../../site.config.mjs";
export async function GET() {
  const all = await articles();
  const ts = await topics();
  const entries = await pages();
  for (const p of entries) {
    const t = ts.find((t) => p.path === `/topics/${t.data.slug}/`);
    if (t)
      p.modified = all
        .filter((a) => a.data.topics.includes(t.data.slug))
        .map(dateOf)
        .sort()
        .at(-1);
  }
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries
      .filter(
        (p) =>
          !all.some(
            (a) =>
              a.data.canonical &&
              p.path ===
                `/${a.data.type === "note" ? "notes" : a.data.type}/${a.data.slug}/` &&
              a.data.canonical !== absolute(p.path),
          ),
      )
      .map(
        (p) =>
          `<url><loc>${xml(absolute(p.path))}</loc>${p.modified ? `<lastmod>${p.modified}</lastmod>` : ""}</url>`,
      )
      .join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
