# Plan: zombite

STATUS: DRAFT

## 1. Intent
Entregar un mini juego web de zombies para sesiones cortas (3-8 minutos), con 10 niveles de dificultad progresiva y capacidad de embedding seguro via iframe/widget.

- Success looks like:
- Inicio de juego en menos de 5 segundos en red domestica.
- Progresion 1-10 percibida como desafiante y justa.
- Integracion estable del widget con inputs validos e invalidos.

## 2. Scope
### In scope
- Core loop inmediato: iniciar, apuntar/disparar, finalizar nivel o reiniciar.
- Sistema de niveles progresivos (1-10).
- Eventos de zombie alfa en niveles definidos.
- Embedding y configuracion basica validada (`idioma`, `volumen`, `dificultadInicial`).

### Out of scope
- Multiplayer en tiempo real.
- Tienda, economia o microtransacciones.
- Cuentas persistentes y ranking global.

## 3. Discovery Review (Discovery Persona)
### Problem framing
El valor principal es reducir friccion: juego rapido para usuario final e integracion sencilla para terceros.

### Constraints and dependencies
- Rendimiento constante en hardware promedio.
- Assets optimizados para carga inicial corta.
- Contrato de mensajes y configuracion seguro para embedding.

### Success metrics
- Tiempo a primer gameplay.
- Sesiones completadas de 3-8 minutos.
- Tasa de errores de configuracion/embedding.

### Key assumptions
- Los jugadores prefieren una curva de dificultad incremental y legible.
- La configuracion basica del widget cubre los casos de uso iniciales.

## 4. Product Review (Product Persona)
### Business value
Permite distribuir el juego en propiedades web propias y de terceros, ampliando alcance y retencion sin instalacion.

### Success metric
- `P95` de tiempo de carga a gameplay < 5s.
- Al menos una sesion completa por usuario activo en pruebas internas.

### Assumptions to validate
- Dificultad del nivel 10 es exigente pero alcanzable.
- La aparicion de zombies alfa incrementa emocion sin frustracion.
- Los hosts necesitan solo configuracion basica al inicio.

## 5. Architecture (Architect Persona)
### Components
- `GameEngine`: loop principal y estado de partida.
- `LevelManager`: progresion y parametros por nivel.
- `EnemySystem`: zombies normales y alfa.
- `EmbedAdapter`: inicializacion en iframe/widget y puente de mensajes.
- `ConfigValidator`: parser y sanitizacion de configuracion.

### Data flow
Host -> `EmbedAdapter` -> `ConfigValidator` -> `GameEngine` -> `LevelManager`/`EnemySystem` -> HUD/resultado.

### Key decisions
- Aplicar defaults seguros ante configuracion invalida.
- Definir progresion de dificultad por tabla de parametros.
- Separar logica de embedding del loop de juego para aislamiento.

### Risks & mitigations
- Riesgo: caida de FPS en niveles avanzados.
  Mitigacion: limite de entidades y degradacion visual controlada.
- Riesgo: estado inconsistente al terminar nivel con alfa.
  Mitigacion: maquina de estados explicita para victoria/derrota/transicion.
- Riesgo: inyeccion via mensajes externos.
  Mitigacion: allowlist de origen y validacion estricta de esquema.

### Observability
- Logs de arranque y validacion de config.
- Metricas de FPS promedio y caidas por nivel.
- Conteo de rechazos de mensajes externos por motivo.

## 6. Security (Security Persona)
### Threats
- Mensajes `postMessage` desde origen no confiable.
- Payloads con tipos o campos maliciosos.
- Intentos de forzar estado de juego via config.

### Required controls
- Allowlist de `origin` para comunicacion.
- Validacion de esquema y tipos en mensajes/config.
- Defaults seguros y rechazo silencioso de campos no soportados.

### Validation rules
- `idioma`: solo lista permitida.
- `volumen`: rango numerico acotado.
- `dificultadInicial`: valores permitidos o fallback a default.

### Abuse prevention
- Ignorar rafagas de mensajes no validos y registrar eventos de rechazo.

## 7. UX/UI Review (UX/UI Persona)
### Primary user flow
Pantalla inicial corta -> inicio inmediato -> juego por nivel -> feedback de victoria/derrota -> continuar o reiniciar.

### Key states
- Loading: indicador breve de carga.
- Active play: HUD legible, mira visible, feedback de impacto.
- Success/fail: resultado claro con CTA de siguiente paso.
- Error/fallback: mensaje accionable cuando faltan assets o config invalida.

### Accessibility baseline
- Contraste suficiente de HUD.
- Indicadores no dependientes solo de color.
- Soporte de teclado basico para acciones principales.

## 8. Backlog
### Epics
- EP-1: Core loop de gameplay corto y divertido.
- EP-2: Progresion y distribucion embebible segura.

### User stories
- US-1 a US-4 definidos en `backlog/zombite/backlog.md`.

## 9. Test Cases (QA Persona)
- TC-1 a TC-5 definidos en `tests/zombite/tests.md`.
- Cobertura requerida: funcional, negativa/abuso, seguridad y edge cases.

## 10. Implementation Notes (Developer Persona)
- Secuencia sugerida:
  1) Motor base + ciclo de nivel.
  2) Progresion y zombie alfa.
  3) Adapter de embedding + validacion config.
  4) Pulido de rendimiento, HUD y fallback.
- Dependencias:
  - Pipeline de assets optimizados.
  - Harness de pruebas de embedding.
- Rollout / fallback:
  - Desplegar primero en entorno de prueba embebido.
  - Fallback a defaults y desactivar config avanzada ante error.
