import { PortableTextComponents } from "@portabletext/react";

import { externalLinkProps } from "@/lib/links";

/**
 * Shared PortableText renderers.
 *
 * WHY THIS EXISTS
 *
 * @portabletext/react ships defaults for the decorators, em, strong, code,
 * underline and strike-through, and for nothing else. A `link` annotation,
 * which is the only annotation sanity/schemas/blockContent.ts defines, has no
 * default, so without this it falls through to the library's unknownMark and
 * renders as `<span class="unknown__pt__mark__link">`. The words appear, the
 * link does not, and it looks correct in the Studio and in the source.
 *
 * Nothing on production trips this today. Checked 2026-10-10 across nine pages
 * covering every rich text template: zero `unknown__pt__mark__` of any kind, so
 * no editor has yet put a link into a rich text field. It is a trap rather than
 * a live defect, and the first editor to try would have found it.
 *
 * `externalLinkProps` decides target and rel per href, so a link that leaves
 * the site opens in a new tab and one that stays does not.
 *
 * ONLY WIRED INTO AlternatingSections SO FAR. The other call sites still pass
 * no components and still have the trap. See the B Corp note in CLAUDE.md.
 */
export const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href;

      // An annotation with no href is an editor mid-edit, not a link.
      if (!href) return <>{children}</>;

      return (
        <a href={href} {...externalLinkProps(href)} className="underline">
          {children}
        </a>
      );
    },
  },
};
