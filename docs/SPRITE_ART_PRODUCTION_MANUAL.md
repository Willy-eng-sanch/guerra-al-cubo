# Manual de producción de sprites artesanales — Guerra Cúbita

**Versión:** 1.0  
**Base técnica:** React + TypeScript + Vite  
**Catálogo actual:** 68 símbolos SVG, 13 marcos vectoriales y 1 fondo repetible  
**Dirección artística de trabajo:** manualidades callejeras, collage y materiales hechos a mano  
**Estado:** especificación para producir y entregar arte original; no fija todavía una paleta final.

---

## 1. Para qué sirve este documento

Este manual es la lista de producción para que puedas dibujar físicamente las piezas de la interfaz, fotografiarlas o escanearlas, convertirlas en PNG con transparencia, construir atlas y entregarlas listas para integrar.

La regla principal es que **no debes dibujar una pantalla completa como una sola imagen**. Cada elemento tiene que poder sustituirse sin rehacer la pantalla ni alterar el comportamiento del juego.

Por ejemplo, el botón de «Jugar» no es una captura con texto: es un marco/sprite de botón, un icono independiente y un texto HTML. Una carta se compone de marco, ilustración, insignias y texto por separado.

El arte final debe conservar las proporciones y los identificadores que se describen aquí. El código ya contiene la arquitectura para consumir esos recursos.

## 2. Dirección artística: manualidades callejeras

La expresión «manualidades callejeras» se toma como una dirección de exploración, no como un estilo cerrado. La propuesta de vocabulario visual es:

- Cartón corrugado, cartulina, papel periódico, papel rasgado y papel reciclado.
- Cinta adhesiva, cinta de enmascarar, parches, retazos de tela, grapas y costuras visibles.
- Tinta, marcador grueso, pintura aplicada a mano, sellos, esténcil y pegatinas.
- Bordes irregulares, dobleces, capas superpuestas, manchas controladas y pequeñas imperfecciones físicas.
- Símbolos dibujados a mano, numeración manual y marcas de taller, sin perder legibilidad.

No hace falta usar todos esos materiales a la vez. Conviene definir una gramática consistente: dos o tres materiales dominantes para los marcos, una familia de trazos para los iconos y una textura limitada para los fondos. La paleta, los materiales definitivos y el grado de desgaste se decidirán al revisar las primeras pruebas físicas.

**Criterio de lectura:** incluso una pieza muy texturizada debe conservar una silueta clara cuando se vea pequeña. No pongas textura fina donde el juego la reducirá a 12–24 píxeles.

## 3. Arquitectura actual y qué debes diseñar

### 3.1 Atlas de iconos: 68 símbolos

Archivo actual: `public/assets/ui/gc-ui-atlas.svg`  
Componente: `src/ui/SpriteUI.tsx` → `GcSpriteIcon`  
Catálogo: `src/ui/sprite-catalog.ts`

Los 68 iconos usan un `viewBox` de 48 × 48 unidades. Dibuja cada icono en un lienzo cuadrado, centrado y con margen de seguridad. No pegues etiquetas ni palabras dentro del icono.

**Grupo A — 33 iconos esenciales**

| ID | Qué debes dibujar | Dónde se utiliza |
|---|---|---|
| `icon-dice` | Dado cúbico | Selección de dados, vaso y juego |
| `icon-swords` | Dos armas cruzadas | Combate, ataque y cartas |
| `icon-shield` | Escudo | Defensa, bloqueo y protección |
| `icon-history` | Reloj/flecha de historial | Registro y repeticiones |
| `icon-trophy` | Trofeo | Resultado, logros y clasificación |
| `icon-players` | Dos figuras | Jugadores y participantes |
| `icon-cards` | Cartas superpuestas | Mazo, mano y colección |
| `icon-book` | Libro abierto | Manual y tutorial |
| `icon-home` | Casa | Volver al inicio |
| `icon-play` | Triángulo de reproducir | Iniciar y reproducir |
| `icon-back` | Flecha izquierda | Regresar |
| `icon-close` | Cruz de cerrar | Cerrar diálogos |
| `icon-check` | Marca de confirmación | Selección y estados completados |
| `icon-store` | Puesto/tienda | Tienda |
| `icon-calendar` | Calendario | Misiones y fechas |
| `icon-spark` | Destello | Habilidad, efecto y destacado |
| `icon-volume` | Altavoz | Sonido |
| `icon-settings` | Engranaje | Configuración |
| `icon-delete` | Papelera | Eliminar |
| `icon-download` | Flecha hacia abajo | Descargar/exportar |
| `icon-info` | Información | Ayudas y detalles |
| `icon-warning` | Señal de advertencia | Errores y alertas |
| `icon-chevron` | Flecha de avance | Despliegues y navegación |
| `icon-folder` | Carpeta | Archivo |
| `icon-lock` | Candado | Bloqueo y contenido cerrado |
| `icon-map` | Mapa plegado | Ubicación y campaña |
| `icon-flame` | Llama | Racha y energía |
| `icon-zap` | Rayo | Energía y acción rápida |
| `icon-help` | Signo de pregunta | Ayuda |
| `icon-arrow-right` | Flecha derecha | Avanzar y transferir |
| `icon-plus` | Signo más | Añadir |
| `icon-search` | Lupa | Buscar en enciclopedia |
| `icon-star` | Estrella | Rareza y favorito |

