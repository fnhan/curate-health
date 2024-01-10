import Link from 'next/link';
import HoverLink from './HoverLink';

export default function Services() {
  return (
    <section>
      <div className='container pt-9'>
        <h2 className='mb-8 text-secondary md:text-xl'>Sevices</h2>
        <ul className='flex flex-col gap-2 pb-20'>
          <li className='text-2xl'>
            <Link href='/services/'>
              <span className='border-b border-transparent hover:border-current transition duration-300'>
                Lifestyle Medicine
              </span>
            </Link>
          </li>
          <li className='text-2xl'>
            <Link href='/services/'>
              <span className='border-b border-transparent hover:border-current transition duration-300'>
                Surgical Consultations
              </span>
            </Link>
          </li>
          <li className='text-2xl'>
            <Link href='/services/'>
              <span className='border-b border-transparent hover:border-current transition duration-300'>
                Rehab
              </span>
            </Link>
          </li>
          <li className='text-2xl'>
            <Link href='/services/'>
              <span className='border-b border-transparent hover:border-current transition duration-300'>
                Performance Training
              </span>
            </Link>
          </li>
          <li className='text-2xl'>
            <Link href='/services/'>
              <span className='border-b border-transparent hover:border-current transition duration-300'>
                Mental Health
              </span>
            </Link>
          </li>
          <li className='text-2xl'>
            <Link href='/services/'>
              <span className='border-b border-transparent hover:border-current transition duration-300'>
                Recovery Sanctuary
              </span>
            </Link>
          </li>
        </ul>
      </div>
      <Link className='w-full' href={'/about'}>
        <HoverLink text="More About Our Services" />
      </Link>
    </section>
  );
}
