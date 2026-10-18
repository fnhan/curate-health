/**
 * The hairline that sweeps in under a link on hover.
 *
 * It came from the second menu on /services, where it has been since the site
 * was built: the line is drawn at full width but scaled to nothing from the
 * right, and on hover the origin flips to the left so it grows in from that
 * side over half a second. Frank asked on 2026-10-18 for every underlined link
 * on the site to behave the same way, "to stay consistent".
 *
 * **It was already copied between two files.** section-navigation.tsx and
 * our-programs-navigation.tsx each carried the same string, which is the drift
 * this project keeps paying for. One copy now, and everything reads it.
 *
 * `after:bg-current` rather than a fixed colour, so the line is whatever the
 * text is. That is what lets the footer use it: the links there are white on
 * the dark green, where the old `after:bg-primary` would have drawn a dark
 * green line on dark green and shown nothing.
 *
 * **No display class here on purpose.** The line is absolutely positioned
 * inside the link, so the link only has to be `relative` and as wide as its
 * text. Most call sites want `inline-block`; a link that is already a flex row,
 * like the address in the footer, wants `w-fit` and nothing else. Adding
 * `inline-block` here would break those.
 */
export const HOVER_UNDERLINE =
  "relative cursor-pointer after:absolute after:left-0 after:top-[110%] after:h-px after:w-full after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[cubic-bezier(.86,0,.07,1)] hover:after:origin-bottom-left hover:after:scale-x-100";

/** Drawn already, for the page being viewed. */
export const UNDERLINE_DRAWN = "after:origin-bottom-left after:scale-x-100";

/** The common case: an inline link that sizes to its own text. */
export const HOVER_UNDERLINE_INLINE = `inline-block ${HOVER_UNDERLINE}`;

/**
 * The same sweep, driven by a parent marked `group` rather than by the link
 * itself.
 *
 * Cards do this: the whole card is the hover target and the title is what
 * reacts, which is why those call sites used `group-hover:underline` before.
 * The link still needs `relative` for the line to sit inside it.
 */
export const GROUP_HOVER_UNDERLINE =
  "relative after:absolute after:left-0 after:top-[110%] after:h-px after:w-full after:origin-bottom-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[cubic-bezier(.86,0,.07,1)] group-hover:after:origin-bottom-left group-hover:after:scale-x-100";