**Grupo B — 17 estados, comunicación y resultados**

| ID | Qué debes dibujar | Dónde se utiliza |
|---|---|---|
| `icon-chart` | Gráfico de barras | Estadísticas |
| `icon-wifi` | Señal inalámbrica | Estado de conexión |
| `icon-copy` | Dos hojas superpuestas | Copiar código |
| `icon-message` | Globo de diálogo | Mensajes y comunicación |
| `icon-radio` | Radio/comunicador | Lobby online |
| `icon-package` | Paquete/caja | Cajas, inventario y recompensas |
| `icon-coins` | Monedas apiladas | Moneda y recompensas |
| `icon-gift` | Regalo | Premios |
| `icon-refresh` | Flechas de actualización | Reintentar y repetir |
| `icon-crown` | Corona | MVP y jerarquía |
| `icon-exit` | Puerta/salida | Salir de la partida |
| `icon-fast-forward` | Doble triángulo | Velocidad 2x |
| `icon-eye` | Ojo | Ver/inspeccionar |
| `icon-award` | Medalla | Distinción |
| `icon-skull` | Calavera | Eliminación |
| `icon-heart` | Corazón | Vida y salud |
| `icon-file` | Documento | Registro y archivo |

**Grupo C — 18 audio, ajustes y acciones específicas**

| ID | Qué debes dibujar | Dónde se utiliza |
|---|---|---|
| `icon-frost` | Copo de hielo | Congelación |
| `icon-phone` | Teléfono móvil | Descarga e instalación |
| `icon-external-link` | Flecha que sale de un cuadro | Enlace externo |
| `icon-terminal` | Ventana de terminal | Herramientas técnicas |
| `icon-share` | Tres puntos conectados | Compartir |
| `icon-clock` | Reloj | Tiempo y duración |
| `icon-trend` | Línea ascendente | Progresión |
| `icon-shield-off` | Escudo tachado | Desprotección |
| `icon-cube` | Cubo en perspectiva | Modelos 3D |
| `icon-sliders` | Controles deslizantes | Ajustes de audio |
| `icon-music` | Nota musical | Música |
| `icon-volume-off` | Altavoz silenciado | Silenciar |
| `icon-mic` | Micrófono | Micrófono |
| `icon-mic-off` | Micrófono tachado | Micrófono apagado |
| `icon-pause` | Dos barras | Pausar |
| `icon-disc` | Disco | Pista/medio de audio |
| `icon-target` | Diana | Selección de objetivo |
| `icon-hand` | Mano abierta | Orden/acción manual |

**Cómo dibujarlos:** crea primero una familia maestra de trazos: grosor consistente, esquinas y terminaciones compatibles, misma perspectiva y un nivel de detalle equivalente. Si un icono necesita una versión sólida y otra de contorno, deben compartir la misma silueta.

### 3.2 Marcos y superficies: 13 sprites

Estas piezas son las más importantes para empezar porque se reutilizan por muchas pantallas. Todas son marcos extensibles mediante nine-slice: las esquinas quedan protegidas y el borde/centro puede crecer para adaptarse al texto y al tamaño de pantalla.

