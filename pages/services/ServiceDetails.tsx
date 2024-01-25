import Image from 'next/image';

export default function ServiceDetails({ service }) {
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
      <p className='container'>{service.body}</p>
    </section>
  );
}
