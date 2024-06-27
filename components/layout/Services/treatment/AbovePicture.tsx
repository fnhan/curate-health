import Image from 'next/image';
import ourServices from '../../../../public/images/our-service.jpg';

export default function AbovePicture() {
  return (
    <div className='relative'>
      <Image
        loading='lazy'
        width={1080}
        height={1440}
        src={ourServices}
        alt='Our Services'
        className='object-cover w-full h-[200px] md:h-[300px] 2xl:h-[400px]'
      />
    </div>
  );
}