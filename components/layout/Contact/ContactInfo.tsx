import imageUrlBuilder from '@sanity/image-url';
import { Mail, MapPin, Phone, MessageSquareShare } from 'lucide-react';
import Image from 'next/image';
import { dataset, projectId } from '../../../sanity/env';
import { useEffect } from 'react';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ContactInfo({ contactInfo, feedbackLink }) {
  const {
    streetAddress,
    postalAddress,
    emailAddress,
    phoneNumber,
    contactInfoImage,
    hrefDirections,
  } = contactInfo;

  const { youformId, linkText } = feedbackLink;

  useEffect(() => {
    // Load the YouForm script dynamically if it's not already loaded
    const script = document.createElement('script');
    script.src = 'https://embed.youform.com/js/youform.js'; // Add the correct YouForm script URL here
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const phNumDestructured = phoneNumber.toString().replace(/[^+\d]+/g, "");

  return (
    <>
      <section className='relative bg-white h-[524px] md:h-[960px]'>
        <Image
          priority={true}
          width={1440}
          height={936}
          alt={`${contactInfoImage.alt}`}
          src={builder.image(contactInfoImage).width(1440).height(936).url()}
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 flex items-center justify-center pt-12'>
          <div className='container flex flex-col gap-2 md:gap-4 pt-8 md:py-16 pb-12'>
            <div className='flex justify-start'>
              <h1 className='text-[28px] md:text-[50px] lg:text-[72px] mb-6'>
                Contact Information
              </h1>
            </div>
            <address>
              {/* Location Section */}
              <div className='flex gap-3'>
                <MapPin className='w-[18px] h-[18px] md:w-[24px] md:h-[24px]' />
                <h2 className='text-[10px] md:text-[14px] lg:text-[18px] not-italic pt-0.5 lg:pt-0 lg:-mt-0.5'>
                  Location
                </h2>
              </div>
              <div className='pb-0'>
                <a
                  className='text-[14px] md:text-[28px] lg:text-[32px] not-italic cursor-pointer block md:inline pr-10 md:pr-0 pl-8 md:pl-9'
                  target='_blank'
                  href={hrefDirections}
                >
                  {streetAddress}
                </a>
              </div>
              <div className='indent-8 md:indent-9 pb-4'>
                <a
                  className='text-[14px] md:text-[28px] lg:text-[32px] not-italic'
                  target='_blank'
                  href={hrefDirections}
                >
                  {postalAddress}
                </a>
              </div>

              {/* Email Section */}
              <div className='flex gap-3'>
                <Mail className='w-[18px] h-[18px] md:w-[24px] md:h-[24px]' />
                <h3 className='text-[10px] md:text-[14px] lg:text-[18px] not-italic pt-0.5 lg:pt-0 lg:-mt-0.5'>
                  Email
                </h3>
              </div>
              <div className='indent-8 md:indent-9 pb-4'>
                <a
                  className='text-[14px] md:text-[28px] lg:text-[32px] not-italic'
                  target='_blank'
                  href={'mailto:' + emailAddress}
                >
                  {emailAddress}
                </a>
              </div>

              {/* Phone Section */}
              <div className='flex gap-3'>
                <Phone className='w-[18px] h-[18px] md:w-[24px] md:h-[24px]' />
                <h4 className='text-[10px] md:text-[14px] lg:text-[18px] not-italic pt-0.5 lg:pt-0 lg:-mt-0.5'>
                  Phone
                </h4>
              </div>
              <div className='indent-8 md:indent-9 pb-4'>
                <a
                  className='text-[14px] md:text-[28px] lg:text-[32px] not-italic'
                  target='_blank'
                  href={'tel:' + phNumDestructured}
                >
                  {phoneNumber}
                </a>
              </div>

              {/* Feedback Section */}
              <div className='flex gap-3'>
                <MessageSquareShare className='w-[18px] h-[18px] md:w-[24px] md:h-[24px]' />
                <h4 className='text-[10px] md:text-[14px] lg:text-[18px] not-italic pt-0.5 lg:pt-0 lg:-mt-0.5'>
                  Feedback
                </h4>
              </div>
              <div className='pb-4'>
                <a
                  className='text-[14px] md:text-[28px] lg:text-[32px] not-italic cursor-pointer block md:inline pr-10 md:pr-0 pl-8 md:pl-9'
                  data-youform-open={youformId}
                  data-youform-position="center"
                >
                  {linkText}
                </a>
              </div>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}

