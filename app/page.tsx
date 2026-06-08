import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import SkillsMarquee from "@/components/SkillsMarquee";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import TextRevealSection from "@/components/TextRevealSection";
import ClientLoader from "@/components/ClientLoader";

export default function Page() {
  return (
    <>
      <ClientLoader />
      <main id="main-scroll" className="relative">
        <Hero />
        <AboutMe />
        <TextRevealSection />
        <SkillsMarquee />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
