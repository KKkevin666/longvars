import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { readContent } from "./check-content.mjs";
const [type, slugArg, titleArg] = process.argv.slice(2);
const dirs = { note: "notes", research: "research", practice: "practice" };
if (!dirs[type]) throw new Error("Unknown content type");
let slug = slugArg,
  title = titleArg;
if (!slug) {
  if (!process.stdin.isTTY)
    throw new Error('Usage: npm run new:note -- english-slug "标题"');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  slug = await rl.question("永久英文 slug: ");
  title = await rl.question("标题: ");
  rl.close();
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
  throw new Error("Use lowercase ASCII kebab-case slug");
if (readContent().some((e) => e.data.type !== "topic" && e.data.slug === slug))
  throw new Error("Slug already exists");
const date = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Shanghai",
});
const file = path.join("content", dirs[type], `${slug}.md`);
const data = {
  title: title || "待填写标题",
  description: "待填写：用一两句话说明本文讨论的问题。",
  slug,
  date,
  updated: date,
  type,
  topics: ["enterprise-ai"],
  tags: [],
  draft: true,
  company_related: false,
  example: false,
  featured: false,
};
fs.writeFileSync(
  file,
  `---\n${Object.entries(data)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(
      "\n",
    )}\n# canonical: https://original-source.example/article/\n---\n\n## 问题\n\n待补充正文。发布前请核实事实、修改描述并设置 draft: false。\n`,
  { flag: "wx" },
);
console.log(
  `Created ${file} (draft). Keep slug and type stable after publication.`,
);
