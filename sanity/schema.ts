import { type SchemaTypeDefinition } from "sanity";

import aboutPages from "./schemas/aboutPages";
import aboutSection from "./schemas/aboutSection";
import accessibility from "./schemas/accessibility";
import author from "./schemas/author";
import blockContent from "./schemas/blockContent";
import blogSection from "./schemas/blogSection";
import cafeSection from "./schemas/cafeSection";
import category from "./schemas/category";
import clinicSection from "./schemas/clinicSection";
import contactDetails from "./schemas/contactDetails";
import contactInfo from "./schemas/contactInfo";
import feedbackLink from "./schemas/feedbackLink";
import footer from "./schemas/footer";
import heroSection from "./schemas/heroSection";
import legalPages from "./schemas/legalPages";
import metadatas from "./schemas/metadatas";
import missionAndValues from "./schemas/missionAndValues";
import navigation from "./schemas/navigation";
import newsletter from "./schemas/newsletter";
import ourStory from "./schemas/ourStory";
import pageMetadata from "./schemas/pageMetadata";
import pillarsOfHealth from "./schemas/pillarsOfHealth";
import popup from "./schemas/popup";
import post from "./schemas/post";
import primaryCTAButton from "./schemas/primaryCTAButton";
import privacy from "./schemas/privacy";
import products from "./schemas/products";
import productsSection from "./schemas/productsSection";
import services from "./schemas/services";
import servicesSection from "./schemas/servicesSection";
import siteMeta from "./schemas/siteMeta";
import siteSettings from "./schemas/siteSettings";
import socialMeta from "./schemas/socialMeta";
import surveyLink from "./schemas/surveyLink";
import sustainability from "./schemas/sustainability";
import sustainabilitySection from "./schemas/sustainabilitySection";
import termsOfUse from "./schemas/termsOfUse";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    siteSettings,
    siteMeta,
    socialMeta,
    pageMetadata,
    heroSection,
    aboutSection,
    clinicSection,
    servicesSection,
    productsSection,
    cafeSection,
    blogSection,
    sustainabilitySection,
    popup,
    post,
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
    feedbackLink,
    legalPages,
    primaryCTAButton,
    products,
    services,
  ],
};
