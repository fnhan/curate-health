# Curate Health: on-site SEO remediation

This file briefs Claude Code on the codebase, the constraints, and the work. Read it fully before touching anything.

---

## Stack

| Layer        | Detail                                                  |
| ------------ | ------------------------------------------------------- |
| Frontend     | Next.js App Router                                      |
| Hosting      | Vercel                                                  |
| CMS          | Sanity, project `rwc5kyvy`, dataset `production`        |
| Media        | Sanity CDN for images, Mux for video                    |
| Booking      | Jane, external at `curatehealth.janeapp.com`            |
| Serving host | `https://www.curatehealth.ca` (apex 308-redirects here) |

Site is 44 URLs in the sitemap. Health and wellness clinic with an attached cafe at 989 Eglinton Ave W, Suite 2, Toronto.

---

## Working rules

**Branch and preview, never push to production directly.** One branch per ticket group. Vercel preview deploy for every branch. Frank reviews the preview before merge.

**Claude Code may merge, in two tiers. Changed 2026-09-08, replacing "Frank merges everything".**

Tier 1, merge once the checks are green, no need to ask: changes that cannot alter what a visitor sees. Scripts, audits, tooling, tests, comments, and this file. If in doubt about which tier something is in, it is tier 2.

Tier 2, show Frank and wait for an explicit yes, then merge: anything touching pages, URLs, redirects, content, schema, navigation or metadata. Frank still reads the diff. Claude Code does the clicking once he says go. His approval is per pull request, and does not carry to the next one.

The human read of the change is the point, not who presses the button. That is why tier 2 exists and why it is the default for anything ambiguous.

**Branch protection does not enforce this, contrary to what this file said until 2026-09-08.** `required_approving_review_count` on `main` is 0. The protection blocks force pushes and branch deletion, nothing else, so any merge would have gone through unchallenged. The rule above was the only thing standing in the way, and it still is. Do not rely on GitHub to catch a tier 2 merge that skipped Frank.

Worth remembering why the caution is here. The worst incident on this project was a Sanity slug rename applied straight to the shared production dataset, which took a live indexed URL to 404 for two weeks while the matching redirect sat unmerged. It happened on the content side, which has no review step at all. Frank caught it, Claude Code did not.

**Back up Sanity before any mutation.** Export with `sanity dataset export production <file>.tar.gz` and keep the file outside the repository. Exports are large, 1.43 GB for the current one, so they never belong in git.

**Backups live outside the repo, so stop looking for one in the working tree.** The current restore point is `sanity-backup-2026-08-17.tar.gz`, in Frank's Documents folder with a cloud copy. Nothing matching `backup-*` will ever appear beside the source, and its absence is not evidence that no backup was taken. Ask rather than warn.

That file predates every mutation applied so far, CH-020, CH-021 and the CH-025 second-location retirement, which is what makes it the correct restore point for all of them. It is now stale. Take a fresh export before the next destructive ticket, and say so in the ticket rather than assuming the 2026-08-17 file still covers you.

**Verify by fetching the rendered page, not by reading source.** Several defects here are invisible in source and only appear in output. Every ticket has an acceptance check written as a command. Run it.

**Ask before inventing content.** Where a ticket needs copy that doesn't exist, draft it and stop. Frank approves before it goes into Sanity. Do not publish health claims without practitioner sign-off.

**Work in the order given.** P0 items are blocking others.

---

## Windows environment note

Frank runs Windows with Git for Windows installed, so you have Git Bash available for the Bash tool.

Two assumptions in the acceptance scripts below do not hold on this machine:

- `python3` resolves to the Microsoft Store stub, which prints an install prompt and exits 9009 instead of running. Python 3.12.10 is installed and runs as `py -3` or `python`. Use Node for verification checks anyway, since it removes the interpreter question and the project already depends on it. Counting Format-category characters in Node: `[...s].filter(c => /\p{Cf}/u.test(c)).length`
- In PowerShell, `curl` is an alias for `Invoke-WebRequest` and rejects curl's flags. Either run verification from Git Bash, where `curl` is the real binary, or use Node's built-in `fetch`.

Default to Node for every verification script in this file. It removes a dependency and behaves identically from either shell. When you rewrite one, show Frank the Node version and what it checks, since he will be running these himself between sessions.

---

## Content rules, non-negotiable

These apply to every word written into the site, schema, meta tags, or alt text.

- No em dashes or en dashes as punctuation. Use commas, colons, semicolons, or full stops. Compound hyphens like "evidence-based" are fine
- No exclamation marks
- No emojis
- No tricolons or rule-of-three lists
- No fabricated statistics, study citations, or quotes
- Banned words: journey, dive in, unlock, elevate, harness the power of, complimentary, transformative, seamless, holistic wellness journey
- Never use "complimentary" for anything Curate offers. Use "included" or "bonus"
- OHIP framing is exactly: "partially covered by OHIP and most benefit programs"
- The outdoor space is always "Recovery Sanctuary." Never "outdoor terrace" or any variant
- Neighbourhood descriptor is "Midtown Toronto"
- Canadian spelling throughout

