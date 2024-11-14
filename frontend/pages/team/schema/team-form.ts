import { SelectItem } from "@/components/ui/select";
import { z } from "zod";

export const teamFormSchema = z.object({
  id: z.string().ulid().nullish(),
  name: z.string().min(1, { message: "Name is required" }),
  icon: z.string().emoji("Icon is not valid."),
});

export type TeamFormSchema = z.infer<typeof teamFormSchema>;

export const inviteSchema = z.object({
  teamId: z.string().ulid(),
  username: z.string().min(1, { message: "Username/email is required" }),
  role: z.enum(["owner", "admin", "member"], {
    errorMap: () => ({ message: "Role is required" }),
  }),
});

export const teamMemberRoles: SelectItem[] = [
  { label: "Owner", value: "owner" },
  { label: "Admin", value: "admin" },
  { label: "Member", value: "member" },
];

export type InviteSchema = z.infer<typeof inviteSchema>;
