import Icons from "@/components/ui/icons";
import Modal from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select";
import { useZForm } from "@/hooks/useZForm";
import { createDisclosure } from "@/lib/utils";
import React from "react";
import { ScrollView, Sheet, XStack } from "tamagui";
import { FormSchema, formSchema, typeOptions } from "../schema/form";
import { InputField } from "@/components/ui/input";
import FormField from "@/components/ui/form";
import { useSaveKeychain } from "../hooks/query";
import { ErrorAlert } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import {
  UserTypeInputFields,
  PVETypeInputFields,
  RSATypeInputFields,
  CertTypeInputFields,
} from "./input-fields";

export const keyFormModal = createDisclosure<FormSchema>();

const KeyForm = () => {
  const { data } = keyFormModal.use();
  const form = useZForm(formSchema, data);
  const isEditing = data?.id != null;
  const type = form.watch("type");

  const saveMutation = useSaveKeychain();

  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate(values, {
      onSuccess: () => {
        keyFormModal.onClose();
        form.reset();
      },
    });
  });

  return (
    <Modal
      disclosure={keyFormModal}
      title="Keychain"
      description={`${isEditing ? "Edit" : "Add new"} key.`}
    >
      <ErrorAlert mx="$4" mb="$4" error={saveMutation.error} />

      <Sheet.ScrollView
        contentContainerStyle={{ padding: "$4", pt: 0, gap: "$4" }}
      >
        <FormField label="Label">
          <InputField f={1} form={form} name="label" placeholder="Label..." />
        </FormField>

        <FormField label="Type">
          <SelectField form={form} name="type" items={typeOptions} />
        </FormField>

        {type === "user" ? (
          <UserTypeInputFields form={form} />
        ) : type === "pve" ? (
          <PVETypeInputFields form={form} />
        ) : type === "rsa" ? (
          <RSATypeInputFields form={form} />
        ) : type === "cert" ? (
          <CertTypeInputFields form={form} />
        ) : null}
      </Sheet.ScrollView>

      <XStack p="$4" gap="$4">
        <Button flex={1} onPress={keyFormModal.onClose} bg="$colorTransparent">
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

export default KeyForm;
