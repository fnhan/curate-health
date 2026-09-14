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

**Branch protection does not enforce the tier rule.** Read 2026-09-12 from the API, and it has changed since the last time this file described it, so read it again rather than trusting this paragraph: `enforce_admins` is on, force pushes and deletions are blocked, and a pull request is now required, which is new. A direct `git push` to `main` is rejected with GH006. What has not changed is the part that matters: `required_approving_review_count` is **0** and `required_status_checks` is **null**, so a pull request can be opened and merged by the same person in one move, with a red build. GitHub will not catch a tier 2 merge that skipped Frank, and it will not catch a failing check either. The rule above is still the only thing standing in the way.

Worth remembering why the caution is here. The worst incident on this project was a Sanity slug rename applied straight to the shared production dataset, which took a live indexed URL to 404 for two weeks while the matching redirect sat unmerged. It happened on the content side, which has no review step at all. Frank caught it, Claude Code did not.

**Back up Sanity before any mutation.** Export with `sanity dataset export production <file>.tar.gz` and keep the file outside the repository. Exports are large, 1.43 GB for the current one, so they never belong in git.

**Backups live outside the repo, so stop looking for one in the working tree.** They sit in Frank's Documents folder with a cloud copy. Nothing matching `backup-*` will ever appear beside the source, and its absence is not evidence that no backup was taken. Ask rather than warn.

The current restore point is `sanity-backup-2026-09-12-before-dead-content-deletion.tar.gz`, 1.55 GB, 113 documents and 570 assets, taken immediately before CH-116. It is the only export that contains the 29 documents that ticket deleted. `sanity-backup-2026-08-17.tar.gz` is the restore point for CH-020, CH-021 and the CH-025 second-location retirement, and nothing later.

Take a fresh export before the next destructive ticket and name it in the ticket, rather than assuming an existing file still covers you. `scripts/delete-dead-content.js` enforces this: it refuses to write unless the file named by `--backup` is newer than the most recent change in the dataset.

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
- Banned words: dive in, unlock, elevate, harness the power of, complimentary, transformative, seamless
- **"journey" is fine, in any form, including "holistic wellness journey". Cleared by Frank on 2026-09-10 and widened to the full phrase on 2026-09-12.** It is not a banned word, it is not a banned phrase, and it should not be reported as one. Older copies of this file banned the bare word, then banned the phrase while allowing the word; both are superseded. Do not reintroduce either restriction, and do not add "journey" back to the banned array in any script
- Never use "complimentary" for anything Curate offers. Use "included" or "bonus"
- OHIP framing is exactly: "partially covered by OHIP and most benefit programs"
- The outdoor space is always "Recovery Sanctuary." Never "outdoor terrace" or any variant
- Neighbourhood descriptor is "Midtown Toronto"
- **The house spelling is "cafe", never "café".** No accent, anywhere: the site, the Studio, marketing, design, anything Curate produces. Frank ruled on 2026-09-12. `node scripts/audit-cafe-accent.js` sweeps the dataset and exits 1 if an accented spelling is live
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

New title: `Flowpresso® Therapy Toronto | Curate Health`

**Corrected 2026-09-10.** This ticket originally specified `FLOWpresso Therapy Toronto`, with the all-caps FLOW copied from the manufacturer's own styling, and `scripts/fix-flowpresso-spelling.js` applied it. Frank's ruling is "It's Flowpresso®, never FLOWpresso." Four spellings have now been live at various points, so treat this line as the only correct one and do not restore the all-caps form from an older reading of this ticket.

`scripts/fix-flowpresso-capitalisation.js` fixes the ten occurrences in Sanity. The registered symbol goes everywhere, titles included. It was first left out of `seo.pageTitle` on the reasoning that a title is the string Google truncates hardest; Frank confirmed on 2026-09-10 that he wants it there, and the title has room.

That script also reports four things on the same page that need a decision rather than a replace, and leaves them alone: a grammatical slip in `benefits.title`, "transformative" in `cta.ctaText`, "clinics" in a benefit subtitle, and an "FDA Approved" claim. The last is a compliance question, not a copy one. Flowpresso is a New Zealand device and FDA clearance is a specific regulatory status rather than a synonym for approved, so confirm it before it stays.

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

**Done 2026-09-11.** Every page states its own address through `buildPageMetadata`, whose `path` option is now required, so TypeScript refuses a page added without one. The same value becomes `og:url`, which was missing on every page but the homepage. The homepage sets `/` in `app/page.tsx`. Never set a canonical in `app/layout.tsx`: it would be inherited by any page that forgot its own, declaring that page a copy of the homepage. Dynamic routes pass the address `resolve()` settled on, not the typed URL.

### CH-004 Unify the host

The site serves `www`. The sitemap, robots.txt, `og:url`, and every schema `@id` use the bare domain.

Pick `https://www.curatehealth.ca` since it's already serving. Update `metadataBase`, the sitemap generator, robots.txt, all `og:url`, all schema `@id` and `url`. Confirm the primary domain in Vercel.

The host has a single source: `BASEURL` in `app/site-settings.ts`, currently the bare domain. It is consumed by `app/robots.ts`, `app/sitemap.xml/route.ts`, `app/llms.txt/route.ts`, `app/layout.tsx`, and `lib/structured-data.tsx`. Changing that one constant covers all five. `metadataBase` is absent from `app/layout.tsx` and still has to be added.

