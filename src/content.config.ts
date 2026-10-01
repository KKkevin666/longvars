import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Use a real YYYY-MM-DD date",
  );
const articles = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./content",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.union([
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1),
        slug,
        date: day,
        updated: day.optional(),
        type: z.enum(["note", "research", "practice"]),
        topics: z.array(slug).min(1),
        tags: z.array(z.string().min(1)).default([]),
        draft: z.boolean(),
        canonical: z
          .url()
          .refine((v) => v.startsWith("https://"))
          .optional(),
        company_related: z.boolean(),
        example: z.boolean().default(false),
        featured: z.boolean().default(false),
      })
      .strict()
      .refine(
        (v) => !v.updated || v.updated >= v.date,
        "updated must be >= date",
      ),
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1),
        slug,
        type: z.literal("topic"),
        order: z.number().int().default(100),
      })
      .strict(),
  ]),
});
export const collections = { articles };
