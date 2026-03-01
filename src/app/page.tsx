"use client"

import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/features/hero";
import { Experience } from "@/components/features/experience";
import { Membership } from "@/components/features/membership";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black selection:bg-white/20 text-white flex flex-col">
      <Navbar />
      <Hero initialPrompt="" />
      <Experience />
      <Membership />
      <Footer />
    </main>
  );
}
