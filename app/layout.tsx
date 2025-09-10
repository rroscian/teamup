import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopBar } from "@/frontend/components/TopBar";
import { AuthProvider } from "@/frontend/contexts/AuthContext";
import { ToastProvider } from "@/frontend/contexts/ToastContext";
import { PWAInstaller } from "@/frontend/components/PWAInstaller";
import { OfflineIndicator } from "@/frontend/components/OfflineIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeamUp - Événements Sportifs Locaux",
  description: "Trouvez et rejoignez des événements sportifs près de chez vous. Créez votre profil sportif et connectez-vous avec d'autres passionnés.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TeamUp",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "TeamUp",
    title: "TeamUp - Événements Sportifs Locaux",
    description: "Trouvez et rejoignez des événements sportifs près de chez vous",
  },
  icons: {
    shortcut: "/icon-192x192.png",
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ToastProvider>
            <TopBar />
            <OfflineIndicator />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
            <PWAInstaller />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
