import { View, Text, Button, ScrollView, Spinner, Card, XStack } from "tamagui";
import React from "react";
import useThemeStore from "@/stores/theme";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Stack } from "expo-router";
import Pressable from "@/components/ui/pressable";
import Icons from "@/components/ui/icons";

export default function Hosts() {
  const { toggle } = useThemeStore();

  const hosts = useQuery({
    queryKey: ["hosts"],
    queryFn: () => api("/hosts"),
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: "Hosts",
          headerRight: () => (
            <Button onPress={() => toggle()} mr="$2">
              Toggle Theme
            </Button>
          ),
        }}
      />

      {hosts.isLoading ? (
        <View alignItems="center" justifyContent="center" flex={1}>
          <Spinner size="large" />
          <Text mt="$4">Loading...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: "$2",
            flexDirection: "row",
            flexWrap: "wrap",
            // gap: "$4",
          }}
        >
          {hosts.data.rows?.map((host: any) => (
            <Pressable
              key={host.id}
              flexBasis="100%"
              $gtXs={{ flexBasis: "50%" }}
              $gtSm={{ flexBasis: "33.3%" }}
              $gtMd={{ flexBasis: "25%" }}
              $gtLg={{ flexBasis: "20%" }}
              p="$2"
              group
            >
              <Card elevate bordered p="$4">
                <XStack>
                  <View flex={1}>
                    <Text>{host.label}</Text>
                    <Text fontSize="$3" mt="$2">
                      {host.host}
                    </Text>
                  </View>

                  <Button
                    circular
                    display="none"
                    $group-hover={{ display: "block" }}
                  >
                    <Icons name="pencil" size={16} />
                  </Button>
                </XStack>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </>
  );
}
