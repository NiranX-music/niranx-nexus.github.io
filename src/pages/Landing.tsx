import { lazy, Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { Footer3D } from '@/components/landing/Footer3D';
import { NewsletterPopup } from '@/components/niranx/NewsletterPopup';
import { LiquidBackground } from '@/components/LiquidBackground';
import { useLandingSections } from '@/hooks/useLandingSections';
import { SplitScrollStage } from '@/components/landing/SplitScrollStage';
import {
  LandingModeControls,
  useLandingModeSettings,
} from '@/components/landing/LandingModeControls';

// Lazy-load every landing section so they only render when enabled and ordered
const sectionRegistry: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  hero3d: lazy(() => import('@/components/landing/Hero3D').then(m => ({ default: m.Hero3D }))),
  highlightsbar: lazy(() => import('@/components/landing/HighlightsBar').then(m => ({ default: m.HighlightsBar }))),
  cards3dscroll: lazy(() => import('@/components/landing/Cards3DScroll').then(m => ({ default: m.Cards3DScroll }))),
  statssection: lazy(() => import('@/components/landing/StatsSection').then(m => ({ default: m.StatsSection }))),
  productpreview: lazy(() => import('@/components/landing/ProductPreview').then(m => ({ default: m.ProductPreview }))),
  featuresgrid3d: lazy(() => import('@/components/landing/FeaturesGrid3D').then(m => ({ default: m.FeaturesGrid3D }))),
  featuregridglow: lazy(() => import('@/components/landing/FeatureGridGlow').then(m => ({ default: m.FeatureGridGlow }))),
  aboutsection: lazy(() => import('@/components/niranx/AboutSection').then(m => ({ default: m.AboutSection }))),
  musicsection: lazy(() => import('@/components/niranx/MusicSection').then(m => ({ default: m.MusicSection }))),
  testimonialssection: lazy(() => import('@/components/niranx/TestimonialsSection').then(m => ({ default: m.TestimonialsSection }))),
  updatespanel: lazy(() => import('@/components/landing/UpdatesPanel').then(m => ({ default: m.UpdatesPanel }))),
  ctasection: lazy(() => import('@/components/landing/CTASection').then(m => ({ default: m.CTASection }))),
};

const FALLBACK_ORDER = [
  'hero3d','highlightsbar','cards3dscroll','statssection','productpreview',
  'featuresgrid3d','featuregridglow','aboutsection','musicsection',
  'testimonialssection','updatespanel','ctasection',
];

const Landing = () => {
  const { sections, loading } = useLandingSections();
  const { settings, update } = useLandingModeSettings();

  const rendered = useMemo(() => {
    if (loading || sections.length === 0) {
      return FALLBACK_ORDER.map((key) => ({ key, Comp: sectionRegistry[key] }));
    }
    return sections
      .filter((s) => s.is_enabled && sectionRegistry[s.section_key])
      .map((s) => ({ key: s.section_key, Comp: sectionRegistry[s.section_key] }));
  }, [sections, loading]);

  const heroEntry = rendered.find((r) => r.key === 'hero3d');
  const rest = rendered.filter((r) => r.key !== 'hero3d');
  const leftItems = rest.filter((_, i) => i % 2 === 0);
  const rightItems = rest.filter((_, i) => i % 2 === 1);

  const renderItem = (
    { key, Comp }: { key: string; Comp: React.LazyExoticComponent<React.ComponentType> },
    snap = false,
  ) => (
    <Suspense key={key} fallback={<div className="h-32" />}>
      <div className={snap ? 'snap-start snap-always' : ''}>
        <Comp />
      </div>
    </Suspense>
  );

  const snapClasses = settings.snap
    ? 'snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth'
    : '';

  return (
    <div className="bg-background relative overflow-x-hidden">
      <Helmet>
        <title>NiranX Universe — Free AI Study Platform for Students</title>
        <meta name="description" content="Free AI study platform with smart timetable, flashcards, AI tutor, quiz generator, and 100+ productivity tools for students." />
        <link rel="canonical" href="https://niranx-nexus.lovable.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://niranx-nexus.lovable.app/" />
        <meta property="og:title" content="NiranX Universe — All-in-One AI Study Platform" />
        <meta property="og:description" content="Free AI study platform with smart timetable, flashcards, AI tutor, and 100+ tools for students." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "NiranX Universe",
          url: "https://niranx-nexus.lovable.app",
          description: "All-in-one AI-powered study platform with smart timetable, flashcards, AI tutor, document scanner, quiz generator, and 100+ productivity tools for students.",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web, iOS, Android",
          browserRequirements: "Requires JavaScript. Requires HTML5.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1200" },
          featureList: [
            "AI Study Assistant","Smart Timetable & Scheduler","Flashcard Generator",
            "Document Scanner & OCR","AI Quiz Generator","Study Timer & Pomodoro",
            "AI Homework Solver","Collaborative Study Rooms","Course Generator","Mind Maps",
            "Live Classroom","AI Voice Tutor","Xvibe Music Streaming","XGenesis AI Hub",
            "Cornell Notes","Spaced Repetition"
          ],
          author: { "@type": "Organization", name: "NiranX", url: "https://niranx-nexus.lovable.app" }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "What is NiranX Universe?", acceptedAnswer: { "@type": "Answer", text: "NiranX Universe is a free all-in-one AI-powered study platform that provides students with smart timetable, flashcards, AI tutor, document scanner, quiz generator, and 100+ productivity tools." } },
            { "@type": "Question", name: "Is NiranX Universe free to use?", acceptedAnswer: { "@type": "Answer", text: "Yes, NiranX Universe is completely free for students. It includes AI-powered study tools, smart scheduling, and productivity features at no cost." } },
            { "@type": "Question", name: "What AI tools does NiranX Universe offer?", acceptedAnswer: { "@type": "Answer", text: "NiranX Universe offers AI Chat, AI Homework Solver, AI Quiz Generator, AI Writing Assistant, AI Voice Tutor, AI Document Summarizer, and access to 50+ frontier AI models through XGenesis AI." } },
            { "@type": "Question", name: "Does NiranX Universe support live classrooms?", acceptedAnswer: { "@type": "Answer", text: "Yes. NiranX Universe includes a Live Classroom suite with real-time video, screen sharing, breakout rooms, attendance tracking, and recordings." } },
            { "@type": "Question", name: "Can I use NiranX Universe on mobile?", acceptedAnswer: { "@type": "Answer", text: "Yes. NiranX Universe is a mobile-responsive Progressive Web App (PWA) installable on iOS and Android, with offline support and push notifications." } }
          ]
        })}</script>
      </Helmet>
      <LiquidBackground />
      <NiranXNavigation />
      <h1 className="sr-only">NiranX Universe — The Future of AI, Music, and Learning</h1>
      <main className={`relative z-10 ${snapClasses}`}>
        {heroEntry && renderItem(heroEntry, settings.snap)}

        {settings.splitMode ? (
          <SplitScrollStage
            leftChildren={leftItems.map((it) => renderItem(it, settings.snap))}
            rightChildren={rightItems.map((it) => renderItem(it, settings.snap))}
            intensity={settings.intensity}
            stiffness={settings.stiffness}
            damping={settings.damping}
            snap={settings.snap}
          />
        ) : (
          <div className="flex flex-col">
            {rest.map((it) => renderItem(it, settings.snap))}
          </div>
        )}
      </main>
      <Footer3D />
      <NewsletterPopup />
      <LandingModeControls settings={settings} onChange={update} />
    </div>
  );
};

export default Landing;
