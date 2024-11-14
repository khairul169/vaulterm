import Icons from "@/components/ui/icons";
import Modal from "@/components/ui/modal";
import { useZForm } from "@/hooks/useZForm";
import { createDisclosure } from "@/lib/utils";
import React from "react";
import { ScrollView, XStack } from "tamagui";
import FormField from "@/components/ui/form";
import { ErrorAlert } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import {
  SetRoleSchema,
  setRoleSchema,
  teamMemberRoles,
} from "../schema/team-form";
import { SelectField } from "@/components/ui/select";
import { useSetRoleMutation } from "../hooks/query";

export const changeRoleModal = createDisclosure<SetRoleSchema>();

const ChangeRoleForm = () => {
  const { data } = changeRoleModal.use();
  const form = useZForm(setRoleSchema, data);
  const setRole = useSetRoleMutation(data?.teamId || "");

  const onSubmit = form.handleSubmit((values) => {
    setRole.mutate(values, {
      onSuccess: () => {
        changeRoleModal.onClose();
        form.reset();
      },
    });
  });

  return (
    <Modal
      disclosure={changeRoleModal}
      title="Change Role"
      description="Change team member role."
      maxHeight={280}
    >
      <ScrollView contentContainerStyle={{ padding: "$4", pt: 0, gap: "$4" }}>
        <ErrorAlert error={setRole.error} />

        <FormField label="Role">
          <SelectField
            items={teamMemberRoles}
            form={form}
            name="role"
            placeholder="Select Role..."
          />
        </FormField>
      </ScrollView>

      <XStack p="$4" gap="$4">
        <Button
          flex={1}
          onPress={changeRoleModal.onClose}
          bg="$colorTransparent"
        >
          Cancel
        </Button>
        <Button
          flex={1}
          icon={<Icons name="account-plus" size={18} />}
          onPress={onSubmit}
          isLoading={setRole.isPending}
        >
          Update Role
        </Button>
      </XStack>
    </Modal>
  );
};

export default ChangeRoleForm;
