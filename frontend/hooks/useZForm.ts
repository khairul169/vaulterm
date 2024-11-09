import { z } from "zod";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

export const useZForm = <T extends FieldValues>(
  schema: z.ZodSchema<T>,
  value?: Partial<T> | null
) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: value as never,
  });

  useEffect(() => {
    if (value) {
      form.reset(value as never);
    }
  }, [value]);

  return form;
};

export type UseZFormReturn<T extends FieldValues> = ReturnType<
  typeof useZForm<T>
>;
