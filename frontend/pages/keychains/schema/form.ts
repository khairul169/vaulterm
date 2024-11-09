import { SelectItem } from "@/components/ui/select";
import { z } from "zod";

const baseSchema = z.object({
  id: z.string().ulid().nullish(),
  label: z.string().min(1, { message: "Label is required" }),
});

const userTypeSchema = baseSchema.merge(
  z.object({
    type: z.literal("user"),
    data: z.object({
      username: z.string().min(1, { message: "Username is required" }),
      password: z.string().nullish(),
    }),
  })
);

const pveTypeSchema = baseSchema.merge(
  z.object({
    type: z.literal("pve"),
    data: z.object({
      username: z.string().min(1, { message: "Username is required" }),
      realm: z.enum(["pam", "pve"]),
      password: z.string().min(1, { message: "Password is required" }),
    }),
  })
);

const rsaTypeSchema = baseSchema.merge(
  z.object({
    type: z.literal("rsa"),
    data: z.object({
      public: z.string().nullish(),
      private: z.string().min(1, { message: "Private Key is required" }),
      passphrase: z.string().nullish(),
    }),
  })
);

const certTypeSchema = baseSchema.merge(
  z.object({
    type: z.literal("cert"),
    data: z.object({
      cert: z.string().min(1, { message: "Certificate is required" }),
      key: z.string().min(1, { message: "Key is required" }),
    }),
  })
);

export const formSchema = z.discriminatedUnion("type", [
  userTypeSchema,
  pveTypeSchema,
  rsaTypeSchema,
  certTypeSchema,
]);

export type FormSchema = z.infer<typeof formSchema>;

export const initialValues: FormSchema = {
  type: "user",
  label: "",
  data: {
    username: "",
    password: "",
  },
};

export const typeOptions: SelectItem[] = [
  { label: "User Key", value: "user" },
  { label: "ProxmoxVE Key", value: "pve" },
  { label: "RSA Key", value: "rsa" },
  { label: "Client Certificate", value: "cert" },
];

export const pveRealms: SelectItem[] = [
  { label: "Linux PAM", value: "pam" },
  { label: "Proxmox VE", value: "pve" },
];
