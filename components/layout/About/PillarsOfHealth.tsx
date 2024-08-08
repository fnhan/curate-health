import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';
import Link from 'next/link';
import styles from '../../../styles/CarouselNav.module.css';

const builder = imageUrlBuilder({ projectId, dataset });

export default function PillarsofHealth({ pillarsOfHealth, aboutPages }) {

  if (!pillarsOfHealth) {
    return <Loading />;
  }

  const {
    pageTitle,
    headerBgImage,
    mentalHealthTitle,
    mentalHealthTextContent,
    emotionalHealthTitle,
    emotionalHealthTextContent,
    socialHealthTitle,
    socialHealthTextContent,
    spiritualHealthTitle,
    spiritualHealthTextContent,
    physicalHealthTitle,
    physicalHealthTextContent
  } = pillarsOfHealth;

  function mentalText() {
    document.getElementById("textContent").innerHTML = `${mentalHealthTextContent}`
  }

  function emotionalText() {
    document.getElementById("textContent").innerHTML = `${emotionalHealthTextContent}`
  }

  function socialText() {
    document.getElementById("textContent").innerHTML = `${socialHealthTextContent}`
  }

  function spiritualText() {
    document.getElementById("textContent").innerHTML = `${spiritualHealthTextContent}`
  }

  function physicalText() {
    document.getElementById("textContent").innerHTML = `${physicalHealthTextContent}`
  }

  return (
    <div className='flex flex-col w-full font-light'>
      <section id="headerSection" className='relative bg-primary font-light w-full'>
        <Image
          loading='lazy'
          width={1440}
          height={686}
          alt={`${headerBgImage.alt}`}
          src={builder.image(headerBgImage).width(1440).height(686).url()}
          className='object-cover w-full h-[418px] lg:h-[686px]'
        />
        <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[78px] transform -translate-y-20 mt-0.5'>
          <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[78px]'>
            <div
              className={`container whitespace-nowrap overflow-x-auto ${styles.customScrollbar}`}>
              <div className='flex'>
                <div className=' -mr-8'>
                  <div className='p-1 group'>
                    <Link href='/about'>
                      <div className='flex bg-transparent border-none'>
                        <div
                          className='p-6 text-primary font-light font-Poppins text-[12px] lg:text-[14px] leading-[14px] underline'>
                          About
                          <div
                            className='-mt-1 bg-primary h-[1.35px] w-0 group-hover:w-full transition-all duration-500'></div>
                        </div>
                        <div className='text-primary font-light -ml-6 p-6 mx-3 lg:inline leading-[14px]'>
                          |
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                {aboutPages.map((aboutPage, index) => (
                  <div key={index}>
                    <div className='p-1 group'>
                      <Link href={`/about/${aboutPage.slug}`}>
                        <div
                          className='bg-transparent border-none underline text-primary'>
                          <div className='-ml-4 -mr-4 items-center font-light font-Poppins justify-center p-6 text-primary text-[12px] lg:text-[14px] leading-[14px]'>
                            {aboutPage.title}
                            <div
                              className='-mt-1 bg-primary h-[1.35px] w-0 group-hover:w-full transition-all duration-500'></div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="titleSection">
        <h1 className='text-white text-2xl md:text-5xl lg:text-7xl leading-8 md:leading-10 lg:leading-[72px] flex justify-center font-light'>
          {pageTitle}
        </h1>
      </section>
      <section id="pageContent" className="flex flex-col justify-center items-center py-20 md:py-40 lg:py-80 w-full">
        <div className='static flex justify-center items-center h-[237px] md:h-[530px] lg:h-[921px] aspect-square rounded-full border border-white'>
          <p id='textContent' className='w-[123.56px] md:w-[233px] lg:w-[344px] text-xs md:text-base lg:text-3xl 
            leading-4 md:leading-6 lg:leading-10 flex text-center'>
          </p>
        </div>
        <div className='absolute top-[680px] md:top-[730px] lg:top-[1140px] bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[156px] lg:h-[266px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-lg lg:text-4xl flex text-center'
            onClick={mentalText}>
            {mentalHealthTitle}</button>
        </div>
        <div className='absolute top-[750px] md:top-[900px] lg:top-[1450px] transform translate-x-[6.5rem] md:translate-x-60 lg:translate-x-[405px] bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[156px] lg:h-[266px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-lg lg:text-4xl flex text-center'
            onClick={emotionalText}>
            {emotionalHealthTitle}</button>
        </div>
        <div className='absolute top-[890px] md:top-[1190px] lg:top-[1950px] transform translate-x-16 md:translate-x-[10.5rem] lg:translate-x-[17rem] bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[156px] lg:h-[266px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-lg lg:text-4xl flex text-center'
            onClick={socialText}>
            {socialHealthTitle}</button>
        </div>
        <div className='absolute top-[890px] md:top-[1190px] lg:top-[1950px] transform -translate-x-16 md:-translate-x-44 lg:-translate-x-72 bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[156px] lg:h-[266px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-lg lg:text-4xl flex text-center'
            onClick={spiritualText}>
            {spiritualHealthTitle}</button>
        </div>
        <div className='absolute top-[750px] md:top-[900px] lg:top-[1450px] transform -translate-x-[6.5rem] md:-translate-x-60 lg:-translate-x-[405px] bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[156px] lg:h-[266px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-lg lg:text-4xl flex text-center'
            onClick={physicalText}>
            {physicalHealthTitle}</button>
        </div>
      </section>
    </div>
  );

}