| Nombre de archivo | Lienzo lógico | Corte nine-slice | Zona central estirable | Uso |
|---|---:|---:|---:|---|
| `button-primary.svg` | 96 × 96 | 26 | 44 × 44 | Acción principal: jugar, iniciar, confirmar |
| `button-secondary.svg` | 96 × 96 | 26 | 44 × 44 | Volver, cancelar, navegación |
| `button-danger.svg` | 96 × 96 | 26 | 44 × 44 | Eliminar, abandonar, acción destructiva |
| `panel-frame.svg` | 180 × 180 | 34 | 112 × 112 | Paneles de contenido y selección |
| `modal-frame.svg` | 180 × 180 | 34 | 112 × 112 | Ventanas emergentes |
| `card-frame.svg` | 160 × 200 | 32 | 96 × 136 | Cartas, jugadores y tarjetas de biblioteca |
| `portrait-frame.svg` | 160 × 160 | 30 | 100 × 100 | Retratos de héroes, jefes y jugadores |
| `slot-frame.svg` | 128 × 128 | 28 | 72 × 72 | Huecos de dados, equipo, cartas e inventario |
| `title-banner.svg` | 180 × 100 | 26 | 128 × 48 | Cintas de título y encabezados |
| `tab-frame.svg` | 128 × 72 | 24 | 80 × 24 | Pestañas y filtros |
| `badge-frame.svg` | 128 × 72 | 20 | 88 × 32 | Rareza, estado, equipo y contadores |
| `progress-track.svg` | 120 × 48 | 20 | 80 × 8 | Fondo de barra de progreso |
| `progress-fill.svg` | 120 × 48 | 20 | 80 × 8 | Relleno de barra de progreso |

Rutas actuales: `public/assets/ui/sprites/`. La cifra de corte es la que está registrada en el catálogo y sincronizada con el uso actual de botones. El ancho visible del borde en CSS es otra medida distinta: no lo confundas con el corte del archivo fuente.

**Reglas para dibujar nine-slice:**
1. Dibuja primero las cuatro esquinas; son la zona que no debe deformarse.
2. Los tramos superior/inferior y laterales deben poder estirarse sin mostrar cortes bruscos.
3. El centro debe ser sencillo: papel, cartón, tela o una textura repetible. No pongas dibujos importantes en esa zona.
4. No pongas palabras, cifras, nombres, coste, vida o rareza dentro del marco.
5. Conserva exactamente el lienzo y los cortes de la tabla cuando se sustituya el arte.
6. No recortes el PNG hasta los bordes opacos ni lo gires dentro de un atlas. Para nine-slice se necesita conservar el rectángulo completo, la transparencia y el origen.

### 3.3 Fondo repetible

Archivo actual: `public/assets/ui/gc-bg-tile.svg`.  
Tamaño lógico: 192 × 192 px.  
Uso: textura ambiental continua en pantallas principales.

Debes diseñar un módulo cuadrado que se pueda repetir infinitamente: el borde izquierdo tiene que conectar con el derecho, y el superior con el inferior. No dibujes un objeto protagonista grande en el tile. Las texturas posibles son cartón, papel pegado, pintura, fotocopia, manchas y marcas discretas.

El fondo de menú, lobby y arena puede ser una ilustración de pantalla completa independiente; no sustituyas ese fondo por el tile. El tile solo aporta textura de repetición.

## 4. Mapa de pantallas: qué pieza va en qué lugar

