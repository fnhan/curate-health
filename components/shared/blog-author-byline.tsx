import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AUTHOR_TEAM_PROFILE_PAGE_ONLY,
  getBlogAuthorDisplayName,
  getBlogAuthorTeamHref,
} from "@/lib/author-team-link";
import { cn } from "@/lib/utils";

export type BlogAuthorBylineAuthor = {
  linkedTeamMemberName?: string | null;
  image?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
};

export function blogAuthorShouldRender(
  author: BlogAuthorBylineAuthor | null | undefined
) {
  if (!author) return false;
  const imageUrl = author.image?.asset?.url;
  const displayName = getBlogAuthorDisplayName(author.linkedTeamMemberName);
  return Boolean(displayName || imageUrl);
}

export default function BlogAuthorByline({
  author,
  className,
}: {
  author: BlogAuthorBylineAuthor;
  className?: string;
}) {
  const imageUrl = author.image?.asset?.url ?? "";
  const displayName = getBlogAuthorDisplayName(author.linkedTeamMemberName);
  const teamHref = getBlogAuthorTeamHref(author.linkedTeamMemberName);

  /**
   * The house byline is the mark, not a face, and it is treated differently.
   *
   * The asset in Sanity is `logo-black.png`, pure black on transparency. In a
   * circular avatar with a white backing it read as a green mark with a white
   * rim against the dark green footer, which is not the logo. So for this one
   * author the backing and the ring come off and the mark is painted white
   * with the same brightness-0 invert the B Corp mark uses.
   *
   * A real practitioner keeps the ring and the backing: a photograph needs a
   * frame, and inverting one would be absurd. The portrait is also grayscale
   * until the row is hovered, which is what every other photograph of a
   * practitioner on this site does, on the team page and in the hub grids.
   * The mark is not: it is painted flat white already, so grayscale on it is
   * a no-op and a hover that changes nothing reads as a broken hover.
   */
  const isHouseByline =
    author.linkedTeamMemberName?.trim() === AUTHOR_TEAM_PROFILE_PAGE_ONLY;

  const inner = (
    <>
      <Avatar
        className={cn(
          "size-12 shrink-0",
          isHouseByline
            ? "bg-transparent"
            : "border border-primary/10 bg-white/80"
        )}
      >
        <AvatarImage
          src={imageUrl}
          alt={displayName ? `${displayName} portrait` : ""}
          className={
            isHouseByline
              ? "brightness-0 invert"
              : "grayscale transition-all duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0"
          }
        />
        <AvatarFallback
          className={
            isHouseByline ? "bg-transparent text-white" : "bg-white text-black"
          }
        >
          {displayName ? displayName.slice(0, 2).toUpperCase() : "?"}
        </AvatarFallback>
      </Avatar>
      {displayName ? (
        // underlined only when the row is a link, now that `group` is on
        // every row rather than only on the linked one
        <span className={cn("text-sm", teamHref && "group-hover:underline")}>
          {displayName}
        </span>
      ) : null}
    </>
  );

  /**
   * `group` is on the row rather than only on the link, so a byline with no
   * practitioner page still colours its portrait when the reader hovers it.
   */
  const rowClass = cn("group flex items-center gap-4", className);

  if (teamHref) {
    return (
      <Link
        href={teamHref}
        className={cn(
          rowClass,
          "rounded-md outline-offset-4 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        )}
        aria-label={
          displayName ? `${displayName}, view on Our Team` : "View on Our Team"
        }
      >
        {inner}
      </Link>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}
