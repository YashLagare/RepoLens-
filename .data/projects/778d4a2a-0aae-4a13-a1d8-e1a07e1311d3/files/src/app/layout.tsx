import type { Metadata } from "next";
import localFont from "next/font/local";
import "../app/globals.css";

import Footer from "@/components/Footer";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import ScreenTooSmallGuard from "@/components/ScreenTooSmallGuard";
import ToastProvider from "@/components/ToastProvider";
import {
    ClerkProvider
} from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DevCanvas - Your Coding Workspace",
  description: "DevCanvas - Your Coding Workspace",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col`}
        >
          <ScreenTooSmallGuard />

          <main className="mx-auto w-full px-6 py-12 sm:px-8">
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>

            <Footer />
            <ToastProvider />
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}

