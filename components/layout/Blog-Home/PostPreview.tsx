import { SanityDocument } from 'next-sanity';
import Link from 'next/link';
import CoverImage from './CoverImage';
import Date from './Date';

export default function PostPreview({ post }: { post: SanityDocument }) {
  if (!post) {
    return <div>Loading or no post found...</div>;
  }

  const { title, mainImage, excerpt, slug, publishedAt } = post;

  console.log(post);

  return (
    <div className='border-l pl-4 flex flex-col gap-6 md:gap-8 2xl:gap-16'>
      <h3 className='text-2xl md:text-4xl flex-grow'>
        <Link
          href={`/blog/${slug.current}`}
          className='duration-300 transition-all border-b border-transparent hover:border-current'
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </h3>
      <div className='flex justify-center items-center flex-grow'>
        {mainImage && (
          <CoverImage title={title} mainImage={mainImage} slug={slug} />
        )}
      </div>
      <div className='flex flex-col gap-6'>
        <div
          className='text-sm md:text-base leading-relaxed'
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
        <div className='text-xs md:text-sm flex justify-between'>
          <Date dateString={publishedAt} />
          <Link
            className='text-secondary italic font-denton hover:text-white hover:underline duration-300 transition-all'
            href={`/blog/${slug.current}`}>
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}
