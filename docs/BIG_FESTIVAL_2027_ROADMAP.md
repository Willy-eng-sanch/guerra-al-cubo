# Guerra Cúbita — Ruta BIG Festival 2027

**Inicio del plan:** 30 de octubre de 2026  
**Cierre oficial de inscripciones:** 15 de enero de 2027, 9:59 p. m. EST (9:59 p. m. hora de Colombia, UTC−5).  
**Evento:** 22–25 de abril de 2027, São Paulo, Brasil.  
**Objetivo del proyecto:** entregar una versión Alpha jugable, estable y fácil de evaluar antes del cierre de la convocatoria.

## 1. Enfoque

No vamos a intentar terminar todas las funciones ni reconstruir el proyecto desde cero. La meta es una **demo de festival**: una experiencia compacta que permita a alguien que no conoce Guerra Cúbita iniciar una partida, entender sus decisiones, jugar hasta un resultado y volver a empezar sin ayuda del desarrollador.

La web en el repositorio raíz será la candidata inicial. La ruta prioritaria será una partida local o contra bots. No vamos a condicionar la candidatura a tener multijugador online real, aplicación Android, economía completa, campaña completa o todos los sistemas secundarios pulidos.

### Criterio de alcance

Una función entra en la demo solo si contribuye directamente a:
1. entender cómo se juega;
2. tomar decisiones tácticas interesantes;
3. completar una partida de principio a fin;
4. comunicar la identidad visual y mecánica del juego.

El contenido ya existente se conserva cuando funciona. No añadiremos héroes, modos o sistemas nuevos antes de superar las pruebas de estabilidad, salvo que una prueba demuestre que hacen falta.

## 2. Cronograma de trabajo

| Fechas | Etapa | Entregable verificable |
|---|---|---|
| **30 oct. – 1 nov. 2026** | Arranque y diagnóstico | Rama de trabajo, plan documentado, alcance provisional y línea base del repositorio. |
| **2 – 8 nov.** | Base técnica | CI de solo lectura, instalación reproducible con `npm ci`, TypeScript y build en verde. |
| **9 – 15 nov.** | Bucle principal | Partida desde configuración hasta victoria/derrota y reinicio; lista de errores bloqueantes. |
| **16 – 22 nov.** | Comprensión del juego | Flujo de primera partida, instrucciones contextuales y explicación de dados, Cúbits, cartas y turnos. |
| **23 – 29 nov.** | Legibilidad y ritmo | Pantallas de preparación y combate más claras; revisión de duración y puntos de confusión. |
| **30 nov. – 6 dic.** | Pulido de demo | Interfaz responsive, lectura visual de estados, feedback de acciones y revisión de audio/animaciones. |
| **7 – 13 dic.** | Alpha interna | Build etiquetada, checklist de regresión y primera ronda de pruebas estructuradas. |
| **14 – 20 dic.** | Pruebas externas | Entre 5 y 8 personas prueban sin instrucciones del autor; registrar dónde se atascan y qué no entienden. |
| **21 – 27 dic.** | Correcciones críticas | Resolver los problemas que impiden empezar, entender, terminar o reiniciar. Mantener margen por fiestas. |
| **28 dic. – 3 ene. 2027** | Candidata RC1 | Versión descargable o enlace web estable, pruebas desde otro dispositivo/conexión y plan de respaldo. |
| **4 – 10 ene.** | Materiales de candidatura | Tráiler de gameplay, capturas, descripción en inglés, créditos, derechos y declaración transparente de uso de IA. |
| **11 – 14 ene.** | Validación final y envío | Prueba de aceptación externa, formulario completo y candidatura enviada antes del último día. |
| **15 ene.** | Fecha límite | Día de contingencia solamente; no planificar el envío para los últimos minutos. |
| **16 ene. – 21 abr.** | Preparación de exhibición | Corregir problemas, conservar una build estable, preparar instrucciones y versión de respaldo. |
| **22 – 25 abr.** | BIG Festival | Presentación del juego si es seleccionado; preparación para que visitantes puedan jugarlo. |

