import { getTeamMemberUrl } from "@/lib/utils";

/**
 * Stored in Sanity `author.linkedTeamMemberName` when the byline should link to
 * `/about/our-team` without opening a specific staff member.
 */
export const AUTHOR_TEAM_PROFILE_PAGE_ONLY = "__CURATE_HEALTH_TEAM_PAGE__";

/** Byline / Studio preview label from `author.linkedTeamMemberName` (no separate name field). */
export function getBlogAuthorDisplayName(
  linkedTeamMemberName: string | null | undefined,
): string {
  const key = linkedTeamMemberName?.trim();
  if (!key) return "";
  if (key === AUTHOR_TEAM_PROFILE_PAGE_ONLY) return "Curate Health Team";
  return key;
}

export function getBlogAuthorTeamHref(
  linkedTeamMemberName: string | null | undefined
): string | null {
  const key = linkedTeamMemberName?.trim();
  if (!key) return null;
  if (key === AUTHOR_TEAM_PROFILE_PAGE_ONLY) return "/about/our-team";
  return getTeamMemberUrl("/about/our-team", key);
}
