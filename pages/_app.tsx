import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'components/ui/toaster';
import { AppProps } from 'next/app';
import { Poppins } from 'next/font/google';
import { lazy, Suspense } from 'react';
import '../styles/index.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export interface SharedPageProps {
  draftMode: boolean;
  token: string;
}

const PreviewProvider = lazy(
  () => import('../components/sanity/PreviewProvider')
);
const VisualEditing = lazy(() => import('../components/sanity/VisualEditing'));

export default function App({
  Component,
  pageProps,
}: AppProps<SharedPageProps>) {
  const { draftMode, token } = pageProps;

  return (
    <>
      <Toaster />
      <SpeedInsights />
      <Analytics />
      {draftMode ? (
        <PreviewProvider token={token}>
          <div className={`${poppins.className} antialiased`}>
            <Component {...pageProps} />
          </div>
          <Suspense fallback={<div>Loading visual editing...</div>}>
            <VisualEditing />
          </Suspense>
        </PreviewProvider>
      ) : (
        <div className={`${poppins.className} antialiased`}>
          <Component {...pageProps} />
        </div>
      )}
    </>
  );
}
