import Image from 'next/image';
import ContactDetails from './ContactDetails';
import Newsletter from '../Home/Newsletter';
import { MapPin, Mail, Phone } from 'lucide-react';

export default function ContactUs({ }) {
  return (
    <>
      <section className='relative bg-white h-[435px] md:h-[936px]'>
        <Image
          src="/images/bark.jpg"
          // src={builder
          //   .image(bgImage)
          //   .quality(80)
          //   .size(1440, 1080)
          //   .auto('format')
          //   .url()}
          width={1440}
          height={936}
          alt="alt"
          className='w-full h-full object-fit'
        />
        <div className='absolute inset-0 flex items-center justify-center pt-12'>
          <div className='container flex flex-col gap-2 md:gap-4 pt-8 md:py-16 pb-12'>
            <div className='flex justify-start'>
              <h1 className='text-[32px] md:text-[42px] 2xl:text-[72px] mb-6'>Contact Info</h1>
            </div>
            <div className='flex gap-3 -mb-2'>
              <MapPin />
              <h2>Location</h2>
            </div>
            <div className='indent-9 -mb-3'>
              <span className='md:text-xl 2xl:text-3xl'>
                West Corner Suite, 989 Eglinton Ave W,
              </span>
            </div>
            <div className='indent-9 pb-4'>
              <span className='md:text-xl 2xl:text-3xl'>
                York, ON, M6C 2C6
              </span>
            </div>
            <div className='flex gap-3 -mb-2'>
              <Mail />
              <h3>Email</h3>
            </div>
            <div className='indent-9 pb-4'>
              <span className='md:text-xl 2xl:text-3xl'>
                hello@curatehealth.ca
              </span>
            </div>
            <div className='flex gap-3 -mb-2'>
              <Phone />
              <h4>Phone</h4>
            </div>
            <div className='indent-9 pb-4'>
              <span className='md:text-xl 2xl:text-3xl'>
                (728)-682-2618
              </span>
            </div>
          </div>
        </div>
      </section >
      <ContactDetails></ContactDetails>
      <Newsletter></Newsletter>
    </>
  )
}