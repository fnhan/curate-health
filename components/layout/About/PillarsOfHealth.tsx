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
    mainTextContent,
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
        <div className='bg-[#C3C7BB]/[0.1] backdrop-blur-3xl h-[78px] transform -translate-y-20 mt-0.5'>
          <div className='bg-[#C3C7BB]/[0.1] backdrop-blur-3xl h-[78px]'>
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
      <section id="pageContent">
        <div className='flex justify-center pt-[90px] md:pt-[165px] lg:pt-[315px] pb-[100px] md:pb-[200px] lg:pb-[240px]'>
          <div className='h-[237px] w-[237px] md:h-[530px] md:w-[530px] lg:h-[921px] lg:w-[921px] rounded-full border border-white'>
            <p id='textContent' className='pt-5 text-xs md:text-base lg:text-3xl flex text-center align-middle w-1/2 md:w-2/3 lg:w-1/2
          transform translate-x-[14.5rem] translate-y-80 leading-4 md:leading-6 lg:leading-10'>
            </p>
          </div>
        </div>
        <div className='cursor-pointer h-[78px] w-[78px] md:h-[156px] md:w-[156px] lg:h-[266px] lg:w-[266px] rounded-full border border-white'>
          <button type='button' className='hover:underline pt-5 text-xs md:text-lg lg:text-4xl flex text-center align-middle transform translate-x-[4.5rem] translate-y-[5.5rem]'
            onClick={mentalText}>
            {mentalHealthTitle}</button>
        </div>
        <div className='cursor-pointer h-[78px] w-[78px] md:h-[156px] md:w-[156px] lg:h-[266px] lg:w-[266px] rounded-full border border-white'>
          <button type='button' className='hover:underline pt-5 text-xs md:text-lg lg:text-4xl flex text-center align-middle transform translate-x-[4.5rem] translate-y-[5.5rem]'
            onClick={emotionalText}>
            {emotionalHealthTitle}</button>
        </div>
        <div className='cursor-pointer h-[78px] w-[78px] md:h-[156px] md:w-[156px] lg:h-[266px] lg:w-[266px] rounded-full border border-white'>
          <button type='button' className='hover:underline pt-5 text-xs md:text-lg lg:text-4xl flex text-center align-middle transform translate-x-[4.5rem] translate-y-[5.5rem]'
            onClick={socialText}>
            {socialHealthTitle}</button>
        </div>
        <div className='cursor-pointer h-[78px] w-[78px] md:h-[156px] md:w-[156px] lg:h-[266px] lg:w-[266px] rounded-full border border-white'>
          <button type='button' className='hover:underline pt-5 text-xs md:text-lg lg:text-4xl flex text-center align-middle transform translate-x-[4.5rem] translate-y-[5.5rem]'
            onClick={spiritualText}>
            {spiritualHealthTitle}</button>
        </div>
        <div className='cursor-pointer h-[78px] w-[78px] md:h-[156px] md:w-[156px] lg:h-[266px] lg:w-[266px] rounded-full border border-white'>
          <button type='button' className='hover:underline pt-5 text-xs md:text-lg lg:text-4xl flex text-center align-middle transform translate-x-[4.5rem] translate-y-[5.5rem]'
            onClick={physicalText}>
            {physicalHealthTitle}</button>
        </div>
      </section>
    </div>
  );

}