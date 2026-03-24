import type { Metadata } from "next";
import MerchantFeeAnalysis from "@/components/MerchantFeeAnalysis";

export const metadata: Metadata = {
  title: "Free Processing Analysis | Generosity Pays",
  description:
    "Upload your processing statement and our experts will review your setup, identify opportunities, and show you how your business can give back.",
  keywords:
    "processing analysis, payment processing review, merchant services, charitable impact, credit card processing",
  openGraph: {
    title: "Free Processing Analysis | Generosity Pays",
    description:
      "Upload your processing statement and our experts will review your setup, identify opportunities, and show you how your business can give back.",
    type: "website",
  },
};

export default function MerchantFeeAnalysisPage() {
  return <MerchantFeeAnalysis />;
}
