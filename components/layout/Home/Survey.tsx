import Image from 'next/image';
import Link from 'next/link';
import ShapesBG from 'public/images/Shapes.png';

export default function Survey() {
  return (
    <section className='relative bg-platinum h-[435px] md:h-[649px]'>
      {' '}
      {/* Adjust height as needed */}
      <Image
        src={ShapesBG}
        alt='Decorative background'
        layout='fill'
        objectFit='cover'
        className='w-full h-full'
      />
      <div className='absolute inset-0 flex items-center justify-center p-4'>
        <Link
          href={'/survey'}
          className='bg-white hover:bg-white/50 transition-all duration-300 text-black text-center rounded-full p-5 flex items-center justify-center flex-col gap-3 h-72 w-72'>
          <h4 className='text-lg md:text-xl font-semibold capitalize'>
            Start your journey
          </h4>
          <p className='text-sm md:text-base'>
            Help us customize your wellness plan. Take our quick survey and step
            towards personalized health with Curate Health.
          </p>
          <p className='font-denton'>Take the survey</p>
        </Link>
      </div>
    </section>
  );
}
