import Image from 'next/image';
import React from 'react';
import logo from '../../../public/images/logo-large.png';

export default function ComingSoon() {
  return (
    <main className='flex flex-col min-h-screen justify-center items-center text-white gap-16'>
      <h1 className='text-4xl md:text:5xl lg:text-6xl'>Curate Health</h1>
      <Image src={logo} width={200} height={200} alt='logo' />
      <h2 className='text-2xl md:text:3xl lg:text-4xl'>Coming Soon...</h2>
    </main>
  );
}
