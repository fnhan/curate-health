import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import PostPreview from '../Blog-Home/PostPreview';

export default function Blog({ posts = [] }) {
  return (
    <section>
      <div className='container py-9 md:py-14 2xl:py-18'>
        <h2 className='md:text-xl 2xl:text-3xl mb-10'>Blog</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-32 gap-y-20 md:gap-y-32 mb-32'>
          {posts.map(({ node }) => (
            <PostPreview
              key={node.slug}
              title={node.title}
              coverImage={node.featuredImage}
              date={node.date}
              author={node.author}
              slug={node.slug}
              excerpt={node.excerpt}
            />
          ))}
        </div>
      </div>
      <Link className='w-full' href={'/about'}>
        <div className='container border-t duration-300 transition-all hover:bg-secondary  hover:text-white py-5 text-right block font-denton'>
          <div className='flex items-center gap-2 hover:gap-4 transition-all duration-300 justify-end'>
            <span className=''>Explore more</span>
            <ChevronRight className='w-5' />
          </div>
        </div>
      </Link>
    </section>
  );
}
