const { createCanvas } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');

const SIZE = 144;
const FPS = 20;
const DURATION_S = 1.5;
const TOTAL_FRAMES = FPS * DURATION_S;

const BG = '#0d0b18';
const YELLOW = [255, 235, 59];
const AMBER = [255, 193, 7];

const outputPath = path.join(__dirname, '..', 'com.digitis.disorder-deck.sdPlugin', 'imgs', 'actions', 'help-animated.gif');

const encoder = new GIFEncoder(SIZE, SIZE, 'neuquant', true);
encoder.setDelay(1000 / FPS);
encoder.setRepeat(0);
encoder.setQuality(10);
encoder.start();

const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const t = i / TOTAL_FRAMES;
  ctx.clearRect(0, 0, SIZE, SIZE);

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 235, 59, 0.03)';
  ctx.lineWidth = 0.5;
  for (let g = 0; g < SIZE; g += 12) {
    ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(SIZE, g); ctx.stroke();
  }

  // Pulsation: smooth sine wave
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
  const glowPulse = 0.3 + 0.7 * pulse;

  // Outer glow
  const glowRadius = 38 + pulse * 6;
  const glow = ctx.createRadialGradient(72, 58, 10, 72, 58, glowRadius);
  glow.addColorStop(0, `rgba(${YELLOW.join(',')}, ${0.15 * glowPulse})`);
  glow.addColorStop(1, 'rgba(255, 235, 59, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(72, 58, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Alert triangle
  const cx = 72, cy = 55;
  const triSize = 34;
  const topY = cy - triSize + 4;
  const botY = cy + triSize * 0.6;
  const halfBase = triSize * 0.7;

  // Triangle shadow/glow
  ctx.shadowColor = `rgba(${YELLOW.join(',')}, ${0.6 * glowPulse})`;
  ctx.shadowBlur = 12 * glowPulse;

  // Triangle outline
  ctx.beginPath();
  ctx.moveTo(cx, topY);
  ctx.lineTo(cx + halfBase, botY);
  ctx.lineTo(cx - halfBase, botY);
  ctx.closePath();

  // Fill with gradient
  const triFill = ctx.createLinearGradient(cx, topY, cx, botY);
  const alpha = 0.12 + 0.1 * pulse;
  triFill.addColorStop(0, `rgba(${YELLOW.join(',')}, ${alpha})`);
  triFill.addColorStop(1, `rgba(${AMBER.join(',')}, ${alpha * 0.5})`);
  ctx.fillStyle = triFill;
  ctx.fill();

  // Triangle border
  const borderAlpha = 0.6 + 0.4 * glowPulse;
  ctx.strokeStyle = `rgba(${YELLOW.join(',')}, ${borderAlpha})`;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Exclamation mark
  const exAlpha = 0.7 + 0.3 * glowPulse;
  ctx.fillStyle = `rgba(${YELLOW.join(',')}, ${exAlpha})`;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', cx, cy + 2);

  // Scan line effect
  const scanY = (t * SIZE * 1.5) % (SIZE + 20) - 10;
  const scanGrad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
  scanGrad.addColorStop(0, 'rgba(255, 235, 59, 0)');
  scanGrad.addColorStop(0.5, `rgba(255, 235, 59, ${0.06 * glowPulse})`);
  scanGrad.addColorStop(1, 'rgba(255, 235, 59, 0)');
  ctx.fillStyle = scanGrad;
  ctx.fillRect(0, scanY - 8, SIZE, 16);

  // Corner accents (HUD style)
  const cornerLen = 10;
  const cornerAlpha = 0.3 + 0.2 * pulse;
  ctx.strokeStyle = `rgba(${YELLOW.join(',')}, ${cornerAlpha})`;
  ctx.lineWidth = 1;
  // Top-left
  ctx.beginPath(); ctx.moveTo(4, 4 + cornerLen); ctx.lineTo(4, 4); ctx.lineTo(4 + cornerLen, 4); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(SIZE - 4 - cornerLen, 4); ctx.lineTo(SIZE - 4, 4); ctx.lineTo(SIZE - 4, 4 + cornerLen); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(4, SIZE - 4 - cornerLen); ctx.lineTo(4, SIZE - 4); ctx.lineTo(4 + cornerLen, SIZE - 4); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(SIZE - 4 - cornerLen, SIZE - 4); ctx.lineTo(SIZE - 4, SIZE - 4); ctx.lineTo(SIZE - 4, SIZE - 4 - cornerLen); ctx.stroke();

  // "HELP" text
  const textAlpha = 0.7 + 0.3 * glowPulse;
  ctx.shadowColor = `rgba(${YELLOW.join(',')}, ${0.5 * glowPulse})`;
  ctx.shadowBlur = 6 * glowPulse;
  ctx.fillStyle = `rgba(${YELLOW.join(',')}, ${textAlpha})`;
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('HELP', cx, SIZE - 10);
  ctx.shadowBlur = 0;

  // Thin horizontal lines above and below text (HUD)
  const lineAlpha = 0.2 + 0.15 * pulse;
  ctx.strokeStyle = `rgba(${YELLOW.join(',')}, ${lineAlpha})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(20, SIZE - 28); ctx.lineTo(SIZE - 20, SIZE - 28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(30, SIZE - 6); ctx.lineTo(SIZE - 30, SIZE - 6); ctx.stroke();

  encoder.addFrame(ctx);
}

encoder.finish();

const buffer = encoder.out.getData();
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buffer);
console.log(`GIF generated: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB, ${TOTAL_FRAMES} frames, ${DURATION_S}s loop)`);
