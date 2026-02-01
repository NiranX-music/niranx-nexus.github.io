import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { Hero3D } from '@/components/landing/Hero3D';
import { FeaturesGrid3D } from '@/components/landing/FeaturesGrid3D';
import { StatsSection } from '@/components/landing/StatsSection';
import { AboutSection } from '@/components/niranx/AboutSection';
import { MusicSection } from '@/components/niranx/MusicSection';
import { TestimonialsSection } from '@/components/niranx/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer3D } from '@/components/landing/Footer3D';
import { NewsletterPopup } from '@/components/niranx/NewsletterPopup';

const Landing = () => {
  return (
    <div className="bg-background">
      <NiranXNavigation />
      <main>
        <Hero3D />
        <StatsSection />
        <FeaturesGrid3D />
        <AboutSection />
        <MusicSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer3D />
      <NewsletterPopup />
    </div>
  );
};

export default Landing;
