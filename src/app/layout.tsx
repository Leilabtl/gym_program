import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
};

export const metadata: Metadata = {
  title: "Gym Logger",
  description: "A minimal, mobile-first gym logging web app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gym Logger",
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
        className={`${geistSans.variable} antialiased bg-bg-primary text-text-primary overflow-y-scroll`}
      >
        <AuthProvider>
          <SettingsProvider>
            <ThemeProvider>
              <AuthGuard>
                <main className="mx-auto max-w-lg px-4 pt-[max(1rem,env(safe-area-inset-top))] min-h-dvh flex flex-col items-center">
                  <PageTransition>{children}</PageTransition>
                </main>
                <BottomNav />
              </AuthGuard>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