| Pantalla / componente | Piezas que debes diseñar | Dónde aparece en el juego |
|---|---|---|
| Menú principal — `TitleScreen.tsx` | Banner/logo independiente, marcos de botones, insignias de racha/aura, iconos de menú, textura de fondo | Entrada del juego; accesos a jugar, campaña, roster, colección, online y partidas |
| Selección — `SetupScreen.tsx` | Marco de panel/vaso, carta de héroe, slots de dados, insignias de clase y botones | Elegir los tres dados antes del combate |
| Draft — `DraftScreen.tsx` | Carta de héroe, slots, insignias de selección y bloqueo, botones de confirmar | Reclutamiento y selección de equipo |
| Vaso — `DiceCupShaker.tsx` | Panel del vaso, icono de dado, señales de arrastre, slots de los dados | Contenedor donde se arrastran o añaden los dados |
| Carta de héroe — `HeroDiceCard.tsx` | Marco de carta, iconos de check/lock/añadir, insignias de clase | Tarjeta individual de cada héroe durante la selección |
| Campaña — `CampaignScreen.tsx` | Panel de capítulo, retrato de jefe, botones de capítulo y selección de héroe, insignias de progreso | Selección de capítulo, presentación del jefe y elección del jugador |
| Pase y juega — `PassAndPlaySetupScreen.tsx` | Panel de participantes, botones de cantidad de jugadores, slots de héroe y retratos | Configuración local para varios jugadores |
| Roster — `RosterScreen.tsx` | Retrato/frame de personaje, insignias de ADN, panel de habilidad y botones de vista 3D | Lista y ficha de los 13 cubos urbanos |
| Enciclopedia — `EncyclopediaScreen.tsx` | Marco de carta, insignia de rareza, pestañas, icono de búsqueda, iconos de tipo | Consulta de las 50 cartas oficiales |
| Lobby online — `OnlineLobbyScreen.tsx` | Tarjetas de héroes, panel de búsqueda, panel de sala, insignias de conexión, iconos de wifi/radio/copiar | Elegir equipo, buscar rival, compartir código y esperar en sala |
| Arena — `ArenaScreen.tsx` | Cartas de mano, paneles de HUD, insignias de vida/estado, iconos de historial/velocidad/manual/salida | Pantalla principal del combate |
| Anillo — `ArenaRing.tsx` | Estados de escudo, ataque, congelación y eliminación | Controles visuales cercanos a los dados 3D |
| Mazo — `GlobalDeckView.tsx` | Icono y placa del mazo, contador separado como texto | Pila general de cartas |
| Archivo — `ReplayArchiveScreen.tsx` | Marco de tarjeta de repetición, badge de resultado, botones de reproducción/exportación/eliminación | Biblioteca de partidas guardadas |
| Resultado — `PostMatchStatsModal.tsx` | Marco de jugador, retrato, indicadores de daño/bloqueo/cartas, insignia MVP y trofeo | Estadísticas al terminar una partida |

Los textos, nombres de jugadores, vidas, puntuaciones, códigos de sala, costes y descripciones siguen siendo texto HTML/React, no dibujos.

## 5. Diálogos y componentes secundarios

No necesitas diseñar una ventana completa distinta por cada habilidad. Los diálogos comparten el mismo marco modal, botones y atlas. Las ilustraciones internas son las que cambian.

| Familia | Archivos del proyecto | Sprite específico |
|---|---|---|
| Tiradas y elecciones | `DiceRollModal.tsx`, `DiceSpecialChoiceModal.tsx`, `TramcubosoRerollModal.tsx` | Dado, escudo, rayo, cartas, refrescar |
| Reacciones y habilidades | `ReactionModal.tsx`, `HeroAbilityModal.tsx`, `CubinarcaOrderModal.tsx`, `CubinjaTransferModal.tsx` | Escudo, espadas, objetivo, mano, flechas |
| Inventario y recompensas | `SupplyMagicModal.tsx`, `RacubiteroLootModal.tsx`, `CrateOpeningModal.tsx`, `MorphInventoryChoiceModal.tsx` | Paquete, regalo, monedas, añadir, check |
| Progresión | `AuraShopModal.tsx`, `DailyMissionsModal.tsx` | Corona, corazón, trofeo, calendario, reloj, tendencia |
| Tutorial y cinemática | `TutorialModal.tsx`, `InteractiveTacticalTutorial.tsx`, `FTUECombatGuide.tsx`, `CinematicCutsceneModal.tsx`, `CupShakeIntroModal.tsx` | Libro, ayuda, advertencia, dado, avanzar/cerrar |
| Instalación y utilidades | `DownloadApkModal.tsx`, `Model3DViewerModal.tsx` | Teléfono, descarga, terminal, compartir, cubo, ojo, sliders |
| Audio | `AudioControlBar.tsx` | Música, altavoz, silenciar, micrófono, pausa, disco, sliders |

Todos esos iconos ya están referenciados desde el atlas. El acabado artesanal todavía no se ha aplicado a los dibujos; los símbolos actuales son placeholders vectoriales funcionales.

## 6. Qué dibujar físicamente: inventario de producción

Orden recomendado de trabajo:

### Lote 1 — Identidad del sistema
- 3 marcos de botón: principal, secundario y peligro.
- 1 marco de panel.
- 1 marco modal.
- 1 marco de carta.
- 1 marco de retrato.
- 1 marco de slot.
- 1 banner de título.
- 1 marco de pestaña.
- 1 marco de badge.
- 2 piezas de progreso: pista y relleno.
- 1 tile de fondo seamless.

