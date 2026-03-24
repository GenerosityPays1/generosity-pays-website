"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HiDocumentText, HiSearch, HiHeart } from "react-icons/hi";
import { IconType } from "react-icons";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: IconType;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Submit Your Statement",
    description:
      "Upload your current processing statement for our team to review.",
    icon: HiDocumentText,
  },
  {
    number: 2,
    title: "We Review Your Processing",
    description:
      "Our experts review your statement to ensure you're getting the best service — and identify any savings along the way.",
    icon: HiSearch,
  },
  {
    number: 3,
    title: "Process & Give Back",
    description:
      "Every transaction through Generosity Pays supports charitable causes — whether or not your fees change.",
    icon: HiHeart,
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Step number badge */}
      <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-dark shadow-md">
        {step.number}
      </div>

      {/* Icon */}
      <div className="mb-5 mt-2 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
        <Icon className="h-8 w-8" />
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{step.title}</h3>

      {/* Description */}
      <p className="leading-relaxed text-gray-500">{step.description}</p>
    </motion.div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative bg-warm py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Three simple steps to start giving back
          </p>
        </motion.div>

        {/* Steps grid with connecting line */}
        <div className="relative">
          {/* Connecting line - horizontal on desktop, vertical on mobile */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-8 hidden h-0.5 w-[calc(66.666%-4rem)] -translate-x-1/2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block"
          />
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 md:hidden"
          />

          {/* Connecting dots - desktop only */}
          {steps.map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.15 }}
              aria-hidden="true"
              className="absolute top-[1.65rem] hidden h-3 w-3 -translate-x-1/2 rounded-full bg-primary md:block"
              style={{
                left: `${16.666 + i * 33.333}%`,
              }}
            />
          ))}

          {/* Step cards */}
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
