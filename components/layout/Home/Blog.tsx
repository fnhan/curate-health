import { SanityDocument } from 'next-sanity';
import FeaturedPosts from '../Blog-Home/FeaturedPosts';
import HoverLink from './HoverLink';

type PageProps = {
  posts: SanityDocument[];
};

export default function Blog(props: PageProps) {
  return (
    <section>
      <div className='container py-9 md:py-14 2xl:py-18'>
        <h2 className='md:text-xl 2xl:text-3xl mb-10'>Blog</h2>
        <FeaturedPosts posts={props.posts} />
      </div>
      <HoverLink href='/blog' text='Explore More' />
    </section>
  );
}
