// TC-4: Enforce security control - Do not execute untrusted remote code or dynamic scripts; keep gameplay assets local and validated, and avoid exposing admin/debug endpoints in the dev server build
// Acceptance Criteria: none
// No AC mapped to this TC.
import test from "node:test";
import assert from "node:assert/strict";

import {
  evaluateSecurityControls,
  isLocalAssetPath
} from "../../../src/modules/module-zombite3-service/index.js";

test("tc_4_enforce_security_control_do_not_execute_untrusted_remote_code_or_dynamic_scripts_keep_gameplay_assets_local_and_validated_and_avoid_exposing_admin_debug_endpoints_in_the_dev_server_build", () => {
  assert.equal(isLocalAssetPath("/assets/sprites/zombie-pixel.svg"), true);
  assert.equal(isLocalAssetPath("https://evil.example/remote.js"), false);

  const unsafe = evaluateSecurityControls({
    assetPaths: ["/assets/sprites/zombie-pixel.svg", "https://evil.example/remote.js"],
    exposeDebugEndpoints: true,
    dynamicScriptExecution: true
  });

  assert.equal(unsafe.ok, false);
  assert.ok(unsafe.reasons.some((reason) => reason.includes("non-local asset path")));
  assert.ok(unsafe.reasons.some((reason) => reason.includes("Debug or admin endpoint")));
  assert.ok(unsafe.reasons.some((reason) => reason.includes("Dynamic script execution")));

  const safe = evaluateSecurityControls({
    assetPaths: ["/assets/sprites/zombie-pixel.svg", "/assets/sprites/civilian-pixel.svg"],
    exposeDebugEndpoints: false,
    dynamicScriptExecution: false
  });

  assert.equal(safe.ok, true);
  assert.equal(safe.reasons.length, 0);
});
