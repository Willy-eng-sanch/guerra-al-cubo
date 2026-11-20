# Diseño del juego y sistemas

Este documento es un mapa de sistemas, no una afirmación de que todas las reglas estén completas o equilibradas. Las reglas definitivas deben contrastarse con el código actual, las pruebas y las partidas reproducibles.

## 1. Bucle de partida

El bucle general a documentar y validar es:

1. Configurar modo, participantes y personajes.
2. Inicializar estado, HP, recursos, mazos, inventarios y orden de turno.
3. Resolver turnos y acciones disponibles.
4. Ejecutar ataques, defensas, habilidades, estados y efectos.
5. Actualizar estadísticas, objetivos y condiciones de victoria.
6. Registrar eventos deterministas para diagnóstico/replay.
7. Cerrar la partida una sola vez y guardar el replay cuando corresponda.
8. Mostrar resultado y permitir revisar la partida guardada.

Cada fase debe tener invariantes y pruebas propias.

## 2. Sistemas principales

| Sistema | Preguntas que debe responder su documentación |
|---|---|
| Turnos | ¿Cómo se determina el siguiente jugador? ¿Cómo se saltan eliminados o turnos perdidos? |
| Dados | ¿Qué tipos de tiradas existen? ¿Qué efectos tienen los resultados especiales? |
| Puntos de acción | ¿Qué acciones consumen AP y cuándo se confirma el coste? |
| HP y daño | ¿Cómo se aplican reducción, barrera, reflejo, curación y eliminación? |
| Estados | ¿Cuándo se aplican, consumen y eliminan congelación y otros estados? |
| Personajes | ¿Cuáles son sus atributos, activa, pasiva, límites y excepciones? |
| Cartas y armas | ¿Cómo se roban, equipan, transfieren, descartan y recuperan? |
| Bots | ¿Qué decisiones pueden tomar y cómo se validan? |
| Replays | ¿Qué eventos se registran y cómo se reconstruye el mismo resultado? |
| Progresión | ¿Qué efectos persistentes se acreditan y cuáles deben bloquearse durante replay? |

## 3. Principios de reglas

- Toda acción debe tener precondiciones explícitas.
- El coste de una acción debe consumirse una sola vez.
- Los efectos deben aplicarse en un orden documentado.
- Una partida terminada no puede seguir aceptando acciones.
- Las eliminaciones y el cierre de partida deben ser idempotentes.
- El azar que afecta al resultado debe registrarse y reproducirse.
- Una repetición no debe volver a acreditar progresión persistente.
- Los bots deben respetar las mismas reglas y restricciones que las personas.
- Las reglas críticas deben tener pruebas de casos límite.

## 4. Personajes, cartas y habilidades

Mantener una ficha por personaje:

- Identificador estable.
- Nombre y descripción originales.
- Atributos iniciales y escalado.
- Habilidad activa: coste, objetivo, precondiciones, efecto, duración, límites.
- Habilidad pasiva: disparador, prioridad, efecto, exclusiones.
- Interacciones conocidas y anti-sinergias.
- Comportamiento de bot.
- Pruebas automatizadas.
- Estado de balance y versión.

Mantener una ficha por carta/arma:

- Identificador estable y categoría.
- Coste o requisito.
- Zona/inventario donde puede estar.
- Efecto y duración.
- Restricciones de equipamiento y transferencia.
- Interacciones con estados, habilidades y modos.
- Pruebas y datos de balance.

## 5. Modelo futuro de sinergias y afinidades

La propuesta de sistema híbrido de afinidades, sinergias, anti-sinergias, habilidades de clase y rasgos pasivos es una línea de diseño pendiente, no una característica que deba darse por implementada.

Las ideas de cadenas de cartas, cubitos extra y cargas de habilidad inspiradas en juegos de mesa deben tratarse como hipótesis. Antes de integrarlas:
1. definir el problema estratégico que resuelven;
2. crear prototipos de reglas originales;
3. revisar compatibilidad con el modelo actual de inventarios y AP;
4. medir frecuencia de activación y ventaja;
5. probar exploits y combinaciones degeneradas;
6. decidir si pertenecen al modo principal, campaña o colección.

## 6. Marco de balance

Para cada cambio registrar:

- Problema observado y evidencia.
- Personajes/cartas/modos afectados.
- Hipótesis de causa.
- Cambio propuesto y alternativas descartadas.
- Casos de prueba y escenarios de partida.
- Impacto esperado en tasa de victoria, duración, uso y diversidad.
- Riesgos de dominancia, bucles infinitos o estrategias no interactivas.
- Resultados antes/después.
- Decisión final y fecha de reevaluación.

No ajustar balance únicamente por una anécdota aislada. Una partida real puede descubrir un defecto; una conclusión de balance necesita más evidencia.

## 7. Replays como herramienta de calidad

El replay debe ser una fuente de casos reproducibles:
- guardar versión del juego y metadatos suficientes;
- distinguir eventos, acciones y resultados aleatorios;
- comprobar checkpoints/estado;
- detectar divergencias con claridad;
- permitir compartir logs de diagnóstico sin exponer datos personales;
- evitar que reproducir partidas altere progresión o inventarios persistentes.

La exportación de logs/replays es una herramienta técnica. La experiencia normal del jugador debe seguir siendo abrir Mis partidas y reproducir sus partidas guardadas.


## 8. Propuestas de diseño previamente planteadas — backlog, no implementado

Las siguientes ideas forman parte de la dirección de diseño discutida para el proyecto. Se registran como propuestas pendientes de auditoría de compatibilidad con el código, no como funcionalidades existentes.

### Modelo híbrido de afinidades
- Diseñar relaciones entre cartas y sistemas, no limitarse a una tabla de debilidades entre personajes.
- Distinguir sinergias, anti-sinergias, habilidades activas de clase, pasivas de clase y rasgos pasivos.
- Evaluar campaña y colección como ámbitos de progresión.
- Evitar ventajas automáticas rígidas: cada interacción debe tener contrajuego y condiciones claras.

### Encadenamiento y cargas
- Explorar cadenas de cartas que conecten, mejoren o infundan habilidades en otras cartas.
- Evaluar cubitos adicionales y cargas de habilidad como recursos con límites explícitos.
- La referencia de diseño es la experiencia de conectar y mejorar cartas en juegos de mesa; la implementación y presentación deben ser originales.
- La mano objetivo propuesta es de cuatro cartas; revisar impacto en ritmo, probabilidad de robo y economía antes de cambiar el límite actual.

### Roles propuestos
- **Hada al Cubo:** explorar robo de cartas y préstamo de cargas de habilidad, con variantes de préstamo que puedan beneficiar tanto a la propia Hada como a aliados. Debe definirse si la carga se presta temporalmente, se transfiere o se duplica, y cómo se devuelve/consume.
- **Cubinja:** explorar encadenamiento de armas y potenciadores de dados. La limitación de encadenamiento debe compensarse con números/estadísticas inferiores, evitando que la restricción resulte una desventaja neta.
- **Recuperación de mano:** se propuso un modelo mixto; falta definir disparadores, frecuencia, límites por turno y condiciones para evitar bucles de robo.

### Puerta de entrada a implementación
Cada propuesta debe tener:
1. especificación de reglas con ejemplos;
2. revisión del modelo de datos y del inventario actual;
3. análisis de compatibilidad con bots y replay determinista;
4. pruebas de abuso, bucles y casos límite;
5. prototipo aislado;
6. decisión de diseño y balance antes de integrarla al modo principal.
