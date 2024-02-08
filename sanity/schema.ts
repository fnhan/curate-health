import { type SchemaTypeDefinition } from 'sanity';

import author from './schemas/author';
import blockContent from './schemas/blockContent';
import category from './schemas/category';
import clinicSection from './schemas/clinicSection';
import heroSection from './schemas/heroSection';
import highlight from './schemas/highlight';
import post from './schemas/post';
import services from './schemas/services';
import cafeSection from './schemas/cafeSection';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    heroSection,
    highlight,
    clinicSection,
    cafeSection,
    services,
    post,
    author,
    category,
    blockContent,
  ],
};
