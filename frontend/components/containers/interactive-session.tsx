import React from "react";
import Terminal from "./terminal";
import { BASE_WS_URL } from "@/lib/api";
import VNCViewer from "./vncviewer";

type SSHSessionProps = {
  type: "ssh";
  params: {
    hostId: string;
  };
};

type PVESessionProps = {
  type: "pve";
  params: {
    client: "vnc" | "xtermjs";
    hostId: string;
  };
};

type IncusSessionProps = {
  type: "incus";
  params: {
    client: "vnc" | "xtermjs";
    hostId: string;
    shell?: string;
  };
};

export type InteractiveSessionProps =
  | SSHSessionProps
  | PVESessionProps
  | IncusSessionProps;

const InteractiveSession = ({ type, params }: InteractiveSessionProps) => {
  const query = new URLSearchParams(params);
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
