import FormField from "@/components/ui/form";
import { MiscFormFieldProps } from "../types";
import { InputField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { incusTypes } from "../schema/form";
import CredentialsSection from "./credentials-section";
import { useKeychainsOptions } from "../hooks/query";

export const IncusFormFields = ({ form }: MiscFormFieldProps) => {
  const keys = useKeychainsOptions();
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
        <>
          <FormField label="User ID">
            <InputField
              form={form}
              keyboardType="number-pad"
              name="metadata.user"
            />
          </FormField>
          <FormField label="Shell">
            <InputField form={form} name="metadata.shell" placeholder="bash" />
          </FormField>
        </>
      )}

      <CredentialsSection />

      <FormField label="Client Certificate">
        <SelectField
          form={form}
          name="keyId"
          placeholder="Select Certificate"
          items={keys.filter((i) => i.type === "cert")}
        />
      </FormField>
    </>
  );
};
