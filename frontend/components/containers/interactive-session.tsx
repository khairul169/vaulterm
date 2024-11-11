import React from "react";
import Terminal from "./terminal";
import VNCViewer from "./vncviewer";
import { useAuthStore } from "@/stores/auth";
import { AppServer, useServer } from "@/stores/app";

type SSHSessionProps = {
  type: "ssh";
};

type PVESessionProps = {
  type: "pve";
  params: {
    client: "vnc" | "xtermjs";
  };
};

type IncusSessionProps = {
  type: "incus";
  params: {
    client: "vnc" | "xtermjs";
    shell?: string;
  };
};

export type InteractiveSessionProps = {
  label: string;
  params: { hostId: string };
} & (SSHSessionProps | PVESessionProps | IncusSessionProps);

const InteractiveSession = ({ type, params }: InteractiveSessionProps) => {
  const { token } = useAuthStore();
  const server = useServer();
  const query = new URLSearchParams({ ...params, sid: token || "" });
  const url = `${getBaseUrl(server)}/ws/term?${query}`;

  switch (type) {
    case "ssh":
      return <Terminal url={url} />;

    case "pve":
    case "incus":
      return params.client === "vnc" ? (
        <VNCViewer url={url} />
      ) : (
        <Terminal url={url} />
      );

    default:
      throw new Error("Unknown interactive session type");
  }
};

function getBaseUrl(server?: AppServer | null) {
  return server?.url.replace("http://", "ws://") || "";
}

export default InteractiveSession;
