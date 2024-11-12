import React, { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormSchema, pveRealms } from "../schema/form";
import FormField from "@/components/ui/form";
import { InputField, TextAreaField } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";

type Props = {
  form: UseFormReturn<FormSchema>;
};

export const UserTypeInputFields = ({ form }: Props) => {
  return (
    <>
      <FormField label="Username">
        <InputField f={1} form={form} name="data.username" />
      </FormField>
      <FormField label="Password">
        <InputField f={1} form={form} name="data.password" secureTextEntry />
      </FormField>
    </>
  );
};

export const PVETypeInputFields = ({ form }: Props) => {
  return (
    <>
      <FormField label="Username">
        <InputField f={1} form={form} name="data.username" />
      </FormField>
      <FormField label="Realm">
        <SelectField form={form} name="data.realm" items={pveRealms} />
      </FormField>
      <FormField label="Password">
        <InputField f={1} form={form} name="data.password" secureTextEntry />
      </FormField>
    </>
  );
};

export const RSATypeInputFields = ({ form }: Props) => {
  return (
    <>
      {/* <FormField label="Public Key">
        <TextAreaField rows={7} f={1} form={form} name="data.public" />
      </FormField> */}
      <FormField label="Private Key">
        <TextAreaField rows={7} f={1} form={form} name="data.private" />
      </FormField>
      <FormField label="Passphrase">
        <InputField f={1} form={form} name="data.passphrase" secureTextEntry />
      </FormField>
    </>
  );
};

export const CertTypeInputFields = ({ form }: Props) => {
  return (
    <>
      <FormField label="Client Certificate">
        <TextAreaField rows={7} f={1} form={form} name="data.cert" />
      </FormField>
      <FormField label="Client Key">
        <TextAreaField rows={7} f={1} form={form} name="data.key" />
      </FormField>
    </>
  );
};
