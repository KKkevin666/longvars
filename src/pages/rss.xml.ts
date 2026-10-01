import { articles, urlOf, xml, dateOf } from "../lib/content";
import { site, absolute } from "../../site.config.mjs";
export async function GET() {
  const all = await articles();
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(site.title)}</title><description>${xml(site.description)}</description><link>${xml(absolute("/"))}</link><language>zh-cn</language><atom:link href="${xml(absolute("/rss.xml"))}" rel="self" type="application/rss+xml"/>${all[0] ? `<lastBuildDate>${new Date(dateOf(all[0])).toUTCString()}</lastBuildDate>` : ""}${all.map((a) => `<item><title>${xml(a.data.title)}</title><description>${xml((a.data.example ? "【示例内容】" : "") + a.data.description)}</description><link>${xml(absolute(urlOf(a)))}</link><guid isPermaLink="true">${xml(absolute(urlOf(a)))}</guid><pubDate>${new Date(a.data.date).toUTCString()}</pubDate>${a.data.topics.map((t) => `<category>${xml(t)}</category>`).join("")}</item>`).join("")}</channel></rss>`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
}
