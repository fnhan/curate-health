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

Site is 51 URLs in the sitemap as of 2026-09-19. Health and wellness clinic with an attached cafe at 989 Eglinton Ave W, Suite 2, Toronto.

---

## Working rules

**Branch and preview, never push to production directly.** One branch per ticket group. Vercel preview deploy for every branch. Frank reviews the preview before merge.

**Every page ships complete for search and AI answers. Hard rule, set by Frank on 2026-09-18.** A page without all of the following is unfinished, not merely unoptimised, and does not go to Frank for review. It applies to every new route, every new document type that produces pages, and every page added through the Studio.

- A unique title, 60 characters or fewer including "| Curate Health", that agrees with the page's one H1, and a unique meta description of 155 characters or fewer. Both editable in the Studio through an `seo` field, with fallbacks in code, and set through `buildPageMetadata` with the page's own canonical path.
- A share card: an `og:image` at 1200x630 that loads, with the title, description, `og:type` and site name. Default the image to a photo the page already shows, so nobody has to remember to pick one.
- Structured data for what the page is, such as Person, BlogPosting, Product or Service, agreeing with what the page shows. Below a hub, a breadcrumb trail with its markup.
- Listed in the sitemap, and in llms.txt with a one-line description. Taken out of both when the page is switched off.
- Linked from a hub or the navigation, within three clicks of the homepage.
- Text a crawler can read: in the HTML, not closed inside accordions or loaded only in the browser. Alt text on every image and `sizes` on every `next/image`.
- For a new document type: a line in `pathsForDocument` in `lib/indexnow.ts`, so publishing it tells Bing, and a place in `INDEX_DOCS_QUERY` in both `app/api/search/route.ts` and `app/search/page.tsx`, so the site's own search finds it.
- The content rules below.

Acceptance is `node scripts/audit-seo-complete.js http://localhost:3000` passing against a local build that includes the page. State in the pull request that it passed. When a check fails on something already known and accepted, say so there rather than leaving it unexplained.

**Every push is a stored deployment.** Vercel builds a full copy of the site for each push to a pull request branch and for each merge to main, and keeps it for up to 30 days. On 2026-09-15 the team hit 100% of the 10 GB of Deployment Storage the free Hobby plan includes: 158 copies held, 116 of them from the previous seven days, nearly all from this project's own pull requests. Push a branch once, when it is ready for Frank, rather than after every fix, and batch tier 1 changes instead of merging each on its own. `npx vercel list curate-health` shows what is held. Deleting deployments and changing the retention policy are Frank's to do in the dashboard.

**The Hobby plan does not cover this site.** Vercel restricts Hobby to non-commercial personal use, and a clinic site that advertises its services is commercial use by Vercel's own definition. Frank was told on 2026-09-15. Moving to Pro is his decision; until he makes it, assume the 10 GB ceiling still applies.

**Everything in `public/` ships inside every deployment, used or not.** Thirteen photos, 34 MB, had not been used since 2024 and were removed on 2026-09-15: no reference in the source, none in the rendered pages or the script and style bundles they load, none in the dataset. The files left in that folder are live. Several are imported by components or by `app/globals.css`, and an imported file is served under a hashed name, so searching rendered HTML for its original filename finds nothing. Search the source before calling a `public/` file unused.

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

- **Git Bash rewrites any argument that starts with a slash into a Windows
  path.** MSYS path conversion turns `/contact` into
  `C:/Program Files/Git/contact` before node ever sees it. This bites
  `scripts/indexnow-submit.js`, whose documented usage is
  `node scripts/indexnow-submit.js --apply /blog /contact`: the paths are
  mangled, the script's `startsWith("/")` filter matches none of them, and it
  **silently falls back to submitting the entire sitemap** rather than failing.
  Found 2026-10-11 while submitting the moved Curate Lifestyle addresses.
  Prefix the command with `MSYS_NO_PATHCONV=1`, or run it from PowerShell.
  Any script taking a path as an argument has the same problem.

Default to Node for every verification script in this file. It removes a dependency and behaves identically from either shell. When you rewrite one, show Frank the Node version and what it checks, since he will be running these himself between sessions.

---

## Content rules, non-negotiable

These apply to every word written into the site, schema, meta tags, or alt text.

- No em dashes or en dashes as punctuation. Use commas, colons, semicolons, or full stops. Compound hyphens like "evidence-based" are fine
- No exclamation marks
- No emojis
- No tricolons or rule-of-three lists
- No fabricated statistics, study citations, or quotes
- **Banned words: "harness the power of". That is the whole list.** Frank cleared
  the rest on 2026-10-11 after reading how they were actually used:
  **transformative, elevate, unlock, seamless, complimentary and "dive in" are
  fine.** Older copies of this file banned all seven. Do not reintroduce any of
  them, in this file or in `scripts/lib/content-rules.js`, and do not report
  their presence in existing copy as a defect
- **Em and en dashes are the hard ban**, reaffirmed by Frank on 2026-10-11 in
  the same breath as relaxing the words. They are 47 of the remaining breaks
- **"journey" is fine, in any form, including "holistic wellness journey". Cleared by Frank on 2026-09-10 and widened to the full phrase on 2026-09-12.** It is not a banned word, it is not a banned phrase, and it should not be reported as one. Older copies of this file banned the bare word, then banned the phrase while allowing the word; both are superseded. Do not reintroduce either restriction, and do not add "journey" back to the banned array in any script
- "complimentary" is allowed as of 2026-10-11 and the audits no longer flag it.
  The older guidance was to use "included" or "bonus" for anything Curate
  offers, on the reasoning that calling part of a paid tier free is a claim
  rather than a word choice. That was put to Frank and he cleared the word
  anyway, so it stands cleared. **The word is nonetheless gone from the site**,
  because he then asked for it out of the Flowpresso lines on /our-programs on
  the same day, and it was redundant in all three places it appeared. Allowed,
  and currently unused
- OHIP framing is exactly: "partially covered by OHIP and most benefit programs"
- The outdoor space is always "Recovery Sanctuary." Never "outdoor terrace" or any variant
- **No update stamp on any page, ever. Frank's rule, 2026-10-13.** No "Last
  reviewed", "Last updated" or "Last modified" line, anywhere, whatever the
  date comes from. `audit-content-rules.js` fails on all three wordings, and
  `audit-blog.js` fails a post that renders one. The component that drew it is
  deleted, so putting it back means writing a new one. **`dateModified` stays in
  the `BlogPosting` markup**, which is not a contradiction: Google reads it on
  Article and BlogPosting without expecting it rendered, unlike
  `BreadcrumbList`, which it checks against the trail a reader can see
- Neighbourhood descriptor is "Midtown Toronto"
- **The house spelling is "cafe", never "café".** No accent, anywhere: the site, the Studio, marketing, design, anything Curate produces. Frank ruled on 2026-09-12. `node scripts/audit-cafe-accent.js` sweeps the dataset and exits 1 if an accented spelling is live
- **Canadian spelling throughout. A hard rule, and Frank asked on 2026-10-11
  that it hold even against his own later instruction.** If he approves copy
  carrying an American spelling, as he did for the cafe paragraph that day, fix
  the spelling and tell him, rather than treating the approval as an override.
  `scripts/audit-content-rules.js` checks it and `scripts/fix-canadian-spelling.js`
  sweeps the dataset. 23 spellings across 19 fields were corrected on 2026-10-11
- **Canadian English is not British English, and the check is deliberately
  short.** "program", "organize" and "analyze" are all correct here and are not
  flagged. "practice" and "license" split noun from verb in a way no regex can
  judge, so neither is flagged either. Widening the list to catch those would
  produce more wrong answers than it fixes

Tone: scientific and evidence-based, thoughtful, warm, understated. A trusted clinician sharing an observation, not a brand talking. No hype.

### These rules bind the claude-seo plugin

The `claude-seo` plugin is installed at user scope, so its 25 skills and 18 subagents are active here. Nothing in it overrides this file.

- Every rule above applies to plugin output: generated titles, meta descriptions, alt text, schema values, content briefs, and anything a `claude-seo:*` subagent drafts. Generic SEO copy reaches for the banned words by default, so review it before it lands in the repo or in Sanity
- Subagent prompts do not reliably carry this file. When spawning any `claude-seo:*` agent, restate the banned words and the dash rule in the prompt itself, along with any canonical string the task touches
- The `seo` skill appends a "Community Footer" advertising the author's skool.com community after major deliverables. Strip it. It is not Curate content and must not reach a client deliverable or a commit
- `/seo audit` spawns up to 15 subagents in parallel. Run it only when asked for by name. Prefer the narrow commands against a single URL, such as `/seo page` or `/seo schema`
- `aggregateRating` stays out per CH-008, whatever the local SEO skill recommends
- Practitioner credentials and the OHIP framing come from the tables above, never from what a plugin infers off the rendered page

**Curate Health is not a clinic. Hard rule, restated by Frank on 2026-10-12.**
It is a health and wellness space, and the clinic is one of the things inside
it, alongside the cafe, the Recovery Sanctuary and the programs. So it is
"Curate Health is home to an interdisciplinary clinic", never "Curate Health is
an interdisciplinary clinic", and never "we are one of the few clinics in
Toronto" where "spaces" or "places" is what is meant.

This is easy to get wrong in the name of concision. The /services lead Frank
wrote read "Curate Health is home to an interdisciplinary clinic in Midtown
Toronto", and it was edited to "Curate Health is an interdisciplinary clinic"
as a fix for circular phrasing. It was not circular, it was accurate, and the
edit collapsed the whole business into one of its parts. **Do not tighten this
sentence shape.**


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
- Direct billing content. **Curate does no insurance submissions and no
  direct billing, confirmed by Frank on 2026-10-12.** Not a scope
  preference, a fact about the business, so copy saying otherwise is wrong
  rather than merely off topic. See the sweep below
- Standalone condition pages. Conditions will be covered in blog posts instead
- Practitioner bio copy. It already exists in Sanity, see CH-104

---

## Phase 1: P0

**Every ticket in this phase is done, verified against production on
2026-10-13**, and several had no Done marker for weeks, which made the backlog
look larger than it was. Check before working one of these.

| Ticket | Checked |
| --- | --- |
| CH-020 unicode | `audit-unicode.js`, 0 Cf characters in the dataset |
| CH-021 address | `addressLocality: Toronto`, no "York" |
| CH-001 500s | unknown service slugs return 404 |
| CH-002 redirects | all four legacy URLs 301 |
| CH-022 acupuncture | `/services/rehab/acupuncture` 200 |
| CH-023 Flowpresso | title is `Flowpresso® Therapy Toronto`, and the last three claim lines went 2026-10-13, below |
| CH-032 llms.txt | clean on all six original defects |
| CH-033 psychotherapy | its own description, not performance training's |

CH-013, in phase 2, is done too: both `/services/exercise-therapy` and
`/services/lifestyle-medicine/exercise-therapy` redirect to
`/services/movement-and-training`.

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

That script also reported four things on the same page that needed a decision rather than a replace. **All four are closed as of 2026-10-13.**

- The **"FDA Approved" claim** was the one that mattered. Flowpresso holds 510(k) clearance, not premarket approval, and the page now says so. See the FDA section below.
- The **grammatical slip in `benefits.title`**, "Why Choose Curate Health's for Flowpresso® Therapy?", now reads "Why Choose Curate Health for".
- **"clinics" in a benefit subtitle** went with the same pass. "One of the few clinics to provide Flowpresso® Therapy in Toronto" breaks the rule that Curate Health is a space, and the same claim on /services already read "one of the few spaces in Toronto", so the two now agree. "ensuring you receive the highest quality care" went at the same time, a superlative against the tone rule.
- **"transformative" in `cta.ctaText` stays.** Frank cleared the word on 2026-10-11.

One more went with them, not on the original list: `intro.subtitle` read "Enhance Your Recovery with Advanced Compression Therapy - Overcoming Recovery Challenges", two headings joined by a hyphen standing in for a dash, the second repeating the first. It is the first half alone now.

`scripts/fix-flowpresso-capitalisation.js` is unchanged and still only does the spelling. These three were applied directly, transaction `UAIn8zgTVuj4HCTBS5YhXh`, after `sanity-backup-2026-10-13-before-flowpresso-claims-documents.tar.gz`.

**The quote on that page stays**, one of the seventeen unsigned first-person lines Frank settled on 2026-10-11.

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

**Two more defects, found and fixed 2026-09-18.** The file listed 24 of the 49 pages in the sitemap: none of the about pages, practitioner pages, products, hubs or legal pages, so every page built this year was missing. And it printed "[object Object]" for every practitioner's credentials, because `role` on Our Team is rich text and was read as a string. Practitioners now link to their pages with the credentials from their records. The About, Programs, Products and Optional sections are new, the last for the legal pages, per the llms.txt convention for links a reader can skip. Post descriptions use the meta description ahead of the excerpt, since the 2024 excerpts predate the content rules; one of them carries "unlocking".

`node scripts/audit-llms.js` fails on a sitemap page missing from the file, a listed page that does not answer 200, and template debris such as "[object Object]". Run against production before the fix, it named all 25 pages and all six practitioners.

The Curate Lifestyle pages, `/services/curate-lifestyle` and `/services/curate-lifestyle-program`, were live and missing from the sitemap as well as from this file. They have routes of their own rather than a slug under `/services`, so the sitemap's list of services never produced them. Both are in both now.

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
- `BlogPosting` with `author` on blog posts, see CH-105. No `reviewedBy`, which Frank declined on 2026-09-15
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

**Blog posts only, since 2026-09-20. Frank's call, and it is not a bug to fix.** The trail came off all 41 other pages. His reasoning: the service, treatment and product pages already show a second menu under the header and the line repeated it, and the about, practitioner and legal pages are one click from a hub that lists them. A blog post has neither, so it keeps its trail.

What that costs, so nobody rediscovers it: Google draws the breadcrumb line in a result from this markup, so those results show the bare address instead. Nothing else changes. Every page is still linked from its hub, which is what crawling depends on, and `scripts/audit-orphans.js` still proves it. `lib/breadcrumbs.ts` now holds only `postCrumbs`, and `scripts/audit-breadcrumbs.js` fails if a trail appears anywhere but a post.

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

**Until 2026-09-18 this check read production whatever address it was given.** It took the sitemap from the target and then fetched the addresses written in it, which always name the live site, so a run against a local build checked the live pages. Results reported against production stand. Any "passes locally" before that date was a production result. It now reads the target's own pages, like the other checks.

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

**The mapping was filled in 2026-09-14**, by
`scripts/apply-practitioner-mapping.js`. Three different provenances, and they
should not be confused when anyone revisits this:

| Source | What |
| --- | --- |
| Frank, against a corrected chart | every treatment to practitioner assignment, and the Recovery Sanctuary booking links |
| Dr. Gabriele and Dr. Leong, relayed | their own `commonlyTreats` lists, 24 items and 3 |
| Claude Code, at Frank's request | the other four clinical lists, written narrow and ordinary for the profession, **to be replaced** when each practitioner sends their own |

**Rooj's entry is not a clinical list.** She is a yoga teacher, not a regulated
health professional, so `commonlyTreatsLabel` is set to "Class focus" on her
record and the items are what her classes are for. That field exists for
exactly this: "Commonly treats" over a list of class focuses would read as a
clinical claim nobody made.

**Treatments now carry their own `janeBookingUrl`.** Every treatment's Book
button used to land on the Jane front page, leaving the visitor to find the
thing they had just been reading about. Recovery Sanctuary bookings each have
a treatment address in Jane; the button uses it when set and falls back to the
site-wide link when not.

**Three things still open, all of them Frank's:**

