import React from 'react';
import { GC_SPRITE_CATALOG } from './sprite-catalog';
import { GcSpriteIcon, GcSpriteName } from './SpriteUI';

const frames = Object.entries(GC_SPRITE_CATALOG.frames);
const icons = GC_SPRITE_CATALOG.iconSymbols as readonly GcSpriteName[];

export function SpriteCatalogPreview() {
  return (
    <section className="gc-sprite-catalog-preview space-y-4" aria-label="Catálogo de sprites de Guerra Cúbita">
      <div>
        <h3 className="text-sm font-black tracking-wide text-cyan-200">Marcos vectoriales nine-slice</h3>
        <p className="mt-1 text-[11px] text-slate-400">Cada pieza se puede sustituir conservando su archivo, viewBox y slice.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {frames.map(([name, sprite]) => (
            <article key={name} className="gc-sprite-preview-card">
              <div className="gc-sprite-preview-image">
                <img src={sprite.file} alt="" loading="lazy" />
              </div>
              <div className="mt-2 text-[11px] font-bold text-white">{name}</div>
              <div className="text-[10px] text-slate-400">{sprite.role}</div>
              <div className="mt-1 font-mono text-[9px] text-slate-500">{sprite.viewBox} · slice {sprite.slice}</div>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black tracking-wide text-cyan-200">Atlas de iconos</h3>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {icons.map(name => (
            <div key={name} className="gc-sprite-preview-icon">
              <GcSpriteIcon name={name} size={25} />
              <span>{name.replace('icon-', '')}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black tracking-wide text-cyan-200">Fondo seamless</h3>
        <div className="gc-sprite-preview-tile mt-2">
          <span>192 × 192 px · repetición continua · movimiento lento</span>
        </div>
      </div>
    </section>
  );
}
