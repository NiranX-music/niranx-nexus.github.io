import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { HeroSection } from '@/components/niranx/HeroSection';
import { AboutSection } from '@/components/niranx/AboutSection';
import { ShortcutsSection } from '@/components/niranx/ShortcutsSection';
import { MusicSection } from '@/components/niranx/MusicSection';
import { ProjectsSection } from '@/components/niranx/ProjectsSection';
import { TechStackSection } from '@/components/niranx/TechStackSection';
import { TestimonialsSection } from '@/components/niranx/TestimonialsSection';
import { ContactSection } from '@/components/niranx/ContactSection';
import { EnhancedFooter } from '@/components/niranx/EnhancedFooter';
import { NewsletterPopup } from '@/components/niranx/NewsletterPopup';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NiranXNavigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ShortcutsSection />
        <MusicSection />
        <ProjectsSection />
        <TechStackSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <EnhancedFooter />
      <NewsletterPopup />
    </div>
  );
};

export default Landing;
