"use client";

import * as React from "react";

const INTERVAL_MS = 2 * 60 * 1000;

async function sendHeartbeat() {
  try {
    await fetch("/api/activity", { method: "POST", keepalive: true });
  } catch {
    // ignore
  }
}

export function ActivityHeartbeat() {
  React.useEffect(() => {
    let timer: number | undefined;

    const kick = () => {
      void sendHeartbeat();
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => void sendHeartbeat(), INTERVAL_MS);
    };

    kick();

    const onVisibility = () => {
      if (document.visibilityState === "visible") kick();
    };

    window.addEventListener("focus", kick);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener("focus", kick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}

