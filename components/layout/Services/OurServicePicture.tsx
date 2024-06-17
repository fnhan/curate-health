import Image from 'next/image';
import ourServices from '../../../public/images/our-service.jpg';

export default function OurServicePicture() {
  return (
    <div className='relative'>
      <Image
        loading='lazy'
        width={1080}
        height={1440}
        src={ourServices}
        alt='Our Services'
        className='object-cover w-full h-[400px] md:h-[300px] 2xl:h-[400px] opacity-60'
      />
      <div className='container absolute top-2/3  transform -translate-y-1/2 md:w-2/3'>
        <h1 className='container font-Poppins text-[24px] 2xl:text-[60px] md:text-[40px]'>About Our Services</h1>
        <div className='container font-Poppins font-light text-[10px] md:text-[12px] 2xl:text-[14px] leading-[24px] mt-8'>
          We offer a wide range of services to meet your needs. Our team of experts is dedicated to providing the highest quality of service to ensure your satisfaction.
        </div >
      </div>
    </div>
  );
}