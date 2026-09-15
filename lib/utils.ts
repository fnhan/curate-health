import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getMostRecentPosts = (posts, count = 2) => {
  return [...posts]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, count);
};

export function formatDate(dateString: string) {
  const date = parseISO(dateString);
  return format(date, "LLLL	d, yyyy");
}

/**
 * Clean slug to prevent malformed URLs that can occur during Sanity preview mode.
 * When in preview mode, reference fields (like slugs) can sometimes contain invisible
 * Unicode characters due to Sanity's document tracking. This function ensures URLs
 * remain clean by only allowing alphanumeric characters and hyphens.
 */
export const cleanSlug = (str: string) => str.replace(/[^\w-]/g, "");

/**
 * Generate a URL-friendly identifier for team members
 * Converts team member names to lowercase with hyphens for URL parameters
 */
export const getTeamMemberUrlId = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Generate a URL with team member parameter for opening accordion
 */
/**
 * The practitioner's own page address, from their display name. CH-104.
 *
 * Record slugs drop the dot in an honorific: "Dr. Frank Nhan" is
 * dr-frank-nhan. getTeamMemberUrlId keeps it, giving "dr.-frank-nhan", which
 * matches no page.
 */
export const getPractitionerSlugFromName = (name: string): string =>
  name.toLowerCase().replace(/\./g, "").trim().replace(/\s+/g, "-");

/**
 * Where a link to a named team member goes.
 *
 * It used to return /about/our-team?member={id}, which the team page read to
 * open that person's bio in an accordion. The accordion is gone and every
 * practitioner has a page, so a link arriving with ?member= would land on the
 * team page and open nothing. Blog author bylines are built here.
 */
export const getTeamMemberUrl = (baseUrl: string, memberName: string): string =>
  `${baseUrl}/${getPractitionerSlugFromName(memberName)}`;

/**
 * Extract only the first paragraph from PortableText content
 * Returns content up to the first double line break (two consecutive line breaks)
 */
export const getFirstParagraph = (portableTextContent: any[] | null | undefined): any[] | null | undefined => {
  if (!portableTextContent || !Array.isArray(portableTextContent)) {
    return portableTextContent;
  }

  // Convert PortableText to plain text to find paragraph breaks
  const extractText = (blocks: any[]): string => {
    return blocks.map(block => {
      if (block._type === 'block' && block.children) {
        return block.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join('\n');
  };

  const fullText = extractText(portableTextContent);

  // Find the first paragraph (up to double line break)
  const firstParagraphEnd = fullText.indexOf('\n\n');
  const firstParagraphText = firstParagraphEnd !== -1
    ? fullText.substring(0, firstParagraphEnd)
    : fullText;

  // Now find the blocks that contain this first paragraph
  let currentText = '';
  const firstParagraphBlocks: any[] = [];

  for (const block of portableTextContent) {
    if (block._type === 'block' && block.children) {
      const blockText = block.children.map((child: any) => child.text || '').join('');
      const newCurrentText = currentText + (currentText ? '\n' : '') + blockText;

      // Check if this block would exceed our first paragraph
      if (newCurrentText.length <= firstParagraphText.length) {
        firstParagraphBlocks.push(block);
        currentText = newCurrentText;
      } else {
        // This block contains content beyond the first paragraph
        // We need to truncate this block
        const remainingLength = firstParagraphText.length - currentText.length;
        if (remainingLength > 0) {
          const truncatedBlock = {
            ...block,
            children: block.children.map((child: any) => ({
              ...child,
              text: child.text ? child.text.substring(0, remainingLength) : child.text
            }))
          };
          firstParagraphBlocks.push(truncatedBlock);
        }
        break;
      }
    } else {
      // For non-block content, include it
      firstParagraphBlocks.push(block);
    }
  }

  return firstParagraphBlocks.length > 0 ? firstParagraphBlocks : portableTextContent;
};