- **Claire Kim teaches Mat Pilates and is deliberately left off the site for
  now.** Frank's call on 2026-09-14: leave her out of Outdoor Pilates and off
  the team page until she is up and running, then add her everywhere at once.
  Her surname comes from Jane, "Mat Pilates Class with Claire Kim". **Raise
  this again rather than letting it lapse**, and do CH-030 in the same pass.
- **Ariel Zohar's photograph is 1001x685**, below the 800x1000 the crop needs,
  so it is upscaled and looks soft. A photograph to replace, not a value to
  lower. `scripts/audit-practitioners.js` names anyone in this state.
- **Jane's own address still says "York".** It read "989 Eglinton Avenue
  West - Suite 2, Suite 2, York", with the doubled suite and the "York" that
  CH-021 spent a ticket removing from the site. Frank fixed the doubled suite
  on 2026-09-17; checked that day, it reads "989 Eglinton Avenue West, Suite
  2, York", so "York" still disagrees with the site's "Toronto". Local search
  reads the two as one business, so the mismatch costs something. Jane is not
  in this repository: it is a change somebody makes in the Jane settings.
- **Jane offers acupuncture with Dr. Frank Nhan only.** The site lists Dr.
  Gabriele, Dr. Nhan and Ariel Zohar as providers, per Frank's chart. Someone
  who reads that Ariel does acupuncture and clicks Book finds only Frank. One of
  the two needs to change, and which is Frank's call.

**The team hub is the backup, not a rebuild.** Frank asked twice for the hub to
look exactly as it did before #238, and two attempts to reproduce it by hand
both changed things: the first redrew the card, the second rebuilt it as a
lookalike and also changed the order. On 2026-09-14 he asked for the original
to be restored instead, and that is what shipped: `app/about/our-team/page.tsx`
and `team-members-section.tsx` taken from `ffd80e0`, the commit live before
#238, with one change. "Learn More" and the photo link to the practitioner's
page rather than opening the bio in an accordion. `git diff ffd80e0` on those
two files shows nothing else. **When Frank asks for a revert, restore the files
from git and change only what he named.**

The hub still reads `ourTeam.teamMembers`, so its photos, credentials and order
are exactly the originals: Dr. Nhan, Dr. Gabriele, Dr. Leong, Safa, Ariel,
Andrew, Rooj. `ourTeam.practitioners` holds a different order and the hub does
not use it. The practitioner pages read the practitioner records, and every
team member name maps to one. Masonry lays cards out column first, so check the
order by position on the page rather than by reading the HTML top to bottom.

`components/shared/practitioner-card.tsx` is used only by the "Practitioners
offering this service" block on treatment pages.

**Every practitioner has a "Show on website" switch, since 2026-09-17.** Frank
asked for it to take Safa Karoumi off the site temporarily, and asked for it to
be standard for every practitioner, now and new ones. It is the `isActive`
field on the practitioner record, on by default. Switched off, that person
leaves the team page, their own page (which becomes a 404), the service pages
that list them, the Curate Lifestyle page, site search, the sitemap and
llms.txt, which catches up within the hour. Switched back on, all of it
returns, with nothing else to edit.

**The Studio warns about this on the switch itself, since 2026-09-20.** Turning "Show on website" off raises a validation warning on the field, in the editor's own words, saying that the page stays in Google until Google revisits, how to take it out sooner, and to cancel that removal before switching the person back on. A warning rather than an error, so the record can still be published switched off. `scripts/audit-practitioners.js` prints the same reminder whenever anyone is switched off.

**Switching someone back on has a step outside this repository.** Safa Karoumi's page was removed from Google by hand, through Search Console's Removals tool, on 2026-09-19, because a 404 sits in the results until Google recrawls it. That removal lasts about six months and hides the address whatever the site says. **Before flipping her switch back on, cancel the removal request in Search Console, then ask for the page to be indexed again through URL Inspection.** Otherwise her page returns to the site and stays invisible in Google. The same applies to anyone else taken off this way.

The team page and the Curate Lifestyle page read `ourTeam.teamMembers`, not
the practitioner records, so their queries drop any member whose name matches
a switched-off practitioner. **The two names must agree.**
`scripts/audit-practitioners.js` fails when an Our Team entry has no
practitioner record of the same name, and when anyone switched off still
shows on the team page, their own page, the sitemap or site search.

**Site search indexes whole documents, so it needs the filter too.** The first
version filtered the pages and missed search: with Safa switched off on
2026-09-17, her page, card and sitemap entry were gone, but searching "Safa"
still returned the team page, because the search index read every string in
the Our Team document, her bio included. Both `INDEX_DOCS_QUERY` copies, in
`app/api/search/route.ts` and `app/search/page.tsx`, now filter
`teamMembers` the same way.

**Blog bylines were already built, by Frank's developer, and were not changed.**
`components/shared/blog-author-byline.tsx` and `lib/author-team-link.ts`, from
commit `18ea307` on 2026-03-31. An empty author shows no byline; the "Curate
Health Team" option shows that name and links to `/about/our-team`; a named
team member links to that person. The only change here is where a named member
links, which was `/about/our-team?member={name}` and is now their page. Both
posts use the "Curate Health Team" option, so nothing on the blog changed.
`?member=` links on `/services/curate-lifestyle` were repointed the same way.

**Photos.** The individual practitioner pages crop through Sanity to one 4:5
frame at 800x1000, because they rendered each photo at its natural ratio and the
seven sources range from 0.65 to 1.50. The hub keeps the original fixed 300px
frame, which was already uniform, and honours a hotspot when one is set.
`urlForPractitionerPhoto` is the page crop.

**Jane links were read off the live booking site, not guessed.** Flowpresso is
`#/discipline/22/treatment/42`, under Recovery Sanctuary Classes behind that
section's "Show more". Acupuncture has a section of its own with no sessions,
only "Book by Practitioner", so its link is the section anchor Jane's own
navigation uses, `#/acupuncture`. Frank pasted `treatment/81` for Flowpresso;
that is Cold Plunge & Sauna. After writing a booking link to Sanity, a local
build can keep serving the old one for 60 seconds: request the page twice
before concluding the link did not land.

**The mockup commit went unpushed for a turn.** `git push origin <branch>`
pushes the local branch of that name, not the one checked out. A commit made on
`feat/practitioner-design` and pushed as `feat/treatment-booking-links` left
PR #239 without it while it was described as included. Push with
`git push origin HEAD:<pr-branch>` and confirm the remote log.

**The image builder throws rather than returning null** when handed an object
with no asset, so a `|| photo.url` fallback at the call site does not catch
it. A projection that selected the url but not the asset reference 500'd all
seven pages. `urlForPractitionerPhoto` guards before calling the builder now.

### CH-105 Blog architecture

Conditions will be covered in blog posts rather than standalone pages, so the blog needs to actually work. Currently two posts, last updated 16 December 2024, no taxonomy, no author attribution.

Build:

- Categories and tags for topic clustering
- Author byline on every post, linked to the practitioner page from CH-104
- `BlogPosting` schema with `author`, `datePublished`, `dateModified`
- Pagination
- RSS feed at `/rss.xml`, currently 404

**No reviewed-by line, decided 2026-09-15.** Frank declined the visible "Reviewed by {name}, {credentials}" line with a date, and the `reviewedBy` markup that went with it. Do not rebuild either, and do not report the absence as a gap. Nothing in search depended on it: Google's article markup does not read a reviewer, and schema.org defines `reviewedBy` on `WebPage` rather than on `BlogPosting`.

The byline work is the highest-value E-E-A-T item available. Google's helpful content systems filter anonymous medical content, and the AI answer engines apply the same test. Six credentialed practitioners and zero bylines is the gap.

**Bylines already existed** when this ticket was picked up, built by Frank's developer, see CH-104. Both posts show "Curate Health Team".

**Markup and feed built 2026-09-17.** Each post carries one `BlogPosting` node from `buildBlogPostingJsonLd` in `lib/structured-data.tsx`. Its dates are the two the page shows: `datePublished` is `publishedAt`, and `dateModified` is `_updatedAt`, the same value as the "Last reviewed" line, which finishes CH-111 for posts. The author is whoever the byline shows. The "Curate Health Team" byline becomes an Organization pointing at `/about/our-team`; a named team member becomes the Person node on their practitioner page, by the same `@id`; a post with no byline carries no author rather than one the page never shows.

`/rss.xml` lists every published post, and `/blog` and every post point to it with a link tag. The feed's description and the `/blog` meta description are one string, in `lib/blog-feed.ts`.

**Categories, tags and pagination are not built, by Frank's decision on 2026-09-17** to wait "further down the road", until the blog has posts to fill them: with two posts, each category page would hold one or two, which reads as thin, and pagination would have nothing to page. Raise it again once there are enough posts.

```bash
node scripts/audit-blog.js http://localhost:3000
node scripts/audit-blog.js https://www.curatehealth.ca
```

### CH-106 Video

The site hosts Mux video with zero `VideoObject` markup.

YouTube accounts for roughly 18.8% of Google AI Overview citations, second only to Reddit. Video is one of the two dominant citation sources and Curate is invisible in both.

Add `VideoObject` schema with `transcript` on every embed. The transcript is the part that gets extracted. Build the component so transcripts can be added from Sanity.

The 13 scripted Tai Chi clips in the content plan are the first candidates.

### CH-107 Class schedule

Tai Chi with Dr. Gabriele on Sunday mornings, yoga with Rooj, mat Pilates with Claire. Recurring scheduled events at a fixed location, which is exactly what `Event` schema is for.

Build a class schedule page with per-class URLs, `Event` markup, and direct booking links. This gives the Recovery Sanctuary a discovery surface it currently lacks entirely.

### CH-108 Cafe menu as HTML. Built 2026-10-18

`/cafe/menu`, 10 sections and 27 items, every name, size, price and ingredient
line as text in the HTML. The PDF is still on `/cafe` for printing, as the
second button rather than the only one.

The menu lives in a `cafeMenu` document, one document rather than one per item:
thirty documents would be thirty things to open to change a price, and thirty
slugs for pages nobody wants.

**The markup is a `Menu` entity, not a link to a file.** `hasMenu` on the cafe
entity points at `#menu` on the new page, and that node points back with
`provider`, so the two are one business. Sections become `MenuSection` and items
`MenuItem`, which is what lets an answer engine quote one drink rather than the
whole list. `hasMenu` rather than `menu`, which schema.org marks superseded by
it; the PDF url is still what it carries while the page has no items on it.

**Prices are in the markup here, unlike the product pages.** Those carry
`Product` with no `Offer` on purpose, because pricing for them lives in Jane and
the site cannot show it. The menu is the opposite: the prices are printed on the
page, so leaving them out would describe the page less accurately than putting
them in. Markup describes what the page shows.

**One gate in four places.** The route 404s, the sitemap omits the URL, llms.txt
omits the line and `/cafe` hides the link, all on the same condition: the
document has at least one section with items. So the four cannot disagree, and
`/cafe` can never link to a page that is not there.

`cafeMenu` is in `pathsForDocument` and in both `INDEX_DOCS_QUERY` copies, so
publishing it tells Bing and site search finds it. Checked: "Zawadi", "hojicha"
and "Maple Almond" each return `/cafe/menu`.

**The hero defaults to the cafe page's own photograph**, and so does the share
card, so neither needed choosing. No breadcrumb trail, per the blog-posts-only
rule from 2026-09-20.

#### Where the content came from, and the four readings in it

Two sources, both Frank's: the menu PDF `/cafe` was linking to, and the "New
recipes" Google Doc, which is **newer** and is the master for what the kitchen
makes.

**The Maple Almond bar does not use its printed line, and this is the reason
the ingredient field says it is allergen information.** The bar was sold as
"Almond & Walnut" and the PDF's ingredients for it read "almonds, dates, maple
syrup, cinnamon, cacao powder, vanilla extract, salt". That omits **walnut**, a
tree nut named in the item's own title, omits the goji berries and lemon zest,
and lists cacao powder, which belongs to the Chocolate Hazelnut bar. The recipe
doc has the real list and that is what went in, the walnut included. Frank
renamed it **Maple Almond** on 2026-10-16 and confirmed **no honey** in it,
which the recipe agrees with. Honey stays in the drinks that have it. The
recipe calls the topping a brittle; he corrected that on 2026-10-18, "it is
not a brittle, it is just a maple walnut topping", so the line ends "with a
maple walnut topping".

The PDF sets items out in four columns with the ingredient lists in a separate
text layer, so pairing a list to its drink was a reading of the layout rather
than something the file states. **Frank settled all four on 2026-10-18**, and
the answers are in the data now rather than in a note:

- **Matcha Latte at 16oz is iced.** Everything else split on size, 12oz and
  under hot.
- **"Matchacano with Protein" and "Cold Foam (16oz)" are one item**, $14.
- **The $3 add-on is vanilla only**, and the other two flavours belong to the
  Banana Booster, which is where they went.
- **Chia Pudding is 350g.** The PDF prints 35g, an energy bar's weight for a
  $10 item, so the file is wrong there.

Three structural changes came with them.

**Specialty Protein holds both protein drinks**, under the PDF's own name for
that section. Its Protein Shakes heading is gone.

**Two items came off the menu**, on his instruction rather than by accident:
"Organic All-In-One Plant-based Protein Shake" and "Signature Protein
Milkshake with House-made Almond Milk", both 20oz at $12 and both printed on
the PDF. He cut Protein Shakes to the Banana Booster alone. Put them back if
that was not what he meant.

**"Matchacano" is gone as a name, and is not coming back.** He said the
matchacano and the ceremonial matcha "are the same, we should just pick one",
asked which, and confirmed the answer: "let's keep ceremonial matcha
consistent, no matchacano". The reasoning, so it is not reopened: Ceremonial
Matcha is the term people search and is already the first thing in that item's
own ingredient line, while "matchacano" is a coined word with no search behind
it that reads as a typo of americano. **Renamed, not deleted**, so neither
preparation left the menu: the plain 6oz is under Hot and the 16oz with
protein is under Specialty Protein.

**A section has two optional lines and they sit in different places.** `note`
goes on the heading row, right aligned, where it lands in the price column:
that is "$13 for 3" on Energy Bars. `footnote` goes under the items, which is
where the smoothie add-on belongs. Frank, 2026-10-18: it "should be at the
bottom of smoothie section". Both are italic, and the markup joins whichever
are set into that MenuSection's `description`.

**The standing note lost a negative margin that was dragging it over the
prose.** It carried `-mt-10` from when it sat in its own section below the
intro band and had to be pulled up against it. Once the intro moved into the
heading section the margin had nothing to pull against and overlapped the
paragraph above, which is what his screenshot showed. Delete a block's
positioning when you move the block.

**The back link needs its own top padding now.** The sections lost their
bottom margin when the grid took over the spacing, so the link sat tight
against the last one. It is `pt-16 md:pt-20`, matching the grid's row gap.

**A section note sits on the heading row, right aligned and italic.** Italic
so an add-on does not read as an item you order on its own, "add on should be
in italics and not look like an actual item", and right aligned because "$13
for 3" belongs in the price column: it "should be on the right (right
aligned), where all the prices are lined up already". Measured, the note and
the prices below it both end at 1501px. It wraps below the heading and returns
to the left on a phone, where a right-aligned sentence on its own line reads
as a mistake. The note is that MenuSection's `description` in the markup.

**Section headings hold one line.** The heading is `shrink-0` so the note on
the right gives way first. Not `whitespace-nowrap`, which overflows the column
rather than wrapping, and wrapping is the behaviour Frank allowed for: "unless
adaptive settings need to split it to 2 for any reason". Measured at 1680,
1280 and 375, every heading is one line today, the widest being "Kombucha on
Tap" at 211px in a 311px phone container.

