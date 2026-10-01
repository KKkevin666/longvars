import { getCollection, type CollectionEntry } from "astro:content";
export type Entry = CollectionEntry<"articles">;
export type Article = Entry & {
  data: Extract<Entry["data"], { date: string }>;
};
export type Topic = Entry & { data: Extract<Entry["data"], { type: "topic" }> };
export const sections = {
  notes: {
    type: "note",
    title: "短观点",
    label: "短观点",
    description: "尚在形成中的判断、工作观察与值得继续追问的问题。",
  },
  research: {
    type: "research",
    title: "研究文章",
    label: "研究",
    description: "围绕长期问题展开的研究，随着认知和证据持续更新。",
  },
  practice: {
    type: "practice",
    title: "实践复盘",
    label: "实践",
    description: "方法、项目复盘与实践记录。区分可验证事实和个人判断。",
  },
} as const;
export const dateOf = (a: Article) => a.data.updated || a.data.date;
export const urlOf = (a: Article) =>
  `/${a.data.type === "note" ? "notes" : a.data.type}/${a.data.slug}/`;
export const labelOf = (a: Article) =>
  a.data.type === "note"
    ? "短观点"
    : a.data.type === "research"
      ? "研究文章"
      : "实践复盘";
export async function articles(): Promise<Article[]> {
  return (await getCollection("articles"))
    .filter((a): a is Article => a.data.type !== "topic" && !a.data.draft)
    .sort(
      (a, b) =>
        dateOf(b).localeCompare(dateOf(a)) ||
        a.data.slug.localeCompare(b.data.slug),
    );
}
export async function topics(): Promise<Topic[]> {
  return (await getCollection("articles"))
    .filter((a): a is Topic => a.data.type === "topic")
    .sort((a, b) => a.data.order - b.data.order);
}
export async function related(a: Article) {
  return (await articles())
    .filter(
      (b) =>
        b.id !== a.id && b.data.topics.some((t) => a.data.topics.includes(t)),
    )
    .sort(
      (x, y) =>
        y.data.topics.filter((t) => a.data.topics.includes(t)).length -
        x.data.topics.filter((t) => a.data.topics.includes(t)).length,
    )
    .slice(0, 3);
}
export const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export async function pages() {
  return [
    ...[
      "/",
      "/about/",
      "/topics/",
      "/notes/",
      "/research/",
      "/practice/",
      "/archive/",
    ].map((path) => ({ path, modified: undefined as string | undefined })),
    ...(await topics()).map((t) => ({
      path: `/topics/${t.data.slug}/`,
      modified: undefined as string | undefined,
    })),
    ...(await articles()).map((a) => ({ path: urlOf(a), modified: dateOf(a) })),
  ];
}
