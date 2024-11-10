import { Text, ScrollView, Card, Separator } from "tamagui";
import React from "react";
import FormField from "@/components/ui/form";
import { InputField } from "@/components/ui/input";
import { useZForm } from "@/hooks/useZForm";
import { router, Stack } from "expo-router";
import Button from "@/components/ui/button";
import ThemeSwitcher from "@/components/containers/theme-switcher";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ErrorAlert } from "@/components/ui/alert";
import { loginResultSchema, loginSchema } from "./schema";
import api from "@/lib/api";
import Icons from "@/components/ui/icons";
import authStore from "@/stores/auth";

export default function LoginPage() {
  const form = useZForm(loginSchema);

  const login = useMutation({
    mutationFn: async (body: z.infer<typeof loginSchema>) => {
      const res = await api("/auth/login", { method: "POST", body });
      const { data } = loginResultSchema.safeParse(res);
      if (!data) {
        throw new Error("Invalid response!");
      }
      return data;
    },
    onSuccess(data) {
      authStore.setState({ token: data.sessionId });
      router.replace("/");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values);
  });

  return (
    <>
      <Stack.Screen
        options={{
          contentStyle: {
            width: "100%",
            maxWidth: 600,
            marginHorizontal: "auto",
          },
          title: "Login",
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
          <Text fontSize="$8">Login</Text>

          <ErrorAlert error={login.error} />

          <FormField vertical label="Username/Email">
            <InputField form={form} name="username" />
          </FormField>
          <FormField vertical label="Password">
            <InputField form={form} name="password" secureTextEntry />
          </FormField>

          <Separator />

          <Button
            icon={<Icons name="lock" size={16} />}
            onPress={onSubmit}
            isLoading={login.isPending}
          >
            Connect
          </Button>

          <Button onPress={() => router.push("/server")} bg="$colorTransparent">
            Change Server
          </Button>
        </Card>
      </ScrollView>
    </>
  );
}