**/cafe has one way into the menu, a band under the last alternating section and above "Visit the cafe".**
`components/layout/cafe-page/cafe-menu-band.tsx`, chosen by Frank on
2026-10-18 from three drafts: dark green filling sage on hover, the whole
section a single link because he asked for "the entire section being a
clickable button". White on sage is the house hover, the same as the bar under
the Program Timeline, and the resting state is the high contrast one.

**"Visit the cafe" is the hours block, not the band at the foot of the page.**
The band sat below the hours for a round because the first reading of "before
the Visit the cafe section" took that heading for the CTA band. `CafeHours`
carries it. Measured after the fix: the chia pudding section at y 4887, the
band at 5555, Visit the cafe at 5903, the CTA band at 6631.

**It says "Cafe menu" and then "Read the full menu" with an arrow, and that
is the whole of it.** His words: "I like the simplicity ... keeps it simple
for the eye to find." **Those two strings are in the code, not the Studio.**
They are a link label rather than editorial copy, like every other navigation
label on the site. A first version read the deleted card's Studio fields and
so published its old paragraph here, which is the opposite of what he asked
for.

**It replaced both of the other menu calls to action.** The "What we're
serving today" card is deleted, and the PDF download button with it. The band
reads that card's own Studio fields, `cafePage.menuDownloadSection.headline`
and `.description`, so the copy stayed editable and no new field was needed.
The PDF itself is untouched in Sanity and is now linked from nowhere.

**The section with the chia pudding and the cheesecake went through three
names.** "Desserts" he rejected, "this gives the impression unhealthy. These
are protein packed, so should be able to eat for breakfast, lunch or dinner".
"Jars" he rejected too. **"Fuel Foods" is his and is the better answer than
either of mine**: it says what the food is for rather than what it is served
in, which is the point he was making, and somebody might actually search it.

**Three more changes the same day.** Cranberry kombucha came off and **Violet
Lemongrass** replaced it. Two muffins and a no-bake cheesecake went on, from
the recipe doc rather than the PDF, which carries none of the three: **Banana
Zucchini Protein Muffin** and **Double Dark Chocolate Protein Muffin** at 69g
and $6, and **No-Bake Cheesecake** in a 69g jar at $15. The prices are Frank's,
since neither source has one. Their ingredient lines are the recipes reduced to
a menu line with every allergen kept: walnut, egg, hemp and oats in the
muffins, cashew in the cheesecake.
```bash
node scripts/apply-cafe-menu.js           # dry run, prints the whole menu
node scripts/apply-cafe-menu.js --apply
```

The script checks the copy against the content rules before it will write, and
against the audits' own title and description limits, so a failure shows up
before the mutation rather than after the build. Applied in transaction
`b293KmNbo0z5K9Rnfg9Yi3`, after
`sanity-backup-2026-10-18-before-cafe-menu-documents.tar.gz`.

**`audit-seo-complete.js` passes 9 of 9 with the page in.**

#### Frank's pass, 2026-10-18

**The first two paragraphs of the intro are his**, and they are one paragraph
of his split at his own sentence break: the first becomes the hero's standing
line, the second the band. At 250 characters the whole thing ran to four lines
over the photograph. Not a word is altered. The third paragraph is the
allergen line and is mine.

**The draft his replaced opened on "cooked without industrial seed oils and
sweetened with maple syrup, honey or dates rather than refined sugar".** That
claim is off the page because he took it out, not by oversight. Do not put it
back without asking him.

The standing note is his too: "vessel" rather than "mug", and food as well as
beverages. It is **two lines**, as he wrote them, because they are two
separate offers rather than one sentence, and it is pulled up against the
intro band with a negative margin. SectionIntro ends on `py-24`, so the note
sat 96px clear of the paragraph it belongs with and read as a section of its
own.

**"Bars are $13 for 3"** is a section note on Energy Bars, which also becomes
that MenuSection's `description` in the markup.

**The /cafe block no longer says "Save or share the menu in one tap"**, which
was written when downloading the file was all that block did. The script
matches that sentence rather than replacing the paragraph, so an editor
rewording the rest in the Studio is not silently reverted by the next run.

**Prices print whole numbers without decimals**, "as everything is whole
numbers for that reason". Only the $4.50 bars show cents. `menuPrice` in
`lib/structured-data.tsx` is exported for this, because the page and the
`Offer` in the markup both need it and two copies of the rule would eventually
disagree with each other.

**Ingredient lines stop at three quarters of the measure**, from the `sm`
breakpoint up. At full width a long one ran under the price column and the two
read as one paragraph. Not on a phone: there is no price column to clear at
375px, and three quarters of 311px took the immunity latte to five lines.

**Two columns from `xl`, which he asked for so a wide window scrolls less.**
This is not the layout he rejected twice on the prose band. There, balancing
the columns meant cutting a sentence across the gutter; a menu section is a
discrete block that moves whole or not at all.

**Two columns flowing in ROWS, not two column-shaped lists.** This is the
third attempt and the only one that satisfies both things Frank asked for,
which looked like a contradiction and were not: "preserve all drinks first
then food, like how the original pdf had it", and "both columns should have
as close to 50/50 as possible. If exact 50/50 is not achievable, make left be
the larger of the two".

A row-flow grid reads left to right and then down, which is the menu's own
order, so the six drink sections still come before the four food ones. And
because both columns hold the same number of rows and a row is as tall as its
taller cell, the columns are the same height by construction. Measured at
1390: 1969px and 1993px.

**The 24px is the last row, and it is the wrong way round.** Fuel Foods sits
left of Salads and Salads is the taller of the two, so the right column's last
section ends 24px lower. The rows are equal; only the final cells' content
differs. Not worth special-casing an order rule for 24px on a 2000px column.

**What the two earlier versions got wrong**, recorded so neither comes back.
Both dealt the sections into two lists and read down one and then the other.
A single cut point kept the order and could not balance: ten chunky sections
give ten arrangements, and the best left the right column 570px short.
Choosing a column per section balanced to 16px and scattered the menu, putting
Energy Bars among the drinks and Kombucha among the food. **Near-perfect
balance is exactly what produced the scatter.**

Rows cost some whitespace under the shorter section in each pair, about 310px
over four rows. The column version concentrated 570px of it at one column's
foot and ran 500px taller overall, so rows are less waste and less scrolling.
**Section headings hold one line.** The heading is `shrink-0` so the note on
the right gives way first. Not `whitespace-nowrap`, which overflows the column
rather than wrapping, and wrapping is the behaviour Frank allowed for: "unless
adaptive settings need to split it to 2 for any reason". Measured at 1680,
1280 and 375, every heading is one line today, the widest being "Kombucha on
Tap" at 211px in a 311px phone container.

**/cafe has one way into the menu, a band above the Visit the cafe band.**
`components/layout/cafe-page/cafe-menu-band.tsx`, chosen by Frank on
2026-10-18 from three drafts: dark green filling sage on hover, the whole
section a single link because he asked for "the entire section being a
clickable button". White on sage is the house hover, the same as the bar under
the Program Timeline, and the resting state is the high contrast one.

**It replaced both of the other menu calls to action.** The "What we're
serving today" card is deleted, and the PDF download button with it. The band
reads that card's own Studio fields, `cafePage.menuDownloadSection.headline`
and `.description`, so the copy stayed editable and no new field was needed.
The PDF itself is untouched in Sanity and is now linked from nowhere.

**The jars section is not called Desserts.** That was the first name and he
rejected it: "this gives the impression unhealthy. These are protein packed, so
should be able to eat for breakfast, lunch or dinner". The heading tells a
reader what meal the food is for, and these are not an after-dinner course. It
is **"Jars"**, which is what they literally are and carries no mealtime with
it. The cost is search: somebody looking for chia pudding finds the item, not
the heading.

**Three more changes the same day.** Cranberry kombucha came off and **Violet
Lemongrass** replaced it. Two muffins and a no-bake cheesecake went on, from
the recipe doc rather than the PDF, which carries none of the three: **Banana
Zucchini Protein Muffin** and **Double Dark Chocolate Protein Muffin** at 69g
and $6, and **No-Bake Cheesecake** in a 69g jar at $15. The prices are Frank's,
since neither source has one. Their ingredient lines are the recipes reduced to
a menu line with every allergen kept: walnut, egg, hemp and oats in the
muffins, cashew in the cheesecake.
```bash
node scripts/apply-cafe-menu.js           # dry run, prints the whole menu
node scripts/apply-cafe-menu.js --apply
```

The script checks the copy against the content rules before it will write, and
against the audits' own title and description limits, so a failure shows up
before the mutation rather than after the build. Applied in transaction
`b293KmNbo0z5K9Rnfg9Yi3`, after
`sanity-backup-2026-10-18-before-cafe-menu-documents.tar.gz`.

**`audit-seo-complete.js` passes 9 of 9 with the page in.**

#### Frank's pass, 2026-10-18

**The first two paragraphs of the intro are his**, and they are one paragraph
of his split at his own sentence break: the first becomes the hero's standing
line, the second the band. At 250 characters the whole thing ran to four lines
over the photograph. Not a word is altered. The third paragraph is the
allergen line and is mine.

**The draft his replaced opened on "cooked without industrial seed oils and
sweetened with maple syrup, honey or dates rather than refined sugar".** That
claim is off the page because he took it out, not by oversight. Do not put it
back without asking him.

The standing note is his too: "vessel" rather than "mug", and food as well as
beverages. It is **two lines**, as he wrote them, because they are two
separate offers rather than one sentence, and it is pulled up against the
intro band with a negative margin. SectionIntro ends on `py-24`, so the note
sat 96px clear of the paragraph it belongs with and read as a section of its
own.

**"Bars are $13 for 3"** is a section note on Energy Bars, which also becomes
that MenuSection's `description` in the markup.

**The /cafe block no longer says "Save or share the menu in one tap"**, which
was written when downloading the file was all that block did. The script
matches that sentence rather than replacing the paragraph, so an editor
rewording the rest in the Studio is not silently reverted by the next run.

**Prices print whole numbers without decimals**, "as everything is whole
numbers for that reason". Only the $4.50 bars show cents. `menuPrice` in
`lib/structured-data.tsx` is exported for this, because the page and the
`Offer` in the markup both need it and two copies of the rule would eventually
disagree with each other.

**Ingredient lines stop at three quarters of the measure**, from the `sm`
breakpoint up. At full width a long one ran under the price column and the two
read as one paragraph. Not on a phone: there is no price column to clear at
375px, and three quarters of 311px took the immunity latte to five lines.

**Two columns from `xl`, which he asked for so a wide window scrolls less.**
This is not the layout he rejected twice on the prose band. There, balancing
the columns meant cutting a sentence across the gutter; a menu section is a
discrete block that moves whole or not at all.

**The menu's own order is the constraint, and balance is optimised inside
it.** Frank, 2026-10-18: "Please preserve all drinks first then food, like
how the original pdf had it." So the list is cut once, and reading down the
left column and then down the right gives the menu in its own order. Of the
cuts that leave the left column at least as tall as the right, it takes the
closest to even, which is the first cut putting half or more of the height on
the left.

**That cut lands exactly on the drinks and food line**, six drink sections
left at 2090px and four food sections right at 1520px. 570px apart, which is
what the section heights allow: cutting one earlier gets within 344px and puts
the right column ahead, which breaks the other rule.

**A version in between chose a column per section rather than a cut point.**
That opens 2^n arrangements and balanced the two to 16px. It also scattered
the menu, putting Energy Bars at the foot of the drinks column and Kombucha at
the head of the food one, and that is what he rejected. Worth recording that
**near-perfect balance is what produced the scatter**: balance was never the
point on its own. Do not reintroduce it.
**A grid of two cells, not of ten.** Ten cells lays the sections out in rows
and makes every row as tall as its tallest section, which leaves holes.

The heights it estimates were read off the rendered page rather than guessed.
They only have to rank sections against each other, so one out by a few pixels
cannot change the answer; one out by half its height could.
**A section note sits on the heading row, right aligned and italic.** Italic
so an add-on does not read as an item you order on its own, "add on should be
in italics and not look like an actual item", and right aligned because "$13
for 3" belongs in the price column: it "should be on the right (right
aligned), where all the prices are lined up already". Measured, the note and
the prices below it both end at 1501px. It wraps below the heading and returns
to the left on a phone, where a right-aligned sentence on its own line reads
as a mistake. The note is that MenuSection's `description` in the markup.

**Three more changes the same day.** Cranberry kombucha came off and **Violet
Lemongrass** replaced it. Two muffins and a no-bake cheesecake went on, from
the recipe doc rather than the PDF, which carries none of the three: **Banana
Zucchini Protein Muffin** and **Double Dark Chocolate Protein Muffin** at 69g
and $6, and **No-Bake Cheesecake** in a 69g jar at $15. The prices are Frank's,
since neither source has one. Their ingredient lines are the recipes reduced to
a menu line with every allergen kept: walnut, egg, hemp and oats in the
muffins, cashew in the cheesecake.
```bash
node scripts/apply-cafe-menu.js           # dry run, prints the whole menu
node scripts/apply-cafe-menu.js --apply
```

The script checks the copy against the content rules before it will write, and
against the audits' own title and description limits, so a failure shows up
before the mutation rather than after the build. Applied in transaction
`b293KmNbo0z5K9Rnfg9Yi3`, after
`sanity-backup-2026-10-18-before-cafe-menu-documents.tar.gz`.

**`audit-seo-complete.js` passes 9 of 9 with the page in.**

#### Frank's pass, 2026-10-18

**The first two paragraphs of the intro are his**, and they are one paragraph
of his split at his own sentence break: the first becomes the hero's standing
line, the second the band. At 250 characters the whole thing ran to four lines
over the photograph. Not a word is altered. The third paragraph is the
allergen line and is mine.

**The draft his replaced opened on "cooked without industrial seed oils and
sweetened with maple syrup, honey or dates rather than refined sugar".** That
claim is off the page because he took it out, not by oversight. Do not put it
back without asking him.

The standing note is his too: "vessel" rather than "mug", and food as well as
beverages. It is **two lines**, as he wrote them, because they are two
separate offers rather than one sentence, and it is pulled up against the
intro band with a negative margin. SectionIntro ends on `py-24`, so the note
sat 96px clear of the paragraph it belongs with and read as a section of its
own.

**"Bars are $13 for 3"** is a section note on Energy Bars, which also becomes
that MenuSection's `description` in the markup.

**The /cafe block no longer says "Save or share the menu in one tap"**, which
was written when downloading the file was all that block did. The script
matches that sentence rather than replacing the paragraph, so an editor
rewording the rest in the Studio is not silently reverted by the next run.

**Prices print whole numbers without decimals**, "as everything is whole
numbers for that reason". Only the $4.50 bars show cents. `menuPrice` in
`lib/structured-data.tsx` is exported for this, because the page and the
`Offer` in the markup both need it and two copies of the rule would eventually
disagree with each other.

**Ingredient lines stop at three quarters of the measure**, from the `sm`
breakpoint up. At full width a long one ran under the price column and the two
read as one paragraph. Not on a phone: there is no price column to clear at
375px, and three quarters of 311px took the immunity latte to five lines.

**Two columns from `xl`, which he asked for so a wide window scrolls less.**
This is not the layout he rejected twice on the prose band. There, balancing
the columns meant cutting a sentence across the gutter; a menu section is a
discrete block that moves whole or not at all.

**The longer column is always the left one, by his rule on 2026-10-18.** CSS
`columns-2` decides that for itself and had put Smoothies, the tallest
section, on the right, leaving the right 512px longer. No CSS property says
"lean left", so `splitIntoColumns` in the page makes the decision and the
columns are real elements in a two cell grid.

The rule it uses: walk the sections in order, fill the left until it holds at
least half the total height, everything after goes right. The running total
only grows, so the first split past half is both the one that leans left and
the closest to even of the splits that do. Measured at 1680 after: six
sections left at 2066px against four right at 1480px.

