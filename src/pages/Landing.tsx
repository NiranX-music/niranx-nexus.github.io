import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { HeroSection } from '@/components/niranx/HeroSection';
import { MusicSection } from '@/components/niranx/MusicSection';
import { ProjectsSection } from '@/components/niranx/ProjectsSection';
import { TechStackSection } from '@/components/niranx/TechStackSection';
import { ContactSection } from '@/components/niranx/ContactSection';
import { NiranXFooter } from '@/components/niranx/NiranXFooter';
import { NewsletterPopup } from '@/components/niranx/NewsletterPopup';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NiranXNavigation />
      <main>
        <HeroSection />
        <MusicSection />
        <ProjectsSection />
        <TechStackSection />
        <ContactSection />
      </main>
      <NiranXFooter />
      <NewsletterPopup />
    </div>
  );
};

export default Landing;
