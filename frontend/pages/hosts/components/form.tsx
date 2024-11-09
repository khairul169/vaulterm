import Icons from "@/components/ui/icons";
import Modal from "@/components/ui/modal";
import { SelectField } from "@/components/ui/select";
import { useZForm, UseZFormReturn } from "@/hooks/useZForm";
import api from "@/lib/api";
import { createDisclosure } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Button, Label, ScrollView, XStack } from "tamagui";
import {
  FormSchema,
  formSchema,
  incusTypes,
  pveTypes,
  typeOptions,
} from "../schema/form";
import { InputField } from "@/components/ui/input";
import FormField from "@/components/ui/form";
import { useKeychains, useSaveHost } from "../hooks/query";

export const hostFormModal = createDisclosure<FormSchema>();

const HostForm = () => {
  const { data } = hostFormModal.use();
  const form = useZForm(formSchema, data);
  const isEditing = data?.id != null;
  const type = form.watch("type");

  const keys = useKeychains();
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
            placeholder="SSH Port"
          />
        </FormField>

        {type === "pve" && <PVEFormFields form={form} />}
        {type === "incus" && <IncusFormFields form={form} />}

        <XStack gap="$3">
          <Label flex={1} h="$3">
            Credentials
          </Label>
          <Button size="$3" icon={<Icons size={16} name="plus" />}>
            Add
          </Button>
        </XStack>

        <FormField label="User">
          <SelectField
            form={form}
            name="keyId"
            placeholder="Select User"
            items={keys.data?.map((key: any) => ({
              label: key.label,
              value: key.id,
            }))}
          />
        </FormField>

        {type === "ssh" && (
          <FormField label="Private Key">
            <SelectField
              form={form}
              name="altKeyId"
              placeholder="Select Private Key"
              items={keys.data?.map((key: any) => ({
                label: key.label,
                value: key.id,
              }))}
            />
          </FormField>
        )}
      </ScrollView>

      <XStack p="$4" gap="$4">
        <Button flex={1} onPress={hostFormModal.onClose} bg="$colorTransparent">
          Cancel
        </Button>
        <Button
          flex={1}
          icon={<Icons name="content-save" size={18} />}
          onPress={onSubmit}
        >
          Save
        </Button>
      </XStack>
    </Modal>
  );
};

type MiscFormFieldProps = {
  form: UseZFormReturn<FormSchema>;
};

const PVEFormFields = ({ form }: MiscFormFieldProps) => {
  return (
    <>
      <FormField label="Node">
        <InputField form={form} name="metadata.node" placeholder="pve" />
      </FormField>
      <FormField label="Type">
        <SelectField
          form={form}
          name="metadata.type"
          placeholder="Select Type"
          items={pveTypes}
        />
      </FormField>
      <FormField label="VMID">
        <InputField
          form={form}
          name="metadata.vmid"
          keyboardType="number-pad"
          placeholder="VMID"
        />
      </FormField>
    </>
  );
};

const IncusFormFields = ({ form }: MiscFormFieldProps) => {
  const type = form.watch("metadata.type");

  return (
    <>
      <FormField label="Type">
        <SelectField
          form={form}
          name="metadata.type"
          placeholder="Select Type"
          items={incusTypes}
        />
      </FormField>
      <FormField label="Instance ID">
        <InputField
          form={form}
          name="metadata.instance"
          placeholder="myinstance"
        />
      </FormField>
      {type === "lxc" && (
        <FormField label="Shell">
          <InputField form={form} name="metadata.shell" placeholder="bash" />
        </FormField>
      )}
    </>
  );
};

export default HostForm;
