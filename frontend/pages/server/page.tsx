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
import appStore, { addServer, setCurrentServer } from "@/stores/app";
import tamaguiConfig from "@/tamagui.config";
import { useStore } from "zustand";
import Icons from "@/components/ui/icons";

export default function ServerPage() {
  const form = useZForm(serverSchema);
  const localServer = useStore(appStore, (i) => i.localServer);

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

  const onUseLocalServer = () => {
    if (localServer) {
      setCurrentServer(localServer);
      router.replace("/auth/login");
    }
  };

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
          headerRight: () => <ThemeSwitcher $gtSm={{ mr: "$3" }} />,
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
            <InputField
              form={form}
              name="url"
              autoCapitalize="none"
              keyboardType="url"
              placeholder="https://"
              onSubmitEditing={onSubmit}
            />
          </FormField>

          <Button
            onPress={onSubmit}
            icon={<Icons name="desktop-classic" size={16} />}
            isLoading={serverConnect.isPending}
          >
            Connect
          </Button>

          {localServer != null && (
            <>
              <Text textAlign="center">or</Text>
              <Button onPress={onUseLocalServer}>Use Local Server</Button>
            </>
          )}
        </Card>
      </ScrollView>
    </>
  );
}