**A grid of two cells, not of ten.** Ten cells lays the sections out in rows
and makes every row as tall as its tallest section, which leaves holes.

The heights `splitIntoColumns` estimates were read off the rendered page
rather than guessed. They only have to rank sections against each other, so a
section out by a few pixels cannot move the split; one out by half its height
could.

**`apply-cafe-menu.js` refuses text carrying Cf characters.** His menu copy
arrived with them, which is the CH-020 contamination route exactly: a paste out
of a rich text source into a field. `audit-unicode.js` runs after the write;
this runs before it. Everything he sent was retyped by hand, and the audit
reports 0 Cf in the dataset.

#### The menu page follows /cafe, not /services. 2026-10-18

**The photograph carries no text and the title sits under it.** Frank asked
for the title "below the hero image for more visibility and to make it
congruent with all the other sibling pages". This page's sibling is /cafe,
which does exactly that: a full bleed photograph, then the heading on white.

It used `SectionHero` before, which lays the h1 over the picture. That is
right for /services, /products and /about, where the second menu sits directly
under the band, and the cafe does not use that pattern.

**The heading and the opening prose run the full container width**, not capped
at the left column: "have it extend all the way across in width and not just
align to the left column." The item lists below keep their measure, because
the price column needs an edge to sit against. Measured at 1440: the heading
spans 45 to 1381, which is the container.

#### Three new photographs on /cafe, 2026-10-18

Frank sent them to replace three section images: the matcha latte, the energy
bars in place of a bowl of energy balls that are not on the menu, and a better
chia pudding. `scripts/swap-cafe-photos.js`, transaction
`b293KmNbo0z5K9RnfhO8Th`, after
`sanity-backup-2026-10-18-before-cafe-photos-documents.tar.gz`.

**They are whole, and a crop in the Studio now does something.** A first run
uploaded them cropped to the slot, 1506x2000 down to 1506x1189, because
`object-cover` centre-crops and that cuts the matcha glass off. Frank asked
for the originals instead: "leave them whole on Sanity and I will go in and
crop it myself."

**That needed a code change to mean anything.** `AlternatingSections` took a
bare url out of the query, so the crop and hotspot an editor drags in the
Studio were never read. `CAFE_PAGE_QUERY` now projects the image object as
`source`, and the component runs it through `urlForSectionImage`, so the
Studio's crop decides the frame. Without it, cropping there would have been a
silent no-op, the same class of trap as the blog alt in CH-028.

`source` is optional on the component's type and only the cafe query provides
it, so the other six callers are untouched and still centre-crop as before.
Until a crop is set, Sanity centres it, which is what the browser did.
**The Drive link he first sent could not be used**, and the reason is worth
knowing before anyone tries again: it was the top-level Curate Drive folder,
hundreds of files with phone-camera names, and the cafe shoot in it is **HEIF**,
which the Drive connector cannot open. It reads JPEG, PNG and PDF. Ask for the
images in chat.

**A fourth photograph came with them**, two tall textured glasses of iced
drinks under a pothos leaf, and it has no slot. Still his to place.

#### The outline button variant is dark on dark

Found here, worth knowing anywhere a second button is wanted. `components/ui/button.tsx`
gives `outline` `bg-background` and **no text colour**, and `--background` in
this theme is the dark green, so it paints a dark green box and lets the label
inherit the dark green around it. Measured: both `rgb(39, 52, 24)`. It renders
as a filled rectangle with nothing in it, and it looks correct in the source.

The PDF button spells its colours out rather than relying on the variant. Fixed
at the call site on purpose: the variant is shared, and repainting it would
change buttons on pages this ticket has not looked at.

**Still Frank's.** The block's description on `/cafe` reads "Save or share the
menu in one tap", written when the PDF was the only thing there. It is Studio
copy on `cafePage.menuDownloadSection.description`.

### CH-109 Eglinton Crosstown landing page

The LRT is open. Curate sits between Cedarvale and Forest Hill stations. Queries like "clinic near Forest Hill station" have almost no competition.

One page covering transit access, walking directions from both stations, and which services are available. The agency handles outreach to transit-adjacent businesses.

**Closed 2026-09-17, not built.** Frank asked whether a separate page would help more than the contact page; the evidence says no. Searches like "clinic near Forest Hill station" are answered from the Google Business Profile, a second copy of the contact page's directions adds nothing, and a page that exists to catch one phrase edges toward Google's doorway rules. The one real gap was that neither station was named anywhere on the site.

Folded into the contact page instead. `contactPage.howToGetHere` was rewritten in transaction `BDYd0dwqXI5F7Jzh2bQGWY`, after a documents-only backup, `sanity-backup-2026-09-17-before-contact-directions-documents.tar.gz`. It names Cedarvale and Forest Hill stations with walking directions from each, drops "Eglinton West Station", the old name, and the 32 bus, cut back to Mount Dennis when Line 5 opened on 2026-02-08, and loses an em dash. Frank approved the text, and the opening line about Lines 1 and 5 is his, lightly edited.

---

## Phase 5: cleanup

| ID     | Task                                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CH-110 | **Done 2026-09-13.** `lang="en-CA"` in `app/layout.tsx` |
| CH-111 | **Reversed 2026-10-13, and it is not coming back.** The visible "Last reviewed" line ran on treatment and blog pages from 2026-09-13; Frank had it off every page: "make a rule that this update stamp should never appear." `components/shared/last-updated.tsx` is deleted, both call sites with it. The case for it was that a reader judging health content wants to know how old it is; against it, `_updatedAt` moves on a typo fix, so the line dated the document rather than any review, and on a page nobody had touched in months it advertised that. `dateModified` stays in the `BlogPosting` markup, see the content rule above |
| CH-112 | **Done 2026-09-13.** Search form, six hub links, `noindex`, still a real 404. Deliberately not a redirect home: a soft 404 teaches a crawler a dead URL is a live page |
| CH-113 | **Done 2026-09-13.** `book_now`, `call_click`, `email_click`, `directions_click` and `file_download`, from one delegated listener in `components/shared/analytics-events.tsx`. See below |
| CH-114 | **Built 2026-09-18.** IndexNow submission on publish. Bing's index is what ChatGPT search runs on. See below                                                        |
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

### CH-117 Retire the orphaned image assets. Closed 2026-10-13, not deferred

**Frank's decision: the unreferenced images stay, as a library to draw on.**
"I'm okay with leaving all the unreferenced photos as the library for if we need
it later." **Do not raise this again**, and do not treat an unreferenced asset
as a defect: the B Corp section photograph was built from one.

**His question was whether this was about space, and it was not.** The note
below already said so and it is worth stating plainly: the 807 MB is not a
constraint anybody has hit, and nothing about it reaches a visitor. The only
real cost was the Studio's media library, where dead images sit between the live
ones, and he has judged that cheaper than losing the archive. The three
verification gaps below are moot.

**CH-029 is a separate thing and still stands.** Downsampling oversized assets
is about what gets served, not what is stored. It is low value since CH-007
added `sizes`, so Next serves resized variants and the source dimensions mostly
do not reach anybody, but it is not the same decision.

The record of what was found, kept because it is the only survey of this
library:

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

### CH-114 IndexNow

**Built 2026-09-18.** A publish in the Studio now tells Bing which pages changed, so it fetches them again within minutes instead of on its own schedule. Bing's index is the one ChatGPT search and Copilot answer from. Google does not take part in IndexNow and is unaffected.

It rides on the Sanity webhook from CH-026, `app/api/revalidate`. After the search purge, which is unchanged and still unconditional, the route reads the published document by id, works out its pages with `pathsForDocument` in `lib/indexnow.ts`, refreshes them, and submits them. A treatment gives its own page and its category's; a post, its page and `/blog`; a practitioner, their page and the team page.

**The refresh comes first, on purpose.** Pages rebuild at most once a minute, and the first request after that minute is still served the old copy while the new one renders. On a quiet page that first request could be Bing, arriving because of the notice. `revalidatePath` purges the page outright instead. Checked on a local build: after a signed delivery for the contact page, the next request was a fresh render, while `/cafe`, not published, came back stale.

**Routed by document type, unlike the search purge**, because an address cannot be announced without knowing it. A new page type needs a line in `pathsForDocument`. Missing one costs an unannounced change and the usual minute of delay, not missing content. Types with no page of their own, the site settings above all, announce nothing: they change every page at once, and IndexNow asks sites not to resubmit everything for that. A deleted document can no longer be read to find its address, so it is skipped too.

**Production only.** Local runs and `scripts/test-revalidate-endpoint.js` refresh pages and log `reason=not-production`. The replay window described under CH-026 now also resubmits the same addresses, which is harmless; IndexNow may answer 429.

**The key is public by design.** `public/4a160620565829dc8bb7833ab29d32cb.txt`, matching `INDEXNOW_KEY` in `lib/indexnow.ts`. IndexNow reads it back from the site before accepting a submission, and a submission can only name this site's pages. To change it, add the new file and change the constant in one commit, then remove the old file.

```
[indexnow] ok, status=200 paths=/blog/some-post,/blog doc=post/abc
[indexnow] skipped, reason=no-page-for-type doc=siteSettings/731d...
[indexnow] refused, status=403 ...     the key file did not match
```

**Once after merge, and after any code change that alters many pages:**

```bash
node scripts/indexnow-submit.js           # dry run: checks the live key file, lists the sitemap
node scripts/indexnow-submit.js --apply   # sends every sitemap page
```

The dry run refuses while the key file is not live, so it cannot be sent before the deploy lands. 200 and 202 are both success; 202 means the key is still being checked, normal at first.

### The Studio's crop tool, made to work on the site. 2026-10-18

Frank asked to be able to crop any photograph himself, "without changing how
any of the current photos are cropped".

**Almost every photograph here was a bare asset url in a box with**
**`object-cover`**, so the browser centre-cropped it and the crop and hotspot
an editor dragged in the Studio were thrown away. 308 image objects in the
dataset, 28 carrying a crop and 29 a hotspot, nearly all of them ignored.

**The promise is kept by doing nothing when there is nothing to do.**
`framedImageUrl` in `sanity/lib/image.ts` returns undefined unless a crop or a
hotspot is stored, and `components/shared/sanity-image.tsx` then serves the
same bare url as before, byte for byte. The feature is dormant until somebody
drags a frame, and live the moment they do. That is what lets it go on every
photograph at once.

**Wired so far**: `AlternatingSections`, which covers the section photographs
on /cafe, /about/our-story, /about/mission-and-values, /about/sustainability,
the blog posts, the treatment pages and the lifestyle program; `SectionHero`,
which covers /services, /products and /about; and the /cafe/menu hero. The
GROQ plumbing is on 43 projections, so the remaining call sites are a
`<SanityImage>` swap each, not a query change.

**Half the image fields had no crop tool in the Studio at all**, which is the
other half of this and was found when Frank went looking for it: "I don't see
the option to go in and crop images". Sanity only draws the crop and hotspot
editor when the field says `options: { hotspot: true }`, and 35 image fields
across 12 schemas never had it, `cafePage` among them. So there was no way to
crop those photographs whatever the front end did with the result. Added
everywhere.

**It does not touch `schema.json` or the generated types.** `hotspot` is a
Studio option rather than part of the content shape, so `sanity schema
extract` records nothing and regenerating only churns the type unions. The
run after this one moved 5,537 lines with a net change of zero; both generated
files were restored from HEAD.

**`scripts/audit-image-framing.js` is the proof.** It records every image url
on every page in the sitemap, and compares. Take the baseline before the
change, with `--save`, from a build that does not have it.

```bash
node scripts/audit-image-framing.js http://localhost:3000 --save
node scripts/audit-image-framing.js http://localhost:3000
```

**Its first version passed blind and that is the trap to know.** Every image
here is served as `/_next/image?url=<the real one>`, and it compared the outer
path, so all 387 images normalised to the string `/_next/image` and the check
reported no change while a photograph had in fact moved. It unwraps the
optimiser now.

**Ten urls changed on two pages, and both are understood.**

- **/about's hero reframes by 1.5%, and Frank kept it.** Somebody had already
  set a hotspot on it in the Studio and the site was ignoring it. Turning the
  tool on makes their choice count: the crop starts at y 761 of 3073 rather
  than the 715 a plain centre crop gives, 46px down. He said "use the hotspot"
  on 2026-10-18, so this stands.
- **/about/our-story's four section photographs lost a `rect` and look
  identical.** They were being cropped by Sanity to 1408x1112, a ratio of
  1.266, and are now the plain url in a 704x556 box, a ratio of 1.266. Same
  framing, different delivery, and the same path every other page takes.

**The band is olive green filling platinum**, Frank's colours on 2026-10-18,
replacing the sage hover it shipped with. Platinum is #DBDED9, pale enough
that the white text would vanish on it, so the heading and the line under it
turn dark green on hover: the same pair as the resting state, the other way
round.

