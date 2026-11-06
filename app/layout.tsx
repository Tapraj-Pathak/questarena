import type { Metadata } from "next";
import { Suspense } from "react";
import { Barlow_Condensed, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { config } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QuestArena | Play. Compete. Prove. Earn.",
    template: "%s | QuestArena",
  },
  description:
    "QuestArena is a sponsored competition platform: playable games, real leaderboards, verified results and USDC prizes.",
};

const clerkAppearance = {
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#5fd8e0",
    colorBackground: "#0c1017",
    colorInputBackground: "#131922",
    colorInputText: "#eef2f6",
    colorText: "#eef2f6",
    colorTextSecondary: "#a3adbb",
    colorDanger: "#ff6b6b",
    borderRadius: "6px",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  elements: {
    card: "clerk-card",
    formButtonPrimary: "clerk-primary",
  },
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${barlow.variable} h-full antialiased`}>
      <body className="min-h-full" suppressHydrationWarning>
        <Suspense fallback={<header className="site-header" />}>
          <SiteHeader />
        </Suspense>
        <div className="site-main">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );

  if (!config.clerkEnabled) return shell;

  return <ClerkProvider appearance={clerkAppearance}>{shell}</ClerkProvider>;
}
