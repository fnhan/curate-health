import Image from 'next/image';
import highlightCircleText from 'public/images/CircleText.png';
import highlightImage from 'public/images/HighlightImage.png';

export default function Highlight() {
  return (
    <section className='w-full bg-primary'>
      <div className='container py-40 flex flex-col gap-20'>
        <div>
          <h3 className='text-4xl max-w-[544px] font-light'>
            Discover a unique approach to health and wellness, tailored to meet
            your individual needs
          </h3>
        </div>
        <div className='flex justify-center relative'>
          <Image width={536} height={536} alt='' src={highlightImage} />
          <div className='absolute right-60'>
            <Image src={highlightCircleText} width={287} height={287} alt='' />
          </div>
        </div>
        <div className='flex justify-end'>
          <h3 className='text-4xl max-w-[544px] font-light'>
            Explore our comprehensive services and embark on a journey to a
            healthier you.
          </h3>
        </div>
      </div>
    </section>
  );
}
