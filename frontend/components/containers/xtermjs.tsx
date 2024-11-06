"use dom";

import React, { CSSProperties, forwardRef, useEffect, useRef } from "react";
import {
  DOMImperativeFactory,
  DOMProps,
  useDOMImperativeHandle,
  IS_DOM,
} from "expo/dom";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit/src/FitAddon";
import { AttachAddon } from "@xterm/addon-attach/src/AttachAddon";
import { JSONValue } from "expo/build/dom/dom.types";

type XTermJsProps = {
  onLoad?: () => void;
  dom?: DOMProps;
  style?: CSSProperties;
  wsUrl: string;
};

export interface XTermRef extends DOMImperativeFactory {
  send: (...args: JSONValue[]) => void;
}

const XTermJs = forwardRef<XTermRef, XTermJsProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { wsUrl, onLoad, style = {} } = props;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const xterm = new XTerm();
    xterm.open(container);

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    fitAddon.fit();

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const attachAddon = new AttachAddon(ws);
    xterm.loadAddon(attachAddon);

    if (xterm.element) {
      xterm.element.style.height = "100%";
    }

    if (IS_DOM) {
      xterm.focus();
    }

    function resizeTerminal() {
      const { cols, rows } = xterm;
      ws.send(`\x01${cols},${rows}`);
    }

    function onResize() {
      fitAddon.fit();
      resizeTerminal();
    }

    function onOpen() {
      console.log("WS Open");
      resizeTerminal();
    }

    function onClose(e: CloseEvent) {
      console.log("WS Closed", e.reason, e.code);

      // Check if the close event was abnormal
      if (!e.wasClean) {
        const reason = e.reason || `Code: ${e.code}`;
        xterm.write(`\r\nConnection closed unexpectedly: ${reason}\r\n`);
      } else {
        xterm.write("\r\nConnection closed.\r\n");
      }
    }

    ws.addEventListener("open", onOpen);
    ws.addEventListener("close", onClose);
    xterm.onResize(resizeTerminal);
    window.addEventListener("resize", onResize);

    // Hack: trigger scale update on visibility change
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) {
        fitAddon.fit();
      }
    });
    observer.observe(containerRef.current!);

    onLoad?.();

    return () => {
      xterm.dispose();
      wsRef.current = null;
      containerRef.current = null;

      ws.close();
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("close", onClose);
      window.removeEventListener("resize", onResize);

      observer.disconnect();
    };
  }, [wsUrl]);

  useDOMImperativeHandle(
    ref,
    () => ({
      send: (...args) => {
        const ws = wsRef.current;
        if (ws?.readyState === ws?.OPEN && args[0]) {
          ws?.send(String(args[0]));
        }
      },
    }),
    []
  );

  return (
    <div
      ref={containerRef}
      style={{
        flex: !IS_DOM ? 1 : undefined,
        width: "100%",
        height: IS_DOM ? "100vh" : undefined,
        overflow: "hidden",
        ...style,
      }}
    />
  );
});

export default XTermJs;
