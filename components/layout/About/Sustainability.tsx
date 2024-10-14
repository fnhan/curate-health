import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';
import sustainability from '../../../sanity/schemas/sustainability';

const builder = imageUrlBuilder({ projectId, dataset });

export default function Sustainability({ sustainability }) {

  if (!sustainability) {
    return <Loading />;
  }

  const {
    headerTopImage,
    headerBottomImage,
    headerTitle,
    headerTextContent,
    sectionOneImage,
    sectionTwoImage,
    sectionTwoTextContent,
    sectionThreeTextContent,
    sectionFourImage,
  } = sustainability;

  return (
    <div className='flex flex-col w-full'>
    </div>
  );

}