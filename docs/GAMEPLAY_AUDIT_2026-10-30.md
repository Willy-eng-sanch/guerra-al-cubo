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
- **Tramcuboso (PR #11 integrado):** Selección Afortunada ofrece dos cartas por cada robo del mazo global, conserva una y descarta la otra. Los bots eligen mediante una heurística de rareza, afinidad y utilidad de equipo/postura. Dados Trucados aún requiere pruebas manuales de empates y bloqueos.
- **Cubinja (PR #12 abierto):** Avaricia bloquea cartas Truco y posturas; una coincidencia defensiva concede una carta, pero no mitiga daño. PR sigue en borrador y necesita pruebas.
- **Gladiacubon (PR #13 abierto):** admite dos armas por equipamiento normal/reactivo y bots; Coraza mitiga ataques directos y Aliento, y el PR extiende la reducción al daño reflejado. Intercepción aún no está implementada; la ficha no define su duración/coste.
- **Racubitero (PR #14 abierto):** Hurto Sigiloso transfiere de la mano del objetivo atacado una carta por daño efectivo o hasta dos con un 5 natural, sujeto al espacio libre. Desarme en Cadena y Vaciado de Bolsillo siguen pendientes.
- **Cambiaformas (PR #15 abierto):** Mimetismo transforma al inicio de cada ronda en una forma aleatoria entre otros personajes vivos; conserva estado y ajusta mano/equipo a los límites de la forma nueva. Transmutación Total (elección manual por dos rondas) sigue pendiente.
- **Cubito de Hielo y Pirata (este PR):** Congelamiento Glacial bloquea el próximo ataque y el dado de defensa durante el turno de la víctima; Cubito no puede usar cartas en el turno que congela. Coraza de Escarcha reduce en 1 el daño de ataques mientras la habilidad está en enfriamiento. Maldición del Ancla y Mal de Ojo Represivo consumen el próximo turno completo del objetivo, también cuando Pirata es el segundo objetivo de Aliento. Ventisca Glacial (+2 barrera) y Juicio Pirata (cancelar dos turnos) siguen pendientes.
- **Flaucubista:** revisar que Acorde Violento acumule bono con todas las fuentes de daño definidas por las reglas.
- **Órdenes de Cubinarca:** probar órdenes en combate individual, escuadras, contra bots y entre jugadores humanos; la integración en `main` no sustituye esas pruebas.

## Verificación técnica

PR #10 y PR #11 están integrados en `main`. PR #12–#15 y este cambio (propuesto como PR #16) permanecen abiertos en borrador. Vercel ha rechazado las vistas previas recientes por cuota de despliegue; la revisión estática no equivale a una partida manual ni valida todas las interacciones.

Todavía se necesita ejecutar `npm run lint`, `npm run build` y una batería de pruebas manuales que cubra daño, barreras, Bloqueo Perfecto, órdenes pendientes, límites de mano, armas y cambios de turno. Para PR #16, comprobar: (1) Cubito congela antes del turno del objetivo y este no ataca ni lanza dado de bloqueo; (2) Cubito no usa cartas tras congelar y puede volver a hacerlo en su siguiente turno; (3) Coraza reduce en 1 el daño durante cooldown, también como segundo objetivo de Aliento; (4) Pirata activo/pasivo cancela exactamente el siguiente turno, incluido el caso de segundo objetivo de Aliento. No considerar el juego validado funcionalmente hasta completar esas pruebas.
