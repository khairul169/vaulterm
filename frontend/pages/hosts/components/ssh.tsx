import FormField from "@/components/ui/form";
import { MiscFormFieldProps } from "../types";
import { SelectField } from "@/components/ui/select";
import CredentialsSection from "./credentials-section";
import { useKeychainsOptions } from "../hooks/query";

export const SSHFormFields = ({ form }: MiscFormFieldProps) => {
  const keys = useKeychainsOptions();

  return (
    <>
      <CredentialsSection />

      <FormField label="User">
        <SelectField
          form={form}
          name="keyId"
          placeholder="Select User"
          items={keys.filter((i) => i.type === "user")}
        />
      </FormField>

      <FormField label="Private Key">
        <SelectField
          form={form}
          name="altKeyId"
          placeholder="Select Private Key"
          items={keys.filter((i) => i.type === "rsa")}
        />
      </FormField>
    </>
  );
};