**Done 2026-09-11.** `BASEURL` is `https://www.curatehealth.ca` and `metadataBase` is set from it. That one change also closed CH-005 (sitemap on www) and the last CH-032 defect (llms.txt links on the bare domain). Verified on a local render: 41 of 41 sitemap pages carry a canonical and `og:url` equal to their own www address, robots.txt and all 24 llms.txt links use www, and the schema graph's `@id` values do too. Still to confirm in the Vercel dashboard that www is the primary domain.

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

**The two orphaned 2024 documents are gone, 2026-09-13.** `3c69142c-598b-4b63-bf6b-7580b6c4f662` of type `contactInfo` and `bac4fbca-b3c3-4731-8361-fd88da774dcb` of type `contactDetails`, both last touched 2024-03-20, were deleted under CH-116. Between them they held the stale phone number `(728)-682-2618`, an address reading `West Corner Suite, 989 Eglinton Ave W,` and `York, ON, M6C 2C6`, and the duplicate place id above.

The duplicate place id survives in the backup and in Google, not in the dataset. It is still a Google Business Profile question, and the table above is still the record of it.

**The two copies were not interchangeable, found 2026-09-12.** Every address
field matched byte for byte, as did email and phone. `mapLink` did not:

| Document       | Value                       | What it is                    |
| -------------- | --------------------------- | ----------------------------- |
| `siteSettings` | `maps.app.goo.gl/SGhuvv...` | the Curate Health listing     |
| `contactPage`  | `...?daddr=989+Eglinton`    | directions, starts navigation |

Two different links sharing one field name, not a duplicate. The directions one
is the URL rescued out of the second location above, and it is the only working
Get Directions URL on the site, so deleting `contactPage.contactInfo` outright
would have taken it with it and left the button opening a bare listing. None of
that is visible in the schema, which is why `scripts/audit-address-duplication.js`
asks the dataset rather than reading field definitions.

Resolved by giving `siteSettings.contactInfo` two named fields. `mapLink` is the
place link, read by the footer, by `hasMap` in the schema graph and by llms.txt.
`directionsLink` carries the daddr and is read by the Get Directions button.

**`siteSettings.contactInfo` was marked `deprecated` and `readOnly`,** with the
reason "Moved to Contact Page". That was backwards. It is the copy
`lib/structured-data.tsx`, the footer and llms.txt all read, so an editor
correcting the address on the contact page changed none of them, and could not
correct the one that mattered because the Studio had it locked. Both flags are
gone.

**Apply in two phases, one deploy apart.** `scripts/dedupe-address.js` refuses
to run both at once, because neither single ordering is safe: the whole mutation
before the code merges takes the address off the live contact page until the
deploy lands, and merging the code first leaves the Get Directions button
pointing at an empty `directionsLink`.

```bash
node scripts/dedupe-address.js                    # dry run, writes nothing
node scripts/dedupe-address.js --apply --phase=1  # additive, nothing reads it yet
#   merge the code, let it deploy
node scripts/dedupe-address.js --apply --phase=2  # removes what nothing reads now
node scripts/audit-address-duplication.js         # exits 1 until both have landed
```

**Both phases applied 2026-09-12.** Phase 1 in transaction
`ldqkD6gmBMFeJ0vzgrM4W3`, then #225 merged and deployed, then phase 2 in
`IIedXCuABj7j5F8r3FOnO0`. Verified on production: the contact page renders the
address, email and phone from `siteSettings`, the hero address opens the Google
listing, Get Directions carries the daddr, one map, no "undefined", no "York".
The footer address and `addressLocality: Toronto` in the schema graph are
unchanged. `node scripts/audit-address-duplication.js` exits 0.

One trap in that acceptance check, fixed after it fired. It compared the two
copies field by field, so once phase 2 deleted one of them every field read as
a disagreement and the finished state reported seven failures. The comparison
now only runs while there are still two copies to compare.

Phase 1 also patches the `siteSettings` draft, which autosaves in the Studio and
would otherwise put the old shape back on the next publish.

**Also removed, schema and query only.** `contactInfo2`, `branchName2`,
`mapURL2` and `businessHours2` were still defined on the schemas and selected by
`CONTACT_PAGE_QUERY` long after the data went. The second-location section of
`app/contact/page.tsx` went with them: it sat behind a gate that could never
open. `sanity.types.ts` and `schema.json` were regenerated, which is the reason
this could not be split into a smaller change.

**Regenerate with plain `sanity schema extract`.** Adding
`--enforce-required-fields`, which the committed file was not generated with,
flips roughly 5,000 optional fields to required across `sanity.types.ts` and
quietly removes the null-checking pressure from the whole codebase. `tsc` stays
green either way, so nothing catches it.

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

**Done 2026-09-12.** 32 of the 53 `next/image` tags carried no `sizes`. 21
already had one.

