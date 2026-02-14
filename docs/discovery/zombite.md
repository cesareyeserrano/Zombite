# Discovery: zombite

STATUS: DRAFT

## 1. Problem Statement
El producto busca cubrir micro-sesiones de entretenimiento en web sin friccion de instalacion. Un jugador casual debe poder abrir y jugar rapido, mientras un sitio anfitrion debe incrustarlo como iframe/widget con configuracion controlada.

## 2. Discovery Interview Summary (Discovery Persona)
- Usuarios principales: jugadores casuales web y equipos que necesitan un widget jugable reutilizable.
- Jobs to be done: jugar rapidamente sin curva alta; incrustar el juego sin codigo complejo.
- Dolor actual: minijuegos web suelen tardar en arrancar, carecen de progresion clara o no ofrecen integracion embebible segura.
- Restricciones: rendimiento en laptops promedio, sesiones de 3-8 minutos, contrato de configuracion robusto.
- Dependencias: pipeline de assets livianos, loop de render estable, canal `postMessage` validado.
- Metricas de exito: tiempo a primer gameplay <5s, tasa de finalizacion de sesion corta, errores de embedding cercanos a cero.
- Supuestos a validar: dificultad percibida como justa en 10 niveles y claridad de HUD en resoluciones pequenas.

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
- Validar origen (`origin`) y esquema de mensajes `postMessage` cuando se use como iframe/widget, y sanitizar cualquier dato de configuracion recibido para evitar inyeccion o manipulacion del estado del juego.

## 8. Out of Scope
- Modo multijugador en tiempo real.
- Economia in-game, tienda o microtransacciones.
- Registro de usuarios o ranking global persistente.

## 9. Discovery Confidence
- Nivel de confianza actual: medio-alto.
- Evidencia fuerte: contrato funcional FR-1..FR-4 y validaciones de seguridad/embedding implementadas.
- Riesgo residual: calibracion fina de dificultad percibida en nivel 9-10 para jugadores de habilidad media.
- Plan de cierre: ejecutar playtests manuales guiados y ajustar tabla de pacing por nivel.

## 9. Acceptance Criteria (Given/When/Then)
- AC-1: Given un jugador casual, when inicia una partida, then entra en gameplay en pocos segundos y puede jugar una sesion corta completa.
- AC-2: Given una partida en progreso, when avanza del nivel 1 al 10, then la dificultad aumenta gradualmente y se percibe retadora pero razonable.
- AC-3: Given un nivel con zombie alfa, when el jugador lo enfrenta, then el alfa requiere mayor esfuerzo que un zombie normal y su derrota permite continuar.
- AC-4: Given un sitio externo integra el juego via iframe/widget, when envia configuracion valida, then el juego aplica la configuracion y rechaza entradas invalidas sin romper la sesion.

## 10. Research Notes
- Usuarios principales: jugadores casuales web y equipos que necesitan un widget jugable reutilizable.
- Jobs to be done: jugar rapidamente sin curva alta; incrustar el juego sin codigo complejo.
- Dolor actual: minijuegos web suelen tardar en arrancar, carecen de progresion clara o no ofrecen integracion embebible segura.
- Restricciones: rendimiento en laptops promedio, sesiones de 3-8 minutos, contrato de configuracion robusto.
- Dependencias: pipeline de assets livianos, loop de render estable, canal `postMessage` validado.
- Metricas de exito: tiempo a primer gameplay <5s, tasa de finalizacion de sesion corta, errores de embedding cercanos a cero.
- Supuestos a validar: dificultad percibida como justa en 10 niveles y claridad de HUD en resoluciones pequenas.

## 11. Scope
### In scope
- Loop jugable inmediato para sesiones cortas.
- Diez niveles con progresion controlada.
- Enemigos alfa en niveles definidos.
- Embedding via iframe/widget con configuracion validada.

### Out of scope
- Multiplayer.
- Economia y monetizacion.
- Cuentas o ranking persistente global.

## 12. Actors & User Journeys
- Jugador casual: abre juego, inicia partida, completa o falla nivel, decide continuar o reiniciar.
- Sitio anfitrion: incrusta iframe, envia parametros validos, recibe comportamiento estable aun con inputs invalidos.

## 13. Architecture Snapshot (Architect Persona)
- Componentes: motor de juego en cliente, gestor de niveles, sistema de enemigos, adaptador de embedding y parser de configuracion.
- Flujo: host envia configuracion inicial -> parser valida/sanitiza -> motor inicia nivel -> loop actualiza estado y HUD -> transicion a siguiente nivel o reinicio.
- Decisiones clave: defaults seguros para configuracion, progresion parametrica por nivel, distincion explicita de zombie alfa.
- Riesgos: picos de carga en niveles altos, inconsistencia de estado en derrota/victoria, abuso de mensajes externos.

## 14. Security Snapshot (Security Persona)
- Amenazas: `postMessage` malicioso, manipulacion de config, payloads inesperados.
- Controles: allowlist de `origin`, esquema estricto de mensajes, sanitizacion y coercion de tipos.
- Reglas de validacion: ignorar campos desconocidos, aplicar limites de rango, fallback a defaults ante error.

## 15. Test Strategy Outline
- Smoke: arranque, inicio de partida y primer nivel jugable.
- Functional: progresion completa 1-10, eventos de zombie alfa, transiciones de nivel.
- Security: rechazo de origen no permitido y de mensajes invalidos.
- Edge: baja resolucion, cierre/reapertura de pestaña, degradacion por FPS bajo.
