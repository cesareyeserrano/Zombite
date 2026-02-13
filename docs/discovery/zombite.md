# Discovery: zombite

STATUS: DRAFT

## 1. Problem Statement
Derived from approved spec:

---

# AF-SPEC: zombite

STATUS: APPROVED
## 1. Context
Quiero construir un mini juego web instalable como iframe o widget en otras páginas.

Primary actor: jugador casual
Expected outcome: Que el jugador disfrute sesiones cortas de 3 a 8 minutos, complete niveles con dificultad progresiva y pueda incrustar el juego fácilmente en cualquier sitio mediante iframe/widget.

---

(Assumptions and details will be refined during review.)

## 2. Actors
- Jugador casual (actor primario): juega sesiones cortas y busca entretenimiento ligero.
- Sitio anfitrion: integra el juego como iframe/widget y envia configuracion controlada.

## 3. Functional Rules (traceable)
- FR-1: El juego debe permitir completar una partida en sesiones cortas de 3 a 8 minutos con bucle jugable inmediato (iniciar, apuntar, disparar, pasar de nivel o reiniciar).
- FR-2: El juego debe incluir 10 niveles con dificultad progresiva (velocidad/cantidad de zombies y precision requerida) sin saltos bruscos imposibles.
- FR-3: En niveles definidos deben aparecer zombies alfa con mayor resistencia y patron de movimiento diferenciado respecto a zombies normales.
- FR-4: El juego debe poder incrustarse como iframe/widget y aceptar configuracion basica validada (por ejemplo idioma, volumen, dificultad inicial).

## 4. Edge Cases
- El usuario cierra la pestaña y vuelve a abrir: el juego reinicia sin bloquearse.
- Pantallas pequenas o baja resolucion: el HUD y la mira siguen siendo legibles.
- Nivel con zombie alfa y limite de tiempo: el nivel termina correctamente (victoria o derrota) sin estado inconsistente.

## 5. Failure Conditions
- Configuracion de iframe invalida: se ignora y se aplican valores por defecto seguros.
- Activos no cargados a tiempo: se muestra fallback y opcion de reintentar sin congelar la UI.
- FPS demasiado bajo: se degrada calidad visual para mantener jugabilidad.

## 6. Non-Functional Requirements
- Rendimiento: objetivo de 50-60 FPS en desktop moderno y experiencia fluida en laptop promedio.
- Peso inicial: carga optimizada para iniciar sesion jugable en menos de 5 segundos en red domestica.
- UX: controles simples, feedback audiovisual claro y curva de dificultad entendible.

## 7. Security Considerations
- Validar origen (`origin`) y esquema de mensajes `postMessage` cuando se use como iframe/widget, y sanitizar cualquier dato de configuración recibido para evitar inyección o manipulación del estado del juego.

## 8. Out of Scope
- Modo multijugador en tiempo real.
- Economia in-game, tienda o microtransacciones.
- Registro de usuarios o ranking global persistente.

## 9. Acceptance Criteria (Given/When/Then)
- AC-1: Given un jugador casual, when inicia una partida, then entra en gameplay en pocos segundos y puede jugar una sesion corta completa.
- AC-2: Given una partida en progreso, when avanza del nivel 1 al 10, then la dificultad aumenta gradualmente y se percibe retadora pero razonable.
- AC-3: Given un nivel con zombie alfa, when el jugador lo enfrenta, then el alfa requiere mayor esfuerzo que un zombie normal y su derrota permite continuar.
- AC-4: Given un sitio externo integra el juego via iframe/widget, when envia configuracion valida, then el juego aplica la configuracion y rechaza entradas invalidas sin romper la sesion.


---

Refined problem framing:
- What problem are we solving? TBD
- Why now? TBD

## 2. Discovery Interview Summary (Discovery Persona)
- Primary users:
- TBD

- Jobs to be done:
- TBD

- Current pain:
- TBD

- Constraints (business/technical/compliance):
- TBD

- Dependencies:
- TBD

- Success metrics:
- TBD

- Assumptions:
- TBD

## 3. Scope
### In scope
- TBD

### Out of scope
- Not specified

## 4. Actors & User Journeys
Actors:
- TBD

Primary journey:
- TBD

## 5. Architecture (Architect Persona)
- Components:
-
- Data flow:
-
- Key decisions:
-
- Risks:
-

## 6. Security (Security Persona)
- Threats:
-
- Controls required:
-
- Validation rules:
-

## 7. Backlog Outline
Epic:
-

User stories:
1.
2.
3.

## 8. Test Strategy
- Smoke tests:
-
- Functional tests:
-
- Security tests:
-
- Edge cases:
-
