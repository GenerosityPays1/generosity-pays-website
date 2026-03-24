"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  HiCreditCard,
  HiHeart,
  HiGlobeAlt,
  HiShieldCheck,
  HiSwitchHorizontal,
  HiEye,
  HiSupport,
} from "react-icons/hi";
import { IconType } from "react-icons";

interface MissionStep {
  icon: IconType;
  title: string;
  description: string;
}

const missionSteps: MissionStep[] = [
  {
    icon: HiCreditCard,
    title: "You Process Payments",
    description:
      "Run your business as usual with reliable, high-quality payment processing.",
  },
  {
    icon: HiHeart,
    title: "Every Transaction Gives Back",
    description:
      "A portion of each transaction is automatically directed to charitable causes.",
  },
  {
    icon: HiGlobeAlt,
    title: "Real Causes Benefit",
    description:
      "Your everyday transactions create meaningful impact for communities in need.",
  },
];

interface TrustPoint {
  icon: IconType;
  label: string;
}

const trustPoints: TrustPoint[] = [
  { icon: HiShieldCheck, label: "PCI Compliant" },
  { icon: HiSwitchHorizontal, label: "Zero-Downtime Transitions" },
  { icon: HiEye, label: "Transparent Pricing" },
  { icon: HiSupport, label: "Dedicated Account Support" },
];

const cardNetworks = ["Visa", "Mastercard", "Amex", "Discover"];

export default function FeeCalculator() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="mission"
      ref={sectionRef}
      className="relative bg-warm py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Mission In Action
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Every swipe, every tap, every transaction — making a difference for
            causes that matter.
          </p>
        </motion.div>

        {/* Mission flow cards */}
        <div className="relative mb-20">
          {/* Connecting line — desktop */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-16 hidden h-0.5 w-[calc(66.666%-6rem)] -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block"
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {missionSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-gray-500">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Trust section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl bg-white p-10 shadow-lg"
        >
          <h3 className="mb-8 text-center text-xl font-semibold text-gray-900">
            Trusted By Businesses Like Yours
          </h3>

          {/* Card network badges */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {cardNetworks.map((network) => (
              <div
                key={network}
                className="flex h-14 w-28 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <span className="text-sm font-bold tracking-wide text-gray-600">
                  {network}
                </span>
              </div>
            ))}
          </div>

          {/* Trust points grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {point.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" as const }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-gray-500">
            Ready to process with purpose?
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/merchant-fee-analysis"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-dark shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary-dark"
            >
              Get Your Free Analysis
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
