import { UseZFormReturn } from "@/hooks/useZForm";
import { FieldPath, FieldValues } from "react-hook-form";

export type FormFieldBaseProps<T extends FieldValues> = {
  form: UseZFormReturn<T>;
  name: FieldPath<T>;
};
