import { SelectItem } from "@/components/ui/select";
import { hostnameShape } from "@/lib/utils";
import { z } from "zod";

export const baseFormSchema = z.object({
  id: z.string().nullish(),
  label: z.string().min(1, { message: "Label is required" }),
  parentId: z.string().ulid().nullish(),
});

const groupSchema = baseFormSchema.merge(
  z.object({ type: z.literal("group") })
);

const hostSchema = baseFormSchema.merge(
  z.object({
    host: hostnameShape(),
    port: z.coerce
      .number({ message: "Invalid port" })
      .min(1, { message: "Port is required" }),
  })
);

const sshSchema = hostSchema.merge(
  z.object({
    type: z.literal("ssh"),
    keyId: z.string().ulid({ message: "SSH key is required" }),
    altKeyId: z.string().ulid().nullish(),
  })
);

const pveSchema = hostSchema.merge(
  z.object({
    type: z.literal("pve"),
    keyId: z.string().ulid({ message: "PVE User is required" }),
    metadata: z.object({
      node: z.string().min(1, { message: "PVE node is required" }),
      type: z.enum(["lxc", "qemu"]),
      vmid: z.string().min(1, { message: "VMID is required" }),
    }),
  })
);

const incusSchema = hostSchema.merge(
  z.object({
    type: z.literal("incus"),
    keyId: z.string().ulid({ message: "Incus cert is required" }),
    metadata: z.object({
      type: z.enum(["lxc", "qemu"]),
      instance: z.string().min(1, { message: "Instance name is required" }),
      user: z.coerce.number().nullish(),
      shell: z.string().nullish(),
    }),
  })
);

export const formSchema = z.discriminatedUnion(
  "type",
  [groupSchema, sshSchema, pveSchema, incusSchema],
  { errorMap: () => ({ message: "Invalid host type" }) }
);

export type FormSchema = z.infer<typeof formSchema>;

export const initialValues: FormSchema = {
  type: "ssh",
  host: "",
  port: 22,
  label: "",
  keyId: "",
};

export const typeOptions: SelectItem[] = [
  { label: "Group", value: "group" },
  { label: "SSH", value: "ssh" },
  { label: "Proxmox VE", value: "pve" },
  { label: "Incus", value: "incus" },
];

export const pveTypes: SelectItem[] = [
  { label: "Virtual Machine", value: "qemu" },
  { label: "Container", value: "lxc" },
];

export const incusTypes: SelectItem[] = [
  { label: "Container", value: "lxc" },
  { label: "Virtual Machine", value: "qemu" },
];
