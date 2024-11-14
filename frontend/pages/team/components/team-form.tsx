import Icons from "@/components/ui/icons";
import Modal from "@/components/ui/modal";
import { useZForm } from "@/hooks/useZForm";
import { createDisclosure } from "@/lib/utils";
import React from "react";
import { ScrollView, XStack } from "tamagui";
import { InputField } from "@/components/ui/input";
import FormField from "@/components/ui/form";
import { useSaveTeam } from "../hooks/query";
import { ErrorAlert } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { TeamFormSchema, teamFormSchema } from "../schema/team-form";

export const teamFormModal = createDisclosure<TeamFormSchema>();

const TeamForm = () => {
  const { data } = teamFormModal.use();
  const form = useZForm(teamFormSchema, data);
  const isEditing = data?.id != null;

  const saveMutation = useSaveTeam();

  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate(values, {
      onSuccess: () => {
        teamFormModal.onClose();
        form.reset();
      },
    });
  });

  return (
    <Modal
      disclosure={teamFormModal}
      title="Team"
      description={`${isEditing ? "Edit" : "Add new"} team.`}
      maxHeight={320}
    >
      <ErrorAlert mx="$4" mb="$4" error={saveMutation.error} />

      <ScrollView contentContainerStyle={{ padding: "$4", pt: 0, gap: "$4" }}>
        <FormField label="Name">
          <InputField
            f={1}
            form={form}
            name="name"
            placeholder="Team Name..."
          />
        </FormField>

        <FormField label="Icon">
          <InputField form={form} name="icon" placeholder="Icon" />
        </FormField>
      </ScrollView>

      <XStack p="$4" gap="$4">
        <Button flex={1} onPress={teamFormModal.onClose} bg="$colorTransparent">
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

export default TeamForm;
