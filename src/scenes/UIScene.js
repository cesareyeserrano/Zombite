import Phaser from "phaser";
import { UI } from "../locale/ui.js";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.gameScene = this.scene.get("GameScene");
    const { width, height } = this.scale;

    this.visualLife = 100;
    this.visualScore = 0;
    this.lastPayload = null;

    this.hudLeftPanel = this.add.rectangle(18, 18, 224, 94, 0x020617, 0.55).setOrigin(0, 0).setDepth(1490).setStrokeStyle(1, 0x38bdf8, 0.35);
    this.hudRightPanel = this.add.rectangle(width - 18, 18, 248, 116, 0x020617, 0.55).setOrigin(1, 0).setDepth(1490).setStrokeStyle(1, 0xf59e0b, 0.3);
    this.helpPanel = this.add.rectangle(18, height - 18, 286, 28, 0x020617, 0.45).setOrigin(0, 1).setDepth(1490).setStrokeStyle(1, 0x64748b, 0.28);
    this.hudAccentLeft = this.add.rectangle(18, 18, 6, 94, 0x38bdf8, 0.8).setOrigin(0, 0).setDepth(1491);
    this.hudAccentRight = this.add.rectangle(width - 18, 18, 6, 116, 0xf59e0b, 0.8).setOrigin(1, 0).setDepth(1491);

    this.hudLeftLabel = this.add
      .text(20, 20, "", {
        fontFamily: "Verdana",
        fontSize: "18px",
        color: "#e2e8f0",
        stroke: "#020617",
        strokeThickness: 3
      })
      .setOrigin(0, 0)
      .setDepth(1500);

    this.hudRightLabel = this.add
      .text(width - 20, 20, "", {
        fontFamily: "Verdana",
        fontSize: "18px",
        color: "#e2e8f0",
        align: "right",
        stroke: "#020617",
        strokeThickness: 3
      })
      .setOrigin(1, 0)
      .setDepth(1500);

    this.waveBadge = this.add
      .text(width / 2, 24, "WAVE 1", {
        fontFamily: "Verdana",
        fontSize: "15px",
        color: "#f8fafc",
        backgroundColor: "#0f172a",
        padding: { x: 12, y: 6 },
        stroke: "#020617",
        strokeThickness: 2
      })
      .setOrigin(0.5, 0)
      .setDepth(1500);

    this.lifeBarFrame = this.add.rectangle(20, 94, 188, 12, 0x0f172a, 0.95).setOrigin(0, 0).setDepth(1495).setStrokeStyle(1, 0x475569, 0.7);
    this.lifeBarFill = this.add.rectangle(22, 96, 184, 8, 0x22c55e, 1).setOrigin(0, 0).setDepth(1496);
    this.lifeBarGlow = this.add.rectangle(22, 96, 184, 8, 0xffffff, 0.06).setOrigin(0, 0).setDepth(1497);

    this.rescueBarFrame = this.add.rectangle(width - 204, 118, 184, 10, 0x0f172a, 0.95).setOrigin(0, 0).setDepth(1495).setStrokeStyle(1, 0x475569, 0.7);
    this.rescueBarFill = this.add.rectangle(width - 202, 120, 180, 6, 0x38bdf8, 0.95).setOrigin(0, 0).setDepth(1496);
    this.threatBarFrame = this.add.rectangle(width - 204, 134, 184, 10, 0x0f172a, 0.95).setOrigin(0, 0).setDepth(1495).setStrokeStyle(1, 0x475569, 0.7);
    this.threatBarFill = this.add.rectangle(width - 202, 136, 180, 6, 0xef4444, 0.95).setOrigin(0, 0).setDepth(1496);

    this.barCaptionLeft = this.add
      .text(20, 80, "VITALS", {
        fontFamily: "Verdana",
        fontSize: "11px",
        color: "#93c5fd",
        stroke: "#020617",
        strokeThickness: 2
      })
      .setOrigin(0, 0)
      .setDepth(1500);

    this.barCaptionRight = this.add
      .text(width - 20, 100, "Progreso / Amenaza", {
        fontFamily: "Verdana",
        fontSize: "11px",
        color: "#fcd34d",
        stroke: "#020617",
        strokeThickness: 2
      })
      .setOrigin(1, 0)
      .setDepth(1500);

    this.helpLabel = this.add
      .text(20, height - 20, "Mouse: aim + shoot | ESC: pause | R: restart", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#cbd5e1",
        stroke: "#020617",
        strokeThickness: 2
      })
      .setDepth(1500)
      .setOrigin(0, 1);

    this.criticalWash = this.add.rectangle(width / 2, height / 2, width, height, 0xef4444, 0).setDepth(1475);

    this.toastLabel = this.add
      .text(width / 2, 70, "", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#fef08a",
        stroke: "#7c2d12",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(1500)
      .setAlpha(0);

    this.eventBannerGlow = this.add.rectangle(width / 2, height * 0.26, Math.min(width * 0.72, 620), 78, 0x38bdf8, 0.08).setDepth(1488).setVisible(false);
    this.eventBanner = this.add
      .text(width / 2, height * 0.26, "", {
        fontFamily: "Verdana",
        fontSize: "32px",
        fontStyle: "bold",
        color: "#f8fafc",
        align: "center",
        stroke: "#020617",
        strokeThickness: 6,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#38bdf8",
          blur: 16,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setDepth(1489)
      .setAlpha(0);

    this.setupDomOverlay();
    this.rotationOverlay = this.createRotationOverlay();
    
    this.scale.on("resize", this.handleResize, this);
    this.handleResize(this.scale.gameSize);
    
    this.showStartOverlay();

    this.gameScene.events.on("hud:update", this.onHudUpdate, this);
    this.gameScene.events.on("hud:pulse-saved", this.onHudPulseSaved, this);
    this.gameScene.events.on("run:state", this.onRunState, this);
    this.gameScene.events.on("message", this.onMessage, this);
    this.gameScene.events.on("game:over", this.onGameOver, this);
    this.gameScene.events.on("level:complete", this.onLevelComplete, this);
    this.gameScene.events.on("audio:state", this.onAudioState, this);
  }

  handleResize(gameSize) {
    const { width, height } = gameSize;
    const compactHud = width <= 800;
    const hudFontSize = compactHud ? "15px" : "18px";
    const helpFontSize = compactHud ? "12px" : "14px";
    const leftPanelWidth = compactHud ? 184 : 224;
    const rightPanelWidth = compactHud ? 214 : 248;
    const panelHeight = compactHud ? 84 : 94;
    const rightPanelHeight = compactHud ? 124 : 138;
    const helpPanelWidth = compactHud ? 242 : 286;
    
    this.hudLeftPanel.setPosition(18, 18).setSize(leftPanelWidth, panelHeight);
    this.hudRightPanel.setPosition(width - 18, 18).setSize(rightPanelWidth, rightPanelHeight);
    this.helpPanel.setPosition(18, height - 18).setSize(helpPanelWidth, compactHud ? 24 : 28);
    this.hudAccentLeft.setPosition(18, 18).setSize(6, panelHeight);
    this.hudAccentRight.setPosition(width - 18, 18).setSize(6, rightPanelHeight);
    this.hudLeftLabel.setPosition(20, 20).setFontSize(hudFontSize);
    this.hudRightLabel.setPosition(width - 20, 20).setFontSize(hudFontSize);
    this.waveBadge.setPosition(width / 2, compactHud ? 18 : 24).setFontSize(compactHud ? "13px" : "15px");
    this.lifeBarFrame.setPosition(20, compactHud ? 88 : 94).setSize(compactHud ? 144 : 188, compactHud ? 10 : 12);
    this.lifeBarFill.setPosition(22, compactHud ? 90 : 96).setSize(compactHud ? 140 : 184, compactHud ? 6 : 8);
    this.lifeBarGlow.setPosition(22, compactHud ? 90 : 96).setSize(compactHud ? 140 : 184, compactHud ? 6 : 8);
    this.rescueBarFrame.setPosition(width - (compactHud ? 166 : 204), compactHud ? 104 : 118).setSize(compactHud ? 146 : 184, 10);
    this.rescueBarFill.setPosition(width - (compactHud ? 164 : 202), compactHud ? 106 : 120).setSize(compactHud ? 142 : 180, 6);
    this.threatBarFrame.setPosition(width - (compactHud ? 166 : 204), compactHud ? 120 : 134).setSize(compactHud ? 146 : 184, 10);
    this.threatBarFill.setPosition(width - (compactHud ? 164 : 202), compactHud ? 122 : 136).setSize(compactHud ? 142 : 180, 6);
    this.barCaptionLeft.setPosition(20, compactHud ? 74 : 80).setFontSize(compactHud ? "10px" : "11px");
    this.barCaptionRight.setPosition(width - 20, compactHud ? 90 : 100).setFontSize(compactHud ? "10px" : "11px");
    this.helpLabel.setPosition(20, height - 20);
    this.helpLabel.setFontSize(helpFontSize);
    this.toastLabel.setPosition(width / 2, 70);
    this.criticalWash.setPosition(width / 2, height / 2).setSize(width, height);
    this.eventBannerGlow.setPosition(width / 2, height * 0.26).setSize(Math.min(width * 0.72, compactHud ? 420 : 620), compactHud ? 60 : 78);
    this.eventBanner.setPosition(width / 2, height * 0.26).setFontSize(compactHud ? "24px" : "32px");
    
    if (this.rotationOverlay) {
      this.rotationOverlay.setPosition(width / 2, height / 2);
    }

    this.updateOrientationGuard(gameSize);
  }

  setupDomOverlay() {
    this.domOverlay = document.getElementById("game-overlay");
    this.domEyebrow = document.getElementById("overlay-eyebrow");
    this.domMeta = document.getElementById("overlay-meta");
    this.domTitle = document.getElementById("overlay-title");
    this.domBody = document.getElementById("overlay-body");
    this.domButtons = document.getElementById("overlay-buttons");
    this.domFootnote = document.getElementById("overlay-footnote");
    this.audioButton = document.getElementById("audio-toggle");

    if (this.audioButton) {
      this.audioButton.addEventListener("click", () => {
        this.gameScene.audio.ensure();
        this.gameScene.audio.playSfx("ui-click");
        this.gameScene.toggleMute();
      });
    }
  }

  showDomOverlay(title, body, buttons = [], options = {}) {
    this.domTitle.innerText = title;
    this.domBody.innerText = body;
    this.domButtons.innerHTML = "";
    this.domEyebrow.innerText = options.eyebrow ?? UI.eyebrowDefault;
    this.domMeta.innerHTML = options.meta ? options.meta : "";
    this.domFootnote.innerText = options.footnote ?? "";
    this.domMeta.style.display = options.meta ? "inline-flex" : "none";
    this.domFootnote.style.display = options.footnote ? "block" : "none";
    this.domOverlay.dataset.tone = /game over/i.test(title) ? "danger" : /complete/i.test(title) ? "success" : "default";

    buttons.forEach(btn => {
      const button = document.createElement("button");
      button.className = `game-button ${btn.className || ""}`;
      button.innerText = btn.label;
      button.onclick = () => {
        this.gameScene.audio.ensure();
        this.gameScene.audio.playSfx("ui-click");
        btn.callback();
      };
      this.domButtons.appendChild(button);
    });

    this.domOverlay.classList.add("active");
  }

  hideDomOverlay() {
    this.domOverlay.classList.remove("active");
  }

  createRotationOverlay() {
    const { width, height } = this.scale;
    const container = this.add.container(width / 2, height / 2).setDepth(1700).setVisible(false);
    const panel = this.add.rectangle(0, 0, 620, 260, 0x020617, 0.95).setStrokeStyle(2, 0xf59e0b, 0.9);
    const title = this.add
      .text(0, -42, UI.rotationTitle, {
        fontFamily: "Verdana",
        fontSize: "36px",
        color: "#f8fafc"
      })
      .setOrigin(0.5);
    const body = this.add
      .text(0, 24, UI.rotationBody, {
        fontFamily: "Verdana",
        fontSize: "22px",
        align: "center",
        color: "#cbd5e1"
      })
      .setOrigin(0.5);

    container.add([panel, title, body]);
    return container;
  }

  updateOrientationGuard(size) {
    const width = size?.width ?? this.scale.width;
    const height = size?.height ?? this.scale.height;
    const portrait = height > width;
    this.rotationOverlay.setVisible(portrait);
  }

  showStartOverlay() {
    this.showDomOverlay(
      UI.startTitle,
      UI.startBody,
      [
        {
          label: UI.startButton,
          callback: () => {
            this.gameScene.events.emit("ui:start");
            this.hideDomOverlay();
          }
        }
      ],
      {
        eyebrow: UI.startEyebrow,
        meta: "<strong>Sesion</strong> partida arcade de 5-10 min",
        footnote: UI.startFootnote
      }
    );
  }

  showPauseOverlay() {
    this.showDomOverlay(
      UI.pauseTitle,
      UI.pauseBody,
      [
        {
          label: UI.pauseContinueButton,
          callback: () => {
            this.gameScene.events.emit("ui:pause-toggle");
            this.hideDomOverlay();
          }
        },
        {
          label: UI.pauseRestartButton,
          className: "secondary",
          callback: () => {
            this.gameScene.events.emit("ui:restart");
            this.hideDomOverlay();
          }
        }
      ],
      {
        eyebrow: UI.eyebrowPaused,
        meta: "<strong>Estado</strong> sesion en pausa",
        footnote: UI.pauseFootnote
      }
    );
  }

  showGameOverOverlay(stats) {
    const reasonLabel = this.formatReason(stats.reason);
    this.showDomOverlay(
      UI.gameOverTitle,
      `Motivo: ${reasonLabel}\nPuntaje: ${stats.score}\nRecord: ${stats.highScore ?? stats.score}\nNivel: ${stats.level}\nSalvados: ${stats.civiliansSaved}\nPerdidos: ${stats.civiliansLost}\nPrecision: ${stats.accuracy}%`,
      [
        {
          label: UI.gameOverRestartButton,
          callback: () => {
            this.gameScene.events.emit("ui:restart");
            this.hideDomOverlay();
          }
        }
      ],
      {
        eyebrow: UI.eyebrowGameOver,
        meta: `<strong>Record</strong> ${stats.highScore ?? stats.score}  <strong>Precision</strong> ${stats.accuracy}%`,
        footnote: UI.gameOverFootnote
      }
    );
  }

  showLevelCompleteOverlay(stats) {
    this.showDomOverlay(
      `Nivel ${stats.level} Completado`,
      `Puntaje: ${stats.score}\nRecord: ${stats.highScore ?? stats.score}\nSalvados: ${stats.civiliansSaved}\nPerdidos: ${stats.civiliansLost}\nPrecision: ${stats.accuracy}%\nBonus: ${stats.bonus}`,
      [
        {
          label: UI.levelCompleteNextButton,
          callback: () => {
            this.gameScene.events.emit("ui:next-level");
            this.hideDomOverlay();
          }
        },
        {
          label: UI.levelCompleteRestartButton,
          className: "secondary",
          callback: () => {
            this.gameScene.events.emit("ui:restart");
            this.hideDomOverlay();
          }
        }
      ],
      {
        eyebrow: UI.eyebrowLevelComplete,
        meta: `<strong>Bonus</strong> ${stats.bonus}  <strong>Salvados</strong> ${stats.civiliansSaved}`,
        footnote: "Avanza de inmediato o reinicia toda la corrida."
      }
    );
  }

  onHudUpdate(payload) {
    this.lastPayload = payload;

    this.tweens.add({
      targets: this,
      visualLife: payload.life,
      visualScore: payload.score,
      duration: 400,
      ease: "Cubic.Out",
      onUpdate: () => this.refreshHudLabel()
    });
  }

  refreshHudLabel() {
    if (!this.lastPayload) return;
    const payload = this.lastPayload;
    const life = Math.round(this.visualLife);
    const score = Math.round(this.visualScore);
    const lifeRatio = Phaser.Math.Clamp(life / 100, 0, 1);
    const rescueRatio = Phaser.Math.Clamp(payload.civiliansSaved / Math.max(1, payload.civiliansGoal), 0, 1);
    const threatRatio = Phaser.Math.Clamp(payload.zombiesActive / 8, 0, 1);
    const barBaseWidth = this.lifeBarFrame.width - 4;
    const rescueBaseWidth = this.rescueBarFrame.width - 4;
    const threatBaseWidth = this.threatBarFrame.width - 4;
    const critical = life <= 25 || payload.civiliansLostLimit - payload.civiliansLost <= 1;
    
    this.hudLeftLabel.setText(
      `HP: ${life}\nScore: ${score}\nNivel: ${payload.level}`
    );
    this.hudRightLabel.setText(
      `High: ${payload.highScore ?? 0}\nSalvados: ${payload.civiliansSaved}/${payload.civiliansGoal}\nPerdidos: ${payload.civiliansLost}/${payload.civiliansLostLimit}\nAccuracy: ${payload.accuracy}%`
    );
    this.waveBadge.setText(`LEVEL ${payload.level}  |  WAVE ${payload.wave}`);
    this.lifeBarFill.width = barBaseWidth * lifeRatio;
    this.lifeBarGlow.width = barBaseWidth * Math.min(1, lifeRatio + 0.08);
    this.lifeBarFill.setFillStyle(life > 55 ? 0x22c55e : life > 25 ? 0xf59e0b : 0xef4444, 1);
    this.rescueBarFill.width = rescueBaseWidth * rescueRatio;
    this.threatBarFill.width = threatBaseWidth * threatRatio;
    this.threatBarFill.setFillStyle(threatRatio >= 0.75 ? 0xdc2626 : threatRatio >= 0.45 ? 0xf97316 : 0xf59e0b, 0.95);
    this.barCaptionRight.setText(`Rescate ${payload.civiliansSaved}/${payload.civiliansGoal}  |  Amenaza ${payload.zombiesActive}Z / ${payload.civiliansActive}C`);
    this.criticalWash.setAlpha(critical ? 0.045 + Math.abs(Math.sin(this.time.now * 0.012)) * 0.04 : 0);
  }

  onHudPulseSaved() {
    this.tweens.add({
      targets: [this.hudLeftLabel, this.hudRightLabel],
      scale: 1.08,
      duration: 120,
      yoyo: true,
      ease: "Quad.Out"
    });
  }

  onAudioState({ muted }) {
    if (!this.audioButton) {
      return;
    }

    this.audioButton.innerText = muted ? "Sonido Silenciado" : "Sonido Activo";
    this.audioButton.setAttribute("aria-pressed", muted ? "true" : "false");
  }

  onRunState(state) {
    if (state.showStart) {
      this.showStartOverlay();
      return;
    }

    if (state.paused) {
      this.showPauseOverlay();
      return;
    }

    if (!state.gameOver && !state.levelCompleted && this.domOverlay.classList.contains("active")) {
      this.hideDomOverlay();
    }
  }

  onMessage(message) {
    this.toastLabel.setText(message.text).setAlpha(1);
    this.tweens.add({
      targets: this.toastLabel,
      alpha: 0,
      duration: 1200,
      ease: "Sine.Out"
    });

    if (/^Wave \d+/i.test(message.text) || /^Level \d+/i.test(message.text) || /Protect the civilians/i.test(message.text)) {
      const isWave = /^Wave \d+/i.test(message.text);
      if (isWave) {
        this.gameScene.audio.ensure();
        this.gameScene.audio.playSfx("wave-alert");
      }
      this.showEventBanner(message.text.toUpperCase(), isWave ? "warning" : "info");
    }
  }

  showEventBanner(text, tone = "info") {
    const glowColor = tone === "warning" ? 0xf59e0b : 0x38bdf8;
    this.eventBanner.setText(text);
    this.eventBannerGlow.setFillStyle(glowColor, 0.12).setVisible(true).setAlpha(0);
    this.eventBanner.setAlpha(0).setScale(0.92);

    this.tweens.add({
      targets: [this.eventBanner, this.eventBannerGlow],
      alpha: 1,
      duration: 160,
      ease: "Quad.Out"
    });
    this.tweens.add({
      targets: this.eventBanner,
      scale: 1.02,
      duration: 220,
      yoyo: true,
      ease: "Sine.Out"
    });
    this.tweens.add({
      targets: [this.eventBanner, this.eventBannerGlow],
      alpha: 0,
      delay: 1100,
      duration: 360,
      ease: "Sine.Out",
      onComplete: () => {
        this.eventBannerGlow.setVisible(false);
      }
    });
  }

  onGameOver(stats) {
    this.showGameOverOverlay(stats);
  }

  onLevelComplete(stats) {
    this.showLevelCompleteOverlay(stats);
  }

  formatReason(reason) {
    if (reason === "life-depleted") {
      return "Vida agotada";
    }
    if (reason === "too-many-civilians-lost") {
      return "Demasiados civiles perdidos";
    }
    return "Partida fallida";
  }
}
