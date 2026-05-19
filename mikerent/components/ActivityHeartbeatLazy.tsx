"use client";

import dynamic from "next/dynamic";

const ActivityHeartbeat = dynamic(
  () =>
    import("@/components/ActivityHeartbeat").then((m) => m.ActivityHeartbeat),
  { ssr: false },
);

export function ActivityHeartbeatLazy() {
  return <ActivityHeartbeat />;
}
