export const GAME_CONSTANTS = {
  initialLife: 100,
  maxLife: 100,
  zombieKillScore: 10,
  eliteZombieBonusScore: 30,
  civilianPenaltyScore: 15,
  civilianPenaltyLife: 10,
  civilianLossLife: 10,
  healthPowerupValue: 20,
  rescuePowerupScore: 50,
  shotHitRadius: 26,
  shotCooldownMs: 250,
  civiliansLostLimitBase: 6,
  civiliansGoalBase: 10,
  zombieThreatDistance: 100
};

const TARGET_PRIORITY = {
  "zombie-brute": 4,
  "zombie-elite": 3,
  zombie: 2,
  civilian: 1,
  "powerup-health": 0,
  "powerup-rescue": 0
};

export function createInitialState(overrides = {}) {
  return {
    score: 0,
    life: GAME_CONSTANTS.initialLife,
    level: 1,
    wave: 1,
    shots: 0,
    hits: 0,
    kills: 0,
    civiliansHit: 0,
    civiliansLost: 0,
    civiliansSaved: 0,
    civiliansGoal: GAME_CONSTANTS.civiliansGoalBase,
    civiliansLostLimit: GAME_CONSTANTS.civiliansLostLimitBase,
    elapsedLevelSeconds: 0,
    levelCompleted: false,
    levelCompleteBonus: 0,
    gameOver: false,
    gameOverReason: "",
    lastFeedback: null,
    ...overrides
  };
}

export function calculateAccuracy(shots, hits) {
  if (!shots) {
    return 0;
  }

  return Math.round((hits / shots) * 1000) / 10;
}

function getPriority(type) {
  return TARGET_PRIORITY[type] ?? 0;
}

function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function resolveShotTarget({
  crosshair,
  entities,
  hitRadius = GAME_CONSTANTS.shotHitRadius,
  targetPriority = TARGET_PRIORITY
}) {
  const candidates = entities
    .filter((entity) => {
      const radius = entity.hitRadius ?? 20;
      const maxDist = hitRadius + radius;
      return distanceSquared(crosshair, entity) <= maxDist * maxDist;
    })
    .sort((a, b) => {
      const priorityDiff = (targetPriority[b.type] ?? 0) - (targetPriority[a.type] ?? 0);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const distDiff = distanceSquared(crosshair, a) - distanceSquared(crosshair, b);
      if (distDiff !== 0) {
        return distDiff;
      }

      const spawnDiff = (a.spawnIndex ?? Number.MAX_SAFE_INTEGER) - (b.spawnIndex ?? Number.MAX_SAFE_INTEGER);
      if (spawnDiff !== 0) {
        return spawnDiff;
      }

      return String(a.id).localeCompare(String(b.id));
    });

  return candidates[0] ?? null;
}

export function applyShotOutcome(state, target, options = {}) {
  const civilianPenaltyScore = options.civilianPenaltyScore ?? GAME_CONSTANTS.civilianPenaltyScore;
  const civilianPenaltyLife = options.civilianPenaltyLife ?? GAME_CONSTANTS.civilianPenaltyLife;
  const zombieKillScore = options.zombieKillScore ?? GAME_CONSTANTS.zombieKillScore;
  const eliteZombieBonusScore = options.eliteZombieBonusScore ?? GAME_CONSTANTS.eliteZombieBonusScore;
  const countShot = options.countShot ?? true;
  const countHit = options.countHit ?? true;

  const next = {
    ...state,
    shots: state.shots + (countShot ? 1 : 0),
    lastFeedback: {
      kind: "miss",
      audio: "shot",
      visual: {
        muzzleFlash: true,
        hitMarker: false,
        screenShake: false,
        penaltyMessage: false
      }
    }
  };

  if (!target) {
    return withAccuracy(next);
  }

  if (target.type === "civilian") {
    next.score -= civilianPenaltyScore;
    next.life -= civilianPenaltyLife;
    next.hits += countHit ? 1 : 0;
    next.civiliansHit += 1;
    next.lastFeedback = {
      kind: "civilian-penalty",
      audio: "civilian-error",
      visual: {
        muzzleFlash: true,
        hitMarker: true,
        screenShake: true,
        penaltyMessage: true
      }
    };
  } else if (target.type === "zombie") {
    const points = target.isElite ? zombieKillScore + eliteZombieBonusScore : zombieKillScore;
    next.score += points;
    next.hits += countHit ? 1 : 0;
    next.kills += 1;
    next.lastFeedback = {
      kind: "zombie-kill",
      audio: "zombie-kill",
      visual: {
        muzzleFlash: true,
        hitMarker: true,
        screenShake: true,
        penaltyMessage: false
      }
    };
  } else if (target.type === "powerup-health") {
    next.hits += countHit ? 1 : 0;
    next.life = Math.min(GAME_CONSTANTS.maxLife, next.life + GAME_CONSTANTS.healthPowerupValue);
    next.lastFeedback = {
      kind: "powerup-health",
      audio: "powerup-positive",
      visual: {
        muzzleFlash: true,
        hitMarker: true,
        screenShake: false,
        penaltyMessage: false
      }
    };
  } else if (target.type === "powerup-rescue") {
    next.hits += countHit ? 1 : 0;
    next.score += GAME_CONSTANTS.rescuePowerupScore;
    next.civiliansLost = Math.max(0, next.civiliansLost - 1);
    next.lastFeedback = {
      kind: "powerup-rescue",
      audio: "rescue-bonus",
      visual: {
        muzzleFlash: true,
        hitMarker: true,
        screenShake: false,
        penaltyMessage: false
      }
    };
  }

  return withGameOver(withAccuracy(next));
}

