import Image from "next/image";
import { notFound } from "next/navigation";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import BlogAuthorByline, {
  blogAuthorShouldRender,
} from "@/components/shared/blog-author-byline";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { LastUpdated } from "@/components/shared/last-updated";
import { withBlogFeed } from "@/lib/blog-feed";
import { postCrumbs } from "@/lib/breadcrumbs";
import { buildPageMetadata } from "@/lib/page-metadata";
import { JsonLdScript, buildBlogPostingJsonLd } from "@/lib/structured-data";
import { formatDate } from "@/lib/utils";
import { GET_POST_BY_SLUG_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { GET_POST_BY_SLUG_QUERY } from "@/sanity/lib/queries";

export default async function BlogPostPage({
  params,
}: {
  params: { post: string };
}) {
  const post = await sanityFetch<GET_POST_BY_SLUG_QUERYResult>({
    query: GET_POST_BY_SLUG_QUERY,
    params: { slug: params.post },
  });

  if (!post) {
    return notFound();
  }

  const { title, publishedAt, author, mainImage, sections } = post;

  return (
    <div className="bg-white">
      <JsonLdScript
        data={buildBlogPostingJsonLd(post)}
        id={`blogposting-${params.post}-json-ld`}
      />
      <section>
        <Image
          src={mainImage?.image!}
          alt={mainImage?.alt!}
          width={1920}
          height={1080}
          priority
          quality={100}
          sizes="100vw"
          className="h-[400px] w-full object-cover md:h-[550px]"
        />
      </section>
      <Breadcrumbs crumbs={postCrumbs(title!, params.post)} />
      <div className="pt-20">
        <div className="container flex flex-col items-center gap-8 text-primary md:flex-row md:items-start md:justify-between">
          <h1 className="text-balance text-center text-2xl md:text-left md:text-4xl">
            {title}
          </h1>
          <div className="flex flex-col gap-4">
            {blogAuthorShouldRender(author) ? (
              <BlogAuthorByline author={author!} />
            ) : null}
            <div className="text-balance text-sm">
              Published: {formatDate(publishedAt!)}
            </div>
            <LastUpdated date={post._updatedAt} className="text-balance" />
          </div>
        </div>
      </div>
      <AlternatingSections sections={sections!} />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { post: string };
}) {
  const post = await sanityFetch<GET_POST_BY_SLUG_QUERYResult>({
    query: GET_POST_BY_SLUG_QUERY,
    params: { slug: params.post },
  });

  // Same shape as the CH-001 defect on the services route: destructuring a
  // null result throws. Here the component below calls notFound() and that
  // currently wins, so unknown slugs already return 404 rather than 500,
  // verified against production. The guard makes the 404 explicit instead of
  // leaving it to depend on which error surfaces first.
  if (!post) {
    notFound();
  }

  const { seo, mainImage } = post;

  // The post's own photo is the share image when none is set under SEO, so a
  // new post never goes out as a bare link. Its dates are the two the page
  // shows, the same as its BlogPosting markup.
  return withBlogFeed(
    buildPageMetadata(seo, {
      path: `/blog/${params.post}`,
      image: mainImage?.image
        ? { asset: { url: mainImage.image, alt: mainImage.alt } }
        : undefined,
      article: {
        publishedTime: post.publishedAt,
        modifiedTime: post._updatedAt,
      },
    })
  );
}
