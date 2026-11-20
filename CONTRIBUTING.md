# Guía para contribuir

¡Gracias por interesarte en Guerra al Cubo — Guerra Cúbita! Puedes ayudar con código, diseño, pruebas, documentación, traducción, arte original o análisis de balance.

## Estado y derechos

La primera publicación prevista es un **prototipo público experimental**. Las reglas y sistemas pueden cambiar y pueden existir errores. La licencia del proyecto está pendiente de decisión; la visibilidad pública del repositorio no concede permiso general para reutilizar o redistribuir su contenido. Hasta que se publique una licencia y política de contribuciones, consulta al mantenedor antes de enviar contenido que requiera derechos de redistribución.

## Antes de empezar

1. Lee el README y la documentación de `docs/`.
2. Busca Issues y Pull Requests existentes para evitar duplicados.
3. Para cambios grandes, abre primero una propuesta.
4. No trabajes directamente sobre `main`.
5. No subas contenido de terceros sin autorización y licencia verificables.

## Tipos de contribución

- **Bug:** defecto reproducible en una versión concreta.
- **Gameplay:** reglas, personajes, cartas, economía o bots.
- **Balance:** análisis respaldado por escenarios o datos.
- **UI/UX:** navegación, responsive, accesibilidad.
- **Arte:** ilustraciones y sprites originales con derechos claros.
- **Documentación:** reglas, guías, decisiones y notas de versión.
- **QA:** pruebas manuales, replays y regresiones.

## Reportar un bug

Incluye:
- versión/commit y entorno;
- modo y personajes;
- pasos numerados para reproducir;
- resultado esperado y observado;
- frecuencia;
- captura, replay o log si es seguro compartirlo;
- si el error afecta progreso o bloquea una partida.

No adjuntes datos privados, credenciales ni archivos de terceros.

## Proponer una mecánica o balance

Describe el problema antes de la solución. Incluye:
- objetivo de diseño;
- regla propuesta en términos precisos;
- coste, objetivo, duración y restricciones;
- interacciones previstas;
- posibles abusos/exploits;
- escenarios de prueba;
- criterios para decidir si funcionó.

Una encuesta o reacción comunitaria orienta, pero no sustituye el análisis técnico y de balance.

## Flujo de Pull Request

1. Crea una rama descriptiva desde `main`.
2. Mantén el cambio acotado y evita mezclar refactors no relacionados.
3. Añade o actualiza pruebas.
4. Actualiza documentación cuando cambie el comportamiento.
5. Ejecuta:

```bash
npm ci
npm test
npm run lint
npm run build
```

6. Abre una PR con resumen, motivación, pruebas, capturas si cambia UI y riesgos conocidos.
7. Espera revisión; no fusiones tu propio cambio salvo autorización explícita del mantenedor.

## Criterios de aceptación

- El cambio resuelve el problema declarado.
- No introduce regresiones conocidas.
- Los tests cubren la regla y sus límites.
- CI pasa sobre el commit de la PR.
- La documentación coincide con el comportamiento.
- Los recursos incluidos tienen origen y permisos claros.
- La PR es revisable y no incluye secretos ni archivos generados innecesarios.

## Estilo y seguridad

- Sigue los patrones existentes del repositorio.
- Evita duplicar lógica de reglas.
- No añadas dependencias sin justificar su necesidad.
- No registres secretos, tokens, datos personales ni identificadores sensibles.
- No incluyas código, assets, textos, sonidos o personajes extraídos de juegos comerciales.

## Licencia y contribuciones

La licencia y el acuerdo de contribución deben definirse antes de aceptar formalmente contribuciones externas que vayan a incorporarse y redistribuirse. Hasta entonces, consulta al mantenedor antes de asumir que una contribución puede reutilizarse o redistribuirse bajo una licencia abierta.
