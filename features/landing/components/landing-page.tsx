import { LandingNav } from "@/features/landing/components/landing-nav";
import { Hero } from "@/features/landing/components/hero";
import { FeatureGrid } from "@/features/landing/components/feature-grid";
import { ProductShowcase } from "@/features/landing/components/product-showcase";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { KanbanMockup } from "@/features/landing/components/kanban-mockup";
import { RolesHighlight } from "@/features/landing/components/roles-highlight";
import { Faq } from "@/features/landing/components/faq";
import { FinalCta } from "@/features/landing/components/final-cta";
import { LandingFooter } from "@/features/landing/components/landing-footer";

interface LandingPageProps {
  isAuthenticated: boolean;
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#020617] text-white antialiased">
      {/* float keyframe (reduced-motion safe — only applied via motion-safe utility) */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; }
        }
      `}</style>

      <LandingNav isAuthenticated={isAuthenticated} />

      <main>
        <Hero isAuthenticated={isAuthenticated} />
        <FeatureGrid />
        <ProductShowcase />
        <HowItWorks />
        <KanbanMockup />
        <RolesHighlight />
        <Faq />
        <FinalCta isAuthenticated={isAuthenticated} />
      </main>

      <LandingFooter isAuthenticated={isAuthenticated} />
    </div>
  );
}
