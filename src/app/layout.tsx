import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title:
    "Generosity Pays | Family-Owned Merchant Services That Give Back",
  description:
    "Family-owned merchant services: credit card processing, website design, and online ordering — with a portion of every transaction supporting the causes you care about.",
  keywords:
    "family-owned merchant services, credit card processing, website design, online ordering, custom payment solutions, charitable giving, merchant services with purpose, small business payment processing",
  openGraph: {
    title:
      "Generosity Pays | Family-Owned Merchant Services That Give Back",
    description:
      "Family-owned merchant services: credit card processing, website design, and online ordering — with a portion of every transaction supporting the causes you care about.",
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