## 3. Qué debe incluir la demo

### Imprescindible para postular
- Una versión que la organización pueda ejecutar y evaluar sin asistencia del autor.
- Un flujo de partida completo: iniciar, jugar turnos, resolver combate, determinar el final y volver a empezar.
- Reglas consistentes y mensajes que expliquen por qué una acción está permitida o bloqueada.
- Un modo de prueba fiable que no dependa de servidores online ni de encontrar otros jugadores.
- Un enlace de acceso o descarga probado desde una sesión/dispositivo distinto al del desarrollo.
- Un tráiler alojado en YouTube o Vimeo que muestre gameplay real.
- Descripción y materiales de candidatura en inglés, junto con créditos y declaraciones de derechos/uso de IA.

### Fuera del camino crítico
- Multijugador por Internet con matchmaking.
- Aplicación Android/Capacitor como requisito para postular.
- Rehacer toda la arquitectura de `src/App.tsx`.
- Ampliar el catálogo de héroes, cartas o modos.
- Monetización, tienda o economía persistente, salvo que un elemento de la demo dependa de ello.

## 4. Pruebas de aceptación

La demo estará lista para enviar cuando cumpla todo lo siguiente:

- [ ] Una persona nueva puede iniciar una partida sin instrucciones verbales.
- [ ] La partida puede completarse hasta un resultado final y permite comenzar otra.
- [ ] No hay errores críticos, bloqueos ni pérdida de estado que impida continuar.
- [ ] Las reglas de combate y las restricciones principales se pueden entender desde la interfaz.
- [ ] Se puede jugar en navegador de escritorio y en una pantalla móvil razonable; los fallos visuales no ocultan controles.
- [ ] La build y el enlace funcionan desde una conexión/dispositivo externo.
- [ ] El tráiler muestra la versión candidata, no una visión ficticia del juego.
- [ ] Los créditos, licencias, recursos de terceros y uso de IA están documentados con honestidad.
- [ ] El formulario se envía con margen antes del cierre oficial.

## 5. Ritmo de trabajo y control

- Al comienzo de cada semana: elegir un resultado principal y limitar el trabajo a ese resultado.
- Al final de cada semana: registrar qué se completó, qué falló y qué se mueve de prioridad.
- Prioridad de defectos: **P0** impide jugar o rompe reglas; **P1** confunde o bloquea un flujo importante; **P2** es pulido no esencial.
- No se fusionan cambios a `main` sin revisión y autorización explícita.
- Cada versión candidata debe poder identificarse por commit y fecha.
- Si el calendario se aprieta, se recorta contenido o pulido secundario; no se sacrifica la posibilidad de jugar y evaluar una partida completa.

## 6. Línea base al 30 de octubre de 2026

- El repositorio principal es `Willy-eng-sanch/guerra-al-cubo`, rama predeterminada `main`.
- Las PR #25 (rediseño de habilidades, Pila General y límites de inventario) y #26 (guardas de resolución de combate y controles de calidad) ya aparecen fusionadas.
- En la validación consultada, el workflow ejecutó con éxito instalación, TypeScript y compilación de producción en el head de la PR #26; Vercel también reportó checks correctos en el commit de merge.
- `src/App.tsx` continúa concentrando una parte considerable de la lógica de juego. No se realizará una extracción arquitectónica extensa antes de la candidatura salvo necesidad demostrada por defectos.
- El workflow de calidad anterior podía escribir en el repositorio y regenerar/comitear el lockfile desde CI. En esta rama se simplifica para que CI solo lea y valide; los cambios de dependencias se hacen mediante commits normales.

## 7. Referencias oficiales

- [BIG Festival — reglas oficiales](https://latam.gamescom.global/en/big-festival-rules/)
- [BIG Festival — página oficial](https://latam.gamescom.global/en/big-festival-en/)
- [Formulario oficial de inscripción](https://festival.bigfestival.com.br/)

Las condiciones, categorías y fechas deben volver a comprobarse en el sitio oficial antes de enviar la candidatura.
