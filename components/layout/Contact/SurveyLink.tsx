import Image from "next/image";
import TakeSurvey from "../Buttons/TakeSurvey";

export default function SurveyLink({ }) {
  return (
    <section className='relative bg-platinum h-[56px] md:h-[112px]'>
      <Image
        src='/images/shapescropped.png'
        width={1440}
        height={112}
        alt='alt'
        className='w-full h-full object-cover'
      />
      <div className='absolute inset-0 flex items-center justify-start pl-20'>
        <TakeSurvey />
      </div>
    </section>
  )
}