import Link from 'next/link';
import Avatar from './Avatar';
import CoverImage from './CoverImage';
import Date from './Date';

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}) {
  return (
    <div className='border-l pl-4 flex flex-col gap-6 md:gap-8 2xl:gap-16'>
      <h3 className='text-2xl md:text-4xl flex-grow'>
        <Link
          href={`/posts/${slug}`}
          className='duration-300 transition-all border-b border-transparent hover:border-current'
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </h3>
      <div className='flex justify-center items-center flex-grow'>
        {coverImage && (
          <CoverImage title={title} coverImage={coverImage} slug={slug} />
        )}
      </div>
      <div className='flex flex-col gap-6'>
        <div
          className='text-sm md:text-base leading-relaxed'
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
        <div className='text-xs md:text-sm flex justify-between'>
          <Date dateString={date} />
          <Link
            className='text-secondary italic font-denton hover:text-white hover:underline duration-300 transition-all'
            href={`/posts/${slug}`}>
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
}
