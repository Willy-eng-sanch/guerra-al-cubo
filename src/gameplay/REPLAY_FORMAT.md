# Registro y reconstrucción determinista de partidas

El formato `.gcreplay` conserva configuración inicial, orden de cartas, acciones,
resultados aleatorios y checkpoints. El replay no vuelve a sortear ni a decidir:
consume las acciones y resultados originales.

## Aleatoriedad

`src/gameplay/random.js` implementa dos modos:

- **RECORD:** genera resultados con una semilla y registra tipo, propósito, rango y valor.
- **REPLAY:** consume los resultados guardados. Si cambia el propósito, rango u orden,
  lanza `ReplayRandomMismatchError` en lugar de continuar con otra partida.

La aleatoriedad cosmética de animaciones, partículas y audio queda fuera de este flujo.

## Archivo

JSON con extensión `.gcreplay`:
- `metadata`: ID, versión del motor, modo y semilla.
- `initialState`: jugadores y mazo en su orden inicial.
- `events`: acciones, resultados aleatorios y acontecimientos.
- `checkpoints`: estados de referencia.
- `finalResult`: resultado final.

## Alcance de esta etapa

Esta entrega establece el formato, el proveedor aleatorio, las pruebas de consumo de
resultados y la exportación. La instrumentación completa de acciones, checkpoints
periódicos, importador/reproductor visual y los dos bots que ejecutan el historial
se completarán en etapas posteriores. Aún no es un replay integral.

## Checkpoints e integridad

La aplicación toma un checkpoint en el estado inicial, al avanzar cada turno y al
terminar la partida. Cada checkpoint incluye una huella FNV-1a de una serialización
estable de las claves del estado. La huella sirve para detectar divergencias durante
la reconstrucción; no es una firma criptográfica ni sustituye una futura comparación
detallada por campos.


## Motor de reconstrucción (rama de trabajo PR #37)

`src/gameplay/replay-engine.js` contiene `ReplayExecutionController`:
- Recorre todos los eventos conservando su secuencia original.
- Entrega `PLAYER_ACTION` al dispatcher de la aplicación y valida `BOT_DECISION`.
- Comprueba los eventos derivados que vuelve a emitir la aplicación (logs, robos, ofertas, barajados, cambios de turno y decisiones automáticas).
- Restaura el estado inicial guardado, y utiliza solo los resultados aleatorios posteriores a `MATCH_STARTED`; el mazo y roster iniciales ya restaurados no se vuelven a generar.
- Compara checkpoints y reporta el primer campo diferente.
- Falla si quedan resultados aleatorios sin consumir o eventos observados adicionales sin correspondencia.
- Admite detener la reproducción desde la interfaz.

La pantalla inicial incluye ahora un acceso de importación de archivos `.gcreplay` para probar el motor. Todavía no es una biblioteca persistente: IndexedDB, historial de partidas guardadas y administración del archivo local se implementarán después de validar el reproductor.

**Límite de validación:** la CI valida pruebas unitarias del controlador, TypeScript y compilación; no demuestra por sí sola que una partida interactiva completa exportada desde la arena se reconstruya con todos sus checkpoints y ganador idénticos. Ese ensayo end-to-end sigue siendo el criterio obligatorio de aceptación antes de fusionar la PR #37.


## Reproducción en modo de solo lectura

La reproducción no debe acreditar progresión ni volver a ejecutar bots sobre el estado reconstruido:
- Los registros de daño, bloqueos, cartas jugadas, resultado de partida y monedas se omiten mientras `replayPlaybackActiveRef` está activo.
- Al completar, fallar o detener una reproducción, el modo protegido permanece activo y cubre la arena con un panel de resultado.
- La sesión solo se desactiva cuando el usuario elige explícitamente salir de la repetición.
- El estado inicial de una nueva reproducción limpia el controlador anterior, ventanas de selección pendientes y velocidad acelerada.
