import { SanityDocument } from 'next-sanity';
import Link from 'next/link';

export default function Posts({ posts }: { posts: SanityDocument[] }) {
  return (
    <div className='border-l pl-4 flex flex-col gap-6 md:gap-8 2xl:gap-16'>
      {posts?.length > 0 ? (
        posts.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug.current}`}>
            <h2 className='p-4 hover:bg-blue-50 hover:text-black text-white'>
              {post.title}
            </h2>
          </Link>
        ))
      ) : (
        <div className='p-4 text-red-500'>No posts found</div>
      )}
    </div>
  );
}
