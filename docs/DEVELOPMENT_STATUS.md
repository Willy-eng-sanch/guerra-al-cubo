# Estado de desarrollo y auditoría de repositorio

**Fecha de corte de esta revisión:** 20 de noviembre de 2026.  
**Rama base consultada:** `main`.  
**Commit de referencia observado:** `fda50edce14d3e01b94390adfe30deaabf8ce1ff`.

Este informe separa hechos comprobados en GitHub, información declarada en PRs y validaciones que todavía requieren ejecución manual.

## 1. Estado del repositorio

- Repositorio público: `Willy-eng-sanch/guerra-al-cubo`.
- Rama predeterminada: `main`.
- Stack observado en `package.json`: React 19, TypeScript 5, Vite 6, Three.js.
- Scripts: `dev`, `build`, `preview`, `lint` (TypeScript `tsc --noEmit`) y `test` (Node Test Runner).
- No se encontró un README en la raíz al iniciar esta documentación; se incorpora uno en esta rama.
- Debe confirmarse y publicarse una licencia antes de invitar a reutilizar código o aceptar contribuciones bajo términos de código abierto.

## 2. Hitos fusionados verificados

| PR | Alcance | Estado |
|---|---|---|
| #39 | Guardado local automático, archivo y replay de partidas, logs de diagnóstico | Fusionada |
| #40 | Auditoría UX/UI, resumen postpartida y separación de herramientas técnicas | Fusionada |
| #41 | Arquitectura de sprites SVG y componentes reutilizables | Fusionada |
| #42 | Migración de iconografía y superficies de selección | Fusionada |
| #43 | Migración visual adicional y manual de producción de arte artesanal | Fusionada |

PR #43 declara una ejecución de GitHub Actions con 51/51 pruebas de gameplay, TypeScript y build aprobados. La revisión visual manual en varios tamaños de pantalla se dejó pendiente en la descripción de esa PR.

## 3. Sistemas documentados

### Combate y personajes
Existe un sistema de combate por turnos con dados, puntos de acción, HP, estados, habilidades, inventarios y bots. La auditoría de gameplay histórica cubre habilidades y pasivas de personajes, pero debe actualizarse continuamente a partir del código actual.

### Repeticiones
PR #39 incorporó guardado automático de partidas completas en IndexedDB, archivo local, reproducción dentro del juego y exportación de logs/replays para diagnóstico. El almacenamiento es local al navegador/dispositivo. No se documentó sincronización remota. Las partidas interrumpidas no se incluyen en el alcance descrito por esa PR.

### Interfaz
PR #40 corrigió la confusión entre reproducir partidas guardadas e importar archivos externos, separó herramientas de diagnóstico, mejoró el resumen postpartida y sentó bases responsive. PR #41–#43 incorporaron una arquitectura de sprites y migraciones visuales.

### Arte
Existe `docs/SPRITE_UI_ARCHITECTURE.md` y PR #43 declara la incorporación de `docs/SPRITE_ART_PRODUCTION_MANUAL.md`. La dirección visual elegida es original y está inspirada en manualidades callejeras; no se pretende imitar el arte de PvZ Heroes.

## 4. Defectos P1 identificados en GitHub

Los siguientes issues fueron visibles durante la auditoría y deben revisarse contra el estado actual antes de iniciar una corrección:

- [#31 — Gladiacubon puede duplicar el arma inicial en la pila general](https://github.com/Willy-eng-sanch/guerra-al-cubo/issues/31).
- [#32 — Congelación Glacial y Abordaje Cúbico no omiten correctamente el siguiente turno](https://github.com/Willy-eng-sanch/guerra-al-cubo/issues/32).
- [#33 — un objetivo congelado puede obtener una recompensa por una tirada defensiva no permitida](https://github.com/Willy-eng-sanch/guerra-al-cubo/issues/33).

El issue [#34](https://github.com/Willy-eng-sanch/guerra-al-cubo/issues/34), relativo al incremento doble de ronda, incluye una nota indicando que ya fue corregido en `main` y que existe una prueba automatizada correspondiente.

**Regla:** no cerrar estos issues por inferencia. Confirmar el estado actual del código, reproducir el caso y añadir una prueba de regresión.

## 5. Riesgos y límites

1. Las pruebas automáticas no demuestran que todas las habilidades estén correctas o equilibradas.
2. El CI verde no sustituye pruebas manuales en navegador, dispositivos táctiles y partidas completas.
3. El motor de replay necesita validación con partidas reales exportadas y reconstruidas en una sesión limpia.
4. La biblioteca local no es una cuenta de usuario ni un backend compartido.
5. El lobby/online necesita auditoría específica de arquitectura, seguridad, persistencia, sincronización y despliegue antes de prometer servicio competitivo.
6. El bundle principal fue señalado históricamente como grande; medir el build actual antes de priorizar optimizaciones.
7. El lockfile debe permanecer sincronizado con `package.json`; usar `npm ci` en CI.
8. El estado de la licencia y los derechos de contribución debe resolverse antes de abrir contribuciones externas de código y arte.

## 6. Validación mínima para cada cambio

- `npm ci`
- `npm test`
- `npm run lint`
- `npm run build`
- Pruebas manuales relevantes al cambio.
- Evidencia: pasos, resultado esperado/observado, capturas o replay/log cuando corresponda.
- Revisión del diff y de los riesgos de regresión.

## 7. Próxima prioridad recomendada

1. Revisar y reproducir #31, #32 y #33 en la versión actual.
2. Completar smoke test de partida de principio a fin.
3. Validar archivo, reproducción y exportación diagnóstica.
4. Auditar la arquitectura online por separado.
5. Consolidar documentación de reglas, personajes, cartas y balance desde el código actual.
6. Completar validación visual responsive y accesibilidad.
7. Publicar política de contribuciones, gobernanza y licencia antes de convocatoria amplia.
