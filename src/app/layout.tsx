import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Generosity Pays | Premium Payment Processing With Purpose",
  description:
    "High-quality payment processing that gives back. Every transaction supports charitable causes at no additional cost to your business. Get a free analysis today.",
  keywords:
    "payment processing, charitable giving, merchant services, business impact, credit card processing, payment processing with purpose",
  openGraph: {
    title: "Generosity Pays | Premium Payment Processing With Purpose",
    description:
      "High-quality payment processing that gives back. Every transaction supports charitable causes at no additional cost to your business. Get a free analysis today.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