Tone: scientific and evidence-based, thoughtful, warm, understated. A trusted clinician sharing an observation, not a brand talking. No hype.

### These rules bind the claude-seo plugin

The `claude-seo` plugin is installed at user scope, so its 25 skills and 18 subagents are active here. Nothing in it overrides this file.

- Every rule above applies to plugin output: generated titles, meta descriptions, alt text, schema values, content briefs, and anything a `claude-seo:*` subagent drafts. Generic SEO copy reaches for the banned words by default, so review it before it lands in the repo or in Sanity
- Subagent prompts do not reliably carry this file. When spawning any `claude-seo:*` agent, restate the banned words and the dash rule in the prompt itself, along with any canonical string the task touches
- The `seo` skill appends a "Community Footer" advertising the author's skool.com community after major deliverables. Strip it. It is not Curate content and must not reach a client deliverable or a commit
- `/seo audit` spawns up to 15 subagents in parallel. Run it only when asked for by name. Prefer the narrow commands against a single URL, such as `/seo page` or `/seo schema`
- `aggregateRating` stays out per CH-008, whatever the local SEO skill recommends
- Practitioner credentials and the OHIP framing come from the tables above, never from what a plugin infers off the rendered page

### Canonical strings, use verbatim

- Brand descriptor: "A curated health and wellness destination."
- Tagline: "Health, curated for you."
- Dr. Leong: "Canada's only Lifestyle Medicine clinic with a triple-certified Gastroenterologist, Internal Medicine and Lifestyle Medicine Doctor."

### Practitioners

| Name               | Credentials                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Dr. Frank Nhan     | Doctor of Chiropractic, Acupuncture Provider, Strength and Conditioning Specialist, Yoga Teacher   |
| Safa Karoumi       | Registered Psychotherapist (Qualifying), MSc Communications                                        |
| Dr. David Gabriele | Doctor of Naturopathic Medicine, Registered Acupuncturist                                          |
| Dr. Eric Leong     | MD, FRCPC, Gastroenterologist, Hepatologist, Therapeutic Endoscopist, Lifestyle Medicine Physician |
| Andrew Huynh       | Registered Massage Therapist                                                                       |
| Ariel Zohar        | Registered Physiotherapist                                                                         |
| Claire             | Pilates instructor, 1-on-1 private sessions. Not currently on the team page                        |

### Out of scope, do not build

- A pricing page. Pricing lives in Jane behind the Book Now button
- Direct billing content. Curate does not offer it
- Standalone condition pages. Conditions will be covered in blog posts instead
- Practitioner bio copy. It already exists in Sanity, see CH-104

---

## Phase 1: P0

### CH-020 Strip zero-width Unicode from Sanity

Roughly 9,550 invisible characters render on every page. The contact page carries 17,190. Source is the address field in Sanity, contaminated by a paste from a rich-text source.

This is live in Google's index right now. The snippet for `/contact` displays the street address followed by hundreds of garbage characters.

**Surveyed 2026-08-17.** The dataset holds 680 documents, 113 of them content documents and 567 `sanity.*` system documents, mostly image assets. Contamination is confined to three documents:

| Document                                      | Type                 |
| --------------------------------------------- | -------------------- |
| `731dc48e-5025-4709-8a00-aaa49f84812c`        | `siteSettings`       |
| `ba90a190-6e64-4230-b483-7134689d667d`        | `contactPage`        |
| `drafts.731dc48e-5025-4709-8a00-aaa49f84812c` | `siteSettings` draft |

and to two fields on each, `contactInfo.address.street` (1,906 Cf) and `contactInfo.address.zip` (4 Cf). 5,730 Cf characters in total, all of them `U+200B`, `U+200C`, `U+200D` or `U+FEFF`. No portable text block, title, description, SEO field or alt text is affected.

In the street value the run sits in the middle, not at the end: `989 Eglinton Ave W` + 1,906 Cf + `, Suite 2`. It strips to exactly the CH-021 target, so the strip alone fixes `street` and `zip`.

The rendered counts above are higher than the stored count because the address is emitted five times per page and nine times on `/contact`, at 1,910 Cf per emission. Fixing the one `siteSettings` document clears 9,550 characters from every page at once. There is no per-page work here.

Scope was narrowed from the original "walk every document" brief to a targeted patch of those three documents. Walking all 680 would have the trim step rewrite legitimate values across 556 image assets for no benefit. Two scripts:

```powershell
node scripts/audit-unicode.js            # read-only survey, exit 1 if contaminated
node scripts/fix-address-unicode.js      # dry run, prints the diff, writes nothing
node scripts/fix-address-unicode.js --apply
```

The patch script covers CH-020 and CH-021 together and separates its dry run into a mechanical section, strip and trim, and an editorial section, the value changes that need sign-off. Patches carry `ifRevisionID`, so a concurrent Studio edit fails the mutation instead of overwriting it.

