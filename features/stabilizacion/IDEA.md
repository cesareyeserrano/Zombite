## Feature
Estabilizacion del proyecto: limpieza de artefactos legacy, actualizacion de documentacion, mejora de suite de tests, y sincronizacion de requerimientos con el estado real del codigo tras el adoption scan.

## Problem / Why
El proyecto acumulo tres capas de historia: (1) el pipeline Aitri v1.x con artefactos en formato legacy (docs/, specs/, backlog/ con estructura antigua), (2) el upgrade a v0.1.70 con nuevos artefactos en raiz, y (3) el adoption scan que elimino dead code y extrajo modulos. El resultado es un repo con documentos contradictorios, tests que validan texto fuente en lugar de comportamiento, y un README que describe la beta original en lugar del estado profesional actual. Antes de agregar funcionalidad nueva, hay que llevar el proyecto a un estado limpio y coherente.

## Target Users
- Desarrollador que retoma el proyecto (cesar) — necesita documentacion veridica y tests confiables
- Agente de CI/CD — necesita una suite de tests que detecte regresiones reales
- Colaborador nuevo — necesita un README y estructura de repo que refleje el estado actual

## New Behavior
- El sistema debe tener un unico README.md actualizado que describa el estado profesional actual (no la beta), con setup, controles, arquitectura y estructura de archivos correctos
- El sistema debe eliminar todos los artefactos legacy del pipeline Aitri v1.x: docs/discovery/, docs/plan/, docs/delivery/, docs/policy/, docs/verification/, specs/approved/, backlog/zombite/ (la carpeta raiz backlog/ de formato viejo)
- El sistema debe tener los requerimientos (01_REQUIREMENTS.json) actualizados para reflejar los modulos extraidos (AudioManager, locale/ui.js, getDifficultyProfile como funcion pura) en las notas de implementacion
- El sistema debe tener 02_SYSTEM_DESIGN.md actualizado para documentar src/audio/AudioManager.js y src/locale/ui.js como componentes del sistema
- El sistema debe reemplazar los tests de regex sobre source-text (TC-5 a TC-16) con tests funcionales/comportamentales que importen y ejecuten los modulos directamente
- El sistema debe tener un 03_TEST_CASES.json actualizado que describa los nuevos casos de test comportamentales
- El sistema debe limpiar docs/ dejando solo los documentos utiles: CANVAS_PURE_MIGRATION_PLAN.md puede eliminarse (plan de migracion nunca ejecutado), RELEASE_NOTES_V2.md y CHECKPOINT archivos legacy se archivan o eliminan
- El sistema debe tener .aitri-data/ sincronizado o eliminado si sus contenidos son redundantes con los artefactos raiz

## Success Criteria
- Dado el repo limpio, cuando un colaborador nuevo lo clona, entonces puede seguir el README y llegar a un juego corriendo en localhost en menos de 5 minutos
- Dado npm test, cuando se ejecuta, entonces todos los tests pasan y al menos los tests de TC-5 a TC-16 verifican comportamiento observable (imports, retornos de funcion, efectos de estado) en lugar de patrones de texto en source files
- Dado el repo, cuando se revisa la estructura de docs/, entonces no existen artefactos del pipeline Aitri v1.x (docs/discovery, docs/plan, docs/delivery, docs/policy, docs/verification, specs/)
- Dado 02_SYSTEM_DESIGN.md, cuando se lee la seccion de componentes, entonces AudioManager y UI locale aparecen como componentes documentados con sus responsabilidades

## Out of Scope
- No agregar funcionalidad de juego nueva (ondas, enemigos, power-ups, etc.)
- No cambiar logica de gameplay ni balanceo
- No migrar el stack tecnologico (Phaser, Vite permanecen)
- No agregar backend, multiplayer, ni cloud
- No cambiar el modelo de audio (Web Audio procedural permanece)
