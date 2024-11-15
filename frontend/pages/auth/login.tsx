import { Text, ScrollView, Card, Separator, XStack } from "tamagui";
import React from "react";
import FormField from "@/components/ui/form";
import { InputField } from "@/components/ui/input";
import { useZForm } from "@/hooks/useZForm";
import { Link, router, Stack } from "expo-router";
import Button from "@/components/ui/button";
import ThemeSwitcher from "@/components/containers/theme-switcher";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ErrorAlert } from "@/components/ui/alert";
import { loginSchema } from "./schema";
import Icons from "@/components/ui/icons";
import tamaguiConfig from "@/tamagui.config";
import { useLoginMutation } from "./hooks";

export default function LoginPage() {
  const form = useZForm(loginSchema);
  const login = useLoginMutation();

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values);
  });

  return (
    <>
      <Stack.Screen
        options={{
          contentStyle: {
            width: "100%",
            maxWidth: tamaguiConfig.media.xs.maxWidth,
            marginHorizontal: "auto",
          },
          title: "Login",
          headerTitle: "",
          headerRight: () => (
            <ThemeSwitcher bg="$colorTransparent" $gtSm={{ mr: "$3" }} />
          ),
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
            Login
          </Text>

          <ErrorAlert error={login.error} />

          <FormField vertical label="Username/Email">
            <InputField
              form={form}
              name="username"
              autoCapitalize="none"
              onSubmitEditing={onSubmit}
            />
          </FormField>
          <FormField vertical label="Password">
            <InputField
              form={form}
              name="password"
              autoCapitalize="none"
              secureTextEntry
              onSubmitEditing={onSubmit}
            />
          </FormField>

          <Separator />

          <Button
            icon={<Icons name="login" size={16} />}
            onPress={onSubmit}
            isLoading={login.isPending}
          >
            Login
          </Button>

          <XStack justifyContent="space-between">
            <Text textAlign="center" fontSize="$4">
              Not registered yet?{" "}
              <Link href="/auth/register" asChild>
                <Text cursor="pointer" fontWeight="600">
                  Register Now.
                </Text>
              </Link>
            </Text>

            <Link href="/auth/reset-password" asChild>
              <Text cursor="pointer" fontWeight="600" fontSize="$4">
                Reset Password
              </Text>
            </Link>
          </XStack>

          <Separator w="100%" />

          <Button
            onPress={() => router.push("/server")}
            bg="$colorTransparent"
            icon={<Icons name="desktop-classic" size={16} />}
          >
            Change Server
          </Button>
        </Card>
      </ScrollView>
    </>
  );
}
