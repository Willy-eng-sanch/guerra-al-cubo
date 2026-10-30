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
- **Tramcuboso (PR #11 integrado):** Selección Afortunada aplica dos cartas por cada robo del mazo global, conserva una y descarta la otra. Los bots eligen mediante una heurística basada en rareza, sinergia y espacios de equipo/postura. Dados Trucados aún requiere pruebas manuales de empates y bloqueos.
- **Cubinja (PR #12 abierto):** se bloquea el uso de cartas Truco y posturas; su coincidencia defensiva concede una carta pero no mitiga daño. PR permanece abierto en borrador y requiere pruebas.
- **Gladiacubon (PR #13 integrado; Intercepción en este PR #16):** Coraza reduce daño de ataques directos, Aliento y daño reflejado; tiene dos ranuras de arma y comienza con una equipada. Intercepción consume 1 AP y permite elegir un aliado vivo del mismo escuadrón. Los ataques directos dirigidos a ese aliado se redirigen a Gladiacubon, que lanza su propio dado. La cobertura permanece activa hasta que consigue un Bloqueo Perfecto; los fallos no la consumen. Tras activarla, la siguiente ronda queda bloqueada y puede volver a activarse desde la ronda posterior, siempre que la cobertura anterior ya se haya completado. La IA también intenta cubrir a un aliado sin protección. **Límite conocido:** falta resolver el caso de Aliento en el que el aliado protegido es únicamente el segundo objetivo, porque Aliento comparte una sola tirada de bloqueo para ambos rivales.
- **Racubitero (PR #14 abierto):** Hurto Sigiloso transfiere de la mano del objetivo atacado una carta por daño efectivo o hasta dos con un 5 natural, sujeto al espacio libre. Desarme en Cadena y Vaciado de Bolsillo siguen pendientes.
- **Cambiaformas (PR #15 abierto):** Mimetismo cambia de forma al inicio de cada ronda a otro personaje vivo; conserva estado y ajusta mano/equipo a los límites de la nueva forma. Transmutación Total sigue pendiente.
- **Cubito de Hielo y Pirata:** verificar exactamente cuánto dura la congelación/anulación de turno y sus efectos sobre bloqueo.
- **Flaucubista:** revisar que Acorde Violento acumule bono con todas las fuentes de daño definidas por las reglas.
- **Órdenes de Cubinarca:** probar órdenes en combate individual, escuadras, contra bots y entre jugadores humanos; la integración en `main` no sustituye esas pruebas.

## Verificación técnica

PR #13 (Coraza de Gladiacubon) está integrado en `main`. PR #12, #14 y #15 permanecen abiertos en borrador; este cambio propone PR #16. Las vistas previas recientes de Vercel se vieron limitadas por cuota de despliegue, y la revisión estática no equivale a una partida manual ni confirma todas las interacciones.

Todavía se necesita ejecutar `npm run lint`, `npm run build` y una batería de pruebas manuales que cubra daño, barreras, Bloqueo Perfecto, órdenes pendientes, límites de mano, armas y cambios de turno. No considerar el juego validado funcionalmente hasta completar esas pruebas.

Para PR #16, la prueba manual debe verificar: (1) Intercepción consume exactamente 1 AP; (2) solo ofrece aliados vivos del mismo equipo; (3) después de activar en R no permite activar en R+1 y queda disponible desde R+2 si la cobertura anterior se completó; (4) un fallo de dado mantiene la cobertura y redirige el siguiente ataque al mismo Gladiacubon; (5) un Bloqueo Perfecto la libera; (6) si muere el aliado o Gladiacubon cambia de forma/muere, la cobertura se limpia; (7) la IA no crea coberturas duplicadas. El segundo objetivo de Aliento queda como caso pendiente documentado arriba.
