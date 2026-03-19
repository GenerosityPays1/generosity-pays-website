"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface FeeItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface FeeCard {
  title: string;
  items: FeeItem[];
  total: string;
  variant: "traditional" | "generosity";
}

const feeCards: FeeCard[] = [
  {
    title: "Traditional Processing",
    items: [
      { label: "Per transaction", value: "2.9% + $0.30" },
      { label: "Monthly fee", value: "$25" },
      { label: "PCI compliance fee", value: "$99/yr" },
      { label: "Hidden surcharges", value: "Varies" },
    ],
    total: "$4,500+/yr",
    variant: "traditional",
  },
  {
    title: "Generosity Pays",
    items: [
      { label: "Per transaction", value: "2.2% + $0.15" },
      { label: "Monthly fee", value: "$0", highlight: true },
      { label: "PCI compliance fee", value: "$0", highlight: true },
      { label: "Hidden fees", value: "None", highlight: true },
    ],
    total: "$2,800/yr",
    variant: "generosity",
  },
];

function ComparisonCard({ card }: { card: FeeCard }) {
  const isTraditional = card.variant === "traditional";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: isTraditional ? 0 : 0.15, ease: "easeOut" }}
      className={`relative flex flex-col rounded-2xl p-8 ${
        isTraditional
          ? "bg-red-950/40 border border-red-500/20"
          : "bg-primary/10 border-2 border-primary/50 shadow-lg shadow-primary/10"
      }`}
    >
      {/* Best value badge */}
      {!isTraditional && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-dark shadow-md">
          Best Value
        </div>
      )}

      <h3
        className={`mb-6 text-center text-xl font-bold ${
          isTraditional ? "text-red-300" : "text-primary-light"
        }`}
      >
        {card.title}
      </h3>

      <ul className="flex-1 space-y-4">
        {card.items.map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{item.label}</span>
            <span
              className={`text-sm font-semibold ${
                item.highlight
                  ? "text-primary-light"
                  : isTraditional
                  ? "text-red-300"
                  : "text-white"
              }`}
            >
              {item.value}
            </span>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div
        className={`my-6 h-px ${
          isTraditional ? "bg-red-500/20" : "bg-primary/30"
        }`}
      />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">
          Estimated Annual Cost
        </span>
        <span
          className={`text-2xl font-bold ${
            isTraditional ? "text-red-400" : "text-primary-light"
          }`}
        >
          {card.total}
        </span>
      </div>
    </motion.div>
  );
}

export default function Savings() {
  return (
    <section
      id="savings"
      className="relative overflow-hidden py-24"
      style={{
        background: "linear-gradient(135deg, #1A1714 0%, #2D2A26 50%, #1A1714 100%)",
      }}
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-merchants.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.07] mix-blend-luminosity"
        />
      </div>

      {/* Subtle decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(196, 162, 101, 0.15), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Real Savings For Real Businesses
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-primary-light/70">
            See how much your business could save with transparent, fair pricing.
          </p>
        </motion.div>

        {/* Fee comparison cards */}
        <div className="mx-auto max-w-4xl">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10 text-center text-2xl font-semibold text-white"
          >
            See The Difference
          </motion.h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {feeCards.map((card) => (
              <ComparisonCard key={card.variant} card={card} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-16 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-semibold text-dark shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary-dark"
            >
              Start Saving Today
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
