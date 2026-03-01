"use client"

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/features/hero";
import { CuratedDestinations } from "@/components/features/destinations";
import { Experience } from "@/components/features/experience";
import { Membership } from "@/components/features/membership";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const [selectedDest, setSelectedDest] = useState("")

  return (
    <main className="min-h-screen bg-black selection:bg-white/20 text-white flex flex-col">
      <Navbar />
      <Hero initialPrompt={selectedDest} />
      <CuratedDestinations onSelectDestination={(dest) => {
        setSelectedDest(dest)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }} />
      <Experience />
      <Membership />
      <Footer />
    </main>
  );
}
