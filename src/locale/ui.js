/**
 * UI string constants — centralized to maintain language consistency.
 * Current baseline: Spanish for UI chrome/overlays, English for in-game feedback.
 * All user-visible copy lives here to simplify future i18n work.
 */
export const UI = {
  // Overlay eyebrows / meta
  eyebrowDefault: "Supervivencia de Oficina",
  eyebrowPaused: "Partida Interrumpida",
  eyebrowLevelComplete: "Sector Asegurado",
  eyebrowGameOver: "Resumen de Partida",

  // Rotation guard
  rotationTitle: "Rotar Dispositivo",
  rotationBody: "Zombie Rescue Runner requiere modo horizontal.\nGira tu dispositivo para continuar.",

  // Start overlay
  startTitle: "Zombie Rescue Runner",
  startBody: "Protege a los civiles mientras cruzan la calle hacia el bunker.\n\nEvita el fuego amigo.\nPierdes si la vida llega a 0 o si se pierden demasiados civiles.\nEl audio se activa con la primera interacción y puede silenciarse en cualquier momento.",
  startButton: "INICIAR",
  startEyebrow: "Beta Profesional",
  startFootnote: "Mouse para apuntar. Click izquierdo dispara. ESC pausa. R reinicia.",

  // Pause overlay
  pauseTitle: "Pausa",
  pauseBody: "Presiona ESC para continuar\no reinicia esta partida.",
  pauseContinueButton: "CONTINUAR",
  pauseRestartButton: "REINICIAR",
  pauseFootnote: "Continua para seguir en el nivel actual.",

  // Game over overlay
  gameOverTitle: "Game Over",
  gameOverRestartButton: "REINICIAR",
  gameOverFootnote: "Reinicia para buscar una evacuacion mas limpia.",

  // Level complete overlay
  levelCompleteNextButton: "SIGUIENTE NIVEL",
  levelCompleteRestartButton: "REINICIAR",
};
