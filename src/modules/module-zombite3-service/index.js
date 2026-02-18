export {
  GAME_CONSTANTS,
  createInitialState,
  calculateAccuracy,
  resolveShotTarget,
  applyShotOutcome,
  applyCivilianLostPenalty,
  applyCivilianSaved,
  registerShotAttempt,
  registerShotHit,
  buildWaveComposition
} from "./gameRules.js";

export { isLocalAssetPath, evaluateSecurityControls } from "./securityPolicy.js";

export { isPermissiveLicense, validateAssetManifest } from "./assetsPolicy.js";
