import React from "react";
import Terminal from "./terminal";
import { BASE_WS_URL } from "@/lib/api";

type SSHSessionProps = {
  type: "ssh";
  options: {
    serverId: string;
  };
};

type Props = SSHSessionProps;

const InteractiveSession = ({ type, options }: Props) => {
  switch (type) {
    case "ssh":
      const params = new URLSearchParams({
        serverId: options.serverId,
        token: "token",
      });
      return (
        <Terminal client="xtermjs" wsUrl={`${BASE_WS_URL}/ws/ssh?${params}`} />
      );

    default:
      throw new Error("Unknown interactive session type");
  }

  return null;
};

export default InteractiveSession;
