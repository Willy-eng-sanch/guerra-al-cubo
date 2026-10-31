import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export type GcSpriteName =
  | 'icon-dice' | 'icon-swords' | 'icon-shield' | 'icon-history' | 'icon-trophy'
  | 'icon-players' | 'icon-cards' | 'icon-book' | 'icon-home' | 'icon-play'
  | 'icon-back' | 'icon-close' | 'icon-check' | 'icon-store' | 'icon-calendar'
  | 'icon-spark' | 'icon-volume' | 'icon-settings' | 'icon-delete' | 'icon-download'
  | 'icon-info' | 'icon-warning' | 'icon-chevron' | 'icon-folder' | 'icon-lock' | 'icon-map';

const SPRITE_ATLAS = '/assets/ui/gc-ui-atlas.svg';

export interface GcSpriteIconProps {
  name: GcSpriteName;
  size?: number;
  className?: string;
  label?: string;
}

/** A single reusable vector sprite reference. Artwork stays in the external atlas. */
export function GcSpriteIcon({ name, size = 24, className, label }: GcSpriteIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      <use href={`${SPRITE_ATLAS}#${name}`} />
    </svg>
  );
}

export type GcSpriteButtonVariant = 'primary' | 'secondary' | 'danger' | 'quiet';

export interface GcSpriteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GcSpriteButtonVariant;
  icon?: GcSpriteName;
  iconSize?: number;
  children: ReactNode;
}

/** Semantic button whose visual face is supplied by a nine-slice SVG sprite. */
export function GcSpriteButton({
  variant = 'secondary',
  icon,
  iconSize = 21,
  className = '',
  type = 'button',
  children,
  ...props
}: GcSpriteButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`gc-sprite-button gc-sprite-button--${variant} ${className}`.trim()}
    >
      {icon && <GcSpriteIcon name={icon} size={iconSize} className="gc-sprite-button__icon" />}
      <span className="gc-sprite-button__label">{children}</span>
    </button>
  );
}

export interface GcSpritePanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'default' | 'warm' | 'cool';
  children: ReactNode;
}

/** Nine-slice panel frame. Content and interaction remain ordinary semantic HTML. */
export function GcSpritePanel({
  tone = 'default',
  className = '',
  children,
  ...props
}: GcSpritePanelProps) {
  const classes = `gc-sprite-panel gc-sprite-panel--${tone} ${className}`.trim();
  return <div {...props} className={classes}>{children}</div>;
}

export interface GcSpriteCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

/** Card-sized nine-slice visual frame; works for character, deck and archive cards. */
export function GcSpriteCard({ className = '', children, ...props }: GcSpriteCardProps) {
  return <article {...props} className={`gc-sprite-card ${className}`.trim()}>{children}</article>;
}

export interface GcSpriteBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

/** Compact reusable label frame for rarity, status, team and resource badges. */
export function GcSpriteBadge({ className = '', children, ...props }: GcSpriteBadgeProps) {
  return <span {...props} className={`gc-sprite-badge ${className}`.trim()}>{children}</span>;
}

/** Decorative seamless tile. It is pointer-transparent and never captures controls. */
export function GcSpriteBackdrop({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`gc-sprite-backdrop ${className}`.trim()} />;
}

export interface GcSpriteProgressProps {
  value: number;
  label: string;
  className?: string;
}

/** Accessible progress bar for loading, uploads and multi-step setup flows. */
export function GcSpriteProgress({ value, label, className = '' }: GcSpriteProgressProps) {
  const safeValue = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div
      className={`gc-sprite-progress ${className}`.trim()}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeValue)}
    >
      <div className="gc-sprite-progress__fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function GcSpritePortrait({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`gc-sprite-portrait ${className}`.trim()}>{children}</div>;
}

export function GcSpriteSlot({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`gc-sprite-slot ${className}`.trim()}>{children}</div>;
}

export function GcSpriteTitleBanner({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div {...props} className={`gc-sprite-title-banner ${className}`.trim()}>{children}</div>;
}
