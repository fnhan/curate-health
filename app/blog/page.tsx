import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { GET_ALL_POSTS_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { GET_ALL_POSTS_QUERY } from "@/sanity/lib/queries";

export default async function BlogPage() {
  const posts = await sanityFetch<GET_ALL_POSTS_QUERYResult>({
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
                  className="font-normal hover:underline"
                >
                  {post.title}
                </Link>
              </CardTitle>
              <Image
                src={post.mainImage?.asset?.url || ""}
                alt={post.mainImage?.alt ?? ""}
                width={300}
                height={300}
                className="mx-auto h-56 w-full object-cover"
              />
              <CardDescription className="py-7 text-white">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex w-full flex-col items-start gap-6 pb-0 text-secondary">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={post.author?.image?.asset?.url || ""} />
                  <AvatarFallback className="bg-white text-black">
                    {post.author?.name?.slice(0, 2) || ""}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{post.author?.name}</span>
              </div>
              <div className="flex w-full items-center justify-between">
                <span className="text-sm">
                  {formatDate(post.publishedAt || "")}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="italic text-white hover:underline"
                >
                  Read More
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
