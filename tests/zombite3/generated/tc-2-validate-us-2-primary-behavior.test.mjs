// TC-2: Validate us-2 primary behavior
// Acceptance Criteria: AC-1
// AC-1: Given a running wave with at least one civilian visible, when the player left-clicks and hits that civilian, then score decreases by 50, player life decreases by 15 (or one equivalent strike as specified), and the game shows visual and audio penalty feedback immediately.
import test from "node:test";
import assert from "node:assert/strict";

import {
  fr_2_all_final_visual_audio_assets_must_be_real_licensed_assets_with_clear_permissive_licenses_cc0_mit_apache_equivalent_documented_in_assets_md_and_final_enemies_must_not_be_emojis_or_placeholder_geometric_shapes
} from "../../../src/contracts/fr-2-all-final-visual-audio-assets-mu.js";

test("tc_2_validate_us_2_primary_behavior", async () => {
  const result =
    await fr_2_all_final_visual_audio_assets_must_be_real_licensed_assets_with_clear_permissive_licenses_cc0_mit_apache_equivalent_documented_in_assets_md_and_final_enemies_must_not_be_emojis_or_placeholder_geometric_shapes();

  assert.equal(result.valid, true);
  assert.equal(result.violations.length, 0);
  assert.ok(result.entriesChecked >= 6);
});
