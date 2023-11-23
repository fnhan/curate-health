import Footer from './Footer';
import Meta from './meta';
import Nav from './Nav';

import React from 'react';

const Layout = ({ title, children }) => {
  return (
    <>
      <Meta title={title} />
      <div className='flex flex-col min-h-screen'>
        <div className='flex-1 bg-primary text-white'>
          <Nav />
          <main className='container'>{children}</main>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
