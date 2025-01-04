import Image from "next/image";
import { notFound } from "next/navigation";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      <section>
        <Image
          src={mainImage?.image!}
          alt={mainImage?.alt!}
          width={1440}
          height={1080}
          className="h-[400px] w-full object-cover md:h-[550px]"
        />
      </section>
      <div className="pt-20">
        <div className="container flex flex-col items-center gap-8 text-primary md:flex-row md:items-start md:justify-between">
          <h1 className="text-balance text-center text-2xl md:text-left md:text-4xl">
            {title}
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={author?.image?.asset?.url!} />
                <AvatarFallback className="bg-white text-black">
                  {author?.name?.slice(0, 2)!}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{author?.name}</span>
            </div>
            <div className="text-balance text-sm">
              Published: {formatDate(publishedAt!)}
            </div>
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

  const { seo } = post!;

  return {
    title: seo?.pageTitle,
    description: seo?.pageDescription,
    openGraph: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.ogImage?.asset?.url!,
        alt: seo?.socialMeta?.ogImage?.asset?.alt!,
      },
    },
    twitter: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.twitterImage?.asset?.url!,
        alt: seo?.socialMeta?.twitterImage?.asset?.alt!,
      },
    },
  };
}
