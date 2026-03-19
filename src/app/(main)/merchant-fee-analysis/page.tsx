import type { Metadata } from "next";
import MerchantFeeAnalysis from "@/components/MerchantFeeAnalysis";

export const metadata: Metadata = {
  title: "Free Merchant Fee Analysis | Generosity Pays",
  description:
    "Upload your processing statement and our experts will identify your savings opportunities. Get a complete fee breakdown, hidden fee identification, and competitive rate comparison.",
  keywords:
    "merchant fee analysis, payment processing savings, hidden fees, interchange rates, credit card processing fees",
  openGraph: {
    title: "Free Merchant Fee Analysis | Generosity Pays",
    description:
      "Upload your processing statement and our experts will identify your savings opportunities.",
    type: "website",
  },
};

export default function MerchantFeeAnalysisPage() {
  return <MerchantFeeAnalysis />;
}
