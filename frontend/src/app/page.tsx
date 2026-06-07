import { Header } from "@/components/Header";
import { CursorGlow } from "@/components/CursorGlow";
import { CustomCursor } from "@/components/CustomCursor";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { CasePersonas } from "@/components/CasePersonas";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-brand-600 focus:text-white"
      >
        본문 바로가기
      </a>
      <Header />
      <CursorGlow />
      <CustomCursor />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero />
        <Features />
        <CasePersonas />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
