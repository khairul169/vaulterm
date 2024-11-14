import { View, Text, XStack, Separator } from "tamagui";
import React, { useState } from "react";
import { useWebSocket } from "@/hooks/useWebsocket";
import Icons from "../ui/icons";

type Props = {
  url: string;
};

const ServerStatsBar = ({ url }: Props) => {
  const [cpu, setCPU] = useState(0);
  const [memory, setMemory] = useState({ total: 0, used: 0, available: 0 });
  const [disk, setDisk] = useState({ total: "0", used: "0", percent: "0%" });
  const [network, setNetwork] = useState({ tx: 0, rx: 0 });

  const { isConnected } = useWebSocket(url, {
    onMessage: (msg) => {
      const type = msg.substring(0, 1);
      const value = msg.substring(1);
      let values: string[];

      switch (type) {
        case "\x01":
          setCPU(parseFloat(value));
          break;

        case "\x02":
          values = value.split(",");
          const total = parseInt(values[0]) || 0;
          const available = parseInt(values[1]) || 0;
          const used = total - available;
          setMemory({ total, used, available });
          break;

        case "\x03":
          values = value.split(",");
          setDisk({ total: values[0], used: values[1], percent: values[2] });
          break;

        case "\x04":
          values = value.split(",");
          setNetwork({
            tx: parseInt(values[0]) || 0,
            rx: parseInt(values[1]) || 0,
          });
          break;
      }
    },
  });

  if (!isConnected || !memory.total) {
    return null;
  }

  return (
    <XStack gap="$1" p="$2" alignItems="center">
      <XStack gap="$1" alignItems="center" minWidth={48}>
        <Icons name="desktop-tower" size={16} />
        <Text fontSize="$2" aria-label="CPU">
          {Math.round(cpu)}%
        </Text>
      </XStack>

      <Separator vertical h="100%" mx="$2" borderColor="$color" />
      <Icons name="memory" size={16} />
      <Text fontSize="$2" aria-label="Memory">
        {memory.used} MB / {memory.total} MB (
        {Math.round((memory.used / memory.total) * 100) || 0}%)
      </Text>

      <Separator vertical h="100%" mx="$2" borderColor="$color" />
      <Icons name="harddisk" size={16} />
      <Text fontSize="$2" aria-label="Disk">
        {disk.used} / {disk.total} ({disk.percent})
      </Text>

      <Separator vertical h="100%" mx="$2" borderColor="$color" />
      <Icons name="download" size={16} />
      <Text fontSize="$2" aria-label="Network Received">
        {network.rx} MB
      </Text>
      <Icons name="upload" size={16} />
      <Text fontSize="$2" aria-label="Network Sent">
        {network.tx} MB
      </Text>
    </XStack>
  );
};

export default ServerStatsBar;
