import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Life Admin",
  description: "Never forget an important date again.",
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
  themeColor: "#0a0a0b",
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
    <html lang="en" className={inter.variable}>
      <body>
        <div className="mx-auto max-w-xl min-h-screen flex flex-col font-sans">
          <main className="flex-1 px-5 pt-8 safe-bottom">{children}</main>
        </div>
      </body>
    </html>
  );
}
