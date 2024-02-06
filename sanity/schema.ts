import { type SchemaTypeDefinition } from 'sanity';

import author from './schemas/author';
import blockContent from './schemas/blockContent';
import category from './schemas/category';
import heroSection from './schemas/heroSection';
import highlight from './schemas/highlight';
import post from './schemas/post';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [heroSection, highlight, post, author, category, blockContent],
};
