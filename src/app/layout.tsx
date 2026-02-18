import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { TravelHUD } from "@/components/features/travel-hud";
import { AmbientSoundProvider } from "@/components/features/ambient-sound-provider";
import { FloatingChatBubble } from "@/components/features/floating-chat-bubble";
import { Analytics } from "@/components/analytics";
import { JsonLd } from "@/components/seo/json-ld";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.safar-ai.co"),
  title: {
    default: "SafarAI - Your AI Travel Concierge",
    template: "%s | SafarAI"
  },
  description: "Experience the world effortlessly with AI-powered personalized travel planning. Custom itineraries, flight & hotel booking, and 24/7 travel assistance.",
  keywords: ["AI travel planner", "custom itineraries", "travel concierge", "flight booking", "hotel booking", "vacation planning", "artificial intelligence travel"],
  authors: [{ name: "SafarAI Team" }],
  creator: "SafarAI",
  publisher: "SafarAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "SafarAI - Your AI Travel Concierge",
    description: "Experience the world effortlessly with AI-powered personalized travel planning. Custom itineraries, flight & hotel booking, and 24/7 travel assistance.",
    url: "https://safar-ai.co",
    siteName: "SafarAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SafarAI - AI Travel Concierge",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafarAI - Your AI Travel Concierge",
    description: "Experience the world effortlessly with AI-powered personalized travel planning",
    creator: "@safarai",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <JsonLd />
        <AuthProvider>
          <AmbientSoundProvider>
            <TravelHUD />
            {children}
            <FloatingChatBubble />
          </AmbientSoundProvider>
        </AuthProvider>
        <Analytics />
        <Toaster position="top-center" richColors />

      </body>
    </html>
  );
}
