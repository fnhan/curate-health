"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { SocialIcon } from "@/components/shared/social-icon";
import { addressLines } from "@/lib/address";
import { HOVER_UNDERLINE } from "@/lib/hover-underline";
import { externalLinkProps } from "@/lib/links";
import { withoutDeadClassesLink } from "@/lib/class-schedule-link";
import { cn } from "@/lib/utils";
import { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

import { FooterMobileAccordion } from "./footer-mobile-accordion";

/**
 * B Lab requires a certified company using the mark to send visitors to
 * bcorp.com, by hyperlink or by a line of text, and set 31 August 2026 as the
 * deadline for it. So this is a compliance requirement rather than a choice,
 * and it is why the link is not pointed at the B Corp directory profile, which
 * would otherwise be the stronger link because it verifies the claim.
 *
 * bcorp.com 301s to bcorporation.net/en-us/. That is B Lab's own redirect on
 * their own canonical short URL, so it stays as written rather than being
 * resolved to the destination.
 */
const BCORP_URL = "https://bcorp.com";

/**
 * Curate's own entry in the B Corp directory, which is the link that verifies
 * the claim rather than describing the scheme. It did not exist when the mark
 * went into the footer on 2026-10-10; B Lab published it since.
 *
 * It does not replace BCORP_URL above. The mark itself still has to point at
 * bcorp.com to satisfy the brand guidelines, so the mark and the Learn More
 * link deliberately go to different places.
 */
/**
 * The rendered height of the mark.
 *
 * Profiling the PNG’s ink rows gives five bands on its 1403 canvas:
 * "Certified" 139..267, the circle B 323..1000, the registered mark
 * 1004..1044, the rule 1071..1116, and "Corporation" 1172..1282. The
 * alignment below uses the outermost two, so the text spans the mark’s whole
 * ink height. Re-profile the asset if it is ever replaced.
 */
const MARK_H = 140;

/**
 * Where the three lines sit beside the mark. Offsets from the top of the row.
 *
 * **Measure the rendered image, not the source PNG.** Two earlier attempts
 * aligned against rows in the 960x1403 file and both read wrong to Frank. At
 * 96x140 the ink actually lands on rows 13..26 for "Certified", 32..104 for
 * the circle B, 106..111 for the rule and 117..127 for "Corporation", so the
 * mark's ink spans 13..127 with 13px of clear space above and 12px below.
 * Downscaling by ten and inverting does not preserve the source proportions
 * closely enough for this.
 *
 * The other trap: row 13 is "Certified"'s **ascender** top, its f and d, not
 * its cap top. "We are a B Corp." has no ascender above cap height, so
 * matching cap top to ascender top sits the heading visibly high. That is the
 * error Frank caught twice, and it is not visible in any measurement that
 * only compares numbers.
 *
 * Final positions, settled by eye on 2026-10-12 after measuring: text ink
 * spans 18..125 inside the mark's 13..127. Deliberately not symmetric against
 * the mark, 5px in at the top and 2px at the bottom, because the heading
 * needed to come down for the two words to read as level. The paragraph is
 * centred between the heading and the link, 10.1px of air each side.
 *
 * **Re-solve by eye if MARK_H, the asset or the type size changes.** These do
 * not scale arithmetically.
 */
const HEADING_TOP = "14px";
const PARAGRAPH_TOP = "38.13px";
const LEARN_MORE_TOP = "106px";

const BCORP_PROFILE_URL =
  "https://www.bcorporation.net/en-us/find-a-b-corp/company/curate-health-corp/";

export default function SiteFooter({
  siteSettings,
}: {
  siteSettings: SITE_SETTINGS_QUERY_RESULT;
}) {
  const pathname = usePathname();

  if (pathname === "/coming-soon" || pathname === "/login") {
    return null;
  }

  if (!siteSettings) return null;

  const {
    brandName,
    socialMedia,
    legalLinks,
    contactInfo,
    footerNavLinks,
    classScheduleActive,
    services,
    aboutPages,
  } = siteSettings!;

  return (
    <footer className="flex w-full flex-col pb-8 text-sm md:text-base">
      <div className="flex flex-col text-white">
        <div className="container flex flex-col gap-10 py-14 lg:flex-row lg:justify-between lg:py-40">
          {/* Contact Info */}
          <div className="flex flex-col gap-8">
            <address className="space-y-2 text-sm not-italic md:text-base">
              <h2 className={cn("w-fit font-semibold", HOVER_UNDERLINE)}>
                <Link href="/contact">Contact</Link>
              </h2>
              <a
                className="flex w-fit items-start gap-2 hover:underline"
                href={contactInfo?.mapLink!}
                {...externalLinkProps(contactInfo?.mapLink!)}
              >
                <MapPinIcon size={20} className="mt-1" />
                <div>
                  {addressLines(contactInfo?.address).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </div>
              </a>
              <div className="space-y-2">
                <a
                  className="flex w-fit items-center gap-2 hover:underline"
                  href={`mailto:${contactInfo?.email}`}
                >
                  <MailIcon size={20} />
                  <span>{contactInfo?.email}</span>
                </a>
                <a
                  className="flex w-fit items-center gap-2 hover:underline"
                  href={`tel:${contactInfo?.phone}`}
                >
                  <PhoneIcon size={20} />
                  <span>{contactInfo?.phone}</span>
                </a>
              </div>
            </address>
            {/*
              The mark is black on transparency, so brightness-0 invert paints
              it white. White and black are the only two colours B Lab permits,
              and the footer is dark, so white is the compliant one here.

              The asset carries its own transparent margin, measured at 14.6% of
              the canvas on the left, so the ink starts well inside the frame and
              the mark reads as indented against the address above it. The
              negative margin is that margin at this width, 96 x 0.146, which
              lines the ink up with the text rather than lining the file up.
              Recompute it if the width changes, and do not crop the asset: the
              margin is B Lab's clear space, not padding somebody added.
            */}
            <div className="flex items-stretch gap-3">
              <a
                href={BCORP_URL}
                {...externalLinkProps(BCORP_URL)}
                className="-ml-[14px] shrink-0"
              >
                <Image
                  src="/images/B_Corp_Logo.png"
                  alt="Certified B Corporation"
                  width={96}
                  height={140}
                  sizes="96px"
                  className="brightness-0 invert"
                />
              </a>
              {/*
                The two anchors are features of the mark, not round numbers.
                Profiling the asset's ink rows gives five bands: "Certified" at
                139..267, the circle B at 323..1000, the registered mark at
                1004..1044, the rule at 1071..1116 and "Corporation" at
                1172..1282, on a 1403 canvas.

                So "Certified" ends 19.03% down and the rule starts 76.33% down.
                The heading's baseline sits on the first and the cap height of
                "Learn More" on the second, which is what Frank asked for.
                MARK_H carries the rendered height so the two percentages stay
                tied to the asset rather than to a pixel value somebody has to
                remember to change.
              */}
              <div className="relative min-w-[210px] text-sm">
                <p
                  className="absolute left-0 font-semibold leading-none"
                  style={{ top: HEADING_TOP }}
                >
                  We are a B Corp.
                </p>
                <p
                  className="absolute left-0 max-w-[210px] font-light leading-snug"
                  style={{ top: PARAGRAPH_TOP }}
                >
                  The same care we take with patients is applied to our team and
                  our footprint.
                </p>
                <a
                  href={BCORP_PROFILE_URL}
                  {...externalLinkProps(BCORP_PROFILE_URL)}
                  className="absolute left-0 w-fit leading-none underline underline-offset-4 hover:no-underline"
                  style={{ top: LEARN_MORE_TOP }}
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
          <div>
            <FooterMobileAccordion siteSettings={siteSettings} />
            <div className="hidden flex-col gap-2 lg:flex lg:flex-row lg:justify-end lg:gap-10">
              {/* Services Section */}
              <div className="border-b border-white pb-2 lg:border-none">
                {/*
                  A link, like About below it, because /services is a hub page.
                  Resources and Connect stay plain text: neither has a single
                  page behind it, Resources being a mixed list and Connect a
                  set of outbound profiles. That is the same rule
                  SectionNavigation follows, an href where the section has a
                  hub and none where it does not.
                */}
                {/*
                  The sweep is on the link, not on the h2. The h2 carries pl-3 and
                  the line is positioned against the padded box, so on the heading
                  it started 12px to the left of the word. after:left-3 cannot fix
                  that: it and the shared after:left-0 have the same specificity,
                  so Tailwind's own order decides and left-0 wins.
                */}
                <h2 className="w-fit pl-3 font-semibold md:mb-3">
                  <Link className={HOVER_UNDERLINE} href="/services">
                    Services
                  </Link>
                </h2>
                <div className="hidden flex-col gap-1 pl-3 md:flex">
                  {services?.map(
                    (service, index) =>
                      service.isActive && (
                        <Link
                          key={index}
                          className="w-fit hover:underline"
                          href={`/services/${service.slug}`}
                        >
                          {service.title}
                        </Link>
                      )
                  )}
                </div>
              </div>
              {/* About Pages Section */}
              <div className="border-b border-white pb-2 lg:border-none">
                {/*
                  A link, like the Contact heading above it, because /about is
                  a page now. Without this nothing on the site points at the
                  hub: the nav lists its five children and skips the parent, so
                  the page that exists to be those pages' parent was itself
                  unreachable. Caught by scripts/audit-orphans.js.
                */}
                {/*
                  The sweep is on the link, not on the h2. The h2 carries pl-3 and
                  the line is positioned against the padded box, so on the heading
                  it started 12px to the left of the word. after:left-3 cannot fix
                  that: it and the shared after:left-0 have the same specificity,
                  so Tailwind's own order decides and left-0 wins.
                */}
                <h2 className="w-fit pl-3 font-semibold md:mb-3">
                  <Link className={HOVER_UNDERLINE} href="/about">
                    About
                  </Link>
                </h2>
                <div className="hidden flex-col gap-1 pl-3 md:flex">
                  {aboutPages
                    ?.filter(Boolean) // Remove null/undefined values
                    .map((page, index) => (
                      <Link
                        key={index}
                        className="w-fit hover:underline"
                        href={`/about/${page?.slug}`}
                      >
                        {page?.title}
                      </Link>
                    ))}
                </div>
              </div>
              {/* Grouped Links Sections */}
              {footerNavLinks?.map((group, index) => (
                <div
                  key={index}
                  className="border-b border-white pb-2 md:border-none"
                >
                  <h2 className="pl-3 font-semibold md:mb-3">
                    {group.groupTitle}
                  </h2>
                  <div className="hidden flex-col gap-1 pl-3 md:flex">
                    {/*
                      The Classes entry goes while no class is switched on,
                      CH-107, so the footer closes with the page.
                    */}
                    {withoutDeadClassesLink(
                      group.links,
                      (link) => link.slug?.current,
                      classScheduleActive
                    )?.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        className="w-fit hover:underline"
                        href={link.slug?.current!}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {/* Social Links Section */}
              <div>
                <h2 className="pl-3 font-semibold md:mb-3">Connect</h2>
                <div className="hidden flex-col gap-2 pl-3 md:flex">
                  {socialMedia
                    ?.filter((link) => link.isActive)
                    .map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        className="flex w-fit items-center gap-2 hover:underline"
                        href={link.url!}
                        {...externalLinkProps(link.url!)}
                      >
                        <SocialIcon platform={link.platform} size={16} />
                        {/*
                          The name stays beside the icon. Five marks in a
                          column with no labels is a guessing game, and two of
                          these now go to different businesses: "Instagram" and
                          "Instagram (Cafe)" are the same mark and not the same
                          account.
                        */}
                        <span>{link.label || link.platform}</span>
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse justify-between gap-6 border-t border-white pt-6 text-sm md:flex-row">
          <div className="container text-center sm:text-left">
            &copy; {new Date().getFullYear()} {brandName}
          </div>
          <div className="container flex flex-col justify-center gap-2 text-center sm:flex-row sm:justify-between md:justify-end md:gap-10 md:text-left">
            {legalLinks?.map((link, index) => (
              <Link
                key={index}
                className="w-fit hover:underline"
                href={`/legal/${link.slug}`}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
