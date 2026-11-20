# Visión y alcance del proyecto

## 1. Identidad

**Nombre de trabajo:** Guerra al Cubo.  
**Nombre histórico usado en documentación y código:** Guerra Cúbita / `guerra-cubita`.

El nombre público debe normalizarse antes de una campaña de difusión amplia. Este documento usa **Guerra al Cubo** como nombre de presentación, sin renombrar identificadores internos del código.

## 2. Visión

Construir un juego independiente de estrategia y cartas cuya evolución sea visible y participativa. La comunidad debe poder comprender las reglas, conocer los cambios, informar problemas, proponer contenido y participar en pruebas.

El proyecto toma como referencia el género de juegos tácticos de cartas y la experiencia de títulos existentes, incluido Plants vs. Zombies Heroes, pero desarrolla su propia implementación, universo, personajes, interfaz, reglas y recursos.

## 3. Pilares

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
- Reportes públicos y trazables.
- Propuestas debatibles antes de convertirse en trabajo.
- Pull Requests revisables.
- Notas de versión y registro de decisiones.
- Pruebas comunitarias antes de cambios competitivos importantes.

## 4. Qué no es el proyecto

- No es una distribución modificada de Plants vs. Zombies Heroes.
- No es un port ni una copia de sus archivos, código o recursos.
- No promete compatibilidad con cuentas, servidores o clientes de terceros.
- No promete todavía juego online competitivo estable, sincronización en la nube o infraestructura de matchmaking; estas capacidades requieren auditoría y planificación separadas.

## 5. Relación con juegos de referencia

Se permite estudiar y discutir conceptos generales del género: economía de acciones, curvas de coste, ritmo de partida, lectura de mesa, sinergias, contrajuego, construcción de mazos, progresión y telemetría de balance.

El equipo debe diseñar reglas concretas y expresiones originales. No debe extraer, publicar o incorporar código propietario, assets, audio, textos, nombres distintivos ni datos obtenidos de forma no autorizada.

Cualquier investigación técnica sobre software de terceros debe limitarse a actividades autorizadas y revisarse según la legislación aplicable. La excepción de interoperabilidad de una jurisdicción no debe asumirse como permiso general para clonar un juego.

## 6. Público

- Jugadores de juegos de estrategia y cartas.
- Personas interesadas en probar prototipos.
- Desarrolladores web y de videojuegos.
- Diseñadores de cartas, sistemas y economía.
- Artistas e ilustradores.
- Personas interesadas en balance, QA y documentación.

## 7. Criterio de éxito

El éxito no se mide solo por cantidad de cartas o commits. Se mide por:
- versiones jugables y reproducibles;
- defectos críticos resueltos;
- reglas documentadas;
- cambios de balance explicados;
- contribuciones revisadas;
- participación comunitaria sostenible;
- una identidad artística reconocible y original.
