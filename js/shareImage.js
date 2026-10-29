// What it does: Synthesizes high-resolution canvas share cards for social media status (1080x1920) and post (1080x1350).
// What it uses: config.js, js/copy.js, js/engine/lock.js.
// What uses it: js/share.js, js/screens/result.js, js/screens/escaped.js.

import { CONFIG } from "../config.js";
import { formatClock } from "./engine/lock.js";

const SIZES = {
  status: { width: 1080, height: 1920, topPadding: 260 },
  post: { width: 1080, height: 1350, topPadding: 100 }
};

export function createShareImageCanvas(options = {}) {
  const mode = options.mode || "score"; // "score" or "escape"
  const sizeKey = options.size === "post" ? "post" : "status";
  const { width, height, topPadding } = SIZES[sizeKey];

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 1. Background gradient matching --bg-grad
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#ECFDF5");
  bgGrad.addColorStop(0.45, "#FFFFFF");
  bgGrad.addColorStop(1, "#ECFEFF");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Faint decorative grid pattern
  ctx.strokeStyle = "rgba(5, 150, 105, 0.04)";
  ctx.lineWidth = 1;
  const gridStep = 48;
  for (let x = 0; x < width; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. 6px Brand gradient bar across top
  const barGrad = ctx.createLinearGradient(0, 0, width, 0);
  barGrad.addColorStop(0, "#059669");
  barGrad.addColorStop(0.5, "#0D9488");
  barGrad.addColorStop(1, "#06B6D4");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, width, 12);

  // Content start Y (keeps safe zone > 220px on status size)
  let y = topPadding;

  // 3. Header Wordmark & Eyebrow
  ctx.textAlign = "center";
  ctx.fillStyle = "#059669";
  ctx.font = "bold 28px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("WRENCH WISE PRESENTS", width / 2, y);

  y += 56;
  ctx.fillStyle = "#111827";
  ctx.font = "800 68px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("The Broken Website", width / 2, y);

  y += 40;
  ctx.fillStyle = "#6B7280";
  ctx.font = "500 32px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("A interactive web debugging challenge", width / 2, y);

  y += 60;

  if (mode === "escape") {
    // Escape Room layout
    drawEscapeCard(ctx, width, y, options);
  } else {
    // Standard Score layout
    drawScoreCard(ctx, width, y, options);
  }

  // Footer: Site URL and challenge
  const footerY = height - (sizeKey === "status" ? 240 : 80);
  ctx.textAlign = "center";
  ctx.fillStyle = "#047857";
  ctx.font = "bold 34px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(options.ctaText || "Can you beat that?", width / 2, footerY);

  const siteLink = CONFIG.siteUrl || "https://the-broken-website.vercel.app/";
  ctx.fillStyle = "#6B7280";
  ctx.font = "400 28px ui-monospace, SFMono-Regular, monospace";
  ctx.fillText(siteLink, width / 2, footerY + 44);

  return canvas;
}

function drawScoreCard(ctx, width, startY, options) {
  const cardW = 900;
  const cardH = 760;
  const cardX = (width - cardW) / 2;
  const cardY = startY;

  // Draw card background
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32, "#FFFFFF", "rgba(15, 23, 42, 0.12)", 2);

  // Browser top bar mockup
  ctx.fillStyle = "#F3F4F6";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, 72, [32, 32, 0, 0]);
  ctx.fill();

  // Dots
  const dotY = cardY + 36;
  drawCircle(ctx, cardX + 44, dotY, 9, "#F87171");
  drawCircle(ctx, cardX + 74, dotY, 9, "#FBBF24");
  drawCircle(ctx, cardX + 104, dotY, 9, "#34D399");

  // Fixed Tag in bar
  drawRoundedPill(ctx, cardX + cardW - 140, cardY + 18, 100, 36, "#D1FAE5", "#059669", "Fixed");

  // Huge Points display
  const points = Number(options.points || 0).toLocaleString("en-IN");
  ctx.textAlign = "center";
  ctx.fillStyle = "#111827";
  ctx.font = "800 120px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(points, width / 2, cardY + 220);

  ctx.fillStyle = "#6B7280";
  ctx.font = "600 32px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("OF 3,000 POINTS", width / 2, cardY + 276);

  // Rank Pill
  const rank = options.rank || "Debugger";
  drawRankBadge(ctx, width / 2, cardY + 316, rank);

  // Solved Count
  const solvedCount = options.solvedCount || 0;
  ctx.fillStyle = "#374151";
  ctx.font = "500 30px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(`${solvedCount} of 15 puzzles solved`, width / 2, cardY + 440);

  // Three Level Rows
  const rowY = cardY + 490;
  const levels = [
    { name: "Beginner", points: options.levels?.beginner?.points || 0, stars: options.levels?.beginner?.stars || 0 },
    { name: "Moderate", points: options.levels?.moderate?.points || 0, stars: options.levels?.moderate?.stars || 0 },
    { name: "Expert", points: options.levels?.expert?.points || 0, stars: options.levels?.expert?.stars || 0 }
  ];

  levels.forEach((lvl, i) => {
    const yPos = rowY + i * 76;
    ctx.fillStyle = "#F8FAFC";
    drawRoundedRect(ctx, cardX + 50, yPos, cardW - 100, 60, 16, "#F8FAFC", "#E2E8F0", 1);

    ctx.textAlign = "left";
    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 28px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(lvl.name, cardX + 80, yPos + 40);

    ctx.textAlign = "right";
    ctx.fillStyle = "#059669";
    ctx.font = "600 26px ui-sans-serif, system-ui, sans-serif";
    const starStr = "★".repeat(Math.min(lvl.stars, 5));
    ctx.fillText(`${lvl.points} pts  ${starStr}`, cardX + cardW - 80, yPos + 40);
  });
}

