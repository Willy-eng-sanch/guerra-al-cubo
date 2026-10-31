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
