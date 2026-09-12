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

function TikTokIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      role="img"
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06v-3.1a5.66 5.66 0 0 0-.77-.05A5.66 5.66 0 1 0 15.54 15.4V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48z" />
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
