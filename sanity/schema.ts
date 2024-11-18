import { type SchemaTypeDefinition } from 'sanity';

import author from './schemas/author';
import blockContent from './schemas/blockContent';
import cafeSection from './schemas/cafeSection';
import category from './schemas/category';
import clinicSection from './schemas/clinicSection';
import footer from './schemas/footer';
import heroSection from './schemas/heroSection';
import highlight from './schemas/highlight';
import navigation from './schemas/navigation';
import newsletter from './schemas/newsletter';
import post from './schemas/post';
import products from './schemas/products';
import productsSection from './schemas/productsSection';
import services from './schemas/services';
import sustainabilitySection from './schemas/sustainabilitySection';
import termsOfUse from './schemas/termsOfUse';
import privacy from './schemas/privacy';
import accessibility from './schemas/accessibility';
import contactInfo from './schemas/contactInfo';
import contactDetails from './schemas/contactDetails';
import ourServices from './schemas/ourServices';
import surveyLink from './schemas/surveyLink';
import ourStory from './schemas/ourStory';
import missionAndValues from './schemas/missionAndValues';
import sustainability from './schemas/sustainability';
import aboutPages from './schemas/aboutPages';
import treatments from './schemas/treatments';
import pillarsOfHealth from './schemas/pillarsOfHealth';
import metadatas from './schemas/metadatas';
import popup from './schemas/popup';
import feedbackLink from './schemas/feedbackLink';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    heroSection,
    highlight,
    clinicSection,
    cafeSection,
    services,
    popup,
    productsSection,
    products,
    post,
    sustainabilitySection,
    author,
    category,
    blockContent,
    footer,
    newsletter,
    navigation,
    termsOfUse,
    privacy,
    accessibility,
    contactInfo,
    contactDetails,
    surveyLink,
    ourStory,
    missionAndValues,
    metadatas,
    sustainability,
    aboutPages,
    pillarsOfHealth,
    feedbackLink
  ],
};
