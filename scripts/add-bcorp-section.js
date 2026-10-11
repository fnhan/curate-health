/**
 * The B Corp section on /about/sustainability.
 *
 *   node scripts/add-bcorp-section.js           # dry run, writes nothing
 *   node scripts/add-bcorp-section.js --apply
 *
 * Curate Health was certified on 2026-10-10. The copy for this section was
 * drafted on 2026-04-17, months before, and has sat in the draft ever since.
 *
 * WHY THIS IS A SCRIPT AND NOT A PUBLISH
 *
 * The obvious move is to open the Studio and press Publish on the sustainability
 * draft, and it is the wrong one. A Sanity draft is a whole document, not a
 * patch. That draft was last touched 2026-04-17; the published document was
 * updated 2026-09-10, five months later, when the SEO sweep rewrote its search
 * and share wording. audit-drafts.js reports three changed fields, so publishing
 * the draft reverts all three to their April text:
 *
 *   seo.pageTitle              "Our Commitment to Sustainability"
 *   seo.socialMeta.title       "Building a Health Space That Does Less Harm"
 *   seo.socialMeta.description "From the materials in the building to how we..."
 *
 * So the section is patched onto the published document instead, and the seo
 * object is not touched.
 *
 * additionalSections is written whole rather than by index. Per the CH-028
 * note, an indexed patch to an array that is also being rewritten in the same
 * transaction is silently lost.
 *
 * The patch carries ifRevisionID, so a Studio edit landing while this runs
 * fails the mutation rather than being overwritten.
 *
 * THE STALE DRAFT IS REMOVED
 *
 * Once the section is published the draft holds nothing that is not live except
 * the three April seo values, which are the landmine. Leaving it means the next
 * person to press Publish on that page silently reverts the SEO sweep. It is in
 * the backup named below if anyone wants it back.
 *
 * THE COPY
 *
 * Rewritten from the April draft and approved by Frank on 2026-10-10. The April
 * text carried two rule-of-three lists and semicolons standing in for em dashes.
 * Frank cleared "proud to be", "high standards" and "a force for good" for this
 * section specifically, so they are deliberate here and are not tone slips.
 *
 * "Learn more at bcorp.com" carries the link. B Lab's brand guidelines require a
 * certified company using the mark to direct visitors to bcorp.com, by hyperlink
 * or by exactly that kind of line, and the deadline for it was 31 August 2026.
 * This section does both.
 *
 * The link only renders because components/shared/portable-text-components.tsx
 * exists. @portabletext/react has no default renderer for a link annotation, so
 * before that file a link in any rich text field rendered as a dead span.
 */

const { query, mutate } = require("./lib/sanity-cli");

const PUBLISHED_ID = "c0ca5697-0672-4e6b-80c2-8c9c898de6e7";
const DRAFT_ID = `drafts.${PUBLISHED_ID}`;

const BACKUP =
  "Documents/sanity-backups/sanity-backup-2026-10-10-before-bcorp-section-documents.tar.gz";

/** The asset already attached to the drafted section. */
const IMAGE_REF =
  "image-77d218daab84477cab584a89995394341a03420a-1920x1280-png";

const LINK_KEY = "bcorp-link";

const SECTION = {
  _key: "bcorp-certification",
  _type: "object",
  sectionTitle: "B Corp Certification",
  sectionImage: {
    // Not "B Corp Logo". Alt text describes the mark, it does not name the file.
    alt: "Certified B Corporation",
    image: { _type: "image", asset: { _ref: IMAGE_REF, _type: "reference" } },
  },
  sectionParagraph: [
    {
      _key: "bcorp-para",
      _type: "block",
      style: "normal",
      markDefs: [{ _key: LINK_KEY, _type: "link", href: "https://bcorp.com" }],
      children: [
        {
          _key: "bcorp-span-1",
          _type: "span",
          marks: [],
          text:
            "Curate Health is proud to be a Certified B Corporation, independently " +
            "assessed by B Lab against high standards of social and environmental " +
            "performance. The assessment covers the whole business rather than one " +
            "product: how we treat the people who work here, and how we source what " +
            "we sell and run the space they work in. We treat it as a standard to be " +
            "held to rather than a label to display, and as a practical statement " +
            "that business can be a force for good. Learn more at ",
        },
        {
          _key: "bcorp-span-2",
          _type: "span",
          marks: [LINK_KEY],
          text: "bcorp.com",
        },
        { _key: "bcorp-span-3", _type: "span", marks: [], text: "." },
      ],
    },
  ],
};

const RULE = "=".repeat(78);

async function main() {
  const apply = process.argv.includes("--apply");

  const [published] = await query(`*[_id == $id]`, { id: PUBLISHED_ID });
  const [draft] = await query(`*[_id == $id]`, { id: DRAFT_ID });

  if (!published) {
    console.error("Published sustainability document not found. Stopping.");
    process.exit(2);
  }

  const sections = published.additionalSections || [];
  const already = sections.some((s) => /b[-\s]?corp/i.test(s.sectionTitle || ""));

  console.log(RULE);
  console.log("B Corp section, /about/sustainability");
  console.log(RULE);
  console.log(`published rev:      ${published._rev}`);
  console.log(`sections now:       ${sections.length}`);
  console.log(`draft present:      ${draft ? `yes, ${draft._updatedAt}` : "no"}`);
  console.log(`backup:             ${BACKUP}`);

  if (already) {
    console.log("\nA B Corp section is already on the published document.");
    console.log("Nothing to do.");
    return;
  }

  console.log(`\nWould append section ${sections.length + 1}: "${SECTION.sectionTitle}"`);
  console.log(`  alt text:  ${SECTION.sectionImage.alt}`);
  console.log(`  link:      ${SECTION.sectionParagraph[0].markDefs[0].href}`);
  console.log("\n  copy:");
  const words = SECTION.sectionParagraph[0].children.map((c) => c.text).join("");
  console.log(
    words.replace(/(.{1,72})(\s|$)/g, "    $1\n").trimEnd()
  );

  console.log("\n  seo object: untouched, deliberately.");

  if (draft) {
    console.log(
      `\n  Would also delete ${DRAFT_ID}, whose only content not about to be`
    );
    console.log("  live is three April seo values that publishing would revert.");
  }

  console.log(`\n  !! The section image is a stock tea plantation with the mark`);
  console.log("     burned in, 1920x1280 and 5.76 MB, and the slot crops it with");
  console.log("     object-cover. Swap it for a Curate photograph in the Studio.");

  if (!apply) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }

  const mutations = [
    {
      patch: {
        id: PUBLISHED_ID,
        ifRevisionID: published._rev,
        set: { additionalSections: [...sections, SECTION] },
      },
    },
  ];
  if (draft) mutations.push({ delete: { id: DRAFT_ID } });

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId || "(id not returned)"}`);
  console.log("Run node scripts/audit-drafts.js to confirm the landmine is gone.");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
