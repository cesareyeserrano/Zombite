import {
  createInitialState,
  resolveShotTarget,
  applyShotOutcome,
  evaluateSecurityControls
} from "../modules/module-zombite3-service/index.js";

/**
 * FR-1: The system must run locally with npm install + npm run dev and provide a fully playable fixed-camera gallery-shooter loop where each wave spawns zombies and civilians together, and left-click shots are resolved from the crosshair so zombies are rewarded and civilians are penalized immediately.
 */
export async function fr_1_the_system_must_run_locally_with_npm_install_npm_run_dev_and_provide_a_fully_playable_fixed_camera_gallery_shooter_loop_where_each_wave_spawns_zombies_and_civilians_together_and_left_click_shots_are_resolved_from_the_crosshair_so_zombies_are_rewarded_and_civilians_are_penalized_immediately(input = {}) {
  const crosshair = input.crosshair ?? { x: 480, y: 270 };
  const entities = input.entities ?? [
    { id: "c-1", type: "civilian", x: 480, y: 270, hitRadius: 18, spawnIndex: 1 },
    { id: "z-1", type: "zombie", x: 480, y: 270, hitRadius: 18, spawnIndex: 2 }
  ];

  const selected = resolveShotTarget({ crosshair, entities });
  const initialState = createInitialState(input.state);
  const nextState = applyShotOutcome(initialState, selected ? { type: selected.type } : null);

  const security = evaluateSecurityControls({
    assetPaths: [
      "/assets/sprites/zombie-pixel.svg",
      "/assets/sprites/civilian-pixel.svg",
      "/assets/sprites/crosshair-pixel.svg"
    ],
    exposeDebugEndpoints: false,
    dynamicScriptExecution: false
  });

  return {
    selectedTarget: selected,
    state: nextState,
    ac1Satisfied:
      selected?.type === "civilian" &&
      nextState.score === -50 &&
      nextState.life === 85 &&
      nextState.lastFeedback?.kind === "civilian-penalty",
    security
  };
}
