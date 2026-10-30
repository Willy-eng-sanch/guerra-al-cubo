# Auditoría de habilidades y pasivas — Guerra Cúbita

Fecha: 2026-10-30
Rama auditada: `fix/flaucubista-d5-y-auditoria`

## Hallazgos confirmados

### Habilidades activas
En `src/App.tsx`, el controlador `handleUseHeroAbility` tiene ejecución específica para:
- **Cubito de Hielo:** aplica `isFrozen` y enfriamiento 2.
- **Pirata:** aplica `isFrozen` y enfriamiento 3; debe revisarse que la duración coincida con la pérdida de turno descrita.
- **Flaucubista Desafinado:** apuesta, daño de área y autocastigo. Esta rama corrige la tirada a D5 real (1–5).

Los otros diez personajes pasan por una rama genérica que solo registra el nombre y la descripción de su habilidad, sin ejecutar el efecto descrito: Hada al Cubo, Cubogro, Gladiacubon, Dracubon, Racubitero, Cubinarca, Cubinja, Cubícula, Tramcuboso y Cambiaformas.

### Pasivas: lógica parcial encontrada
- **Cubogro:** duplicación de tiradas de ataque 1–3 codificada. Restricción de no usar/robar/equipar cartas pendiente de verificación.
- **Tramcuboso:** doble tirada implementada en ataque y defensa; selección de carta doble al robar pendiente.
- **Cubinja:** suma dos dados en ataque y tiene ranuras ilimitadas en varios puntos. Prohibición de trucos y regla especial de bloqueo pendientes de verificación.
- **Gladiacubon:** reducción de daño >=3 y ranura extra aparecen implementadas.
- **Racubitero:** robo al causar daño y robo doble con resultado 5 aparecen implementados.
- **Hada al Cubo:** límite de mano y dos ranuras contemplados; Suministro Mágico pendiente.
- **Flaucubista:** Acorde Violento no aparece conectado al daño recibido ni al siguiente ataque en el flujo inspeccionado.
- **Dracubon, Cubinarca, Cubícula y Cambiaformas:** sus efectos de ficha no se encontraron conectados en el flujo de ataque/defensa inspeccionado.

## Corrección incluida
La apuesta del Flaucubista selecciona y tira valores 1–5. Se elimina el disparador de Cara Especial 6 para esta habilidad. El D6 general del combate permanece intacto.

## Próximas tareas
1. Implementar y probar Acorde Violento, incluido el autodaño.
2. Implementar Suministro Mágico con selección de aliado y transferencia real de carta.
3. Resolver Dracubon, Cubícula y Cambiaformas con pruebas de ataque/bloqueo.
4. Implementar órdenes y penalización de Cubinarca con estado persistente.
5. Verificar duración de congelación de Cubito y Mal de Ojo del Pirata.
6. Añadir pruebas automatizadas de daño, bloqueo perfecto, límites de mano y turnos.

## Limitación
Auditoría estática del código remoto. No se ejecutaron build, lint, pruebas automatizadas ni partidas en navegador/Android. No considerar el juego validado en runtime.
