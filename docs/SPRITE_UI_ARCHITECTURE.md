# Arquitectura de interfaz basada en sprites — Guerra Cúbita

## Propósito

Preparar toda la interfaz para que su apariencia final pueda construirse y sustituirse mediante piezas gráficas independientes, sin reescribir el comportamiento React ni las reglas del juego.

La arquitectura organiza la interfaz con una jerarquía clara de pantallas, paneles, cartas, botones e iconografía reutilizable. Las referencias anteriores se consideran únicamente estructurales y no fijan el estilo artístico. La dirección visual final será original y estará inspirada en manualidades callejeras; sus materiales, texturas, paleta y tratamiento gráfico se definirán en una fase de arte posterior.

## Adaptación técnica al proyecto

Guerra Cúbita está construida con React, TypeScript y Vite; no usa Unity ni Canvas de Unity. Por ello se adopta la misma intención visual con tecnologías nativas de la web:

1. **Sprites vectoriales SVG:** iconos, botones, marcos, paneles, cartas, insignias, retratos, slots y bandas. Las piezas se escalan con SVG.
2. **Atlas de símbolos SVG:** los iconos se definen una sola vez en `public/assets/ui/gc-ui-atlas.svg` y se referencian desde React mediante `<use href="...#icon-id">`. El navegador puede reutilizar y cachear el atlas.
3. **Nine-slice / 9-slice:** los marcos extensibles se separan en esquinas, bordes y centro usando `border-image`. Así los bordes no necesitan estirarse como una imagen completa cuando cambia el tamaño del panel.
4. **Fondo seamless:** `gc-bg-tile.svg` es un módulo repetible de 192 × 192 px. Se desplaza diagonal y lentamente con `gc-sprite-drift`; el recorrido vuelve al mismo punto de repetición.
5. **Componentes de comportamiento:** `src/ui/SpriteUI.tsx` expone componentes reutilizables. Los eventos, accesibilidad, navegación y datos permanecen en React; el archivo SVG solo aporta la piel visual.

No se importa un plugin de Unity ni se añade una dependencia de terceros para este primer sistema.

## Estructura de archivos

```
public/
  assets/
    ui/
      gc-ui-atlas.svg
      gc-bg-tile.svg
      sprites/
        button-primary.svg
        button-secondary.svg
        button-danger.svg
        panel-frame.svg
        modal-frame.svg
        card-frame.svg
        portrait-frame.svg
        slot-frame.svg
        title-banner.svg
        tab-frame.svg
        badge-frame.svg
        progress-track.svg
        progress-fill.svg

src/
  ui/
    SpriteUI.tsx
    sprite-catalog.ts
```

## Catálogo y contrato visual

| Grupo | Sprite | Uso |
|---|---|---|
| Iconos | `gc-ui-atlas.svg#icon-*` | Navegación, acciones, combate, ajustes, colección y estados |
| Botones | `button-primary.svg` | Acción principal, CTA |
| Botones | `button-secondary.svg` | Acción estándar y navegación |
| Botones | `button-danger.svg` | Eliminar, abandonar o acción destructiva |
| Superficies | `panel-frame.svg` | Panel de información, sección y contenedor |
| Superficies | `modal-frame.svg` | Diálogos y ventanas |
| Cartas | `card-frame.svg` | Cartas de héroe, entradas de biblioteca y tarjetas |
| Retratos | `portrait-frame.svg` | Avatar, héroe, perfil |
| Slots | `slot-frame.svg` | Posición vacía de equipo, carta o equipamiento |
| Navegación | `tab-frame.svg` | Pestañas y filtros |
| Estado | `badge-frame.svg` | Rareza, equipo, estado y contadores |
| Marca | `title-banner.svg` | Título de pantalla o encabezado destacado |
| Carga | `progress-track.svg`, `progress-fill.svg` | Descarga, carga y progreso de operación |
| Fondo | `gc-bg-tile.svg` | Textura repetible con movimiento lento |

