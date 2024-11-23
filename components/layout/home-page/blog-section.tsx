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
      <div className="2xl:py-18 container py-9 md:py-14">
        <h2 className="mb-10 md:text-xl 2xl:text-3xl">{sectionTitle}</h2>
        <FeaturedBlogPosts />
      </div>
      <HoverLink href={hoverLinkHref!} text={hoverLinkText!} />
    </section>
  );
}
