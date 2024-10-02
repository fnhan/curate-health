import { Button } from 'components/ui/button';
import Link from 'next/link';
import { getClient } from '../../sanity/lib/client';
import { useEffect, useState } from 'react';
import { POPUP_CONTENT_QUERY } from 'sanity/lib/queries';
import { token } from '../../sanity/lib/token';
import { SanityDocument } from 'next-sanity';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';

type PageProps = {
  isVisible: boolean;
  token: string;
  content: any;
};

export default function popUp(props: PageProps) {
  const [bannerData, setBannerData] = useState(null);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const getBannerData = async () => {
      //const data = await fetchBannerData();
      // Check if the user has dismissed the banner
      const hasClosedBanner = localStorage.getItem('bannerClosed');
      if (props.isVisible && !hasClosedBanner) {
        setBannerData(props);
        setIsBannerVisible(true);
      }
    };
    getBannerData();
  }, []);

  const closeBanner = () => {
    setIsBannerVisible(false);
    localStorage.setItem('bannerClosed', 'true'); // Store the dismissed state
  };

  if (!isBannerVisible || !bannerData) return null;

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
    <Link href=''>
      {props.content ? (
        <div>
          <PortableText components={components} value={props.content} />{' '}
        </div>
      ) : null}
      <Button className='outline outline-1 bg-transparent text-white hover:bg-primary rounded-none duration-300 transition-all w-[200px] text-[10px] md:text-[14px]'>
        X
      </Button>
    </Link>
  );
}

export const getStaticProps = async ({ params, preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const banner = await client.fetch(POPUP_CONTENT_QUERY);
  const content = banner.content;
  const isVisible = banner.isVisible;
  return {
    props: {
      content,
      isVisible,
    },
  };
};
