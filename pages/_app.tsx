import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'components/ui/toaster';
import { AppProps } from 'next/app';
import { lazy, Suspense } from 'react';
import '../styles/index.css';

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
      {draftMode ? (
        <PreviewProvider token={token}>
          <Component {...pageProps} />
          <Suspense fallback={<div>Loading visual editing...</div>}>
            <VisualEditing />
          </Suspense>
        </PreviewProvider>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}
