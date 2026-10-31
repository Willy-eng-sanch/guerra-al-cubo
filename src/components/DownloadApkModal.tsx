import React, { useState } from 'react';
import { GcSpriteIcon } from '../ui/SpriteUI';
import { usePWAInstall } from '../hooks/usePWAInstall';
interface DownloadApkModalProps {
  onDismiss: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({ onDismiss }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'cli'>('pwa');

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-tkhxfzhqcjy5epxgusqd2j-512275590233.us-west1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleInstallClick = async () => {
    await install();
  };

  return (
    <div className="gc-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#131722] border-2 border-[#2c3852] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#1e2538] via-[#202940] to-[#171b28] px-5 py-4 border-b border-[#2d3a54] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg flex items-center justify-center">
              <GcSpriteIcon name="icon-phone" className="w-6 h-6 text-black"  />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-white tracking-wide flex items-center gap-2">
                <span>DESCARGAR APK & INSTALAR EN MÓVIL</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  OFICIAL
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Juega Guerra Cubita nativamente en tu teléfono Android o tableta
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl bg-[#10141d] hover:bg-[#20283a] text-neutral-400 hover:text-white transition-all border border-[#2b374e]"
          >
            <GcSpriteIcon name="icon-close" className="w-5 h-5"  />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#212b3e] bg-[#0f131c] px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GcSpriteIcon name="icon-phone" className="w-4 h-4"  />
            <span>1. Instalar Directo (WebAPK)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GcSpriteIcon name="icon-download" className="w-4 h-4"  />
            <span>2. Descargar archivo .APK puro</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'cli'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GcSpriteIcon name="icon-terminal" className="w-4 h-4"  />
            <span>3. Generar con Bubblewrap</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm">
          {/* TAB 1: Direct Install (WebAPK) */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#162529] to-[#121c25] border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <GcSpriteIcon name="icon-spark" className="w-5 h-5"  />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">
                      Método Más Rápido: Android WebAPK (1 Clic)
                    </h3>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Android convierte esta app automáticamente en un <b>paquete nativo APK</b> con su propio icono en el cajón de aplicaciones, pantalla completa y 60 FPS sin barras de navegación.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="mt-3.5 flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-2 rounded-xl border border-emerald-500/40 font-bold text-xs">
                    <GcSpriteIcon name="icon-check" className="w-4 h-4 text-emerald-400"  />
                    <span>¡Guerra Cubita ya está instalada en tu dispositivo! Puedes jugarla desde tu pantalla de inicio.</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={handleInstallClick}
                    className="mt-3.5 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-[0.98] text-neutral-950 font-black text-sm rounded-xl shadow-lg border-2 border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <GcSpriteIcon name="icon-download" className="w-4 h-4"  />
                    <span>INSTALAR GUERRA CUBITA EN ESTE DISPOSITIVO AHORA</span>
                  </button>
                ) : (
                  <div className="mt-3.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-700/60 text-neutral-300 space-y-1.5">
                    <p className="font-bold text-amber-300 text-xs">
                      ¿Cómo instalar si estás en Chrome para Android?
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-neutral-300">
                      <li>Toca los tres puntos (<b>⋮</b>) en la esquina superior derecha de Google Chrome.</li>
                      <li>Selecciona <b>"Instalar aplicación"</b> o <b>"Agregar a la pantalla principal"</b>.</li>
                      <li>Pulsa <b>"Instalar"</b>. El sistema creará el WebAPK nativo en cuestión de segundos.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Share / Open on Phone */}
              <div className="p-4 rounded-2xl bg-[#161c28] border border-[#27334a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-200 flex items-center gap-2 text-xs">
                    <GcSpriteIcon name="icon-share" className="w-4 h-4 text-cyan-400"  />
                    <span>Enlace para abrir desde tu celular:</span>
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="px-2.5 py-1 rounded-lg bg-[#222c40] hover:bg-[#2e3b55] border border-[#3b4b6f] text-cyan-300 flex items-center gap-1 font-bold text-xs transition-all"
                  >
                    {copied ? <GcSpriteIcon name="icon-check" className="w-3.5 h-3.5 text-emerald-400"  /> : <GcSpriteIcon name="icon-copy" className="w-3.5 h-3.5"  />}
                    <span>{copied ? '¡Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
                <div className="bg-[#0b0e14] p-2.5 rounded-xl border border-[#1f2738] font-mono text-cyan-300 text-[11px] truncate select-all">
                  {appUrl}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Standalone .APK File (PWABuilder) */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#161c29] border border-[#28364e] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <GcSpriteIcon name="icon-cards" className="w-5 h-5"  />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">
                      Descargar el archivo .APK directo (Paso a Paso con PWABuilder)
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Convierte la URL en un paquete binario <code>.apk</code> firmado para instalarlo sin tienda.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-neutral-300 pt-2">
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-black flex items-center justify-center shrink-0 text-xs">1</span>
                    <p>
                      Copia el enlace de tu juego:
                      <button
                        onClick={handleCopyUrl}
                        className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-600/40 font-bold hover:bg-cyan-900"
                      >
                        {copied ? <GcSpriteIcon name="icon-check" className="w-3 h-3 text-emerald-400"  /> : <GcSpriteIcon name="icon-copy" className="w-3 h-3"  />}
                        <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
                      </button>
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-black flex items-center justify-center shrink-0 text-xs">2</span>
                    <div>
                      <p>
                        Abre <b>PWABuilder</b> (herramienta oficial impulsada por la comunidad Web & Google):
                      </p>
                      <a
                        href="https://www.pwabuilder.com"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow"
                      >
                        <span>Abrir pwabuilder.com</span>
                        <GcSpriteIcon name="icon-external-link" className="w-3.5 h-3.5"  />
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-black flex items-center justify-center shrink-0 text-xs">3</span>
                    <p>
                      Pega la URL copiada en el campo de texto central y presiona <b>"Start"</b>.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-black flex items-center justify-center shrink-0 text-xs">4</span>
                    <p>
                      En la sección <b>Android</b>, presiona el botón <b>"Package for Android"</b>.
                    </p>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-black font-black flex items-center justify-center shrink-0 text-xs">5</span>
                    <p>
                      ¡Listo! Descarga el archivo <code>.apk</code> y ábrelo en tu teléfono Android (o usa <code>adb install app.apk</code>). Si te pide permiso de "Fuentes desconocidas", dale aceptar para jugar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <GcSpriteIcon name="icon-shield" className="w-4 h-4 shrink-0 text-emerald-400"  />
                <span>El archivo <code>manifest.json</code> y el <code>sw.js</code> ya están 100% configurados con iconos HD y soporte offline para compilar el APK sin errores.</span>
              </div>
            </div>
          )}

          {/* TAB 3: CLI / Bubblewrap */}
          {activeTab === 'cli' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#141822] border border-[#232c3f] space-y-3">
                <div className="flex items-center gap-2.5">
                  <GcSpriteIcon name="icon-terminal" className="w-5 h-5 text-amber-400"  />
                  <h3 className="font-black text-white text-sm">
                    Para Desarrolladores: Bubblewrap (Línea de Comandos)
                  </h3>
                </div>
                <p className="text-xs text-neutral-300">
                  Google ofrece la herramienta <b>Bubblewrap</b> para generar y firmar un APK / AAB de Android directamente desde la terminal:
                </p>

                <div className="p-3 rounded-xl bg-[#0b0d13] border border-[#1e2536] font-mono text-[11px] text-emerald-400 space-y-2">
                  <div>
                    <span className="text-neutral-500"># 1. Instalar la herramienta oficial de Google:</span>
                    <p className="text-white">npm install -g @bubblewrap/cli</p>
                  </div>
                  <div>
                    <span className="text-neutral-500"># 2. Inicializar el proyecto con el manifiesto:</span>
                    <p className="text-white">bubblewrap init --manifest={appUrl}/manifest.json</p>
                  </div>
                  <div>
                    <span className="text-neutral-500"># 3. Compilar el APK firmado para Android:</span>
                    <p className="text-white">bubblewrap build</p>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400">
                  Esto crea el archivo <code>app-release-signed.apk</code> que puedes instalar directamente en cualquier teléfono con <code>adb install app-release-signed.apk</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0f121a] border-t border-[#1f283a] flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Compatible con Android 8.0+, MIUI, OneUI, HarmonyOS y emuladores.
          </span>
          <button
            onClick={onDismiss}
            className="px-5 py-2 rounded-xl bg-[#1e273a] hover:bg-[#28354e] text-white font-bold text-xs transition-all border border-[#334260]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
