import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.setPath("/assets");
    this.load.image("bg-city", "sprites/background-city.svg");
    this.load.image("enemy-zombie", "sprites/zombie-pixel.svg");
    this.load.image("enemy-zombie-alpha", "sprites/zombie-alpha.svg");
    this.load.image("npc-civilian", "sprites/civilian-pixel.svg");
    this.load.image("crosshair", "sprites/crosshair-pixel.svg");
    this.load.image("muzzle-flash", "sprites/muzzle-flash.svg");
    this.load.image("hit-marker", "sprites/hit-marker.svg");
    this.load.image("powerup-health", "sprites/powerup-health.svg");
    this.load.image("powerup-rescue", "sprites/powerup-rescue.svg");
    this.load.image("safe-checkpoint", "sprites/safe-checkpoint.svg");
    this.load.image("safe-bunker", "sprites/safe-bunker.svg");
    this.load.json("asset-manifest", "manifest.json");
  }

  create() {
    this.scene.start("GameScene");
    this.scene.start("UIScene");
  }
}
