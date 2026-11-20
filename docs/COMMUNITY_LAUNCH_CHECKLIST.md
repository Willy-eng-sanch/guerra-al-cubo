# Lista de preparación del lanzamiento comunitario

**Nombre público:** Guerra al Cubo — Guerra Cúbita.  
**Primera publicación:** prototipo público experimental.  
**Canales elegidos:** GitHub + Discord + Facebook.  
**Licencia:** pendiente de evaluación.  
**Estado:** preparación; no anunciar como lanzamiento listo hasta completar los criterios obligatorios.

## 1. Mensaje honesto de lanzamiento

Presentar el juego como prototipo experimental en desarrollo. Explicar:
- qué se puede probar en la build publicada;
- qué sistemas están incompletos;
- qué errores conocidos existen;
- qué dispositivos/navegadores se han probado;
- cómo enviar reportes;
- qué datos locales guarda el juego;
- que el estado de las partidas puede cambiar entre versiones;
- que no hay promesa de matchmaking o sincronización remota si no está verificada.

No prometer fechas, equilibrio competitivo, soporte permanente o funciones no probadas.

## 2. GitHub — fuente oficial

- [ ] Revisar y aprobar PR de fundación documental.
- [ ] Resolver licencia antes de aceptar contribuciones redistribuibles.
- [ ] Habilitar Discussions y crear categorías: Anuncios, Ayuda, Ideas, Balance y Playtesting.
- [ ] Crear etiquetas: bug, gameplay, balance, ui, art, documentation, good first issue, needs-reproduction, P0/P1/P2/P3.
- [ ] Añadir enlace a Discord y Facebook una vez confirmados.
- [ ] Revisar plantillas de Issues y Pull Requests.
- [ ] Configurar protección de rama y checks requeridos según capacidad del proyecto.
- [ ] Publicar un primer changelog y una build identificada.

## 3. Discord — estructura propuesta

Crear canales de texto:
- `#bienvenida-y-reglas` — propósito, normas y enlaces oficiales.
- `#anuncios` — solo publicaciones oficiales.
- `#estado-del-prototipo` — versiones, problemas conocidos y mantenimiento.
- `#ayuda-y-soporte` — ayuda para ejecutar el prototipo.
- `#bugs-y-reproduccion` — reproducir errores; enlazar a GitHub Issues.
- `#ideas-y-mecanicas` — propuestas de juego.
- `#balance-y-cartas` — análisis y debate de balance.
- `#playtesting` — convocatorias y sesiones.
- `#arte-y-creatividad` — arte original y feedback.
- `#off-topic` — conversación general.

Canales de voz:
- `Sala de pruebas` — sesiones de juego.
- `Taller de desarrollo` — reuniones y revisión de ideas.

Roles sugeridos:
- Mantenedor
- Moderación
- Desarrollador
- QA / Tester
- Diseñador
- Artista
- Miembro
- Playtester

Permisos mínimos:
- anuncios solo para mantenedor/moderación;
- moderación con permisos limitados y auditables;
- no dar permisos de administrador a bots sin necesidad;
- activar verificación y protección anti-spam;
- publicar cómo reportar acoso o vulnerabilidades en privado.

**No publicar una invitación inventada.** Añadir el enlace permanente de Discord aquí y al README solo después de crear el servidor y comprobar permisos.

## 4. Facebook — captación y difusión

- [ ] Confirmar la página/grupo oficial que se utilizará.
- [ ] Publicar una presentación que explique que es un proyecto independiente.
- [ ] Enlazar repositorio y build de prueba.
- [ ] Explicar que los reportes técnicos se trasladan a GitHub.
- [ ] No solicitar ni publicar datos privados de jugadores.
- [ ] Moderar comparaciones con otros juegos con respeto y sin insinuar afiliación oficial.

**Enlace oficial:** pendiente de confirmación por el mantenedor.

## 5. Puerta técnica antes de compartir build

- [ ] Resolver o documentar claramente P1 que afecten el flujo que se probará.
- [ ] Ejecutar `npm ci`, `npm test`, `npm run lint`, `npm run build`.
- [ ] Probar instalación/carga en navegadores y tamaños anunciados.
- [ ] Completar una partida de inicio a fin.
- [ ] Probar reinicio, derrota, victoria y salida.
- [ ] Validar archivo local y replay si se anuncian.
- [ ] Verificar que no se exponen tokens, datos privados o endpoints internos.
- [ ] Comprobar que los recursos publicados tienen procedencia y derechos claros.
- [ ] Identificar build con commit y fecha.
- [ ] Añadir instrucciones de ejecución y reporte.

## 6. Plantilla de publicación

**Guerra al Cubo — Guerra Cúbita: primer prototipo público experimental**

Estamos preparando una alternativa independiente de estrategia por turnos, cartas, dados y personajes, con desarrollo abierto y participación comunitaria.

Esta primera versión es experimental: algunas reglas, pantallas y sistemas pueden cambiar y todavía estamos identificando errores. Queremos que la comunidad nos ayude a probar, documentar problemas y proponer mejoras.

- Repositorio: https://github.com/Willy-eng-sanch/guerra-al-cubo
- Reportar errores: https://github.com/Willy-eng-sanch/guerra-al-cubo/issues
- Discord: enlace oficial pendiente.
- Facebook: enlace oficial pendiente.

No es un producto afiliado a Plants vs. Zombies ni una copia de sus recursos. Es un proyecto independiente que desarrolla sus propias mecánicas y contenido.

Antes de publicar, completar los enlaces, la versión, los dispositivos probados y la lista de problemas conocidos.

## 7. Criterio para declarar listo el lanzamiento

La publicación solo se marca como preparada cuando:
- existe una build descargable/ejecutable comprobada;
- hay instrucciones claras;
- se han probado los flujos anunciados;
- se conoce el estado de los defectos críticos;
- existen canales moderados para soporte;
- los derechos de los recursos están claros;
- se ha publicado el estado experimental y las limitaciones;
- no se presenta la licencia como resuelta si sigue pendiente.
