"use client";

import React, { createContext, useContext, useMemo } from "react";

const UsageTrackerContext = createContext({
  enabled: false,
  sessionId: null,
  detailLevel: "basic",
  trackAction: () => {},
  endSession: () => {}
});

export const UsageTrackerProvider = ({
  value,
  children
}) => {
  const memoValue = useMemo(
    () => ({
      enabled: Boolean(value?.enabled),
      sessionId: value?.sessionId || null,
      detailLevel: value?.detailLevel || "basic",
      trackAction: value?.trackAction || (() => {}),
      endSession: value?.endSession || (() => {})
    }),
    [value?.enabled, value?.sessionId, value?.detailLevel, value?.trackAction, value?.endSession]
  );

  return (
    <UsageTrackerContext.Provider value={memoValue}>
      {children}
    </UsageTrackerContext.Provider>
  );
};

export const useUsageTrackerContext = () => useContext(UsageTrackerContext);










