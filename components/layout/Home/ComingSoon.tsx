import Image from 'next/image';
import React from 'react';
import logo from '../../../public/images/logo-large.png';

export default function ComingSoon() {
  return (
    <div className='flex flex-col gap-16 justify-center items-center'>
      <Image src={logo} width={200} height={200} alt='logo' />
      <h1 className='text-4xl md:text:5xl lg:text-6xl'>Curate Health</h1>
      <h2 className='text-2xl md:text:3xl lg:text-4xl'>Coming Soon...</h2>
    </div>
  );
}
