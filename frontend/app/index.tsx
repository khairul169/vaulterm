import React from "react";
import { Redirect } from "expo-router";
import { useTermSession } from "@/stores/terminal-sessions";

export default function index() {
  const { sessions, curSession } = useTermSession();

  return (
    <Redirect
      href={sessions.length > 0 && curSession >= 0 ? "/terminal" : "/hosts"}
    />
  );
}
