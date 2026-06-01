import { LandingNav } from "@/features/landing/components/landing-nav";
import { Hero } from "@/features/landing/components/hero";
import { Marquee } from "@/features/landing/components/marquee";
import { ProductTabs } from "@/features/landing/components/product-tabs";
import { StatCallouts } from "@/features/landing/components/stat-callouts";
import { FeatureGrid } from "@/features/landing/components/feature-grid";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { KanbanMockup } from "@/features/landing/components/kanban-mockup";
import { RolesHighlight } from "@/features/landing/components/roles-highlight";
import { Faq } from "@/features/landing/components/faq";
import { FinalCta } from "@/features/landing/components/final-cta";
import { LandingFooter } from "@/features/landing/components/landing-footer";

interface LandingPageProps {
  isAuthenticated: boolean;
}

/** thin gradient hairline divider between major bands */
function Divider() {
  return (
    <div
      aria-hidden
      className="mx-auto h-px max-w-7xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
    />
  );
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-white antialiased">
      {/* shared float keyframe (only applied via motion-safe utilities) +
          global reduced-motion safety net */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <LandingNav isAuthenticated={isAuthenticated} />

      <main>
        <Hero isAuthenticated={isAuthenticated} />
        <Marquee />
        <Divider />
        <ProductTabs />
        <StatCallouts />
        <Divider />
        <FeatureGrid />
        <HowItWorks />
        <Divider />
        <KanbanMockup />
        <RolesHighlight />
        <Divider />
        <Faq />
        <FinalCta isAuthenticated={isAuthenticated} />
      </main>

      <LandingFooter isAuthenticated={isAuthenticated} />
    </div>
  );
}
