import { type SchemaTypeDefinition } from 'sanity';

import author from './schemas/author';
import blockContent from './schemas/blockContent';
import category from './schemas/category';
import clinicSection from './schemas/clinicSection';
import footer from './schemas/footer';
import heroSection from './schemas/heroSection';
import highlight from './schemas/highlight';
import post from './schemas/post';
import products from './schemas/products';
import productsSection from './schemas/productsSection';
import services from './schemas/services';
import cafeSection from './schemas/cafeSection';
import sustainabilitySection from './schemas/sustainabilitySection';

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
    author,
    category,
    blockContent,
    footer,
    sustainabilitySection,
  ],
};
