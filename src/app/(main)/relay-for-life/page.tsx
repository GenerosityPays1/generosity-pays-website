import type { Metadata } from "next";
import RelayForLife from "@/components/RelayForLife";

export const metadata: Metadata = {
  title: "Relay For Life | Generosity Pays",
  description:
    "Generosity Pays is proud to partner with the American Cancer Society at Relay For Life. Visit our tent and learn how everyday transactions help fight cancer.",
  keywords:
    "Relay For Life, American Cancer Society, cancer fundraiser, Generosity Pays, charitable giving, community event",
  openGraph: {
    title: "Relay For Life | Generosity Pays",
    description:
      "Generosity Pays is proud to partner with the American Cancer Society at Relay For Life. Visit our tent and learn how everyday transactions help fight cancer.",
    type: "website",
  },
};

export default function RelayForLifePage() {
  return <RelayForLife />;
}
