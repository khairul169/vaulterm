import Icons from "@/components/ui/icons";
import Modal from "@/components/ui/modal";
import { useZForm } from "@/hooks/useZForm";
import { createDisclosure } from "@/lib/utils";
import React from "react";
import { ScrollView, XStack } from "tamagui";
import { InputField } from "@/components/ui/input";
import FormField from "@/components/ui/form";
import { useInviteMutation } from "../hooks/query";
import { ErrorAlert } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import {
  InviteSchema,
  inviteSchema,
  teamMemberRoles,
} from "../schema/team-form";
import { SelectField } from "@/components/ui/select";

export const inviteFormModal = createDisclosure<InviteSchema>();

const InviteForm = () => {
  const { data } = inviteFormModal.use();
  const form = useZForm(inviteSchema, data);
  const invite = useInviteMutation(data?.teamId || "");

  const onSubmit = form.handleSubmit((values) => {
    invite.mutate(values, {
      onSuccess: () => {
        inviteFormModal.onClose();
        form.reset();
      },
    });
  });

  return (
    <Modal
      disclosure={inviteFormModal}
      title="Invite"
      description="Add new team member."
      maxHeight={360}
    >
      <ErrorAlert mx="$4" mb="$4" error={invite.error} />

      <ScrollView contentContainerStyle={{ padding: "$4", pt: 0, gap: "$4" }}>
        <FormField label="Username/Email">
          <InputField
            f={1}
            form={form}
            name="username"
            placeholder="john.doe"
          />
        </FormField>
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
          onPress={inviteFormModal.onClose}
          bg="$colorTransparent"
        >
          Cancel
        </Button>
        <Button
          flex={1}
          icon={<Icons name="account-plus" size={18} />}
          onPress={onSubmit}
          isLoading={invite.isPending}
        >
          Invite User
        </Button>
      </XStack>
    </Modal>
  );
};

export default InviteForm;
