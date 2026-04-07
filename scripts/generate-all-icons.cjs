const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');

const SIZE = 144;
const FPS = 20;
const CX = 72;
const BG = '#0d0b18';
const OUTPUT_DIR = path.join(__dirname, '..', 'com.digitis.disorder-deck.sdPlugin', 'imgs', 'actions');

// --- Color helpers ---
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgba(rgb, a) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

// --- Common drawing functions ---
function drawBackground(ctx) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

function drawGrid(ctx, rgb, pulse) {
  ctx.strokeStyle = rgba(rgb, 0.02 + 0.01 * pulse);
  ctx.lineWidth = 0.5;
  for (let g = 0; g < SIZE; g += 12) {
    ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(SIZE, g); ctx.stroke();
  }
}

function drawCorners(ctx, rgb, pulse) {
  const len = 10;
  const a = 0.25 + 0.15 * pulse;
  ctx.strokeStyle = rgba(rgb, a);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(4, 4 + len); ctx.lineTo(4, 4); ctx.lineTo(4 + len, 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SIZE - 4 - len, 4); ctx.lineTo(SIZE - 4, 4); ctx.lineTo(SIZE - 4, 4 + len); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4, SIZE - 4 - len); ctx.lineTo(4, SIZE - 4); ctx.lineTo(4 + len, SIZE - 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SIZE - 4 - len, SIZE - 4); ctx.lineTo(SIZE - 4, SIZE - 4); ctx.lineTo(SIZE - 4, SIZE - 4 - len); ctx.stroke();
}

