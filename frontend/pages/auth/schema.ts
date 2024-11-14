import { z } from "zod";

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginResultSchema = z.object({
  sessionId: z.string().min(40),
});

export const registerSchema = z
  .object({
    name: z.string().min(3),
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(3),
    confirmPassword: z.string().min(3),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
