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
import ourTeam from "./schemas/ourTeam";
import pageMetadata from "./schemas/pageMetadata";
import pillarsOfHealth from "./schemas/pillarsOfHealth";
import popupBanner from "./schemas/popupBanner";
import post from "./schemas/post";
import primaryCTAButton from "./schemas/primaryCTAButton";
import privacy from "./schemas/privacy";
import products from "./schemas/products";
import productsSection from "./schemas/productsSection";
import services from "./schemas/services";
import servicesHeroSection from "./schemas/services-hero-section";
import servicesSection from "./schemas/servicesSection";
import siteMeta from "./schemas/siteMeta";
import siteSettings from "./schemas/siteSettings";
import socialMeta from "./schemas/socialMeta";
import surveySection from "./schemas/surveySection";
import sustainability from "./schemas/sustainability";
import sustainabilitySection from "./schemas/sustainabilitySection";
import termsOfUse from "./schemas/termsOfUse";
import treatment from "./schemas/treatment";

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
    servicesHeroSection,
    ourStory,
    ourTeam,
    missionAndValues,
    sustainability,
    pillarsOfHealth,
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
    metadatas,
    aboutPages,
    feedbackLink,
    legalPages,
    popupBanner,
    surveySection,
    primaryCTAButton,
    products,
    services,
    treatment,
  ],
};
