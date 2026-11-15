import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";

export default function Hero() {
  return (
    <ResponsiveHeroBanner
      backgroundImageUrl="/images/hero-merchants.jpg"
      badgeLabel="Family-Owned"
      badgeText="Merchant services with a mission"
      title="Turn Everyday Transactions"
      titleLine2="Into Meaningful Impact"
      description="Payment processing, website design, and online ordering — built by a family-run team that gives a portion of every transaction to the causes you care about."
      primaryButtonText="Get Your Free Analysis"
      primaryButtonHref="/merchant-fee-analysis"
      secondaryButtonText="See How It Works"
      secondaryButtonHref="#how-it-works"
      trustTitle="We Process All Major Networks"
      trustBadges={[
        { label: "VISA" },
        { label: "Mastercard" },
        { label: "American Express" },
        { label: "Discover" },
      ]}
    />
  );
}