**Total: 13 marcos + 1 fondo.** Diseña primero estos recursos porque multiplican su uso en las pantallas.

### Lote 2 — Iconos
- 68 símbolos, uno por cada ID de las tablas de la sección 3.1.
- Puedes empezar con los 33 esenciales y después completar los 35 restantes.
- Dibuja cada símbolo en una hoja individual o en una lámina con separación suficiente; la hoja de dibujo no debe convertirse directamente en la hoja final del atlas sin recortar y etiquetar cada recurso.

### Lote 3 — Arte de contenido
- 13 ilustraciones/retratos de los cubos urbanos, si decides sustituir o complementar los avatares actuales.
- 50 ilustraciones de carta si cada carta oficial tendrá arte único. Cada dibujo debe llevar un ID de carta en el registro de producción, no el nombre pintado dentro de la imagen.
- 1 fondo de menú, 1 fondo de arena y 1 fondo de lobby si deseas diferenciarlos.
- Fondos de capítulo adicionales solo cuando haya una escena realmente distinta.
- Ilustraciones de jefe, recompensa, caja o artículo que necesiten una imagen propia.

**Importante sobre los personajes:** la arena y varios componentes todavía utilizan `Cube3DCanvas` y `Dice3DVisual`. Los retratos y marcos 2D pueden complementar esas vistas. No tienes que redibujar los modelos 3D para que esta fase funcione; reemplazarlos sería un proyecto posterior independiente.

### Lote 4 — Efectos y animación (opcional)
- Impacto, polvo, destello, chispa, golpe, papel rasgado, cinta que aparece, confeti y aura.
- Si una animación requiere varios cuadros, dibuja todos sobre el mismo lienzo lógico y conserva el mismo punto de apoyo.
- No mezcles frames de animación con los iconos estáticos de interfaz.

## 7. Tamaños de trabajo recomendados

El juego usa tamaños CSS pequeños y marcos 9-slice. Para dibujar a mano, conviene crear originales con más resolución que el tamaño final.

| Tipo | Tamaño lógico aproximado | Original digital recomendado |
|---|---:|---:|
| Icono | 48 × 48 | 192 × 192 px (4×) |
| Botón | 96 × 96 | 384 × 384 px (4×) |
| Badge/tab | 128 × 72 | 512 × 288 px (4×) |
| Slot | 128 × 128 | 512 × 512 px (4×) |
| Carta | 160 × 200 | 640 × 800 px (4×) |
| Retrato | 160 × 160 | 640 × 640 px (4×) |
| Panel/modal | 180 × 180 | 720 × 720 px (4×) |
| Banner | 180 × 100 | 720 × 400 px (4×) |
| Tile repetible | 192 × 192 | 768 × 768 px (4×) |
| Fondo de pantalla | 16:9 | 1920 × 1080 px como base |

Son objetivos prácticos de producción, no restricciones del navegador. Si el dibujo físico tiene mucha textura, conserva el escaneo de alta resolución y genera la versión de juego desde ese maestro.

## 8. Cómo dibujar, fotografiar o escanear

### Si trabajas en papel
1. Dibuja cada recurso separado, dejando margen alrededor.
2. Usa papel limpio y plano; evita pliegues donde deban quedar líneas rectas.
3. Escanea a 600 dpi en color cuando el dibujo tenga textura, lápiz o detalles pequeños. Para dibujos grandes y limpios, 300 dpi puede bastar.
4. Guarda el escaneo original como PNG o TIFF. No lo sobrescribas al editar.
5. Si el escáner solo produce JPG, conserva ese JPG como fuente, pero la imagen final con transparencia se exportará como PNG.

### Si usas el teléfono
1. Coloca el dibujo sobre una superficie plana y de color uniforme.
2. Pon la cámara exactamente paralela al papel, no en diagonal.
3. Usa la cámara principal a 1×; evita el gran angular y el zoom digital.
4. Ilumina desde dos lados con luz difusa. Evita sombras de la mano, brillos y reflejos.
5. Llena el encuadre sin cortar los bordes y activa la cuadrícula para mantener la perspectiva.
6. Haz una foto de prueba y revisa que las líneas no estén movidas ni desenfocadas.
7. Corrige la perspectiva y recorta el papel antes de quitar el fondo.

