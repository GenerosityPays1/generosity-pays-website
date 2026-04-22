"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import {
  HiCreditCard,
  HiDesktopComputer,
  HiShoppingCart,
  HiCog,
  HiUserGroup,
  HiHeart,
} from "react-icons/hi";
import { IconType } from "react-icons";
import Link from "next/link";

interface Feature {
  title: string;
  description: string;
  icon: IconType;
}

const features: Feature[] = [
  {
    title: "Credit Card Processing",
    description:
      "Reliable, transparent payment processing with competitive rates and no hidden fees.",
    icon: HiCreditCard,
  },
  {
    title: "Website Design",
    description:
      "Professional, modern websites built to showcase your business and convert visitors into customers.",
    icon: HiDesktopComputer,
  },
  {
    title: "Online Ordering",
    description:
      "Seamless online ordering integration for restaurants and retail — meet your customers where they are.",
    icon: HiShoppingCart,
  },
  {
    title: "Custom Solutions",
    description:
      "Tailored tech and services shaped around how your business actually runs, not a one-size-fits-all package.",
    icon: HiCog,
  },
  {
    title: "Family-Owned & Operated",
    description:
      "Real people who answer the phone and know your name — not a faceless corporation or overseas call center.",
    icon: HiUserGroup,
  },
  {
    title: "Give-Back Built In",
    description:
      "A portion of every transaction supports a nonprofit you care about — at no additional cost to your business.",
    icon: HiHeart,
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
        <Icon className="h-8 w-8" />
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold text-gray-900">
        {feature.title}
      </h3>

      {/* Description */}
      <p className="leading-relaxed text-gray-500">{feature.description}</p>
    </motion.div>
  );
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={sectionRef} className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What We Do & Why It Matters
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Full-service merchant solutions from a family-run team — with a
            give-back model built into every transaction
          </p>
        </motion.div>

        {/* Accent image band */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-16 h-48 w-full overflow-hidden rounded-2xl sm:h-56 lg:h-64"
        >
          <Image
            src="/images/features-business.jpg"
            alt="Thriving local businesses on a vibrant main street"
            fill
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
        </motion.div>

        {/* Feature cards grid — 3 columns × 2 rows on desktop */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-xl font-medium text-gray-700">
            Ready to make an impact?
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/merchant-fee-analysis"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-lg font-semibold text-dark shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary-dark"
            >
              Get Your Free Analysis
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
