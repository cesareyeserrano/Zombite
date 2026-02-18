const REMOTE_URL_PATTERN = /^(https?:)?\/\//i;
const DYNAMIC_URL_PATTERN = /^(javascript:|data:text\/html)/i;

export function isLocalAssetPath(assetPath) {
  if (typeof assetPath !== "string") {
    return false;
  }

  if (REMOTE_URL_PATTERN.test(assetPath)) {
    return false;
  }

  if (DYNAMIC_URL_PATTERN.test(assetPath)) {
    return false;
  }

  if (!assetPath.startsWith("/")) {
    return false;
  }

  return !assetPath.includes("..") && !assetPath.includes("\\");
}

export function evaluateSecurityControls({
  assetPaths = [],
  exposeDebugEndpoints = false,
  dynamicScriptExecution = false
} = {}) {
  const reasons = [];

  for (const assetPath of assetPaths) {
    if (!isLocalAssetPath(assetPath)) {
      reasons.push(`Rejected non-local asset path: ${assetPath}`);
    }
  }

  if (exposeDebugEndpoints) {
    reasons.push("Debug or admin endpoint exposure is not allowed in dev build");
  }

  if (dynamicScriptExecution) {
    reasons.push("Dynamic script execution is blocked by policy");
  }

  return {
    ok: reasons.length === 0,
    reasons
  };
}
