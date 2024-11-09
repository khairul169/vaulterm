import Icons from "@/components/ui/icons";
import Modal from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select";
import { useZForm } from "@/hooks/useZForm";
import { createDisclosure } from "@/lib/utils";
import React from "react";
import { ScrollView, XStack } from "tamagui";
import { FormSchema, formSchema, typeOptions } from "../schema/form";
import { InputField } from "@/components/ui/input";
import FormField from "@/components/ui/form";
import { useSaveHost } from "../hooks/query";
import { ErrorAlert } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { PVEFormFields } from "./pve";
import { IncusFormFields } from "./incus";
import { SSHFormFields } from "./ssh";

export const hostFormModal = createDisclosure<FormSchema>();

const HostForm = () => {
  const { data } = hostFormModal.use();
  const form = useZForm(formSchema, data);
  const isEditing = data?.id != null;
  const type = form.watch("type");

  const saveMutation = useSaveHost();

  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate(values, {
      onSuccess: () => {
        hostFormModal.onClose();
        form.reset();
      },
    });
  });

  return (
    <Modal
      disclosure={hostFormModal}
      title="Host"
      description={`${isEditing ? "Edit" : "Add new"} host.`}
    >
      <ErrorAlert mx="$4" mb="$4" error={saveMutation.error} />

      <ScrollView contentContainerStyle={{ padding: "$4", pt: 0, gap: "$4" }}>
        <FormField label="Label">
          <InputField f={1} form={form} name="label" placeholder="Label..." />
        </FormField>

        <FormField label="Hostname">
          <InputField form={form} name="host" placeholder="IP or hostname..." />
        </FormField>

        <FormField label="Type">
          <SelectField form={form} name="type" items={typeOptions} />
        </FormField>

        <FormField label="Port">
          <InputField
            form={form}
            name="port"
            keyboardType="number-pad"
            placeholder="Port"
          />
        </FormField>

        {type === "ssh" ? (
          <SSHFormFields form={form} />
        ) : type === "pve" ? (
          <PVEFormFields form={form} />
        ) : type === "incus" ? (
          <IncusFormFields form={form} />
        ) : null}
      </ScrollView>

      <XStack p="$4" gap="$4">
        <Button flex={1} onPress={hostFormModal.onClose} bg="$colorTransparent">
          Cancel
        </Button>
        <Button
          flex={1}
          icon={<Icons name="content-save" size={18} />}
          onPress={onSubmit}
          isLoading={saveMutation.isPending}
        >
          Save
        </Button>
      </XStack>
    </Modal>
  );
};

export default HostForm;