The mechanism is worth stating correctly, because the original brief for this
ticket said "no `srcset`" and that is not what was happening. Without a `sizes` prop Next emits
a DPR-based srcset, `1x` and `2x`, sized off the declared `width`. Every phone
has a device pixel ratio of 2 or 3, so every phone took the `2x` candidate of a
desktop-width image. With `sizes` present Next switches to a width-based srcset
with `w` descriptors and the browser picks against the space it actually paints.
There was always a srcset. It was the wrong kind.

Three patterns, chosen by the layout rather than applied uniformly. Full-bleed
heroes and backgrounds take `100vw`. Card grids take a share of the viewport
matching the column count at each breakpoint. Anything with a fixed rendered
size states that size in pixels, read off its own size classes.

**A `sizes` that is too small is worse than none.** The browser picks a
candidate narrower than the width it paints and the photo renders blurry, while
a source grep still reports the image as fixed. That is why each value was read
off the element's Tailwind classes and its parent container rather than
defaulted to `100vw`, and it is the thing to check first if an image looks soft.

One case records a decision rather than a measurement. The image in
`components/layout/our-programs-page/explore-your-options.tsx` sits in a
`hidden lg:block` container, so the honest value is
`(min-width: 1024px) 50vw, 0px`. It is plain `50vw` instead: a `0px` branch
tells the browser the image needs no pixels at all, and anything fetching it
before the container becomes visible takes the smallest candidate in the set and
keeps it.

```bash
# Acceptance. Exits 1 if any next/image renders without a sizes hint.
node scripts/audit-image-sizes.js http://localhost:3000
node scripts/audit-image-sizes.js https://www.curatehealth.ca
node scripts/audit-image-sizes.js http://localhost:3000 --bytes   # weigh them
```

Measured with that script across 11 pages covering every image template:

|                    | next/image tags | with a sizes hint |
| ------------------ | --------------- | ----------------- |
| Before, production | 85              | 21                |
| After              | 85              | 85                |

`--bytes` on 33 of those images: 16.34 MB at the widest candidate against 1.88
MB at phone width.

**The script refuses a preview URL behind Vercel Deployment Protection** rather
than reporting zero images. The SSO page answers 200, so a counting check reads
as "nothing on this page" instead of "you were never shown this page". Verify on
a local dev server, per the preview note in the working rules.

Three images remain over 100 KB at phone width. Those are oversized source
assets in Sanity, which is CH-029, and no `sizes` value reaches them.

### CH-012 Security headers

**Done 2026-09-12.** Responses carried none of these. The only one present was
the `Strict-Transport-Security` Vercel adds on its own, which is untouched.

PHIPA and general security, not SEO. Do not let it be reported as SEO work.

Set in `lib/security-headers.mjs`, consumed by `headers()` in
`next.config.mjs`. Kept in its own file because `next.config.mjs` is already
200 lines of redirects. `poweredByHeader: false` went in at the same time, so
responses stop announcing the framework.

| Header                    | Value                                                           |
| ------------------------- | --------------------------------------------------------------- |
| `X-Content-Type-Options`  | `nosniff`                                                       |
| `X-Frame-Options`         | `SAMEORIGIN`                                                    |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`                               |
| `Permissions-Policy`      | camera, microphone, geolocation, payment and nine more, all off |
| `Content-Security-Policy` | two policies, see below                                         |

`strict-origin-when-cross-origin` is the referrer choice that matters on a
clinic site: other sites get the origin and never the path, so nobody learns
which condition a visitor was reading about.

**Two policies, and exactly one per response.** Next applies every `headers()`
entry whose source matches, and a second `Content-Security-Policy` is sent
alongside the first rather than replacing it, at which point the browser
enforces the intersection. A broad site rule plus a Studio rule would therefore
hand the Studio both and break it, while the config looked right. The Studio
matches first and the site rule excludes it by negative lookahead.

**Write the lookahead against the segment, not the string.** The first version
used `(?!studio)`, which is a prefix test, so `/studios-that-do-not-exist` and
`/studio-ish` matched neither rule and shipped with **no security headers at
all**. It is `(?!studio$|studio/)` now, and the acceptance check exercises a
path shaped like that on purpose.

**`'unsafe-inline'` on script-src is deliberate, and it is a real limit.** A
nonce has to be minted per request, which makes every page dynamic, and this
site is static and ISR. That trades the caching model for a stricter script
policy on a marketing site with no authenticated surface. So do not describe
this CSP as an XSS backstop. What it does carry: script is blocked from any
origin not listed, plugin and object embedding are off, `<base>` is pinned, the
forms cannot be repointed at another host, and the site cannot be framed.

**`'unsafe-eval'` is scoped to `/studio`,** which needs it, and is added to the
site policy in development only, because `next dev` compiles with eval.

#### The allowlist is an inventory, not a guess

Taken from rendered production HTML and from what runs in the browser. When an
integration is added, add its origin in the same change.

| Origin                                                               | Needed by                  |
| -------------------------------------------------------------------- | -------------------------- |
| `cdn.sanity.io`                                                      | every photo                |
| `*.sanity.io`, `wss://*.api.sanity.io`                               | Studio, Presentation mode  |
| `*.mux.com`                                                          | hero video, poster frames  |
| `*.litix.io`                                                         | Mux playback analytics     |
| `www.googletagmanager.com`                                           | gtag.js                    |
| `*.google-analytics.com`, `*.analytics.google.com`, `www.google.com` | GA4 collect beacons        |
| `www.gstatic.com`                                                    | Mux player's Cast SDK      |
| `www.google.com`, `maps.google.com`                                  | the map on /contact        |
| `formspree.io`                                                       | contact and programs forms |

