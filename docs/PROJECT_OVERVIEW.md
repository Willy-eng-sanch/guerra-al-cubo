# Visión y alcance del proyecto

## 1. Identidad pública

**Nombre público elegido:** Guerra al Cubo — Guerra Cúbita.  
**Identificadores históricos en código y documentación:** Guerra Cúbita / `guerra-cubita`.

El nombre público combina la denominación de presentación con el nombre histórico del juego. No se renombrarán carpetas, paquetes, clases, IDs o rutas internas solo por branding; cualquier migración técnica deberá planificarse por separado y probar compatibilidad.

## 2. Estado de publicación elegido

**Primera publicación: prototipo público experimental.**

Esto significa:
- la comunidad puede probar una versión temprana;
- las reglas, interfaces y sistemas pueden cambiar;
- pueden existir errores y funciones incompletas;
- no se promete estabilidad competitiva, soporte permanente ni compatibilidad de partidas entre versiones;
- cada build público debe identificar su commit o versión, fecha, cambios y problemas conocidos;
- debe existir una vía clara para reportar errores y evitar compartir datos sensibles.

No debe etiquetarse como beta abierta ni como lanzamiento estable.

## 3. Visión

Construir un juego independiente de estrategia y cartas cuya evolución sea visible y participativa. La comunidad debe poder comprender las reglas, conocer los cambios, informar problemas, proponer contenido y participar en pruebas.

El proyecto toma como referencia el género de juegos tácticos de cartas y la experiencia de títulos existentes, incluido Plants vs. Zombies Heroes, pero desarrolla su propia implementación, universo, personajes, interfaz, reglas y recursos.

## 4. Pilares

### Juego
- Combate por turnos.
- Tiradas de dados y resolución de acciones.
- Personajes con atributos y habilidades.
- Cartas, armas, inventarios y recursos.
- Modos individuales, por equipos y contra bots, según disponibilidad de cada versión.

### Ingeniería
- Reglas centralizadas y verificables.
- Pruebas automatizadas para reglas críticas.
- Repeticiones reproducibles para investigar errores.
- Separación entre lógica de juego, interfaz, persistencia y presentación.
- CI como requisito de calidad, no como sustituto de pruebas manuales.

### Arte e interfaz
- Dirección visual propia basada en manualidades callejeras.
- Sprites SVG reutilizables y futuros recursos raster originales.
- Arte creado por el equipo/comunidad con derechos claros.
- Texto y datos de interfaz separados de los recursos gráficos.
- Diseño responsive y accesible.

### Comunidad
- GitHub como fuente oficial de código, documentación, issues, PRs y decisiones.
- Discord para conversación, coordinación y pruebas en tiempo real.
- Facebook para difusión, noticias y captación de jugadores.
- Reportes públicos y trazables.
- Propuestas debatibles antes de convertirse en trabajo.
- Pruebas comunitarias antes de cambios competitivos importantes.

## 5. Qué no es el proyecto

- No es una distribución modificada de Plants vs. Zombies Heroes.
- No es un port ni una copia de sus archivos, código o recursos.
- No promete compatibilidad con cuentas, servidores o clientes de terceros.
- No promete todavía juego online competitivo estable, sincronización en la nube o infraestructura de matchmaking; estas capacidades requieren auditoría y planificación separadas.
- El prototipo experimental no constituye una versión final ni una promesa de servicio continuo.

## 6. Relación con juegos de referencia

Se permite estudiar y discutir conceptos generales del género: economía de acciones, curvas de coste, ritmo de partida, lectura de mesa, sinergias, contrajuego, construcción de mazos, progresión y telemetría de balance.

El equipo debe diseñar reglas concretas y expresiones originales. No debe extraer, publicar o incorporar código propietario, assets, audio, textos, nombres distintivos ni datos obtenidos de forma no autorizada.

Cualquier investigación técnica sobre software de terceros debe limitarse a actividades autorizadas y revisarse según la legislación aplicable. La excepción de interoperabilidad de una jurisdicción no debe asumirse como permiso general para clonar un juego.

## 7. Distribución y licencia

La licencia se mantiene expresamente **por decidir**. Antes de invitar a contribuciones externas o redistribución, el mantenedor comparará las opciones para código, arte, música, marca, datos y builds. Véase `docs/DISTRIBUTION_AND_LICENSE_DECISION.md`.

## 8. Público

- Jugadores de juegos de estrategia y cartas.
- Personas interesadas en probar prototipos.
- Desarrolladores web y de videojuegos.
- Diseñadores de cartas, sistemas y economía.
- Artistas e ilustradores.
- Personas interesadas en balance, QA y documentación.

## 9. Criterio de éxito

El éxito no se mide solo por cantidad de cartas o commits. Se mide por:
- versiones jugables y reproducibles;
- defectos críticos resueltos;
- reglas documentadas;
- cambios de balance explicados;
- contribuciones revisadas;
- participación comunitaria sostenible;
- una identidad artística reconocible y original.
