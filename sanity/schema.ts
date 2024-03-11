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
import post from './schemas/post';
import products from './schemas/products';
import productsSection from './schemas/productsSection';
import services from './schemas/services';
import surveySection from './schemas/surveySection';
import sustainabilitySection from './schemas/sustainabilitySection';
import termsOfUse from './schemas/termsOfUse';
import privacy from './schemas/privacy';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    heroSection,
    highlight,
    clinicSection,
    cafeSection,
    services,
    productsSection,
    products,
    post,
    sustainabilitySection,
    surveySection,
    author,
    category,
    blockContent,
    footer,
    navigation,
    termsOfUse,
    privacy
  ],
};
