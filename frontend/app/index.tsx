import React from "react";
import { Redirect } from "expo-router";
import { useTermSession } from "@/stores/terminal-sessions";
import { useAppStore } from "@/stores/app";

export default function index() {
  const { sessions, curSession } = useTermSession();
  const { servers, curServer } = useAppStore();

  if (!servers.length || !curServer) {
    return <Redirect href="/server" />;
  }

  return (
    <Redirect
      href={sessions.length > 0 && curSession >= 0 ? "/terminal" : "/hosts"}
    />
  );
}
