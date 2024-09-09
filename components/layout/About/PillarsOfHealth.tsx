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
                    <Link href='/about/our-story'>
                      <div className='flex bg-transparent border-none'>
                        <div
                          className='-ml-6 p-6 text-primary font-light text-[12px] lg:text-[14px] leading-[14px]'>
                          About
                          <div
                            className='mt-1 bg-primary md:h-[0.5px] lg:h-[1.35px] w-0 group-hover:w-full transition-all duration-500'></div>
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
      <section id="titleSection">
        <h1 className='text-white text-2xl md:text-5xl lg:text-7xl leading-8 md:leading-10 lg:leading-[72px] flex justify-center font-light'>
          {pageTitle}
        </h1>
        <h2 className='hidden lg:block leading-10 text-center italic text:sm md:text-xl lg:text-3xl w-[928px] m-auto pl-1 pt-8'>
          {pageSubtitle}
        </h2>
      </section>
      <section id="pageContent" className="flex flex-col justify-center items-center py-20 md:py-32 w-full">
        <div className='static flex justify-center items-center h-[237px] md:h-[450px] aspect-square rounded-full border border-white'>
          <p id='textContent' className='w-[123.56px] md:w-[265px] text-xs md:text-lg 
            leading-4 md:leading-8 flex text-center'>
          </p>
        </div>
        <div className='absolute top-[680px] md:top-[1110px] bg-primary flex justify-center items-center cursor-pointer 
        h-[78px] md:h-[145px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-2xl flex text-center'
            onClick={mentalText}>
            {mentalHealthTitle}</button>
        </div>
        <div className='absolute top-[750px] md:top-[1250px] transform translate-x-[6.5rem] md:translate-x-[200px]
         bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[145px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-2xl flex text-center'
            onClick={emotionalText}>
            {emotionalHealthTitle}</button>
        </div>
        <div className='absolute top-[890px] md:top-[1510px] transform translate-x-16 md:translate-x-[125px] bg-primary flex justify-center items-center cursor-pointer 
        h-[78px] md:h-[145px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-2xl flex text-center'
            onClick={socialText}>
            {socialHealthTitle}</button>
        </div>
        <div className='absolute top-[890px] md:top-[1510px] transform -translate-x-16 md:-translate-x-[125px] bg-primary flex justify-center items-center cursor-pointer 
        h-[78px] md:h-[145px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-2xl flex text-center'
            onClick={spiritualText}>
            {spiritualHealthTitle}</button>
        </div>
        <div className='absolute top-[750px] md:top-[1250px] transform -translate-x-[6.5rem] md:-translate-x-[200px] bg-primary flex justify-center items-center cursor-pointer h-[78px] md:h-[156px] lg:h-[145px] aspect-square rounded-full border border-white'>
          <button type='button' className='hover:underline text-xs md:text-2xl flex text-center'
            onClick={physicalText}>
            {physicalHealthTitle}</button>
        </div>
      </section>
    </div>
  );

}