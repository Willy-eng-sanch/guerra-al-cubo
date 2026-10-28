import React, { useState } from 'react';
import { 
  X, 
  Dices, 
  Shield, 
  Swords, 
  Sparkles, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  RotateCw, 
  Zap, 
  Download,
  Info,
  HelpCircle,
  Flame,
  Coins,
  Brain,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { CardCategory, CATEGORY_INFO, CharacterType } from '../types/game';
import { CHARACTERS, CHARACTER_LIST } from '../data/characters';
import { ALL_CARDS } from '../data/cards';
import { Dice3DVisual } from './Dice3DVisual';
import { sound } from '../audio/soundManager';

interface InteractiveTacticalTutorialProps {
  onDismiss: () => void;
  initialTab?: 'TUTORIAL' | 'MANUAL';
}

export const InteractiveTacticalTutorial: React.FC<InteractiveTacticalTutorialProps> = ({ 
  onDismiss,
  initialTab = 'TUTORIAL'
}) => {
  const [activeTab, setActiveTab] = useState<'TUTORIAL' | 'MANUAL'>(initialTab);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Dice simulator state
  const [simAttackerRoll, setSimAttackerRoll] = useState<number>(3);
  const [simDefenderRoll, setSimDefenderRoll] = useState<number>(2);
  const [isSimRolling, setIsSimRolling] = useState<boolean>(false);
  const [simResultText, setSimResultText] = useState<string>(
    "Presiona 'Lanzar Dados de Prueba' para simular un combate y ver si ocurre Bloqueo Perfecto o Cara 6."
  );

  // Step 3: Synergy Lab state
  const [labHeroType, setLabHeroType] = useState<CharacterType>(CharacterType.CUBINJA);
  const [labSelectedClass, setLabSelectedClass] = useState<CardCategory | null>(null);
  const [labFeedback, setLabFeedback] = useState<{
    type: 'SYNERGY' | 'REJECTION' | 'NEUTRAL';
    title: string;
    description: string;
  } | null>(null);

  // Manual Tab search and filter
  const [manualFilterClass, setManualFilterClass] = useState<string>('ALL');
  const [manualSearch, setManualSearch] = useState<string>('');

  const selectedHero = CHARACTERS[labHeroType] || CHARACTERS[CharacterType.CUBINJA];

  // Simulator Roll Handler
  const handleSimRoll = () => {
    if (isSimRolling) return;
    setIsSimRolling(true);
    sound.playDiceRoll();

    setTimeout(() => {
      // Roll random 1-6
      const att = Math.floor(Math.random() * 6) + 1;
      const def = Math.floor(Math.random() * 6) + 1;
      setSimAttackerRoll(att);
      setSimDefenderRoll(def);
      setIsSimRolling(false);

      if (att === def) {
        sound.playPerfectBlock();
        setSimResultText(
          `¡BLOQUEO PERFECTO! Ambos sacaron ${att}. El daño se reduce a 0, el defensor roba 1 carta del mazo al instante y obtiene una acción de interrupción para equipar o usar esa carta.`
        );
      } else if (att === 6 || def === 6) {
        sound.playStanceActivate();
        const who = att === 6 && def === 6 ? '¡Ambos sacaron' : att === 6 ? 'El Atacante sacó' : 'El Defensor sacó';
        setSimResultText(
          `¡TIRADA ESPECIAL DE CARA 6! ${who} 6 en el dado artesanal: puede elegir robar 1 carta extra de la pila o ganar +1 Punto de Acción (Turno Extra).`
        );
      } else {
        sound.playPunchHit();
        const dmg = Math.max(1, att);
        setSimResultText(
          `Ataque efectivo de ${att} vs Defensa de ${def}. Se infligen ${dmg} puntos de daño directo al defensor.`
        );
      }
    }, 600);
  };

  // Lab Card Click Handler
  const handleLabCardClick = (cat: CardCategory) => {
    setLabSelectedClass(cat);
    const catInfo = CATEGORY_INFO[cat];
    const adn = selectedHero.adn;

    const isPrimary = adn.primaria === cat;
    const isSecondary = adn.secundaria === cat;
    const isAnti = adn.antiClases.includes(cat);
    const isNeutral = adn.neutra === cat;

    if (isPrimary || isSecondary) {
      sound.playStanceActivate();
      setLabFeedback({
        type: 'SYNERGY',
        title: `✨ ¡SINERGIA HEROICA ACTIVADA (${catInfo.name})!`,
        description: `Esta carta coincide con la afinidad ${isPrimary ? 'PRIMARIA' : 'SECUNDARIA'} de ${selectedHero.displayName}. Ganas el beneficio de clase: ${catInfo.synergyBonus}`
      });
    } else if (isAnti) {
      sound.playPunchHit();
      setLabFeedback({
        type: 'REJECTION',
        title: `⚠️ ¡RECHAZO DE ADN (ANTISINERGIA)!`,
        description: `¡CUIDADO! La clase ${catInfo.name} es una ANTI-CLASE de ${selectedHero.displayName}. Sufres la penalización inmediata: ${catInfo.rejectionPenalty}`
      });
    } else {
      setLabFeedback({
        type: 'NEUTRAL',
        title: `⚪ CLASE NEUTRA (${catInfo.name})`,
        description: `La carta funciona con normalidad para ${selectedHero.displayName}. No activa bonos de Sinergia ni sufre penalización de Rechazo.`
      });
    }
  };

  // Filter cards for manual tab
  const filteredManualCards = ALL_CARDS.filter(c => {
    const matchCat = manualFilterClass === 'ALL' || c.category === manualFilterClass;
    const matchSearch = manualSearch === '' || 
      c.name.toLowerCase().includes(manualSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(manualSearch.toLowerCase()) ||
      c.synergyEffect.toLowerCase().includes(manualSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#10141e] border-2 border-[#2b374e] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left">
        
        {/* Top Header Bar */}
        <div className="p-4 bg-gradient-to-r from-[#171d2b] to-[#121622] border-b border-[#28344c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-400 text-black font-black">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                  MANUAL TÁCTICO OFICIAL
                </span>
                <span className="text-[10px] text-neutral-400 font-bold hidden sm:inline">
                  Guerra Cubita · GDD
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white font-bungee">
                {activeTab === 'TUTORIAL' ? 'TUTORIAL INTERACTIVO DE INICIO RÁPIDO' : 'MANUAL TÁCTICO & CARTAS'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="bg-[#0b0e14] p-1 rounded-xl border border-[#232c3f] flex items-center gap-1">
              <button
                onClick={() => setActiveTab('TUTORIAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'TUTORIAL'
                    ? 'bg-yellow-400 text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tutorial Práctico
              </button>
              <button
                onClick={() => setActiveTab('MANUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'MANUAL'
                    ? 'bg-yellow-400 text-black shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                GDD & 50 Cartas
              </button>
            </div>

            <button
              onClick={onDismiss}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-all"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ========================================================
              TAB 1: TUTORIAL INTERACTIVO PASO A PASO
             ======================================================== */}
          {activeTab === 'TUTORIAL' && (
            <div className="space-y-6">
              
              {/* Step Navigation Dots */}
              <div className="flex items-center justify-between pb-2 border-b border-[#20293d]">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {[
                    { step: 1, label: '1. Dados & Bloqueo' },
                    { step: 2, label: '2. ADN del Barrio' },
                    { step: 3, label: '3. Laboratorio Sinergias' },
                    { step: 4, label: '4. Acciones & Cobertura' },
                    { step: 5, label: '5. Caleta & Combate' }
                  ].map(s => (
                    <button
                      key={s.step}
                      onClick={() => setCurrentStep(s.step)}
                      className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                        currentStep === s.step
                          ? 'bg-yellow-400 text-black border-yellow-300 shadow'
                          : 'bg-[#151a26] text-neutral-400 border-[#2b354b] hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] font-mono text-neutral-400 font-bold hidden md:inline">
                  Paso {currentStep} de 5
                </span>
              </div>

              {/* STEP 1: DADOS D6/D5 & BLOQUEO PERFECTO */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-[#171d2b] p-4 rounded-2xl border border-[#2b374e]">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Swords className="w-4 h-4 text-amber-400" />
                      <span>Físicas de Dados, Bloqueo Perfecto (Parry) y Cara 6</span>
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                      El combate en la arena se resuelve mediante tiradas de dados de plastilina. El atacante tira para determinar el impacto, y el defensor tira para resistir.
                    </p>
                    <ul className="text-xs text-neutral-300 list-disc list-inside mt-2 space-y-1">
                      <li>
                        <b className="text-yellow-400">Bloqueo Perfecto (Parry):</b> Si el defensor saca <b>exactamente el mismo número</b> que el atacante, el daño recibido es <b>0</b>, roba 1 carta de inmediato y obtiene una acción de interrupción para equiparla o usarla.
                      </li>
                      <li>
                        <b className="text-cyan-400">Cara Especial 6:</b> Si sale un 6, el jugador puede elegir entre <b>robar 1 carta extra</b> o ganar <b>+1 Punto de Acción (Turno Extra)</b>.
                      </li>
                    </ul>
                  </div>

                  {/* Interactive Dice Roll Simulator */}
                  <div className="bg-[#121622] p-5 rounded-2xl border-2 border-dashed border-[#2f3d59] flex flex-col items-center gap-4">
                    <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      Simulador Interactivo de Tiradas
                    </span>

                    <div className="flex items-center justify-center gap-8 sm:gap-16">
                      {/* Attacker Die */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-red-400">Dado Atacante</span>
                        <div className="p-3 bg-[#0a0d13] rounded-2xl border border-red-500/50 shadow">
                          <Dice3DVisual
                            value={simAttackerRoll}
                            size={72}
                            isRolling={isSimRolling}
                            glowColor="#ef4444"
                          />
                        </div>
                        <span className="text-base font-mono font-bold text-white">
                          {isSimRolling ? '?' : `Valor: ${simAttackerRoll}`}
                        </span>
                      </div>

                      <div className="text-xl font-black text-yellow-400 font-bungee">VS</div>

                      {/* Defender Die */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-cyan-400">Dado Defensor</span>
                        <div className="p-3 bg-[#0a0d13] rounded-2xl border border-cyan-500/50 shadow">
                          <Dice3DVisual
                            value={simDefenderRoll}
                            size={72}
                            isRolling={isSimRolling}
                            glowColor="#06b6d4"
                          />
                        </div>
                        <span className="text-base font-mono font-bold text-white">
                          {isSimRolling ? '?' : `Valor: ${simDefenderRoll}`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleSimRoll}
                      disabled={isSimRolling}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-95 text-black font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <RotateCw className={`w-4 h-4 ${isSimRolling ? 'animate-spin' : ''}`} />
                      <span>{isSimRolling ? 'Rodando dados...' : 'Lanzar Dados de Prueba'}</span>
                    </button>

                    <div className="w-full bg-[#181f2f] p-3 rounded-xl border border-[#2c3a54] text-center text-xs text-neutral-200">
                      {simResultText}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: EL SISTEMA DE ADN DEL BARRIO */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-[#171d2b] p-4 rounded-2xl border border-[#2b374e]">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>El Sistema de ADN del Barrio y las 5 Clases</span>
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                      Cada personaje posee un <b>ADN</b> compuesto por su afinidad a las 5 Clases del juego. Este ADN dicta cómo interactúa con el mazo global de 50 cartas:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#121622] border border-amber-500/40">
                        <span className="font-bold text-amber-400">⭐ Afinidad Primaria:</span>
                        <p className="text-[11px] text-neutral-300 mt-0.5">Define su Habilidad Activa. Usar cartas de esta clase activa Sinergia.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#121622] border border-cyan-500/40">
                        <span className="font-bold text-cyan-400">🛡️ Afinidad Secundaria:</span>
                        <p className="text-[11px] text-neutral-300 mt-0.5">Define su Habilidad Pasiva. Usar cartas de esta clase activa Sinergia.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#121622] border border-neutral-600/40">
                        <span className="font-bold text-neutral-300">⚪ Clase Neutra (1):</span>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Funciona normal. No aporta Sinergia ni Antisinergia.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#121622] border border-red-500/40">
                        <span className="font-bold text-red-400">⚠️ Anti-Clases (2):</span>
                        <p className="text-[11px] text-red-300 mt-0.5">Su debilidad mortal. Equipar o usar cartas de esta clase sufre <b>Rechazo inmediato</b>.</p>
                      </div>
                    </div>
                  </div>

                  {/* 5 Classes Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <div
                        key={key}
                        className="p-3 rounded-2xl border flex flex-col justify-between"
                        style={{
                          backgroundColor: `${info.color}10`,
                          borderColor: info.borderColor
                        }}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-black" style={{ color: info.color }}>
                            <span>{info.symbol}</span>
                            <span>{info.name}</span>
                          </div>
                          <p className="text-[10px] text-neutral-300 mt-1 leading-tight">
                            {info.description}
                          </p>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/10 space-y-1 text-[10px]">
                          <div className="text-emerald-300 font-bold">
                            <b>+ Sinergia:</b> {info.synergyBonus}
                          </div>
                          <div className="text-red-300 font-bold">
                            <b>- Rechazo:</b> {info.rejectionPenalty}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: LABORATORIO INTERACTIVO DE SINERGIAS Y RECHAZOS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-[#171d2b] p-4 rounded-2xl border border-[#2b374e]">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Laboratorio Interactivo de Sinergias y Rechazos</span>
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                      Elige un Héroe del roster oficial y haz clic en cualquiera de las 5 clases de cartas para presenciar cómo reacciona su ADN en combate real:
                    </p>
                  </div>

                  {/* Hero Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {CHARACTER_LIST.slice(0, 7).map(char => (
                      <button
                        key={char.type}
                        onClick={() => {
                          setLabHeroType(char.type);
                          setLabSelectedClass(null);
                          setLabFeedback(null);
                        }}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap text-xs font-bold ${
                          labHeroType === char.type
                            ? 'bg-neutral-200 text-black border-white shadow scale-105'
                            : 'bg-[#141824] text-neutral-300 border-[#28344c] hover:bg-[#1a2030]'
                        }`}
                      >
                        <img src={char.avatar} alt={char.displayName} className="w-6 h-6 rounded-md object-cover" />
                        <span>{char.displayName}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Hero ADN Card */}
                  <div className="bg-[#121622] p-4 rounded-2xl border border-[#28354c] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#20293d] pb-2">
                      <div className="flex items-center gap-2.5">
                        <img src={selectedHero.avatar} alt={selectedHero.displayName} className="w-10 h-10 rounded-xl object-cover border border-yellow-400/50" />
                        <div>
                          <h4 className="text-sm font-black text-white font-bungee">{selectedHero.displayName}</h4>
                          <span className="text-[11px] text-yellow-400 font-bold">{selectedHero.title}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          Primaria: {CATEGORY_INFO[selectedHero.adn.primaria]?.badge}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                          Secundaria: {CATEGORY_INFO[selectedHero.adn.secundaria]?.badge}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                          Anti-Clases: {selectedHero.adn.antiClases.map(ac => CATEGORY_INFO[ac]?.name.split(' ')[0]).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-300">
                      <b>Habilidad Activa:</b> {selectedHero.abilityName} ({selectedHero.abilityDescription})
                      <br />
                      <b>Habilidad Pasiva:</b> {selectedHero.passiveName} ({selectedHero.passiveDescription})
                    </div>

                    {/* Class Buttons to Test */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-2">
                        Prueba una carta de cada clase sobre {selectedHero.displayName}:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {Object.values(CardCategory).filter(c => typeof c === 'string' && ['BRUTA', 'PROTECCION', 'ECONOMIA', 'TACTICA', 'ASTUCIA'].includes(c)).map(cat => {
                          const info = CATEGORY_INFO[cat];
                          const isSel = labSelectedClass === cat;
                          return (
                            <button
                              key={cat}
                              onClick={() => handleLabCardClick(cat as CardCategory)}
                              style={{
                                backgroundColor: isSel ? info.color : `${info.color}15`,
                                borderColor: info.borderColor,
                                color: isSel ? '#000000' : info.color
                              }}
                              className="p-2.5 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer shadow"
                            >
                              <span className="text-base">{info.symbol}</span>
                              <span>{info.name.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Feedback Box */}
                    {labFeedback && (
                      <div
                        className={`p-3 rounded-xl border animate-fadeIn text-xs ${
                          labFeedback.type === 'SYNERGY'
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                            : labFeedback.type === 'REJECTION'
                            ? 'bg-red-950/80 border-red-500 text-red-200'
                            : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                        }`}
                      >
                        <h5 className="font-black text-sm mb-1">{labFeedback.title}</h5>
                        <p>{labFeedback.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: ECONOMÍA DE TURNO & COBERTURA */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-[#171d2b] p-4 rounded-2xl border border-[#2b374e]">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Economía de Turno (3 Acciones) & Mecánica de Cobertura</span>
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                      Cada combatiente dispone en su turno de una estructura táctica de 3 acciones para ejecutar su estrategia:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#141926] border border-amber-500/50 space-y-1.5">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wide flex items-center gap-1">
                        <Swords className="w-4 h-4" />
                        Acción 1 (Ataque o Cobertura)
                      </span>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        Puedes lanzar un ataque básico contra un rival, o elegir <b>Escudar a un aliado frágil (Cobertura)</b>. Si atacan al aliado escudado, tú recibes el golpe y defiendes por él.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#141926] border border-cyan-500/50 space-y-1.5">
                      <span className="text-xs font-black text-cyan-400 uppercase tracking-wide flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Acción 2 (Cartas & Mesa)
                      </span>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        Permite equipar una carta de Fierro (arma/blindaje en mesa), activar un Truco de impacto inmediato, o transferir una carta útil a la mano de un compañero.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#141926] border border-purple-500/50 space-y-1.5">
                      <span className="text-xs font-black text-purple-400 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Acción Libre (Habilidad Única)
                      </span>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        No consume PA principales. Activa la Habilidad Única del Héroe (ej: Congelamiento de Cubito de Hielo, Apuesta de Flaucubista, Intercepción de Gladiacubon).
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#121622] p-4 rounded-2xl border border-[#2b3952] space-y-2">
                    <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      Estrategia Clave de Cobertura (Cover)
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Personajes defensivos de clase Protección como <b>Gladiacubon</b> tienen habilidades que reducen a la mitad todo daño recibido ≥ 3. Utilízalos en Acción 1 para cubrir a cubos frágiles (como Racubitero o Flaucubista), absorbiendo golpes y forzando Bloqueos Perfectos ventajosos.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 5: CALETA DE CARTAS & COMBATE */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="bg-[#171d2b] p-4 rounded-2xl border border-[#2b374e]">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Construcción de Escuadrón & La Caleta de 15 Cartas</span>
                    </h3>
                    <p className="text-xs text-neutral-300 leading-relaxed mt-1">
                      El bucle central del juego exige maestría sobre la Sinergia y Antisinergia. Armar tu <b>Caleta de 15 cartas</b> sin cruzar las Anti-clases de tu escuadrón es vital.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#141926] border border-emerald-500/40 space-y-2">
                      <h4 className="font-black text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Regla de Oro: Maximizar Sinergias
                      </h4>
                      <p className="text-neutral-300 leading-relaxed">
                        Incluye cartas de la clase Primaria y Secundaria de tus combatientes principales. Un combo de clase Bruta añadirá +1 de daño a cada ataque, mientras que Protección otorgará curaciones continuas de 1 HP al usar/equipar.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#141926] border border-red-500/40 space-y-2">
                      <h4 className="font-black text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Peligro: El Castigo de las Anti-Clases
                      </h4>
                      <p className="text-neutral-300 leading-relaxed">
                        Si tu escuadrón contiene personajes con debilidades contrarias (por ejemplo, Cubogro sufriendo rechazo con cartas de Economía y Táctica), evita añadir esas cartas o asígnalas únicamente a personajes aliados afines.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 border border-yellow-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-white font-bungee">¡LISTO PARA COMBATIR EN LA ARENA!</h4>
                      <p className="text-xs text-neutral-300">
                        Pon en práctica lo aprendido o consulta en cualquier momento el manual completo de 50 cartas.
                      </p>
                    </div>

                    <button
                      onClick={onDismiss}
                      className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      ¡A COMBATIR!
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Pagination Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#20293d]">
                <button
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 rounded-xl bg-[#171c28] hover:bg-[#202738] border border-[#2b374e] text-neutral-300 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(step => (
                    <button
                      key={step}
                      onClick={() => setCurrentStep(step)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentStep === step ? 'bg-yellow-400 w-6' : 'bg-[#29354d]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (currentStep < 5) {
                      setCurrentStep(prev => prev + 1);
                    } else {
                      setActiveTab('MANUAL');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{currentStep === 5 ? 'Ver 50 Cartas' : 'Siguiente'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: MANUAL TÁCTICO & CATÁLOGO DE 50 CARTAS
             ======================================================== */}
          {activeTab === 'MANUAL' && (
            <div className="space-y-4">
              {/* Header Info with PDF link */}
              <div className="p-4 rounded-2xl bg-[#171d2b] border border-[#28354c] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white font-bungee">
                    BASE DE 50 CARTAS OFICIALES
                  </h3>
                  <p className="text-xs text-neutral-300">
                    Clase Bruta (1-10) · Clase Protección (11-20) · Clase Economía (21-30) · Clase Táctica (31-40) · Clase Astucia (41-50)
                  </p>
                </div>

                <a
                  href="/assets/aistudio/Manual_T_ctico__Guerra_Cubita_226b4d3f.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Manual PDF</span>
                </a>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar carta por nombre o efecto..."
                  value={manualSearch}
                  onChange={e => setManualSearch(e.target.value)}
                  className="flex-1 min-w-[200px] bg-[#121622] border border-[#2b374e] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400"
                />

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  <button
                    onClick={() => setManualFilterClass('ALL')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      manualFilterClass === 'ALL'
                        ? 'bg-yellow-400 text-black border-yellow-300'
                        : 'bg-[#141926] text-neutral-400 border-[#28354c] hover:text-white'
                    }`}
                  >
                    Todas (50)
                  </button>
                  {Object.entries(CATEGORY_INFO).map(([catKey, info]) => (
                    <button
                      key={catKey}
                      onClick={() => setManualFilterClass(catKey)}
                      style={{
                        backgroundColor: manualFilterClass === catKey ? info.color : undefined,
                        borderColor: manualFilterClass === catKey ? '#FFFFFF' : info.borderColor,
                        color: manualFilterClass === catKey ? '#000000' : info.color
                      }}
                      className={`text-xs font-black px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                        manualFilterClass !== catKey ? 'bg-[#141926]' : 'shadow'
                      }`}
                    >
                      <span>{info.symbol}</span>
                      <span>{info.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {filteredManualCards.map((card, cardIdx) => {
                  const catInfo = CATEGORY_INFO[card.category];
                  return (
                    <div
                      key={`manual-card-${card.id}-${cardIdx}`}
                      style={{
                        borderColor: `${catInfo.borderColor}60`,
                        backgroundColor: '#121622'
                      }}
                      className="p-3.5 rounded-2xl border flex flex-col justify-between hover:border-yellow-400/60 transition-all shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            style={{
                              backgroundColor: `${catInfo.color}20`,
                              color: catInfo.color,
                              borderColor: catInfo.borderColor
                            }}
                            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1"
                          >
                            <span>{catInfo.symbol}</span>
                            <span>{catInfo.badge}</span>
                          </span>

                          <span className="text-[10px] font-mono text-neutral-400 font-bold">
                            #{card.id} · {card.isFierro ? 'FIERRO' : 'TRUCO'}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-white">{card.name}</h4>
                        <p className="text-[11px] text-neutral-300 mt-1 leading-snug">
                          {card.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-neutral-800 text-[10px]">
                        <span className="font-bold text-amber-300 block">{card.synergyEffect}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-[#131826] rounded-xl border border-[#27344c] flex items-center justify-between text-xs text-neutral-300">
                <span>Mostrando <b>{filteredManualCards.length}</b> cartas oficiales del Manual Táctico</span>
                <span className="text-yellow-400 font-bold">15 cartas por Caleta</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