The mechanical pass is scoped to `contactInfo.address.*`, not to every string field on the three documents. Trimming is the only part of the script that can change a value nobody asked to change, so it stays inside the object the survey bounds. Consequence: trailing whitespace survives elsewhere on these documents, in `siteSettings.contactInfo2.address.*`, `contactPage.howToGetHere`, `contactPage.parking` and `contactPage.branchName2`. None of it carries Cf characters and none of it is a defect on its own. Do not assume CH-020 left the dataset trimmed.

```powershell
# Acceptance
node scripts/audit-unicode.js
```

**Audit the dataset, not the rendered pages.** Counting Cf characters in fetched HTML under-reports, because `app/llms.txt/route.ts` normalises whitespace and JavaScript's `\s` matches `U+FEFF`. See CH-032. The audit script queries Sanity directly for that reason, and it also names the document and field to fix, which rendered output cannot.

**The audit covers Cf only, not Cc.** `\p{Cf}` is the Format category. It does not match `U+0000` or the other C0 controls, which are category Cc. A clean audit run means no zero-width or bidi characters, not "no invisible characters of any kind".

This is not hypothetical. `scripts/retire-second-location.js` was committed on 2026-08-23 carrying a literal `U+0000` on line 158, used as the fallback sentinel in the geocode display check. It survived a passing audit, a passing `tsc --noEmit` and a correct dry run, and only surfaced because git flagged the file as binary and refused to diff it. It never reached Sanity, because the only value that script writes is `CORRECTED_DADDR` and that string was clean. The sentinel has been removed. If the audit is ever widened, widen it to Cc as well, and watch for the same class of thing in scripts rather than only in content.

### CH-021 Fix the address fields

Currently `addressLocality` is `"York, "` with a trailing comma and space. `streetAddress` and `addressRegion` also carry trailing whitespace.

Set exactly:

```
streetAddress:   989 Eglinton Ave W, Suite 2
addressLocality: Toronto
addressRegion:   ON
postalCode:      M6C 2C6
addressCountry:  CA
```

Type these by hand. Do not paste from any source, including this file.

The `Toronto` change matters. Nothing in the current structured data asserts Toronto anywhere, which is the descriptor everyone searches.

The address lives in Sanity at `siteSettings.contactInfo.address.{street,city,state,zip,country}`. `lib/structured-data.tsx` maps those onto `PostalAddress` in `buildPostalAddress()`, where `street` becomes `streetAddress`, `city` becomes `addressLocality`, `state` becomes `addressRegion`, and `zip` becomes `postalCode`. `country` already falls back to `CA` when empty. This is a content fix, not a code fix.

### CH-001 Fix the 500 on unknown service slugs

`/services/[service]` throws HTTP 500 for any slug not present in Sanity. Confirmed on `/services/primary-care`, `/services/chiropractic`, `/services/physiotherapy`, `/services/massage-therapy`.

Repeated 5xx responses cause Googlebot to reduce crawl rate across the whole domain. A 404 does not.

Call `notFound()` when the Sanity query returns null. Add `not-found.tsx` to the segment. Audit every other dynamic route for the same pattern.

Two places need changing, not one. The 500 itself originates in `generateMetadata` at `app/services/[service]/page.tsx:59`, which destructures `const { seo } = servicePage!` and throws when the query returned null. Separately, the component body at line 29 returns `null` instead of calling `notFound()`. Fixing only the component body leaves the 500 in place.

```bash
# Acceptance: all should return 404, none 500
for u in /services/primary-care /services/chiropractic /services/physiotherapy /services/massage-therapy /services/nonsense-slug; do
  curl -sS -o /dev/null -w "%{http_code} $u\n" "https://www.curatehealth.ca$u"; done
```

### CH-002 Redirect legacy service URLs

301 in `next.config.js`:

```
/services/primary-care    -> /services/rehab
/services/physiotherapy   -> /services/rehab/physiotherapy
/services/chiropractic    -> /services/rehab/chiropractic-care
/services/massage-therapy -> /services/rehab/massage-therapy
```

### CH-022 Fix the acupuncture slug

Current slug is `acupunture`. The correct spelling 404s, so any inbound link built to the sensible spelling dies.

Change the Sanity slug to `acupuncture`. 301 from `/services/rehab/acupunture`.

### CH-023 Fix the Flowpresso title

`/services/recovery-sanctuary/flowpresso-therapy` has the title "Flowpesso Treatment & Services."

This page ranks first in Canada for "Flowpresso Toronto." It has a typo in its title tag.

There are three spellings live across the site: "Flowpesso" in the title, "flowpresso" in the URL, "Flowspresso" in llms.txt. Correct spelling is **Flowpresso**. Grep the whole codebase and dataset for all three.

New title: `FLOWpresso Therapy Toronto | Curate Health`

### CH-032 Regenerate llms.txt

`curatehealth.ca/llms.txt` returns 200 and is wrong in five ways:

1. Address carries the Unicode contamination
2. The psychotherapy entry reads "Enhance your strength, endurance, and agility with Curate Health's performance training treatments." Wrong service entirely
3. Flowpresso spelled "Flowspresso"
4. Rehab hub labelled "Primary Care," which Curate does not offer
5. Every URL uses the bare domain, which 308-redirects

This is what AI crawlers read. Regenerate from corrected Sanity data after CH-020 and CH-021 land. Do not hand-edit.

