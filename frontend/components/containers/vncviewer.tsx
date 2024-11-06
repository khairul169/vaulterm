"use dom";

import React, { useEffect, useRef } from "react";

type VNCViewerProps = {
  url: string;
};

const VNCViewer = ({ ...props }: VNCViewerProps) => {
  const screenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let clean = () => {};

    (async function () {
      // Dynamically load noVNC library
      const { default: RFB } = await import("@novnc/novnc/lib/rfb");

      const rfb = new RFB(screenRef.current!, props.url);
      rfb.scaleViewport = true;

      // @ts-ignore
      const ws: WebSocket = rfb._sock._websocket;
      let password: string | null = null;

      const onConnect = () => {
        // console.log("Connected");
      };

      const onDisconnect = () => {
        // console.log("Disconnected");
      };

      const onMessage = (e: MessageEvent) => {
        const msg = String(e.data);

        // Capture password from server
        if (msg.startsWith("\x01")) {
          password = msg.substring(1);
          ws.removeEventListener("message", onMessage);
        }
      };

      const onCredentialsRequired = () => {
        rfb.sendCredentials({
          password: password || "",
          username: "",
          target: "",
        });
        password = null;
      };

      // const onDesktopName = (e: CustomEvent<{ name: string }>) => {
      //   console.log("Desktop name:", e.detail.name);
      // };

      ws.addEventListener("message", onMessage);
      rfb.addEventListener("connect", onConnect);
      rfb.addEventListener("disconnect", onDisconnect);
      rfb.addEventListener("credentialsrequired", onCredentialsRequired);
      // rfb.addEventListener("desktopname", onDesktopName);

      // Hack: trigger scale update on visibility change
      const observer = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width > 0 && rfb.scaleViewport) {
          (rfb as any)._updateScale();
        }
      });
      observer.observe(screenRef.current!);

      clean = () => {
        ws.removeEventListener("message", onMessage);
        rfb.disconnect();
        rfb.removeEventListener("connect", onConnect);
        rfb.removeEventListener("disconnect", onDisconnect);
        rfb.removeEventListener("credentialsrequired", onCredentialsRequired);
        // rfb.removeEventListener("desktopname", onDesktopName);
        observer.disconnect();
      };
    })();

    return () => {
      clean();
    };
  }, []);

  return <div ref={screenRef} style={{ width: "100%", height: "100vh" }}></div>;
};

export default VNCViewer;
