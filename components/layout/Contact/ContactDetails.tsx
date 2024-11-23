import { Button } from "components/ui/button";

export default function ContactDetails({ contactDetails }) {
  const {
    title,
    monHours,
    tuesHours,
    wedHours,
    thursHours,
    friHours,
    satHours,
    sunHours,
    mapURL,
    cta,
    href,
  } = contactDetails;

  return (
    <section className="flex flex-col bg-white py-10 md:py-20">
      <div className="lg:grid-row-gap-2 flex flex-col justify-center lg:grid lg:grid-flow-col">
        <div className="container flex flex-col text-primary lg:col-start-2 lg:row-span-full lg:pt-20">
          <h2 className="text-[18px] md:text-[28px] lg:text-[40px]">{title}</h2>
        </div>
        <div className="container flex flex-col pt-4 md:pt-8 lg:col-start-2 lg:row-span-full lg:mt-4 lg:pt-40">
          <div className="grid w-[180px] grid-cols-2 grid-rows-7 pb-4 text-[10px] leading-5 text-primary md:h-[244px] md:w-[250px] md:text-[12px] lg:w-[326px] lg:text-[16px]">
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
            <Button className="h-[30px] w-[178px] rounded-none bg-white text-[10px] text-primary outline outline-1 transition-all duration-300 hover:bg-primary hover:text-white md:h-[40px] md:w-[230px] md:text-[14px] lg:h-[45px] lg:w-[305px] lg:text-[16px]">
              {cta}
            </Button>
          </a>
        </div>
        <div className="py-8 lg:col-start-3 lg:row-span-2 lg:pl-16">
          <iframe
            src={mapURL}
            allow="autoplay; fullscreen; picture-in-picture"
            className="h-[300px] w-[320px] md:h-[431px] md:w-[765px] lg:h-[500px] lg:w-[702px]"
            title="curate-health-google-maps"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