Sixth defect, found 2026-08-17. The route runs the address through a whitespace normalisation, and JavaScript's `\s` character class matches `U+FEFF`. All 409 `U+FEFF` characters in the street value are converted to literal spaces, which then collapse into a 357 character gap in the middle of the address. Combined with the empty locality this publishes:

```
989 Eglinton Ave W[1497 zero-width][357 spaces], Suite 2, York,, ON, M6C 2C6
```

Two consequences. The gap and the doubled comma disappear once CH-020 and CH-021 land, so no separate fix is needed. But the `\s` behaviour means **any Cf audit run against rendered output under-reports**, by the `U+FEFF` count: `/llms.txt` shows 1,501 Cf where the stored value holds 1,906. Audit the dataset instead, see CH-020.

### CH-033 Fix the psychotherapy meta description

`/services/mental-health/psychotherapy` carries performance training's meta description. Someone searching for a therapist currently sees a snippet promising improved endurance and agility.

Write a correct description under 155 characters. Then check every other page for the same copy-paste class of error.

---

## Phase 2: technical foundation

### CH-003 Canonical tags

Zero canonicals across all 44 pages. Add via Next metadata, absolute URLs on `https://www.curatehealth.ca`.

### CH-004 Unify the host

The site serves `www`. The sitemap, robots.txt, `og:url`, and every schema `@id` use the bare domain.

Pick `https://www.curatehealth.ca` since it's already serving. Update `metadataBase`, the sitemap generator, robots.txt, all `og:url`, all schema `@id` and `url`. Confirm the primary domain in Vercel.

The host has a single source: `BASEURL` in `app/site-settings.ts`, currently the bare domain. It is consumed by `app/robots.ts`, `app/sitemap.xml/route.ts`, `app/llms.txt/route.ts`, `app/layout.tsx`, and `lib/structured-data.tsx`. Changing that one constant covers all five. `metadataBase` is absent from `app/layout.tsx` and still has to be added.

### CH-005 Regenerate the sitemap

All 44 `<loc>` values currently 308-redirect. Regenerate with `www`. Add `/services/lifestyle-medicine`, which returns 200 but is absent.

```bash
curl -sS -L https://www.curatehealth.ca/sitemap.xml | grep -c 'https://www.curatehealth.ca'
# then spot-check that no URL redirects
```

### CH-006 Title tags

17 titles contain "Curate Health" twice because the metadata template appends the brand to titles that already end with it. 20 titles exceed 60 characters.

Fix the template so it doesn't append when the Sanity value already ends in the brand. Then rewrite the affected titles to the pattern `{Service} Toronto | Curate Health`, under 60 characters.

Also fix: `/`, `/our-programs` and `/blog` share the homepage title and meta description verbatim.

### CH-024 Add missing metadata

`/about/pillars-of-health` has no title tag and no meta description.

### CH-025 De-duplicate the address

`contactPage` holds its own `contactInfo.address` object, a second copy of the one on `siteSettings`. The two have already diverged: `city` is `"York, "` on `siteSettings` and `"York"` on `contactPage`, and `country` is null on `siteSettings` and `"Canada"` on `contactPage`. Both had to be patched separately in CH-021, which is the problem in miniature.

`contactPage` should reference `siteSettings` rather than carry its own copy, so there is one address in the dataset. `lib/structured-data.tsx` already reads `siteSettings` only, so the schema graph is unaffected; the change is to the `contactPage` schema and `app/contact/page.tsx`.

**Second location retired, 2026-08-18.** The downtown location, "Curate Health - Downtown" at 777 Bay St inside the Centre for Sport and Recreational Medicine, is closed and is not returning. `contactInfo2` was removed from `siteSettings`, its draft and `contactPage`, and `branchName2` from `contactPage`, by `scripts/retire-second-location.js`.

One trap that script had to handle, worth knowing if the address model is touched again. `contactPage` held two map values and both were wrong for the element reading them. `contactInfo.mapLink` was a Google Maps _embed_ URL, byte-identical to `mapURL`, rendered as an `<a href>` at `app/contact/page.tsx:74` and `:186`, so the main Get Directions button opened a bare embed frame. The only real directions URL in the document, the only one carrying a `daddr`, was `contactInfo2.mapLink`, and it pointed at 989 Eglinton rather than 777 Bay. The working link for the main location was inside the object being deleted. The script retyped its `daddr` to the CH-021 address and moved it to `contactInfo.mapLink` before unsetting anything, preserving the `geocode` parameter that pins the Google place id.

The truthiness gate on that section was also fixed. It tested `contactInfo2 &&`, and an object holding only a `mapLink` is truthy, so the section rendered with a blank heading and an address line reading `undefined, undefined, undefined undefined`. It now tests for address content, and the address line is assembled from the fields that are present.

**Verified applied 2026-08-23.** All three documents now read `contactInfo2` absent and `branchName2` absent, sharing revision `Ryfm3zd62onQjpcVGEa7Om` from the 2026-08-18T13:07:52Z transaction. `contactPage.contactInfo.mapLink` carries the rescued directions URL with `daddr=989+Eglinton+Ave+W,+Suite+2,+Toronto,+ON+M6C+2C6`. Live `/contact` returns 0 Cf characters, no "York", and no `undefined, undefined` address line.

