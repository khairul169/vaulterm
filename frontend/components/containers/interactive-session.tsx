import React from "react";
import Terminal from "./terminal";
import { BASE_WS_URL } from "@/lib/api";
import VNCViewer from "./vncviewer";
import { useAuthStore } from "@/stores/auth";

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
  const query = new URLSearchParams({ ...params, sid: token || "" });
  const url = `${BASE_WS_URL}/ws/term?${query}`;

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

export default InteractiveSession;
