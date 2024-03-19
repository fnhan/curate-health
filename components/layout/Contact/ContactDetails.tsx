import GetDirections from '../Buttons/GetDirections';
import DirectionsMap from './DirectionsMap';

export default function ContactDetails({ }) {
  return (
    <section className='bg-white flex flex-col py-10 md:py-20'>
      <div className="flex flex-col justify-center lg:grid lg:grid-flow-col lg:grid-row-gap-2">
        <div className='container flex flex-col lg:pt-20 text-primary lg:col-start-2 lg:row-span-full'>
          <h2 className='text-[18px] md:text-[28px] lg:text-[40px]'>Opening Hours</h2>
        </div>
        <div className="container flex flex-col lg:col-start-2 lg:row-span-full pt-4 md:pt-8 lg:pt-40 lg:mt-4">
          <div className="leading-5 grid grid-cols-2 grid-rows-7 text-primary md:h-[244px] w-[180px] md:w-[250px] lg:w-[326px] pb-4 text-[10px] md:text-[12px] lg:text-[16px]">
            <div className="font-bold">Monday</div>
            <div>9:00 AM - 7:00 PM</div>
            <div className="font-bold">Tuesday</div>
            <div>9:00 AM - 7:00 PM</div>
            <div className="font-bold">Wednesday</div>
            <div>9:00 AM - 7:00 PM</div>
            <div className="font-bold">Thursday</div>
            <div>9:00 AM - 7:00 PM</div>
            <div className="font-bold">Friday</div>
            <div>9:00 AM - 7:00 PM</div>
            <div className="font-bold">Saturday</div>
            <div>9:00 AM - 5:00 PM</div>
            <div className="font-bold">Sunday</div>
            <div>9:00 AM - 5:00 PM</div>
          </div>
          <GetDirections />
        </div>
        <div className="lg:row-span-2 py-8 lg:pl-16 lg:col-start-3">
          <DirectionsMap />
        </div>
      </div>
    </section>
  )
};