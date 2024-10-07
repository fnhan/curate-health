import { Button } from 'components/ui/button';
import Link from 'next/link';
import { getClient } from '../../sanity/lib/client';
import { POPUP_CONTENT_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';
import { SanityDocument } from 'next-sanity';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'components/ui/dialog';

import { useEffect, useState } from 'react';
import preview from 'next-sanity/preview';
import { Cross2Icon } from '@radix-ui/react-icons';

type PageProps = {
  isVisible: boolean;
  content: any;
};

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=');
    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
};

export default function PopupBanner(props) {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const bannerDismissed = getCookie('bannerDismissed');
    if (props.props.isActive && !bannerDismissed) {
      setIsBannerVisible(true);
    }
  }, [props.props.isActive]);

  const closeBanner = () => {
    setIsBannerVisible(false);
    // Set cookie for 7 days when banner is dismissed
    setCookie('bannerDismissed', 'true', 7);
  };

  if (!isBannerVisible) return null;

  const components: Partial<PortableTextReactComponents> = {
    list: {
      // Ex. 1: customizing common list types
      bullet: ({ children }) => (
        <ul className='list-disc list-inside mt-xl'>{children}</ul>
      ),
      number: ({ children }) => (
        <ol className='list-decimal list-inside mt-lg'>{children}</ol>
      ),

      // Ex. 2: rendering custom lists
      checkmarks: ({ children }) => (
        <ol className='m-auto text-lg'>{children}</ol>
      ),
    },
  };

  return (
    <div className='clear fixed top-0 z-50'>
      <div
        className='h-screen w-screen flex justify-center items-center bg-black bg-opacity-40'
        onClick={closeBanner}
      >
        <div className='w-[48rem] h-[48rem] bg-[#878E76] rounded-full flex justify-center items-center'>
          <div className=''>
            <div className='px-4 py-2'>
              <PortableText
                components={components}
                value={props.props.content}
              />
              <button
                onClick={closeBanner}
                className=' text-white pt-10 rounded text-center'
              >
                <Cross2Icon className='h-10 w-10 flex items-center' />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// const fetchBannerData = async () => {
//   const client = getClient(preview ? token : undefined);
//   const data = await client.fetch(POPUP_CONTENT_QUERY);
//   return data;
// };

// export const getStaticProps = async ({ params, preview = false }) => {
//   const client = getClient(preview ? token : undefined);
//   const banner = await client.fetch(POPUP_CONTENT_QUERY);
//   const content = banner.content;
//   const isVisible = banner.isVisible;
//   return {
//     props: {
//       content,
//       isVisible,
//     },
//   };
// };