function drawScanLine(ctx, rgb, t, glowPulse) {
  const scanY = (t * SIZE * 1.5) % (SIZE + 20) - 10;
  const grad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
  grad.addColorStop(0, rgba(rgb, 0));
  grad.addColorStop(0.5, rgba(rgb, 0.05 * glowPulse));
  grad.addColorStop(1, rgba(rgb, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, scanY - 8, SIZE, 16);
}

function drawGlow(ctx, rgb, cy, pulse) {
  const r = 38 + pulse * 6;
  const glow = ctx.createRadialGradient(CX, cy, 10, CX, cy, r);
  glow.addColorStop(0, rgba(rgb, 0.12 * pulse));
  glow.addColorStop(1, rgba(rgb, 0));
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(CX, cy, r, 0, Math.PI * 2); ctx.fill();
}

function drawText(ctx, rgb, text, glowPulse) {
  const a = 0.7 + 0.3 * glowPulse;
  ctx.shadowColor = rgba(rgb, 0.5 * glowPulse);
  ctx.shadowBlur = 6 * glowPulse;
  ctx.fillStyle = rgba(rgb, a);
  ctx.font = text.length > 5 ? 'bold 14px Arial' : 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(text, CX, SIZE - 10);
  ctx.shadowBlur = 0;
  // HUD lines
  ctx.strokeStyle = rgba(rgb, 0.15 + 0.1 * glowPulse);
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(20, SIZE - 28); ctx.lineTo(SIZE - 20, SIZE - 28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30, SIZE - 6); ctx.lineTo(SIZE - 30, SIZE - 6); ctx.stroke();
}

// --- Symbol drawing functions ---
const symbols = {
  alertTriangle(ctx, rgb, pulse) {
    const cy = 55, triSize = 34;
    const topY = cy - triSize + 4, botY = cy + triSize * 0.6;
    const half = triSize * 0.7;
    ctx.shadowColor = rgba(rgb, 0.6 * pulse);
    ctx.shadowBlur = 12 * pulse;
    ctx.beginPath(); ctx.moveTo(CX, topY); ctx.lineTo(CX + half, botY); ctx.lineTo(CX - half, botY); ctx.closePath();
    ctx.fillStyle = rgba(rgb, 0.1 + 0.08 * pulse);
    ctx.fill();
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(rgb, 0.7 + 0.3 * pulse);
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', CX, cy + 2);
  },

  crossedSwords(ctx, rgb, pulse) {
    const cy = 52, len = 28;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Sword 1 (top-left to bottom-right)
    ctx.beginPath(); ctx.moveTo(CX - len, cy - len); ctx.lineTo(CX + len, cy + len); ctx.stroke();
    // Sword 2 (top-right to bottom-left)
    ctx.beginPath(); ctx.moveTo(CX + len, cy - len); ctx.lineTo(CX - len, cy + len); ctx.stroke();
    // Guard 1
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CX - len + 8, cy - len + 14); ctx.lineTo(CX - len + 14, cy - len + 8); ctx.stroke();
    // Guard 2
    ctx.beginPath(); ctx.moveTo(CX + len - 8, cy - len + 14); ctx.lineTo(CX + len - 14, cy - len + 8); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';
  },

  checkmark(ctx, rgb, pulse) {
    const cy = 55;
    // Circle
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 10 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.5 + 0.4 * pulse);
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(CX, cy, 28, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = rgba(rgb, 0.06 + 0.04 * pulse);
    ctx.fill();
    // Checkmark
    ctx.strokeStyle = rgba(rgb, 0.7 + 0.3 * pulse);
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(CX - 14, cy + 2); ctx.lineTo(CX - 4, cy + 12); ctx.lineTo(CX + 16, cy - 10); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  },

  beacon(ctx, rgb, pulse, t) {
    const cy = 52;
    // Beacon pole
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.3 * pulse);
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(CX, cy + 20); ctx.lineTo(CX, cy - 5); ctx.stroke();
    // Base
    ctx.beginPath(); ctx.moveTo(CX - 12, cy + 20); ctx.lineTo(CX + 12, cy + 20); ctx.stroke();
    // Beacon light
    ctx.shadowColor = rgba(rgb, 0.8 * pulse);
    ctx.shadowBlur = 15 * pulse;
    ctx.fillStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.beginPath(); ctx.arc(CX, cy - 8, 6 + 2 * pulse, 0, Math.PI * 2); ctx.fill();
    // Signal waves
    for (let w = 0; w < 3; w++) {
      const waveR = 16 + w * 10 + pulse * 4;
      const waveA = Math.max(0, 0.3 - w * 0.1) * pulse;
      ctx.strokeStyle = rgba(rgb, waveA);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(CX, cy - 8, waveR, -Math.PI * 0.7, -Math.PI * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, cy - 8, waveR, -Math.PI * 0.7 + Math.PI, -Math.PI * 0.3 + Math.PI); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  refreshArrow(ctx, rgb, pulse, t) {
    const cy = 55, r = 24;
    const angle = t * Math.PI * 2;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    // Arc (3/4 circle)
    ctx.beginPath(); ctx.arc(CX, cy, r, angle, angle + Math.PI * 1.5); ctx.stroke();
    // Arrow head
    const endAngle = angle + Math.PI * 1.5;
    const ax = CX + Math.cos(endAngle) * r;
    const ay = cy + Math.sin(endAngle) * r;
    const headLen = 8;
    ctx.beginPath();
    ctx.moveTo(ax + Math.cos(endAngle - 0.5) * headLen, ay + Math.sin(endAngle - 0.5) * headLen);
    ctx.lineTo(ax, ay);
    ctx.lineTo(ax + Math.cos(endAngle + 1.2) * headLen, ay + Math.sin(endAngle + 1.2) * headLen);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';
  },

  cross(ctx, rgb, pulse) {
    const cy = 55, len = 18;
    ctx.shadowColor = rgba(rgb, 0.6 * pulse);
    ctx.shadowBlur = 10 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CX - len, cy - len); ctx.lineTo(CX + len, cy + len); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX + len, cy - len); ctx.lineTo(CX - len, cy + len); ctx.stroke();
    // Circle around
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(rgb, 0.3 + 0.2 * pulse);
    ctx.beginPath(); ctx.arc(CX, cy, 28, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';
  },

  hourglass(ctx, rgb, pulse, t) {
    const cy = 55, h = 26, w = 16;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 2;
    // Top half
    ctx.beginPath();
    ctx.moveTo(CX - w, cy - h); ctx.lineTo(CX + w, cy - h);
    ctx.lineTo(CX + 3, cy - 2); ctx.lineTo(CX - 3, cy - 2);
    ctx.closePath(); ctx.stroke();
    // Fill top (draining)
    const fillH = (1 - (t % 1)) * (h - 4);
    ctx.fillStyle = rgba(rgb, 0.15 + 0.1 * pulse);
    ctx.beginPath();
    const topW = w * (fillH / (h - 2));
    ctx.moveTo(CX - topW, cy - h + (h - 2 - fillH));
    ctx.lineTo(CX + topW, cy - h + (h - 2 - fillH));
    ctx.lineTo(CX + 3, cy - 2); ctx.lineTo(CX - 3, cy - 2);
    ctx.closePath(); ctx.fill();
    // Bottom half
    ctx.beginPath();
    ctx.moveTo(CX - 3, cy + 2); ctx.lineTo(CX + 3, cy + 2);
    ctx.lineTo(CX + w, cy + h); ctx.lineTo(CX - w, cy + h);
    ctx.closePath(); ctx.stroke();
    // Fill bottom (filling)
    const botFill = (t % 1) * (h - 4);
    ctx.fillStyle = rgba(rgb, 0.15 + 0.1 * pulse);
    const botW = w * (botFill / (h - 2));
    ctx.beginPath();
    ctx.moveTo(CX - botW, cy + h - botFill);
    ctx.lineTo(CX + botW, cy + h - botFill);
    ctx.lineTo(CX + w, cy + h); ctx.lineTo(CX - w, cy + h);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
  },

  hexagon(ctx, rgb, pulse) {
    const cy = 55, r = 26;
    ctx.shadowColor = rgba(rgb, 0.4 * pulse);
    ctx.shadowBlur = 6 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.4 + 0.3 * pulse);
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const x = CX + r * Math.cos(a), y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = rgba(rgb, 0.04 + 0.02 * pulse);
    ctx.fill();
    // Center dot
    ctx.fillStyle = rgba(rgb, 0.3 + 0.2 * pulse);
    ctx.beginPath(); ctx.arc(CX, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  },

  shield(ctx, rgb, pulse, label) {
    const cy = 52, w = 24, h = 32;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 10 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX, cy - h);
    ctx.lineTo(CX + w, cy - h + 10);
    ctx.lineTo(CX + w, cy + 4);
    ctx.quadraticCurveTo(CX + w, cy + h - 4, CX, cy + h);
    ctx.quadraticCurveTo(CX - w, cy + h - 4, CX - w, cy + 4);
    ctx.lineTo(CX - w, cy - h + 10);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = rgba(rgb, 0.08 + 0.05 * pulse);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Label inside
    ctx.fillStyle = rgba(rgb, 0.7 + 0.3 * pulse);
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, CX, cy + 2);
  },

  listBullets(ctx, rgb, pulse) {
    const cy = 48;
    ctx.fillStyle = rgba(rgb, 0.6 + 0.3 * pulse);
    for (let i = 0; i < 3; i++) {
      const y = cy + i * 14 - 10;
      // Bullet
      ctx.beginPath(); ctx.arc(CX - 18, y, 3, 0, Math.PI * 2); ctx.fill();
      // Line
      ctx.fillRect(CX - 10, y - 1.5, 30 - i * 4, 3);
    }
    ctx.shadowColor = rgba(rgb, 0.4 * pulse);
    ctx.shadowBlur = 6 * pulse;
    // Border
    ctx.strokeStyle = rgba(rgb, 0.3 + 0.2 * pulse);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(CX - 26, cy - 20, 52, 48);
    ctx.shadowBlur = 0;
  },

  people(ctx, rgb, pulse) {
    const cy = 50;
    ctx.shadowColor = rgba(rgb, 0.4 * pulse);
    ctx.shadowBlur = 6 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.3 * pulse);
    ctx.lineWidth = 2;
    // Center person
    ctx.beginPath(); ctx.arc(CX, cy - 14, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, cy + 8, 16, Math.PI + 0.4, -0.4); ctx.stroke();
    // Left person (smaller)
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(CX - 22, cy - 10, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX - 22, cy + 8, 12, Math.PI + 0.4, -0.4); ctx.stroke();
    // Right person (smaller)
    ctx.beginPath(); ctx.arc(CX + 22, cy - 10, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX + 22, cy + 8, 12, Math.PI + 0.4, -0.4); ctx.stroke();
    ctx.shadowBlur = 0;
  },

  eye(ctx, rgb, pulse, open) {
    const cy = 55;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 2.5;
    // Eye shape
    ctx.beginPath();
    ctx.moveTo(CX - 28, cy);
    ctx.quadraticCurveTo(CX, cy - 22, CX + 28, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CX - 28, cy);
    ctx.quadraticCurveTo(CX, cy + 22, CX + 28, cy);
    ctx.stroke();
    if (open) {
      // Pupil
      ctx.fillStyle = rgba(rgb, 0.7 + 0.3 * pulse);
      ctx.beginPath(); ctx.arc(CX, cy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BG;
      ctx.beginPath(); ctx.arc(CX, cy, 3, 0, Math.PI * 2); ctx.fill();
    } else {
      // Slash through
      ctx.strokeStyle = rgba(rgb, 0.7 + 0.3 * pulse);
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(CX - 20, cy + 20); ctx.lineTo(CX + 20, cy - 20); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  },

  gridTactical(ctx, rgb, pulse) {
    const cy = 52, cellSize = 12;
    ctx.shadowColor = rgba(rgb, 0.4 * pulse);
    ctx.shadowBlur = 6 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.4 + 0.3 * pulse);
    ctx.lineWidth = 1;
    const startX = CX - cellSize * 2, startY = cy - cellSize * 2;
    for (let r = 0; r <= 4; r++) {
      ctx.beginPath(); ctx.moveTo(startX, startY + r * cellSize); ctx.lineTo(startX + 4 * cellSize, startY + r * cellSize); ctx.stroke();
    }
    for (let c = 0; c <= 4; c++) {
      ctx.beginPath(); ctx.moveTo(startX + c * cellSize, startY); ctx.lineTo(startX + c * cellSize, startY + 4 * cellSize); ctx.stroke();
    }
    // Some filled cells (formation)
    ctx.fillStyle = rgba(rgb, 0.2 + 0.15 * pulse);
    const cells = [[1,1],[2,1],[1,2],[2,2],[3,2],[0,3],[1,3],[2,3],[3,3]];
    cells.forEach(([c, r]) => ctx.fillRect(startX + c * cellSize + 1, startY + r * cellSize + 1, cellSize - 2, cellSize - 2));
    ctx.shadowBlur = 0;
  },

  hexagonOrdered(ctx, rgb, pulse) {
    const cy = 53, r = 12;
    const positions = [[0, -22], [-19, -11], [19, -11], [-19, 11], [19, 11], [0, 22]];
    ctx.shadowColor = rgba(rgb, 0.3 * pulse);
    ctx.shadowBlur = 4 * pulse;
    positions.forEach(([ox, oy]) => {
      ctx.strokeStyle = rgba(rgb, 0.4 + 0.3 * pulse);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        const x = CX + ox + r * Math.cos(a), y = cy + oy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = rgba(rgb, 0.05 + 0.03 * pulse);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  },

  powerOff(ctx, rgb, pulse) {
    const cy = 53, r = 24;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.5 + 0.4 * pulse);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Arc (open at top)
    ctx.beginPath(); ctx.arc(CX, cy, r, 0.3 * Math.PI, 0.7 * Math.PI, true); ctx.stroke();
    // Vertical line
    ctx.beginPath(); ctx.moveTo(CX, cy - r - 2); ctx.lineTo(CX, cy - 6); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineCap = 'butt';
  },

  camera(ctx, rgb, pulse) {
    const cy = 52, w = 40, h = 28;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.5 + 0.4 * pulse);
    ctx.lineWidth = 2;
    // Body
    ctx.beginPath();
    ctx.roundRect(CX - w/2, cy - h/2, w, h, 4);
    ctx.stroke();
    ctx.fillStyle = rgba(rgb, 0.06 + 0.04 * pulse);
    ctx.fill();
    // Lens
    ctx.beginPath(); ctx.arc(CX, cy, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = rgba(rgb, 0.3 + 0.2 * pulse); ctx.fill();
    // Flash
    ctx.fillStyle = rgba(rgb, 0.5 + 0.3 * pulse);
    ctx.fillRect(CX + 10, cy - h/2 - 6, 8, 6);
    ctx.shadowBlur = 0;
  },

  filmCamera(ctx, rgb, pulse) {
    const cy = 52, r = 18;
    ctx.shadowColor = rgba(rgb, 0.5 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.5 + 0.4 * pulse);
    ctx.lineWidth = 2;
    // REC circle
    ctx.beginPath(); ctx.arc(CX, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = rgba(rgb, 0.15 + 0.15 * pulse); ctx.fill();
    // Inner dot (pulsing)
    ctx.beginPath(); ctx.arc(CX, cy, 8 + 2 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = rgba(rgb, 0.6 + 0.4 * pulse); ctx.fill();
    ctx.shadowBlur = 0;
  },

  radar(ctx, rgb, pulse) {
    const cy = 53;
    ctx.shadowColor = rgba(rgb, 0.4 * pulse);
    ctx.shadowBlur = 8 * pulse;
    ctx.strokeStyle = rgba(rgb, 0.3 + 0.3 * pulse);
    ctx.lineWidth = 1.5;
    // Concentric circles
    ctx.beginPath(); ctx.arc(CX, cy, 28, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, cy, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, cy, 8, 0, Math.PI * 2); ctx.stroke();
    // Center dot
    ctx.fillStyle = rgba(rgb, 0.7 + 0.3 * pulse);
    ctx.beginPath(); ctx.arc(CX, cy, 3, 0, Math.PI * 2); ctx.fill();
    // Cross lines
    ctx.beginPath(); ctx.moveTo(CX - 30, cy); ctx.lineTo(CX + 30, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, cy - 30); ctx.lineTo(CX, cy + 30); ctx.stroke();
    ctx.shadowBlur = 0;
  },
};

// --- Icon definitions ---
const icons = [
  // Theme 1: Combat
  { file: 'help-animated.gif', color: '#FFEB3B', symbol: 'alertTriangle', text: 'HELP', intensity: 0.8, duration: 1.5 },
  { file: 'raid-check.gif', color: '#ED4245', symbol: 'crossedSwords', text: 'RAID', intensity: 1.0, duration: 1.5 },
  { file: 'raid-off.gif', color: '#43B581', symbol: 'checkmark', text: 'R.OFF', intensity: 0.5, duration: 2.0 },
  { file: 'rally.gif', color: '#FAA61A', symbol: 'beacon', text: 'RALLY', intensity: 0.7, duration: 1.5 },
  { file: 'reset-status.gif', color: '#5B54A4', symbol: 'refreshArrow', text: 'RESET', intensity: 0.6, duration: 1.5 },

  // Theme 2: Status
  { file: 'status-rdy.gif', color: '#43B581', symbol: 'checkmark', text: 'RDY', intensity: 0.4, duration: 2.0 },
  { file: 'status-dead.gif', color: '#ED4245', symbol: 'cross', text: 'DEAD', intensity: 0.6, duration: 2.0 },
  { file: 'status-wait.gif', color: '#FAA61A', symbol: 'hourglass', text: 'WAIT', intensity: 0.5, duration: 2.0 },
  { file: 'status-none.gif', color: '#555555', symbol: 'hexagon', text: 'STATUS', intensity: 0.2, duration: 2.0 },

  // Theme 3: Panels
  { file: 'admin-op.gif', color: '#5B54A4', symbol: 'shield', symbolArg: 'OP', text: 'OP', intensity: 0.5, duration: 2.0 },
  { file: 'admin-all.gif', color: '#00BCD4', symbol: 'shield', symbolArg: 'ALL', text: 'ALL', intensity: 0.5, duration: 2.0 },
  { file: 'fleet-on.gif', color: '#43B581', symbol: 'listBullets', text: 'FLEET', intensity: 0.5, duration: 2.0 },
  { file: 'fleet-off.gif', color: '#555555', symbol: 'listBullets', text: 'FLEET', intensity: 0.15, duration: 2.0 },
  { file: 'tslive-on.gif', color: '#00BCD4', symbol: 'people', text: 'TS LIVE', intensity: 0.5, duration: 2.0 },
  { file: 'tslive-off.gif', color: '#555555', symbol: 'people', text: 'TS LIVE', intensity: 0.15, duration: 2.0 },
  { file: 'overlay-show.gif', color: '#5B54A4', symbol: 'eye', symbolArg: true, text: 'SHOW', intensity: 0.5, duration: 2.0 },
  { file: 'overlay-hide.gif', color: '#555555', symbol: 'eye', symbolArg: false, text: 'HIDE', intensity: 0.15, duration: 2.0 },

  // Theme 4: Navigation
  { file: 'mode-normal.gif', color: '#43B581', symbol: 'hexagonOrdered', text: 'NRM', intensity: 0.4, duration: 2.0 },
  { file: 'mode-fdg.gif', color: '#ED4245', symbol: 'gridTactical', text: 'FDG', intensity: 0.8, duration: 1.5 },

  // Theme 5: Media
  { file: 'screenshot.gif', color: '#00BCD4', symbol: 'camera', text: 'SCREEN', intensity: 0.5, duration: 2.0 },
  { file: 'clip-off.gif', color: '#5B54A4', symbol: 'filmCamera', text: 'CLIP', intensity: 0.4, duration: 2.0 },
  { file: 'clip-on.gif', color: '#ED4245', symbol: 'filmCamera', text: 'REC', intensity: 1.0, duration: 1.0 },
  { file: 'ping-off.gif', color: '#555555', symbol: 'radar', text: 'PING', intensity: 0.2, duration: 2.0 },
  { file: 'ping-on.gif', color: '#FAA61A', symbol: 'radar', text: 'PING', intensity: 0.8, duration: 1.5 },

  // Theme 6: System
  { file: 'quit.gif', color: '#ED4245', symbol: 'powerOff', text: 'QUIT', intensity: 0.2, duration: 2.0 },
];

// --- Generate all icons ---
console.log(`Generating ${icons.length} icons...`);

icons.forEach((icon) => {
  const rgb = hexToRgb(icon.color);
  const frames = FPS * icon.duration;
  const encoder = new GIFEncoder(SIZE, SIZE, 'neuquant', true);
  encoder.setDelay(1000 / FPS);
  encoder.setRepeat(0);
  encoder.setQuality(10);
  encoder.start();

  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < frames; i++) {
    const t = i / frames;
    const rawPulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
    const pulse = rawPulse * icon.intensity;
    const glowPulse = 0.3 + 0.7 * pulse;

    drawBackground(ctx);
    drawGrid(ctx, rgb, pulse);
    drawGlow(ctx, rgb, 55, pulse);

    // Draw symbol
    const symFn = symbols[icon.symbol];
    if (icon.symbolArg !== undefined) {
      symFn(ctx, rgb, glowPulse, icon.symbolArg);
    } else {
      symFn(ctx, rgb, glowPulse, t);
    }

    drawScanLine(ctx, rgb, t, glowPulse);
    drawCorners(ctx, rgb, pulse);
    drawText(ctx, rgb, icon.text, glowPulse);

    encoder.addFrame(ctx);
  }

  encoder.finish();
  const buffer = encoder.out.getData();
  const outPath = path.join(OUTPUT_DIR, icon.file);
  fs.writeFileSync(outPath, buffer);
  console.log(`  ${icon.file.padEnd(22)} ${(buffer.length / 1024).toFixed(0).padStart(4)} KB  ${frames} frames  ${icon.duration}s`);
});

console.log(`\nDone! ${icons.length} GIFs in ${OUTPUT_DIR}`);
