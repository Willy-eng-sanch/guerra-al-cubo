# Auditoría de habilidades y pasivas — Guerra Cúbita

Fecha de actualización: 2026-10-30

Esta auditoría distingue entre mecánicas que ya están en `main`, cambios propuestos en PR abiertos y aspectos que todavía necesitan revisión o pruebas de partida.

## Mecánicas integradas en main

- **Flaucubista Desafinado (PR #3):** apuesta D5 real (1–5) y bono Acorde Violento para el siguiente ataque. La aplicación del bono a fuentes de daño que no sean ataques normales todavía requiere auditoría.
- **Hada al Cubo (PR #4):** Suministro Mágico roba dos cartas, permite conservar una y transferir la otra a un aliado elegible.
- **Dracubon (PR #6 y PR #8):** Escamas refleja daño cuando su tirada de defensa coincide; Aliento golpea a dos rivales con una sola tirada de ataque y una tirada de bloqueo designada para ambos. Llamarada Doble potencia el siguiente Aliento después de un Bloqueo Perfecto.
- **Cubícula (PR #7):** Festín Sangriento y Reflejo de Noche integrados en el flujo de ataque, daño reflejado, barreras, curación y eliminación.

## Cambio propuesto en PR #9 — Cubinarca

La rama `feat/cubinarca-orden-imperativa` implementa:

- Orden tras infligir daño efectivo o conseguir un Bloqueo Perfecto.
- Tres órdenes posibles: atacar a un jugador vivo (incluidos aliados), transferir una carta de la víctima a Cubinarca o desequipar un arma.
- Discordia mantiene la orden pendiente y deshabilita el bloqueo si la víctima desobedece o termina su turno sin cumplir.
- La penalización se retira cuando se cumple la orden.
- Modal para jugadores humanos y obediencia automática de bots.

**Interpretación aplicada:** “transferir 1 carta global” se implementó como entregar una carta de la mano de la víctima a Cubinarca. Al desequipar un arma, vuelve a la mano si hay espacio; de lo contrario se envía al descarte. Este PR no está fusionado en `main`.

## Pendientes de auditoría

- **Cubogro:** verificar la restricción de no usar, robar ni equipar cartas además de la modificación de tiradas bajas.
- **Tramcuboso:** verificar la selección entre dos cartas al robar y los casos de empate en defensa.
- **Cubinja:** verificar la prohibición de cartas Truco y la regla especial de Bloqueo Perfecto que no mitiga daño.
- **Gladiacubon:** comprobar la reducción de daño y la ranura adicional en todos los caminos de equipamiento.
- **Racubitero:** comprobar el robo por daño y el robo doble cuando aparece un 5 en todos los modos.
- **Cambiaformas:** comprobar transformación, duración, reversión y conservación de estado.
- **Cubito de Hielo y Pirata:** verificar exactamente cuánto dura la congelación/anulación de turno y sus efectos sobre bloqueo.
- **Flaucubista:** revisar que Acorde Violento acumule bono con todas las fuentes de daño definidas por las reglas.
- **Órdenes de Cubinarca:** probar órdenes en combate individual, escuadras, contra bots y entre jugadores humanos una vez que PR #9 se integre.

## Verificación técnica

Las revisiones de PR #3, #4, #6, #7, #8 y #9 han incluido inspección estática y despliegues de vista previa cuando estaban disponibles. Esto no equivale a una partida manual ni confirma todas las interacciones de combate.

Todavía se necesita ejecutar `npm run lint`, `npm run build` y una batería de pruebas manuales que cubra daño, barreras, Bloqueo Perfecto, órdenes pendientes, límites de mano, armas y cambios de turno. No considerar el juego validado funcionalmente hasta completar esas pruebas.
