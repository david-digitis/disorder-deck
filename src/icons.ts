// Sci-fi SVG icons for Stream Deck (144x144) — Disorder theme

function svg(content: string, bg = '#0d0b18'): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
    <defs>
      <linearGradient id="glow-purple" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5B54A4" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0d0b18" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="glow-cyan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00BCD4" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0d0b18" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="glow-green" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#43B581" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0d0b18" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="glow-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ED4245" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0d0b18" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="glow-yellow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFEB3B" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0d0b18" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="144" height="144" rx="0" fill="${bg}"/>
    <!-- Corner accents -->
    <path d="M2 20 L2 2 L20 2" fill="none" stroke="rgba(91,84,164,0.3)" stroke-width="1"/>
    <path d="M124 2 L142 2 L142 20" fill="none" stroke="rgba(91,84,164,0.3)" stroke-width="1"/>
    <path d="M2 124 L2 142 L20 142" fill="none" stroke="rgba(91,84,164,0.3)" stroke-width="1"/>
    <path d="M124 142 L142 142 L142 124" fill="none" stroke="rgba(91,84,164,0.3)" stroke-width="1"/>
    ${content}
  </svg>`)}`;
}

function hexagon(cx: number, cy: number, r: number, stroke: string, fill = 'none', sw = 1.5): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function scanline(y: number, opacity = 0.05): string {
  return `<line x1="10" y1="${y}" x2="134" y2="${y}" stroke="white" stroke-opacity="${opacity}" stroke-width="0.5"/>`;
}

const scanlines = [30, 50, 70, 90, 110].map(y => scanline(y)).join('');

// ─── Toggle OP / ALL ───

export function iconAdminTab(tab: string): string {
  const isOp = tab === 'op';
  const color = isOp ? '#5B54A4' : '#00BCD4';
  const label = isOp ? 'OP' : 'ALL';
  const glowId = isOp ? 'glow-purple' : 'glow-cyan';
  return svg(
    `<rect x="0" y="0" width="144" height="72" fill="url(#${glowId})"/>` +
    scanlines +
    hexagon(72, 52, 32, color, `${color}15`, 2.5) +
    `<text x="72" y="62" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="24">${label}</text>` +
    `<rect x="24" y="104" width="96" height="2" rx="1" fill="${color}" opacity="0.4"/>` +
    `<rect x="44" y="112" width="56" height="1" rx="0.5" fill="${color}" opacity="0.2"/>`
  );
}

// ─── Toggle Fleet / TS Live ───

export function iconFleetTab(tab: string): string {
  const isFleet = tab === 'fleet';
  const color = isFleet ? '#43B581' : '#00BCD4';
  const label = isFleet ? 'FLEET' : 'LIVE';
  const glowId = isFleet ? 'glow-green' : 'glow-cyan';
  return svg(
    `<rect x="0" y="0" width="144" height="72" fill="url(#${glowId})"/>` +
    scanlines +
    hexagon(72, 50, 32, color, `${color}15`, 2.5) +
    (isFleet
      ? `<circle cx="62" cy="44" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>
         <circle cx="82" cy="44" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>
         <circle cx="72" cy="58" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>`
      : `<circle cx="72" cy="50" r="6" fill="${color}"/>
         <circle cx="72" cy="50" r="12" fill="none" stroke="${color}" stroke-width="1" opacity="0.5"/>
         <circle cx="72" cy="50" r="18" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>`) +
    `<text x="72" y="102" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="16" letter-spacing="2">${label}</text>` +
    `<rect x="24" y="114" width="96" height="1.5" rx="0.75" fill="${color}" opacity="0.3"/>`
  );
}

// ─── Toggle Normal / FDG ───

export function iconTsMode(mode: string): string {
  const isNormal = mode === 'normal';
  const color = isNormal ? '#43B581' : '#ED4245';
  const label = isNormal ? 'NRM' : 'FDG';
  const glowId = isNormal ? 'glow-green' : 'glow-red';
  return svg(
    `<rect x="0" y="0" width="144" height="72" fill="url(#${glowId})"/>` +
    scanlines +
    hexagon(72, 50, 32, color, `${color}15`, 2.5) +
    (isNormal
      ? `<path d="M58 40 L72 32 L86 40 L86 60 L72 68 L58 60 Z" fill="none" stroke="${color}" stroke-width="2"/>`
      : `<path d="M55 38 L89 38 L89 66 L55 66 Z" fill="none" stroke="${color}" stroke-width="2"/>
         <line x1="55" y1="52" x2="89" y2="52" stroke="${color}" stroke-width="1.5"/>
         <line x1="72" y1="38" x2="72" y2="66" stroke="${color}" stroke-width="1.5"/>`) +
    `<text x="72" y="102" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="18" letter-spacing="3">${label}</text>` +
    `<rect x="24" y="114" width="96" height="1.5" rx="0.75" fill="${color}" opacity="0.3"/>`
  );
}

