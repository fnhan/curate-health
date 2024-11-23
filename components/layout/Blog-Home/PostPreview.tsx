import Link from "next/link";

import { SanityDocument } from "next-sanity";

import CoverImage from "./CoverImage";
import Date from "./Date";

export default function PostPreview({ post }: { post: SanityDocument }) {
  if (!post) {
    return <div>Loading or no post found...</div>;
  }

  const { title, mainImage, excerpt, slug, publishedAt } = post;

  return (
    <div className="flex flex-col gap-6 border-l pl-4 md:gap-8 2xl:gap-16">
      <h3 className="flex-grow text-2xl md:text-4xl">
        <Link
          href={`/blog/${slug.current}`}
          className="border-b border-transparent transition-all duration-300 hover:border-current"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </h3>
      <div className="flex flex-grow items-center justify-center">
        {mainImage && (
          <CoverImage title={title} mainImage={mainImage} slug={slug} />
        )}
      </div>
      <div className="flex flex-col gap-6">
        <div
          className="text-sm leading-relaxed md:text-base"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
        <div className="flex justify-between text-xs md:text-sm">
          <Date dateString={publishedAt} />
          <Link
            className="italic text-secondary transition-all duration-300 hover:text-white hover:underline"
            href={`/blog/${slug.current}`}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}
