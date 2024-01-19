import { SanityDocument } from 'next-sanity';
import { useLiveQuery } from 'next-sanity/preview';
import { POSTS_QUERY } from '../../../sanity/lib/queries';
import Posts from './Posts';

export default function PostsPreview({
  posts = [],
}: {
  posts: SanityDocument[];
}) {
  const [data] = useLiveQuery<SanityDocument[]>(posts, POSTS_QUERY);

  return <Posts posts={data} />;
}
