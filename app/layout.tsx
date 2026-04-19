import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "Life Admin",
  description: "Log and get reminded of your important dates.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Life Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-xl min-h-screen flex flex-col">
          <header className="px-4 pt-6 pb-4 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold tracking-tight">
              Life Admin
            </a>
            <a href="/categories" className="text-sm text-muted hover:text-text">
              Categories
            </a>
          </header>
          <main className="flex-1 px-4 pb-24">{children}</main>
        </div>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
