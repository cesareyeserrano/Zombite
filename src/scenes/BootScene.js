import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const base = import.meta.env.BASE_URL || "/";
    this.load.setPath(base + "assets");
    this.load.image("bg-city", "sprites/background-city.svg");
    this.load.image("enemy-zombie", "sprites/zombie-pixel.svg");
    this.load.image("enemy-zombie-step", "sprites/zombie-pixel-step.svg");
    this.load.image("enemy-zombie-office", "sprites/zombie-office.svg");
    this.load.image("enemy-zombie-office-step", "sprites/zombie-office-step.svg");
    this.load.image("enemy-zombie-urban", "sprites/zombie-urban.svg");
    this.load.image("enemy-zombie-urban-step", "sprites/zombie-urban-step.svg");
    this.load.image("enemy-zombie-rager", "sprites/zombie-rager.svg");
    this.load.image("enemy-zombie-rager-step", "sprites/zombie-rager-step.svg");
    this.load.image("enemy-zombie-alpha", "sprites/zombie-alpha.svg");
    this.load.image("enemy-zombie-alpha-step", "sprites/zombie-alpha-step.svg");
    this.load.image("enemy-zombie-brute", "sprites/zombie-brute.svg");
    this.load.image("enemy-zombie-brute-step", "sprites/zombie-brute-step.svg");
    this.load.image("enemy-zombie-dead", "sprites/zombie-dead.svg");
    this.load.image("npc-civilian", "sprites/civilian-pixel.svg");
    this.load.image("npc-civilian-step", "sprites/civilian-pixel-step.svg");
    this.load.image("npc-civilian-dead", "sprites/civilian-dead.svg");
    this.load.image("npc-civilian-infected", "sprites/civilian-infected.svg");
    this.load.image("npc-civilian-office", "sprites/civilian-office.svg");
    this.load.image("npc-civilian-office-step", "sprites/civilian-office-step.svg");
    this.load.image("npc-civilian-casual", "sprites/civilian-casual.svg");
    this.load.image("npc-civilian-casual-step", "sprites/civilian-casual-step.svg");
    this.load.image("npc-civilian-urban", "sprites/civilian-urban.svg");
    this.load.image("npc-civilian-urban-step", "sprites/civilian-urban-step.svg");
    this.load.image("crosshair", "sprites/crosshair-pixel.svg");
    this.load.image("muzzle-flash", "sprites/muzzle-flash.svg");
    this.load.image("hit-marker", "sprites/hit-marker.svg");
    this.load.image("powerup-health", "sprites/powerup-health.svg");
    this.load.image("powerup-rescue", "sprites/powerup-rescue.svg");
    this.load.image("prop-car-wreck", "sprites/prop-car-wreck.svg");
    this.load.image("prop-barricade", "sprites/prop-barricade.svg");
    this.load.image("prop-evac-sign", "sprites/prop-evac-sign.svg");
    this.load.image("safe-checkpoint", "sprites/safe-checkpoint.svg");
    this.load.image("safe-bunker", "sprites/safe-bunker.svg");
    this.load.json("asset-manifest", "manifest.json");
  }

  create() {
    this.scene.start("GameScene");
    this.scene.start("UIScene");
  }
}
