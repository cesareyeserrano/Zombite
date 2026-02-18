import { readFile } from "node:fs/promises";
import {
  validateAssetManifest,
  isLocalAssetPath
} from "../modules/module-zombite3-service/index.js";

const MANIFEST_URL = new URL("../../public/assets/manifest.json", import.meta.url);

async function loadManifestEntries() {
  const text = await readFile(MANIFEST_URL, "utf8");
  const parsed = JSON.parse(text);
  return Array.isArray(parsed.assets) ? parsed.assets : [];
}

/**
 * FR-2: All final visual/audio assets must be real licensed assets with clear permissive licenses (CC0/MIT/Apache/equivalent), documented in ASSETS.md, and final enemies must not be emojis or placeholder geometric shapes.
 */
export async function fr_2_all_final_visual_audio_assets_must_be_real_licensed_assets_with_clear_permissive_licenses_cc0_mit_apache_equivalent_documented_in_assets_md_and_final_enemies_must_not_be_emojis_or_placeholder_geometric_shapes(input = {}) {
  const entries = input.entries ?? (await loadManifestEntries());
  const pathViolations = [];

  for (const entry of entries) {
    if (!isLocalAssetPath(entry.path)) {
      pathViolations.push(`Asset path is not local-safe: ${entry.path}`);
    }
  }

  const policy = validateAssetManifest(entries);
  const violations = [...policy.violations, ...pathViolations];

  return {
    valid: violations.length === 0,
    entriesChecked: entries.length,
    violations
  };
}
