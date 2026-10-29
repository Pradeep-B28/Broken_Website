// What it does: Mounts interactive share cards, handles canvas image generation, native web share, WhatsApp sharing, and link copying.
// What it uses: config.js, js/copy.js, js/links.js, js/events.js, js/shareImage.js.
// What uses it: js/screens/result.js, js/screens/escaped.js.

import { CONFIG } from "../config.js";
import { t } from "./copy.js";
import { shareText, shareUrl } from "./links.js";
import { emit } from "./events.js";
import { createShareImageBlob } from "./shareImage.js";

export function createShareCard(options = {}) {
  const isEscape = Boolean(options.isEscape);
  const summary = options.summary || {};
  let currentSize = "status"; // "status" or "post"

  const card = document.createElement("div");
  card.className = "card share-card";

  const title = document.createElement("h2");
  title.className = "share-title";
  title.textContent = t("share.title");
  card.appendChild(title);

  // Size Picker Pills
  const sizeRow = document.createElement("div");
  sizeRow.className = "share-size-row";

  const statusBtn = document.createElement("button");
  statusBtn.type = "button";
  statusBtn.className = "share-size-pill is-active";
  statusBtn.textContent = t("share.status");

  const postBtn = document.createElement("button");
  postBtn.type = "button";
  postBtn.className = "share-size-pill";
  postBtn.textContent = t("share.post");

  statusBtn.addEventListener("click", () => {
    currentSize = "status";
    statusBtn.classList.add("is-active");
    postBtn.classList.remove("is-active");
  });

  postBtn.addEventListener("click", () => {
    currentSize = "post";
    postBtn.classList.add("is-active");
    statusBtn.classList.remove("is-active");
  });

  sizeRow.appendChild(statusBtn);
  sizeRow.appendChild(postBtn);
  card.appendChild(sizeRow);

  // Action Buttons Grid
  const actionsRow = document.createElement("div");
  actionsRow.className = "share-actions-row";

  // 1. Share Image Button
  const shareImgBtn = document.createElement("button");
  shareImgBtn.type = "button";
  shareImgBtn.className = "btn btn-primary share-btn";
  shareImgBtn.textContent = t("share.image");

  shareImgBtn.addEventListener("click", async () => {
    shareImgBtn.disabled = true;
    const oldText = shareImgBtn.textContent;
    shareImgBtn.textContent = "Creating image...";

    try {
      const blob = await createShareImageBlob({
        mode: isEscape ? "escape" : "score",
        size: currentSize,
        points: summary.points,
        rank: summary.rank,
        solvedCount: summary.solvedCount,
        levels: summary.levels,
        seconds: isEscape ? summary.seconds || summary.escape?.seconds : 0,
        roomsSolved: isEscape ? summary.roomsSolved || summary.escape?.roomsSolved : 0
      });

      const fileName = isEscape
        ? `broken-website-escaped-${summary.seconds || 760}.png`
        : `broken-website-${summary.points || 0}.png`;

      const file = new File([blob], fileName, { type: "image/png" });
      const textToShare = shareText(summary, isEscape, CONFIG);

      emit("share:image", { size: currentSize });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "The Broken Website",
          text: textToShare,
          files: [file]
        });
      } else {
        // Fallback: download PNG directly
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Failed to share image:", err);
      }
    } finally {
      shareImgBtn.disabled = false;
      shareImgBtn.textContent = oldText;
    }
  });

  // 2. Send on WhatsApp Button
  const waBtn = document.createElement("a");
  waBtn.className = "btn btn-secondary share-btn";
  waBtn.textContent = t("share.whatsapp");
  waBtn.target = "_blank";
  waBtn.rel = "noopener noreferrer";
  waBtn.href = shareUrl(summary, isEscape, CONFIG);
  waBtn.addEventListener("click", () => {
    emit("share:whatsapp");
  });

  // 3. Copy Link Button
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "btn btn-secondary share-btn";
  copyBtn.textContent = t("share.copy");

  copyBtn.addEventListener("click", async () => {
    const siteUrl = CONFIG.siteUrl || window.location.origin;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(siteUrl);
      } else {
        const inp = document.createElement("input");
        inp.value = siteUrl;
        document.body.appendChild(inp);
        inp.select();
        document.execCommand("copy");
        document.body.removeChild(inp);
      }
      copyBtn.textContent = t("share.copied");
      emit("share:copy");
      setTimeout(() => {
        copyBtn.textContent = t("share.copy");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  });

  actionsRow.appendChild(shareImgBtn);
  actionsRow.appendChild(waBtn);
  actionsRow.appendChild(copyBtn);
  card.appendChild(actionsRow);

  return card;
}