**The cafe's hours block reads as two headings.** "Hours" was `text-lg
font-medium` beside a `text-3xl font-light` "Visit the cafe", so it read as a
label rather than its pair. Same size and weight now, and the days of the week
are no longer bold.

**The three cafe photographs are stored whole**, 1506x2000 with no crop and no
hotspot, so Frank can frame them in the Studio himself. Until he does, the
browser centre-crops as it always has.

### One hover on every link, and the About menu on its children. 2026-10-18

**The sweep from the /services menu is now every underlined link on the
site.** The hairline is drawn at full width, scaled to nothing from the right,
and on hover the origin flips so it grows in from the left over half a
second. Frank asked for it everywhere "to stay consistent", naming the footer
Services and About and the Learn More on Our Team.

`lib/hover-underline.ts` holds the one copy. It was already duplicated between
`section-navigation.tsx` and `our-programs-navigation.tsx`. 49 plain
`hover:underline` links across 18 files were converted.

**`after:bg-current`, not a colour.** The line takes the text colour, which is
what lets the footer use it: those links are white on the dark green, where
the old `after:bg-primary` would have drawn dark green on dark green.

**`GROUP_HOVER_UNDERLINE` is the card variant**, for a title that reacts to
its whole card rather than to itself. Those call sites used
`group-hover:underline` before.

**`components/ui/*` is left alone.** Those are shadcn primitives behind
buttons and accordions all over the site; the ask was about links.

#### Moving a class string into lib silently deletes it

**Tailwind only scanned `pages`, `components`, `app` and `src`.** Putting the
sweep in `lib/hover-underline.ts` meant Tailwind never saw those class names
and emitted no rules for them, so the class sat on every element and did
nothing. It killed the hover on the services menu it came from, not only on
the new ones.

`./lib/**/*.{ts,tsx}` is in the content globs now. **The symptom to recognise
is `content: none` on the `::after`**, with the class present in the markup:
that is a rule Tailwind never generated, not a rule that lost. Check it the
same way, by reading the computed `::after` rather than by eye, because a
hover that does nothing looks like a hover you have not triggered.

#### The About children carry the section menu

/about had the band and its five children did not, while every page under
/services carries the services one. `components/layout/about-pages/about-navigation.tsx`
is on all six now.

**It fetches its own list**, unlike `ServicesNavigation`, which takes one as a
prop. Every services page already had the list to hand; a child About page's
query knows nothing about its siblings, and threading one through five routes
costs more than six fetches of a six item list on statically rendered pages.

On Our Team the band sits above the heading rather than under a photograph,
because that page has no hero image.

### Share cards

**Every page carries a share image, since 2026-09-18**, apart from `/about` and `/products`, which need a picture chosen in the Studio. Nine pages had none, all built this year: the six practitioner pages, `/blog`, `/about` and `/products`. A shared link to any of them showed a bare card.

- A practitioner page uses the person's photo unless a share image is set under SEO. With no hotspot set, the card centres a third of the way down, where a face sits in a portrait; centred, the band cut through Dr. Nhan's and Andrew's foreheads. A hotspot dragged in the Studio replaces this. Checked by eye on all six.
- A blog post uses its own photo, and `/blog` the newest post's. `/blog`'s search details live on "Home | Blog Section" in the Studio, under "SEO For The Blog Page", because the blog page has no document of its own. A description typed there also becomes the RSS feed's.
- `og:site_name`, `og:locale` and `og:type` were missing from every page but the homepage. Next replaces the layout's `openGraph` with the page's rather than merging them, so the layout's values never reached any page with metadata of its own. `buildPageMetadata` sets all three now, and blog posts are `article` with their published and modified dates.
- A query that selects an image's URL and not its asset id, the blog post query for one, still gets a 1200x630 card: the id is read back out of the URL.
- `twitter:site` is gone. It held the brand name, where X expects a handle, and Curate has no X account.

`scripts/audit-metadata.js` now fails a page with no `og:image`, one that does not load, or no `og:type`. Run against production before this change, it named all nine pages.

It still fails on four pages whose title and heading differ, `/about/our-story`, `/our-programs`, one blog post and Outdoor Yoga Therapy, and warns on two 158 character descriptions. All of that is content in Sanity, raised with Frank on 2026-09-18.

### Section pages: one hero, one second menu. The rule, set 2026-09-20

**Every section of the site looks the same at the top, and there is one component for each half.** Frank asked for the services pattern to be the template and for it to bind anything built later, after `/products` shipped with a different shape and the second menu had been written twice.

- `components/shared/section-hero.tsx`: a photograph the full width of the page, 400px tall and 550px from the medium breakpoint, dimmed to 60%, with the page's h1 over it at the bottom left inside the container and the standing line under it at 80 characters. Marked `priority`, `sizes="100vw"`.
- `components/shared/section-navigation.tsx`: the sage band directly under it. The section's own name first, then a divider, then the pages in it. The page's font, light weight, dark green. Container width, 2rem above and below, 1rem between items. On hover a hairline sweeps in under the word from the left over half a second, and stays drawn on the page you are on. One line that scrolls sideways on a phone, never wraps. Give the label an href when the section has a hub page, leave it off when it does not.

`ServicesNavigation` and `ProductsNavigation` are thin wrappers over the shared one, so their call sites did not change. The legal pages took the menu on the same day, with "Legal" as plain text because there is no `/legal` index. **Build the next section from these two, not from a copy.**


### Section pages: and a third component, the prose band. 2026-10-12

`components/shared/section-intro.tsx` is the band of prose between the second
menu and the card grid, plus `toParagraphs`, the blank-line split every intro
field uses. /about had it first; Frank asked for /services and /products to read
the same. **Three components now, not two. Build the next section from all
three.**

**The first paragraph is the hero's standing line, the rest is the band.** One
field holds a page's whole prose and the page splits it, so there is no second
field to drift and an editor writes in one place. On /services
`servicesHeroSection.subtitle` stays as the fallback when `intro` is empty,
which is what that page showed before.

**Two columns from the large breakpoint, and the reason is the bug it fixed.**
The band was `container max-w-[70ch]`. `container` is configured `center: true`,
so the 70ch box was centred in the viewport while the grid below it spanned the
whole container: the text floated in the middle with the photographs sticking
out either side. Dropping the cap alone lines the edges up and gives a 165
character line, so the band fills the container and splits in two. Measured at
1600px: text 125 to 1461, grid 125 to 1460.

Multi-column rather than a two-column grid, because this is continuous prose and
should read down one column then down the next. `break-inside-avoid` keeps a
paragraph whole. A single paragraph stays one column: it cannot be balanced
across two without being split, and one short paragraph alone in the left half
would look like the bug above.

**The copy.** /services is Frank's own, corrected for grammar and tone; every
change is listed in the pull request. /products is a draft he approved the same
day. `scripts/apply-section-intros.js` writes both and checks them against the
content rules before it will.

**It applies in two phases, one deploy apart**, and refuses to run them
together. `--phase=1` writes `servicesHeroSection.intro`, a field the deployed
code does not read, so the live site is unchanged. `--phase=2` writes
`productsPage.intro` **after** the merge deploys: that field is already live and
is read whole as the hero's standing line, so writing 123 words into it under
the old code would spill three paragraphs over a 400px hero on a public page.

```bash
node scripts/apply-section-intros.js --apply --phase=1   # before the merge
#   merge, let it deploy
node scripts/apply-section-intros.js --apply --phase=2   # after
```

**The blog byline portrait is grayscale until the row is hovered**, which is
what every other photograph of a practitioner does, on the team page and in the
hub grids. The house mark is not: it is painted flat white already, so grayscale
on it is a no-op and a hover that changes nothing reads as broken. `group` moved
from the link to the row so an unlinked byline still colours its portrait, and
the name is underlined on hover only when the row is a link.


**`/products` was rebuilt to match**, which is what started this: it opened on a bare white band while every other section opened on a photograph. It now carries the hero, then the products menu, then the same grid the services page uses. `productsPage.heroImage` holds the photograph, with its own alt text, and the page still renders the old heading block if that field is ever empty.

The photograph is a placeholder chosen from the library on 2026-09-20: a practitioner's hands supporting a patient's knee during an assessment. **Nothing in the library shows a product being fitted**, which is what Frank wanted; the five product banners are the closest and all five are already used on their own pages. Replace it in the Studio when there is a photograph of a real fitting.

### The copy and SEO review with Frank, open since 2026-09-19

**Every rewrite is approved one at a time, on a page built for it:** https://claude.ai/artifact/XSbS6Zx9ibbzNzL3o1rdzR. 102 items, each showing the live text beside the proposal, with approve, edit and keep. Frank's choices are saved in the page's own store, at `decisions/<itemId>`, and read back with the ArtifactData tool. Nothing is written to Sanity until he has decided, and the live text is checked against each item's "before" at write time.

What is in it: the two decisions below, the search and share details still missing (`/about`, `/products`, `/blog`, Safa, the cafe description), photo descriptions, 79 page copy fixes, and five lines written into the code.

**Two decisions are load-bearing:**

- **The seventeen unsigned first-person quotes stay. Settled by Frank on
  2026-10-11, and he asked not to be asked again.** They are on seventeen
  service pages, such as "With chiropractic care, I discovered the power of
  alignment". They had been raised here as invented testimonials and as a
  college advertising risk. Frank's ruling: they are not presented as real
  testimonials, they set the mood of the service, and no college rule is
  engaged. **Do not reopen this, and do not report them as a defect.**

  One consequence worth knowing. Because they are mood copy rather than
  somebody's words, editing them is ordinary copy editing. That is how the
  last banned phrase was cleared: the breathwork quote read "Harnessing the
  power of my breath" and now reads "Working with my breath". Had they been
  real quotes, rewording would have been worse than leaving the break.
- **The Curate Lifestyle Program page is switched off in the Studio** and has been since January, but its route never checks `isActive`, so the page is live and linked. Either the switch is wrong or the page is. Until Frank says, it stays out of IndexNow submissions.

Three more things that came out of the same sweep and are waiting on him: the "FDA Approved" claim on Flowpresso is still live, CH-023; `/our-programs` offers to "submit claims on your behalf", which is direct billing and out of scope; and the Curate Lifestyle FAQ quotes "Over 80% of participants" with no source, which needs Dr. Leong.

**Practitioner SEO fields are written, five of six.** Titles, descriptions, share titles, share descriptions, and both share images, the person's own photo with the hotspot the code used. Transaction `Mtij2FIbO1I0nUyGx00e79`, after `sanity-backup-2026-09-19-before-practitioner-seo-documents.tar.gz`. Dr. Nhan's is held: the description he wrote is 174 characters and the Studio's own limit is 160.

**Corrected 2026-10-12. His `seo` fields are empty, all of them**, and the
174 character draft is not recorded anywhere, so it cannot be trimmed, only
rewritten. His page runs on the code fallback, "Dr. Frank Nhan, Doctor of
Chiropractic at Curate Health in Midtown Toronto.", 75 characters. That
passes the audit and is thin. Safa Karoumi's `pageDescription` is empty too.
The other five follow one shape: *{Name} is a {role} at Curate Health in
Midtown Toronto. Book a {service} appointment with {first name} online.*

**IndexNow was seeded on 2026-09-19**, 51 addresses, answered 202. Safa's switched-off page went in deliberately, so Bing learns it is gone; Frank asked for Google's temporary removal in Search Console the same day.

**The banned-word checks miss inflections.** `audit-content-rules.js` and `audit-metadata.js` match "elevate" but not "elevating". Match the stem when this is next touched.

### Curate Lifestyle moved under /our-programs, 2026-09-19

**Frank's call: it is a programme, not a service.** `/services/curate-lifestyle` and `/services/curate-lifestyle-program` are now `/our-programs/curate-lifestyle` and `/our-programs/curate-lifestyle-program`, with 301s from both old addresses, which were live and indexed. The routes moved with them, into `app/our-programs/`, where the hub's own layout already wraps them.

**Under the hub, not a new /programs section**, corrected by Frank on 2026-09-20 before any of it went live. The first version put them at `/programs/*` with `/programs` redirecting to the hub, which left the children hanging off an address that was not a page. Now the URL says what the structure is: `/our-programs` lists the three programmes and these are two of its children.

Every link was repointed in the same change: the navigation's Programs list, the Curate Lifestyle card on `/our-programs`, the bar at the foot of the timeline, and Dr. Leong's booking CTA. The sitemap, llms.txt and `pathsForDocument` in `lib/indexnow.ts` carry the new addresses. Submit both old and new to IndexNow after the deploy, since the old ones are what Bing holds.

**No breadcrumb trail on either page, by Frank's decision the same day.** He asked for the trail to come off: each page already shows the section navigation under the header, and he reads that as the menu. They carry no `BreadcrumbList` either, because markup is supposed to describe what the page shows. `scripts/audit-breadcrumbs.js` holds both paths in `NO_TRAIL`, so they are checked for the absence rather than failing the rule. Do not add a trail back without asking him. Every other page below a hub still carries one, CH-009.

**The bar under the Program Timeline was invisible, and it is a pattern worth recognising.** `components/shared/hover-link-variation.tsx` put `w-full bg-platinum` on a `next/link`, which renders an inline `<a>`: neither the width nor the background applies to an inline box, so the band painted nothing and the body's own dark green showed through, under dark text. It reads as an empty dark strip on a screenshot and as a working link in the source. The anchor is a block now and carries the colours Frank picked on 2026-09-20: `bg-platinum`, which is #DBDED9, with `text-primary` for the text and for the line above it. Hovering still fills it sage and turns the text white. `components/shared/hover-link.tsx` has the same inline anchor but no background of its own, so nothing shows; leave it unless it grows one.

### The every-page rule, first run 2026-09-18

`node scripts/audit-seo-complete.js` runs nine checks: metadata, llms.txt, breadcrumbs, reachability, alt text, image sizes, practitioner pages, the blog, and the content rules in the words on each page. The last is new, `scripts/audit-content-rules.js`, because no other check read the body of a page.

**Brought up to the rule on the first run:** the two Curate Lifestyle pages, which joined the sitemap that day and so had never been checked. Both gained a breadcrumb trail, the program's through Curate Lifestyle, and a `Service` node from `buildLifestyleJsonLd`. The program page had two h1s; "Group Sessions" is an h2 now, with the same look. Its eight session pictures and the line drawing behind the pillars quote were looked at and listed as decorative in `audit-alt-text.js`. Images without alt text now render `alt=""` rather than no attribute.

**Still failing at merge, all content waiting on Frank:**

- Two photos on Curate Lifestyle need alt text: the almonds hero and the granola bowls with eucalyptus.
- `/about` and `/products` need a share image chosen.
- Four titles that differ from their headings, and two 158 character descriptions, listed under Share cards.
- Three descriptions too short to be used, which `audit-metadata.js` now warns on below 70 characters: the Curate Lifestyle Program's reads "Curate Lifestyle Program", `/cafe`'s "A space where nourishment meets intention.", and Rooj's page runs on the code fallback until the practitioner descriptions are approved.
- **The content rules: was 88 breaks on 27 of 51 pages, now 1. See the dash sweep below.** Dashes, banned words such as "unlock", "elevate" and "transformative", "complimentary" for a Flowpresso session on `/our-programs`, and two exclamation marks. Nearly all of it is body copy from 2024, written before the rules. Every fix is a copy change for Frank to approve, and a practitioner's where it touches a health claim, so it wants its own pass, page by page.

### /about's share card is its own hero, 2026-10-12

The last page on the site with no `og:image` has one, and it is the cork yoga
mats photograph the hero already shows. Frank asked for the two to match.

**It was done by clearing a field, not setting one.** `seo.socialMeta.ogImage`
held a different picture, the logo in cork lettering on the wall above the
waiting area, with its own crop and hotspot, and `twitterImage` held the same.
Emptying both makes the page fall through to `buildPageMetadata`'s `image`
option, which `app/about/page.tsx` now passes the hero, so the two cannot
disagree again. Pointing the field at the hero asset instead would have worked
today and drifted the moment somebody changed the hero without remembering this
field. That is the every-page rule: default the share image to a photo the page
already shows.

`scripts/align-about-share-image.js` prints the old asset, alt, crop and hotspot
before it unsets them, so they can be put back by hand. Transaction
`UAIn8zgTVuj4HCTBS3hHfB`, after
`sanity-backup-2026-10-12-before-about-share-image-documents.tar.gz`. The share
title and description are Frank's and were left alone.

**The hero's alt now reaches the card.** Both /about and /products passed only
`{asset: {url}}`, so `imageEntry` fell back to the page title for
`og:image:alt`. They pass the alt too, and the cards read "The Curate Health
logo embossed into cork yoga mats, lit from the side." and "A practitioner's
hands supporting a patient's knee during an assessment".

**`audit-seo-complete.js` passes 9 of 9 for the first time**, from 3 failures on
2026-09-18.


### The medication FAQ, softened 2026-10-12

"Can this help me reduce medications?" on /our-programs/curate-lifestyle used to
answer "Absolutely. Over 80% of participants see improvements in blood pressure,
glucose levels, cholesterol, or fatty liver biomarkers, often allowing them to
reduce or eliminate medications under medical supervision."

Two rule breaks in one sentence: a statistic with no source, which the content
rules forbid outright, and a guarantee about a clinical outcome on the page that
sells the programme.

Frank wrote the replacement. It keeps the four biomarkers and the "under medical
supervision" qualifier, drops the number, and turns the guarantee into a
possibility:

> Many participants see improvements in blood pressure, glucose levels,
> cholesterol, or fatty liver biomarkers, which may allow them to reduce or
> eliminate medications under medical supervision.

**One word was taken out of his wording.** He wrote "Many participants often
see". "Many" and "often" are the same hedge twice, which reads as nervousness
rather than care.

`scripts/soften-outcome-claim.js`, transaction `PGYRglssrB1zyRdETTevCV`, after
`sanity-backup-2026-10-12-before-outcome-claim-documents.tar.gz`.

**It is still a clinical claim and it is Dr. Leong's**, since the programme is
his. Frank approved it as the owner and a practitioner. If Dr. Leong wants it
narrower, the field is `serviceLifestyle.faq[3]`.

### Flowpresso is FDA cleared, not FDA approved. Fixed 2026-10-12

The benefit subtitle on `/services/recovery-sanctuary/flowpresso-therapy` read
"Flowpresso® Therapy is FDA Approved cutting-edge technology that's been proven
to deliver effective, non-invasive treatment." **"Approved" was the wrong word,
and it is a specific wrong word rather than a style quibble.**

The FDA's pathways are not synonyms. **Approval** means premarket approval, PMA,
for high risk Class III devices. **Clearance** means a 510(k), a finding of
substantial equivalence to a device already on the market. The FDA treats "FDA
approved" on a cleared device as misbranding.

Flowpresso holds **510(k) clearance K223729**, granted to Medella Health
Limited, Class II, product codes IRP and IRT under 21 CFR 890.5650,
substantially equivalent to the Therm-X heat and compression device.
Flowpresso's own site calls it "an FDA-cleared Class II medical device". So the
page claimed a regulatory status the device does not hold. Frank confirmed the
correction on 2026-10-12.

Two other things went in the same sentence: "proven to deliver effective
treatment", an efficacy claim with nothing behind it, and "cutting-edge", which
is hype against the tone rule. It now reads:

> Flowpresso® Therapy is an FDA cleared Class II medical device, delivering
> non-invasive compression and heat therapy under a practitioner's supervision.

`scripts/fix-byline-logo-and-fda.js`, transaction `UAIn8zgTVuj4HCTBS47LjJ`. The
block's heading is still "State-of-the-Art Technology", which wants the same
look when somebody is next in there.

**The cleared indications are narrower than the page implies**: post traumatic
and post surgical conditions where localized thermal therapy is indicated, on
the order of a licensed professional. Worth knowing before anyone widens the
copy.


### The prose band is one column. Settled 2026-10-12, after two wrong answers

**Do not put `columns-2` back on `section-intro.tsx`**, balanced or otherwise.
The band went through both column layouts in one afternoon and Frank rejected
each, and the second rejection is the one that explains it.

_First_, two columns with `break-inside-avoid`, which keeps every paragraph
whole. Whole paragraphs are then the only unit the browser can move, so the
columns ended hundreds of pixels apart: /services packed three paragraphs left
and two right, /about one each, and /products, down to a single paragraph,
filled the left column and left the right one empty.

_Then_, `column-fill: balance`, which balanced to within one line on all three.
It did it by cutting a sentence across the gutter. /about ended its left column
on "rather than treating" and opened its right one on "it separately." Frank:
"this prose looks stupid, lets just get rid of the columns and keep it to a
single column so there's no breaks."

**Balanced columns and unbroken sentences are mutually exclusive**, and these
bands are five to eight lines, so every break lands mid-thought. Newspaper
columns work because they are tall. A measurement showing the columns even is
not evidence the layout reads well, which is what the second attempt got wrong:
the numbers were good and the page was worse.

The block is `mr-auto max-w-[70ch]` inside `container`. **The measure was never
the problem; the centring was.** `container` is configured `center: true`, so
its `mx-auto` floated a 70ch box in the middle of the viewport while the card
grid below spanned the full width. `mr-auto` pins it to the container's left
edge, which is where the first photograph in the grid starts: measured at
1600px, text left 125, grid left 125.

### The last two practitioner SEO sets, 2026-10-12

Dr. Nhan and Safa Karoumi were the two of seven with nothing filled in, both
running on the code fallback, "Dr. Frank Nhan, Doctor of Chiropractic at Curate
Health in Midtown Toronto.", 75 characters.

Dr. Nhan's was held in September because the description he wrote was 174
characters against the Studio's 160 limit. **That draft is recorded nowhere**,
so it could not be trimmed, only rewritten. Frank chose from three options:

> Dr. Frank Nhan is a chiropractor and acupuncture provider at Curate Health in
> Midtown Toronto, also a strength and conditioning specialist and yoga teacher.

It departs from the house pattern on purpose: he holds four credentials and the
pattern has room for one, so his names all four and gives up the call to action.

**His share fields were filled on 2026-10-13**, transaction
`PGYRglssrB1zyRdETWBABF`, which closes the last empty SEO field on any
practitioner: all eight now carry a page title, a description, a share title, a
share description and both share images.

**It changed nothing a visitor sees, and that was the point.** His page already
showed the right things because the code fills in for an empty record: the title
fell back to his name plus his first credential, and the share card to his
photograph cropped at y 0.3. The rendered crop is byte for byte what the stored
hotspot produces, `rect=0,80,3640,1911` before and after. What changed is that
the values are in the Studio, where an editor can see and change them.

`seo.pageTitle` went in alongside the share fields although only the share ones
were asked for. Storing a share title while leaving the page title computed
would let the two drift the moment anybody edited his credentials, and the house
shape is that `socialMeta.title` repeats `pageTitle`.

**Safa's is the complete set**, written at Frank's request while she is switched
off, "so when we turn it on, it's already there". Page title, description,
share title, share description and both share images. It changes nothing a
visitor sees, since her page is a 404 until the switch flips, and the Search
Console steps above still apply then.

The house shape, now confirmed across all six that have one: `socialMeta.title`
repeats `pageTitle`, `socialMeta.description` repeats `pageDescription`, and both
share images are the person's own photo with no crop and the hotspot
`{x: 0.5, y: 0.3, width: 1, height: 0.6}`. **The y of 0.3 is the load-bearing
part**: centred, a 1200x630 band through a portrait cuts the face in half.

**Her title and description say "Registered Psychotherapist", without
"(Qualifying)", by Frank's decision on 2026-10-12**: "we aren't pushing it yet
anyway, and by the time we do, she will be qualified." That also dissolves a
character problem, since CRPO's full "Registered Psychotherapist (Qualifying)"
is 53 against a 45 budget, "| Curate Health" costing 15 of the 60 Google shows.
Transaction `t0eFzHW6gbFrsnx0qyFban`.

**`credentials` on the record still reads "Registered Psychotherapist
(Qualifying)", deliberately.** That is the line the page itself prints and it is
accurate today. The two disagree, which is fine only while the page is a 404.
**Change the credential at the same moment the switch goes back on**, or the
page will show one designation and the search snippet another.

`scripts/apply-remaining-practitioner-seo.js` wrote the two descriptions,
transaction `UAIn8zgTVuj4HCTBS4qjIb`.
`scripts/finish-safa-seo-and-flowpresso-heading.js` wrote the rest,
`UAIn8zgTVuj4HCTBS4vNa9`, after
`sanity-backup-2026-10-12-before-safa-share-and-heading-documents.tar.gz`.

**The Flowpresso benefit heading went in the same transaction.**
"State-of-the-Art Technology" sat over the sentence corrected earlier that day
to "an FDA cleared Class II medical device", and it was wrong twice: hype
against the tone rule, the same category as the "cutting-edge" removed from the
sentence below it, and a claim of novelty over a body conceding equivalence,
since a 510(k) is a finding of substantial equivalence to a device already on
the market. Frank chose **"Medical-Grade Technology"**, hyphenated because it is
a compound modifier before a noun.


### og:image:alt never reads the alt anybody wrote. Found 2026-10-13

Every `og:image:alt` on the site is the page's share title rather than a
description of the picture. Checked across the practitioner pages: all of them.

**The alt is written in one place and read from another.** `SEO_QUERY` projects
`ogImage{ crop, hotspot, asset->{_id, url, alt} }`, so the `alt` it selects is
the one on the **asset document** in the media library. Every alt written for a
share card, by the September pass and since, is on the **image object**,
`ogImage.alt`, which the query never selects. `imageEntry` in
`lib/page-metadata.ts` then falls back to the title it was handed, which is why
the output always looks plausible and is never the sentence somebody wrote.

**This is a trap of the same shape as the blog alt in CH-028**, where
`GET_POST_BY_SLUG_QUERY` selected `image.alt` while the schema stored
`sectionImage.alt`. Check the path end to end before writing copy into a field.

**Fixed 2026-10-13.** `SEO_QUERY` selects `alt` at the image-object level on
both `ogImage` and `twitterImage`, `SeoImage` carries the field, and
`imageEntry` prefers it: `image?.alt?.trim() || image?.asset?.alt?.trim() ||
alt`. The asset-level alt is still read second, so a picture with its alt in the
media library rather than on the field keeps working.

Every share card now carries the sentence somebody wrote for it. Checked across
the practitioner pages, /about, /products and /blog: all of them were the page
title before, and none is now.

Regenerating the types added 38 lines, one `alt` per share image across the 19
queries that embed `SEO_QUERY`, and nothing else. `schema.json` did not change,
since the schema already had the field; only the projection was missing it.

### The blog byline mark is the white asset, 2026-10-12

Both author records pointed at `logo-black.png` and the byline painted it white
with `brightness-0 invert`. The rendered pixels were right, which is why every
check passed, and the record was still the black logo: anyone opening it in the
Studio saw a black mark on a document whose only job is the white one. Frank
spotted it.

`CurateHealth_logo_symbol_white.png` was already in the library, 1723x1726,
80.5% transparent, average opaque luminance 254.9, so genuinely white on
transparency rather than white on a white box. Both records point at it and the
filter is gone from `blog-author-byline.tsx`. **The two had to move together:**
the filter over a white mark renders it black.

**`npm run build` reuses Next's fetch cache, so a Sanity change can fail to
appear in a build run right after the mutation.** It happened here: the swap was
applied, the build ran seconds later, and `/blog` still served the old asset.
`rm -rf .next` before the build when verifying a content change, or the check
reports the state before the write.

**The byline avatar is client only, and that is Radix.** `Avatar` renders
`AvatarFallback` on the server and swaps in the image once it loads, so the
initials "CU" are what a crawler sees. It carries no text a crawler needs, so it
is not a breach of the every-page rule, but do not read the server HTML and
conclude the image is broken.


### Conditions go on the treatment page, not a page each. 2026-10-13

Frank, weighing whether to list what Pilates helps with: "I just don't want a
ton of pages for each condition. that same logic can apply to all conditions
for all professionals at the clinic, and we'll have hundreds of pages."

**He is right, and this is already the project's position**, so treat it as
settled rather than reopening it. "Standalone condition pages. Conditions will
be covered in blog posts instead" has been in the out-of-scope list from the
start. Four reasons it holds:

- A page that exists to catch one phrase and says little else is a doorway
  page by Google's own definition, which is the reasoning that closed CH-109.
- It is worse for AI answers, not better. Per the CH-101 evidence these systems
  read visible body text, so one substantial page that answers "who is this
  for" is extractable where twenty thin ones split the same text twenty ways.
- CH-010 got every page within three clicks of the homepage and
  `audit-orphans.js` proves it. Going from 51 URLs to several hundred breaks
  that, and the fix is more navigation nobody wants.
- Every one is a health claim needing practitioner sign-off, times hundreds.

**The exception**: a condition earns a page when there is a page's worth to say
and somebody qualified to say it. That is the blog, which is where CH-105 puts
it.

**And do not lead with the conditions either.** Frank's second note the same
day, on a draft meta description naming prenatal, postnatal and bone health:
"it's also not to say that she only specializes in these three things. Let's
not try to pigeonhole what the class is good for, as some people who don't have
these conditions may not want to come." So the general offer leads and the
particular areas follow, in the copy and in a practitioner's focus list.

### Claire Kim, and the Outdoor Pilates page. 2026-10-13

**Claire's record exists and is switched off**, so turning her on is one click.
`scripts/add-claire-and-revamp-outdoor-pilates.js`, transaction
`UAIn8zgTVuj4HCTBS54Bin`, after
`sanity-backup-2026-10-13-before-claire-and-outdoor-pilates-documents.tar.gz`.

**She is live, since 2026-10-13.** CH-030 is done: the `ourTeam.teamMembers`
entry is written and `isActive` is on, so her card, her page, her listing on
Outdoor Pilates, the sitemap, llms.txt and site search all carry her.
`scripts/switch-claire-on.js` does both halves in one transaction,
`UAIn8zgTVuj4HCTBS5RKw1`, **because they have to move together**: the hub reads
`ourTeam.teamMembers` and matches on name, so an entry without a matching
practitioner record, or a name that differs by a character, drops her from the
page and fails `audit-practitioners.js`.

She is eighth and last, beside Rooj, since the array runs the regulated
clinicians first and then the two teachers. Masonry lays the cards out column
first, so check the order by position on the page rather than by reading the
HTML.

**No Search Console step for her.** The warning on the "Show on website" switch
is about somebody taken off the site and removed from Google by hand, which is
Safa. Claire's page has never been live, so there was no removal to cancel.

Her photograph is a studio portrait Frank sent as a placeholder "until I get a
better one". The hub's query selects the asset URL only, no hotspot, so the card
crops centrally with `object-cover`; at 427x300 from her 1331x2000 that lands on
her face and the pose, checked by eye. Her own page and her share card use the
hotspot on the practitioner record.

**Her share hotspot is y 0.52, not the house 0.3.** The other six are standing
portraits with the face about a third down, which is what 0.3 is for. Hers is a
seated side stretch with her face at about 0.54, so 0.3 would band her shoulder.
The rule was always "put the band on the face"; 0.3 is what that meant for the
other six rather than a number to copy. Her source is 1331x2000, narrower than
both the 4:5 page crop and the 1200x630 share, so every crop takes the full
width and the horizontal hotspot does nothing.

**"Pilates Instructor", not "STOTT PILATES Instructor Trainer"**, by Frank's
decision: "some may not know what that is or may not look for that
specifically". The STOTT training stays in the bio, where it reads as
provenance rather than jargon.

`commonlyTreatsLabel` is "Class focus", as Rooj's is, because she is not a
regulated health professional. The list leads with what every class covers,
posture, core and mobility, and puts prenatal, postnatal, active aging and
osteoporosis after, per the pigeonholing note above.

**Her bio is verbatim as Frank sent it, including two rule-of-three lists**,
"precision, curiosity, and a deep respect" and "joyful, empowering, and
uniquely their own". A bio is a personal statement in that person's voice, so
it was flagged rather than silently edited. Edit it only if Claire wants it.

_The page._ It was entirely benefit language: nothing said how long a class
runs, how many people are in it, what happens when it rains, what to bring, or
who teaches it, which are the questions a search actually asks and the flat
facts an answer engine quotes. All of it is on the page now, Frank's facts
throughout: 50 minutes, up to 12, the pergola that closes, the move indoors to
the gym, workout clothes and layers, mats provided and your own welcome, and
the one-on-one sessions.

**Two sections with a photograph each, since 2026-10-13.** The practical copy
was crowded into the one existing section for a day, because
`AlternatingSections` renders `src={sectionImage?.image || ""}` and a section
with no photograph publishes a bare `<img>` with an empty source, the CH-028
defect, and the library had nothing usable: a watermarked stock beach and a
screenshot of a sauna. Frank then sent two photographs of a real class, so it
has its own section. The component staggers off the array index, so nothing had
to be written for that: measured at 1600px, the first photograph sits at 125 and
the second at 825.

**Both photographs were edited.** They are 1125x2000 portrait and the slot
paints 704x556 landscape, so both had to be cropped whatever else happened, to
1125x889. The warmup shot is backlit with the whole row in shadow and was lifted
with a gamma curve that fades out towards the highlights, so the sky and the lit
paving hold.

**The class shot is a third photograph, since 2026-10-13.** Frank sent a better
one after the first two: the whole group seated, mid side-reach with cork blocks,
the pergola overhead and the sauna cabin behind, and a mixed group rather than
the all-female bridge shot. Cropped from y=620 of 1125x2000. y=820 was the
alternative and loses the pergola entirely, which is the thing the copy on this
very page talks about, so the higher crop won. No retouching: his note was "no
cropping of shoes needed here since you can barely see any".

The two earlier class crops, the plain y=330 and the retouched y=700, are both
in the library referenced by nothing, so both are CH-117 candidates.

**A retouched version was built and thrown away, and the lesson is worth the
paragraph.** Frank asked for the framing to drop so more of the class shows, and
for the shoes to be painted out rather than cropped around. That was done: y=700,
nine participants, five patches of clean paving copied from elsewhere in the same
photograph through feathered masks. His verdict: "the photoshop class photo is
terrible without the shoes. revert back to what you had before."

He is right, and it is not obvious while you are doing it. Patching five holes in
a paving grid leaves five patches of repeated texture, and a slab pattern makes
the repetition visible even when every seam is feathered. **A crop that excludes
clutter beats a retouch that covers it.** Reach for the crop first.

Two things from the attempt that are still worth knowing, if a patch is ever the
only option. Take donors **straight down** from the target, not sideways: three
of the first five were sideways and all three were wrong, one sampling the blue
mat and coming back as a dark block. And check each pass by opening the saved
file rather than screenshotting the pane, which kept scrolling between calls.

The retouched asset is still in the library, referenced by nothing, so it is a
CH-117 candidate.

**Nothing in either photograph changes a person.** Frank also asked for Claire to
be made "a bit slimmer", reading the wide angle as having warped her. That was
declined: it alters how a real, identifiable person's body looks, on a clinic
site, and it is her likeness rather than the clinic's to reshape. Reframing so
she is not near the frame edge, where a wide lens stretches hardest, is the
honest version of the same fix, and asking her is the other. **Keep that line
where it is**: framing, exposure and the ground are fair game, a person is not.

Done on a canvas in the browser, as the B Corp composite was, because this
project has no image library. **The base64 never came back through the
conversation**: a page that POSTs its canvases to a throwaway local Node server
writes the bytes to disk, which is worth remembering, since reading two data
URLs out through the browser tool would have moved about 650,000 characters.
`scripts/add-outdoor-pilates-photos.js` uploads the finished files and writes
the sections; it does not generate them.

The two benefit rewrites are Claire's own, trimmed. **Her copy came from a
stale version of the page**: the em dash she flagged in "philosophy-supporting"
went in the dash sweep on 2026-10-11, so her other notes may be against old
text too.

Title and description were rewritten for search: "Outdoor Pilates Practice &
Services" to "Outdoor Pilates Classes Toronto", and a description that named
neither Toronto nor what the class is to one that names both. Housekeeping in
the same pass cleared the trailing space in `title` that CH-009 records, two
more in a benefit title, three leading ones in subtitles, and an empty block.

**No photograph of a practitioner is ever composited.** Frank asked on
2026-10-13 whether Claire could be edited into the Recovery Sanctuary. A
fabricated photograph of a real practitioner in a place she was not, on a
clinic site selling those sessions, is the same class of thing as the invented
statistics the content rules ban. Shoot her in the space, or use a real
portrait until there is one. Cropping and colour-matching a real photograph is
fine.

### The billing sweep, 2026-10-12

**Curate does no insurance submissions and no direct billing.** Frank confirmed
it on 2026-10-12 and asked for a sweep, so this records what was found and what
the line is, since the two are easy to confuse.

**Removed.** `/our-programs` FAQ "Is insurance available?" ended "Our team is
happy to assist in determining your eligibility and, when possible, can submit
claims on your behalf, so you can stay focused on your health, not the
paperwork." That sentence was untrue. `scripts/remove-direct-billing.js` took
it and nothing else, in transaction `UAIn8zgTVuj4HCTBS3h53F`, after
`sanity-backup-2026-10-12-before-billing-removal-documents.tar.gz`. Nothing was
drafted to replace it: a line about issuing receipts would be an operational
claim nobody has confirmed.

**The distinction that decides the rest.** Saying what a visitor's own plan
might cover is a statement about their coverage. Saying Curate will deal with
their insurer is a service Curate does not provide. Only the second is banned.
The OHIP framing in the content rules is the first kind, which is why it stands.

**Left alone, all of the first kind**, listed so the next sweep does not
re-litigate them:

| Where | Text |
| --- | --- |
| `/our-programs` FAQ, what remains | may be eligible under your extended health benefits, confirm with your insurer |
| `/our-programs/curate-lifestyle` FAQ 3 and 6 | extended health plans reimburse portions, "Let us help you check your benefits" |
| three `our-programs-page` components | "May also be partially covered by extended healthcare insurance" footnotes |
| `legal/privacy` | holding insurance details, receipts for submission to insurers, disclosure to insurers where authorized |

**"Let us help you check your benefits" is the closest call** and it is still
on two Curate Lifestyle FAQs. Helping somebody read their own policy is not
submitting a claim, so it was not removed, but it is the line to ask Frank about
if this comes up again.

**The privacy policy is deliberately untouched.** It describes what Curate
would do with the information if it held it, which is what a privacy policy is
for, and narrowing it to current practice would be a legal edit rather than a
copy one.

**The sweep is a script, not a grep.** Run it again after any copy change that
touches money:

```bash
node scripts/remove-direct-billing.js   # dry run, names what it would change
```


### B Corp certification, 2026-10-10

Curate Health is a Certified B Corporation, confirmed by Frank on 2026-10-10.

**The link target is not a choice.** B Lab's brand guidelines require a certified
company using the mark to send visitors to `bcorp.com`, by hyperlink or by a
line of text such as "Learn more at bcorp.com", and set 31 August 2026 as the
deadline for it. So the footer mark links to `https://bcorp.com` even though
that 301s to `bcorporation.net/en-us/`. It is B Lab's own redirect on their own
short URL, and the compliance requirement outranks this project's preference for
linking the resolved address. Do not "fix" it to the destination.

The stronger link would be Curate's own entry in the B Corp directory, since it
verifies the claim rather than describing the scheme. No entry was findable on
2026-10-10, which is ordinary lag for a new certification. It stays as it is
regardless: the guidelines name bcorp.com, not the profile.

**The mark may be white or black, and no other colour.** The asset is black on
transparency, so the footer paints it white with `brightness-0 invert`, which
lands on one of the two permitted colours. The lockup has to keep the line above
the word "Corporation", so it must not be cropped, and the Circle B on its own is
reserved to B Lab. The name is styled "B Corp", with a space, never "B-Corp" or
"BCorp".

**Rendered at 80px wide, not 44.** PR #182 drew it at 44x59, which was wrong
twice over. The asset is 960x1403, so 44 wide is 64 tall and 59 squashed it, and
at that size the words "Certified" and "Corporation" set about four pixels tall
and cannot be read. 80x117 holds the ratio and keeps the words legible. It sits
under the contact block, which also satisfies B Lab's guidance to place the
lockup in the lower left.

**PR #182 was not merged.** Opened 2026-04-06 against a footer that has since
been rewritten: `addressLines()`, `externalLinkProps()`, `SocialIcon` and the
`h2` headings all postdate it, and re-applying its diff would have put the
address back to `{street}{city}{state}{zip}` with no separators. It also carried
no hyperlink, which is the one thing B Lab actually requires, and no `sizes`,
which fails CH-007. Rebuilt on main instead. Close #182 once this lands.

**The footer carries standing text beside the mark, since 2026-10-11.** "We
are a B Corp." over "The same care we take with patients, applied to our team
and our footprint.", then a Learn More link.

**The second line was rewritten before it shipped, and the reason matters.**
The idea for this block came off Athleta's footer, and the first draft read
"Part of a global movement working to better people and the planet", which is
Athleta's own sentence with one word changed. Frank stopped it: he did not want
a line another brand could recognise as theirs. The replacement says something
only this business can say, which is that the certification applies the care the
clinic already takes with patients to its team and its footprint. **Do not drift
back toward the B Lab or Athleta boilerplate when this is next edited.**

The layout is also deliberately not Athleta's, which uses B Lab's boxed URL
badge with an uppercase heading in a band of its own. Ours is the bare vertical
lockup, white on the dark green, sentence case, inside the contact column.

**The mark is a link wherever it appears, including on the Sustainability
page.** B Lab requires a certified company using the mark to direct visitors to
bcorp.com, and that applies to the section photograph too, not only the footer,
because the mark is in the photograph. Frank asked for it on 2026-10-11.

`AlternatingSections` takes an optional `imageHref` resolver for this. The
sustainability page matches on `_key === "bcorp-certification"`, not on the
section title, so renaming the section in the Studio cannot quietly drop the
link. `_key` was added to the GROQ projection for the same reason. Every other
section photograph on that page and on /cafe stays unlinked, which is why the
prop returns null by default rather than taking a single href.

**Learn More goes to the directory profile, the mark still goes to bcorp.com.**
`https://www.bcorporation.net/en-us/find-a-b-corp/company/curate-health-corp/`
exists now; it did not on 2026-10-10. It is the link that verifies the claim, so
it is the better destination for a text link, but it cannot replace the mark's
own link because the brand guidelines name bcorp.com. Two links, two
destinations, on purpose. Repoint Learn More at CH-119 when that page is built.

**The mark is offset left by 14px and that is not a nudge.** The asset carries
its own transparent margin, measured at 14.6% of the canvas on the left, so the
ink starts well inside the frame and the mark reads as indented against the
address above it. The negative margin is that margin at the rendered width, 96
times 0.146. Recompute it if the width changes. Do not crop the asset: that
margin is B Lab's clear space, not padding somebody left in. Verified by
measurement rather than by eye, the Contact heading, the map pin icon and the
mark's ink all start at 32px.

**The text beside it is aligned to the mark's ink, not to its frame.** The
asset is inset vertically as well as horizontally, 139 of 1403 from the top and
120 from the bottom, which at height 140 is 14px and 12px. The text column
carries exactly those as padding and spreads itself with `justify-between`, so
the first line sits on the top of "Certified" and the Learn More link sits on
the bottom of "Corporation". Measured rather than eyeballed: 0.1px out at the
top, 0 at the bottom. All four numbers come from the asset, so recompute them
if the asset or the height changes.

**A lazy image reads as a missing image for a moment.** Both the desktop and
mobile checks of this block showed empty space where the mark goes, and both
were a screenshot taken before the lazy-loaded image painted. The DOM said
`complete: true` each time. Take the screenshot, then take it again, before
concluding a footer image is broken.

**The section photograph is a custom composite, since 2026-10-11.** The
original was stock: a tea plantation with the mark burned in, 1920x1280 and
5.76 MB, and it rendered soft because the slot paints 704x556 and crops.

The replacement is built from `FrontPage_Eighth_Section.jpg`, already in the
library at 5575x3717 and referenced by nothing, so it is greenery Curate owns
that had never appeared on the site. The mark is composited over it in white,
with a soft radial scrim so it holds against the leaves.

Three things about it are deliberate. It is **1600x1267**, a ratio of 1.263
against the slot's 1.266, so `object-cover` crops essentially nothing and the
mark is never cut: B Lab does not permit a cropped mark. The mark is sized and
centred from its **ink** rather than its canvas, since the asset's transparent
margins would otherwise have made it small and off centre. And it is 213 KB
rather than 5.76 MB.

**It was composited on a canvas in the browser**, because this project has no
image library and a native dependency was not worth adding for one picture.
`scripts/swap-bcorp-section-image.js` uploads the finished file and repoints
the section; it does not generate it. To redo the composite, draw the photo at
1600x1267, lay a radial scrim of rgba(20,34,18,0.55) to 0.12 over it, then draw
the mark with `filter: brightness(0) invert(1)` at 46% of the height measured
on its ink.

The old tea-plantation asset is still in the library, now unreferenced. It is a
candidate for CH-117 rather than something to delete on its own.

**Still open: the section on the Sustainability page.** Its copy sits in
`drafts.c0ca5697-0672-4e6b-80c2-8c9c898de6e7` and nowhere else, written
2026-04-17. **Do not press Publish on that draft.** The published document was
updated 2026-09-10, five months later, and `audit-drafts.js` reports three
changed fields: publishing reverts `seo.pageTitle`, `seo.socialMeta.title` and
`seo.socialMeta.description` to their April wording. Patch
`additionalSections` onto the published document instead, writing the array
whole per the CH-028 note, after a fresh export.

The drafted copy needs rewriting first. It carries two rule-of-three lists,
"proud to be", "highest standards" and "a force for good", which is brand voice
against the tone rule, and its semicolons read as em dashes somebody swapped out.
B Lab's own tagline wording has moved from "highest" to "high" since it was
written. Its alt text is "B Corp Logo", which names the file rather than
describing the mark, and should read "Certified B Corporation" as the footer's
does. The replacement copy is with Frank.

### No rich text link has ever rendered, found 2026-10-10

`@portabletext/react` ships default renderers for the decorators, em, strong,
code, underline and strike-through, and for nothing else. The `link`
annotation is the only annotation `sanity/schemas/blockContent.ts` defines, and
it has no default, so it falls through to the library's `unknownMark` and
renders as `<span class="unknown__pt__mark__link">`. The words appear, the link
does not. It looks correct in the Studio, in the GROQ result and in the source.

All 25 `<PortableText>` call sites passed no `components` prop, and no file in
the repository defined a `marks` renderer.

**This is a trap, not a live defect.** Nine production pages covering every rich
text template were checked on 2026-10-10 and carry zero `unknown__pt__mark__` of
any kind, so no editor has yet put a link into a rich text field. The first one
to try would have found it.

`components/shared/portable-text-components.tsx` now holds a shared `link`
renderer, which reads `externalLinkProps` so a link out of the site opens in a
new tab. **It is wired into `AlternatingSections` only**, because that is what
the B Corp section needs. The other 24 call sites still pass nothing and still
have the trap. Wiring them is a one-line import each and visually a no-op today,
since nothing currently renders a link, but it is 24 files and it is Frank's
call whether that rides along with something else.

### The siteSettings draft was a loaded gun, cleared 2026-10-11

`audit-drafts.js` had been exiting 1 since 2026-09-12 on a `siteSettings`
draft carrying seven destructive paths. Anyone who opened site settings in the
Studio and pressed Publish would have undone two tickets in one click, with no
warning and nothing in the interface suggesting it.

The draft was saved at 18:18 on 2026-09-12. The published document was written
at 22:11 the same day, when `add-social-and-hours.js` ran. So the draft was a
snapshot of the state before that script, and publishing it would have:

- deleted TikTok and Facebook from `socialMedia`, along with every `entity`
  and `label` field, collapsing `sameAs` from five profiles to two and undoing
  the clinic and cafe split, CH-008
- reverted `/products` to `/#products` in both the nav and the footer, which is
  the anchor to nowhere that orphaned the five product pages, CH-010

It held nothing unpublished. Every field in it was an older copy of something
already live, which is what made deleting it safe rather than a judgement call.

`scripts/clear-stale-draft.js` does this and refuses to do anything else. It
deletes a draft only when a published document exists, the draft is older than
it, and the draft adds no field the published document lacks. A draft that is
merely different is not stale: the differences are printed for a reader to
judge, and only those three conditions decide. Exercised against the
`aboutSection` draft, which is newer, it refuses and says why.

`audit-drafts.js` exits 0 now. The four remaining drafts are two orphans with
no published counterpart and two with ordinary in-progress edits.

**This is a standing hazard, not a one-off.** Any script that writes to a
document somebody has open in the Studio creates another one. Run
`audit-drafts.js` after a migration, which the CH-020 note already says, and
clear what it finds rather than leaving it to the next person to publish.

### The banned-word checks, shared and matching stems, 2026-10-11

Two problems, both recorded in this file as known and both now fixed.

**The two audits had drifted.** `audit-content-rules.js` and
`audit-metadata.js` each carried their own copy of the banned list, and the
first had "dive into" where the second did not. The same phrase therefore failed
in body copy and passed in a meta description. A rule enforced in one place and
not the other is worse than no rule, because it reads as checked. Both now read
`scripts/lib/content-rules.js`.

**They matched a prefix, so they missed any inflection that changes the stem.**
A bare prefix catches what only adds letters, "unlocking" contains "unlock" and
"seamlessly" contains "seamless", but "elevating" does not contain "elevate".
The list is patterns now. The count went from 88 breaks to **90 on 27 of 51
pages**, both new hits being "elevating", on `/our-programs` and
`/services/performance-training`.

One of those two reads as a patient testimonial rather than marketing copy,
"This was all about elevating myself to the best me possible". If it is, it
belongs with the seventeen unsigned first-person quotes in the copy review and
is a regulated-advertising question, not a word swap. Confirm before editing it.

**What is deliberately not matched.** Only inflections of a banned word, never
its relatives: "transformation" is not caught by "transformative". "elevation"
is left out on purpose because this is a clinic and "elevation of the leg" is
correct clinical English. "elevated" is still matched, as it always was, because
the snippet makes the call obvious, but do not widen this further without
reading the hits. A check that cries wolf gets ignored.

"journey" is not in the list and must not be added back, per the content rules
above. There is a unit check covering that, and the `elevating` gap, in the
module's own patterns.

### The dash sweep, 2026-10-11. 88 breaks to 1

The content rules now fail on **one** thing across all 51 pages, and it is not
a word choice. Em and en dashes were 47 of the 50 that remained after Frank
relaxed the banned words, and they are gone from the dataset and from the
source.

**75 dashes in Sanity, not the 46 the audit reported.** The audit reads
rendered pages; the dataset holds more, including fields on documents the
sitemap never reaches and two on the `serviceLifestyleProgram` draft. Fixing
the published copy and leaving the draft would have put the dashes back the
moment somebody pressed Publish, so both were patched.

**A dash is not one mark, so this was not one replacement.** Blanket commas
would have produced comma splices in roughly a fifth of them, trading the rule
for a worse error. `scripts/propose-dash-fixes.js` classifies each one and
proposes accordingly: a numeric range becomes "to", a parenthetical pair
becomes two commas, a dash introducing a list becomes a colon, two independent
clauses become a full stop, and an afterthought becomes a comma.

The classifier is a first draft and was wrong eight times on its first run,
turning `approach-using personalized strategies` into a colon, which does not
parse before a participle. A participle or preposition after the dash is
continuation, not a list. **Read the proposals; do not trust them.**

**Frank wrote 19 of them himself** and approved the other 40 as proposed. His
wording is in `scripts/dash-overrides.json` and several of his edits go beyond
the dash: "in our space" rather than "in our tranquil clinic", the cafe closing
restructured, the Outdoor Pilates quote rewritten.

**The overrides are matched on source text, not on item number.** Item numbers
come from the order Sanity returns documents in, which is not promised to be
stable, so keying by number would eventually write one paragraph into another
field. `dash-overrides-expect.json` carries the "before" each override was
written against and the script refuses the whole run if one no longer matches.

**Apostrophes are reconciled, not normalised.** Copy pasted through a chat
window comes back with whichever apostrophe the client preferred. Where the
original used one kind throughout, the replacement is made to match; where the
original was already mixed, Frank's text stands. Item 41's original was mixed,
three curly and three straight, so that paragraph is now internally consistent
for the first time.

**Six dashes were in components, not Sanity**, in `app/contact/page.tsx`,
`our-programs-page/cta-section.tsx`, `services-pages/service-lifestyle.tsx`
and `shared/blog-author-byline.tsx`. Two more are deliberately left: a JSX
comment, which renders nothing, and the character class in
`lib/page-metadata.ts`, which has to match a dash to strip a trailing brand
separator. **Do not "fix" that regex.**

**Grep is not reliable for this on Windows.** `grep -rn '[—–]'` in Git Bash
matches individual UTF-8 bytes, so it reports every ellipsis, curly apostrophe,
dagger and arrow as a dash. Count them in Node.

**The one remaining break is a testimonial.** `treatments`
`721e0537-425d-4128-befa-e7642caa5e63` `quoteContent` reads "Harnessing the
power of my breath brought profound relaxation and emotional balance into my
daily routine." That is the only banned phrase left on the site, and it sits
inside one of the seventeen unsigned first-person quotes already flagged as a
regulated-advertising question. **Resolve it with that decision, not with a
word swap.** Editing the words of a quote nobody gave is worse than removing
it, and it may be removed anyway.

The last exclamation marks went with the sweep: "Visit us today." on
`cafePage.ctaBandSection.closingLine`, and one hardcoded in
`service-lifestyle.tsx`.

### The content rules pass, 2026-10-11

`audit-content-rules.js` reports **zero breaks on all 51 pages**, from 88 at
the start of the day. `audit-alt-text.js` passes too. One of nine checks still
fails, and it is `audit-metadata.js`.

What cleared in the last pass:

- The two Curate Lifestyle photographs have alt text, on
  `serviceLifestyle.hero_image.alt` and `content_image.alt`. Both were fetched
  and looked at before being described, per the CH-028 note, and both are
  styled stock flat-lays rather than Curate's own photography.
- The last banned phrase went with the breathwork quote reword above.
- `/products` takes its section hero as its share card. The query selects the
  url rather than the asset id, and `buildPageMetadata` reads the id back out
  of the url, so the 1200x630 crop still comes out.

**What is left in `audit-metadata.js`, all of it content:**

- `/about` has no share image and no photograph of its own to fall back on.
  It is a hub of links, so unlike `/products` there is nothing to default to.
  Frank is choosing one.
- Four pages whose title and heading disagree: `/about/our-story`,
  `/our-programs`, the joints-in-motion blog post, and Outdoor Yoga Therapy.

### Titles aligned to headings, 2026-10-12

`audit-metadata.js` had four pages where the title and the h1 described
different things. All four are fixed and **the whole gate is now one failure**,
`/about` having no share image.

**What the check actually demands**, since guessing at it wastes a pass: every
significant word of the h1 must appear in the title. Extra words in the title
are fine. `significant()` drops stopwords and anything under three letters.
Lift `titleMatchesHeading` out of the audit and test a draft against it before
writing anything.

| page | changed | now |
| --- | --- | --- |
| Outdoor Yoga Therapy | `seo.pageTitle` | Outdoor Yoga Therapy & Classes Toronto |
| /our-programs | `seo.pageTitle` and `title` | Personalized Health Programs Toronto, h1 Personalized Health Programs |
| joints-in-motion post | `title` | Joints in Motion: Joint Health and Mobility |
| /about/our-story | `seo.pageTitle` | Our Story: From Heart to Healing and Passion |

`seo.pageTitle` holds the part before the brand; `buildPageMetadata` appends
"| Curate Health" and counts the whole thing against 60.

**One of these was drafted wrong first and is worth the warning.** The yoga
title was going to be "Outdoor Yoga Therapy Toronto", which passes the check
and drops "Class". "Outdoor yoga class Toronto" is the higher-volume query, so
passing the audit had quietly cost the page its best search term. The audit
measures consistency, not reach. **Draft for search, then check it passes, not
the other way round.**

**The search title and the share title are different fields and already allowed
to differ.** `buildPageMetadata` says so in its own comment: a search result
answers "is this the thing I typed?", a share card has to make somebody stop
scrolling. The audit only reads the page title. Evocative copy belongs in
`og:title`, so do not try to make one string do both jobs.

What was given up, deliberately: "Prioritizing" and "Lifelong" left the blog
h1, and "for Every Stage of Life" left the /our-programs h1. "Prioritizing" has
no search value. The other two are low volume and both survive in the body copy
and meta description, which is where AI answer engines read from anyway. The
/our-programs paragraph directly under the h1 already says "every individual
has unique goals, health needs, and levels of commitment".

### The about hub, the footer and the blog, 2026-10-12

**/about is built from the two shared section components now**, per the rule
set on 2026-09-20. It was the last section opening on a bare white band while
every other one opened on a photograph. Hero, then the About menu, then the
intro, then a card grid of the five children in the same shape /services uses.

