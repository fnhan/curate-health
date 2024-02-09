import imageUrlBuilder from '@sanity/image-url';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Layout from '../../components/layout/layout';
import { dataset, projectId } from '../../sanity/env';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  PRODUCTS_SLUG_QUERY,
  PRODUCT_BY_SLUG_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ProductPage({ product, footer }) {
  const { title, description, imageUrl, altText } = product;

  return (
    <Layout footer={footer} title={title}>
      <div className='container mx-auto py-12'>
        <h1 className='text-3xl font-bold mb-4'>{title}</h1>
        <Image
          src={builder
            .image(imageUrl)
            .quality(80)
            .size(250, 250)
            .auto('format')
            .url()}
          width={250}
          height={250}
          alt={altText || title}
          className='w-full max-w-md mx-auto mb-6'
        />
        <p>{description}</p>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  const client = getClient(preview ? token : undefined);
  const footer = await client.fetch(FOOTER_QUERY);
  const product = await client.fetch(PRODUCT_BY_SLUG_QUERY, {
    slug: params.slug,
  });

  return {
    props: {
      product,
      footer,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(PRODUCTS_SLUG_QUERY);

  return { paths, fallback: 'blocking' };
};
