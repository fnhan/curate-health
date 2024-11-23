import imageUrlBuilder from '@sanity/image-url';
import { Loading } from 'components/Loading';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { dataset, projectId } from '../../../sanity/env';
import styles from '../../../styles/CarouselNav.module.css';

const builder = imageUrlBuilder({ projectId, dataset });

export default function PillarsofHealth({ pillarsOfHealth, aboutPages }) {
  const [textContent, setTextContent] = useState('');
  if (!pillarsOfHealth) {
    return <Loading />;
  }

  const {
    pageTitle,
    pageSubtitle,
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
    physicalHealthTextContent,
  } = pillarsOfHealth;

  function displayText(pillar: string) {
    setTextContent(pillar);
  }

  return (
    <div className='flex flex-col w-full font-light'>
      <section
        id='headerSection'
        className='relative bg-primary font-light w-full'>
        <Image
          loading='lazy'
          width={1440}
          height={690}
          alt={`${headerBgImage.alt}`}
          src={builder.image(headerBgImage).width(1440).height(690).url()}
          className='object-cover w-full h-[354px] md:h-[450px] lg:h-[690px]'
        />
        <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[48px] md:h-[68px] lg:h-[78px]'>
          <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[78px] md:h-[68px] lg:h-[78px]'>
            <div
              className={`container whitespace-nowrap overflow-x-auto -mt-2.5 md:-mt-0 ${styles.customScrollbar}`}>
              <div className='flex'>
                <div className=' -mr-8'>
                  <div className='p-1 group'>
                    <Link href='/about/our-story'>
                      <div className='flex bg-transparent border-none'>
                        <div className='-ml-6 p-6 text-primary font-light text-[12px] lg:text-[14px] leading-[14px]'>
                          About
                          <div className='mt-1 bg-primary md:h-[0.5px] lg:h-[1.35px] w-0 group-hover:w-full transition-all duration-500'></div>
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
                          className={`bg-transparent border-none ${aboutPage.title === 'Pillars of Health' ? 'underline text-primary underline-offset-[7px] lg:underline-offset-[7.5px]' : ''}`}>
                          <div className='-ml-4 -mr-4 items-center font-light justify-center p-6 text-primary text-[12px] lg:text-[14px] leading-[14px]'>
                            {aboutPage.title}
                            <div
                              className={`${aboutPage.title !== 'Pillars of Health' ? 'mt-1 bg-primary md:h-[0.5px] lg:h-[1.35px] w-0 group-hover:w-full transition-all duration-500' : ''}`}></div>
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
      <section id='titleSection'>
        <h1
          className='text-white text-2xl md:text-5xl lg:text-7xl leading-8 md:leading-10 lg:leading-[72px] flex justify-center font-light
        pt-24 lg:pt-32'>
          {pageTitle}
        </h1>
        <h2 className='hidden md:block leading-10 text-center italic text:sm md:text-xl lg:text-3xl w-[621px] lg:w-[736px] m-auto pl-1 pt-8'>
          {pageSubtitle}
        </h2>
      </section>
      <section
        id='pageContent'
        className='flex flex-col container  
      py-20 md:py-32 w-full'>
        <div className='lg:ml-8 flex flex-col lg:flex-row justify-center items-center lg:justify-start lg:items-start'>
          <div
            id='outterCircle'
            className='flex justify-center items-center lg:justify-between lg:flex-row h-[237px] md:h-[450px] aspect-square rounded-full border'>
            <p
              id='textContent'
              className='italic w-[120px] md:w-[265px] lg:w-[450px] text-[9px] md:text-sm lg:text-2xl lg:text-left
              lg:transform lg:translate-x-[40rem] leading-3 md:leading-4 lg:leading-7 text-center'>
              {textContent}
            </p>
          </div>
          <div
            className='absolute top-[680px] md:top-[940px] lg:top-[1310px] lg:transform lg:translate-x-[9.5rem] bg-primary flex justify-center items-center cursor-pointer 
        h-[78px] md:h-[145px] aspect-square rounded-full border border-white hover:bg-white hover:text-primary transition-all duration-300 focus:bg-white focus:text-primary'
            onClick={() => displayText(mentalHealthTextContent)}
            onMouseEnter={() => displayText(mentalHealthTextContent)}
            onMouseLeave={() => displayText('')}>
            <span className='text-xs md:text-lg lg:text-2xl flex text-center'>
              {mentalHealthTitle}
            </span>
          </div>
          <div
            className='absolute top-[750px] md:top-[1050px] lg:top-[1450px] transform translate-x-[6.5rem] md:translate-x-[12.5rem] lg:translate-x-[22rem]
         bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[145px] aspect-square rounded-full border border-white hover:bg-white hover:text-primary transition-all duration-300 focus:bg-white focus:text-primary'
            onClick={() => displayText(emotionalHealthTextContent)}
            onMouseEnter={() => displayText(emotionalHealthTextContent)}
            onMouseLeave={() => displayText('')}>
            <span className='text-xs md:text-lg lg:text-2xl flex text-center'>
              {emotionalHealthTitle}
            </span>
          </div>
          <div
            className='absolute top-[890px] md:top-[1295px] lg:top-[1705px] transform translate-x-16 md:translate-x-[135px] lg:translate-x-[17.5rem] bg-primary flex justify-center items-center cursor-pointer 
        h-[78px] md:h-[145px] aspect-square rounded-full border border-white hover:bg-white hover:text-primary transition-all duration-300 focus:bg-white focus:text-primary'
            onClick={() => displayText(socialHealthTextContent)}
            onMouseEnter={() => displayText(socialHealthTextContent)}
            onMouseLeave={() => displayText('')}>
            <span className='text-xs md:text-lg lg:text-2xl flex text-center'>
              {socialHealthTitle}
            </span>
          </div>
          <div
            className='absolute top-[890px] md:top-[1295px] lg:top-[1705px] transform -translate-x-16 md:-translate-x-[135px] lg:translate-x-[2rem] bg-primary flex justify-center items-center cursor-pointer 
          h-[78px] md:h-[145px] aspect-square rounded-full border border-white  hover:bg-white hover:text-primary transition-all duration-300 focus:bg-white focus:text-primary'
            onClick={() => displayText(spiritualHealthTextContent)}
            onMouseEnter={() => displayText(spiritualHealthTextContent)}
            onMouseLeave={() => displayText('')}>
            <span className='text-xs md:text-lg lg:text-2xl flex text-center'>
              {spiritualHealthTitle}
            </span>
          </div>
          <div
            className='absolute top-[750px] md:top-[1050px] lg:top-[1450px] transform -translate-x-[6.5rem] md:-translate-x-[12.5rem] lg:-translate-x-12 
        bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[145px] aspect-square rounded-full border border-white hover:bg-white hover:text-primary transition-all duration-300 focus:bg-white focus:text-primary'
            onMouseEnter={() => displayText(physicalHealthTextContent)}
            onMouseLeave={() => displayText('')}
            onClick={() => displayText(physicalHealthTextContent)}>
            <span className=' text-xs md:text-lg lg:text-2xl flex text-center'>
              {physicalHealthTitle}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
