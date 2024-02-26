import Image from 'next/image';
import ContactDetails from './ContactDetails';
import Newsletter from '../Home/Newsletter';

export default function ContactUs({ }) {
  return (
    <>
      <section className='relative bg-white h-[435px] md:h-[1136px]'>
        <Image
          src="/images/contact-leaves.jpg"
          // src={builder
          //   .image(bgImage)
          //   .quality(80)
          //   .size(1440, 1080)
          //   .auto('format')
          //   .url()}
          width={1438}
          height={1136}
          alt="alt"
          className='w-full h-full object-fit'
        />
        <div className='absolute inset-0 flex items-center justify-center pt-12'>
          <div className='container flex flex-col gap-2 md:gap-4 pt-8 md:py-16 pb-12'>
            <div className='flex justify-start'>
              <h1 className='text-[32px] md:text-[42px] 2xl:text-[72px] mb-6'>Contact Us</h1>
            </div>
            <h2>Location</h2>
            <p className='md:text-xl 2xl:text-3xl'>
              West Corner Suite, 989 Eglinton Ave W, <br />
              York, ON, M6C 2C6
            </p>
            <h3>Email</h3>
            <p className='md:text-xl 2xl:text-3xl'>hello@curatehealth.ca</p>
            <h4>Phone</h4>
            <p className='md:text-xl 2xl:text-3xl'>(728)-682-2618</p>
          </div>
        </div>
      </section>
      <ContactDetails></ContactDetails>
      <Newsletter></Newsletter>
    </>
  )
}