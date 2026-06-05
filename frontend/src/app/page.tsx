import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { CasePersonas } from "@/components/CasePersonas";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <Features />
      <CasePersonas />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
