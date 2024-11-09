import FormField from "@/components/ui/form";
import { MiscFormFieldProps } from "../types";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { pveTypes } from "../schema/form";
import { useKeychainsOptions } from "../hooks/query";
import CredentialsSection from "./credentials-section";

export const PVEFormFields = ({ form }: MiscFormFieldProps) => {
  const keys = useKeychainsOptions();

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

      <CredentialsSection type="pve" />

      <FormField label="Account">
        <SelectField
          form={form}
          name="keyId"
          placeholder="Select Account"
          items={keys.filter((i) => i.type === "pve")}
        />
      </FormField>
    </>
  );
};
