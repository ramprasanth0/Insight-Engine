import type { Metadata } from "next";
import { Geist, Geist_Mono, Bitcount_Single } from "next/font/google";
import "./globals.css";

const bitcount = Bitcount_Single({
  variable: "--font-bitcount",
  weight: "400",
  subsets: ["latin"],
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
    <html lang="en">
      <body
        className={`${bitcount.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
