import React from "react";
import Terminal from "./terminal";
import VNCViewer from "./vncviewer";
import { useAuthStore } from "@/stores/auth";
import { AppServer, useServer } from "@/stores/app";
import { useWebsocketUrl } from "@/hooks/useWebsocket";
import ServerStatsBar from "./server-stats-bar";

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
  const ws = useWebsocketUrl({ ...params, sid: token || "" });
  const termUrl = ws("term");
  const statsUrl = ws("stats");

  switch (type) {
    case "ssh":
      return (
        <>
          <Terminal url={termUrl} />
          <ServerStatsBar url={statsUrl} />
        </>
      );

    case "pve":
    case "incus":
      return params.client === "vnc" ? (
        <VNCViewer url={termUrl} />
      ) : (
        <Terminal url={termUrl} />
      );
  }

  return null;
};

export default InteractiveSession;
