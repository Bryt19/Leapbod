import { lazy, Suspense } from "react";
import Navigation from "../components/Navigation";
import Hero from "../components/Hero";

// Lazy load non-critical components
const Features = lazy(() => import("../components/Features"));
const FeaturedOpportunities = lazy(
  () => import("../components/FeaturedOpportunities")
);
const CallToAction = lazy(() => import("../components/CallToAction"));
const Footer = lazy(() => import("../components/Footer"));

// Loading component for lazy loaded sections
const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-pulse bg-muted rounded-lg h-32 w-full max-w-md"></div>
  </div>
);

export default function HomePage() {
  return (
    <>
      <Navigation />
      <Hero />
      <Suspense fallback={<SectionLoader />}>
        <Features />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FeaturedOpportunities />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <CallToAction />
      </Suspense>
      <Suspense fallback={<div className="h-32 bg-muted"></div>}>
        <Footer />
      </Suspense>
    </>
  );
}
