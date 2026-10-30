# Auditoría de habilidades y pasivas — Guerra Cúbita

Fecha: 2026-10-30
Rama auditada: `fix/mecanicas-y-reglas-d6`

## Hallazgos confirmados en el código

### Habilidades activas
El controlador `handleUseHeroAbility` de `src/App.tsx` tiene ramas de ejecución específicas para:
- **Cubito de Hielo:** aplica `isFrozen` y enfriamiento 2.
- **Pirata:** también aplica `isFrozen` y enfriamiento 3. La ficha describe pérdida de turno; hay que revisar el ciclo de congelación para garantizar que ambos estados se consuman con la duración correcta.
- **Flaucubista Desafinado:** ejecuta apuesta, daño de área y autocastigo. Corregido en esta rama para usar D5 real (1–5), conforme a la ficha.

Para los demás personajes, el controlador cae en una rama genérica que solo escribe el nombre y la descripción de la habilidad en el registro de combate; no ejecuta el efecto descrito. Esto afecta a Hada al Cubo, Cubogro, Gladiacubon, Dracubon, Racubitero, Cubinarca, Cubinja, Cubícula, Tramcuboso y Cambiaformas.

### Pasivas: lógica parcial encontrada
- **Cubogro:** duplicación de tiradas de ataque 1–3 está codificada en el cálculo de ataque. La restricción de no usar/robar/equipar cartas requiere auditoría adicional.
- **Tramcuboso:** doble tirada está implementada en ataque y defensa; la selección de carta doble al robar requiere revisión.
- **Cubinja:** suma dos dados en ataque y tiene ranuras ilimitadas en varios puntos de la interfaz/lógica. La prohibición de trucos y la regla especial de bloqueo necesitan verificación.
- **Gladiacubon:** reducción de daño >=3 y ranura extra aparecen implementadas.
- **Racubitero:** robo al causar daño y robo doble con resultado 5 aparecen implementados.
- **Hada al Cubo:** límite de mano y dos ranuras están contemplados; la habilidad de suministro requiere implementación.
- **Flaucubista:** la pasiva Acorde Violento no aparece conectada al daño recibido ni al próximo ataque en el flujo inspeccionado.
- **Dracubon, Cubinarca, Cubícula y Cambiaformas:** sus efectos de ficha no se encontraron conectados en el flujo de ataque/defensa inspeccionado.

## Corrección aplicada en esta rama
La apuesta del Flaucubista ahora elige y tira valores entre 1 y 5. Se eliminó el disparador de Cara Especial 6 de esta habilidad, ya que el D5 no puede producir un 6. El D6 general del combate permanece intacto.

## Próximas tareas recomendadas
1. Implementar y probar Acorde Violento (autodaño incluido).
2. Implementar Suministro Mágico con selección de aliado y transferencia real de carta.
3. Resolver los efectos de Dracubon, Cubícula y Cambiaformas con pruebas de ataque/bloqueo.
4. Implementar órdenes y penalización de Cubinarca con estado persistente y condición clara de cumplimiento.
5. Corregir y probar la duración de congelación de Cubito y Mal de Ojo del Pirata.
6. Añadir pruebas automatizadas de resolución de daño, bloqueo perfecto, límites de mano y turnos.

## Limitación de validación
Esta auditoría es estática: se inspeccionó el código fuente remoto y se verificaron los cambios escritos en la rama. No se ejecutaron build, lint, pruebas automatizadas ni partidas en navegador/Android. No considerar el juego validado en runtime todavía.
