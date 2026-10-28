/**
 * Proves the share card fallback chain, without touching the dataset.
 *
 *   node --env-file=.env.local --import ./scripts/lib/alias-loader.mjs \
 *     scripts/test-share-fallback.ts
 *
 * Both flags are needed and neither is incidental. `--env-file` because the
 * import graph reaches `sanity/env.ts`, which throws on a missing project id
 * rather than guessing one. `--import` because Node does not read the `@/`
 * alias out of tsconfig.json, nor supply the extension on a relative import;
 * `scripts/lib/alias-loader.mjs` does both, and resolution only, so what this
 * imports is the same file Next compiles.
 *
 * WHY A UNIT TEST AND NOT A FETCH
 *
 * `audit-share-cards.js` reads live pages, so it can only exercise the
 * fallback on the pages whose Studio field happens to be empty: six of
 * fifty-six today. The other fifty are covered by a picture somebody chose,
 * which is exactly the state that hid fifteen routes with no fallback at all
 * until 2026-10-28.
 *
 * Clearing a field to test it would mean writing to the shared production
 * dataset for the sake of a check, which is the one thing CLAUDE.md is most
 * insistent about. `buildPageMetadata` is a pure function, so it can simply be
 * called with an empty `seo` instead. Node 24 strips the types, so this runs
 * with no build step.
 *
 * What it asserts, in the order the chain is meant to resolve:
 *
 *   1  a picture chosen in the Studio wins
 *   2  with none, the page's own photograph is used
 *   3  with neither, the house card, so a card is never bare
 *   4  the alt written against the picture is preferred to the asset's
 *   5  every image comes out at 1200x630
 *   6  a noindex page is excused, and emits no card at all
 */
import {
  SITE_SHARE_IMAGE,
  buildPageMetadata,
} from "../lib/page-metadata.ts";

const CHOSEN = {
  alt: "The picture chosen in the Studio.",
  asset: {
    _id: "image-ee230e7ba114b5beea8abf2bafb82abef4342f2e-2601x1611-jpg",
    url: "https://cdn.sanity.io/images/rwc5kyvy/production/ee230e7ba114b5beea8abf2bafb82abef4342f2e-2601x1611.jpg",
  },
};

const PAGE_PHOTO = {
  alt: "A photograph the page already shows.",
  asset: {
    _id: "image-de42a6de4688bc94520aebc2291dfbc96e2fb029-2400x1500-jpg",
    url: "https://cdn.sanity.io/images/rwc5kyvy/production/de42a6de4688bc94520aebc2291dfbc96e2fb029-2400x1500.jpg",
  },
};

const seoWith = (ogImage: unknown) => ({
  pageTitle: "A Page",
  pageDescription: "What the page is about.",
  socialMeta: {
    title: "A Page",
    description: "What the page is about.",
    ogImage,
    twitterImage: null,
  },
});

let failed = 0;

function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) {
    failed++;
    console.log(`         got  ${JSON.stringify(got)}`);
    console.log(`         want ${JSON.stringify(want)}`);
  }
}

/** The asset hash out of whatever buildPageMetadata produced. */
function served(metadata: any) {
  const entry = metadata.openGraph?.images?.[0];
  if (!entry) return null;
  const match = String(entry.url).match(/\/production\/([0-9a-f]{40})-/);
  return { hash: match ? match[1] : null, alt: entry.alt, w: entry.width, h: entry.height };
}

console.log("\n  The share card fallback chain\n");

// 1  a picture chosen in the Studio wins over the page's own photograph.
const chosen = served(
  buildPageMetadata(seoWith(CHOSEN) as never, {
    path: "/x",
    image: PAGE_PHOTO,
  })
);
check("a Studio picture wins", chosen?.hash, CHOSEN.asset._id.split("-")[1]);
check("  and carries its own alt", chosen?.alt, CHOSEN.alt);

// 2  with the Studio field empty, the page's own photograph.
const fallback = served(
  buildPageMetadata(seoWith(null) as never, {
    path: "/x",
    image: PAGE_PHOTO,
  })
);
check(
  "an empty field falls back to the page's photograph",
  fallback?.hash,
  PAGE_PHOTO.asset._id.split("-")[1]
);
check("  and carries its alt", fallback?.alt, PAGE_PHOTO.alt);

// 3  with neither, the house card. This is the one that stops a bare card.
const house = served(
  buildPageMetadata(seoWith(null) as never, { path: "/x", image: undefined })
);
check(
  "neither falls back to the house card",
  house?.hash,
  SITE_SHARE_IMAGE!.asset!._id!.split("-")[1]
);
check("  which is never empty", Boolean(house?.alt), true);

// 4  the alt written against the picture beats the asset document's.
const bothAlts = served(
  buildPageMetadata(
    seoWith({
      alt: "Written against this picture.",
      asset: { ...CHOSEN.asset, alt: "On the asset document." },
    }) as never,
    { path: "/x", image: PAGE_PHOTO }
  )
);
check("the field's alt beats the asset's", bothAlts?.alt, "Written against this picture.");

// 5  every one of them is a 1200x630 card.
check("sized 1200x630", [chosen?.w, chosen?.h], [1200, 630]);
check("  the fallback too", [fallback?.w, fallback?.h], [1200, 630]);
check("  the house card too", [house?.w, house?.h], [1200, 630]);

// 6  a noindex page is excused and emits no card.
const notFound = buildPageMetadata(null, { path: "/404", noindex: true });
check("a noindex page emits no image", notFound.openGraph?.images, undefined);
check("  and is not indexed", notFound.robots, { index: false, follow: true });

console.log(`\n  ${failed ? `${failed} FAILED` : "All checks passed."}\n`);
process.exitCode = failed ? 1 : 0;
