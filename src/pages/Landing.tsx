import { lazy, Suspense, useMemo } from 'react';
import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { Footer3D } from '@/components/landing/Footer3D';
import { NewsletterPopup } from '@/components/niranx/NewsletterPopup';
import { LiquidBackground } from '@/components/LiquidBackground';
import { useLandingSections } from '@/hooks/useLandingSections';
import { SplitScrollStage } from '@/components/landing/SplitScrollStage';

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

  const rendered = useMemo(() => {
    if (loading || sections.length === 0) {
      return FALLBACK_ORDER.map((key) => ({ key, Comp: sectionRegistry[key] }));
    }
    return sections
      .filter((s) => s.is_enabled && sectionRegistry[s.section_key])
      .map((s) => ({ key: s.section_key, Comp: sectionRegistry[s.section_key] }));
  }, [sections, loading]);

  // Keep the hero full-width at the top, split the rest into 2 columns.
  const heroEntry = rendered.find((r) => r.key === 'hero3d');
  const rest = rendered.filter((r) => r.key !== 'hero3d');
  const leftItems = rest.filter((_, i) => i % 2 === 0);
  const rightItems = rest.filter((_, i) => i % 2 === 1);

  const renderItem = ({ key, Comp }: { key: string; Comp: React.LazyExoticComponent<React.ComponentType> }) => (
    <Suspense key={key} fallback={<div className="h-32" />}>
      <Comp />
    </Suspense>
  );

  return (
    <div className="bg-background relative overflow-x-hidden">
      <LiquidBackground />
      <NiranXNavigation />
      <main className="relative z-10">
        {heroEntry && renderItem(heroEntry)}
        <SplitScrollStage
          leftChildren={leftItems.map(renderItem)}
          rightChildren={rightItems.map(renderItem)}
        />
      </main>
      <Footer3D />
      <NewsletterPopup />
    </div>
  );
};

export default Landing;