**PostHog is deliberately absent.** It is proxied through `/ingest` by the
rewrites, so it is same-origin and `'self'` covers it. Adding
`us.i.posthog.com` would let a later change talk to PostHog directly and
quietly lose the proxy that keeps those requests past ad blockers.
`NEXT_PUBLIC_POSTHOG_KEY` is not in `.env.local`, so this path could not be
exercised locally. It cannot be blocked by this CSP either way.

**The Mux wildcard is load-bearing.** `stream.mux.com` is only where the player
asks. Mux redirects the manifest and every segment to a regional edge host
assembled from the region and the CDN of the moment, for example
`manifest-oci-us-ashburn-1-vop1.fastly.mux.com`, and the same playback switches
between `fastly`, `cloudflare` and `edgemv`. The first version of this file
listed the two literal hosts, and **the homepage hero video was blocked
outright**: the player retried every quality level, failed each one, and the
hero sat on its poster frame. Nothing in the source showed it. It took loading
the page in a browser and reading the console.

#### GA4 no longer runs in the Studio

Found while writing the policy. `app/layout.tsx` is the root layout, so gtag.js
loaded on `/studio` too, which meant editor sessions counted as site traffic in
the same property the marketing numbers come from, and it meant widening the
Studio policy to let the marketing stack through. Both are wrong. GA4 now sits
in `components/shared/google-analytics.tsx` behind a pathname check, and the
Studio policy allows neither googletagmanager nor the collect endpoints.

```bash
# Acceptance. Exits 1 on a missing header, a doubled CSP, or eval on a public page.
node scripts/audit-security-headers.js http://localhost:3000 --dev
node scripts/audit-security-headers.js https://www.curatehealth.ca
```

**Verified on production 2026-09-12**, after merge. All eight paths pass
without `--dev`, which is the run that proves `'unsafe-eval'` is absent from
the public policy: the dev server adds it on purpose, so only a production
response can show it gone. Checked in a browser at the same time: zero CSP
violations, `gtag` defined, the Mux hero at `readyState` 4 with no error, the
map iframe rendered, the Formspree action intact.

**The audit is necessary and not sufficient.** It reads headers, so it cannot
see a directive that blocks something the page needs. That part was checked by
loading the homepage, `/contact` scrolled to the map, `/cafe`, `/blog`,
`/our-programs`, `/about/our-team`, a service page and `/studio` in a browser
and reading the console: zero violations, `gtag` defined on the site and absent
in the Studio, Mux at `readyState` 4 with no error, the map iframe rendered,
the Formspree action intact. Do the same after changing a directive. A CSP
regression is invisible from the terminal.

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

**Partly done 2026-09-12.** `openingHoursSpecification`, `geo`, `sameAs` and the
cafe entity are live. `Person`/`Physician`, `BlogPosting`, `VideoObject`,
`Event` and `Course` remain, and each is blocked on its own ticket.

_Hours._ Built from `contactPage.businessHours`, the same source as the visible
table on `/contact`, pulled into `SITE_SETTINGS_QUERY` rather than copied onto
`siteSettings`. Hours that disagree with the page they sit on are worse than no
hours, and Google shows these in the knowledge panel and in Maps where nobody
cross-checks them.

Frank confirmed on 2026-09-12: Monday to Friday 9:00 to 18:00, **Sunday 9:00 to
13:00**, Saturday closed. The stored data disagreed:
`daysOpen` held Monday to Friday only, and Sunday existed as an exception with
no hours, so `/contact` rendered nothing for a day the clinic is open. That was
a visible bug on the page, not only a schema gap. Fixed by
`scripts/add-social-and-hours.js`.

**All seven days are stated, the closed ones included.** A day left out says
nothing about itself, and nothing cannot be told apart from "we forgot to
mention it". schema.org has a way to say closed, `opens` and `closes` both at
`00:00`, so Saturday says it. Which days those are is derived from `daysOpen`,
whose meaning is exactly that, rather than stored as a second list the first can
drift away from. An open day whose hours will not parse is left out rather than
published wrong, and deliberately not reported as closed: sending somebody to a
closed door is the failure this guards against.

Be clear about what that buys. Google fills the hours in the knowledge panel and
in Maps from the Google Business Profile, not from the page, so this changes
little there. It matters to everything that reads the page directly.

_Geo._ `43.6997, -79.4306`, taken from the Google place entity the map link
resolves to rather than from geocoding the address string. This address has two
place ids, a business entity and a bare address pin about 30 m apart, per the
CH-025 notes. These are the business one.

_sameAs, and why it is split._ `sameAs` is how a search engine confirms a
profile and a business are the same entity, so an array has to describe one
entity rather than the group. `socialMedia` entries carry an `entity` field,
`clinic` or `cafe`, and `lib/structured-data.tsx` splits on it. The clinic gets
LinkedIn, the clinic Instagram, TikTok, Facebook and the Google Business
Profile. The cafe gets its own Instagram and its own Google listing. Entries with no `entity` set count as
the clinic, which is what every profile stored before the field existed is.

