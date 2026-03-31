import Phaser from "phaser";
import { AudioManager } from "../audio/AudioManager.js";
import {
  GAME_CONSTANTS,
  createInitialState,
  resolveShotTarget,
  applyShotOutcome,
  applyCivilianLostPenalty,
  applyCivilianSaved,
  registerShotAttempt,
  registerShotHit,
  buildWaveComposition,
  getDifficultyProfile,
  evaluateSecurityControls
} from "../modules/module-zombite3-service/index.js";

const VIEWPORT = {
  width: 960,
  height: 540
};

const GROUND_Y = 430;
const DANGER_DISTANCE_PX = 100;

const LANES = [
  { id: "back", y: GROUND_Y - 20, scale: 0.7, shadowScale: 0.7, depth: 180 },
  { id: "mid", y: GROUND_Y, scale: 0.85, shadowScale: 0.85, depth: 240 },
  { id: "front", y: GROUND_Y + 28, scale: 1, shadowScale: 1, depth: 320 }
];

const CIVILIAN_TEXTURE_KEYS = ["npc-civilian", "npc-civilian-office", "npc-civilian-casual", "npc-civilian-urban"];
const ZOMBIE_TEXTURE_KEYS = ["enemy-zombie", "enemy-zombie-office", "enemy-zombie-urban", "enemy-zombie-rager"];
const ALT_TEXTURE_MAP = {
  "npc-civilian": "npc-civilian-step",
  "npc-civilian-office": "npc-civilian-office-step",
  "npc-civilian-casual": "npc-civilian-casual-step",
  "npc-civilian-urban": "npc-civilian-urban-step",
  "enemy-zombie": "enemy-zombie-step",
  "enemy-zombie-office": "enemy-zombie-office-step",
  "enemy-zombie-urban": "enemy-zombie-urban-step",
  "enemy-zombie-rager": "enemy-zombie-rager-step",
  "enemy-zombie-alpha": "enemy-zombie-alpha-step",
  "enemy-zombie-brute": "enemy-zombie-brute-step"
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.center = new Phaser.Math.Vector2(VIEWPORT.width / 2, VIEWPORT.height / 2);
    this.entities = new Map();
    this.spawnQueue = [];
    this.pendingPursuers = [];
    this.spawnIndex = 0;
    this.waveInProgress = false;
    this.started = false;
    this.isPaused = false;
    this.lastShotAt = 0;
    this.levelDurationSec = 55;
    this.recentCivilLossTimes = [];
    this.crosshairOverCivilian = false;
    this.lastCrosshairWarnAt = 0;
    this.zombieVisualPool = [];
    this.civilianVisualPool = [];
    this.shotTrailPool = [];
    this.particlePool = [];
    this.audioMuted = false;
    this.lastCriticalAlertAt = 0;
  }

  create() {
    this.state = createInitialState();
    this.levelStartAt = this.time.now;
    this.nextWaveAt = this.time.now + 600;
    this.nextPowerupAt = this.time.now + 17000;

    this.background = this.add
      .image(this.center.x, this.center.y, "bg-city")
      .setDisplaySize(VIEWPORT.width + 160, VIEWPORT.height + 120)
      .setDepth(0)
      .setTint(0x444444); // Oscurecer fondo significativamente para contraste

    this.createParallaxLayers();
    this.createAtmosphereLayers();

    // Viñeta para centrar atención
    this.add.rectangle(this.center.x, this.center.y, VIEWPORT.width, VIEWPORT.height, 0x000000, 0.2).setDepth(5);


    this.drawGround();
    this.createSafeZones();

    this.crosshair = this.add.image(this.center.x, this.center.y, "crosshair").setScale(2).setDepth(1200);
    this.muzzleFlash = this.add.image(this.center.x, this.center.y, "muzzle-flash").setScale(2).setAlpha(0).setDepth(1202);
    this.hitMarker = this.add.image(this.center.x, this.center.y, "hit-marker").setScale(2).setAlpha(0).setDepth(1201);
    this.createShotTrailPool();
    // Gunner position: left-side fixed origin for shot trail visualization.
    // Defined here so it can be adjusted for different viewport sizes in the future.
    this.gunnerOrigin = { x: 130, y: GROUND_Y - 34 };
    this.createParticlePool();

    this.feedbackLabel = this.add
      .text(this.center.x, this.center.y - 90, "", {
        color: "#fee2e2",
        fontFamily: "Verdana",
        fontSize: "34px",
        stroke: "#7f1d1d",
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(1300)
      .setAlpha(0);

    this.hudFlash = this.add.rectangle(this.center.x, this.center.y, VIEWPORT.width, VIEWPORT.height, 0xef4444, 0).setDepth(1100);
    this.impactFlash = this.add.rectangle(this.center.x, this.center.y, VIEWPORT.width, VIEWPORT.height, 0xffffff, 0).setDepth(1110);

    this.bindInput();
    this.bindUiChannel();
    this.runSecurityBaseline();
    this.audioMuted = this.readAudioMuted();
    this.audio = new AudioManager(this.time);
    this.audio.setMuted(this.audioMuted);
    this.emitHudUpdate();
    this.emitRunState({ showStart: true });
    this.emitAudioState();
  }

  drawGround() {
    // Sidewalk band (top) + asphalt (bottom)
    this.add.rectangle(this.center.x, GROUND_Y - 20, VIEWPORT.width, 40, 0x334155, 1).setDepth(18);
    this.add.rectangle(this.center.x, GROUND_Y + 54, VIEWPORT.width, 128, 0x1e293b, 1).setDepth(19);
    this.add.rectangle(this.center.x, GROUND_Y, VIEWPORT.width, 4, 0x475569, 1).setDepth(26);
    this.add.rectangle(this.center.x, GROUND_Y + 18, VIEWPORT.width, 8, 0x111827, 0.45).setDepth(20);
    this.add.rectangle(this.center.x, GROUND_Y - 34, VIEWPORT.width, 10, 0x475569, 0.95).setDepth(17);

    // Traffic lines
    for (let i = 0; i < 10; i++) {
      this.add.rectangle(i * 120, GROUND_Y + 50, 40, 3, 0x64748b, 0.4).setDepth(21);
    }

    this.add.image(132, GROUND_Y + 34, "prop-car-wreck").setOrigin(0.5, 1).setScale(1.2).setDepth(23).setAlpha(0.95);
    this.add.image(310, GROUND_Y - 6, "prop-barricade").setOrigin(0.5, 1).setScale(1.05).setDepth(23).setAlpha(0.96);
    this.add.image(520, GROUND_Y + 12, "prop-barricade").setOrigin(0.5, 1).setScale(0.94).setDepth(22).setAlpha(0.82);
    this.add.image(704, GROUND_Y + 28, "prop-car-wreck").setOrigin(0.5, 1).setScale(0.92).setDepth(21).setAlpha(0.78);
    this.add.image(804, GROUND_Y - 10, "prop-evac-sign").setOrigin(0.5, 1).setScale(0.92).setDepth(24).setAlpha(0.96);
  }

  createParallaxLayers() {
    this.parallaxClouds = [];

    for (let i = 0; i < 7; i += 1) {
      const x = Phaser.Math.Between(-80, VIEWPORT.width + 80);
      const y = Phaser.Math.Between(46, 168);
      const width = Phaser.Math.Between(70, 130);
      const cloud = this.add.rectangle(x, y, width, 16, 0xf8fafc, 0.4).setDepth(4); // Nubes más tenues
      cloud.speed = Phaser.Math.FloatBetween(5, 12); // Más lentas
      this.parallaxClouds.push(cloud);
    }
  }

  createAtmosphereLayers() {
    this.skyPulse = this.add.circle(this.center.x, 110, 190, 0x38bdf8, 0.06).setDepth(3);
    this.dangerHaze = this.add.ellipse(170, 250, 260, 140, 0xef4444, 0.045).setDepth(6);
    this.cityGlow = this.add.rectangle(this.center.x, 184, VIEWPORT.width, 120, 0x0f172a, 0.08).setDepth(2);
  }

  createShotTrailPool() {
    this.shotTrailPool = [];
    for (let i = 0; i < 16; i += 1) {
      const trail = this.add.rectangle(-100, -100, 8, 2, 0xf8fafc, 0).setDepth(1198);
      trail.busy = false;
      this.shotTrailPool.push(trail);
    }
  }

  createParticlePool() {
    this.particlePool = [];
    for (let i = 0; i < 90; i += 1) {
      const dot = this.add.rectangle(-100, -100, 3, 3, 0xffffff, 0).setDepth(1190);
      dot.busy = false;
      this.particlePool.push(dot);
    }
  }

  createSafeZones() {
    this.bunker = this.add
      .image(VIEWPORT.width - 42, GROUND_Y, "safe-bunker")
      .setOrigin(0.5, 1)
      .setScale(2.1)
      .setDepth(350);
    this.bunkerHalo = this.add.circle(VIEWPORT.width - 42, GROUND_Y - 28, 58, 0x38bdf8, 0.08).setDepth(349);
    this.bunkerCone = this.add.triangle(VIEWPORT.width - 56, GROUND_Y - 86, 0, 120, 74, 0, 148, 120, 0x38bdf8, 0.08).setDepth(348).setAngle(-8);
    this.bunkerBeacon = this.add.rectangle(VIEWPORT.width - 42, GROUND_Y - 42, 18, 8, 0x38bdf8, 0.35).setDepth(351);
  }

  bindInput() {
    this.input.on("pointermove", (pointer) => {
      this.crosshair.setPosition(
        Phaser.Math.Clamp(pointer.x, 16, VIEWPORT.width - 16),
        Phaser.Math.Clamp(pointer.y, 16, VIEWPORT.height - 16)
      );
    });

    this.input.on("pointerdown", () => {
      this.audio.ensure();
      this.handleShot();
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.togglePause();
    });

    this.input.keyboard.on("keydown-R", () => {
      if (this.started) {
        this.restartRun();
      }
    });
  }

  bindUiChannel() {
    this.events.on("ui:start", this.startRun, this);
    this.events.on("ui:restart", this.restartRun, this);
    this.events.on("ui:pause-toggle", this.togglePause, this);
    this.events.on("ui:next-level", this.nextLevel, this);
  }

  runSecurityBaseline() {
    const security = evaluateSecurityControls({
      assetPaths: [
        "/assets/sprites/background-city.svg",
        "/assets/sprites/zombie-pixel.svg",
        "/assets/sprites/zombie-pixel-step.svg",
        "/assets/sprites/zombie-office.svg",
        "/assets/sprites/zombie-office-step.svg",
        "/assets/sprites/zombie-urban.svg",
        "/assets/sprites/zombie-urban-step.svg",
        "/assets/sprites/zombie-rager.svg",
        "/assets/sprites/zombie-rager-step.svg",
        "/assets/sprites/zombie-alpha.svg",
        "/assets/sprites/zombie-alpha-step.svg",
        "/assets/sprites/zombie-brute.svg",
        "/assets/sprites/zombie-brute-step.svg",
        "/assets/sprites/zombie-dead.svg",
        "/assets/sprites/civilian-pixel.svg",
        "/assets/sprites/civilian-pixel-step.svg",
        "/assets/sprites/civilian-dead.svg",
        "/assets/sprites/civilian-infected.svg",
        "/assets/sprites/civilian-office.svg",
        "/assets/sprites/civilian-office-step.svg",
        "/assets/sprites/civilian-casual.svg",
        "/assets/sprites/civilian-casual-step.svg",
        "/assets/sprites/civilian-urban.svg",
        "/assets/sprites/civilian-urban-step.svg",
        "/assets/sprites/crosshair-pixel.svg",
        "/assets/sprites/muzzle-flash.svg",
        "/assets/sprites/hit-marker.svg",
        "/assets/sprites/powerup-health.svg",
        "/assets/sprites/powerup-rescue.svg",
        "/assets/sprites/prop-car-wreck.svg",
        "/assets/sprites/prop-barricade.svg",
        "/assets/sprites/prop-evac-sign.svg",
        "/assets/sprites/safe-bunker.svg"
      ],
      exposeDebugEndpoints: false,
      dynamicScriptExecution: false
    });

    // NOTE: This is a development-time audit tool, not a runtime enforcement gate.
    // It confirms that the declared asset paths conform to the local-asset policy
    // defined in securityPolicy.js. A failure here does NOT block gameplay — it
    // signals a policy drift that should be resolved before shipping. If you need
    // a hard block on policy violations, throw here instead of warning.
    if (!security.ok) {
      // eslint-disable-next-line no-console
      console.warn("Security policy warnings (audit only, non-blocking):", security.reasons);
    }
  }

  startRun() {
    this.resetForLevel(1, true);
    this.emitRunState({ showStart: false });
    this.events.emit("message", { tone: "info", text: "Protect the civilians" });
  }

  restartRun() {
    this.resetForLevel(1, true);
    this.emitRunState({ showStart: false });
  }

  nextLevel() {
    this.resetForLevel(this.state.level + 1, false);
    this.emitRunState({ showStart: false });
    this.events.emit("message", { tone: "info", text: `Level ${this.state.level} started` });
  }

  resetForLevel(level, resetScore) {
    this.clearEntities();

    const carryScore = resetScore ? 0 : this.state.score;
    const carryShots = resetScore ? 0 : this.state.shots;
    const carryHits = resetScore ? 0 : this.state.hits;
    const carryKills = resetScore ? 0 : this.state.kills;

    this.state = createInitialState({
      level,
      wave: 1,
      score: carryScore,
      shots: carryShots,
      hits: carryHits,
      kills: carryKills,
      civiliansGoal: this.getGoalForLevel(level),
      civiliansLostLimit: Math.max(4, GAME_CONSTANTS.civiliansLostLimitBase + Math.floor(level / 3)),
      life: GAME_CONSTANTS.maxLife,
      civiliansSaved: 0,
      civiliansLost: 0,
      elapsedLevelSeconds: 0,
      levelCompleted: false,
      levelCompleteBonus: 0
    });

    this.started = true;
    this.isPaused = false;
    this.waveInProgress = false;
    this.spawnQueue = [];
    this.pendingPursuers = [];
    this.spawnIndex = 0;
    this.levelStartAt = this.time.now;
    this.nextWaveAt = this.time.now + 500;
    this.nextPowerupAt = this.time.now + Phaser.Math.Between(17000, 32000);
    this.lastShotAt = 0;
    this.recentCivilLossTimes = [];
    this.crosshairOverCivilian = false;
    this.lastCrosshairWarnAt = 0;
    this.lastCriticalAlertAt = 0;
    this.emitHudUpdate();
  }

  togglePause() {
    if (!this.started || this.state.gameOver || this.state.levelCompleted) {
      return;
    }

    this.isPaused = !this.isPaused;
    this.emitRunState({ showPause: this.isPaused });
  }

  update(time, deltaMs) {
    if (!this.started || this.isPaused || this.state.gameOver || this.state.levelCompleted) {
      return;
    }

    const delta = deltaMs / 1000;
    this.background.setPosition(this.center.x, this.center.y);
    this.updateParallax(delta);

    this.state.elapsedLevelSeconds = Math.floor((time - this.levelStartAt) / 1000);

    if (!this.waveInProgress && time >= this.nextWaveAt) {
      this.beginWave();
    }

    if (this.waveInProgress && this.spawnQueue.length > 0 && time >= this.nextSpawnAt) {
      this.spawnFromQueue();
      this.nextSpawnAt = time + this.spawnInterval;
    }

    if (this.pendingPursuers.length > 0) {
      this.flushPendingPursuers(time);
    }

    if (time >= this.nextPowerupAt) {
      this.spawnPowerup();
      this.nextPowerupAt = time + Phaser.Math.Between(17000, 32000);
    }

    for (const entity of this.entities.values()) {
      this.updateEntity(entity, delta);
    }

    this.updateCrosshairHazardVisual();
    this.processCriticalStateAudio();
    this.processDangerIndicators();
    this.processZombieCivilianContacts();
    this.checkLevelProgress(time);

    if (
      this.waveInProgress &&
      this.spawnQueue.length === 0 &&
      !this.hasType("zombie") &&
      !this.hasType("zombie-elite") &&
      !this.hasType("zombie-brute")
    ) {
      this.waveInProgress = false;
      this.state.wave += 1;
      this.nextWaveAt = time + 900;
      this.events.emit("message", { tone: "info", text: `Wave ${this.state.wave} incoming` });
    }

    this.emitHudUpdate();
  }

  updateParallax(delta) {
    const now = this.time.now;
    if (this.skyPulse) {
      this.skyPulse.setAlpha(0.045 + Math.abs(Math.sin(now * 0.0014)) * 0.04);
      this.skyPulse.setScale(1 + Math.sin(now * 0.0011) * 0.04);
    }
    if (this.dangerHaze) {
      this.dangerHaze.setPosition(170 + Math.sin(now * 0.0008) * 18, 250 + Math.cos(now * 0.0009) * 8);
      this.dangerHaze.setAlpha(0.035 + Math.abs(Math.sin(now * 0.0017)) * 0.03);
    }
    if (this.cityGlow) {
      this.cityGlow.setAlpha(0.06 + Math.abs(Math.sin(now * 0.0012)) * 0.03);
    }
    for (const cloud of this.parallaxClouds) {
      cloud.x -= cloud.speed * delta;
      if (cloud.x < -120) {
        cloud.x = VIEWPORT.width + Phaser.Math.Between(40, 120);
        cloud.y = Phaser.Math.Between(40, 170);
      }
    }
  }

  beginWave() {
    const profile = this.getDifficultyProfile();
    const spawnCount = 10 + this.state.level * 4 + this.state.wave * 3;
    const composition = buildWaveComposition(spawnCount);
    const civiliansOnly = [];
    for (let i = 0; i < composition.civilians; i += 1) {
      civiliansOnly.push("civilian");
    }
    this.spawnQueue = Phaser.Utils.Array.Shuffle(civiliansOnly);

    // Boss exceptions may appear without civilian pair.
    if (this.state.level >= 3) {
      this.spawnQueue.push("zombie-elite");
    }
    if (this.state.level >= 5) {
      this.spawnQueue.push("zombie-brute");
    }

    this.spawnIntervalMin = profile.spawnIntervalMinMs;
    this.spawnIntervalMax = profile.spawnIntervalMaxMs;
    this.spawnInterval = Phaser.Math.Between(this.spawnIntervalMin, this.spawnIntervalMax);
    this.nextSpawnAt = this.time.now + 120;
    this.waveInProgress = true;
  }

  spawnFromQueue() {
    const type = this.spawnQueue.shift();
    if (!type) {
      return;
    }

    const profile = this.getDifficultyProfile();
    const zombieCount = this.getEntitiesByTypes(["zombie", "zombie-elite", "zombie-brute"]).length;
    const civilianCount = this.getEntitiesByType("civilian").length;

    if ((type === "zombie" || type === "zombie-elite" || type === "zombie-brute") && zombieCount >= profile.maxZombiesSimultaneous) {
      this.spawnQueue.push(type);
      return;
    }

    if (type === "civilian" && civilianCount >= profile.maxCiviliansSimultaneous) {
      this.spawnQueue.push(type);
      return;
    }

    const id = `${type}-${this.spawnIndex + 1}`;
    this.spawnIndex += 1;

    if (type === "civilian") {
      const civilianId = this.spawnCivilian(id);
      this.schedulePursuerForCivilian(civilianId);
    } else if (type === "zombie" || type === "zombie-elite" || type === "zombie-brute") {
      this.spawnZombie(id, type);
    }

    this.spawnInterval = Phaser.Math.Between(this.spawnIntervalMin, this.spawnIntervalMax);
  }

  spawnCivilian(id) {
    const profile = this.getDifficultyProfile();
    const lane = this.pickLane();
    const fromLeft = true;
    const x = fromLeft ? -42 : VIEWPORT.width + 42;
    const textureKey = CIVILIAN_TEXTURE_KEYS[this.spawnIndex % CIVILIAN_TEXTURE_KEYS.length];
    const visual = this.acquireCivilianVisual(lane, x, fromLeft, textureKey);
    const sprite = visual.sprite;
    const shadow = visual.shadow;
    const dangerIcon = visual.dangerIcon;

    const baseSpeed = profile.civilianBaseSpeed + Phaser.Math.Between(0, 8);

    this.entities.set(id, {
      id,
      type: "civilian",
      lane,
      x,
      y: lane.y,
      hitRadius: Math.round(14 * lane.scale),
      direction: fromLeft ? 1 : -1,
      speed: baseSpeed,
      panicSpeed: baseSpeed + 65,
      velocityX: 0,
      bobPhase: Phaser.Math.FloatBetween(0, Math.PI * 2),
      bobSpeed: Phaser.Math.FloatBetween(8, 12),
      age: 0,
      spawnIndex: this.spawnIndex,
      textureKey,
      altTextureKey: ALT_TEXTURE_MAP[textureKey] ?? textureKey,
      animationFrame: 0,
      sprite,
      shadow,
      dangerIcon,
      inDanger: false,
      inDangerSince: 0,
      wasInDanger: false,
      crosshairInside: false,
      protectedUntil: 0
    });

    return id;
  }

  spawnZombie(id, zombieType, options = {}) {
    const profile = this.getDifficultyProfile();
    const lane = this.pickLane();
    const spawnPoint = this.pickZombieSpawnPoint(lane, options.targetCivilianId);
    
    // Usar coordenadas personalizadas si se proporcionan (para infecciones)
    const finalX = options.customX ?? spawnPoint.x;
    const finalY = options.customY ?? lane.y;

    const speedBase = profile.civilianBaseSpeed * Phaser.Math.FloatBetween(profile.zombieChaseMultiplierMin, profile.zombieChaseMultiplierMax);
    const isElite = zombieType === "zombie-elite";
    const isBrute = zombieType === "zombie-brute";

    let speed = speedBase + Phaser.Math.Between(0, 6);
    if (isElite) {
      speed = profile.civilianBaseSpeed * 1.3 + Phaser.Math.Between(0, 4);
    } else if (isBrute) {
      speed = profile.civilianBaseSpeed * 1.1 + Phaser.Math.Between(0, 3);
    } else {
      speed = profile.civilianBaseSpeed * 1.2 + Phaser.Math.Between(0, 4);
    }

    const visual = this.acquireZombieVisual(zombieType, lane, { x: finalX, y: finalY });
    const sprite = visual.sprite;
    const shadow = visual.shadow;

    const maxHp = isBrute ? 6 : isElite ? 3 : 1;
    const hp = maxHp;

    const hpBarBg = visual.hpBarBg;
    const hpBarFill = visual.hpBarFill;

    this.entities.set(id, {
      id,
      type: zombieType,
      lane,
      x: finalX,
      y: finalY,
      hitRadius: Math.round((isBrute ? 30 : isElite ? 24 : 18) * lane.scale),
      speed,
      velocityX: 0,
      velocityY: 0,
      zigzagAmp: Phaser.Math.Between(5, 12) * lane.scale,
      zigzagFreq: Phaser.Math.FloatBetween(2.2, 3.6),
      zigzagPhase: Phaser.Math.FloatBetween(0, Math.PI * 2),
      age: 0,
      spawnIndex: this.spawnIndex,
      textureKey: visual.textureKey,
      altTextureKey: ALT_TEXTURE_MAP[visual.textureKey] ?? visual.textureKey,
      animationFrame: 0,
      sprite,
      shadow,
      hp,
      maxHp,
      isElite,
      isBrute,
      knockbackTimer: 0,
      targetCivilianId: options.targetCivilianId ?? this.chooseCivilianTargetId(lane.id),
      hpBarBg,
      hpBarFill
    });
  }

  schedulePursuerForCivilian(civilianId) {
    const civil = this.entities.get(civilianId);
    if (!civil || civil.type !== "civilian") {
      return;
    }

    const pursuerType = this.state.level >= 3 && Phaser.Math.FloatBetween(0, 1) < 0.2 ? "zombie-elite" : "zombie";
    this.pendingPursuers.push({
      spawnAt: this.time.now + Phaser.Math.Between(1000, 2000),
      civilianId,
      zombieType: pursuerType
    });
  }

  flushPendingPursuers(time) {
    const profile = this.getDifficultyProfile();
    let zombiesActive = this.getEntitiesByTypes(["zombie", "zombie-elite", "zombie-brute"]).length;

    this.pendingPursuers = this.pendingPursuers.filter((entry) => {
      if (entry.spawnAt > time) {
        return true;
      }

      if (zombiesActive >= profile.maxZombiesSimultaneous) {
        entry.spawnAt = time + 300;
        return true;
      }

      const civil = this.entities.get(entry.civilianId);
      if (!civil || civil.type !== "civilian") {
        return false;
      }

      const zid = `${entry.zombieType}-${this.spawnIndex + 1}`;
      this.spawnIndex += 1;
      this.spawnZombie(zid, entry.zombieType, { targetCivilianId: entry.civilianId });
      zombiesActive += 1;
      return false;
    });
  }

  spawnPowerup() {
    const healthChance = this.shouldBoostHealthPowerup() ? 0.8 : 0.5;
    const isHealth = Phaser.Math.FloatBetween(0, 1) <= healthChance;
    const fromLeft = Phaser.Math.Between(0, 1) === 0;
    const y = Phaser.Math.Between(70, 170);
    const x = fromLeft ? -36 : VIEWPORT.width + 36;
    const type = isHealth ? "powerup-health" : "powerup-rescue";

    const sprite = this.add
      .image(x, y, isHealth ? "powerup-health" : "powerup-rescue")
      .setScale(2.2)
      .setDepth(500);
    const glow = this.add.circle(x, y, 20, isHealth ? 0x22c55e : 0xf59e0b, 0.24).setDepth(499);

    this.entities.set(`powerup-${this.spawnIndex + 1}`, {
      id: `powerup-${this.spawnIndex + 1}`,
      type,
      x,
      y,
      hitRadius: 18,
      direction: fromLeft ? 1 : -1,
      speed: 84,
      age: 0,
      spawnIndex: this.spawnIndex + 1,
      sprite,
      glow
    });

    this.spawnIndex += 1;
  }

  updateEntity(entity, delta) {
    if (entity.isBeingRescued) return;
    entity.age += delta;

    if (entity.type === "civilian") {
      const desiredSpeed = entity.speed;
      const desiredVelocityX = entity.direction * desiredSpeed;
      const accelAlpha = Phaser.Math.Clamp(delta / 0.4, 0, 1);
      entity.velocityX = Phaser.Math.Linear(entity.velocityX, desiredVelocityX, accelAlpha);
      entity.x += entity.velocityX * delta;

      entity.y = entity.lane.y;

      const compression = 1 - Math.abs(Math.sin(entity.age * 12)) * 0.05;
      entity.shadow.setScale(1.15 * entity.lane.shadowScale, 0.32 * entity.lane.shadowScale * compression);
      entity.shadow.setPosition(entity.x, entity.lane.y + 2);

      const bobOffset = Math.sin(entity.age * 10 + entity.bobPhase) * 3 * entity.lane.scale;
      const strideAngle = Math.sin(entity.age * 14 + entity.bobPhase) * 3.5;
      const frame = Math.sin(entity.age * 14 + entity.bobPhase) > 0 ? 1 : 0;
      if (frame !== entity.animationFrame) {
        entity.animationFrame = frame;
        entity.sprite.setTexture(frame === 1 ? entity.altTextureKey : entity.textureKey);
      }
      entity.sprite
        .setPosition(entity.x, entity.y + bobOffset)
        .setAngle(strideAngle)
        .setScale((2 + Math.sin(entity.age * 14) * 0.03) * entity.lane.scale);
      entity.dangerIcon
        .setPosition(entity.x, entity.y - 58 * entity.lane.scale + bobOffset)
        .setScale(1 + Math.abs(Math.sin(entity.age * 9)) * 0.12);

      if ((entity.direction > 0 && entity.x >= VIEWPORT.width - 18) || (entity.direction < 0 && entity.x <= 18)) {
        this.handleCivilianEscaped(entity);
      }
      return;
    }

    if (entity.type === "zombie" || entity.type === "zombie-elite" || entity.type === "zombie-brute") {
      let target = this.entities.get(entity.targetCivilianId);
      if (!target || target.type !== "civilian") {
        entity.targetCivilianId = this.chooseCivilianTargetId(entity.lane.id);
        target = this.entities.get(entity.targetCivilianId);
      }

      const targetX = target ? target.x : VIEWPORT.width + 80;
      const targetY = target ? target.y : entity.lane.y;
      const toTarget = new Phaser.Math.Vector2(targetX - entity.x, targetY - entity.y);
      const distance = toTarget.length();
      if (distance > 0.0001) {
        toTarget.normalize();
      }

      const zig = Math.sin(entity.age * entity.zigzagFreq + entity.zigzagPhase) * entity.zigzagAmp;
      const perpendicular = new Phaser.Math.Vector2(-toTarget.y, toTarget.x);

      const desiredVx = (toTarget.x * entity.speed + perpendicular.x * zig) * (entity.knockbackTimer > 0 ? -0.25 : 1);
      const desiredVy = (toTarget.y * entity.speed + perpendicular.y * zig) * (entity.knockbackTimer > 0 ? -0.25 : 1);

      const accelAlpha = Phaser.Math.Clamp(delta / 0.4, 0, 1);
      entity.velocityX = Phaser.Math.Linear(entity.velocityX, desiredVx, accelAlpha);
      entity.velocityY = Phaser.Math.Linear(entity.velocityY, desiredVy, accelAlpha);

      entity.x += entity.velocityX * delta;
      entity.y += entity.velocityY * delta;
      entity.knockbackTimer = Math.max(0, entity.knockbackTimer - delta);

      const stepWave = Math.sin(entity.age * (entity.isBrute ? 7 : entity.isElite ? 11 : 9) + entity.zigzagPhase);
      const frame = stepWave > 0 ? 1 : 0;
      if (frame !== entity.animationFrame) {
        entity.animationFrame = frame;
        entity.sprite.setTexture(frame === 1 ? entity.altTextureKey : entity.textureKey);
      }
      entity.sprite
        .setPosition(entity.x, entity.y + stepWave * (entity.isBrute ? 2.5 : 1.8) * entity.lane.scale)
        .setAngle(stepWave * (entity.isBrute ? 2.4 : entity.isElite ? 4.4 : 3.1));
      entity.shadow.setPosition(entity.x, entity.lane.y + 2);
      entity.shadow.setScale(
        (entity.isBrute ? 1.46 : 1.18) * entity.lane.shadowScale * (1 - Math.abs(stepWave) * 0.04),
        (entity.isBrute ? 0.4 : 0.34) * entity.lane.shadowScale
      );

      if (entity.hpBarBg && entity.hpBarFill) {
        const yOffset = entity.isBrute ? 74 * entity.lane.scale : 62 * entity.lane.scale;
        const barWidth = entity.isBrute ? 52 * entity.lane.scale : 38 * entity.lane.scale;
        const ratio = Phaser.Math.Clamp(entity.hp / entity.maxHp, 0, 1);
        entity.hpBarBg.setPosition(entity.x, entity.y - yOffset);
        entity.hpBarFill.setPosition(entity.x - (barWidth * (1 - ratio)) / 2, entity.y - yOffset);
        entity.hpBarFill.width = barWidth * ratio;
      }

      // Auto-eliminación si sale de la pantalla para evitar oleadas bloqueadas
      if (entity.x < -150 || entity.x > VIEWPORT.width + 150) {
        this.removeEntity(entity.id);
      }
      return;
    }

    if (entity.type === "powerup-health" || entity.type === "powerup-rescue") {
      entity.x += entity.direction * entity.speed * delta;
      entity.y += Math.sin(entity.age * 3.7) * 8 * delta;
      entity.sprite.setPosition(entity.x, entity.y).setRotation(Math.sin(entity.age * 2.2) * 0.08).setScale(2.2 + Math.sin(entity.age * 5) * 0.06);
      entity.glow.setPosition(entity.x, entity.y);
      entity.glow.setRadius(18 + Math.sin(entity.age * 8) * 4);

      if (entity.x < -80 || entity.x > VIEWPORT.width + 80) {
        this.removeEntity(entity.id);
      }
    }
  }

  handleCivilianEscaped(entity) {
    if (entity.isBeingRescued) return;
    entity.isBeingRescued = true;
    
    // Coordenadas precisas de la puerta del búnker
    const doorX = this.bunker.x - 24; 
    const doorY = this.bunker.y - 12;

    // Salto de victoria (festejo)
    this.tweens.add({
      targets: entity.sprite,
      y: entity.y - 45,
      duration: 160,
      yoyo: true,
      ease: "Cubic.Out",
      onComplete: () => {
        // El búnker "abre" su puerta (resplandor interno)
        const doorLight = this.add.rectangle(doorX, doorY - 15, 20, 30, 0x38bdf8, 0.4).setDepth(351);
        this.tweens.add({ targets: doorLight, alpha: 0.1, duration: 150, yoyo: true });

        // Animación de entrada real (se mueve a la puerta y se encoje hacia adentro)
        this.tweens.add({
          targets: [entity.sprite, entity.shadow],
          x: doorX,
          y: doorY,
          scaleX: 0,
          scaleY: 0.2,
          alpha: 0,
          duration: 300,
          ease: "Power2.In",
          onComplete: () => {
            doorLight.destroy();
            this.state = applyCivilianSaved(this.state, 1);
            this.state.score += 10;
            this.emitPowerupParticles(doorX, doorY, 0x38bdf8);
            this.showFeedbackAt("SAFE! +1", doorX - 60, doorY - 80, "positive");
            this.removeEntity(entity.id);
            this.audio.playSfx("powerup-positive");
            this.events.emit("hud:pulse-saved");

            if (this.state.civiliansSaved >= this.state.civiliansGoal) {
              this.finishLevel();
            }
          }
        });

        // Sacudida de impacto al búnker (como si se cerrara la puerta)
        this.tweens.add({
          targets: this.bunker,
          scaleY: 1.9,
          duration: 80,
          yoyo: true,
          ease: "Quad.Out"
        });
      }
    });
  }

  showFeedbackAt(text, x, y, tone) {
    const colorByTone = {
      friendly: "#fecaca",
      danger: "#fca5a5",
      positive: "#bbf7d0"
    };

    const label = this.add.text(x, y, text, {
      fontFamily: "Verdana",
      fontSize: "24px",
      fontWeight: "bold",
      color: colorByTone[tone] ?? "#f8fafc",
      stroke: "#020617",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(2000);

    this.tweens.add({
      targets: label,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: "Cubic.Out",
      onComplete: () => label.destroy()
    });
  }

  animateCivilianDown(entity, mode = "friendly") {
    if (!entity?.sprite || !this.entities.has(entity.id)) {
      return;
    }

    entity.exitKind = "civilian";
    entity.type = "civilian-dying";
    entity.hitRadius = 0;
    entity.sprite.setTexture(mode === "infected" ? "npc-civilian-infected" : "npc-civilian-dead");
    entity.dangerIcon?.setVisible(false);
    entity.sprite.setDepth(entity.lane.depth + 140);
    entity.shadow?.setAlpha(0.2);

    this.tweens.add({
      targets: entity.sprite,
      angle: mode === "infected" ? 8 : 90,
      alpha: mode === "infected" ? 0.88 : 0,
      y: entity.y + (mode === "infected" ? -8 : 10),
      scaleX: mode === "infected" ? entity.sprite.scaleX * 1.06 : entity.sprite.scaleX * 0.88,
      scaleY: mode === "infected" ? entity.sprite.scaleY * 1.06 : entity.sprite.scaleY * 0.72,
      duration: mode === "infected" ? 260 : 220,
      ease: mode === "infected" ? "Sine.Out" : "Cubic.Out",
      onComplete: () => {
        this.removeEntity(entity.id);
      }
    });
  }

  animateZombieDeath(entity) {
    if (!entity?.sprite || !this.entities.has(entity.id)) {
      return;
    }

    entity.exitKind = "zombie";
    entity.type = "zombie-dying";
    entity.hitRadius = 0;
    entity.sprite.setTexture("enemy-zombie-dead");
    entity.sprite.setOrigin(0.5, 0.7);
    entity.hpBarBg?.setVisible(false);
    entity.hpBarFill?.setVisible(false);

    this.tweens.add({
      targets: entity.sprite,
      angle: Phaser.Math.Between(-16, 16),
      y: entity.y + 10,
      alpha: 0,
      scaleX: entity.sprite.scaleX * 1.08,
      scaleY: entity.sprite.scaleY * 0.74,
      duration: 240,
      ease: "Cubic.Out",
      onComplete: () => {
        entity.sprite.setOrigin(0.5, 1);
        this.removeEntity(entity.id);
      }
    });
    this.tweens.add({
      targets: entity.shadow,
      alpha: 0,
      duration: 240,
      ease: "Quad.Out"
    });
  }

  processDangerIndicators() {
    const civilians = this.getEntitiesByType("civilian");
    const zombies = this.getEntitiesByTypes(["zombie", "zombie-elite", "zombie-brute"]);
    if (this.bunkerBeacon) {
      this.bunkerBeacon.setAlpha(0.26 + Math.abs(Math.sin(this.time.now * 0.006)) * 0.32);
      this.bunkerBeacon.setScale(1 + Math.abs(Math.sin(this.time.now * 0.004)) * 0.08, 1);
    }
    if (this.bunkerHalo) {
      this.bunkerHalo.setAlpha(0.04 + Math.abs(Math.sin(this.time.now * 0.0038)) * 0.06);
      this.bunkerHalo.setRadius(54 + Math.abs(Math.sin(this.time.now * 0.003)) * 9);
    }
    if (this.bunkerCone) {
      this.bunkerCone.setAlpha(0.05 + Math.abs(Math.sin(this.time.now * 0.0027)) * 0.05);
      this.bunkerCone.setAngle(-10 + Math.sin(this.time.now * 0.0012) * 4);
    }

    for (const civil of civilians) {
      let inDanger = false;
      for (const zombie of zombies) {
        const dist = Phaser.Math.Distance.Between(civil.x, civil.y, zombie.x, zombie.y);
        if (dist <= DANGER_DISTANCE_PX) {
          inDanger = true;
          break;
        }
      }

      civil.inDanger = inDanger;
      civil.dangerIcon.setVisible(inDanger);

      if (inDanger && !civil.wasInDanger) {
        civil.inDangerSince = this.time.now;
        this.audio.playSfx("civilian-scream");
      }

      if (inDanger) {
        const blink = Math.sin((this.time.now - civil.inDangerSince) / 80) > 0;
        civil.sprite.setAlpha(blink ? 1 : 0.6);
        civil.sprite.setDepth(civil.lane.depth + 120);
        civil.dangerIcon.setAlpha(0.45 + Math.abs(Math.sin((this.time.now - civil.inDangerSince) / 120)) * 0.55);
      } else {
        civil.sprite.setAlpha(1);
        civil.sprite.setDepth(civil.lane.depth + 20);
        civil.dangerIcon.setAlpha(1);
      }

      civil.wasInDanger = inDanger;
    }
  }

  processZombieCivilianContacts() {
    const profile = this.getDifficultyProfile();
    const civilians = this.getEntitiesByType("civilian");
    const zombies = this.getEntitiesByTypes(["zombie", "zombie-elite", "zombie-brute"]);

    for (const zombie of zombies) {
      for (const civil of civilians) {
        if (!this.entities.has(zombie.id) || !this.entities.has(civil.id)) {
          continue;
        }

        // Bloqueo de muerte off-screen
        if (civil.x < 30) continue;

        const dist = Phaser.Math.Distance.Between(zombie.x, zombie.y, civil.x, civil.y);
        const captureDistance = (zombie.hitRadius + civil.hitRadius) * profile.captureDistanceMultiplier;
        
        if (dist <= captureDistance) {
          this.infectCivilian(civil, zombie);
          return;
        }
      }
    }
  }

  infectCivilian(civil, hunter) {
    const { x, y, lane, id } = civil;
    this.cameras.main.shake(200, 0.01);
    this.audio.playSfx("civilian-error");
    
    const lifeDamageByType = {
      zombie: 10,
      "zombie-elite": 15,
      "zombie-brute": 20
    };
    const lifeDamage = lifeDamageByType[hunter.type] ?? 10;
    this.state = applyCivilianLostPenalty(this.state, lifeDamage, { lostCount: 1 });

    this.emitBloodPixels(x, y);
    this.emitPowerupParticles(x, y - 6, 0x22c55e);
    this.showFeedbackAt("INFECTED!", x, y - 40, "danger");
    this.impactFlash.setFillStyle(0x22c55e, 1);
    this.impactFlash.setAlpha(0.16);
    this.tweens.add({
      targets: this.impactFlash,
      alpha: 0,
      duration: 220,
      ease: "Sine.Out",
      onComplete: () => this.impactFlash.setFillStyle(0xffffff, 1)
    });
    
    const nid = `zombie-inf-${this.spawnIndex++}`;
    this.animateCivilianDown(civil, "infected");

    // Transformación en Zombie
    this.time.delayedCall(400, () => {
      this.spawnZombie(nid, "zombie", { 
        customX: x, 
        customY: y,
        targetCivilianId: this.chooseCivilianTargetId(lane.id)
      });
    });

    if (this.state.gameOver) {
      this.handleGameOver();
    }
  }

  checkLevelProgress(time) {
    if (this.state.levelCompleted || this.state.gameOver) {
      return;
    }

    void time;
    if (this.state.civiliansSaved >= this.state.civiliansGoal) {
      this.finishLevel();
    }
  }

  getGoalForLevel(level) {
    if (level <= 4) {
      return 10;
    }
    if (level <= 5) {
      return 15;
    }
    return Math.max(15, 15 + Math.floor((level - 5) * 1.8));
  }

  getDifficultyProfile() {
    return getDifficultyProfile(this.state.level);
  }

  finishLevel() {
    if (this.state.levelCompleted) {
      return;
    }

    this.state.levelCompleted = true;
    const bonus = this.state.civiliansLost === 0 ? 100 : 0;
    this.state.levelCompleteBonus = bonus;
    this.state.score += bonus;

    for (const civil of this.getEntitiesByType("civilian")) {
      this.tweens.add({
        targets: civil.sprite,
        y: civil.y - 16,
        yoyo: true,
        repeat: 3,
        duration: 130,
        ease: "Quad.Out"
      });
    }

    this.audio.playSfx("level-clear");
    this.emitHudUpdate();
    this.events.emit("level:complete", {
      level: this.state.level,
      score: this.state.score,
      highScore: this.readHighScore(),
      kills: this.state.kills,
      accuracy: this.state.accuracy ?? 0,
      civiliansSaved: this.state.civiliansSaved,
      civiliansLost: this.state.civiliansLost,
      bonus
    });
  }

  handleShot() {
    if (!this.started || this.isPaused || this.state.gameOver || this.state.levelCompleted) {
      return;
    }

    if (this.time.now - this.lastShotAt < GAME_CONSTANTS.shotCooldownMs) {
      return;
    }

    const profile = this.getDifficultyProfile();
    this.lastShotAt = this.time.now;
    this.state = registerShotAttempt(this.state);

    const crosshair = { x: this.crosshair.x, y: this.crosshair.y };
    const entities = [];
    for (const entity of this.entities.values()) {
      if (entity.type === "civilian" && entity.protectedUntil && this.time.now < entity.protectedUntil) {
        continue;
      }

      const isGroundEntity = entity.type === "civilian" || entity.type === "zombie" || entity.type === "zombie-elite" || entity.type === "zombie-brute";
      const aimY = isGroundEntity ? entity.y - 18 * entity.lane.scale : entity.y;

      entities.push({
        id: entity.id,
        type: entity.type,
        x: entity.x,
        y: aimY,
        hitRadius: entity.hitRadius,
        spawnIndex: entity.spawnIndex,
        isElite: entity.isElite || entity.isBrute
      });
    }

    const target = resolveShotTarget({
      crosshair,
      entities,
      hitRadius: GAME_CONSTANTS.shotHitRadius,
      targetPriority: {
        "zombie-brute": 4,
        "zombie-elite": 3,
        zombie: 2,
        civilian: 1,
        "powerup-health": 0,
        "powerup-rescue": 0
      }
    });

    this.audio.playSfx("shot");
    this.cameras.main.shake(100, 0.003);
    this.flashMuzzle();
    this.emitShotTrail(crosshair.x, crosshair.y);

    if (!target) {
      this.emitHudUpdate();
      return;
    }

    const hitEntity = this.entities.get(target.id);
    if (!hitEntity) {
      this.emitHudUpdate();
      return;
    }

    this.flashHitMarker();

    if (target.type === "civilian") {
      this.state = applyShotOutcome(this.state, { type: "civilian" }, {
        countShot: false,
        civilianPenaltyScore: profile.friendlyFireScorePenalty,
        civilianPenaltyLife: profile.friendlyFireLifePenalty
      });
      this.cameras.main.shake(250, 0.012);
      this.showFeedback("FRIENDLY FIRE", "friendly");
      this.flashHudRed(0.22);
      this.audio.playSfx("civilian-error");
      this.animateCivilianDown(hitEntity, "friendly");
    } else if (target.type === "powerup-health" || target.type === "powerup-rescue") {
      this.state = applyShotOutcome(this.state, { type: target.type }, { countShot: false });
      this.removeEntity(target.id);
      this.showFeedback(target.type === "powerup-health" ? "+SALUD" : "BONUS +50", "positive");
      this.emitPowerupParticles(crosshair.x, crosshair.y, target.type === "powerup-health" ? 0x22c55e : 0xf59e0b);
      this.audio.playSfx(target.type === "powerup-health" ? "powerup-positive" : "rescue-bonus");
    } else if (target.type === "zombie" || target.type === "zombie-elite" || target.type === "zombie-brute") {
      this.state = registerShotHit(this.state);
      hitEntity.hp -= 1;
      hitEntity.knockbackTimer = 0.1;
      this.audio.playSfx("zombie-hit");
      this.flashImpactWhite(0.12);
      this.emitBloodPixels(hitEntity.x, hitEntity.y - 14);

      if (hitEntity.hp <= 0) {
        this.state = applyShotOutcome(this.state, { type: "zombie", isElite: hitEntity.isElite || hitEntity.isBrute }, { countShot: false, countHit: false });
        this.emitZombieDeathImpact(hitEntity);
        if (hitEntity.isElite || hitEntity.isBrute) {
          this.nextPowerupAt = Math.min(this.nextPowerupAt, this.time.now + 2500);
        }
        this.animateZombieDeath(hitEntity);
      }
    }

    this.emitHudUpdate();

    if (this.state.gameOver) {
      this.handleGameOver();
    }
  }

  updateCrosshairHazardVisual() {
    let onCivilian = false;
    for (const civil of this.getEntitiesByType("civilian")) {
      const dist = Phaser.Math.Distance.Between(this.crosshair.x, this.crosshair.y, civil.x, civil.y - 18 * civil.lane.scale);
      if (dist <= GAME_CONSTANTS.shotHitRadius + civil.hitRadius) {
        onCivilian = true;
        if (!civil.crosshairInside) {
          civil.protectedUntil = this.time.now + 150;
          civil.crosshairInside = true;
        }
      } else {
        civil.crosshairInside = false;
      }
    }

    if (onCivilian && !this.crosshairOverCivilian && this.time.now - this.lastCrosshairWarnAt > 500) {
      this.lastCrosshairWarnAt = this.time.now;
      this.audio.playSfx("crosshair-warning");
    }

    this.crosshairOverCivilian = onCivilian;
    this.crosshair.setTint(onCivilian ? 0xfacc15 : 0xffffff);
  }

  shouldBoostHealthPowerup() {
    const now = this.time.now;
    this.recentCivilLossTimes = this.recentCivilLossTimes.filter((t) => now - t <= 10000);
    return this.recentCivilLossTimes.length >= 2;
  }

  chooseCivilianTargetId(laneId) {
    const civilians = this.getEntitiesByType("civilian").filter((civil) => civil.lane.id === laneId);
    if (civilians.length === 0) {
      return null;
    }
    const index = Phaser.Math.Between(0, civilians.length - 1);
    return civilians[index].id;
  }

  pickLane() {
    const index = Phaser.Math.Between(0, LANES.length - 1);
    return LANES[index];
  }

  pickLaneEdgeSpawnPoint(lane) {
    const fromLeft = Phaser.Math.Between(0, 1) === 0;
    return { x: fromLeft ? -36 : VIEWPORT.width + 36, y: lane.y };
  }

  pickZombieSpawnPoint(lane, targetCivilianId = null) {
    const target = targetCivilianId ? this.entities.get(targetCivilianId) : null;
    if (target && target.type === "civilian") {
      return { x: Math.min(target.x - Phaser.Math.Between(80, 130), -24), y: lane.y };
    }
    return { x: -36, y: lane.y };
  }

  replaceFirstType(queue, fromType, toType) {
    const index = queue.findIndex((item) => item === fromType);
    if (index >= 0) {
      queue[index] = toType;
    }
  }

  createGroundShadow(x, y, laneScale, depth) {
    return this.add.ellipse(x, y + 2, 30 * laneScale, 10 * laneScale, 0x000000, 0.3).setDepth(depth);
  }

  acquireCivilianVisual(lane, x, fromLeft, textureKey) {
    let visual = this.civilianVisualPool.pop();
    if (!visual) {
      const sprite = this.add.image(x, lane.y, textureKey).setOrigin(0.5, 1);
      const shadow = this.createGroundShadow(x, lane.y, lane.shadowScale, lane.depth + 1);
      const dangerIcon = this.add
        .text(x, lane.y - 58 * lane.scale, "!", {
          fontFamily: "Verdana",
          fontSize: `${Math.round(26 * lane.scale)}px`,
          color: "#ef4444",
          stroke: "#7f1d1d",
          strokeThickness: 4
        })
        .setOrigin(0.5)
        .setVisible(false);
      visual = { sprite, shadow, dangerIcon };
    }

    visual.sprite
      .setTexture(textureKey)
      .setPosition(x, lane.y)
      .setScale(2 * lane.scale)
      .setDepth(lane.depth + 20)
      .setFlipX(!fromLeft)
      .setVisible(true)
      .setAlpha(1);
    visual.shadow
      .setPosition(x, lane.y + 2)
      .setDepth(lane.depth + 1)
      .setScale(1.15 * lane.shadowScale, 0.32 * lane.shadowScale)
      .setVisible(true);
    visual.dangerIcon
      .setPosition(x, lane.y - 58 * lane.scale)
      .setDepth(lane.depth + 100)
      .setVisible(false)
      .setAlpha(1);

    return visual;
  }

  recycleCivilianVisual(entity) {
    if (!entity || entity.type !== "civilian") {
      return;
    }

    if (entity.sprite) {
      entity.sprite.setVisible(false);
    }
    if (entity.shadow) {
      entity.shadow.setVisible(false);
    }
    if (entity.dangerIcon) {
      entity.dangerIcon.setVisible(false);
    }

    this.civilianVisualPool.push({
      sprite: entity.sprite,
      shadow: entity.shadow,
      dangerIcon: entity.dangerIcon
    });
  }

  acquireZombieVisual(zombieType, lane, spawnPoint) {
    const isElite = zombieType === "zombie-elite";
    const isBrute = zombieType === "zombie-brute";
    const poolIndex = this.zombieVisualPool.findIndex((item) => item.zombieType === zombieType);
    const textureKey = isBrute
      ? "enemy-zombie-brute"
      : isElite
        ? "enemy-zombie-alpha"
        : ZOMBIE_TEXTURE_KEYS[this.spawnIndex % ZOMBIE_TEXTURE_KEYS.length];

    let visual;
    if (poolIndex >= 0) {
      visual = this.zombieVisualPool.splice(poolIndex, 1)[0];
    } else {
      const sprite = this.add.image(spawnPoint.x, lane.y, textureKey).setOrigin(0.5, 1);
      const shadow = this.createGroundShadow(spawnPoint.x, lane.y, lane.shadowScale, lane.depth + 1);
      let hpBarBg = null;
      let hpBarFill = null;
      if (isElite || isBrute) {
        hpBarBg = this.add.rectangle(spawnPoint.x, lane.y - 74 * lane.scale, 56 * lane.scale, 7 * lane.scale, 0x111827, 0.92);
        hpBarFill = this.add.rectangle(spawnPoint.x, lane.y - 74 * lane.scale, 52 * lane.scale, 5 * lane.scale, isBrute ? 0xef4444 : 0x22d3ee, 1);
      }
      visual = { zombieType, sprite, shadow, hpBarBg, hpBarFill };
    }

    visual.zombieType = zombieType;
    visual.textureKey = textureKey;
    visual.sprite
      .setTexture(textureKey)
      .setPosition(spawnPoint.x, lane.y)
      .setVisible(true)
      .setAlpha(1)
      .clearTint()
      .setDepth(lane.depth + (isBrute ? 70 : isElite ? 60 : 50))
      .setScale((isBrute ? 3.6 : isElite ? 2.8 : 2.1) * lane.scale);
    visual.shadow
      .setPosition(spawnPoint.x, lane.y + 2)
      .setVisible(true)
      .setDepth(lane.depth + 1)
      .setScale((isBrute ? 1.5 : isElite ? 1.12 : 1) * lane.shadowScale, 0.34 * lane.shadowScale);

    if (visual.hpBarBg && visual.hpBarFill) {
      const yOffset = isBrute ? 74 * lane.scale : 62 * lane.scale;
      const bgWidth = isBrute ? 56 * lane.scale : 42 * lane.scale;
      const bgHeight = isBrute ? 7 * lane.scale : 6 * lane.scale;
      const fillWidth = isBrute ? 52 * lane.scale : 38 * lane.scale;
      const fillHeight = isBrute ? 5 * lane.scale : 4 * lane.scale;
      visual.hpBarBg
        .setPosition(spawnPoint.x, lane.y - yOffset)
        .setDepth(lane.depth + 80)
        .setVisible(isElite || isBrute);
      visual.hpBarBg.width = bgWidth;
      visual.hpBarBg.height = bgHeight;
      visual.hpBarFill
        .setPosition(spawnPoint.x, lane.y - yOffset)
        .setDepth(lane.depth + 81)
        .setFillStyle(isBrute ? 0xef4444 : 0x22d3ee, 1)
        .setVisible(isElite || isBrute);
      visual.hpBarFill.width = fillWidth;
      visual.hpBarFill.height = fillHeight;
    }

    return visual;
  }

  recycleZombieVisual(entity) {
    if (!entity || !(entity.type === "zombie" || entity.type === "zombie-elite" || entity.type === "zombie-brute")) {
      return;
    }

    if (entity.sprite) {
      entity.sprite.setVisible(false);
    }
    if (entity.shadow) {
      entity.shadow.setVisible(false);
    }
    if (entity.hpBarBg) {
      entity.hpBarBg.setVisible(false);
    }
    if (entity.hpBarFill) {
      entity.hpBarFill.setVisible(false);
    }

    this.zombieVisualPool.push({
      zombieType: entity.type,
      sprite: entity.sprite,
      shadow: entity.shadow,
      hpBarBg: entity.hpBarBg,
      hpBarFill: entity.hpBarFill
    });
  }

  emitZombieDeathImpact(entity) {
    this.audio.playSfx("zombie-kill");
    this.cameras.main.shake(150, 0.007);
    this.flashImpactWhite(0.18);
    this.emitPowerupParticles(entity.x, entity.y - 14, 0xb91c1c);
    this.emitBloodPixels(entity.x, entity.y - 10);
  }

  emitBloodPixels(x, y) {
    for (let i = 0; i < 6; i += 1) {
      const dot = this.particlePool.find((item) => !item.busy);
      if (!dot) {
        return;
      }
      dot.busy = true;
      dot
        .setPosition(x, y)
        .setSize(Phaser.Math.Between(2, 3), Phaser.Math.Between(2, 3))
        .setDisplaySize(dot.width, dot.height)
        .setFillStyle(0xef4444, 0.85)
        .setAlpha(0.85)
        .setVisible(true);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(8, 18);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: Phaser.Math.Between(100, 180),
        onComplete: () => {
          dot.busy = false;
          dot.setVisible(false);
        }
      });
    }
  }

  emitPowerupParticles(x, y, color) {
    for (let i = 0; i < 14; i += 1) {
      const dot = this.particlePool.find((item) => !item.busy);
      if (!dot) {
        return;
      }
      dot.busy = true;
      const size = Phaser.Math.Between(2, 3);
      dot
        .setPosition(x, y)
        .setSize(size, size)
        .setDisplaySize(size, size)
        .setFillStyle(color, 0.85)
        .setAlpha(0.85)
        .setVisible(true);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(18, 46);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: Phaser.Math.Between(180, 360),
        onComplete: () => {
          dot.busy = false;
          dot.setVisible(false);
        }
      });
    }
  }

  emitShotTrail(targetX, targetY) {
    const trail = this.shotTrailPool.find((item) => !item.busy);
    if (!trail) {
      return;
    }

    const originX = this.gunnerOrigin.x;
    const originY = this.gunnerOrigin.y;
    const dx = targetX - originX;
    const dy = targetY - originY;
    const length = Math.max(4, Math.sqrt(dx * dx + dy * dy));
    const angle = Math.atan2(dy, dx);

    trail.busy = true;
    trail
      .setPosition(originX + dx / 2, originY + dy / 2)
      .setSize(length, 2)
      .setDisplaySize(length, 2)
      .setRotation(angle)
      .setAlpha(0.82);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 70,
      onComplete: () => {
        trail.busy = false;
      }
    });
  }

  flashMuzzle() {
    this.muzzleFlash.setPosition(this.crosshair.x, this.crosshair.y).setAlpha(0.85);
    this.tweens.add({ targets: this.muzzleFlash, alpha: 0, duration: 80, ease: "Cubic.Out" });
  }

  flashHitMarker() {
    this.hitMarker.setPosition(this.crosshair.x, this.crosshair.y).setAlpha(0.95);
    this.tweens.add({ targets: this.hitMarker, alpha: 0, duration: 130, ease: "Quad.Out" });
  }

  flashHudRed(alpha) {
    this.hudFlash.setAlpha(alpha);
    this.tweens.add({
      targets: this.hudFlash,
      alpha: 0,
      duration: 300,
      ease: "Sine.Out"
    });
  }

  flashImpactWhite(alpha) {
    this.impactFlash.setAlpha(alpha);
    this.tweens.add({
      targets: this.impactFlash,
      alpha: 0,
      duration: 80,
      ease: "Sine.Out"
    });
  }

  showFeedback(text, tone) {
    const colorByTone = {
      friendly: "#fecaca",
      danger: "#fca5a5",
      positive: "#bbf7d0"
    };

    this.feedbackLabel.setColor(colorByTone[tone] ?? "#f8fafc");
    this.feedbackLabel.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this.feedbackLabel,
      y: this.center.y - 118,
      alpha: 0,
      duration: 920,
      ease: "Cubic.Out",
      onComplete: () => {
        this.feedbackLabel.setY(this.center.y - 90);
      }
    });
  }

  handleGameOver() {
    this.persistHighScore(this.state.score);
    this.emitHudUpdate();
    this.emitRunState({ showPause: false });
    this.audio.playSfx("game-over");
    this.showFeedback("GAME OVER", "danger");
    this.events.emit("game:over", {
      score: this.state.score,
      kills: this.state.kills,
      civiliansHit: this.state.civiliansHit,
      civiliansLost: this.state.civiliansLost,
      civiliansSaved: this.state.civiliansSaved,
      level: this.state.level,
      accuracy: this.state.accuracy,
      wave: this.state.wave,
      reason: this.state.gameOverReason,
      highScore: this.readHighScore()
    });
  }

  emitHudUpdate() {
    const highScore = this.readHighScore();
    const zombieCount = this.getEntitiesByTypes(["zombie", "zombie-elite", "zombie-brute"]).length;
    const civilianCount = this.getEntitiesByType("civilian").length;
    this.events.emit("hud:update", {
      score: this.state.score,
      highScore,
      life: this.state.life,
      level: this.state.level,
      wave: this.state.wave,
      accuracy: this.state.accuracy ?? 0,
      shots: this.state.shots,
      hits: this.state.hits,
      civiliansSaved: this.state.civiliansSaved,
      civiliansGoal: this.state.civiliansGoal,
      civiliansLost: this.state.civiliansLost,
      civiliansLostLimit: this.state.civiliansLostLimit,
      zombiesActive: zombieCount,
      civiliansActive: civilianCount
    });
  }

  emitRunState({ showStart = false, showPause = false } = {}) {
    this.events.emit("run:state", {
      started: this.started,
      paused: this.isPaused,
      gameOver: this.state.gameOver,
      levelCompleted: this.state.levelCompleted,
      showStart,
      showPause
    });
  }

  emitAudioState() {
    this.events.emit("audio:state", {
      muted: this.audioMuted
    });
  }

  readHighScore() {
    try {
      const raw = window.localStorage.getItem("zrr.highScore");
      const parsed = Number(raw ?? 0);
      return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
    } catch {
      return 0;
    }
  }

  persistHighScore(score) {
    try {
      const current = this.readHighScore();
      if (score > current) {
        window.localStorage.setItem("zrr.highScore", String(score));
      }
    } catch {
      // ignore storage failures
    }
  }

  readAudioMuted() {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      return window.localStorage.getItem("zrr.audioMuted") === "1";
    } catch {
      return false;
    }
  }

  persistAudioMuted(muted) {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }
      window.localStorage.setItem("zrr.audioMuted", muted ? "1" : "0");
    } catch {
      // Ignore storage failures; runtime audio control still works for the current session.
    }
  }

  toggleMute() {
    this.audioMuted = !this.audioMuted;
    this.persistAudioMuted(this.audioMuted);
    this.audio.setMuted(this.audioMuted);
    this.emitAudioState();
  }

  hasType(type) {
    for (const entity of this.entities.values()) {
      if (entity.type === type) {
        return true;
      }
    }
    return false;
  }

  getEntitiesByType(type) {
    const list = [];
    for (const entity of this.entities.values()) {
      if (entity.type === type) {
        list.push(entity);
      }
    }
    return list;
  }

  getEntitiesByTypes(types) {
    const allowed = new Set(types);
    const list = [];
    for (const entity of this.entities.values()) {
      if (allowed.has(entity.type)) {
        list.push(entity);
      }
    }
    return list;
  }

  removeEntity(id) {
    const entity = this.entities.get(id);
    if (!entity) {
      return;
    }

    if (entity.type === "civilian" || entity.exitKind === "civilian") {
      this.recycleCivilianVisual(entity);
      this.entities.delete(id);
      return;
    }

    if (entity.type === "zombie" || entity.type === "zombie-elite" || entity.type === "zombie-brute" || entity.exitKind === "zombie") {
      this.recycleZombieVisual(entity);
      this.entities.delete(id);
      return;
    }

    if (entity.sprite) {
      entity.sprite.destroy();
    }
    if (entity.dangerIcon) {
      entity.dangerIcon.destroy();
    }
    if (entity.shadow) {
      entity.shadow.destroy();
    }
    if (entity.hpBarBg) {
      entity.hpBarBg.destroy();
    }
    if (entity.hpBarFill) {
      entity.hpBarFill.destroy();
    }
    if (entity.glow) {
      entity.glow.destroy();
    }

    this.entities.delete(id);
  }

  clearEntities() {
    for (const entity of this.entities.values()) {
      if (entity.type === "civilian") {
        this.recycleCivilianVisual(entity);
        continue;
      }
      if (entity.type === "zombie" || entity.type === "zombie-elite" || entity.type === "zombie-brute") {
        this.recycleZombieVisual(entity);
        continue;
      }
      if (entity.sprite) {
        entity.sprite.destroy();
      }
      if (entity.dangerIcon) {
        entity.dangerIcon.destroy();
      }
      if (entity.shadow) {
        entity.shadow.destroy();
      }
      if (entity.hpBarBg) {
        entity.hpBarBg.destroy();
      }
      if (entity.hpBarFill) {
        entity.hpBarFill.destroy();
      }
      if (entity.glow) {
        entity.glow.destroy();
      }
    }
    this.entities.clear();
  }

  processCriticalStateAudio() {
    if (!this.audio.audioContext || this.audio.muted || this.state.gameOver || !this.started) {
      return;
    }

    const now = this.time.now;
    const lifeCritical = this.state.life <= 25;
    const civiliansCritical = this.state.civiliansLostLimit - this.state.civiliansLost <= 1;
    if ((lifeCritical || civiliansCritical) && now - this.lastCriticalAlertAt > 1600) {
      this.lastCriticalAlertAt = now;
      this.audio.playSfx("critical-alert");
    }
  }

}
