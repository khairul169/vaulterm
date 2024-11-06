import React from "react";
import Terminal from "./terminal";
import { BASE_WS_URL } from "@/lib/api";
import VNCViewer from "./vncviewer";

type SSHSessionProps = {
  type: "ssh";
  params: {
    serverId: string;
  };
};

type PVESessionProps = {
  type: "pve";
  params: {
    client: "vnc" | "xtermjs";
    serverId: string;
  };
};

type IncusSessionProps = {
  type: "incus";
  params: {
    client: "vnc" | "xtermjs";
    serverId: string;
    shell?: string;
  };
};

export type InteractiveSessionProps =
  | SSHSessionProps
  | PVESessionProps
  | IncusSessionProps;

const InteractiveSession = ({ type, params }: InteractiveSessionProps) => {
  let url = "";
  const query = new URLSearchParams({
    ...params,
  });

  switch (type) {
    case "ssh":
      return <Terminal wsUrl={`${BASE_WS_URL}/ws/ssh?${query}`} />;

    case "pve":
      url = `${BASE_WS_URL}/ws/pve?${query}`;
      return params.client === "vnc" ? (
        <VNCViewer url={url} />
      ) : (
        <Terminal wsUrl={url} />
      );

    case "incus":
      url = `${BASE_WS_URL}/ws/incus?${query}`;
      return params.client === "vnc" ? (
        <VNCViewer url={url} />
      ) : (
        <Terminal wsUrl={url} />
      );

    default:
      throw new Error("Unknown interactive session type");
  }
};

export default InteractiveSession;