Every URL was fetched and confirmed to resolve before being written. The TikTok
URL is stored without the `?is_from_webapp=1&sender_device=pc` query string,
which describes the browser session it was copied from rather than the profile.

The Google Business Profile is `https://maps.google.com/?cid=4838984602728192016`,
held in `lib/structured-data.tsx` rather than in Sanity because it is an
identity claim rather than editorial copy, and because it would otherwise appear
in the footer beside the address, which already links to the same listing. The
CID is the second half of the place id above converted to decimal, and it was
opened in a browser and confirmed to load "Curate Health" at 989 Eglinton rather
than trusted from the arithmetic.

**The cafe has its own Google listing**, confirmed by Frank on 2026-09-12 and
verified in a browser: place id `0x882b3331c51bdd03:0xbc4f43925e7428c`, which is
genuinely distinct from the clinic's, so Google already holds the two apart. It
sits on the cafe entity's `sameAs`. That listing is worth more than the
Instagram split on its own, because a correct `sameAs` on a thin entity is still
thin.

**The cafe follows the clinic, reversed 2026-09-12.** An earlier pass removed
the cafe's `openingHoursSpecification` on the reasoning that giving it the
clinic's hours asserted something nobody had confirmed. Frank then confirmed it:
the cafe keeps the clinic's hours, address and phone, and when the clinic's
change the cafe's change with them.

So the cafe reads the same fields rather than holding copies. It has no hours
field, no phone field and no address of its own, on purpose. A second set would
let the two drift the moment somebody edited one, which is the failure CH-025
spent a whole ticket undoing for the address. Give the cafe its own fields at
the point it genuinely keeps its own hours, and update its Google listing in the
same change.

`components/layout/cafe-page/cafe-hours.tsx` shows them on `/cafe`, with the
address and phone, because the cafe's Google listing now points at that page and
it previously answered none of those questions. It also keeps the page honest:
the `CafeOrCoffeeShop` entity there publishes `openingHoursSpecification`, and
markup is supposed to describe what the page shows.

_The footer._ Social links now carry brand icons, via
`components/shared/social-icon.tsx`. `lucide-react` has Instagram, Facebook,
LinkedIn and YouTube but **no TikTok**, so that one path is inline. Matching is
loose, so "Instagram (Cafe)" finds the Instagram mark, and an unrecognised
platform falls back to the arrow the footer used before, so a new platform
renders as a plain link rather than as nothing.

The platform name stays beside each icon. Five marks in a column with no labels
is a guessing game, and two of these go to different businesses.

`components/shared/footer-mobile-accordion.tsx` was not checking `isActive`,
only the desktop footer was, so switching a profile off in the Studio hid it on
desktop and left it live on phones.

```bash
node scripts/add-social-and-hours.js   # dry run, re-runnable, writes only what is missing
```

**Do not add `FAQPage`.** Google shut the FAQ rich result down on 2026-05-07, and the markup does not drive AI citation either. It was dropped from the list above when CH-101 was closed. Adding it now produces nothing.

**Do not add `aggregateRating`.** Google withdrew rich result support for self-serving reviews on LocalBusiness and Organization entities, so it produces nothing. Separately, Ontario's colleges restrict testimonial use in professional advertising and this may fall under that. Frank is checking with CCO. Leave it out.

### CH-009 Breadcrumbs

None anywhere, and no `BreadcrumbList` schema. Add a component on every page more than one level deep, with matching markup.

**Done 2026-09-13.** 35 pages carry a trail, the 8 hubs carry none, and the
homepage carries none.

Every trail is decided in `lib/breadcrumbs.ts` and rendered by
`components/shared/breadcrumbs.tsx`, which emits the visible list **and** the
`BreadcrumbList` from the same `Crumb[]`. They cannot disagree, because there
is no way to add one without the other. Google checks that the markup
describes what the page shows.

**The trail is the hierarchy, not the URL, and that is the point here.**
Treatments live flat at `/services/physiotherapy`; the restructure took the
category out of the URL. The category is still real, and after the flattening
the breadcrumb is the only thing on the page that says Physiotherapy sits under
Clinical Care. So the trail reads Home > Services > Clinical Care >
Physiotherapy, four items over a two segment URL. schema.org and Google both
treat `BreadcrumbList` as a statement about position in the site rather than a
copy of the path, so this is allowed, and it puts back a signal the
restructure threw away.

**`/legal/*` omits the Legal level rather than rendering it unlinked.** There
is no `/legal` index and none is planned. Google's guidance expects a URL on
every item except the last, and an intermediate `ListItem` without one risks
the trail not being shown at all, which is the only reason to build these. So
it is Home > Terms of Use, which is both complete and true. If a `/legal`
index is ever built, add the level in `lib/breadcrumbs.ts` and nowhere else.

**Names come from the navigation, not from the page's own heading.** The five
about pages are named in `ABOUT_PAGE_NAMES`, matching the strings in
`SITE_SETTINGS_QUERY` and `ABOUT_INDEX_QUERY`. `/about/pillars-of-health`
carries the heading "Redefining Holistic Wellness with the 5 Pillars of
Health", and a crumb has to match the link the visitor followed. Rename one and
rename it in all three.

