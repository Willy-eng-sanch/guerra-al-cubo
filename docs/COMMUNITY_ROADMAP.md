# Hoja de ruta comunitaria

La hoja de ruta expresa prioridades, no fechas garantizadas. Cada fase se considera completada solo cuando cumple sus criterios de salida.

## Fase 0 — Fundamentos públicos
- [x] Confirmar repositorio y rama principal.
- [x] Documentar stack y scripts.
- [x] Documentar hitos fusionados #39–#43.
- [x] Registrar riesgos y bugs conocidos.
- [ ] Confirmar nombre público definitivo.
- [ ] Elegir y publicar licencia.
- [ ] Publicar código de conducta, contribución y seguridad.
- [ ] Configurar Discussions y etiquetas.

## Fase 1 — Estabilidad jugable
- [ ] Reproducir y resolver issues P1 #31, #32 y #33.
- [ ] Ejecutar partida completa desde configuración hasta resultado.
- [ ] Probar bots y casos de turnos/estados.
- [ ] Validar archivo local, reproducción y exportación diagnóstica.
- [ ] Crear matriz de pruebas manuales y dispositivos.
- [ ] Mantener CI verde en cada PR.

**Criterio de salida:** no quedan P1 confirmados en el flujo principal y existe evidencia de pruebas end-to-end.

## Fase 2 — Documentación de juego
- [ ] Catálogo completo de personajes.
- [ ] Catálogo de cartas, armas y efectos.
- [ ] Reglas de turnos, dados, daño, AP y estados.
- [ ] Tabla de interacciones y casos límite.
- [ ] Glosario para jugadores.
- [ ] Registro de cambios de balance.

**Criterio de salida:** un nuevo colaborador puede comprender una regla sin inferirla leyendo cientos de líneas de código.

## Fase 3 — Calidad de interfaz y arte
- [ ] Revisar 360×640, 768×1024, 1366×768 y 1920×1080.
- [ ] Auditar capas de diálogos y scroll.
- [ ] Revisar accesibilidad de teclado, foco, contraste y áreas táctiles.
- [ ] Producir los primeros sprites artesanales originales.
- [ ] Documentar derechos y atribuciones de cada recurso.

**Criterio de salida:** flujos principales utilizables en móvil y escritorio, sin bloqueos visuales críticos.

## Fase 4 — Pruebas comunitarias y balance
- [ ] Publicar formulario/plantilla de feedback.
- [ ] Abrir sesiones de playtest con versión identificada.
- [ ] Recopilar partidas voluntarias y logs anonimizados.
- [ ] Publicar notas de balance con evidencia.
- [ ] Mantener canal de propuestas y votaciones consultivas.

**Criterio de salida:** al menos un ciclo completo de propuesta, prueba, análisis, decisión y publicación.

## Fase 5 — Arquitectura online
- [ ] Auditar estado actual del lobby y conexiones.
- [ ] Definir modelo de autoridad de partida y validación de acciones.
- [ ] Diseñar cuentas, identidad y almacenamiento si son necesarios.
- [ ] Definir protección contra trampas, abuso y pérdida de conexión.
- [ ] Estimar infraestructura y costes operativos.
- [ ] Diseñar pruebas de concurrencia y seguridad.

**Criterio de salida:** arquitectura revisada y prototipo de red con límites y costes documentados. No anunciar matchmaking competitivo hasta entonces.

## Ciclo de versiones

1. **Propuesta:** Issue o Discussion con problema y contexto.
2. **Diseño:** especificación breve y riesgos.
3. **Implementación:** rama y Pull Request pequeña.
4. **Validación:** CI, pruebas de regresión y playtest cuando aplique.
5. **Revisión:** mantenedor revisa código, diseño y documentación.
6. **Publicación:** merge, notas de versión y actualización de documentación.
7. **Seguimiento:** observar defectos y efectos de balance.

## Política de cambios competitivos

- Los arreglos de errores críticos pueden requerir una actualización urgente.
- Los cambios de balance deben indicar motivación, impacto esperado y evidencia.
- Las propuestas comunitarias no se convierten automáticamente en decisiones.
- Evitar cambios simultáneos grandes que impidan atribuir resultados.
- Mantener un historial consultable de valores y reglas anteriores.

## Métricas comunitarias útiles

- Bugs abiertos por prioridad y antigüedad.
- Tiempo hasta primera respuesta y resolución.
- Porcentaje de PR con CI aprobado.
- Pruebas de regresión añadidas por defecto corregido.
- Participación en playtests.
- Diversidad de estrategias y personajes usados.
- Tasa de victorias y duración por modo cuando existan datos suficientes.
- Incidencias de accesibilidad y compatibilidad.
