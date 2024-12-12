import HoverLink from "@/components/shared/hover-link";
import { BLOG_SECTION_QUERYResult } from "@/sanity.types";

import FeaturedBlogPosts from "./featured-blog-posts";

export default function BlogSection({
  blogSection,
}: {
  blogSection: BLOG_SECTION_QUERYResult;
}) {
  if (!blogSection) return null;

  const { sectionTitle, hoverLinkText, hoverLinkHref } = blogSection;

  return (
    <section id="blog">
      <div className="container flex flex-col gap-10 py-14 md:gap-20 md:py-24">
        <h2 className="text-2xl md:text-3xl xl:text-6xl">{sectionTitle}</h2>
        <FeaturedBlogPosts />
      </div>
      <HoverLink href={hoverLinkHref!} text={hoverLinkText!} />
    </section>
  );
}
