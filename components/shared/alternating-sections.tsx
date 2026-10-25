import { PortableText } from "@portabletext/react";

import { portableTextComponents } from "@/components/shared/portable-text-components";
import { SanityImage } from "@/components/shared/sanity-image";
import { externalLinkProps } from "@/lib/links";
import { cn } from "@/lib/utils";

interface Section {
  /** Stable across renames, unlike the title. Used to target one section. */
  _key?: string | null;
  sectionTitle: string | null;
  sectionParagraph: any | null;
  sectionImage: {
    image: string | null;
    alt: string | null;
    /**
     * The image object, with whatever crop and hotspot the Studio holds.
     *
     * Optional, because only CAFE_PAGE_QUERY projects it so far. Where it is
     * present the photograph is cropped by Sanity, which is what makes a crop
     * dragged in the Studio do anything; where it is absent the bare `image`
     * url is used and the browser centre-crops, as it always did.
     *
     * Added 2026-10-18, when Frank asked for the cafe photographs to be left
     * whole so he could crop them himself. Without this that is a silent
     * no-op, which is the same class of trap as the blog alt in CH-028: the
     * field is written and nothing reads it.
     */
    imageSource?: unknown;
  } | null;
}

interface AlternatingSectionsProps {
  sections: Section[] | null;
  /** Merged onto the outer section (e.g. font-poppins for cafe page). */
  sectionClassName?: string;
  /** Merged onto the PortableText prose wrapper. */
  proseClassName?: string;
  /**
   * Optional destination for a section's photograph. Return null for the
   * sections that should not be links, which is almost all of them.
   *
   * This exists for the B Corp section, whose photograph carries the
   * certification mark. B Lab's brand guidelines require a certified company
   * using the mark to direct visitors to bcorp.com, so the mark has to be a
   * link wherever it appears, not only in the footer.
   */
  imageHref?: (section: Section) => string | null | undefined;
}

export const AlternatingSections = ({
  sections,
  sectionClassName,
  proseClassName,
  imageHref,
}: AlternatingSectionsProps) => {
  if (!sections || sections.length === 0) return null;

  return (
    <section
      className={cn(
        "relative isolate bg-white py-28 text-primary",
        sectionClassName
      )}
    >
      <div className="flex flex-col gap-20 md:gap-28">
        {sections.map((section, index) => (
          <div
            key={section.sectionTitle}
            className="flex flex-col gap-16 md:container md:grid md:grid-cols-2 md:gap-16"
          >
            <div className={`relative ${index % 2 === 1 ? "md:order-2" : ""}`}>
              <div
                className={`absolute -top-7 h-[387px] bg-secondary md:h-[487px] ${
                  index % 2 === 0
                    ? "left-0 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]"
                    : "right-0 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]"
                }`}
              />
              {(() => {
                const photo = (
                  <SanityImage
                    sizes="(min-width: 768px) 45vw, 100vw"
                    loading="lazy"
                    source={section.sectionImage?.imageSource}
                    src={section.sectionImage?.image || ""}
                    alt={section.sectionImage?.alt || ""}
                    width={704}
                    height={556}
                    className={`relative z-10 h-[360px] w-full object-cover md:h-[556px] ${
                      index % 2 === 0
                        ? "pr-4 sm:pr-8 md:pr-0"
                        : "pl-4 sm:pl-8 md:pl-0"
                    }`}
                  />
                );
                const href = imageHref?.(section);
                if (!href) return photo;
                return (
                  <a
                    href={href}
                    {...externalLinkProps(href)}
                    className="relative z-10 block"
                  >
                    {photo}
                  </a>
                );
              })()}
            </div>
            <div className="container flex flex-col gap-4 md:max-w-none md:px-0">
              <h2 className="text-balance text-2xl font-light">
                {section.sectionTitle}
              </h2>
              {/*
                `text-pretty` so a paragraph does not end on a single short
                word. The cafe's "Where Every Bite Matters" ran to thirteen
                lines with "soul." alone on the last one, which Frank spotted
                on 2026-10-20.

                A CSS rule rather than a reword, because the widow depends on
                the width: the word left stranded is a different one on a
                phone, and editing the sentence to fix one window makes
                another worse. Browsers without `text-wrap: pretty` ignore it
                and wrap as before.
              */}
              <div
                className={cn("prose max-w-[80ch] text-pretty", proseClassName)}
              >
                <PortableText
                  value={section.sectionParagraph!}
                  components={portableTextComponents}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
