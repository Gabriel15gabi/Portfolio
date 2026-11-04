import Nav from "@/components/system/Nav";
import BootSequence from "@/components/system/BootSequence";
import Intro from "@/components/sections/Intro";
import Manifesto from "@/components/sections/Manifesto";
import Work from "@/components/sections/Work";
import Experimental from "@/components/sections/Experimental";
import Engineer from "@/components/sections/Engineer";
import Contact from "@/components/sections/Contact";

export default function Page() {
  return (
    <>
      <BootSequence />
      <Nav />
      <main id="main" className="relative">
        <Intro />
        <Manifesto />
        <Work />
        <Experimental />
        <Engineer />
        <Contact />
      </main>
    </>
  );
}