**Crumb names are trimmed.** `treatments.title` for Outdoor Pilates is stored
as `"Outdoor Pilates "`. Untrimmed, the rendered HTML collapses that space and
the JSON-LD keeps it, so the two disagree over an invisible character, which
the acceptance check caught. Trailing whitespace in the dataset is a known
leftover, see the CH-020 note.

```bash
# Acceptance. Exits 1 on a missing trail, a mismatch between what is shown and
# what is published, an intermediate item with no URL, a crumb pointing at a
# non-200, or a hub that grew a trail it should not have.
node scripts/audit-breadcrumbs.js http://localhost:3000
node scripts/audit-breadcrumbs.js https://www.curatehealth.ca
```

That check was run against production before the merge, where it reported all
35 pages missing a trail, which is what proves it is looking.

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

**Done 2026-09-12.**

**They were not orphaned for lack of a link. They were orphaned by two links
that went nowhere.** The Products entry in the main navigation and the Products
entry in the footer both pointed at `/#products`, an anchor to a carousel on the
homepage. A crawler following either arrived back where it started, so the five
product pages sat outside three hops with nothing but the sibling nav on the
product pages themselves connecting them.

That is why a grep would not have found this, and why the acceptance check is a
crawl. Searching the navigation data for "products" finds both entries and
concludes the pages are linked. Only following the link shows it is an anchor.

`/products` is built and both navigation entries now point at it. Building the
page alone would have fixed nothing.

The two lifestyle-medicine children in the list above were already resolved by
the category restructure, not by this ticket. `nutritional-counselling` lives
under `clinical-care` and is reachable; `exercise-therapy` under the retired
`lifestyle-medicine` is switched off, and `exercise-rehab` under
`movement-and-training` is the live one.

`Product` schema is on all five pages, **deliberately without an `Offer`**.
Pricing is out of scope on this project and lives in Jane, so a price in markup
would be a number the site itself cannot show, and a stale one is worse than
none. These are also fitted rather than added to a basket. The index carries
`ItemList` rather than five more Products, so the same entity is not declared on
two URLs.

`/products` is the only page on the site whose title and description are not
editable in Sanity, because there is no `productsPage` document to hold them.
Worth one eventually.

```bash
# Acceptance. Crawls three hops from the homepage and exits 1 on anything
# in the sitemap it cannot reach.
node scripts/audit-orphans.js http://localhost:3000
node scripts/audit-orphans.js https://www.curatehealth.ca
```

Measured with that script, same run on both:

|                   | sitemap URLs | unreachable |
| ----------------- | ------------ | ----------- |
| Production before | 41           | **5**       |
| This branch       | 42           | **0**       |

**The crawl ignores the React payload and strips anchors.** Following URLs out
of the Flight data would credit the site with links a crawler never sees, and
treating `/#products` as distinct from `/` is precisely the mistake that hid
this for as long as it lasted.

### CH-028 Alt text

23 images with missing or empty alt. Two are missing the attribute entirely, both using asset `a6cdfe9c...-4160x6240.jpg` on `/services` and `/services/curate-lifestyle`.

Concentration: `/our-programs` 7, the two blog posts 6, `/services/curate-lifestyle` 3, `/cafe` 2, `/` 2.

Draft descriptive alt text from page context. Frank approves before it goes in.

**Done 2026-09-13.** 20 blanks across 43 pages, now 0. Six were genuinely
decorative and stay empty.

**The alt text was written from the images, not from the page context this
ticket describes.** Every photo was fetched and looked at. Writing a
description of an image nobody opened is inventing content, and it shows: the
first draft called the essential series photo a resistance band exercise, and
Frank corrected it to a functional pulley machine.

**Two of these would have gone nowhere as data, fixed in #235 first.**
`GET_POST_BY_SLUG_QUERY` selected `"alt": image.alt` while the post schema
stores it at `sectionImage.alt`, so all six blog values would have rendered
empty whatever an editor typed. `ourPrograms.exploreYourOptions.image` had no
alt field in the schema, the query or the component. Check the path end to
end before drafting copy for a field.

**Three alt shapes are in use across the schemas**, and a projection has to
match its own:

| Shape | Schemas |
| ----------------------------------- | --- |
| alt inside the image type | 17 |
| alt beside it, in a wrapper object | 6, including `cafePage` and `treatment` |
| a renamed sibling, `heroAlt`, `ctaBgAlt` | 3 |

Not worth normalising. A migration touches every document and every query to
change nothing a visitor sees, and would risk the exact bug it prevents. The
defence is the check: stored alt was compared against rendered alt across 249
images on 43 pages, and after #235 there are no other mismatches.

**Two alt values were already live and wrong.** One misspelled kombucha. The
other was an entire assistant reply pasted into the field, `Here's the alt
text: Alt Text: "...`, preamble, label and unterminated quote, visible in the
markup of `/cafe`. Read what goes into these fields.

