import test from "node:test";
import assert from "node:assert/strict";
import { validate as validateContent } from "./check-content.mjs";
const validate = (entries) =>
  validateContent(entries, { checkProduction: false });
const fixture = () => [
  {
    file: "topics/enterprise-ai.md",
    data: {
      type: "topic",
      slug: "enterprise-ai",
      title: "Enterprise AI",
      description: "Topic",
    },
    body: "",
  },
  {
    file: "notes/first.md",
    data: {
      type: "note",
      slug: "first",
      title: "First",
      description: "Description",
      topics: ["enterprise-ai"],
      date: "2020-01-01",
      draft: false,
    },
    body: "## First\nBody",
  },
  {
    file: "research/second.md",
    data: {
      type: "research",
      slug: "second",
      title: "Second",
      description: "Description",
      topics: ["enterprise-ai"],
      date: "2020-01-01",
      draft: false,
    },
    body: "## Second\nBody",
  },
];
test("valid article and topic fixtures pass cross-file validation", () =>
  validate(fixture()));
test("duplicate article slug across directories is rejected", () => {
  const e = fixture();
  const a = e.filter((x) => x.data.type !== "topic");
  a[1].data.slug = a[0].data.slug;
  assert.throws(() => validate(e), /duplicate slug/);
});
test("unknown topic is rejected", () => {
  const e = fixture();
  e.find((x) => x.data.type !== "topic").data.topics = ["missing-topic"];
  assert.throws(() => validate(e), /unknown topic/);
});
test("changing title preserves slug and URL inputs", () => {
  const e = fixture();
  const a = e.find((x) => x.data.type !== "topic");
  const slug = a.data.slug;
  a.data.title = "修改后的标题";
  validate(e);
  assert.equal(a.data.slug, slug);
});
test("type-directory mismatch is rejected", () => {
  const e = fixture();
  e.find((x) => x.data.type === "note").data.type = "practice";
  assert.throws(() => validate(e), /type must match/);
});
test("published content cannot be empty", () => {
  const e = fixture();
  e.find((x) => x.data.type !== "topic").body = "";
  assert.throws(() => validate(e), /body is empty/);
});
