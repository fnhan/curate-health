import { LinkBand } from "@/components/shared/link-band";

/**
 * The band on /cafe that opens the menu. CH-108.
 *
 * A thin wrapper over the shared band since 2026-10-20, when the class
 * schedule needed the same thing, the same way ServicesNavigation wraps
 * SectionNavigation. The look, the colours and the two strings are unchanged:
 * Frank chose all of them on 2026-10-18 and the rendered markup is identical.
 *
 * It replaced both of the other menu calls to action: the "What we're serving
 * today" card and the PDF download inside it.
 */
export function CafeMenuBand({ menuPath }: { menuPath?: string | null }) {
  if (!menuPath) return null;

  return (
    <LinkBand
      href={menuPath}
      heading="Cafe menu"
      action="Read the full menu"
      className="font-poppins"
    />
  );
}