`aboutIndexPage` gained a `heroImage` field, which it did not have: it held
only title, intro and seo. `ABOUT_INDEX_QUERY` also projects each child's own
hero as its card image, and a child with none falls back to the hub's image
rather than leaving a hole. Our Team is that case today, so it shows Frank's
portrait until a full team photograph exists.

**The hero takes an optional `imageClassName`.** /about passes `grayscale`.
The section's other five heroes are high-contrast natural imagery, two of them
monochrome, so a colour hero sat outside the register.

The hero photograph is `about-hero-curate-logo-cork.jpg`, 2400x1000, cropped
from the Drive file `P1016112.JPG` at the point where the mark and most of the
wordmark are in frame. Its subject is the logo embossed into **cork yoga mats**,
which is Frank's correction: the first alt text said only "cork", which is the
kind of detail that cannot be read off the photograph.

**"Unknown field found" in the Studio is expected here, and Remove field is
the wrong button.** Adding a schema field and writing its data before the code
ships always produces it: Sanity holds the value, the deployed Studio has no
definition to render it with. The ordering is unavoidable, since the page
cannot render without data and the data cannot display without the schema. It
clears on the next deploy. **Pressing Remove field deletes the content.**

**The footer heading links follow the SectionNavigation rule.** Services now
links to /services, as About already linked to /about. Resources and Connect
stay plain text, because neither has a single page behind it: Resources is a
mixed list and Connect is a set of outbound profiles. The mobile accordion puts
each hub in its list instead, because the trigger has to stay a button that
opens the accordion.

