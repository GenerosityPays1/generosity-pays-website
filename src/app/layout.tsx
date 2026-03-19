import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Generosity Pays | Turn Payment Processing Into A Force For Good",
  description:
    "Reduce merchant fees while supporting charitable giving. Get a free fee analysis and start saving today.",
  keywords:
    "payment processing, merchant fees, charitable giving, fee analysis, credit card processing",
  openGraph: {
    title: "Generosity Pays | Turn Payment Processing Into A Force For Good",
    description:
      "Reduce merchant fees while supporting charitable giving. Get a free fee analysis and start saving today.",
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
