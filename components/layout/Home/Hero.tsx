import { PortableText } from '@portabletext/react';
import BookAppointment from '../Buttons/BookAppointment';

export default function Hero({ heroSection }) {
  const bgImageUrl = heroSection.bgImage?.asset?.url;

  return (
    <section
      style={{ backgroundImage: `url(${bgImageUrl})` }}
      className='bg-cover bg-fixed flex justify-center items-center flex-col min-h-screen text-white'>
      <h1 className='text-[32px] md:text-[42px] 2xl:text-[72px] text-center mb-6'>
        <PortableText value={heroSection.heroText} />
      </h1>
      <BookAppointment />
    </section>
  );
}
