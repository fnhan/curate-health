import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBlogAuthorDisplayName, getBlogAuthorTeamHref } from "@/lib/author-team-link";
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
  author: BlogAuthorBylineAuthor | null | undefined,
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

  const inner = (
    <>
      <Avatar className="size-12 shrink-0 border border-primary/10 bg-white/80">
        <AvatarImage
          src={imageUrl}
          alt={displayName ? `${displayName} portrait` : ""}
        />
        <AvatarFallback className="bg-white text-black">
          {displayName ? displayName.slice(0, 2).toUpperCase() : "?"}
        </AvatarFallback>
      </Avatar>
      {displayName ? (
        <span className="text-sm group-hover:underline">{displayName}</span>
      ) : null}
    </>
  );

  const rowClass = cn("flex items-center gap-4", className);

  if (teamHref) {
    return (
      <Link
        href={teamHref}
        className={cn(
          rowClass,
          "group rounded-md outline-offset-4 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
        )}
        aria-label={
          displayName
            ? `${displayName} — view on Our Team`
            : "View on Our Team"
        }
      >
        {inner}
      </Link>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}
