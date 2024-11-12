import { View, Text, ScrollView, Card } from "tamagui";
import React from "react";
import FormField from "@/components/ui/form";
import { InputField } from "@/components/ui/input";
import { useZForm } from "@/hooks/useZForm";
import { getServerResultSchema, serverSchema } from "./schema";
import { router, Stack } from "expo-router";
import Button from "@/components/ui/button";
import ThemeSwitcher from "@/components/containers/theme-switcher";
import { useMutation } from "@tanstack/react-query";
import { ofetch } from "ofetch";
import { z } from "zod";
import { ErrorAlert } from "@/components/ui/alert";
import { addServer } from "@/stores/app";
import tamaguiConfig from "@/tamagui.config";

export default function ServerPage() {
  const form = useZForm(serverSchema);

  const serverConnect = useMutation({
    mutationFn: async (body: z.infer<typeof serverSchema>) => {
      const res = await ofetch(body.url + "/server");
      const { data } = getServerResultSchema.safeParse(res);
      if (!data) {
        throw new Error("Invalid server");
      }
      return data;
    },
    onSuccess(data, payload) {
      addServer({ url: payload.url, name: data.name }, true);
      router.replace("/auth/login");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    serverConnect.mutate(values);
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
          title: "Vaulterm",
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
          <Text fontSize="$8">Connect to Server</Text>

          <ErrorAlert error={serverConnect.error} />

          <FormField vertical label="URL">
            <InputField form={form} name="url" placeholder="https://" />
          </FormField>

          <Button onPress={onSubmit} isLoading={serverConnect.isPending}>
            Connect
          </Button>
        </Card>
      </ScrollView>
    </>
  );
}
