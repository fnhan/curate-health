import type { Metadata } from "next";

import AboutSection from "@/components/layout/home-page/about-section";
import BlogSection from "@/components/layout/home-page/blog-section";
import CafeSection from "@/components/layout/home-page/cafe-section";
import ClinicSection from "@/components/layout/home-page/clinic-section";
import HeroSection from "@/components/layout/home-page/hero-section";
import OurProgramsSection from "@/components/layout/home-page/our-programs-section";
import ProductsSection from "@/components/layout/home-page/products-section";
import ServicesSection from "@/components/layout/home-page/services-section";
import SustainabilitySection from "@/components/layout/home-page/sustainability-section";
import Layout from "@/components/shared/layout";
import { HOME_PAGE_QUERYResult, LAYOUT_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { HOME_PAGE_QUERY, LAYOUT_QUERY } from "@/sanity/lib/queries";

/**
 * The homepage's own canonical, CH-003.
 *
 * Its title, description and share card come from the layout's defaults, so
 * this adds only the canonical and leaves the rest to merge in from there. It
 * lives here rather than in the layout on purpose: a canonical in the layout
 * would be inherited by every page that failed to set its own, telling Google
 * each of them was a copy of the homepage.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const homePage = await sanityFetch<HOME_PAGE_QUERYResult>({
    query: HOME_PAGE_QUERY,
  });
  const layout = await sanityFetch<LAYOUT_QUERYResult>({
    query: LAYOUT_QUERY,
  });

  const {
    heroSection,
    primaryCTAButton,
    aboutSection,
    clinicSection,
    productsSection,
    servicesSection,
    ourProgramsSection,
    cafeSection,
    blogSection,
    sustainabilitySection,
  } = homePage;

  return (
    <Layout layout={layout}>
      <HeroSection
        heroSection={heroSection}
        primaryCTAButton={primaryCTAButton}
      />
      <AboutSection aboutSection={aboutSection} />
      <ClinicSection clinicSection={clinicSection} />
      <ServicesSection servicesSection={servicesSection} />
      <OurProgramsSection ourProgramsSection={ourProgramsSection} />
      <ProductsSection productsSection={productsSection} />
      <CafeSection cafeSection={cafeSection} />
      <BlogSection blogSection={blogSection} />
      <SustainabilitySection sustainabilitySection={sustainabilitySection} />
    </Layout>
  );
}
