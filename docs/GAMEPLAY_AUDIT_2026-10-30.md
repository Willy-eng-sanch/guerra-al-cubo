# Auditoría de habilidades y pasivas — Guerra Cúbita

Fecha de actualización: 2026-10-30

Esta auditoría distingue entre mecánicas que ya están en `main`, cambios propuestos en PR abiertos y aspectos que todavía necesitan revisión o pruebas de partida.

## Mecánicas integradas en main

- **Flaucubista Desafinado (PR #3):** apuesta D5 real (1–5) y bono Acorde Violento para el siguiente ataque. La aplicación del bono a fuentes de daño que no sean ataques normales todavía requiere auditoría.
- **Hada al Cubo (PR #4):** Suministro Mágico roba dos cartas, permite conservar una y transferir la otra a un aliado elegible.
- **Dracubon (PR #6 y PR #8):** Escamas refleja daño cuando su tirada de defensa coincide; Aliento golpea a dos rivales con una sola tirada de ataque y una tirada de bloqueo designada para ambos. Llamarada Doble potencia el siguiente Aliento después de un Bloqueo Perfecto.
- **Cubícula (PR #7):** Festín Sangriento y Reflejo de Noche integrados en el flujo de ataque, daño reflejado, barreras, curación y eliminación.

## Cubinarca integrado en main (PR #9)

La rama `feat/cubinarca-orden-imperativa` implementa:

- Orden tras infligir daño efectivo o conseguir un Bloqueo Perfecto.
- Tres órdenes posibles: atacar a un jugador vivo (incluidos aliados), transferir una carta de la víctima a Cubinarca o desequipar un arma.
- Discordia mantiene la orden pendiente y deshabilita el bloqueo si la víctima desobedece o termina su turno sin cumplir.
- La penalización se retira cuando se cumple la orden.
- Modal para jugadores humanos y obediencia automática de bots.

**Interpretación aplicada:** “transferir 1 carta global” se implementó como entregar una carta de la mano de la víctima a Cubinarca. Al desequipar un arma, vuelve a la mano si hay espacio; de lo contrario se envía al descarte. El PR #9 fue fusionado en `main` el 30 de octubre de 2026 (commit `dcdba907`).

## Pendientes de auditoría

- **Cubogro (PR #10 integrado):** Piel de Piedra fija la capacidad de mano y ranuras de equipo en cero; bloquea las rutas de robo, uso, equipamiento, reacciones y transferencias. Falta validación funcional de partida.
- **Tramcuboso (PR #11 integrado):** Selección Afortunada aplica dos cartas por cada robo del mazo global y conserva una; los bots eligen mediante una heurística de rareza, afinidad y utilidad de equipo/postura. Dados Trucados aún requiere pruebas manuales de empates y bloqueos.
- **Cubinja (PR #12 abierto):** Avaricia bloquea cartas Truco y posturas; una coincidencia defensiva concede una carta, pero no mitiga daño. PR sigue en borrador y necesita pruebas.
- **Gladiacubon (PR #13 abierto):** la ranura extra está centralizada en `getMaxWeaponSlots`; inicia con un arma y admite dos por equipamiento normal y reacción, también en bots. Coraza ya reduce ataques directos y Aliento; PR #13 añade daño reflejado. Intercepción aún no está implementada y la ficha no detalla coste/duración.
- **Racubitero (PR #14 abierto):** Hurto Sigiloso transfiere de la mano del rival atacado una carta por daño efectivo o hasta dos con un 5 natural; respeta el espacio del atacante. Desarme en Cadena y Vaciado de Bolsillo siguen pendientes.
- **Cambiaformas (este PR):** Mimetismo transforma automáticamente al inicio de cada ronda en una forma elegida al azar entre otros personajes vivos. La forma se renueva en la siguiente ronda; salud y estado se conservan, mientras mano/equipo se ajustan a los límites de la nueva forma y las cartas incompatibles pasan al descarte. Transmutación Total (elección manual por dos rondas) sigue pendiente; la selección aleatoria es la interpretación operativa aplicada porque la ficha no describe el método de elección ordinario.
- **Cubito de Hielo y Pirata:** verificar exactamente cuánto dura la congelación/anulación de turno y sus efectos sobre bloqueo.
- **Flaucubista:** revisar que Acorde Violento acumule bono con todas las fuentes de daño definidas por las reglas.
- **Órdenes de Cubinarca:** probar órdenes en combate individual, escuadras, contra bots y entre jugadores humanos; la integración en `main` no sustituye esas pruebas.

## Verificación técnica

PR #10 y PR #11 están integrados en `main`. PR #12, #13 y #14 permanecen abiertos en borrador; este cambio propone PR #15. Vercel ha bloqueado las vistas previas recientes por cuota del plan; la inspección estática no equivale a una partida manual ni valida todas las interacciones.

Todavía se necesita ejecutar `npm run lint`, `npm run build` y una batería de pruebas manuales que cubra daño, barreras, Bloqueo Perfecto, órdenes pendientes, límites de mano, armas y cambios de turno. No considerar el juego validado funcionalmente hasta completar esas pruebas.
