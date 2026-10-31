export const GC_SPRITE_CATALOG = {
  atlas: {
    file: '/assets/ui/gc-ui-atlas.svg',
    format: 'svg-symbol-atlas',
    purpose: 'one cached vector file for reusable interface icons'
  },
  frames: {
    buttonPrimary: { file: '/assets/ui/sprites/button-primary.svg', viewBox: '0 0 96 96', slice: 28, role: 'primary action' },
    buttonSecondary: { file: '/assets/ui/sprites/button-secondary.svg', viewBox: '0 0 96 96', slice: 28, role: 'secondary action' },
    buttonDanger: { file: '/assets/ui/sprites/button-danger.svg', viewBox: '0 0 96 96', slice: 28, role: 'destructive action' },
    panel: { file: '/assets/ui/sprites/panel-frame.svg', viewBox: '0 0 180 180', slice: 34, role: 'dialog and content panel' },
    card: { file: '/assets/ui/sprites/card-frame.svg', viewBox: '0 0 160 200', slice: 32, role: 'character, card and archive tile' },
    tab: { file: '/assets/ui/sprites/tab-frame.svg', viewBox: '0 0 128 72', slice: 24, role: 'tab and filter' },
    badge: { file: '/assets/ui/sprites/badge-frame.svg', viewBox: '0 0 128 72', slice: 20, role: 'status, rarity and counters' },
    portrait: { file: '/assets/ui/sprites/portrait-frame.svg', viewBox: '0 0 160 160', slice: 30, role: 'hero and player portrait frame' },
    titleBanner: { file: '/assets/ui/sprites/title-banner.svg', viewBox: '0 0 180 100', slice: 26, role: 'screen and modal title ribbon' },
    progressTrack: { file: '/assets/ui/sprites/progress-track.svg', viewBox: '0 0 120 48', slice: 20, role: 'loading and activity progress track' },
    progressFill: { file: '/assets/ui/sprites/progress-fill.svg', viewBox: '0 0 120 48', slice: 20, role: 'loading and activity progress fill' },
    slot: { file: '/assets/ui/sprites/slot-frame.svg', viewBox: '0 0 128 128', slice: 28, role: 'empty squad, card and equipment slot' },
    modal: { file: '/assets/ui/sprites/modal-frame.svg', viewBox: '0 0 180 180', slice: 34, role: 'generic modal and dialog frame' }
  },
  backgrounds: {
    seamlessDiceTile: {
      file: '/assets/ui/gc-bg-tile.svg',
      size: '192x192',
      repeat: true,
      animation: 'gc-sprite-drift',
      role: 'seamless slow-moving menu and screen texture'
    }
  },
  iconSymbols: [
    'icon-dice', 'icon-swords', 'icon-shield', 'icon-history', 'icon-trophy',
    'icon-players', 'icon-cards', 'icon-book', 'icon-home', 'icon-play',
    'icon-back', 'icon-close', 'icon-check', 'icon-store', 'icon-calendar',
    'icon-spark', 'icon-volume', 'icon-settings', 'icon-delete', 'icon-download',
    'icon-info', 'icon-warning', 'icon-chevron', 'icon-folder', 'icon-lock', 'icon-map',
    'icon-flame', 'icon-zap', 'icon-help', 'icon-arrow-right', 'icon-plus', 'icon-search', 'icon-star', 'icon-chart', 'icon-wifi', 'icon-copy', 'icon-message', 'icon-radio', 'icon-package', 'icon-coins', 'icon-gift', 'icon-refresh', 'icon-crown', 'icon-exit', 'icon-fast-forward', 'icon-eye', 'icon-award', 'icon-skull', 'icon-heart', 'icon-file'
  ]
} as const;

export type GcSpriteCatalogKey = keyof typeof GC_SPRITE_CATALOG;