Re-running `scripts/retire-second-location.js` now exits 2 with "Could not find a daddr URL in contactPage.contactInfo2.mapLink". That is the rescue guard doing its job, not a regression. With nothing left to rescue the script refuses to delete rather than deleting blind. Read a second exit 2 from it as "already applied", and confirm against the dataset before concluding anything else.

**Two Google place ids for one clinic, found 2026-08-23.** Resolve this before further map, `geo` or `hasMap` work. It may be a duplicate Google Maps entity rather than stale data.

| Place id                                | Reached from                                                                                                                 | Resolves to                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `0x882b33a0bc00ca61:0x432786dbaf32d810` | `siteSettings.contactInfo.mapLink`, `contactPage.mapURL`, and the `geocode` on the rescued `contactPage.contactInfo.mapLink` | `maps/place/Curate+Health`, the named business entity       |
| `0x882b339f39d8e7ff:0xce828e8fdd1a6e50` | the two orphaned documents below                                                                                             | `989 Eglinton Ave W, York, ON M6C 2C6`, a plain address pin |

Everything live points at the first id, the business entity, which is the correct one. The `geo` coordinates specified in CH-008 match it. The second id is a bare address pin, it is the last place "York" survives anywhere in the dataset, and it sits about 30 m away, longitude `-79.4302559` against `-79.4306470`.

Two ids is not automatically two listings, a place pin and a business entity can coexist for one address. But if both exist as listings in Google Business Profile then the address pin is a duplicate competing with the real one and needs merging or removing there. That is a Google Business Profile task, not a code or dataset one, and the agency owns that surface. Confirm which it is before writing this off as stale data.

**Two orphaned 2024 documents, deliberately left in place.** `3c69142c-598b-4b63-bf6b-7580b6c4f662` of type `contactInfo` and `bac4fbca-b3c3-4731-8361-fd88da774dcb` of type `contactDetails`, both last touched 2024-03-20. Neither type is registered in `sanity/schema.ts` and neither is referenced by any query, so nothing renders them. Between them they hold the stale phone number `(728)-682-2618`, an address reading `West Corner Suite, 989 Eglinton Ave W,` and `York, ON, M6C 2C6`, and the duplicate place id above.

They are invisible to the site, so they are not live defects. Deleting documents is destructive and needs Frank's sign-off plus a fresh export first. They do surface in a dataset export and through the Sanity API, so retire them eventually rather than never. Do not let a future "York" grep treat them as an outstanding CH-021 failure.

Still open: `contactPage.contactInfo` remains a duplicate of `siteSettings.contactInfo`, which is the ticket above. The `contactInfo2` and `branchName2` fields remain defined in `sanity/schemas/siteSettings.ts` and `sanity/schemas/contactPage.ts` and in `sanity/lib/queries.ts`. Removing them is safe now that the gate is correct, but it regenerates `sanity.types.ts`, so it belongs with the de-duplication work rather than on its own.

### CH-026 Tagged fetches can never be purged

As found: `sanityFetch` in `sanity/lib/client.ts` forced `revalidate: false` whenever `tags` were supplied, which cached the result indefinitely and made `revalidateTag()` the only way to purge it. Nothing in the codebase called `revalidateTag`, and no revalidation webhook existed, so the comment in that file described a purge mechanism that was never built.

Three call sites were affected, all of them search: `app/api/search/route.ts` with tags `search` and `search-index`, and `app/search/page.tsx` with `search-index`. The search index only refreshed on redeploy. Everything else used the 60 second default and self-heals.

This blocked CH-104 and CH-105. Practitioner pages and blog posts published through Sanity would not have appeared in site search until someone triggered a deploy, which makes the content look missing to anyone who searches for it.

**Resolved 2026-08-24 on `fix/search-cache-revalidation`.** Both halves were built. They are not redundant with each other.

_The webhook._ `app/api/revalidate/route.ts` accepts signed POSTs from Sanity and calls `revalidateTag` for `search` and `search-index`. This is what keeps search fresh in practice, within seconds of a publish.

_The time window._ `SEARCH_REVALIDATE_SECONDS` in `sanity/lib/client.ts`, currently 3600, applied at all three search call sites. **This exists as the backstop for the webhook failing silently. Do not remove it as redundant.** A webhook that stops firing emits no signal. Without the window, search would sit frozen on whatever it last saw, indefinitely, with nothing surfacing the fault.

One hour was chosen against the question "how long am I willing to serve stale content if the webhook silently stops firing", not "how fresh does content need to be". Restoring the old 60 and 300 second values would re-query on a fixed cadence regardless of the webhook, which makes the webhook decorative and masks its failure completely, so nobody would ever learn it had died. Much longer and newly published practitioner pages and blog posts stay missing from search long enough to look like the content does not exist.

