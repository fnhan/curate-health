import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MoveUpRightIcon,
  YoutubeIcon,
} from "lucide-react";

/**
 * The brand mark for a social platform, by the name stored in Sanity.
 *
 * WHY THERE IS A FALLBACK AND WHY IT IS NOT A BLANK
 *
 * The platform name is a free-text field in the Studio, so it can be anything
 * an editor types, including a platform this file has never heard of. An
 * unmatched name falls back to the arrow the footer used before there were any
 * icons, so a new platform renders as a plain link rather than as nothing. A
 * missing icon should look unstyled, never invisible.
 *
 * Matching is loose on purpose: "Instagram (Cafe)" and "instagram" both find
 * the Instagram mark, because the stored names already vary and asking editors
 * to type an exact token would break the first time somebody did not.
 *
 * TIKTOK IS HAND-DRAWN
 *
 * lucide-react carries Instagram, Facebook, LinkedIn and YouTube but has no
 * TikTok mark; the brand icons were dropped from the library. Rather than add a
 * dependency for one glyph, the path is inline below. It is TikTok's own mark,
 * used to link to Curate's own profile, which is what the brand guidelines
 * allow.
 */

/**
 * size is string | number because that is what lucide's own icons accept, and
 * these have to be interchangeable with them in the ICONS table below. Narrowing
 * it to number makes every lucide icon fail to assign.
 */
type IconProps = { className?: string; size?: string | number };

/**
 * Drawn to match the others rather than to match TikTok's own artwork.
 *
 * The first version of this was TikTok's solid glyph, which sat wrong beside
 * three outlines: one filled mark among strokes reads as a mistake at 16px.
 * This is a single stroked path on lucide's grid, 24 by 24 with a 2px round
 * cap, so the five marks in the footer share one weight. One arc for the note
 * head, a stem, one arc for the flag.
 */
function TikTokIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      role="img"
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

/** Checked in order, so the more specific name has to come first. */
const ICONS: Array<[RegExp, React.ComponentType<IconProps>]> = [
  [/tiktok/i, TikTokIcon],
  [/instagram/i, InstagramIcon],
  [/facebook/i, FacebookIcon],
  [/linked\s*in/i, LinkedinIcon],
  [/youtube/i, YoutubeIcon],
];

export function SocialIcon({
  platform,
  className,
  size = 16,
}: {
  platform: string | null | undefined;
  className?: string;
  size?: number;
}) {
  const match = ICONS.find(([pattern]) => pattern.test(platform ?? ""));
  const Icon = match ? match[1] : MoveUpRightIcon;

  return <Icon className={className} size={size} />;
}

/**
 * Whether this platform has a real brand mark.
 *
 * The footer uses it to decide between showing the icon alone and keeping the
 * platform name beside it. An unrecognised platform keeps its name, because an
 * anonymous arrow tells a visitor nothing about where the link goes.
 */
export function hasBrandIcon(platform: string | null | undefined) {
  return ICONS.some(([pattern]) => pattern.test(platform ?? ""));
}
