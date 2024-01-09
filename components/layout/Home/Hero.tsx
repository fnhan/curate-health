import BookAppointment from '../Buttons/BookAppointment';

export default function Hero() {
  return (
    <section className='flex justify-center items-center flex-col min-h-screen text-white container gap-6'>
      <h1 className='hidden md:block 2xl:text-[72px] text-[42px] text-center'>
        Health, Curated for <span className='font-bold'>you.</span>
      </h1>
      <h1 className='md:hidden text-[32px]'>
        Health, <br />
        Curated for <span className='font-bold'>you.</span>
      </h1>
      <BookAppointment />
    </section>
  );
}
