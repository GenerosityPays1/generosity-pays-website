import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import FeeCalculator from "@/components/FeeCalculator";
import Savings from "@/components/Savings";
import About from "@/components/About";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <FeeCalculator />
      <Savings />
      <About />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