**The endpoint fails closed.** With no `SANITY_REVALIDATE_SECRET` it returns 500 and purges nothing. A missing signature, a malformed header, the wrong secret, or a body altered after signing each return 401 and purge nothing.

**It does not reject stale deliveries, and must not be described as if it does.** `@sanity/webhook` verifies by re-encoding with the timestamp carried in the header, so a correctly signed delivery stays valid indefinitely. That is a replay window. It is acceptable here only because replaying a delivery just purges a cache that did not need purging.

**Purging is deliberately not routed by document type.** Every accepted delivery purges both tags. On a 44 page site a redundant purge costs one query against Sanity, while routing logic that silently misses a type costs content that never appears in search.

**Middleware trap.** The matcher in `middleware.ts` catches `/api/*`, and `publicPaths` did not include the new route. Left alone, switching coming soon mode on would have redirected the webhook POST to `/coming-soon` so the purge never ran, which is precisely the silent failure the time window exists to cover. `/api/revalidate` is now on the allowlist. The endpoint authenticates by signature and does not need that gate.

```powershell
# Acceptance, with the target running and SANITY_REVALIDATE_SECRET matching it
node scripts/test-revalidate-endpoint.js
node scripts/test-revalidate-endpoint.js https://www.curatehealth.ca
```

Seven checks. Signatures are produced with `@sanity/webhook`'s own `encodeSignatureHeader`, the same code Sanity signs with, so a pass means the endpoint agrees with the real sender rather than only with the test. A hand-rolled verifier tested against a hand-rolled signer would be self-consistent and could still be wrong about the real sender, which is why the official package is a dependency here.

**Log lines carry a `[revalidate]` prefix** so they can be grepped in the Vercel log stream.

```
[revalidate] ok, purged=search,search-index doc=contactPage/ba90a190-... ms=2
[revalidate] rejected, reason=missing-signature
[revalidate] rejected, reason=WebhookSignatureValueError
[revalidate] misconfigured, SANITY_REVALIDATE_SECRET is not set
```

**Configured by hand, not by Claude Code.** The webhook lives at sanity.io/manage under project `rwc5kyvy`, API, Webhooks.

| Setting     | Value                                                        |
| ----------- | ------------------------------------------------------------ |
| URL         | `https://www.curatehealth.ca/api/revalidate`                 |
| Dataset     | `production`                                                 |
| Trigger on  | Create, Update, Delete                                       |
| Filter      | `!(_id in path("drafts.**")) && !(_id in path("sanity.**"))` |
| Projection  | `{_id, _type}`                                               |
| HTTP method | POST                                                         |
| Secret      | the `SANITY_REVALIDATE_SECRET` value                         |

The filter excludes drafts, which autosave constantly in the Studio and would otherwise fire a delivery per keystroke burst, and `sanity.*` system documents, mostly image assets. It is deliberately coarse rather than a list of the 24 indexed types in `INDEX_DOCS_QUERY`, for the same reason the endpoint does not route by type.

`SANITY_REVALIDATE_SECRET` goes in three places, same value in each: the Vercel project environment variables, `.env.local` for local runs, and the Secret field on the webhook itself. Preview deployments are behind Vercel Deployment Protection and return a 302 to SSO, so the webhook can only be pointed at production.

### CH-013 Resolve the exercise therapy duplication

`/services/exercise-therapy` and `/services/lifestyle-medicine/exercise-therapy` are both titled "Exercise Therapy." Differentiate or consolidate with a 301 to the survivor.

### CH-027 Fix the rehab naming

`/services/rehab` uses three names for itself. URL says `rehab`, title says "Rehab", H1 says "Primary Care".

Use "Rehabilitation" throughout. Drop "Primary Care" entirely, on this page, in the nav, and in llms.txt. Curate does not offer OHIP primary care and the label attracts the wrong traffic.

### CH-011 H1 counts

`/our-programs` has two H1s. `/about/mission-and-values` has none. Exactly one per page.

### CH-007 Image sizes

Every `next/image` requests `w=3840` with no `srcset`. A phone downloads a 4K-sized file. Largest measured transfer was 890 KB.

Add a `sizes` prop to every instance so Next generates a proper srcset.

### CH-012 Security headers

No CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, or Permissions-Policy on any response. Add via `headers()` in `next.config.js`.

This is a PHIPA and general security item, not an SEO one. Do it, but don't let it be described as SEO work.

---

## Phase 3: schema and structure

### CH-008 Expand the schema graph

The existing `MedicalClinic`, `LocalBusiness` and `Organization` graph is valid and better than most clinic sites. Problem is it's identical boilerplate on all 44 pages.

Add:

- `openingHoursSpecification` on the clinic entity
- `geo` with `latitude: 43.6997`, `longitude: -79.4306`
- `sameAs` array covering every owned profile: LinkedIn, both Instagram accounts, TikTok, Google Business Profile
- `Person` and `Physician` schema per practitioner, see CH-104
- `BlogPosting` with `author` and `reviewedBy` on blog posts, see CH-105
- `VideoObject` with `transcript` on video embeds, see CH-106
- `Event` on class listings, see CH-107
- `Course` on the Curate Lifestyle Program
- `Restaurant` or `CafeOrCoffeeShop` on `/cafe`, separate from the clinic entity

