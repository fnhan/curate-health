import { getMostRecentPosts } from 'lib/utils';
import { SanityDocument } from 'next-sanity';
import PostPreview from './PostPreview';

export default function FeaturedPosts({ posts }: { posts: SanityDocument[] }) {
  const recentPosts = getMostRecentPosts(posts);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>
      {recentPosts.map((post, index) => (
        <PostPreview key={index} post={post} />
      ))}
    </div>
  );
}
