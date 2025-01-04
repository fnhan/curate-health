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
    <div className="flex flex-col gap-6 border-l pl-4 md:gap-8 2xl:gap-16">
      <h3 className="flex-grow text-2xl md:text-4xl">
        <Link
          href={`/blog/${slug?.current}`}
          className="border-b border-transparent transition-all duration-300 hover:border-current"
          dangerouslySetInnerHTML={{ __html: title! }}
        />
      </h3>
      <div className="flex flex-grow items-center justify-center">
        {mainImage && (
          <CoverImage
            title={title!}
            mainImage={mainImage!}
            slug={{ current: slug?.current! }}
          />
        )}
      </div>
      <div className="flex flex-col gap-6">
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
        "hover:shadow-medium max-w-[154px] transition-shadow duration-200 md:max-w-[190px] 2xl:max-w-[300px]":
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
