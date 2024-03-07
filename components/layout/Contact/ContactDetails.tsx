import GetDirections from '../Buttons/GetDirections';
import DirectionsMap from './DirectionsMap';

export default function ContactDetails({ }) {
  return (
    <section className='bg-white flex flex-col py-10 md:py-20'>
      <div className="flex flex-col justify-center lg:grid lg:grid-flow-col lg:grid-row-gap-2">
        <div className='container flex flex-col pt-4 lg:pt-12 text-primary lg:col-start-2 lg:row-span-full'>
          <span className='text-[12px] md:text-[16px] lg:text-[24px]'>
            989 Eglinton Ave W, York, ON, M6C 2C6<br /> (Located at the West Corner Suite)
          </span>
        </div>
        <div className="container flex flex-col lg:col-start-2 lg:row-span-full pt-10 lg:pt-40 lg:mt-16">
          <div className="grid grid-cols-2 grid-rows-7 text-primary md:h-[244px] w-[165px] md:w-[240px] lg:w-[326px] pb-4 text-[10px] md:text-[14px] lg:text-[16px]">
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
        <DirectionsMap/>
        </div>
      </div>
    </section>
  )
};