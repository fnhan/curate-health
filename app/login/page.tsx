import ComingSoon from 'components/layout/Home/ComingSoon';
import PasswordPrompt from 'components/layout/login/password-prompt';
import React from 'react';

export default function LoginPage() {
  return (
    <main className='flex flex-1 flex-col items-center justify-center'>
      {/* <ComingSoon /> */}
      <PasswordPrompt />
    </main>
  );
}