// ─── Help (SOS) ───

export function iconHelp(): string {
  const color = '#FFEB3B';
  return svg(
    `<rect x="0" y="0" width="144" height="72" fill="url(#glow-yellow)"/>` +
    scanlines +
    `<polygon points="72,22 104,78 40,78" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>` +
    `<text x="72" y="72" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="900" font-size="36">!</text>` +
    `<text x="72" y="104" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="16" letter-spacing="4" opacity="0.7">HELP</text>` +
    `<rect x="32" y="118" width="80" height="1" rx="0.5" fill="${color}" opacity="0.2"/>`
  );
}

// ─── Status (RDY / DEAD / WAIT) ───

export function iconStatus(status?: string): string {
  const configs: Record<string, { color: string; glowId: string; label: string; bg: string; icon: string }> = {
    rdy: {
      color: '#43B581', glowId: 'glow-green', label: 'RDY', bg: '#0d0b18',
      icon: `<path d="M54 52 L66 64 L90 38" fill="none" stroke="#43B581" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    dead: {
      color: '#ED4245', glowId: 'glow-red', label: 'DEAD', bg: '#1a0810',
      icon: `<line x1="54" y1="34" x2="90" y2="66" stroke="#ED4245" stroke-width="4" stroke-linecap="round"/>` +
            `<line x1="90" y1="34" x2="54" y2="66" stroke="#ED4245" stroke-width="4" stroke-linecap="round"/>`,
    },
    wait: {
      color: '#FAA61A', glowId: 'glow-yellow', label: 'WAIT', bg: '#0d0b18',
      icon: `<circle cx="72" cy="50" r="22" fill="none" stroke="#FAA61A" stroke-width="3"/>` +
            `<line x1="72" y1="38" x2="72" y2="52" stroke="#FAA61A" stroke-width="3" stroke-linecap="round"/>` +
            `<line x1="72" y1="52" x2="82" y2="58" stroke="#FAA61A" stroke-width="3" stroke-linecap="round"/>`,
    },
  };

  const c = configs[status || ''] || { color: '#555', glowId: '', label: 'STATUS', bg: '#0d0b18',
    icon: hexagon(72, 50, 24, '#555', 'none', 2) +
          `<circle cx="72" cy="50" r="4" fill="#555"/>`,
  };

  return svg(
    (c.glowId ? `<rect x="0" y="0" width="144" height="72" fill="url(#${c.glowId})"/>` : '') +
    scanlines +
    hexagon(72, 50, 32, c.color, `${c.color}15`, 2.5) +
    c.icon +
    `<text x="72" y="104" text-anchor="middle" fill="${c.color}" font-family="Consolas,monospace" font-weight="700" font-size="16" letter-spacing="4">${c.label}</text>` +
    `<rect x="24" y="118" width="96" height="2" rx="1" fill="${c.color}" opacity="0.4"/>`,
    c.bg
  );
}

// ─── Toggle Fleet ───

export function iconFleet(visible: boolean): string {
  const color = visible ? '#43B581' : '#555';
  const glowId = visible ? 'glow-green' : '';
  return svg(
    (visible ? `<rect x="0" y="0" width="144" height="72" fill="url(#${glowId})"/>` : '') +
    scanlines +
    hexagon(72, 50, 32, color, visible ? `${color}15` : 'none', 2) +
    `<line x1="48" y1="38" x2="96" y2="38" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<line x1="48" y1="50" x2="96" y2="50" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<line x1="48" y1="62" x2="96" y2="62" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<circle cx="42" cy="38" r="2.5" fill="${color}"/>` +
    `<circle cx="42" cy="50" r="2.5" fill="${color}"/>` +
    `<circle cx="42" cy="62" r="2.5" fill="${color}"/>` +
    `<text x="72" y="104" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="14" letter-spacing="2">${visible ? 'FLEET' : 'FLEET'}</text>` +
    `<rect x="32" y="118" width="80" height="1" rx="0.5" fill="${color}" opacity="0.3"/>`
  );
}

// ─── Toggle TS Live ───

export function iconTsLive(visible: boolean): string {
  const color = visible ? '#00BCD4' : '#555';
  const glowId = visible ? 'glow-cyan' : '';
  return svg(
    (visible ? `<rect x="0" y="0" width="144" height="72" fill="url(#${glowId})"/>` : '') +
    scanlines +
    hexagon(72, 50, 32, color, visible ? `${color}15` : 'none', 2) +
    `<circle cx="62" cy="44" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>` +
    `<circle cx="82" cy="44" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>` +
    `<circle cx="72" cy="58" r="7" fill="none" stroke="${color}" stroke-width="1.5"/>` +
    `<text x="72" y="102" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="13" letter-spacing="1">TS LIVE</text>` +
    `<rect x="32" y="118" width="80" height="1" rx="0.5" fill="${color}" opacity="0.3"/>`
  );
}

// ─── Raid Commands ───

export function iconRaid(type: string): string {
  const configs: Record<string, { color: string; glowId: string; label: string; icon: string }> = {
    'check-raid': {
      color: '#ED4245', glowId: 'glow-red', label: 'RAID',
      icon: `<line x1="52" y1="60" x2="72" y2="36" stroke="#ED4245" stroke-width="3" stroke-linecap="round"/>` +
            `<line x1="72" y1="36" x2="92" y2="60" stroke="#ED4245" stroke-width="3" stroke-linecap="round"/>` +
            `<line x1="56" y1="52" x2="88" y2="52" stroke="#ED4245" stroke-width="2" stroke-linecap="round"/>`,
    },
    'raid-off': {
      color: '#43B581', glowId: 'glow-green', label: 'R.OFF',
      icon: `<path d="M54 52 L66 64 L90 38" fill="none" stroke="#43B581" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    'rally': {
      color: '#FAA61A', glowId: 'glow-yellow', label: 'RALLY',
      icon: `<polygon points="50,38 62,38 58,58 46,58" fill="none" stroke="#FAA61A" stroke-width="2"/>` +
            `<line x1="62" y1="38" x2="96" y2="38" stroke="#FAA61A" stroke-width="2.5" stroke-linecap="round"/>` +
            `<line x1="60" y1="44" x2="90" y2="44" stroke="#FAA61A" stroke-width="1.5" stroke-linecap="round"/>` +
            `<line x1="58" y1="50" x2="84" y2="50" stroke="#FAA61A" stroke-width="1" stroke-linecap="round"/>`,
    },
    'reset-status': {
      color: '#5B54A4', glowId: 'glow-purple', label: 'RESET',
      icon: `<path d="M54 50 A20 20 0 1 1 72 70" fill="none" stroke="#5B54A4" stroke-width="3" stroke-linecap="round"/>` +
            `<polygon points="48,40 54,56 64,44" fill="#5B54A4"/>`,
    },
  };

  const c = configs[type] || configs['check-raid'];
  return svg(
    `<rect x="0" y="0" width="144" height="72" fill="url(#${c.glowId})"/>` +
    scanlines +
    hexagon(72, 50, 32, c.color, `${c.color}15`, 2.5) +
    c.icon +
    `<text x="72" y="104" text-anchor="middle" fill="${c.color}" font-family="Consolas,monospace" font-weight="700" font-size="14" letter-spacing="3">${c.label}</text>` +
    `<rect x="24" y="118" width="96" height="2" rx="1" fill="${c.color}" opacity="0.4"/>`
  );
}

// ─── Toggle Overlay visibility ───

export function iconToggleOverlay(visible: boolean): string {
  const color = visible ? '#5B54A4' : '#555';
  const glowId = visible ? 'glow-purple' : '';
  return svg(
    (visible ? `<rect x="0" y="0" width="144" height="72" fill="url(#${glowId})"/>` : '') +
    scanlines +
    hexagon(72, 50, 32, color, visible ? `${color}15` : 'none', 2) +
    `<circle cx="72" cy="50" r="14" fill="none" stroke="${color}" stroke-width="2.5"/>` +
    `<circle cx="72" cy="50" r="5" fill="${color}"/>` +
    (visible ? '' : `<line x1="56" y1="36" x2="88" y2="64" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`) +
    `<text x="72" y="104" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="13" letter-spacing="2">${visible ? 'SHOW' : 'HIDE'}</text>` +
    `<rect x="32" y="118" width="80" height="1" rx="0.5" fill="${color}" opacity="0.2"/>`
  );
}

// ─── Quit Overlay ───

export function iconQuit(): string {
  const color = '#ED4245';
  return svg(
    scanlines +
    `<rect x="42" y="30" width="60" height="48" rx="4" fill="none" stroke="${color}" stroke-width="2"/>` +
    `<path d="M62 54 L42 54 L42 30 L62 30" fill="none" stroke="${color}" stroke-width="2"/>` +
    `<line x1="72" y1="54" x2="100" y2="54" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>` +
    `<polyline points="90,46 100,54 90,62" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<text x="72" y="104" text-anchor="middle" fill="${color}" font-family="Consolas,monospace" font-weight="700" font-size="13" letter-spacing="2" opacity="0.7">QUIT</text>` +
    `<rect x="32" y="118" width="80" height="1" rx="0.5" fill="${color}" opacity="0.2"/>`
  );
}
