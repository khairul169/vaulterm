import Icons from "@/components/ui/icons";
import Select, { SelectItem } from "@/components/ui/select";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Button, Input, Label, ScrollView, Text, View, XStack } from "tamagui";

type Props = {};

const typeOptions: SelectItem[] = [
  { label: "SSH", value: "ssh" },
  { label: "Proxmox VE", value: "pve" },
  { label: "Incus", value: "incus" },
];

const HostForm = (props: Props) => {
  const keys = useQuery({
    queryKey: ["keychains"],
    queryFn: () => api("/keychains"),
    select: (i) => i.rows,
  });

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: "$4" }}>
        <Label>Hostname</Label>
        <Input placeholder="IP or hostname..." />

        <Label>Type</Label>
        <Select items={typeOptions} />

        <Label>Port</Label>
        <Input keyboardType="number-pad" placeholder="SSH Port" />

        <Label>Label</Label>
        <Input placeholder="Label..." />

        <XStack gap="$3" mt="$3" mb="$1">
          <Label flex={1}>Credentials</Label>
          <Button size="$3" icon={<Icons size={16} name="plus" />}>
            Add
          </Button>
        </XStack>

        <Select
          placeholder="Username & Password"
          items={keys.data?.map((key: any) => ({
            label: key.label,
            value: key.id,
          }))}
        />
        <Select
          mt="$3"
          placeholder="Private Key"
          items={keys.data?.map((key: any) => ({
            label: key.label,
            value: key.id,
          }))}
        />
      </ScrollView>

      <View p="$4">
        <Button icon={<Icons name="content-save" size={18} />}>Save</Button>
      </View>
    </>
  );
};

export default HostForm;
