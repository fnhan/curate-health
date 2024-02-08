import { type SchemaTypeDefinition } from 'sanity';

import author from './schemas/author';
import blockContent from './schemas/blockContent';
import category from './schemas/category';
import clinicSection from './schemas/clinicSection';
import heroSection from './schemas/heroSection';
import highlight from './schemas/highlight';
import post from './schemas/post';
import products from './schemas/products';
import productsSection from './schemas/productsSection';
import services from './schemas/services';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    heroSection,
    highlight,
    clinicSection,
    services,
    productsSection,
    products,
    post,
    author,
    category,
    blockContent,
  ],
};
