import { createDisclosure } from "@/lib/utils";

export type DialogData = {
  title: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const dialogStore = createDisclosure<DialogData>();

export const showDialog = (data: DialogData) => {
  dialogStore.onOpen(data);
};
