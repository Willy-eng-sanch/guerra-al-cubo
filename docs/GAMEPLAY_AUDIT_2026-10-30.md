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
- **Cubinja (corrección mainline propuesta en PR #19):** Avaricia bloquea cartas Truco y posturas en acciones normales, reacciones y decisiones de bots. La coincidencia defensiva concede una carta si hay espacio, pero no bloquea ni reduce por sí misma el daño, no cura y no abre reacción; las armaduras y barreras ajenas a Avaricia siguen aplicando. Las posturas preparadas quedan suspendidas mientras Cubinja está activa. Se corrigieron los IDs 17 (La Cortina de Mugre) y 19 (El Esquive de Callejón). Requiere lint/build y pruebas manuales. PR #12 y #17 son duplicados antiguos; no fusionarlos.
- **Gladiacubon (PR #13 integrado; Intercepción en este PR #16):** Coraza reduce daño de ataques directos, Aliento y daño reflejado; tiene dos ranuras de arma y comienza con una equipada. Intercepción consume 1 AP y permite elegir un aliado vivo del mismo escuadrón. Los ataques directos dirigidos a ese aliado se redirigen a Gladiacubon, que lanza su propio dado. La cobertura permanece activa hasta que consigue un Bloqueo Perfecto; los fallos no la consumen. Tras activarla, la siguiente ronda queda bloqueada y puede volver a activarse desde la ronda posterior, siempre que la cobertura anterior ya se haya completado. La IA también intenta cubrir a un aliado sin protección. **Límite conocido:** falta resolver el caso de Aliento en el que el aliado protegido es únicamente el segundo objetivo, porque Aliento comparte una sola tirada de bloqueo para ambos rivales.
- **Racubitero (corrección mainline propuesta en PR #20):** Hurto Sigiloso transfiere desde la mano del rival que recibió daño efectivo una carta, o hasta dos cuando el ataque incluye un 5 natural; limita el hurto al espacio libre del atacante y a las cartas reales que conserva el objetivo. El cálculo posterior de robos normales usa ambas manos después de la transferencia. Desarme en Cadena y Vaciado de Bolsillo siguen pendientes. PR #14 es la propuesta antigua sobre una base desactualizada; no fusionarla.
- **Cambiaformas (PR #15 abierto):** Mimetismo cambia de forma al inicio de cada ronda a otro personaje vivo; conserva estado y ajusta mano/equipo a los límites de la nueva forma. Transmutación Total sigue pendiente.
- **Cubito de Hielo y Pirata:** verificar exactamente cuánto dura la congelación/anulación de turno y sus efectos sobre bloqueo.
- **Flaucubista:** revisar que Acorde Violento acumule bono con todas las fuentes de daño definidas por las reglas.
- **Órdenes de Cubinarca:** probar órdenes en combate individual, escuadras, contra bots y entre jugadores humanos; la integración en `main` no sustituye esas pruebas.

## Verificación técnica

PR #13 (Coraza de Gladiacubon) y PR #16 (Intercepción y cobertura) están integrados en `main`. PR #19 propone la corrección de Cubinja y PR #20 propone Hurto Sigiloso de Racubitero, ambos sobre ramas creadas desde el `main` actual. PR #12, #14 y #17 son propuestas antiguas que no deben fusionarse. PR #15 y #18 siguen abiertos. Los checks de Vercel disponibles para estas propuestas están fallando por la cuota del equipo (más de 100 despliegues en 24 horas); esto no es un diagnóstico de compilación.

Para PR #19 y PR #20 se realizó revisión estática de los cambios y de las definiciones actuales de cartas/manos. No se han ejecutado `npm run lint`, `npm run build` ni partidas manuales; no considerar estas mecánicas validadas funcionalmente hasta completar esas verificaciones.

Pruebas manuales de PR #19: (1) Cubinja no puede activar cartas Truco ni preparar posturas desde la arena; (2) la restricción se mantiene en reacciones; (3) los bots no usan trucos con Cubinja; (4) su coincidencia defensiva roba como máximo una carta si hay espacio, pero no bloquea por sí misma el daño; (5) no cura ni abre reacción; (6) las posturas preparadas quedan inactivas mientras Cubinja esté activa; (7) IDs 17 y 19 siguen funcionando para personajes normales.

Pruebas manuales de PR #20: (1) daño efectivo sin 5 roba una carta real de la mano del rival; (2) 5 natural intenta robar dos; (3) atacante sin espacio no roba; (4) objetivo sin cartas no produce robo; (5) atacante con un único espacio no supera su límite; (6) las cartas robadas desaparecen de la mano original y llegan al atacante sin duplicarse; (7) las recompensas por umbrales de vida se resuelven después del hurto respetando espacios restantes; (8) si el hurto libera espacio al objetivo, un robo independiente que le corresponda puede utilizar ese espacio.

Para PR #16, la prueba manual debe verificar: (1) Intercepción consume exactamente 1 AP; (2) solo ofrece aliados vivos del mismo equipo; (3) después de activar en R no permite activar en R+1 y queda disponible desde R+2 si la cobertura anterior se completó; (4) un fallo de dado mantiene la cobertura y redirige el siguiente ataque al mismo Gladiacubon; (5) un Bloqueo Perfecto la libera; (6) si muere el aliado o Gladiacubon cambia de forma/muere, la cobertura se limpia; (7) la IA no crea coberturas duplicadas. El segundo objetivo de Aliento queda como caso pendiente documentado arriba.
