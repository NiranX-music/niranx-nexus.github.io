import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { Hero3D } from '@/components/landing/Hero3D';
import { HighlightsBar } from '@/components/landing/HighlightsBar';
import { Cards3DScroll } from '@/components/landing/Cards3DScroll';
import { ProductPreview } from '@/components/landing/ProductPreview';
import { FeaturesGrid3D } from '@/components/landing/FeaturesGrid3D';
import { FeatureGridGlow } from '@/components/landing/FeatureGridGlow';
import { StatsSection } from '@/components/landing/StatsSection';
import { AboutSection } from '@/components/niranx/AboutSection';
import { MusicSection } from '@/components/niranx/MusicSection';
import { TestimonialsSection } from '@/components/niranx/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { UpdatesPanel } from '@/components/landing/UpdatesPanel';
import { Footer3D } from '@/components/landing/Footer3D';
import { NewsletterPopup } from '@/components/niranx/NewsletterPopup';
import { LiquidBackground } from '@/components/LiquidBackground';

const Landing = () => {
  return (
    <div className="bg-background relative">
      <LiquidBackground />
      <NiranXNavigation />
      <main className="relative z-10">
        <Hero3D />
        <HighlightsBar />
        <Cards3DScroll />
        <StatsSection />
        <ProductPreview />
        <FeaturesGrid3D />
        <FeatureGridGlow />
        <AboutSection />
        <MusicSection />
        <TestimonialsSection />
        <UpdatesPanel />
        <CTASection />
      </main>
      <Footer3D />
      <NewsletterPopup />
    </div>
  );
};

export default Landing;