export function applyCivilianLostPenalty(state, lifeDamage = GAME_CONSTANTS.civilianLossLife, options = {}) {
  const lostCount = options.lostCount ?? 1;
  const savedPenalty = options.savedPenalty ?? 0;
  const next = {
    ...state,
    life: state.life - lifeDamage,
    civiliansLost: state.civiliansLost + lostCount,
    civiliansSaved: Math.max(0, state.civiliansSaved - savedPenalty),
    lastFeedback: {
      kind: "civilian-lost",
      audio: "danger-alert",
      visual: {
        muzzleFlash: false,
        hitMarker: false,
        screenShake: true,
        penaltyMessage: false
      }
    }
  };

  return withGameOver(withAccuracy(next));
}

export function applyCivilianSaved(state, amount = 1) {
  const next = {
    ...state,
    civiliansSaved: state.civiliansSaved + amount
  };

  return withGameOver(withAccuracy(next));
}

export function registerShotAttempt(state) {
  return withGameOver(
    withAccuracy({
      ...state,
      shots: state.shots + 1,
      lastFeedback: {
        kind: "miss",
        audio: "shot",
        visual: {
          muzzleFlash: true,
          hitMarker: false,
          screenShake: false,
          penaltyMessage: false
        }
      }
    })
  );
}

export function registerShotHit(state) {
  return withGameOver(
    withAccuracy({
      ...state,
      hits: state.hits + 1
    })
  );
}

function withAccuracy(state) {
  return {
    ...state,
    accuracy: calculateAccuracy(state.shots, state.hits)
  };
}

function withGameOver(state) {
  if (state.life > 0 && state.civiliansLost < state.civiliansLostLimit) {
    return {
      ...state,
      gameOver: false,
      gameOverReason: ""
    };
  }

  return {
    ...state,
    life: 0,
    gameOver: true,
    gameOverReason: state.life <= 0 ? "life-depleted" : "too-many-civilians-lost"
  };
}

export function getDifficultyProfile(level) {
  if (level <= 2) {
    return {
      civilianBaseSpeed: 110,
      zombieChaseMultiplierMin: 1.3,
      zombieChaseMultiplierMax: 1.5,
      maxZombiesSimultaneous: 4,
      maxCiviliansSimultaneous: 3,
      spawnIntervalMinMs: 1200,
      spawnIntervalMaxMs: 1800,
      captureDistanceMultiplier: 0.85,
      friendlyFireScorePenalty: 15,
      friendlyFireLifePenalty: 10,
      civilianLostLifePenalty: 10,
      fastZombieChance: 0.1,
      routeVariation: false
    };
  }
  if (level <= 4) {
    return {
      civilianBaseSpeed: 90,
      zombieChaseMultiplierMin: 1.2,
      zombieChaseMultiplierMax: 1.3,
      maxZombiesSimultaneous: level === 3 ? 3 : 4,
      maxCiviliansSimultaneous: 3,
      spawnIntervalMinMs: 2850,
      spawnIntervalMaxMs: 3150,
      captureDistanceMultiplier: 1,
      friendlyFireScorePenalty: 15,
      friendlyFireLifePenalty: 10,
      civilianLostLifePenalty: 10,
      fastZombieChance: 0.25,
      routeVariation: true
    };
  }
  return {
    civilianBaseSpeed: 94,
    zombieChaseMultiplierMin: 1.1,
    zombieChaseMultiplierMax: 1.3,
    maxZombiesSimultaneous: level >= 10 ? 7 : 5,
    maxCiviliansSimultaneous: level >= 10 ? 5 : 3,
    spawnIntervalMinMs: level >= 10 ? 1100 : 2350,
    spawnIntervalMaxMs: level >= 10 ? 1300 : 2650,
    captureDistanceMultiplier: 1.05,
    friendlyFireScorePenalty: 15,
    friendlyFireLifePenalty: 10,
    civilianLostLifePenalty: 10,
    fastZombieChance: 0.4,
    routeVariation: true
  };
}

// NOTE: buildWaveComposition returns { zombies, civilians, queue }.
// In the current wave orchestration (GameScene.beginWave), only the
// `civilians` count is used to populate the spawn queue. The `queue`
// array (zombie entries) is intentionally not consumed there — zombies
// enter via schedulePursuerForCivilian (one pursuer paired per civilian).
// The `zombies` and `queue` fields remain for test coverage of the
// composition model (TC-8 family) and for future wave designs that may
// use direct zombie spawning instead of the pursuer-pair model.
export function buildWaveComposition(totalSpawns) {
  const civilians = Math.max(1, Math.ceil(totalSpawns / 2));
  const zombies = Math.max(1, totalSpawns - civilians);

  const queue = [];
  for (let i = 0; i < zombies; i += 1) {
    queue.push("zombie");
  }
  for (let i = 0; i < civilians; i += 1) {
    queue.push("civilian");
  }

  return {
    zombies,
    civilians,
    queue
  };
}