## 9. Quitar el fondo y crear el PNG transparente

### Ruta rápida: Photopea
Photopea ofrece la herramienta **Magic Cut**: marcas el objeto como primer plano y el área exterior como fondo, ajustas los bordes y aceptas el recorte. Después usa **File → Export As → PNG**. El PNG conserva transparencia; JPG no la conserva. Consulta la guía oficial: https://www.photopea.com/tuts/magic-cut-remove-image-background-online/

### Ruta de edición fina: GIMP
1. Abre la imagen y guarda una copia de trabajo `.xcf`.
2. Añade canal alfa a la capa antes de borrar: **Capa → Transparencia → Añadir canal alfa**.
3. Para fondo de un solo color, prueba selección difusa o selección por color.
4. Para bordes complejos, usa Selección de primer plano o una máscara de capa.
5. Invierte la selección cuando hayas seleccionado el fondo y bórralo o enmascáralo.
6. Exporta como PNG y vuelve a abrir ese PNG para comprobar que la transparencia sigue presente.

Guía de GIMP: https://docs.gimp.org/2.8/en/gimp-tutorial-quickie-separate.html

### Control de calidad del recorte
- Comprueba el sprite sobre un fondo blanco y después sobre negro o magenta.
- Busca halos blancos, sombras del papel, bordes mordidos y píxeles sueltos.
- No borres todas las zonas blancas automáticamente: la pintura blanca dentro del dibujo puede ser parte del personaje.
- Conserva el archivo editable por capas (`.xcf`, `.psd` o equivalente) además del PNG final.
- Usa PNG RGBA para conservar transparencia. No entregues JPG como sprite final.

## 10. Empaquetar los PNG en un atlas

Para generar una hoja de sprites puedes usar SpritePacker: https://spritepacker.app/

La página indica que el empaquetado se ejecuta localmente en el navegador, sin enviar las imágenes a un servidor; admite exportación de PNG y datos JSON del atlas. Los límites y formatos pueden cambiar, así que revisa la interfaz al usarlo.

**Ajustes recomendados para Guerra Cúbita:**
- Formato de imagen: PNG con transparencia.
- Separación entre sprites (*padding*): 2–4 px.
- Extrusión del borde (*extrude*): 1–2 px cuando se use filtrado/escala para reducir halos de colores vecinos.
- Rotación de sprites: desactivada, porque el recorte actual calcula coordenadas rectangulares normales.
- Recorte de transparencia (*trim*): sí para ilustraciones independientes, pero conserva los datos de tamaño original y desplazamiento.
- Para marcos nine-slice: no recortar, no rotar y no perder el lienzo original. Lo más seguro es mantener estos 13 marcos como archivos separados.

SpritePacker explica el problema de *texture bleeding*, padding, extrusión y pérdida de alineación al recortar animaciones aquí: https://spritepacker.app/blog/sprite-sheet-export-troubleshooting

Como alternativa más avanzada, TexturePacker documenta los parámetros `padding`, `extrude`, `trim-mode` y `trim-margin`: https://www.codeandweb.com/texturepacker/documentation/commandline/parameters

## 11. Cómo se conecta el atlas al código

El componente existente `src/ui/RasterSprite.tsx` usa estos datos para recortar un sprite raster:

```ts
{
  atlas: '/assets/ui/atlas/gc-characters.png',
  x: 0,
  y: 0,
  width: 192,
  height: 192,
  atlasWidth: 2048,
  atlasHeight: 2048
}
```

Cada coordenada se toma del JSON que genera la herramienta de atlas. No inventes las coordenadas a ojo.

La aplicación mantiene una diferencia entre:
- **Icono vectorial:** `GcSpriteIcon name="icon-dice"` → busca el ID dentro de `gc-ui-atlas.svg`.
- **Sprite raster:** `GcRasterSprite frame={...}` → usa atlas PNG/WebP y coordenadas.
- **Marco nine-slice:** `GcSpriteCard`, `GcSpritePanel`, `GcSpritePortrait`, etc. → usa una imagen de borde extensible.

Para incorporar tu primer atlas raster hará falta completar el manifiesto con los nombres y coordenadas exportados. El componente de recorte ya existe; el manifiesto de las ilustraciones todavía se creará cuando tengamos el primer atlas real. No es necesario modificar las mecánicas para hacer esa integración.

