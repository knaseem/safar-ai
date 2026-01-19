import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/features/hero";

import { CuratedDestinations } from "@/components/features/destinations";
import { Experience } from "@/components/features/experience";
import { Membership } from "@/components/features/membership";

export default function Home() {
  return (
    <main className="min-h-screen bg-black selection:bg-white/20 text-white">
      <Navbar />
      <Hero />
      <CuratedDestinations />
      <Experience />
      <Membership />
    </main>
  );
}
