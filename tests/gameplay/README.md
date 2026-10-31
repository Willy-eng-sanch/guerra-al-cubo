# Suite automatizada de gameplay

La suite usa el ejecutor nativo `node:test` de Node 22; no instala un framework adicional ni necesita navegador para verificar las reglas del dominio.

Ejecutar desde la raíz del proyecto:

```bash
npm test
```

Las pruebas llaman las mismas funciones puras que usa `src/App.tsx` y cubren:

- Drenaje y Donación de Cubícula: equipos, límites, HP mínimo/máximo, consumo de Cúbits, reutilización por turno y enfriamiento.
- Ciclo de turnos: reinicio exacto a 2 Cúbits, congelación, enfriamiento y omisión de personajes eliminados.
- Cambio de ronda y condición de fin de partida en combate por equipos y todos contra todos.

Esto es una suite automatizada de reglas y transiciones del gameplay, no una prueba visual de extremo a extremo del navegador. Las interacciones de interfaz, animaciones, audio, conexión online y partidas completas en Chromium requieren una capa E2E separada.
