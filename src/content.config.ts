import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const collections = {
  publications: defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/publications" }),
    schema: z.object({
      title: z.string(),
      author: z.string(),
      journal: z.string().optional(),
      year: z.string(),
      doi: z.string().optional(),
    }),
  }),
};
