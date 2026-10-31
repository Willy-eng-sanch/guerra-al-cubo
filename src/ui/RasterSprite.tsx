import React, { CSSProperties } from 'react';

export interface GcRasterSpriteFrame {
  atlas: string;
  x: number;
  y: number;
  width: number;
  height: number;
  atlasWidth: number;
  atlasHeight: number;
}

export interface GcRasterSpriteProps {
  frame: GcRasterSpriteFrame;
  scale?: number;
  className?: string;
  label?: string;
}

/**
 * Crops one frame from a future PNG/WebP raster atlas without adding a separate
 * network request per icon/portrait. Keep frame coordinates in the catalog,
 * not embedded in gameplay components.
 */
export function GcRasterSprite({
  frame,
  scale = 1,
  className = '',
  label
}: GcRasterSpriteProps) {
  const width = frame.width * scale;
  const height = frame.height * scale;
  const style: CSSProperties = {
    display: 'inline-block',
    flex: '0 0 auto',
    width,
    height,
    backgroundImage: `url("${frame.atlas}")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `-${frame.x * scale}px -${frame.y * scale}px`,
    backgroundSize: `${frame.atlasWidth * scale}px ${frame.atlasHeight * scale}px`
  };

  return (
    <span
      className={`gc-raster-sprite ${className}`.trim()}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
