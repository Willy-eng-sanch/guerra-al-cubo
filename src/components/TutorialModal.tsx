import React from 'react';
import { X, BookOpen, ShieldAlert, Award, Sparkles } from 'lucide-react';

interface TutorialModalProps {
  onDismiss: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onDismiss }) => {
  return (
    <div className="gc-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#141823] border border-[#2d374d] rounded-2xl p-6 shadow-2xl text-left">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-yellow-400 font-black text-xl mb-3">
          <BookOpen className="w-6 h-6" />
          <span>REGLAS OFICIALES: GUERRA CUBITA</span>
        </div>

        <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
          {/* Rule 1 */}
          <div className="bg-[#1b2130] p-3 rounded-xl border border-[#2b354c]">
            <h4 className="font-extrabold text-sm text-cyan-400 mb-1 flex items-center gap-1.5">
              <span>1. Objetivos y Puntos de Acción (AP)</span>
            </h4>
            <p>
              Cada personaje inicia con sus HP máximos (20 HP por defecto; Cubogro inicia con 25 HP) y recibe <b className="text-yellow-400">2 Acciones</b> al inicio de cada turno.
              Gana el último personaje o cubo que quede con vida en la arena.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="bg-[#1b2130] p-3 rounded-xl border border-[#2b354c]">
            <h4 className="font-extrabold text-sm text-red-400 mb-1 flex items-center gap-1.5">
              <span>2. El Dado D6 y Bloqueo Perfecto</span>
            </h4>
            <p>
              Los ataques y defensas normales se resuelven con dados de 6 caras (D6, valores del 1 al 6). Excepción: la apuesta especial del Flaucubista usa D5 (valores del 1 al 5).
              Si el defensor saca <b>exactamente el mismo número</b> que el atacante, logra un <b className="text-cyan-300">¡Bloqueo Perfecto!</b> (0 daño recibido y roba 1 carta del mazo).
            </p>
          </div>

          {/* Rule 3 */}
          <div className="bg-[#1b2130] p-3 rounded-xl border border-[#2b354c]">
            <h4 className="font-extrabold text-sm text-yellow-400 mb-1 flex items-center gap-1.5">
              <span>3. Umbrales de Daño (Múltiplos de 5)</span>
            </h4>
            <p>
              Cuando el HP de un rival cruza hacia abajo los umbrales de <b className="text-white">15, 10 o 5 HP</b>, el atacante roba inmediatamente 1 carta de bonificación por castigar su resistencia.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="bg-[#1b2130] p-3 rounded-xl border border-[#2b354c]">
            <h4 className="font-extrabold text-sm text-emerald-400 mb-1 flex items-center gap-1.5">
              <span>4. Armas y Trucos (Acción vs Postura Preparada)</span>
            </h4>
            <p>
              <b className="text-amber-400">• Armas (1-30):</b> Se equipan en tu mesa (1 slot base) y dan mejoras pasivas permanentes a tus ataques y defensas.
            </p>
            <p className="mt-1">
              <b className="text-cyan-400">• Trucos de Acción (31-60):</b> Efectos inmediatos como curaciones, robos o interrupciones.
            </p>
            <p className="mt-1">
              <b className="text-purple-400">• Posturas Preparadas (Stances):</b> Se colocan boca abajo/preparadas y se activan automáticamente como reacción defensiva al recibir un golpe.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="bg-[#1b2130] p-3 rounded-xl border border-[#2b354c]">
            <h4 className="font-extrabold text-sm text-purple-400 mb-1 flex items-center gap-1.5">
              <span>5. 13 Personajes Únicos</span>
            </h4>
            <p>
              Cada cubo tiene habilidades distintivas (ej: <b>Tramcuboso</b> tira 2D6 y escoge el mejor, <b>Cubinja</b> suma 2D6 en ataque y equipa armas infinitas, <b>Cubogro</b> duplica daños de 1, 2 y 3).
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full mt-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-black text-xs rounded-xl tracking-wider transition-all"
        >
          ¡ENTENDIDO, A COMBATIR!
        </button>
      </div>
    </div>
  );
};
