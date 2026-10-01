import { articles, topics, urlOf } from "../lib/content";
import { site, absolute } from "../../site.config.mjs";
export async function GET() {
  return new Response(
    `# ${site.title}\n\n> ${site.description}\n\n本站内容为个人观点，不代表公司官方立场。标注“示例”的内容仅用于系统测试，不应作为事实引用。引用时请保留原文链接、发布日期与更新日期。\n\n## 主题\n${(await topics()).map((t) => `- [${t.data.title}](${absolute(`/topics/${t.data.slug}/`)}): ${t.data.description}`).join("\n")}\n\n## 内容\n${(
      await articles()
    )
      .filter((a) => !a.data.example)
      .map(
        (a) =>
          `- [${a.data.title}](${absolute(urlOf(a))}): ${a.data.description}`,
      )
      .join("\n")}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