Los tamaños y nombres estables están registrados en `src/ui/sprite-catalog.ts`.

## División de la interfaz por familias de sprites

Esta es la separación que debe seguir cada pantalla. Los controles conservan sus callbacks y el modelo de datos; cada región visual consume un sprite de su categoría.

| Pantalla o flujo | Piezas independientes |
|---|---|
| Menú principal | fondo seamless, logo/title banner, retrato central, botones de modo, botones compactos, iconos de cabecera, insignias de Aura y misiones |
| Selección de equipo | fondo, title banner, panel de selección, portrait frame, card frame de personaje, badge de clase, slot vacío, botones atrás/continuar |
| Draft | tablero de selección, cartas de héroe, retratos, slot de equipo, badge de turno, banner de selección, botones de confirmar |
| Pase y juega | panel de jugador, retrato, slot de héroe, selector de participantes, pestaña de turno, botones de navegación |
| Campaña | banner de capítulo, card de misión, portrait frame de jefe, badge de progreso, botones de entrada y regreso |
| Lobby online | paneles de sala, card de jugador, portrait, insignias de estado/conexión, lista de invitación, botones de crear/unirse |
| Arena | panel de jugador, portrait, badge de equipo/vida/estado, slot de arma/carta, action button, dice icon, turn banner, selector y overlays de decisión |
| Roster / ADN | portrait frame, panel de ADN, insignias de clase, tabs de atributos, slots de categoría, botones de navegación |
| Enciclopedia | card frame, icono de categoría/rareza, tabs, panel de detalle, marco de carta, search field |
| Mis partidas | card frame de repetición, badge de resultado, play icon/button, delete button; acciones técnicas separadas |
| Estadísticas postpartida | modal frame, title banner, panel de equipo, portrait/player card, badges de métricas, botones del pie |
| Tutorial y manual | modal frame, title banner, panel de sección, tabs, card frame ilustrativo, botones atrás/siguiente |
| Tienda / misiones | panel frame, card de recompensa, badges de coste/estado, progress track/fill, botones de acción |
| Pantallas de carga | fondo seamless o splash propio, logo/title banner, icono animado, progress track/fill, texto de estado |

## Componentes React

`src/ui/SpriteUI.tsx` expone:

- `GcSpriteIcon`: símbolo del atlas, con tamaño y etiqueta opcional.
- `GcSpriteButton`: botón HTML real con estados visuales por sprite; mantiene `onClick`, disabled, type, aria-label y demás atributos nativos.
- `GcSpritePanel`: superficie extensible de panel.
- `GcSpriteCard`: marco de tarjeta reutilizable.
- `GcSpriteBadge`: insignia de estado.
- `GcSpriteBackdrop`: fondo decorativo no interactivo.
- `GcSpriteProgress`: barra accesible con rol progressbar y valor anunciado.
- `GcSpritePortrait`: marco de retrato.
- `GcSpriteSlot`: marco de hueco/ranura.
- `GcSpriteTitleBanner`: banda de título.

Las reglas CSS de sprites también dan una piel por defecto a los botones dentro de `.gc-screen` y `.gc-modal-overlay`; no es necesario sustituir el manejador de cada botón para poder cambiar su apariencia.

## Reemplazo posterior por arte final

El trabajo del artista puede reemplazar cada archivo manteniendo:
- nombre y ruta del sprite;
- `viewBox` de referencia;
- proporción lógica;
- centro seguro y márgenes del 9-slice;
- ID del símbolo en el atlas.

Los botones usan marcos de nueve segmentos; el área central puede crecer sin deformar los bordes. Los iconos usan `currentColor` para permitir recoloración desde CSS. Los retratos y cartas deben tener un área segura central para el personaje/ilustración, separada del marco decorativo.

