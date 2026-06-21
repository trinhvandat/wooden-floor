"use client";

import { useEffect } from "react";
import { trackConversion } from "@/lib/analytics";

interface ConversionTrackerProps {
  event: string;
}

/** Fires a single GA4 conversion event on mount. Renders nothing. */
export function ConversionTracker({ event }: ConversionTrackerProps) {
  useEffect(() => {
    trackConversion(event);
  }, [event]);

  return null;
}
