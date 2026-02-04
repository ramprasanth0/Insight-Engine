//layout.tsx - root layout component with font setup and metadata for the app

import type { Metadata } from "next";
import { Bitcount_Single } from "next/font/google";
import "./globals.css";

const bitcount = Bitcount_Single({
  variable: "--font-bitcount",
  weight: "500",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Insight Engine",
  description: "Insight Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning here
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bitcount.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
