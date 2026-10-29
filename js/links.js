// What it does: Pure URL and message formatting for WhatsApp sales, sharing, UTM tracking, and analytics payloads. No DOM.
// What it uses: config.js, js/copy.js, js/engine/lock.js.
// What uses it: All screens, share.js, analytics.js, selftest.js.

import { CONFIG } from "../config.js";
import { t } from "./copy.js";
import { formatClock } from "./engine/lock.js";

export function salesMessage(summary, path, config = CONFIG) {
  const parts = [];

  const roomsSolved = summary?.escape?.roomsSolved || 0;
  const puzzlesSolved = summary?.solvedCount || 0;
  const isFresh = roomsSolved === 0 && puzzlesSolved === 0;

  if (isFresh) {
    parts.push("Hi, I tried The Broken Website.");
  } else {
    parts.push("Hi, I played The Broken Website.");
  }

  if (roomsSolved === 5) {
    const time = formatClock(summary.escape.seconds || 0);
    parts.push(`I escaped all 5 rooms in ${time}.`);
  } else if (roomsSolved > 0) {
    parts.push(`I got through ${roomsSolved} of 5 escape rooms.`);
  }

  if (puzzlesSolved > 0) {
    const pointsStr = (summary.points || 0).toLocaleString("en-IN");
    const rankStr = summary.rank || "Trainee";
    parts.push(`I solved ${puzzlesSolved} of 15 puzzles and scored ${pointsStr} of 3,000 (${rankStr}).`);
  }

  if (path) {
    const pathText = t(`path.${path}`);
    if (pathText && pathText !== `path.${path}`) {
      parts.push(`About me: ${pathText}.`);
    }
  }

  const programName = config?.program?.name || CONFIG.program.name;
  parts.push(`I would like to know more about the ${programName}.`);

  return parts.join(" ");
}