**The house blog byline is white on transparent.** The asset in Sanity,
`logo-black.png`, is pure black on transparency, and the avatar's white
backing and ring made it read as a green mark with a white rim against the
dark green footer. For that one author the backing and ring come off and the
mark is painted white with `brightness-0 invert`. A practitioner's photograph
keeps its frame; inverting one would be absurd.

**A blog card's photograph and excerpt both open the post. Hard rule from
2026-10-12, for every post.** Both carry `tabIndex={-1}` so they add no
keyboard stops, since the title and "Read more" already reach the same place,
and the image link is `aria-hidden` because the title already names the post.
Four tab stops per card to one destination is worse than two.

**Regenerating sanity.types.ts churns about 10,000 lines and that is not the
CH-025 trap.** Plain `sanity schema extract` was used. Only ten lines are
genuinely new and four removed; the rest is the generated union types
reordering. Check the optional-marker count before assuming otherwise: it went
3090 to 3097 here, where the `--enforce-required-fields` failure flips roughly
five thousand.

### Dependency security alerts

**Triaged 2026-09-15.** GitHub listed 187 open Dependabot alerts on main: 7 critical, 86 high, 78 medium, 16 low. Only `next` reaches visitors. The rest sit in the Sanity CLI, ESLint, the build, the Studio or the draft preview overlay. That was checked against the build output rather than read off the package list, because GitHub labels every one of them "runtime": `next` is the only flagged package in the server function traces, lodash's `_.template` appears only in the Studio chunk, and the on-demand preview chunk carries nanoid and lodash internals but not the flawed functions. The build does contain three Server Actions, all from `next-sanity` preview tooling, so the Server Action advisories apply.

