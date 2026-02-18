import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    this.gameScene = this.scene.get("GameScene");

    this.hudLabel = this.add
      .text(16, 14, "", {
        fontFamily: "Verdana",
        fontSize: "18px",
        color: "#e2e8f0",
        stroke: "#020617",
        strokeThickness: 3
      })
      .setDepth(1500);

    this.helpLabel = this.add
      .text(16, 520, "Mouse/Touch: aim + shoot | ESC: pause | R: restart", {
        fontFamily: "Verdana",
        fontSize: "14px",
        color: "#cbd5e1",
        stroke: "#020617",
        strokeThickness: 2
      })
      .setDepth(1500)
      .setOrigin(0, 1);

    this.toastLabel = this.add
      .text(480, 58, "", {
        fontFamily: "Verdana",
        fontSize: "20px",
        color: "#fef08a",
        stroke: "#7c2d12",
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(1500)
      .setAlpha(0);

    this.overlay = this.createOverlay();
    this.rotationOverlay = this.createRotationOverlay();
    this.scale.on("resize", this.updateOrientationGuard, this);
    this.updateOrientationGuard(this.scale.gameSize);
    this.showStartOverlay();

    this.gameScene.events.on("hud:update", this.onHudUpdate, this);
    this.gameScene.events.on("run:state", this.onRunState, this);
    this.gameScene.events.on("message", this.onMessage, this);
    this.gameScene.events.on("game:over", this.onGameOver, this);
    this.gameScene.events.on("level:complete", this.onLevelComplete, this);
  }

  createRotationOverlay() {
    const container = this.add.container(480, 270).setDepth(1700).setVisible(false);
    const panel = this.add.rectangle(0, 0, 620, 260, 0x020617, 0.92).setStrokeStyle(2, 0xf59e0b, 0.9);
    const title = this.add
      .text(0, -42, "Rotar Dispositivo", {
        fontFamily: "Verdana",
        fontSize: "36px",
        color: "#f8fafc"
      })
      .setOrigin(0.5);
    const body = this.add
      .text(0, 24, "Zombie Rescue Runner requiere modo horizontal.\nGira tu dispositivo para continuar.", {
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

  createOverlay() {
    const container = this.add.container(480, 270).setDepth(1600);

    const panel = this.add.rectangle(0, 0, 560, 330, 0x020617, 0.9).setStrokeStyle(2, 0x38bdf8, 0.75);
    const title = this.add
      .text(0, -120, "", {
        fontFamily: "Verdana",
        fontSize: "36px",
        color: "#e2e8f0"
      })
      .setOrigin(0.5);

    const body = this.add
      .text(0, -18, "", {
        fontFamily: "Verdana",
        fontSize: "19px",
        color: "#cbd5e1",
        align: "center",
        wordWrap: { width: 500 }
      })
      .setOrigin(0.5);

    const primaryButton = this.createButton(0, 84, "START", () => {
      this.gameScene.events.emit("ui:start");
      this.overlay.container.setVisible(false);
    });

    const secondaryButton = this.createButton(0, 132, "RESTART", () => {
      this.gameScene.events.emit("ui:restart");
      this.overlay.container.setVisible(false);
    });

    container.add([panel, title, body, primaryButton.container, secondaryButton.container]);

    return {
      container,
      title,
      body,
      primaryButton,
      secondaryButton
    };
  }

  createButton(x, y, label, onClick) {
    const group = this.add.container(x, y);

    const background = this.add
      .rectangle(0, 0, 240, 38, 0x0f172a, 0.95)
      .setStrokeStyle(2, 0x22d3ee, 0.85)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(0, 0, label, {
        fontFamily: "Verdana",
        fontSize: "18px",
        color: "#e2e8f0"
      })
      .setOrigin(0.5);

    background.on("pointerover", () => background.setFillStyle(0x164e63, 0.95));
    background.on("pointerout", () => background.setFillStyle(0x0f172a, 0.95));
    background.on("pointerdown", () => onClick());

    group.add([background, text]);
    return {
      container: group,
      setLabel: (value) => text.setText(value),
      setAction: (fn) => {
        background.removeAllListeners("pointerdown");
        background.on("pointerdown", fn);
      }
    };
  }

  showStartOverlay() {
    this.overlay.container.setVisible(true);
    this.overlay.title.setText("Zombie Rescue Runner");
    this.overlay.body.setText(
      "Protect civilians while they run across the street.\n\nAvoid friendly fire.\nYou lose if HP reaches 0 or too many civilians are lost."
    );
    this.overlay.primaryButton.setLabel("START");
    this.overlay.secondaryButton.container.setVisible(false);
    this.overlay.primaryButton.container.setVisible(true);
    this.overlay.primaryButton.setAction(() => {
      this.gameScene.events.emit("ui:start");
      this.overlay.container.setVisible(false);
    });
  }

  showPauseOverlay() {
    this.overlay.container.setVisible(true);
    this.overlay.title.setText("Paused");
    this.overlay.body.setText("Press ESC to resume\nor restart this run.");
    this.overlay.primaryButton.setLabel("RESUME");
    this.overlay.secondaryButton.setLabel("RESTART");
    this.overlay.primaryButton.container.setVisible(true);
    this.overlay.secondaryButton.container.setVisible(true);

    this.overlay.primaryButton.setAction(() => {
      this.gameScene.events.emit("ui:pause-toggle");
      this.overlay.container.setVisible(false);
    });

    this.overlay.secondaryButton.setAction(() => {
      this.gameScene.events.emit("ui:restart");
      this.overlay.container.setVisible(false);
    });
  }

  showGameOverOverlay(stats) {
    this.overlay.container.setVisible(true);
    this.overlay.title.setText("Game Over");
    this.overlay.body.setText(
      `Reason: ${stats.reason}\nScore: ${stats.score}\nLevel: ${stats.level}\nCiviles salvados: ${stats.civiliansSaved}\nCiviles perdidos: ${stats.civiliansLost}\nKills: ${stats.kills}\nAccuracy: ${stats.accuracy}%`
    );

    this.overlay.primaryButton.setLabel("RESTART");
    this.overlay.secondaryButton.container.setVisible(false);
    this.overlay.primaryButton.container.setVisible(true);
    this.overlay.primaryButton.setAction(() => {
      this.gameScene.events.emit("ui:restart");
      this.overlay.container.setVisible(false);
    });
  }

  showLevelCompleteOverlay(stats) {
    this.overlay.container.setVisible(true);
    this.overlay.title.setText(`Level ${stats.level} Complete`);
    this.overlay.body.setText(
      `Civiles salvados: ${stats.civiliansSaved}\nCiviles perdidos: ${stats.civiliansLost}\nZombies eliminados: ${stats.kills}\nAccuracy: ${stats.accuracy}%\nBonus sin civiles heridos: ${stats.bonus}`
    );

    this.overlay.primaryButton.setLabel("NEXT LEVEL");
    this.overlay.secondaryButton.setLabel("RESTART");
    this.overlay.primaryButton.container.setVisible(true);
    this.overlay.secondaryButton.container.setVisible(true);

    this.overlay.primaryButton.setAction(() => {
      this.gameScene.events.emit("ui:next-level");
      this.overlay.container.setVisible(false);
    });

    this.overlay.secondaryButton.setAction(() => {
      this.gameScene.events.emit("ui:restart");
      this.overlay.container.setVisible(false);
    });
  }

  onHudUpdate(payload) {
    this.hudLabel.setText(
      `HP: ${payload.life}   Score: ${payload.score}   High: ${payload.highScore ?? 0}   Nivel: ${payload.level}   ` +
        `Salvados: ${payload.civiliansSaved}/${payload.civiliansGoal}   ` +
        `Perdidos: ${payload.civiliansLost}/${payload.civiliansLostLimit}   Accuracy: ${payload.accuracy}%`
    );
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

    if (!state.gameOver && !state.levelCompleted) {
      this.overlay.container.setVisible(false);
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
  }

  onGameOver(stats) {
    this.showGameOverOverlay(stats);
  }

  onLevelComplete(stats) {
    this.showLevelCompleteOverlay(stats);
  }
}
