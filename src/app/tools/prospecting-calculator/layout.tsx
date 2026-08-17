import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prospecting Calculator | Generosity Pays",
  description: "Internal quoting tool for the Generosity Pays sales team.",
  robots: { index: false, follow: false },
};

export default function ProspectingCalculatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