Para pasar de placeholder a arte final:
1. Reemplazar los SVG de `public/assets/ui/sprites/`.
2. Mantener las rutas y los parámetros de slice en `sprite-catalog.ts`.
3. Sustituir o añadir símbolos en `gc-ui-atlas.svg`, respetando IDs.
4. Añadir arte raster solo para ilustraciones complejas que no convenga dibujar como vector. Mantenerlas como sprites independientes dentro de un atlas raster optimizado por familia, con manifiesto de recortes y densidades 1x/2x/3x.
5. No hornear textos traducibles dentro de los sprites; los textos, valores, nombres y números permanecen en HTML para ser legibles, localizables y accesibles.

## Reglas de animación del fondo

- El tile debe coincidir en sus cuatro bordes.
- Animar solo `background-position`, no crear un gran bitmap desplazándose por la pantalla.
- Velocidad por defecto: 72 s por ciclo; debe ser discreta y no competir con texto o juego.
- Respetar `prefers-reduced-motion`.
- El fondo es decorativo y `pointer-events: none`.

## Estado actual

Implementado en esta rama:

- Atlas SVG con **68 símbolos** únicos, sincronizados entre `gc-ui-atlas.svg`, el tipo `GcSpriteName` y `GC_SPRITE_CATALOG.iconSymbols`.
- 13 marcos vectoriales nine-slice: 3 botones, panel, modal, carta, retrato, slot, banner, tab, badge y 2 piezas de progreso.
- Fondo seamless de 192 × 192 px y animación lenta respetando movimiento reducido.
- Componentes React: `GcSpriteIcon`, `GcSpriteButton`, `GcSpritePanel`, `GcSpriteCard`, `GcSpriteBadge`, `GcSpritePortrait`, `GcSpriteSlot`, `GcSpriteTitleBanner`, `GcSpriteProgress` y `GcRasterSprite`.
- Iconografía migrada al atlas en los **36 módulos de la aplicación** que antes importaban iconos de Lucide. La inspección de esta rama no encontró imports `lucide-react` en esos módulos.
- Marcos de tarjeta aplicados en selección de héroes, Draft/Setup compartidos, Arena (mano), Enciclopedia, Lobby Online y resultado postpartida.
- Paneles sprite aplicados al vaso de selección, a la búsqueda/sala online y a la presentación de capítulo; el retrato del jefe usa `GcSpritePortrait`.
- Las ventanas de dados, reacciones, habilidades, recompensas, tienda, progresión, tutorial, cinemática, audio y utilidades usan los símbolos compartidos.
- `docs/SPRITE_ART_PRODUCTION_MANUAL.md` contiene el inventario para producción física, escaneo, limpieza de fondo, atlas y entrega de recursos.

Todavía no existen atlas PNG/WebP de arte manual ni coordenadas reales para ellos. `GcRasterSprite` es la base de recorte, pero el manifiesto de coordenadas se completará cuando llegue el primer atlas raster aprobado.

Trabajo pendiente:

- Sustituir progresivamente los placeholders vectoriales por arte manual original conservando IDs, viewBox y cortes nine-slice.
- Producir los 13 retratos/ilustraciones de héroe y las 50 ilustraciones de carta si se decide que cada carta tendrá arte propio.
- Crear fondos finales de menú, arena y lobby, más cualquier fondo específico de capítulo.
- Definir si las vistas de dados 3D se mantienen o si se quiere una futura versión 2D; los modelos 3D actuales siguen funcionando.
- Añadir pantallas de carga que utilicen las barras de progreso existentes.
- Revisión visual manual en navegador a 360×640, 768×1024, 1366×768 y 1920×1080.

## Criterios de aceptación

- Cambiar los archivos SVG de sprites no exige cambiar lógica de juego.
- Todos los botones mantienen su comportamiento y estados.
- Todos los iconos del atlas tienen IDs únicos y se muestran desde React.
- Los marcos de panel, cartas, retratos y botones no deforman sus bordes al redimensionarse.
- El fondo repite sin costura visible y se detiene con movimiento reducido.
- Ningún texto funcional, dato de jugador ni label queda incrustado en una imagen.
- Build y TypeScript pasan; el flujo completo se prueba en navegador.
