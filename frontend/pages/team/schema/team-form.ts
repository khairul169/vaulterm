import { SelectItem } from "@/components/ui/select";
import { z } from "zod";

export const teamFormSchema = z.object({
  id: z.string().ulid().nullish(),
  name: z.string().min(1, { message: "Name is required" }),
  icon: z.string().emoji("Icon is not valid."),
});

export type TeamFormSchema = z.infer<typeof teamFormSchema>;

const teamRoles = ["owner", "admin", "member"] as const;

export const inviteSchema = z.object({
  teamId: z.string().ulid(),
  username: z.string().min(1, { message: "Username/email is required" }),
  role: z.enum(teamRoles, {
    errorMap: () => ({ message: "Role is required" }),
  }),
});

export const teamMemberRoles: SelectItem[] = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Member", value: "member" },
];

export type InviteSchema = z.infer<typeof inviteSchema>;

export const setRoleSchema = z.object({
  teamId: z.string().ulid(),
  userId: z.string().ulid(),
  role: z.enum(teamRoles, {
    errorMap: () => ({ message: "Role is required" }),
  }),
});

export type SetRoleSchema = z.infer<typeof setRoleSchema>;
