import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Fee Savings Calculator | Generosity Pays",
  description:
    "See how much your business could save on payment processing fees — and how those savings can support the causes you care about.",
  robots: { index: false, follow: false },
};

export default function SavingsCalculatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