**"What we cook with" was merged into "Food Is Medicine",** cafe sections 6 to
5. That section was added in #230 without an image, so it rendered a bare
`<img>` with no source, and the library holds no photograph of ingredients in
the cafe's own register: those five photos are phone shots of real items in
the space, and a styled stock flat-lay sits visibly outside it. The specifics
lead the merged paragraph, because straight concatenation opened on claims any
cafe could make and buried the only lines nobody else can say. Split it back
out when there is a real photograph of the ingredients.

```bash
# Acceptance. Exits 1 on any image without alt that is not on the
# decorative list inside the script.
node scripts/audit-alt-text.js https://www.curatehealth.ca
node scripts/audit-alt-text.js --sanity   # names the document and field
```

**Patch the array, not its indexes.** `scripts/apply-alt-text.js` writes
`additionalSections` whole, because removing one entry shifts every index
after it. Its first run pushed three `additionalSections[n].sectionImage.alt`
patches and then the array write in the same transaction; Sanity applied them
in order and the array overwrote all three with the values it had read
beforehand. The script reported success and three alt values were silently
lost. Indexed patches to an array being rewritten in the same transaction are
always lost. Fold them into the array instead.

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

**Done 2026-09-14.** Seven pages at `/about/our-team/{slug}`, the team page is
a hub of links, and the accordions are gone.

Measured on the rendered page, which is the only place the defect was ever
visible: **203 visible words on one team page, now 2,164 across seven.** The
bios were always in the markup, inside accordions carrying
`data-state="closed"`.

**Two lines of this ticket are stale and were not built.** Registration
numbers: the restructure brief settled that they belong on a receipt, not a
public page, and `sanity/schemas/practitioner.ts` says so at the top. A short
bio: no such copy exists for anyone and Frank chose on 2026-09-07 to drop the
field rather than have one written.

**Services offered is derived, not stored.** A treatment lists who provides
it, and the practitioner page asks which treatments point back. There is
deliberately no field holding the same fact twice. **No treatment names a
practitioner yet**, so that section is empty on all seven until someone fills
the `practitioners` list on the treatment documents.

**Commonly treats is empty on all seven, and that is the correct state.**
Everything in it reads as a clinical claim and needs the practitioner's own
sign-off. Do not draft it from their bios.

**The booking block has three states**, and the third is the one to preserve.
A Jane URL gives a button to that person's own booking page. No Jane URL gives
the note and the CTA the record carries, which is Dr. Leong: not publicly
bookable, reached through the Curate Lifestyle Program. Neither gives no block
at all rather than a button pointing somewhere generic, which is Rooj.

**`generateStaticParams` cannot be used on this route.** It needs the slugs at
build time, and `sanityFetch` reads `draftMode()`, which throws outside a
request scope and fails the whole route build. Every other dynamic route here
renders on demand with ISR, which also means adding a practitioner in the
Studio publishes their page without a deploy.

**The fallback title drops the credential when it will not fit.** `| Curate
Health` costs 15 of the 60 characters Google shows, so the page title has 45.
"Safa Karoumi, Registered Psychotherapist (Qualifying)" is 53 and would be cut
mid-credential. Filling `seo.pageTitle` on the record overrides this.

```bash
node scripts/audit-practitioners.js http://localhost:3000
node scripts/audit-practitioners.js https://www.curatehealth.ca
```

Six checks, all against rendered pages. Run before this merged, it reported
all seven as 404, which is what proves it looks.

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
| CH-110 | **Done 2026-09-13.** `lang="en-CA"` in `app/layout.tsx` |
| CH-111 | **Partly done 2026-09-13.** A visible "Last reviewed" line is on treatment and blog pages, from Sanity's `_updatedAt`. `dateModified` in markup waits for CH-105: Google reads it on `BlogPosting`, which does not exist yet, and putting it on a `Service` node would be markup nothing consumes |
| CH-112 | **Done 2026-09-13.** Search form, six hub links, `noindex`, still a real 404. Deliberately not a redirect home: a soft 404 teaches a crawler a dead URL is a live page |
| CH-113 | **Done 2026-09-13.** `book_now`, `call_click`, `email_click`, `directions_click` and `file_download`, from one delegated listener in `components/shared/analytics-events.tsx`. See below |
| CH-114 | IndexNow submission on publish. Bing's index is what ChatGPT search runs on                                                                                        |
| CH-115 | **Done 2026-09-13.** No longer emitted. The Studio field stays, since editors filled it in and deleting their work is not this ticket's job |
| CH-029 | Downsample oversized Sanity assets. 95 exceed 2,600px, worst is a 6500x3846 PNG appearing on 29 pages. CH-007 solves most of the delivery cost, so this is cleanup |
| CH-030 | Add Claire to the team page and to CH-104                                                                                                                          |

### CH-113 Conversion events

**Done 2026-09-13.** Nothing was tracked before this. gtag loaded and counted
page views, so the numbers could say which pages were visited and never which
ones produced an appointment.

**One delegated listener, not a prop on every button.** Booking links are
rendered by at least five components and some arrive as portable text out of
Sanity, where there is no component to edit. A single capture-phase listener on
the document reads the href of whatever was clicked, so a booking link is
measured wherever it appears and whoever adds it next. `BOOKING_HOST` is the
one line to change if Jane is ever replaced.

