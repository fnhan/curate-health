import Image from 'next/image';
import ContactDetails from './ContactDetails';
import Newsletter from '../Home/Newsletter';
import { MapPin, Mail, Phone } from 'lucide-react';
import SurveyLink from './SurveyLink';

export default function ContactUs({ }) {
  return (
    <>
      <section className='relative bg-white h-[524px] md:h-[960px]'>
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
              <h1 className='text-[28px] md:text-[50px] 2xl:text-[72px] mb-6'>Contact Info</h1>
            </div>
            <div className='flex gap-3 -mb-3'>
              <MapPin className="w-4.5 h-4.5 md:w-6 md:h-6" />
              <h2 className='text-2.5 md:text-4'>Location</h2>
            </div>
            <div className='indent-9 -mb-3'>
              <span className='text-[14px] md:text-[28px] 2xl:text-[32px]'>
                West Corner Suite, 989 Eglinton Ave W,
              </span>
            </div>
            <div className='indent-9 pb-4'>
              <span className='text-[14px] md:text-[28px] 2xl:text-[32px]'>
                York, ON, M6C 2C6
              </span>
            </div>
            <div className='flex gap-3 -mb-3'>
              <Mail className="w-4.5 h-4.5 md:w-6 md:h-6"/>
              <h3 className='text-2.5 md:text-4'>Email</h3>
            </div>
            <div className='indent-9 pb-4'>
              <span className='text-[14px] md:text-[28px] 2xl:text-[32px]'>
                hello@curatehealth.ca
              </span>
            </div>
            <div className='flex gap-3 -mb-3'>
              <Phone className="w-4.5 h-4.5 md:w-6 md:h-6"/>
              <h4 className='text-2.5 md:text-4'>Phone</h4>
            </div>
            <div className='indent-9 pb-4'>
              <span className='text-[14px] md:text-[28px] 2xl:text-[32px]'>
                (728)-682-2618
              </span>
            </div>
          </div>
        </div>
      </section >
      <ContactDetails />
      <SurveyLink />
      <Newsletter />
    </>
  )
}