# Guerra al Cubo — Guerra Cúbita

**Un videojuego independiente de estrategia, cartas, dados y personajes, desarrollado abiertamente con su comunidad.**

Guerra al Cubo — Guerra Cúbita es un proyecto de videojuego construido con React, TypeScript y Vite. Busca evolucionar como una alternativa independiente dentro del género de estrategia y cartas: con reglas propias, identidad visual original, mantenimiento continuo, pruebas reproducibles y participación comunitaria.

> **Estado público previsto:** prototipo público experimental. No representa una versión estable ni una beta competitiva. Las funciones, modos y reglas pueden cambiar; consulta las notas de cada build y los issues conocidos.

## Participa en la comunidad

- **GitHub:** código, documentación, errores, propuestas y decisiones técnicas.
- **Discord:** conversación, coordinación y sesiones de prueba comunitaria.
- **Facebook:** difusión, noticias y participación de jugadores.

Los enlaces de invitación de Discord y la página/grupo oficial de Facebook se publicarán aquí cuando el mantenedor los confirme. No se inventan enlaces ni se asume que un servidor ya está configurado.

## Qué queremos construir

- Un juego de estrategia por turnos con dados, personajes, habilidades, cartas, armas y gestión de recursos.
- Sistemas de combate comprensibles, auditables y testeables.
- Un archivo local de partidas y repeticiones para analizar partidas reales.
- Una identidad visual propia, con dirección artística de manualidades callejeras.
- Un ciclo abierto de reportes, propuestas, pruebas, actualizaciones y notas de versión.
- Una comunidad que pueda participar sin necesitar acceso directo al código.

## Estado técnico conocido

- **Frontend:** React 19, TypeScript, Vite.
- **Gráficos auxiliares:** Three.js.
- **Pruebas:** Node.js Test Runner (`node --test`).
- **Comandos:** `npm run dev`, `npm test`, `npm run lint`, `npm run build`.
- **Persistencia de repeticiones:** IndexedDB en el navegador; no implica sincronización en la nube.
- **Interfaz:** sistema reutilizable de sprites SVG y componentes React.

## Primeros pasos

1. Lee [la visión y alcance](docs/PROJECT_OVERVIEW.md).
2. Revisa [el estado de desarrollo](docs/DEVELOPMENT_STATUS.md).
3. Consulta [la guía de contribución](CONTRIBUTING.md).
4. Explora [el diseño del juego](docs/GAME_DESIGN_AND_SYSTEMS.md).
5. Revisa [la hoja de ruta comunitaria](docs/COMMUNITY_ROADMAP.md).
6. Antes de redistribuir o reutilizar contenido, lee [la decisión pendiente de licencia](docs/DISTRIBUTION_AND_LICENSE_DECISION.md).

## Desarrollo local

Requisitos: Node.js compatible con el proyecto y npm.

```bash
git clone https://github.com/Willy-eng-sanch/guerra-al-cubo.git
cd guerra-al-cubo
npm ci
npm run dev
```

Antes de proponer cambios:

```bash
npm test
npm run lint
npm run build
```

Consulta siempre el workflow de GitHub Actions para verificar el resultado de CI del commit que se está revisando.

## Cómo participar

- Reporta defectos mediante GitHub Issues.
- Propón ideas de cartas, personajes, reglas y mejoras mediante issues de propuesta o Discussions cuando estén habilitadas.
- Revisa las Pull Requests y sus pruebas.
- Participa en pruebas de juego y comparte pasos reproducibles.
- No publiques datos privados, archivos de terceros ni contenido protegido.

## Principios del proyecto

1. **Identidad propia:** no copiamos código, arte, personajes, nombres, textos, sonidos ni recursos de otros juegos.
2. **Transparencia:** cada cambio importante debe tener motivación, alcance y evidencia de validación.
3. **Estabilidad:** corregir errores críticos tiene prioridad sobre añadir contenido sin validar.
4. **Balance medible:** las propuestas competitivas deben incluir escenarios de prueba y análisis de impacto.
5. **Accesibilidad:** la interfaz debe funcionar en pantallas pequeñas y escritorio.
6. **Respeto comunitario:** las contribuciones se evalúan por su calidad, no por la experiencia o popularidad de quien las propone.

## Licencia y uso

**Licencia pendiente de decisión.** El repositorio es públicamente visible, pero esa visibilidad no concede por sí sola permiso para reutilizar, modificar o redistribuir el código. Tampoco debe asumirse que una eventual licencia del código cubrirá automáticamente arte, música, marcas o contenido de terceros. Consulta [la matriz de distribución y licencia](docs/DISTRIBUTION_AND_LICENSE_DECISION.md). Hasta que exista una decisión publicada y los archivos de licencia correspondientes, no se invita a redistribuir el proyecto.

## Enlaces

- [Repositorio](https://github.com/Willy-eng-sanch/guerra-al-cubo)
- [Issues](https://github.com/Willy-eng-sanch/guerra-al-cubo/issues)
- [Pull Requests](https://github.com/Willy-eng-sanch/guerra-al-cubo/pulls)
- [GitHub Actions](https://github.com/Willy-eng-sanch/guerra-al-cubo/actions)
- [Discord: enlace pendiente de publicar](docs/COMMUNITY_LAUNCH_CHECKLIST.md)
- [Facebook: enlace oficial pendiente de confirmar](docs/COMMUNITY_LAUNCH_CHECKLIST.md)