## 12. Convención de nombres y carpetas

Nombres cortos, sin espacios, minúsculas y un ID estable:

- Iconos: `icon_dice.png`, `icon_swords.png`, `icon_wifi.png`.
- Marcos: `frame_button_primary.png`, `frame_panel.png`, `frame_card.png`.
- Personajes: `hero_cubogro_portrait.png`, `hero_cubinja_portrait.png`.
- Cartas: `card_001_art.png`, `card_002_art.png`.
- Fondos: `bg_menu_01.png`, `bg_arena_01.png`, `bg_tile_street_01.png`.
- Efectos: `fx_impact_01.png`, `fx_paper_spark_01.png`.

Estructura de trabajo sugerida:

```text
art-source/
  hand-drawn/          # originales físicos y escaneos sin tocar
  cleaned/             # recortes PNG transparentes
  layered/             # proyectos XCF/PSD/KRA editables
  atlases/
    gc-ui-icons.png
    gc-ui-icons.json
    gc-heroes.png
    gc-heroes.json
    gc-card-art.png
    gc-card-art.json
public/
  assets/ui/
    sprites/            # marcos nine-slice finales
    atlas/              # atlas PNG/WebP listos para cargar
src/ui/
  raster-sprite-manifest.ts
```

## 13. Cómo entregar cada lote para integrarlo

Cuando termines una tanda, entrega:
1. El PNG final con transparencia por cada recurso.
2. El proyecto editable por capas o el escaneo original.
3. El PNG del atlas generado.
4. El JSON de coordenadas del atlas.
5. Una hoja de vista previa con los nombres de todos los sprites.
6. Una nota que indique qué piezas son nuevas y cuáles reemplazan placeholders existentes.

No cambies un nombre de ID sin avisar. Si el recurso reemplaza `icon-dice`, debe seguir identificándose como `icon-dice`; así no hay que buscar cada uso en las pantallas.

## 14. Orden recomendado para producir sin retrabajo

1. **Primero:** los 13 marcos y el fondo seamless.
2. **Segundo:** los 33 iconos esenciales.
3. **Tercero:** paneles, tarjetas, insignias y retratos en una primera prueba física; integrarlos y comprobar escalado.
4. **Cuarto:** los 35 iconos avanzados.
5. **Quinto:** los 13 retratos de héroes y las 50 ilustraciones de carta, si decides que cada carta tendrá ilustración propia.
6. **Sexto:** fondos de menú/arena/lobby y efectos animados.

No dibujes las 50 cartas antes de validar un marco de carta completo con texto real. Primero produciremos una carta piloto, comprobaremos la legibilidad, y después replicaremos el sistema.

## 15. Lista de aceptación de cada sprite

- [ ] El nombre y el ID coinciden con el catálogo.
- [ ] El archivo es PNG RGBA si necesita transparencia.
- [ ] No hay papel, sombras ni halos residuales en el borde.
- [ ] La silueta se entiende en tamaño pequeño.
- [ ] El sprite se abre sobre fondos claros y oscuros sin artefactos.
- [ ] El recorte mantiene el tamaño y punto de apoyo esperados.
- [ ] No contiene texto funcional que debería seguir siendo HTML.
- [ ] Si es nine-slice, mantiene lienzo, corte, orientación y esquinas seguras.
- [ ] Si pertenece a un atlas, conserva el JSON y las coordenadas.
- [ ] No tiene una licencia o material de terceros que impida usarlo en Guerra Cúbita.

---

## Fuentes de herramientas consultadas

- Photopea, guía oficial de Magic Cut y exportación PNG: https://www.photopea.com/tuts/magic-cut-remove-image-background-online/
- GIMP, guía oficial para separar un objeto del fondo y añadir transparencia: https://docs.gimp.org/2.8/en/gimp-tutorial-quickie-separate.html
- SpritePacker, página y formatos actuales de exportación: https://spritepacker.app/
- SpritePacker, padding, extrusión y artefactos de borde: https://spritepacker.app/blog/sprite-sheet-export-troubleshooting
- TexturePacker, parámetros de padding, extrude y trim: https://www.codeandweb.com/texturepacker/documentation/commandline/parameters

Las capacidades, límites y nombres de herramientas de terceros pueden cambiar. Las dimensiones del catálogo y los nombres de archivo del proyecto son la especificación que debe mantenerse al integrar el arte.
