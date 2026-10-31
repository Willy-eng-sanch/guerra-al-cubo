# Auditoría y rediseño UX/UI — Guerra Cúbita

Fecha de auditoría: 31 de octubre de 2026  
Rama de trabajo: `feat/ui-ux-redesign-foundation`  
Base: `main` (incluye PR #39 y el commit posterior de audio)

## Objetivo

Conseguir una interfaz consistente, legible y fácil de navegar en Chromebook, escritorio y pantallas pequeñas. Evitar que ventanas, menús, avisos o paneles se tapen entre sí y asegurar que las acciones importantes siempre sean accesibles.

La interfaz del jugador y las herramientas de diagnóstico deben estar separadas. La importación de archivos, exportación de logs y exportación de replays son herramientas de desarrollo; no deben mezclarse con la navegación normal del jugador.

## Hallazgos de la auditoría del código

### Prioridad crítica

1. **Estadísticas postpartida con desplazamiento anidado.** El fondo del diálogo, el panel principal y la lista de jugadores tenían contenedores con scroll propios. El pie de acciones dependía de `sticky` dentro de esa composición. Esto puede hacer que el usuario desplace el contenedor equivocado y no alcance Exportar log / Jugar de nuevo / Menú principal en ventanas bajas. Se ha cambiado a una única región desplazable entre encabezado y pie fijo.
2. **Importación externa confundida con reproducción de partidas guardadas.** El botón principal "REPRODUCIR PARTIDA GUARDADA (.GCREPLAY)" estaba asociado a `input type="file"`; por eso abrirlo muestra el selector del sistema. No consulta IndexedDB. Se elimina del menú público. La importación se conserva únicamente en Herramientas de diagnóstico, visible en desarrollo.
3. **Jerarquía y capas de diálogos no unificadas.** Los overlays encontrados usan niveles dispares: `z-50`, `z-[70]`, `z-[80]`, `z-[90]`, `z-[100]`, `z-[110]`, `z-[115]`, `z-[116]`, `z-[120]` y `z-[121]`. Aunque algunos diálogos deben estar por encima de otros, no existe una escala documentada y centralizada, lo que dificulta razonar sobre solapamientos.

### Prioridad alta

4. **Scroll vertical duplicado en pantallas de configuración.** Setup, Draft, Pase y juega, Campaña y Roster tenían scroll en el contenedor de página y/o en un segundo contenedor de contenido. Se retira el scroll anidado en esos paneles; el desplazamiento principal corresponde a la página.
5. **Menú principal demasiado largo y con funciones mezcladas.** El flujo de importar un replay ocupaba el mismo nivel visual que jugar, seleccionar equipo y consultar contenido. El acceso a repeticiones se presenta como "MIS PARTIDAS · VER REPETICIONES".
6. **Resumen postpartida no prioriza acciones.** El contenido estadístico podía desplazar fuera de vista las acciones. Encabezado, contenido y acciones pasan a ser tres zonas diferenciadas.

### Prioridad media

7. **Reglas de layout diferentes entre pantallas.** Las pantallas usan combinaciones propias de `min-h-screen`, `justify-between`, paddings, anchos y fondos. Se introduce una clase base `gc-screen` y se aplica a las pantallas principales.
8. **Accesibilidad y selección de texto.** El estilo base deshabilitaba la selección de texto de forma global. Se restablece la selección dentro de pantallas de contenido, se añade un foco visible para teclado y se respeta `prefers-reduced-motion`.
9. **Áreas táctiles pequeñas.** Se establecen objetivos de al menos 44 px para botones del menú y controles en dispositivos táctiles.
10. **Listas internas con altura limitada.** Online Lobby y Enciclopedia usan listas acotadas y desplazables. Son válidas cuando el scroll es deliberadamente local, pero deben probarse en pantallas bajas para que no queden atrapadas dentro de otro scroll.

## Inventario de pantallas revisadas

| Pantalla | Observaciones principales |
|---|---|
| TitleScreen | Menú vertical largo; distribución `justify-between`; mezcla de navegación y herramientas técnicas. |
| SetupScreen | Página y contenido con scroll; pie de acciones sticky. |
| DraftScreen | Página y panel principal con scroll; aviso fijo superior que puede competir con el encabezado. |
| PassAndPlaySetupScreen | Contenido con scroll dentro de página. |
| CampaignScreen | Contenido con scroll dentro de página. |
| RosterScreen | Contenido con scroll dentro de página y tarjetas con elementos superpuestos. |
| EncyclopediaScreen | Filtros horizontales y lista con altura máxima/scroll propio. |
| OnlineLobbyScreen | Pantalla extensa; listas de escuadrón e historial con altura limitada. |
| ArenaScreen | Alta densidad de controles y prompts; overlays de diferentes niveles; arena completa deshabilitada al finalizar partida mientras el resumen se monta en portal. |
| ReplayArchiveScreen | Biblioteca local separada de la importación externa; las acciones técnicas deben distinguirse de las del jugador. |

## Inventario de diálogos y overlays revisados

Se inspeccionaron patrones de posición, z-index, overflow y altura en:
- AuraShopModal, DailyMissionsModal, DownloadApkModal, InteractiveTacticalTutorial, TutorialModal.
- CrateOpeningModal, CinematicCutsceneModal, CupShakeIntroModal, DiceRollModal, DiceSpecialChoiceModal.
- CubinarcaOrderModal, CubinjaTransferModal, HeroAbilityModal, MorphFormSelectionModal, MorphInventoryChoiceModal.
- RacubiteroLootModal, ReactionModal, SupplyMagicModal, TramcubosoCardChoiceModal, TramcubosoRerollModal.
- Model3DViewerModal, PostMatchStatsModal y los overlays de ArenaScreen.

No todos los diálogos son defectuosos; muchos tienen una región interna de scroll intencional. Deben migrarse gradualmente a una estructura uniforme para evitar regresiones de capas y navegación.

## Sistema de diseño propuesto

### Reglas de layout

- Una página tiene un único scroll vertical principal.
- Un diálogo tiene encabezado y acciones fuera de su única región desplazable.
- Ningún botón principal depende de un scroll interior difícil de descubrir.
- Los overlays ocupan el viewport visible (`dvh/svh`) y respetan áreas seguras.
- Las listas con scroll local se reservan para contenido claramente delimitado.
- Los avisos temporales no deben tapar navegación ni encabezados.

### Capas

Escala de referencia añadida como tokens CSS:
- Página: 0.
- Elementos flotantes y ayudas: 30.
- Diálogo normal: 80.
- Diálogo secundario / decisiones: 100.
- Decisiones críticas y transformaciones: 120.
- Notificaciones: 140.

Los componentes deben migrar a esta escala en una fase posterior, verificando primero qué diálogos pueden abrir otros diálogos.

### Accesibilidad

- Foco de teclado visible.
- Controles táctiles de tamaño suficiente.
- Texto seleccionable en zonas de lectura.
- Animación reducida cuando el sistema lo solicita.
- Contraste y etiquetas accesibles para acciones importantes.
- Pruebas de teclado, toque y navegación a baja altura.

### Separación jugador / desarrollo

| Función | Jugador | Desarrollo |
|---|---:|---:|
| Ver partidas guardadas localmente | Sí | Sí |
| Reproducir una partida guardada | Sí | Sí |
| Eliminar una partida | Sí | Sí |
| Importar un .gcreplay externo | No | Sí |
| Exportar .gclog.txt | No | Sí |
| Exportar .gcreplay | No | Sí |

El jugador entra en **Mis partidas** y reproduce una partida del archivo local. Las acciones de diagnóstico se muestran solo en builds de desarrollo.

## Cambios incluidos en esta primera fase

- Se elimina el selector de archivos del menú público.
- Se mueve la importación externa a un bloque de herramientas de diagnóstico dentro de Mis partidas.
- Se presenta el archivo local al jugador como **Mis partidas** y la acción primaria como **Ver repetición**.
- Se ocultan exportaciones técnicas en builds de producción; se conservan en desarrollo.
- El resumen postpartida usa una sola región de scroll y mantiene acciones fuera de ella.
- Se añade una base CSS de layout, foco visible, áreas táctiles, safe areas y movimiento reducido.
- Se aplica la clase base de pantalla a las pantallas principales.
- Se retiran scrolls internos duplicados de Setup, Draft, Pase y juega, Campaña y Roster.

## Trabajo pendiente para completar el rediseño

1. Migrar sistemáticamente todos los diálogos a la estructura de encabezado / cuerpo desplazable / pie de acciones.
2. Normalizar la escala z-index y documentar cada overlay que puede abrir otro.
3. Reorganizar la pantalla de inicio en grupos claros: jugar, modos, biblioteca y colección/manual.
4. Revisar el aviso fijo superior de Draft y convertirlo en un estado que no cubra el encabezado.
5. Mejorar la distribución de Arena para escritorio, Chromebook y móvil sin perder controles de combate.
6. Revisar todas las tarjetas, pestañas, formularios, listas y estados vacíos.
7. Añadir pruebas de componentes para scroll, foco y acciones de diálogos.
8. Ejecutar una validación visual en resoluciones 360×640, 768×1024, 1366×768 y 1920×1080; revisar orientación vertical/horizontal, zoom 200%, teclado y toque.

## Criterios de aceptación

- Ningún control principal queda cubierto por otro panel.
- Los botones de postpartida son accesibles sin importar la altura del viewport.
- El jugador nunca ve un selector de archivo para reproducir sus propias partidas.
- Una repetición local se abre directamente desde Mis partidas.
- No hay más de un scroll vertical por página ni más de un scroll principal por diálogo.
- Las capas de overlays siguen una escala explícita y las ventanas anidadas se muestran en el orden correcto.
- Build, TypeScript, pruebas unitarias y pruebas manuales visuales pasan.

## Alcance de la validación

Esta auditoría se basa en inspección estática del código de la rama base y de los componentes. No equivale a una prueba visual ejecutada en un navegador real. La CI debe validar compilación y tipos; la revisión en Google AI Studio debe verificar los tamaños de viewport y los recorridos de usuario indicados.
