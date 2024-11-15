import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useTermSession } from "@/stores/terminal-sessions";
import { setLocalServer, useServer } from "@/stores/app";
import { GetLocalServer } from "@/lib/wailsjs/go/main/App";
import { Spinner, View } from "tamagui";

export default function index() {
  const { sessions, curSession } = useTermSession();
  const [isPending, setPending] = useState(true);
  const curServer = useServer();

  useEffect(() => {
    // load local server
    (async function () {
      try {
        const url = await GetLocalServer();
        if (url) {
          setLocalServer(url);
        }
      } catch (_) {}
      setPending(false);
    })();
  }, []);

  if (isPending) {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <Spinner />
      </View>
    );
  }

  if (!curServer) {
    return <Redirect href="/server" />;
  }

  return (
    <Redirect
      href={sessions.length > 0 && curSession >= 0 ? "/terminal" : "/hosts"}
    />
  );
}
