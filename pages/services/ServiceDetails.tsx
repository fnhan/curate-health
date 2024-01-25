import { Button } from 'components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

export default function ServiceDetails({ service }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const excerptLength = 300;

  // temporarily
  if (!service) {
    return <div>Loading...</div>;
  }

  return (
    <section className='text-white' id={service.id}>
      <div className='container text-2xl font-denton tracking-widest flex justify-center md:justify-start mb-2'>
        <h2 className='border-b'>{service.title}</h2>
      </div>
      <Image
        loading='lazy'
        width={1080}
        height={1440}
        src={service.image}
        alt={service.title}
        className='w-full object-cover object-center max-h-[280px] md:max-h-[625px] mb-12'
      />
      <div className='container'>
        <p>
          {isExpanded
            ? service.body
            : `${service.body.substring(0, excerptLength)}...`}
        </p>
        <Button
          variant='ghost'
          onClick={toggleExpanded}
          className='p-0 hover:bg-transparent font-denton-condesnsed text-secondary hover:underline hover:text-white duration-300 transition-all'>
          {isExpanded ? 'Show Less' : 'Read More'}
        </Button>
      </div>
    </section>
  );
}
