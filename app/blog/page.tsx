import Link from "next/link";

import BlogAuthorByline, {
  blogAuthorShouldRender,
} from "@/components/shared/blog-author-byline";
import { SanityImage } from "@/components/shared/sanity-image";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BLOG_DESCRIPTION, withBlogFeed } from "@/lib/blog-feed";
import { HOVER_UNDERLINE } from "@/lib/hover-underline";
import { buildPageMetadata } from "@/lib/page-metadata";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  BLOG_PAGE_QUERY_RESULT,
  GET_ALL_POSTS_QUERY_RESULT,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { BLOG_PAGE_QUERY, GET_ALL_POSTS_QUERY } from "@/sanity/lib/queries";

export default async function BlogPage() {
  const posts = await sanityFetch<GET_ALL_POSTS_QUERY_RESULT>({
    query: GET_ALL_POSTS_QUERY,
  });

  return (
    <div className="container flex flex-col gap-20 py-20">
      <h1 className="text-4xl">Blog</h1>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 2xl:grid-cols-3">
        {posts.map((post) => (
          <Card
            key={post._id}
            className="rounded-none border-b-0 border-l border-r-0 border-t-0 border-white bg-transparent"
          >
            <CardHeader className="pt-0">
              <CardTitle className="text-pretty pb-10 text-2xl not-italic text-white">
                <Link
                  href={`/blog/${post.slug}`}
                  className={cn("w-fit font-normal", HOVER_UNDERLINE)}
                >
                  {post.title}
                </Link>
              </CardTitle>
              {/*
                The photograph and the excerpt both open the post, so the whole
                card behaves the way people already expect a card to behave.
                A hard rule for every post from 2026-10-12, see CLAUDE.md.

                Both carry tabIndex={-1} so they add no keyboard stops: the
                title above and "Read more" below already reach the same post,
                and four tab stops per card to one destination is a worse
                experience than two. The image link is also aria-hidden,
                because the title link already names the post and a screen
                reader gains nothing from hearing it a third time. The excerpt
                is not hidden, since it is the only place that text appears.
              */}
              <Link
                href={`/blog/${post.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className="block"
              >
                <SanityImage
                  sizes="(min-width: 1536px) 30vw, (min-width: 768px) 45vw, 90vw"
                  source={post.mainImage}
                  src={post.mainImage?.asset?.url || ""}
                  alt={post.mainImage?.alt ?? ""}
                  width={300}
                  height={300}
                  className="mx-auto h-56 w-full object-cover transition-opacity hover:opacity-90"
                />
              </Link>
              <CardDescription className="py-7 text-white">
                <Link
                  href={`/blog/${post.slug}`}
                  tabIndex={-1}
                  className={cn("w-fit", HOVER_UNDERLINE)}
                >
                  {post.excerpt}
                </Link>
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex w-full flex-col items-start gap-6 pb-0 text-secondary">
              {blogAuthorShouldRender(post.author) ? (
                <BlogAuthorByline
                  author={post.author!}
                  className="text-secondary"
                />
              ) : null}
              <div className="flex w-full items-center justify-between">
                <span className="text-sm">
                  {formatDate(post.publishedAt || "")}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className={cn("w-fit italic text-white", HOVER_UNDERLINE)}
                >
                  Read more about {post.title}
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * /blog had no metadata of its own, so it inherited the root layout and shared
 * the homepage's title and description verbatim. Three pages presenting as one
 * page is CH-006.
 *
 * Editable in the Studio under "SEO For The Blog Page" on the homepage's blog
 * section, since 2026-09-18, when /blog was found sharing with no image. The
 * title and description below are the fallbacks, and the description is the
 * feed's too, see lib/blog-feed.ts. The share image falls back to the newest
 * post's photo. The feed link tag is CH-105.
 */
export async function generateMetadata() {
  const data = await sanityFetch<BLOG_PAGE_QUERY_RESULT>({
    query: BLOG_PAGE_QUERY,
  });

  const latest = data?.latestImage;

  return withBlogFeed(
    buildPageMetadata(data?.page?.seo ?? null, {
      path: "/blog",
      title: "Blog",
      description: BLOG_DESCRIPTION,
      image: latest?.asset?.url
        ? {
            asset: {
              _id: latest.asset._id,
              url: latest.asset.url,
              alt: latest.alt,
            },
            crop: latest.crop ?? null,
            hotspot: latest.hotspot ?? null,
          }
        : undefined,
    })
  );
}
