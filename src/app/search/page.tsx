"use client"


import { Footer } from "@/components/layout/footer"
import { SearchHero } from "@/components/features/search-hero"

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">

            <SearchHero />
            <Footer />
        </div>
    )
}