**Do not add `FAQPage`.** Google shut the FAQ rich result down on 2026-05-07, and the markup does not drive AI citation either. It was dropped from the list above when CH-101 was closed. Adding it now produces nothing.

**Do not add `aggregateRating`.** Google withdrew rich result support for self-serving reviews on LocalBusiness and Organization entities, so it produces nothing. Separately, Ontario's colleges restrict testimonial use in professional advertising and this may fall under that. Frank is checking with CCO. Leave it out.

### CH-009 Breadcrumbs

None anywhere, and no `BreadcrumbList` schema. Add a component on every page more than one level deep, with matching markup.

### CH-010 Orphaned pages

Seven pages are unreachable by internal link from the homepage within three hops:

```
/products/tens-machines
/products/compression-stockings
/products/custom-foot-orthotics
/products/profession-grade-supplements
/products/custom-knee-braces
/services/lifestyle-medicine/nutritional-counseling
/services/lifestyle-medicine/exercise-therapy
```

Build a `/products` index linked from the main nav. Link the two lifestyle-medicine children from their parent and from `/services/curate-lifestyle`.

Add `Product` schema to all five product pages. These also feed Google Business Profile's products field, which the agency is handling.

### CH-028 Alt text

23 images with missing or empty alt. Two are missing the attribute entirely, both using asset `a6cdfe9c...-4160x6240.jpg` on `/services` and `/services/curate-lifestyle`.

Concentration: `/our-programs` 7, the two blog posts 6, `/services/curate-lifestyle` 3, `/cafe` 2, `/` 2.

Draft descriptive alt text from page context. Frank approves before it goes in.

---

## Phase 4: content structure

### CH-101 FAQ blocks, closed 2026-08-29

**Closed, not rescoped.** The original brief was six to eight questions at the bottom of every service page, marked up with `FAQPage`, on the rationale that this was the largest single gap between the site and being cited in AI answers. That rationale does not survive the evidence, and no smaller version of the ticket survives either.

`FAQPage` markup buys nothing. Google shut the FAQ rich result down on 2026-05-07 and has since removed the supporting Search Console report, the Rich Results Test coverage and the API behind it. The feature documentation is gone. The type is still valid schema.org and existing markup causes no errors, but this site carries none, so there is nothing to preserve and nothing to gain by adding it.

Markup does not drive AI citation either. Ahrefs tracked 1,885 pages against roughly 4,000 controls between August 2025 and March 2026 and found no significant uplift on AI Mode or ChatGPT, and a small significant decline on AI Overviews. Separately, a February 2026 test had both ChatGPT and Perplexity extract planted data out of deliberately invalid JSON-LD, which indicates these systems read the visible text and do not parse the markup.

That leaves only the claim that question-and-answer formatting beats ordinary prose answering the same questions. Nothing credible supports it. The guidance circulating on question counts and placement comes from SEO blogs synthesising each other rather than from published methodology, and an earlier draft of this rescope repeated those numbers before they were checked. Do not reintroduce them.

**Ignore the "3.2x" figure.** A claim that FAQ schema produces 3.2 times the AI Overview citation rate, attributed to Princeton and Moz at WWW 2026, circulates widely across SEO blogs and will surface in any fresh search on this topic. It has no paper title, no named authors, no DOI and no primary link. Checked 2026-08-29 and could not be traced past a single news post. Do not let it back into this file or into a recommendation.

**What replaces this ticket: nothing standalone.** Where the front desk repeatedly fields the same question about a service, answer it in that page's body copy as part of content work already scheduled for the page. That needs no ticket and no rollout across 44 pages. It still needs practitioner sign-off, since every answer on a clinic site is a health claim.

Do not rebuild this as accordions. CH-104 records that the practitioner bios are already trapped in accordions with `data-state="closed"`, leaving 191 words of visible text on the team page. Collapsed FAQ content would repeat a defect this project is already paying to fix.

The gap this ticket claimed to fill is real, and CH-105 is what fills it: six credentialed practitioners and zero bylines. Author and credential signals are what the helpful content systems and the AI engines filter medical content on.

### CH-104 Individual practitioner pages

The bios are written and stored in Sanity. They are not the problem.

The problem is they render inside accordions with `data-state="closed"`, and there are no individual URLs. All six practitioners live on one page at 191 words of visible text. A search for any practitioner by name lands nowhere useful.

Create a page per practitioner at `/about/our-team/{slug}` using the bio content already in Sanity. Each page carries credentials, registration number, training, what they treat, and a direct Jane booking link for that practitioner.

Mark up with `Person` and `Physician` schema including `sameAs`, `alumniOf`, `hasCredential`, `medicalSpecialty`.

Keep the team page as the hub. Make each card link to its page rather than opening an accordion.

Dr. Leong's page is the priority. His triple certification is the strongest differentiator Curate has and it currently exists as body copy rather than a structured entity.

Add Claire, who is missing from the team page entirely.

### CH-105 Blog architecture