export function salesUrl(summary, path, config = CONFIG, overridePhone = null) {
  const phone = overridePhone || config.salesWhatsApp;
  if (!phone) return "";
  const text = salesMessage(summary, path, config);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function shareText(summary, siteUrl = "") {
  const solved = summary?.solvedCount || 0;
  const pointsStr = (summary?.points || 0).toLocaleString("en-IN");
  const rank = summary?.rank || "Trainee";
  return `I solved ${solved} of 15 puzzles on The Broken Website and scored ${pointsStr} of 3,000. Rank: ${rank}. Can you beat that? ${siteUrl}`;
}

export function shareUrl(summary, siteUrl = "") {
  const text = shareText(summary, siteUrl);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function escapeShareText(seconds, siteUrl = "") {
  const time = formatClock(seconds || 0);
  return `I escaped all 5 rooms of The Broken Website in ${time}. Can you get out faster? ${siteUrl}`;
}

export function escapeShareUrl(seconds, siteUrl = "") {
  const text = escapeShareText(seconds, siteUrl);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function websiteUrl(spot, config = CONFIG) {
  const base = config.website || "https://wrench-wise.com/";
  const u = new URL(base);
  if (config.utm) {
    if (config.utm.source) u.searchParams.set("utm_source", config.utm.source);
    if (config.utm.medium) u.searchParams.set("utm_medium", config.utm.medium);
    if (config.utm.campaign) u.searchParams.set("utm_campaign", config.utm.campaign);
  }
  if (spot) {
    u.searchParams.set("utm_content", spot);
  }
  return u.toString();
}

export function programUrl(spot, config = CONFIG, which = "program") {
  const prog = which === "second" ? config.secondProgram : config.program;
  if (!prog || !prog.page) {
    return websiteUrl(spot, config);
  }
  const base = config.website || "https://wrench-wise.com/";
  const u = new URL(prog.page, base);
  if (config.utm) {
    if (config.utm.source) u.searchParams.set("utm_source", config.utm.source);
    if (config.utm.medium) u.searchParams.set("utm_medium", config.utm.medium);
    if (config.utm.campaign) u.searchParams.set("utm_campaign", config.utm.campaign);
  }
  if (spot) {
    u.searchParams.set("utm_content", spot);
  }
  return u.toString();
}

function cleanParam(v) {
  if (typeof v === "string") {
    return v.slice(0, 100);
  }
  return v;
}

function cleanParams(params) {
  if (!params) return {};
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) {
      out[k] = cleanParam(v);
    }
  }
  return out;
}

export function payloadsFor(eventName, data = {}) {
  let ga4 = null;
  let meta = null;

  switch (eventName) {
    case "level:open":
      ga4 = { name: "level_open", params: { level: data.level } };
      break;

    case "path:choose":
      ga4 = { name: "path_choose", params: { path: data.path } };
      meta = { type: "trackCustom", event: "PathChosen", params: { path: data.path } };
      break;

    case "room:start":
      ga4 = { name: "room_start", params: { room: data.id } };
      break;

    case "code:try":
      ga4 = { name: "code_try", params: { room: data.id, result: data.result } };
      break;

    case "room:escaped":
      ga4 = {
        name: "room_escaped",
        params: {
          room: data.id,
          points: data.points,
          seconds: data.seconds,
          hints: data.hints,
          wrong_codes: data.wrongCodes
        }
      };
      break;

    case "room:skip":
      ga4 = { name: "room_skip", params: { room: data.id } };
      break;

    case "escape:done":
      ga4 = {
        name: "escape_done",
        params: { seconds: data.seconds, points: data.points }
      };
      meta = { type: "trackCustom", event: "EscapeDone", params: { seconds: data.seconds } };
      break;

    case "puzzle:start":
      ga4 = { name: "puzzle_start", params: { puzzle: data.id, level: data.level } };
      break;

    case "spot:tap":
      ga4 = {
        name: "spot_tap",
        params: { puzzle: data.id, correct: Boolean(data.correct) }
      };
      break;

    case "fix:pick":
      ga4 = {
        name: "fix_pick",
        params: { puzzle: data.id, option: data.option, correct: Boolean(data.correct) }
      };
      break;

    case "hint:open":
      ga4 = {
        name: "hint_open",
        params: { puzzle: data.id, hint: data.n }
      };
      break;

    case "checks:run":
      ga4 = {
        name: "checks_run",
        params: { puzzle: data.id, passed: data.passed, total: data.total }
      };
      break;

    case "puzzle:solved":
      ga4 = {
        name: "puzzle_solved",
        params: {
          puzzle: data.id,
          level: data.level,
          points: data.points,
          stars: data.stars,
          seconds: data.seconds,
          hints: data.hints,
          tries: data.tries
        }
      };
      meta = { type: "trackCustom", event: "PuzzleSolved", params: { level: data.level } };
      break;

    case "solution:reveal":
      ga4 = { name: "solution_reveal", params: { puzzle: data.id } };
      break;

    case "level:done":
      ga4 = {
        name: "level_done",
        params: { level: data.level, points: data.points, stars: data.stars }
      };
      meta = {
        type: "trackCustom",
        event: "LevelDone",
        params: { level: data.level, points: data.points }
      };
      break;

    case "result:shown":
      ga4 = {
        name: "result_view",
        params: { solved: data.solved, total: data.total, rank: data.rank }
      };
      break;

    case "cta:sales":
      ga4 = {
        name: "whatsapp_sales_click",
        params: { spot: data.spot, total: data.total }
      };
      meta = { type: "track", event: "Lead", params: {} };
      break;

    case "cta:program":
      ga4 = { name: "program_click", params: { spot: data.spot } };
      break;

    case "cta:website":
      ga4 = { name: "website_click", params: { spot: data.spot } };
      break;

    case "cta:session":
      ga4 = { name: "session_click", params: {} };
      break;

    case "share:image":
      ga4 = { name: "share_image", params: { size: data.size } };
      break;

    case "share:whatsapp":
      ga4 = { name: "share_whatsapp", params: {} };
      break;

    case "share:copy":
      ga4 = { name: "copy_link", params: {} };
      break;

    default:
      // Other events like app:ready, theme:change, sound:toggle, room:edit send no tracking
      break;
  }

  return {
    ga4: ga4 ? { name: ga4.name, params: cleanParams(ga4.params) } : null,
    meta: meta ? { type: meta.type, event: meta.event, params: cleanParams(meta.params) } : null
  };
}
