import { useMemo } from "react";
import { VERSION_LEVELS, FEATURES_ACCESS, ACCESS_MAP } from "../config/versionAccess";

const DEFAULT_LEVEL = VERSION_LEVELS.DEMO;

export function useAccessControl(userVersion = "DEMO") {
  const level = useMemo(() => VERSION_LEVELS[userVersion?.toUpperCase?.() || "DEMO"] || DEFAULT_LEVEL, [userVersion]);

  const canAccessPage = (path) => {
    const requiredVersion = ACCESS_MAP[path] || ACCESS_MAP[path.replace(/\/$/, "")] || "DEMO";
    const requiredLevel = VERSION_LEVELS[requiredVersion] || DEFAULT_LEVEL;
    return level >= requiredLevel;
  };

  const canUseFeature = (featureKey) => {
    const requiredVersion = FEATURES_ACCESS[featureKey] || "DEMO";
    const requiredLevel = VERSION_LEVELS[requiredVersion] || DEFAULT_LEVEL;
    return level >= requiredLevel;
  };

  return { canAccessPage, canUseFeature, level };
}










