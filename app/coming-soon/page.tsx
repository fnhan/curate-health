import ComingSoon from 'components/layout/Home/ComingSoon';
import Newsletter from 'components/layout/Home/Newsletter';
import Link from 'next/link';
import React from 'react';

export default function LoginPage() {
  return (
    <main className='flex flex-1 flex-col items-center justify-center'>
      <ComingSoon />
      <Newsletter isComingSoon={true} />
      <p className='mt-4 text-center'>
        If you are an admin of this site,{' '}
        <Link className='underline' href='/login'>
          click here
        </Link>{' '}
        to login
      </p>
    </main>
  );
}
