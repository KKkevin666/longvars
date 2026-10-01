import { production, absolute } from "../../site.config.mjs";
export function GET() {
  return new Response(
    `User-agent: *\n${production ? "Allow: /" : "Disallow: /"}\nSitemap: ${absolute("/sitemap.xml")}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
