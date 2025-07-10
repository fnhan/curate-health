import { type SchemaTypeDefinition } from "sanity";

import aboutSection from "./schemas/aboutSection";
import author from "./schemas/author";
import blockContent from "./schemas/blockContent";
import blogSection from "./schemas/blogSection";
import cafePage from "./schemas/cafePage";
import cafeSection from "./schemas/cafeSection";
import clinicSection from "./schemas/clinicSection";
import contactPage from "./schemas/contactPage";
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
import seo from "./schemas/seo";
import serviceCurateLifestyle from "./schemas/service-curate-lifestyle";
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
    seo /* Hidden type - uses socialMeta Type */,
    siteSettings,
    siteMeta /* Uses socialMeta Type */,
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
    ourStory /* Uses SEO Type */,
    ourTeam /* Uses SEO Type */,
    missionAndValues /* Uses SEO Type */,
    sustainability /* Uses SEO Type */,
    pillarsOfHealth /* Uses SEO Type */,
    contactPage /* Uses SEO Type */,
    surveySection,
    primaryCTAButton,
    products /* Uses SEO Type */,
    services /* Uses SEO Type */,
    treatment /* Uses SEO Type */,
    cafePage /* Uses SEO Type */,
    post /* Uses SEO Type */,
    author,
    legalPages,
    serviceCurateLifestyle,
  ],
};