function drawEscapeCard(ctx, width, startY, options) {
  const cardW = 900;
  const cardH = 680;
  const cardX = (width - cardW) / 2;
  const cardY = startY;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 32, "#0F172A", "rgba(15, 23, 42, 0.40)", 2);

  // Escaped Tag
  drawRoundedPill(ctx, width / 2 - 110, cardY + 48, 220, 48, "rgba(52, 211, 153, 0.2)", "#34D399", "YOU ESCAPED");

  // Doors illustration mockup
  const doorW = 280;
  const doorH = 200;
  const doorX = (width - doorW) / 2;
  const doorY = cardY + 120;
  ctx.fillStyle = "#1E293B";
  drawRoundedRect(ctx, doorX, doorY, doorW, doorH, 16, "#1E293B", "#334155", 2);

  // Center light glowing slit
  const slitGrad = ctx.createLinearGradient(width / 2 - 8, doorY, width / 2 + 8, doorY);
  slitGrad.addColorStop(0, "rgba(253, 230, 138, 0.1)");
  slitGrad.addColorStop(0.5, "#FDE68A");
  slitGrad.addColorStop(1, "rgba(253, 230, 138, 0.1)");
  ctx.fillStyle = slitGrad;
  ctx.fillRect(width / 2 - 6, doorY, 12, doorH);

  // Time Huge
  const timeStr = formatClock(options.seconds || 0);
  ctx.textAlign = "center";
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "800 110px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(timeStr, width / 2, cardY + 420);

  ctx.fillStyle = "#94A3B8";
  ctx.font = "600 32px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("ESCAPE TIME", width / 2, cardY + 476);

  // Rooms count and points
  const rooms = options.roomsSolved || 5;
  const pts = options.points || 500;
  ctx.fillStyle = "#34D399";
  ctx.font = "bold 34px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(`All ${rooms} rooms unlocked  ·  ${pts} of 500 points`, width / 2, cardY + 560);
}

function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke, strokeW) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeW || 1;
    ctx.stroke();
  }
}

function drawCircle(ctx, cx, cy, radius, fill) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawRoundedPill(ctx, x, y, w, h, bg, textCol, label) {
  drawRoundedRect(ctx, x, y, w, h, h / 2, bg, null, 0);
  ctx.textAlign = "center";
  ctx.fillStyle = textCol;
  ctx.font = "bold 20px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(label, x + w / 2, y + h / 2 + 7);
}

function drawRankBadge(ctx, cx, cy, rank) {
  const badgeW = 320;
  const badgeH = 56;
  const x = cx - badgeW / 2;
  drawRoundedRect(ctx, x, cy, badgeW, badgeH, 28, "#ECFDF5", "#A7F3D0", 2);
  ctx.textAlign = "center";
  ctx.fillStyle = "#047857";
  ctx.font = "800 28px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(rank.toUpperCase(), cx, cy + 38);
}

export async function createShareImageBlob(options = {}) {
  const canvas = createShareImageCanvas(options);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}
