import { Button } from 'components/ui/button';

export default function ContactDetails({ contactDetails }) {
  const { title, monHours, tuesHours, wedHours, thursHours, friHours, satHours, sunHours, mapURL, cta, href } =
    contactDetails;

  return (
    <section className='bg-white flex flex-col py-10 md:py-20'>
      <div className="flex flex-col justify-center lg:grid lg:grid-flow-col lg:grid-row-gap-2">
        <div className='container flex flex-col lg:pt-20 text-primary lg:col-start-2 lg:row-span-full'>
          <h2 className='text-[18px] md:text-[28px] lg:text-[40px]'>{title}</h2>
        </div>
        <div className="container flex flex-col lg:col-start-2 lg:row-span-full pt-4 md:pt-8 lg:pt-40 lg:mt-4">
          <div className="leading-5 grid grid-cols-2 grid-rows-7 text-primary md:h-[244px] w-[180px] md:w-[250px] lg:w-[326px] pb-4 text-[10px] md:text-[12px] lg:text-[16px]">
            <div className="font-bold">Monday</div>
            <div>{monHours}</div>
            <div className="font-bold">Tuesday</div>
            <div>{tuesHours}</div>
            <div className="font-bold">Wednesday</div>
            <div>{wedHours}</div>
            <div className="font-bold">Thursday</div>
            <div>{thursHours}</div>
            <div className="font-bold">Friday</div>
            <div>{friHours}</div>
            <div className="font-bold">Saturday</div>
            <div>{satHours}</div>
            <div className="font-bold">Sunday</div>
            <div>{sunHours}</div>
          </div>
          <a target="_blank" href={href}>
            <Button className='outline outline-1 bg-white text-primary text-[10px] md:text-[14px] lg:text-[16px] hover:text-white hover:bg-primary rounded-none duration-300 transition-all w-[178px] md:w-[230px] lg:w-[305px] h-[30px] md:h-[40px] lg:h-[45px]'>
              {cta}
            </Button>
          </a>
        </div>
        <div className="lg:row-span-2 py-8 lg:pl-16 lg:col-start-3">
          <iframe
            src={mapURL}
            allow='autoplay; fullscreen; picture-in-picture'
            className='w-[320px] h-[300px] md:w-[765px] md:h-[431px] lg:w-[702px] lg:h-[500px]'
            title='curate-health-google-maps'>
          </iframe>
        </div>
      </div>
    </section>
  )
};