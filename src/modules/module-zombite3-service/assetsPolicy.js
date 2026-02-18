const PERMISSIVE_LICENSE_KEYWORDS = [
  "cc0",
  "mit",
  "apache",
  "bsd",
  "unlicense",
  "isc",
  "public domain"
];

const DISALLOWED_ENEMY_NAME_PATTERNS = [
  /emoji/i,
  /placeholder/i,
  /circle/i,
  /square/i,
  /rectangle/i,
  /shape/i
];

export function isPermissiveLicense(license) {
  const normalized = String(license ?? "").toLowerCase();
  return PERMISSIVE_LICENSE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function hasDisallowedEnemyName(entry) {
  const name = `${entry.name ?? ""} ${entry.file ?? ""}`;
  return DISALLOWED_ENEMY_NAME_PATTERNS.some((pattern) => pattern.test(name));
}

export function validateAssetManifest(entries) {
  const violations = [];

  entries.forEach((entry) => {
    if (!isPermissiveLicense(entry.license)) {
      violations.push(`Asset '${entry.name}' has non-permissive license: ${entry.license}`);
    }

    if (!entry.sourceUrl || !entry.author) {
      violations.push(`Asset '${entry.name}' is missing source URL or author attribution`);
    }

    if (entry.type === "enemy" && hasDisallowedEnemyName(entry)) {
      violations.push(`Enemy asset '${entry.name}' appears to be emoji/placeholder geometry`);
    }
  });

  return {
    valid: violations.length === 0,
    violations
  };
}