Conditions will be covered in blog posts rather than standalone pages, so the blog needs to actually work. Currently two posts, last updated 16 December 2024, no taxonomy, no author attribution.

Build:

- Categories and tags for topic clustering
- Author byline on every post, linked to the practitioner page from CH-104
- A visible "Reviewed by {name}, {credentials}" line with a date
- `BlogPosting` schema with `author`, `reviewedBy`, `datePublished`, `dateModified`
- Pagination
- RSS feed at `/rss.xml`, currently 404

The byline work is the highest-value E-E-A-T item available. Google's helpful content systems filter anonymous medical content, and the AI answer engines apply the same test. Six credentialed practitioners and zero bylines is the gap.

### CH-106 Video

The site hosts Mux video with zero `VideoObject` markup.

YouTube accounts for roughly 18.8% of Google AI Overview citations, second only to Reddit. Video is one of the two dominant citation sources and Curate is invisible in both.

Add `VideoObject` schema with `transcript` on every embed. The transcript is the part that gets extracted. Build the component so transcripts can be added from Sanity.

The 13 scripted Tai Chi clips in the content plan are the first candidates.

### CH-107 Class schedule

Tai Chi with Dr. Gabriele on Sunday mornings, yoga with Rooj, mat Pilates with Claire. Recurring scheduled events at a fixed location, which is exactly what `Event` schema is for.

Build a class schedule page with per-class URLs, `Event` markup, and direct booking links. This gives the Recovery Sanctuary a discovery surface it currently lacks entirely.

### CH-108 Cafe menu as HTML

The menu is a PDF. PDFs index badly and can't be excerpted cleanly by AI systems.

Build it as an indexable page with item names, descriptions and ingredients as real text. The functional nutrition positioning, no industrial seed oils, maple and honey only, Ontario-local and seasonal sourcing, is genuinely differentiated and completely invisible to search right now.

Add `hasMenu` and `servesCuisine` to the cafe entity.

### CH-109 Eglinton Crosstown landing page

The LRT is open. Curate sits between Cedarvale and Forest Hill stations. Queries like "clinic near Forest Hill station" have almost no competition.

One page covering transit access, walking directions from both stations, and which services are available. The agency handles outreach to transit-adjacent businesses.

---

## Phase 5: cleanup

| ID     | Task                                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CH-110 | `lang="en-CA"` instead of `lang="en"`                                                                                                                              |
| CH-111 | `dateModified` in schema plus a visible "last updated" on content pages                                                                                            |
| CH-112 | Helpful 404 page with search and links to main hubs. Currently the Next.js default                                                                                 |
| CH-113 | GA4 conversion events on every Book Now click. Nothing is tracked today                                                                                            |
| CH-114 | IndexNow submission on publish. Bing's index is what ChatGPT search runs on                                                                                        |
| CH-115 | Remove the legacy `meta keywords` tag. Google has ignored it for years                                                                                             |
| CH-029 | Downsample oversized Sanity assets. 95 exceed 2,600px, worst is a 6500x3846 PNG appearing on 29 pages. CH-007 solves most of the delivery cost, so this is cleanup |
| CH-030 | Add Claire to the team page and to CH-104                                                                                                                          |

---

## Full verification script

Run after each phase.

```bash
#!/usr/bin/env bash
BASE="https://www.curatehealth.ca"

echo "== Unicode contamination =="
# Audits Sanity, not rendered output. Rendered output under-reports, see CH-032.
node scripts/audit-unicode.js

echo "== 500s on unknown slugs =="
for u in /services/primary-care /services/chiropractic /services/physiotherapy /services/nonsense; do
  curl -sS -o /dev/null -w "  %{http_code} $u\n" "$BASE$u"; done

echo "== Canonicals =="
curl -sS -L "$BASE/" | grep -c 'rel="canonical"'

echo "== Sitemap host =="
curl -sS -L "$BASE/sitemap.xml" | grep -o '<loc>[^<]*' | grep -c 'www.curatehealth.ca'

echo "== Slugs =="
curl -sS -o /dev/null -w "  %{http_code} acupuncture (want 200)\n" -L "$BASE/services/rehab/acupuncture"

echo "== Flowpresso spelling =="
curl -sS -L "$BASE/services/recovery-sanctuary/flowpresso-therapy" | grep -o '<title>[^<]*'

echo "== llms.txt =="
node -e '
const CF = /\p{Cf}/gu;
fetch("https://www.curatehealth.ca/llms.txt").then(r => r.text()).then(t => {
  console.log("  Cf chars:    ", (t.match(CF) || []).length, "(under-reports, see CH-032)");
  console.log("  Flowspresso: ", t.includes("Flowspresso"));
  console.log("  Primary Care:", t.includes("Primary Care"));
  console.log("  bare domain: ", t.includes("https://curatehealth.ca"));
});'
```

---

## Definition of done

- Verification script passes clean
- Google Rich Results Test validates every schema type without error
- No page returns 5xx for any slug pattern
- Every sitemap URL returns 200 with no redirect
- One H1 per page, unique title and meta description per page
- Every image carries meaningful alt text
- Every blog post has a visible byline and review attribution
- Frank has approved every piece of published copy