**GA4 Enhanced Measurement is not the answer here.** It reports every outbound
click under one event name, so a Jane booking is indistinguishable from a click
on Instagram. It is also a property setting nobody controls from this
repository, so it can be switched off without anything in the codebase
changing.

| Event | Fires on |
| ------------------- | ----------------------------- |
| `book_now` | any link to `janeapp.com` |
| `call_click` | `tel:` |
| `email_click` | `mailto:` |
| `directions_click` | a URL carrying `daddr=` |
| `file_download` | any `.pdf` |

**Still to do by hand, and the events are worth little until it happens:** mark
`book_now` as a key event in the GA4 property, at Admin, Events. Claude Code
cannot do this from the repository.

```bash
node scripts/audit-conversion-events.js https://www.curatehealth.ca
```

That checks the code is still shipped and reachable from every page, by finding
the event names in the JavaScript each page loads. It cannot prove an event
fires. For that, load a page, run
`window.gtag = (c, n, p) => console.log(n, p)` in the console, and click a Book
Now link. Verified that way on the homepage and `/contact` before merge: all
five fire, an internal link and an Instagram link correctly fire nothing, and a
real Book Now button already in the markup fires without any component edit.
| CH-117 | Retire the orphaned image assets. **Deferred by Frank on 2026-09-13, to be raised again later.** See below                                                        |

### CH-116 Retire the content nothing uses

**Done 2026-09-13.** 29 documents deleted from the dataset, then the code
that described them removed in #232.

The dataset held 18 document types the Studio did not register, so nobody
could open them, and most were read by nothing at all. Two classes sat
underneath that.

_The about duplication._ Five documents of type `aboutPage` and five more of
type `aboutPages`, the same five pages twice, created three days apart in July
2024. The `aboutPages` set looked live because `SITE_SETTINGS_QUERY` has a key
called `"aboutPages"`, and it looked live to a reading of the source rather
than of the query. It is a projection alias: a hand-built array selecting
`ourStory`, `ourTeam`, `missionAndValues`, `sustainability` and
`pillarsOfHealth` directly. **Do not read a key name as a type name.** The
footer has always read the real page documents.

_Superseded 2024 documents._ `accessibility`, `privacy` and `termOfUse`,
replaced by `legalPage`; `cafe`, `ourServices`, `highlight`, `popup`, `survey`,
`surveyLink`, `feedbackLink`; `metadatas` and three `pageMetadata`, an
invisible second source of page titles and descriptions, one of them touched as
recently as 2026-08-25; `footer` and `navigation`, which `LAYOUT_QUERY` fetched
on every page load and `shared/layout.tsx` discarded. Three of the 29 were
drafts.

**Kept:** the three `program` documents, which are CH-104 groundwork, and
`sanity/schemas/category.ts`, which has no documents but which CH-105 needs.

```bash
node scripts/audit-dead-content.js       # finds the class
node scripts/verify-dead-content.js      # proves each document is dead
node scripts/delete-dead-content.js      # dry run
node scripts/restore-dead-content.js --backup=PATH   # undo
```

**Three methods have to agree before anything is deleted**, and the third one
is the only one that asks the site: no live query selects the type, nothing in
the dataset references the document, and no string unique to it appears in
production HTML. "Unique" needed three corrections before it meant anything.
A path is not evidence, because the footer builds `/about/sustainability` from
a template literal and the assembled string exists in no document. A string
the source hardcodes is not evidence, because "Get Directions" is a button
label. And uniqueness is containment, not equality, because `metadatas` held
"Naturopathic Care" and that phrase sits inside a sentence of body copy on
`/services/naturopathy`. A document with no searchable strings left goes to
review rather than passing, since zero hits would otherwise mean zero looked
for.

**The deletion ran without approval.** A gate test was chained behind a
command that failed on a Windows path, and the shell carried on to a real
`--apply` that was legitimate by every check it made. Nothing broke, and the
export taken minutes earlier held all 29. The lesson is not a missing gate,
it is that a destructive command must never sit downstream of a step that can
fail. `--expect=<n>` was added for this: `--apply` now also requires the count
the dry run printed, which cannot be written before the dry run is read.
**Do not chain anything destructive after anything else.**

### CH-117 Retire the orphaned image assets

**Deferred 2026-09-13, at Frank's direction. Raise it again rather than
letting it lapse.**

367 of the 560 image assets are referenced by nothing, 807 MB. None appears
in production HTML. That is two methods, and CH-116 held documents to three,
so this is not ready. The argument for doing it is the Studio's media library,
where two dead images sit between every pair of live ones, not the storage.

Three gaps to close first. The corpus was the 41 sitemap URLs, so it misses
`/coming-soon`, `/login`, `/search` and `/studio`. A `cdn.sanity.io` URL
pasted as raw text rather than stored as a reference is invisible to
`references()`, so grep the source and the dataset text for asset ids.
Anything uploaded in the last 90 days stays regardless, since it may belong to
work that has not merged.

Some filenames want human eyes before anything runs:
`Eric_Profile_b&w_cropped.jpg`, `Andrew_Profile_Color_biggerbg.jpg`,
`Hero Image(1).png`. They are probably superseded versions of live images, and
probably is not the standard for a practitioner's photo. Fold this into CH-029,
which is the other pass over the same library.

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
