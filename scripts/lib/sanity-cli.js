/**
 * Shared helpers for the scripts in this directory.
 *
 * Deliberately dependency-free CommonJS so the scripts run with a bare
 * `node scripts/<name>.js` from PowerShell or Git Bash, with no build step and
 * no reliance on the Next.js runtime loading .env.local for us.
 */

const fs = require("fs");
const path = require("path");

/** Characters this project treats as contamination. See CH-020. */
const CF_GLOBAL = /\p{Cf}/gu;

/**
 * Reads .env.local from the repository root.
 *
 * The Sanity tokens only ever live in .env.local, which is gitignored, so the
 * scripts read it directly rather than expecting the shell to be pre-seeded.
 */
function loadEnv() {
  const envPath = path.join(__dirname, "..", "..", ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Cannot find ${envPath}. The Sanity tokens live there and are not committed.`
    );
  }

  const env = {};

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const split = trimmed.indexOf("=");
    if (split < 0) continue;

    env[trimmed.slice(0, split).trim()] = trimmed
      .slice(split + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }

  return env;
}

function requireValue(value, name) {
  if (!value) {
    throw new Error(`Missing ${name} in .env.local`);
  }

  return value;
}

function getConfig() {
  const env = loadEnv();

  return {
    projectId: requireValue(
      env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      "NEXT_PUBLIC_SANITY_PROJECT_ID"
    ),
    dataset: requireValue(
      env.NEXT_PUBLIC_SANITY_DATASET,
      "NEXT_PUBLIC_SANITY_DATASET"
    ),
    apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-18",
    readToken: env.SANITY_API_READ_TOKEN,
    writeToken: env.SANITY_API_WRITE_TOKEN,
  };
}

/** Runs a GROQ query. Read-only: uses the read token and never mutates. */
async function query(groq, params = {}) {
  const config = getConfig();
  requireValue(config.readToken, "SANITY_API_READ_TOKEN");

  const search = new URLSearchParams({ query: groq });
  for (const [key, value] of Object.entries(params)) {
    search.set(`$${key}`, JSON.stringify(value));
  }

  const url =
    `https://${config.projectId}.api.sanity.io/v${config.apiVersion}` +
    `/data/query/${config.dataset}?${search.toString()}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${config.readToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Sanity query failed: ${response.status} ${await response.text()}`
    );
  }

  return (await response.json()).result;
}

/**
 * Submits mutations. Requires SANITY_API_WRITE_TOKEN.
 *
 * Only ever called behind an explicit --apply flag, never on a dry run.
 */
async function mutate(mutations) {
  const config = getConfig();
  requireValue(config.writeToken, "SANITY_API_WRITE_TOKEN");

  const url =
    `https://${config.projectId}.api.sanity.io/v${config.apiVersion}` +
    `/data/mutate/${config.dataset}?returnIds=true`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.writeToken}`,
    },
    body: JSON.stringify({ mutations }),
  });

  if (!response.ok) {
    throw new Error(
      `Sanity mutation failed: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

function codepoint(character) {
  return (
    "U+" + character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")
  );
}

function countCf(value) {
  if (typeof value !== "string") return 0;

  return (value.match(CF_GLOBAL) || []).length;
}

/**
 * Renders a string with runs of Format-category characters collapsed into a
 * readable marker, so a 1,906 character run does not flood the terminal.
 */
function annotate(value) {
  if (value === null || value === undefined) return "(null)";
  if (typeof value !== "string") return JSON.stringify(value);

  let out = "";
  let run = [];

  const flush = () => {
    if (!run.length) return;

    const unique = [...new Set(run)];
    const label =
      unique.length === 1
        ? `${run.length}x ${unique[0]}`
        : `${run.length} Cf chars, ${unique.join(" ")}`;
    out += `[${label}]`;
    run = [];
  };

  for (const character of value) {
    if (/\p{Cf}/u.test(character)) {
      run.push(codepoint(character));
      continue;
    }

    flush();
    out += character;
  }

  flush();

  return JSON.stringify(out).replace(/\\"/g, '"');
}

/** Walks every string leaf, yielding [dotted.path, value]. */
function walkStrings(node, prefix = "") {
  const found = [];

  if (typeof node === "string") {
    found.push([prefix, node]);
    return found;
  }

  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      found.push(...walkStrings(item, `${prefix}[${index}]`));
    });
    return found;
  }

  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      found.push(...walkStrings(value, prefix ? `${prefix}.${key}` : key));
    }
  }

  return found;
}

module.exports = {
  CF_GLOBAL,
  annotate,
  codepoint,
  countCf,
  getConfig,
  mutate,
  query,
  walkStrings,
};
