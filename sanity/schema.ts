import { type SchemaTypeDefinition } from "sanity";

import aboutPages from "./schemas/aboutPages";
import aboutSection from "./schemas/aboutSection";
import author from "./schemas/author";
import blockContent from "./schemas/blockContent";
import blogSection from "./schemas/blogSection";
import cafeSection from "./schemas/cafeSection";
import category from "./schemas/category";
import clinicSection from "./schemas/clinicSection";
import contactPage from "./schemas/contactPage";
import feedbackLink from "./schemas/feedbackLink";
import heroSection from "./schemas/heroSection";
import legalPages from "./schemas/legalPages";
import missionAndValues from "./schemas/missionAndValues";
import newsletter from "./schemas/newsletter";
import ourStory from "./schemas/ourStory";
import ourTeam from "./schemas/ourTeam";
import pillarsOfHealth from "./schemas/pillarsOfHealth";
import popupBanner from "./schemas/popupBanner";
import post from "./schemas/post";
import primaryCTAButton from "./schemas/primaryCTAButton";
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
import treatment from "./schemas/treatment";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContent /* Hidden type */,
    socialMeta /* Hidden type */,
    siteSettings,
    siteMeta /* Uses socialMeta */,
    newsletter,
    popupBanner,
    heroSection,
    aboutSection,
    clinicSection,
    servicesSection,
    productsSection,
    cafeSection,
    blogSection,
    sustainabilitySection,
    servicesHeroSection,
    ourStory /* Uses socialMeta */,
    ourTeam /* Uses socialMeta */,
    missionAndValues /* Uses socialMeta */,
    sustainability /* Uses socialMeta */,
    pillarsOfHealth /* Uses socialMeta */,
    contactPage /* Uses socialMeta */,
    surveySection,
    primaryCTAButton,
    products /* Uses socialMeta */,
    services /* Uses socialMeta */,
    treatment /* Uses socialMeta */,
    legalPages,
    post,
    author,
    category,
    aboutPages /* To be removed */,
    feedbackLink /* Refactor */,
  ],
};
