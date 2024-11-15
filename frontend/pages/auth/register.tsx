import { Text, Separator, Card, ScrollView } from "tamagui";
import React from "react";
import { Link, Stack } from "expo-router";
import Button from "@/components/ui/button";
import Icons from "@/components/ui/icons";
import FormField from "@/components/ui/form";
import { InputField } from "@/components/ui/input";
import { ErrorAlert } from "@/components/ui/alert";
import tamaguiConfig from "@/tamagui.config";
import { useRegisterMutation } from "./hooks";
import { useZForm } from "@/hooks/useZForm";
import { registerSchema } from "./schema";

const RegisterPage = () => {
  const form = useZForm(registerSchema);
  const register = useRegisterMutation();

  const onSubmit = form.handleSubmit((values) => {
    register.mutate(values);
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Register",
          contentStyle: {
            width: "100%",
            maxWidth: tamaguiConfig.media.xs.maxWidth,
            marginHorizontal: "auto",
          },
        }}
      />

      <ScrollView
        contentContainerStyle={{
          padding: "$4",
          pb: "$12",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <Card bordered p="$4" gap="$4">
          <Text fontSize="$9" mt="$4">
            Register new account.
          </Text>

          <ErrorAlert error={register.error} />

          <FormField label="Full Name">
            <InputField form={form} name="name" autoCapitalize="words" />
          </FormField>

          <FormField label="Username">
            <InputField form={form} name="username" autoCapitalize="none" />
          </FormField>

          <FormField label="Email Address">
            <InputField
              form={form}
              name="email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </FormField>

          <FormField label="Password">
            <InputField
              form={form}
              name="password"
              autoCapitalize="none"
              secureTextEntry
            />
          </FormField>

          <FormField label="Confirm Password">
            <InputField
              form={form}
              name="confirmPassword"
              autoCapitalize="none"
              secureTextEntry
              onSubmitEditing={onSubmit}
            />
          </FormField>
          <Separator />

          <Button
            icon={<Icons name="account-plus" size={16} />}
            onPress={onSubmit}
            isLoading={register.isPending}
          >
            Register
          </Button>

          <Text textAlign="center" fontSize="$4">
            Already registered?{" "}
            <Link href="/auth/login" replace asChild>
              <Text cursor="pointer" fontWeight="600">
                Login Now.
              </Text>
            </Link>
          </Text>
        </Card>
      </ScrollView>
    </>
  );
};

export default RegisterPage;
