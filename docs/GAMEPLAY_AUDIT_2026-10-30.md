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
- **Cubinja (corrección mainline propuesta en PR #19):** Avaricia bloquea las cartas Truco y posturas en acciones normales, reacciones y decisiones de bots. La coincidencia defensiva concede una carta si hay espacio, pero no bloquea ni reduce por sí misma el daño, no cura y no abre reacción; las armaduras y barreras ajenas a Avaricia siguen aplicando. Las posturas preparadas quedan suspendidas mientras Cubinja está activa. Se alinearon los IDs de La Cortina de Mugre (17) y El Esquive de Callejón (19) con `src/data/cards.ts`. Requiere pruebas funcionales. PR #12 y #17 son propuestas duplicadas basadas en ramas antiguas; no fusionarlas.
- **Gladiacubon (PR #13 integrado; Intercepción en este PR #16):** Coraza reduce daño de ataques directos, Aliento y daño reflejado; tiene dos ranuras de arma y comienza con una equipada. Intercepción consume 1 AP y permite elegir un aliado vivo del mismo escuadrón. Los ataques directos dirigidos a ese aliado se redirigen a Gladiacubon, que lanza su propio dado. La cobertura permanece activa hasta que consigue un Bloqueo Perfecto; los fallos no la consumen. Tras activarla, la siguiente ronda queda bloqueada y puede volver a activarse desde la ronda posterior, siempre que la cobertura anterior ya se haya completado. La IA también intenta cubrir a un aliado sin protección. **Límite conocido:** falta resolver el caso de Aliento en el que el aliado protegido es únicamente el segundo objetivo, porque Aliento comparte una sola tirada de bloqueo para ambos rivales.
- **Racubitero (corrección mainline propuesta en PR #21):** Hurto Sigiloso transfiere desde la mano del rival que recibió daño efectivo una carta, o hasta dos cuando el ataque incluye un 5 natural. Solo cuenta como daño efectivo la pérdida real de HP después de bloqueo, reducciones y barreras; un impacto absorbido por completo no activa el hurto. La cantidad transferida está limitada por el espacio libre del atacante y las cartas reales del objetivo. Los robos independientes del mazo se calculan después de la transferencia y respetan ambas capacidades de mano. Desarme en Cadena y Vaciado de Bolsillo siguen pendientes. PR #14 y #20 son propuestas antiguas sobre bases desactualizadas; no fusionarlas.
- **Cambiaformas (PR #15 abierto):** Mimetismo cambia de forma al inicio de cada ronda a otro personaje vivo; conserva estado y ajusta mano/equipo a los límites de la nueva forma. Transmutación Total sigue pendiente.
- **Cubito de Hielo y Pirata:** verificar exactamente cuánto dura la congelación/anulación de turno y sus efectos sobre bloqueo.
- **Flaucubista:** revisar que Acorde Violento acumule bono con todas las fuentes de daño definidas por las reglas.
- **Órdenes de Cubinarca:** probar órdenes en combate individual, escuadras, contra bots y entre jugadores humanos; la integración en `main` no sustituye esas pruebas.

## Verificación técnica

PR #13 (Coraza de Gladiacubon) y PR #16 (Intercepción y cobertura) están integrados en `main`. PR #19 propone la corrección de Cubinja; PR #21 propone Hurto Sigiloso de Racubitero sobre una rama creada desde el `main` actualizado. PR #12, #14, #17 y #20 son propuestas antiguas o sustituidas y no deben fusionarse. PR #15 y #18 siguen abiertos. Las vistas previas de Vercel están limitadas por la cuota del equipo (más de 100 despliegues en 24 horas), lo que no constituye un diagnóstico de compilación.

Para PR #19 y PR #21 se realizó revisión estática de los cambios y de las definiciones actuales. No se han ejecutado `npm run lint`, `npm run build` ni partidas manuales; no considerar estas mecánicas validadas funcionalmente hasta completar esas verificaciones. Además, `package.json` y la raíz de `package-lock.json` no están sincronizados: faltan `@types/three` y `three` en el lockfile y difieren varios rangos de versiones. Hay que regenerar y verificar el lockfile antes de depender de `npm ci` o afirmar que la instalación es reproducible.

Pruebas manuales de PR #19: (1) Cubinja no puede activar cartas Truco ni preparar posturas desde la arena; (2) lo mismo ocurre en reacciones; (3) los bots no preparan ni activan trucos con Cubinja; (4) una coincidencia defensiva roba como máximo 1 carta si hay espacio, pero aplica daño y no cura; (5) la coincidencia no abre reacción; (6) una postura previamente preparada queda inactiva mientras Cubinja sea el personaje activo; (7) La Cortina de Mugre (17) y El Esquive de Callejón (19) se consumen correctamente para personajes que sí pueden usar posturas.

Pruebas manuales de PR #21: (1) un ataque de Racubitero que reduzca HP del defensor sin un 5 natural transfiere una carta; (2) un 5 natural transfiere hasta dos; (3) daño absorbido íntegramente por barrera no activa el hurto; (4) atacante con mano llena no roba; (5) objetivo sin cartas no pierde cartas; (6) atacante con un único espacio solo recibe una; (7) las cartas salen de la mano original y llegan una sola vez al atacante; (8) las recompensas por umbrales se resuelven después del hurto usando los espacios restantes del atacante; (9) si el hurto libera espacio al objetivo, una recompensa independiente que le corresponda puede ocupar ese espacio.

Para PR #16, la prueba manual debe verificar: (1) Intercepción consume exactamente 1 AP; (2) solo ofrece aliados vivos del mismo equipo; (3) después de activar en R no permite activar en R+1 y queda disponible desde R+2 si la cobertura anterior se completó; (4) un fallo de dado mantiene la cobertura y redirige el siguiente ataque al mismo Gladiacubon; (5) un Bloqueo Perfecto la libera; (6) si muere el aliado o Gladiacubon cambia de forma/muere, la cobertura se limpia; (7) la IA no crea coberturas duplicadas. El segundo objetivo de Aliento queda como caso pendiente documentado arriba.
