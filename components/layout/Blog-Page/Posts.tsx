import Link from "next/link";

import { SanityDocument } from "next-sanity";

export default function Posts({ posts }: { posts: SanityDocument[] }) {
  return (
    <div className="flex flex-col gap-6 border-l pl-4 md:gap-8 2xl:gap-16">
      {posts?.length > 0 ? (
        posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug.current}`}>
            <h2 className="p-4 text-white hover:bg-blue-50 hover:text-black">
              {post.title}
            </h2>
          </Link>
        ))
      ) : (
        <div className="p-4 text-red-500">No posts found</div>
      )}
    </div>
  );
}
