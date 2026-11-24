"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getBrowserAttribution } from "@/lib/attribution";

export function AttributionCapture() {
  const pathname = usePathname();
  useEffect(() => { getBrowserAttribution(); }, [pathname]);
  return null;
}
