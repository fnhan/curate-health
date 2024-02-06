import { groq } from 'next-sanity';

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug)]`;

export const POSTS_SLUG_QUERY = groq`*[_type == "post" && defined(slug.current)][]{
  "params": { "slug": slug.current }
}`;

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]`;

export const heroSectionQuery = `*[_type == "heroSection"][0]{
  bgImage {
    asset->{
      _id,
      url
    },
  },
  heroText
}`;

const HIGHLIGHT_QUERY = groq`*[_type == "highlight"][0]{
  title1,
  title2,
  "highlightImage": {
    "asset": highlightImage.asset->{
      _id,
      url
    },
    "alt": highlightImage.alt
  },
  hoverLinkText,
  hoverLinkHref
}`;

export const homePageQuery = groq`{
  "heroSection": ${heroSectionQuery},
  "posts": ${POSTS_QUERY}{
    mainImage,
    title,
    excerpt,
    slug,
    publishedAt,
  },
  "highlightSection": ${HIGHLIGHT_QUERY}
}`;
