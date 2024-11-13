import { useServer } from "@/stores/app";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseWebsocketOptions = {
  onMessage?: (message: string) => void;
};

export const useWebSocket = (url: string, opt?: UseWebsocketOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(url);
    websocketRef.current = ws;

    // Connection opened
    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    // Listen for messages
    ws.onmessage = (event) => {
      opt?.onMessage?.(event.data);
    };

    // Connection closed
    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [url]);

  // Send message function
  const send = (msg: string) => {
    if (isConnected && websocketRef.current) {
      websocketRef.current.send(msg);
    }
  };

  return { isConnected, send };
};

export const useWebsocketUrl = (initParams: any = {}) => {
  const server = useServer();
  const baseUrl = server?.url.replace("http://", "ws://") || "";

  return (url: string, params: any = {}) => {
    const query = new URLSearchParams({ ...initParams, ...params });
    return `${baseUrl}/ws/${url}?${query}`;
  };
};
