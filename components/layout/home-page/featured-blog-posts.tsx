import Image from "next/image";
import Link from "next/link";

import imageUrlBuilder from "@sanity/image-url";
import cn from "classnames";
import { format, parseISO } from "date-fns";
import { getMostRecentPosts } from "lib/utils";

import { POSTS_QUERYResult, POST_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { POSTS_QUERY } from "@/sanity/lib/queries";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default async function FeaturedBlogPosts() {
  const posts = await sanityFetch<POSTS_QUERYResult>({
    query: POSTS_QUERY,
  });

  const recentPosts = getMostRecentPosts(posts);

  return (
    <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
      {recentPosts.map((post, index) => (
        <Post key={index} post={post} />
      ))}
    </div>
  );
}

function Post({ post }: { post: POST_QUERYResult }) {
  if (!post) {
    return null;
  }

  const { title, mainImage, excerpt, slug, publishedAt } = post;

  return (
    <div className="flex flex-col gap-6 border-l pl-4">
      <div>
        <h3 className="flex-grow md:text-2xl lg:text-4xl 2xl:text-7xl">
          <Link
            href={`/blog/${slug?.current}`}
            className="border-b border-transparent transition-all duration-300 hover:border-current"
            dangerouslySetInnerHTML={{ __html: title! }}
          />
        </h3>
        {mainImage && (
          <CoverImage
            title={title!}
            mainImage={mainImage!}
            slug={{ current: slug?.current! }}
          />
        )}
      </div>
      <div className="mt-auto flex flex-col gap-6">
        <div
          className="text-sm leading-relaxed md:text-base"
          dangerouslySetInnerHTML={{ __html: excerpt! }}
        />
        <div className="flex justify-between text-xs md:text-sm">
          <Date dateString={publishedAt!} />
          <Link
            className="italic text-secondary transition-all duration-300 hover:text-white hover:underline"
            href={`/blog/${slug?.current}`}
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}

function CoverImage({
  title,
  mainImage,
  slug,
}: {
  title: string;
  mainImage: any;
  slug: { current: string };
}) {
  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={builder.image(mainImage).quality(100).url()}
      className={cn("shadow-small", {
        "hover:shadow-medium relative -z-10 mx-auto max-w-xs transition-shadow duration-200 md:-top-20 lg:-top-16 lg:max-w-md xl:-top-7 xl:max-w-lg":
          slug,
      })}
    />
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/blog/${slug.current}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
}

function Date({ dateString }) {
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, "LLLL	d, yyyy")}</time>;
}
