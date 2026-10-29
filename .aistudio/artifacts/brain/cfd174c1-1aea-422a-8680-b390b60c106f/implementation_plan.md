# Plan de Lanzamiento Oficial: Guerra Cubita Beta 1.0

Plan integral de preparación y pulido para el lanzamiento público de **Guerra Cubita**. Basado en la auditoría completa del juego (combate D6, sinergias, multijugador demo y tienda solidaria), este plan detalla las 4 áreas esenciales que transforman la experiencia en un producto con alta retención, ambientación inmersiva y accesibilidad inmediata para nuevos usuarios.

---

## Decisiones Críticas y Resumen de Revisión

> [!IMPORTANT]
> **Estado Actual del Juego:** El motor táctico, las 50 cartas, los 13 dados con rotoscopia/spriting reactivo, la animación de refriega en caricatura sobre el tablero fotográfico (`tablero_0937dc37.jpeg`), el multijugador online (salas y demo rápida) y la tienda solidaria con cajas de 3 dados y rango de Aura están **100% funcionales y compilados**.
>
> Para el **lanzamiento oficial**, las siguientes adiciones completan el ciclo de vida del jugador y su retención:

- **Decisión 1 (Retención Diaria):** Implementar **Bounties de Asfalto (Misiones Diarias)** y **Racha de Conexión (Daily Streak)** con recompensas de monedas, puntos de Aura y cajas de 3 dados para incentivar el regreso diario.
- **Decisión 2 (Atmósfera Sonora):** Agregar un generador de **Beats Urbanos Callejeros Lo-Fi** (usando Web Audio API con síntesis nativa, sin dependencias pesadas de audio externo) con control de volumen y botón de silenciado, complementando los efectos de golpes y caricatura ya existentes.
- **Decisión 3 (Onboarding & FTUE):** Indicadores tácticos sutiles en la primera partida (tooltip/banner flotante que guía los 3 pasos de turno: 1. Tirada D6 → 2. Selección de Blanco → 3. Ataque o Carta) para que nadie se pierda en su debut.
- **Decisión 4 (Ajustes de Calidad de Vida):** Botón de revancha instantánea en duelos online y selector de velocidad de animación rápida (1x / 1.5x / 2x) para jugadores veteranos.

---

## 1. Visión General & Propuesta de Valor

- **Experiencia de Juego:** Un juego de estrategia táctica callejera por turnos donde dados D6 con identidades caricaturescas luchan en una mesa de barrio apostando respeto, cartas y Aura.
- **Público Objetivo:** Jugadores casuales y competitivos que disfrutan de juegos de dados (tipo Yahtzee/King of Tokyo), juegos de cartas coleccionables y estética urbana cómica.
- **Modelo de Negocio Ético:** Demo aleatoria gratis ilimitada + progresión por habilidad/Aura + modelo "Paga lo que Quieras" para patrocinadores sin barreras abusivas (pay-to-win cero).

---

## 2. Experiencia de Usuario & Diseño Visual

### Flujos Principales Nuevos

1. **Racha Diaria al Iniciar (Daily Login Bonus):**
   - Al abrir el juego por primera vez en el día, una ventana emergente de estilo cómic muestra el calendario de 7 días.
   - El jugador reclama su recompensa diaria con un solo toque (Monedas, Cajas de dados o Bonos de Aura) con confeti y sonido festivo.
2. **Panel de Misiones de Asfalto (Daily Bounties):**
   - Accesible desde el menú principal y el lobby multijugador mediante un botón con indicador de progreso (ej. `2/3 Completadas`).
   - 3 misiones aleatorias diarias (ej. *Ejecuta 2 bloqueos perfectos*, *Gana 1 combate con dados de clase Pícaro*, *Juega 4 cartas tácticas*).
   - Barra de progreso interactiva con botón de reclamo instantáneo.
3. **Beats Callejeros & Barra de Audio:**
   - La barra de control de audio superior incluye un reproductor con selector de tempo/groove urbano y deslizador de volumen de música independiente del de efectos especiales.
4. **Guía Rápida Flotante en Combate (FTUE):**
   - Un banner no intrusivo en la esquina inferior durante la primera partida que resalta la acción recomendada: *"Paso 1: ¡Lanza tus dados!"* → *"Paso 2: ¡Elige a quién atacar!"* → *"Paso 3: ¡Juega una carta o embiste!"*.

---

## 3. Arquitectura Técnica & Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                          APLICACIÓN PRINCIPAL                          │
│                               (App.tsx)                                │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
         ┌──────────┴──────────┐          ┌──────────┴──────────┐
         ▼                     ▼          ▼                     ▼
┌─────────────────┐   ┌─────────────────┐ ┌───────────────┐ ┌───────────┐
│ dailyMissions.ts│   │ dailyStreak.ts  │ │ streetBeat.ts │ │ ArenaScreen │
│ (3 Retos Diarios│   │ (Calendario 7D  │ │ (Sintetizador │ │ (FTUE Guía  │
│  con Progreso y │   │  con Racha y    │ │  Web Audio    │ │  y Acción   │
│  Reclamaciones) │   │  Recompensas)   │ │  Lo-Fi Beats) │ │  Rápida)    │
└────────┬────────┘   └────────┬────────┘ └───────┬───────┘ └─────┬─────┘
         │                     │                  │               │
         ▼                     ▼                  ▼               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        COLLECTION MANAGER                              │
│              (Aura, Monedas, Cajas y Desbloqueos D6)                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Módulos a Crear / Actualizar

1. **`src/data/dailyMissionsManager.ts`**:
   - Generación determinista de 3 misiones diarias basada en la fecha del sistema (`YYYY-MM-DD`).
   - Métodos para escuchar eventos de combate (`recordDamage`, `recordBlock`, `recordCardPlayed`, `recordVictory`).
   - Reclamación de recompensas sincronizada con `collectionManager`.
2. **`src/components/DailyMissionsModal.tsx`**:
   - Modal estilo fanzine callejero con pestañas de *Misiones Diarias* y *Racha de 7 Días*.
3. **`src/audio/streetBeatManager.ts`**:
   - Sintetizador de loops rítmicos estilo Lo-Fi Hip-Hop usando Web Audio API (bombo, caja con escobilla, hi-hat y bajo de 808 suave).
   - Cero dependencias externas y carga instantánea sin latencia de red.
4. **`src/components/FTUECombatGuide.tsx`**:
   - Indicador contextual en la arena para jugadores novatos que se oculta automáticamente tras 2 partidas.

---

## 4. Plan de Verificación & Pruebas

- [ ] **Misiones Diarias:** Probar que las misiones avanzan automáticamente durante los ataques, bloqueos y uso de cartas en la arena.
- [ ] **Racha Diaria:** Verificar que el día de racha se guarda en `localStorage` y no se puede reclamar dos veces en el mismo día.
- [ ] **Sintetizador de Ritmo:** Probar arranque, pausa, cambio de volumen y que no interfiera con los sonidos de golpes o refriega.
- [ ] **Modos de Juego:** Probar que la Demo Aleatoria, el Modo Campaña y las Salas Privadas Online sigan funcionando al 100%.
- [ ] **Compilación:** Ejecutar `lint_applet` y `compile_applet` asegurando 0 errores de TypeScript y empaquetado de producción.
