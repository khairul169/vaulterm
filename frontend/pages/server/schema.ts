import { z } from "zod";

export const serverSchema = z.object({
  url: z.string().url("Invalid URL"),
});

export const getServerResultSchema = z.object({
  name: z.string(),
  version: z.string().min(1),
});