**Next.js 14 gets no more security fixes.** 14.2.35 is the last 14.x release and the site is on it. Neither critical applies: one needs a Windows server, the other is in the built-in AVIF image optimiser, which Vercel does not run. What still applies is denial of service through Server Components and Server Actions, fixed only in 15.5.24 and 16.3.3. Version 15 leaves Maintenance LTS on 2026-10-21, so the upgrade target is 16. That is CH-118, below.

**The image resizer only takes Curate's own images.** `images.remotePatterns` is limited to `/images/rwc5kyvy/**`. With no pathname it accepted any Sanity project's images, so anyone could spend the plan's image allowance and choose the file the optimiser opens. Every resized image on the live site already came from that path. A new image source has to be added there first.

**Dependabot branches do not deploy.** `vercel.json` sets `git.deploymentEnabled` to false for `dependabot/**`, because every deployment is stored against the Hobby limit. Build those updates locally instead.

**`@google/genai` is installed and imported nowhere on main.** Wajdy-E added it on 2026-04-25 with the search feature, and his unmerged AI chatbot pull request, #192, imports it in `app/api/brand-chat/route.ts`, so removing it would break that branch. It stays until Frank decides; the in-range update already cleared the protobufjs alerts it brought in.

**ESLint is not set up.** `next lint` stops at its first-run configuration prompt, so `eslint-config-next` and everything under it is a tool nothing runs.

**About 67 alerts are left after the update**, counted by matching the installed versions against each alert's range; GitHub recounts after merge. 25 are the Next.js ones that need version 16. The rest are inside the Sanity CLI and build tools and need larger Sanity upgrades. `decompress` and `parse-git-config` have no fix published.

### Node 24, forced 2026-10-10

**Every deployment failed for a day and nothing in the repository was wrong.**
Vercel discontinued Node 20.x, which the project was pinned to, and rejected
each attempt with "Node.js Version 20.x is discontinued and must be upgraded".
The signature is worth recognising: status Error after about two seconds, with
`Builds: . [0ms]` and no logs at all. A real build failure takes minutes and
prints something. Two seconds and an empty build list means the deployment was
refused before it started, so look at the account and the project settings
rather than at the code.

Four deployments failed this way, the previews for #249 and #250 and both
production merges, while production carried on serving the #244 build from
2026-09-18. A merged pull request looked shipped and was not. Check
`npx vercel list curate-health` after a merge rather than assuming.

Fixed in the repository rather than the dashboard. `engines.node` in
package.json overrides the Node version in Project Settings, which Vercel's own
documentation spells out for this exact case: Project Settings on 20.x plus
`"node": "24.x"` in package.json deploys on the latest 24.x. So the dashboard
setting is now dead weight and the version lives with the code, where a change
to it is reviewable.

Nothing else had to change. `npm run build` was already passing on Node 24.19.0
locally before this, the Studio route included, which is why the bump went in on
its own rather than waiting for CH-118.

**CH-118 below assumes this is still pending. It is not.** The line about Sanity
Studio v6 needing Node 22.12, and the Vercel project moving off 20.x, is done.

### CH-119 Our B Corp Certification page

Asked for by Frank on 2026-10-11, to be built later. A page under About Us about
the certification, which the footer's Learn More should point at once it exists.

Until then Learn More points at the directory profile,
`https://www.bcorporation.net/en-us/find-a-b-corp/company/curate-health-corp/`.
**Repointing it is part of this ticket, and the mark's own link stays on
bcorp.com** whatever happens here, because B Lab requires that one.

The copy is Frank's to supply or approve. What the certification covers, what
B Lab assessed, and the date certified are claims about the business, so they
are not for drafting from the directory listing.

It is a new route, so the every-page rule applies in full: its own title and
description in the Studio, a share card, a breadcrumb under /about, a line in
the sitemap and in llms.txt, a link from the About hub so it is not orphaned,
and the content rules. `node scripts/audit-seo-complete.js` is the gate.

### CH-118 Upgrade to Next.js 16

**Scheduled after the pressing SEO work, Frank's call on 2026-09-17.** Not 15, which leaves Maintenance LTS on 2026-10-21. Scoped on 2026-09-15:

- React 18 to 19.2, with `@types/react` to match
- Sanity Studio 3 to 6, reading each major's migration notes on the way. v6 needs Node 22.12, so the Vercel project's Node setting moves off 20.x
- `next-sanity` 9 to 13, `@sanity/vision` 3 to 6, `sanity-plugin-mux-input` 2 to 5, and a `framer-motion` release that accepts React 19
- Async request APIs: 87 uses of `params`, `searchParams`, `cookies()`, `headers()` and `draftMode()` across 18 files. `npx @next/codemod@canary next-async-request-api .` does most of it
- `revalidateTag` needs a second argument, in `app/api/revalidate/route.ts`
- `images.qualities` defaults to `[75]`, and 12 image components ask for 90 or 100. List those qualities, or accept the change on purpose
- `middleware.ts` is deprecated in favour of `proxy.ts`, which cannot use the edge runtime
- Turbopack builds by default. `next.config.mjs` has no custom webpack config to migrate
- `next lint` is removed. ESLint was never set up here, so nothing is lost

Take a fresh Sanity export first, work on one branch, verify every page, the Studio, preview mode, booking links and the forms on a local build, and push once.

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
- Every blog post has a visible byline
- Frank has approved every piece of published copy
